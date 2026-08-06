-- ============================================================
-- HYPERGROW - completa as 2 tabelas que faltaram na primeira rodada
-- (lead_notes e google_calendar_auth)
-- Seguro rodar mesmo que uma delas ja exista - nao apaga nada.
-- ============================================================

create table if not exists public.lead_notes (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads(id) on delete cascade,
  body       text not null,
  author     text,
  created_at timestamptz not null default now()
);

create index if not exists lead_notes_lead_idx on public.lead_notes (lead_id, created_at desc);
alter table public.lead_notes enable row level security;
revoke all on public.lead_notes from anon;


-- Credenciais do Google Calendar.
-- ATENCAO: a politica abaixo bloqueia TODO acesso pela chave publica.
-- So a service role enxerga. O token nunca chega ao navegador.
create table if not exists public.google_calendar_auth (
  id               text primary key default 'default',
  connected_email  text not null,
  access_token     text not null,
  refresh_token    text not null,
  token_expiry     timestamptz not null,
  calendar_id      text not null default 'primary',
  connected_at     timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.google_calendar_auth enable row level security;
drop policy if exists gcal_service_only on public.google_calendar_auth;
create policy gcal_service_only on public.google_calendar_auth
  for all using (false) with check (false);
revoke all on public.google_calendar_auth from anon, authenticated;

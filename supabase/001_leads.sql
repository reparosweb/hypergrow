-- ============================================================
-- Nexlab — tabela de leads do site (FASE 1)
-- Rode isto no SQL Editor do Supabase do projeto Nexlab.
-- ============================================================

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  product     text,
  message     text,
  source      text default 'site',
  user_agent  text,
  status      text default 'novo',   -- novo | em_contato | cliente | descartado
  created_at  timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- Segurança: RLS ligado. Ninguém lê/escreve com a chave pública (anon).
-- A API do site insere usando a SERVICE ROLE KEY, que ignora o RLS.
alter table public.leads enable row level security;

-- (Opcional) revoga qualquer acesso anônimo explicitamente.
revoke all on public.leads from anon;

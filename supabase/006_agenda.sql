-- ============================================================
-- Hypergrow — Agenda + Google Calendar/Meet + réguas de e-mail (FASE 2)
-- Rode no SQL Editor do Supabase do projeto Hypergrow.
-- Rode DEPOIS de 004_crm.sql (usa a função touch_updated_at).
-- Seguro rodar mais de uma vez.
-- ============================================================

-- ── 1. Agendamentos ─────────────────────────────────────────
-- Hoje NÃO existe tabela de agendamento. O webhook do Cal.com grava o horário
-- como TEXTO dentro de leads.message, sobrescrevendo a mensagem original do
-- cliente, e joga fora o link da reunião. Isto resolve.
create table if not exists public.appointments (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid references public.leads(id) on delete set null,
  client_name     text not null,
  client_email    text not null,
  client_phone    text,
  title           text not null default 'Reunião',
  notes           text,
  start_time      timestamptz not null,
  end_time        timestamptz not null,
  status          text not null default 'agendado',
  -- agendado | confirmado | concluido | cancelado | faltou
  source          text default 'painel',      -- painel | site | cal.com
  -- Google Calendar / Meet
  meeting_link    text,                       -- URL da sala Meet
  google_event_id text,
  -- controle de lembretes (evita reenvio)
  confirmed_at    timestamptz,
  cancelled_at    timestamptz,
  created_by      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists appt_start_idx  on public.appointments (start_time);
create index if not exists appt_status_idx on public.appointments (status);
create index if not exists appt_lead_idx   on public.appointments (lead_id);
create index if not exists appt_email_idx  on public.appointments (client_email);

-- Impede dois agendamentos no mesmo horário exato (a não ser cancelados).
create unique index if not exists appt_no_overlap_idx
  on public.appointments (start_time)
  where status <> 'cancelado';

create extension if not exists moddatetime schema extensions;

drop trigger if exists appointments_touch on public.appointments;
create trigger appointments_touch before update on public.appointments
  for each row execute procedure extensions.moddatetime(updated_at);

alter table public.appointments enable row level security;
revoke all on public.appointments from anon;

-- ── 2. Credenciais do Google Calendar ───────────────────────
-- ⚠️ RLS `using(false)` de propósito: NINGUÉM acessa esta tabela pela chave
-- pública. Só a service_role (que ignora RLS) enxerga. O refresh_token nunca
-- pode chegar ao navegador. Mesmo padrão do Agentop.
create table if not exists public.google_calendar_auth (
  id               text primary key default 'default',  -- instalação única (não é multi-tenant)
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

-- ── 3. Réguas de comunicação ────────────────────────────────
-- Um motor só serve todos os gatilhos. `offset_minutes` NEGATIVO = antes do
-- evento (lembrete), positivo = depois (follow-up), zero = imediato.
create table if not exists public.automation_rules (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  trigger_event    text not null,
  -- appointment_created | appointment_reminder | appointment_cancelled
  -- | new_lead | payment_received
  offset_minutes   integer not null default 0,
  channels         jsonb not null default '["email"]'::jsonb,
  subject_template text,
  message_template text not null,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists autorule_trigger_idx on public.automation_rules (trigger_event, is_active);

drop trigger if exists automation_rules_touch on public.automation_rules;
create trigger automation_rules_touch before update on public.automation_rules
  for each row execute procedure extensions.moddatetime(updated_at);

alter table public.automation_rules enable row level security;
revoke all on public.automation_rules from anon;

-- ── 4. Log de mensagens ─────────────────────────────────────
-- É ESTE log que dá idempotência ao cron: antes de enviar, o motor confere se
-- já existe linha 'sent' para (related_type, related_id, rule_id). Sem isso,
-- um cron que roda duas vezes manda o lembrete duas vezes.
create table if not exists public.message_log (
  id           uuid primary key default gen_random_uuid(),
  channel      text not null default 'email',
  target       text not null,
  subject      text,
  body         text,
  status       text not null default 'sent',   -- sent | failed
  provider_id  text,
  error_msg    text,
  rule_id      uuid references public.automation_rules(id) on delete set null,
  related_type text,     -- appointment | lead | charge
  related_id   uuid,
  sent_at      timestamptz not null default now()
);
create index if not exists msglog_dedupe_idx on public.message_log (related_type, related_id, rule_id, status);
create index if not exists msglog_sent_idx   on public.message_log (sent_at desc);

alter table public.message_log enable row level security;
revoke all on public.message_log from anon;

-- ── 5. Réguas iniciais ──────────────────────────────────────
-- Variáveis disponíveis no template: {cliente_nome} {data} {hora} {titulo}
-- {link_meet} {empresa}
insert into public.automation_rules (name, trigger_event, offset_minutes, subject_template, message_template)
select * from (values
  ('Confirmação de agendamento', 'appointment_created', 0,
   'Reunião confirmada: {data} às {hora}',
   'Olá, {cliente_nome}! Sua reunião com a HyperGrow está confirmada para {data} às {hora}.\n\nAcesse pelo link: {link_meet}\n\nAté lá!'),
  ('Lembrete 24h antes', 'appointment_reminder', -1440,
   'Amanhã: sua reunião com a HyperGrow',
   'Olá, {cliente_nome}! Lembrete: amanhã, {data} às {hora}, temos nossa reunião.\n\nLink: {link_meet}'),
  ('Lembrete 30min antes', 'appointment_reminder', -30,
   'Começa em 30 minutos',
   'Olá, {cliente_nome}! Nossa reunião começa em 30 minutos.\n\nEntre por aqui: {link_meet}')
) as seed(name, trigger_event, offset_minutes, subject_template, message_template)
where not exists (select 1 from public.automation_rules);

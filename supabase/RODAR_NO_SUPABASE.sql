-- ============================================================
-- HYPERGROW - banco da ferramenta de gestao
-- Cole TUDO isto no SQL Editor do Supabase e clique em Run.
-- Pode rodar mais de uma vez sem estragar nada.
--
-- Esta versao usa apenas caracteres simples (sem acento, sem
-- simbolos de desenho) porque o editor do Supabase estava
-- quebrando a leitura do script nas versoes anteriores.
-- ============================================================


-- ============================================================
-- PARTE 1 - CRM (campos que faltavam na tabela de leads)
-- ============================================================

alter table public.leads add column if not exists updated_at  timestamptz not null default now();
alter table public.leads add column if not exists owner       text;
alter table public.leads add column if not exists value       numeric(12,2);
alter table public.leads add column if not exists notes       text;
alter table public.leads add column if not exists stage_order integer not null default 0;
alter table public.leads add column if not exists lost_reason text;

create extension if not exists moddatetime schema extensions;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at
  before update on public.leads
  for each row execute procedure extensions.moddatetime(updated_at);

create index if not exists leads_updated_at_idx  on public.leads (updated_at desc);
create index if not exists leads_owner_idx       on public.leads (owner);
create index if not exists leads_stage_order_idx on public.leads (status, stage_order);

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

alter table public.charges add column if not exists lead_id uuid references public.leads(id) on delete set null;
create index if not exists charges_lead_idx on public.charges (lead_id);


-- ============================================================
-- PARTE 2 - FINANCEIRO
-- ============================================================

-- Plano de contas.
-- Valores validos da coluna type:
--   receita_servico, receita_recorrente, despesa_operacional,
--   marketing, pessoal, tributo, tarifa_gateway, investimento, outro
create table if not exists public.financial_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null default 'despesa_operacional',
  parent_id     uuid references public.financial_categories(id) on delete set null,
  color         text,
  is_active     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists fincat_type_idx on public.financial_categories (type, is_active);
alter table public.financial_categories enable row level security;
revoke all on public.financial_categories from anon;

-- Contas a receber.
-- Valores validos da coluna status: pendente, recebido, atrasado, cancelado
create table if not exists public.receivables (
  id             uuid primary key default gen_random_uuid(),
  subject        text not null,
  client_name    text,
  lead_id        uuid references public.leads(id) on delete set null,
  charge_id      text,
  category_id    uuid references public.financial_categories(id) on delete set null,
  value          numeric(12,2) not null,
  status         text not null default 'pendente',
  payment_method text default 'pix',
  due_date       date,
  paid_at        timestamptz,
  notes          text,
  created_by     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists recv_due_idx    on public.receivables (due_date);
create index if not exists recv_status_idx on public.receivables (status);
create index if not exists recv_paid_idx   on public.receivables (paid_at);
alter table public.receivables enable row level security;
revoke all on public.receivables from anon;

-- Contas a pagar.
-- Valores validos da coluna status: pendente, pago, atrasado, cancelado
create table if not exists public.payables (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  supplier       text,
  document       text,
  category_id    uuid references public.financial_categories(id) on delete set null,
  value          numeric(12,2) not null,
  status         text not null default 'pendente',
  payment_method text default 'boleto',
  due_date       date,
  paid_at        timestamptz,
  is_recurring   boolean not null default false,
  notes          text,
  created_by     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists pay_due_idx    on public.payables (due_date);
create index if not exists pay_status_idx on public.payables (status);
create index if not exists pay_paid_idx   on public.payables (paid_at);
alter table public.payables enable row level security;
revoke all on public.payables from anon;

-- Trilha de auditoria de toda mudanca financeira.
create table if not exists public.finance_logs (
  id         uuid primary key default gen_random_uuid(),
  action     text not null,
  entity     text,
  entity_id  uuid,
  details    jsonb,
  user_email text,
  created_at timestamptz not null default now()
);

create index if not exists finlog_created_idx on public.finance_logs (created_at desc);
alter table public.finance_logs enable row level security;
revoke all on public.finance_logs from anon;

drop trigger if exists receivables_touch on public.receivables;
create trigger receivables_touch before update on public.receivables
  for each row execute procedure extensions.moddatetime(updated_at);

drop trigger if exists payables_touch on public.payables;
create trigger payables_touch before update on public.payables
  for each row execute procedure extensions.moddatetime(updated_at);

-- Plano de contas inicial. So insere se a tabela estiver vazia.
insert into public.financial_categories (name, type, display_order)
select * from (values
  ('Projetos e implantacao',      'receita_servico',      10),
  ('Mensalidade recorrente',      'receita_recorrente',   20),
  ('Tarifa de gateway',           'tarifa_gateway',       30),
  ('Ferramentas e software',      'despesa_operacional',  40),
  ('Hospedagem e infraestrutura', 'despesa_operacional',  50),
  ('Midia paga',                  'marketing',            60),
  ('Equipe e prestadores',        'pessoal',              70),
  ('Impostos',                    'tributo',              80),
  ('Contador',                    'despesa_operacional',  90),
  ('Outros',                      'outro',               100)
) as seed(name, type, display_order)
where not exists (select 1 from public.financial_categories);


-- ============================================================
-- PARTE 3 - AGENDA, GOOGLE MEET E REGUAS DE E-MAIL
-- ============================================================

-- Agendamentos.
-- Valores validos da coluna status:
--   agendado, confirmado, concluido, cancelado, faltou
create table if not exists public.appointments (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid references public.leads(id) on delete set null,
  client_name     text not null,
  client_email    text not null,
  client_phone    text,
  title           text not null default 'Reuniao',
  notes           text,
  start_time      timestamptz not null,
  end_time        timestamptz not null,
  status          text not null default 'agendado',
  source          text default 'painel',
  meeting_link    text,
  google_event_id text,
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

create unique index if not exists appt_no_overlap_idx
  on public.appointments (start_time)
  where status <> 'cancelado';

drop trigger if exists appointments_touch on public.appointments;
create trigger appointments_touch before update on public.appointments
  for each row execute procedure extensions.moddatetime(updated_at);

alter table public.appointments enable row level security;
revoke all on public.appointments from anon;

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

-- Reguas de comunicacao.
-- offset_minutes negativo = antes do evento. Positivo = depois. Zero = na hora.
-- Valores validos de trigger_event:
--   appointment_created, appointment_reminder, appointment_cancelled,
--   new_lead, payment_received
create table if not exists public.automation_rules (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  trigger_event    text not null,
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

-- Log de mensagens enviadas. E o que impede o lembrete de sair duas vezes.
create table if not exists public.message_log (
  id           uuid primary key default gen_random_uuid(),
  channel      text not null default 'email',
  target       text not null,
  subject      text,
  body         text,
  status       text not null default 'sent',
  provider_id  text,
  error_msg    text,
  rule_id      uuid references public.automation_rules(id) on delete set null,
  related_type text,
  related_id   uuid,
  sent_at      timestamptz not null default now()
);

create index if not exists msglog_dedupe_idx on public.message_log (related_type, related_id, rule_id, status);
create index if not exists msglog_sent_idx   on public.message_log (sent_at desc);
alter table public.message_log enable row level security;
revoke all on public.message_log from anon;

-- Reguas iniciais. So insere se a tabela estiver vazia.
-- Variaveis disponiveis no texto: {cliente_nome} {data} {hora} {titulo} {link_meet}
insert into public.automation_rules (name, trigger_event, offset_minutes, subject_template, message_template)
select * from (values
  ('Confirmacao de agendamento', 'appointment_created', 0,
   'Reuniao confirmada: {data} as {hora}',
   'Ola, {cliente_nome}! Sua reuniao com a HyperGrow esta confirmada para {data} as {hora}. Acesse pelo link: {link_meet}'),
  ('Lembrete 24h antes', 'appointment_reminder', -1440,
   'Amanha: sua reuniao com a HyperGrow',
   'Ola, {cliente_nome}! Lembrete: amanha, {data} as {hora}, temos nossa reuniao. Link: {link_meet}'),
  ('Lembrete 30min antes', 'appointment_reminder', -30,
   'Comeca em 30 minutos',
   'Ola, {cliente_nome}! Nossa reuniao comeca em 30 minutos. Entre por aqui: {link_meet}')
) as seed(name, trigger_event, offset_minutes, subject_template, message_template)
where not exists (select 1 from public.automation_rules);

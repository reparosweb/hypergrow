-- ============================================================
-- Hypergrow — CRM: campos que faltavam em `leads` (FASE 2)
-- Rode isto no SQL Editor do Supabase do projeto Hypergrow
-- (htaxogmtaxebfbyetxel, conta reparosweb).
--
-- Seguro de rodar mais de uma vez: tudo é `if not exists`.
-- Nenhuma coluna existente é alterada ou removida.
-- ============================================================

-- ── 1. Colunas novas em `leads` ─────────────────────────────
-- Hoje a tabela não tem NEM `updated_at`: não dá para saber quando um lead
-- mudou de estágio, ordenar o kanban por movimentação, nem atribuir dono.
alter table public.leads add column if not exists updated_at  timestamptz not null default now();
alter table public.leads add column if not exists owner       text;      -- e-mail de quem cuida
alter table public.leads add column if not exists value       numeric(12,2); -- valor estimado do negócio
alter table public.leads add column if not exists notes       text;      -- anotações internas (≠ message, que é do cliente)
alter table public.leads add column if not exists stage_order integer not null default 0; -- posição dentro da coluna
alter table public.leads add column if not exists lost_reason text;      -- por que foi descartado

-- `updated_at` automático. Sem isto a coluna nasce e congela.
--
-- Usa a extensão `moddatetime`, que já vem no Supabase, em vez de uma função
-- plpgsql escrita à mão. Motivo prático: o SQL Editor do Supabase divide o
-- script nos `;` e uma função com corpo entre cifrao-duplo tem `;` DENTRO —
-- a instrução chegava partida ao banco e dava "syntax error at or near ;".
-- Sem cifrao-duplo no arquivo, o problema não existe.
create extension if not exists moddatetime schema extensions;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at
  before update on public.leads
  for each row execute procedure extensions.moddatetime(updated_at);

create index if not exists leads_updated_at_idx  on public.leads (updated_at desc);
create index if not exists leads_owner_idx       on public.leads (owner);
create index if not exists leads_stage_order_idx on public.leads (status, stage_order);

-- ── 2. Anotações com histórico ──────────────────────────────
-- Separado de `leads.notes` de propósito: `notes` é o resumo atual editável;
-- aqui fica o histórico, que não se apaga ao editar.
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

-- ── 3. Vínculo cobrança → lead ──────────────────────────────
-- `charges` nasceu sem nenhuma ligação com `leads`: era impossível saber
-- quanto um lead já pagou. `on delete set null` para não perder a cobrança
-- (que é registro financeiro) se o lead for excluído.
alter table public.charges add column if not exists lead_id uuid references public.leads(id) on delete set null;
create index if not exists charges_lead_idx on public.charges (lead_id);

-- ── 4. Comentário de referência dos estágios ────────────────
-- O comentário original de `001_leads.sql` estava desatualizado: listava só
-- 4 estágios, mas o código usa 6 (ALLOWED_STAGES em app/api/admin/leads).
comment on column public.leads.status is
  'novo | em_contato | reuniao | proposta | cliente | descartado';
-- ============================================================
-- Hypergrow — Financeiro (FASE 2)
-- Rode no SQL Editor do Supabase do projeto Hypergrow.
-- Seguro rodar mais de uma vez.
--
-- NOTA DE PROJETO: tudo aqui em snake_case. O Agentop (de onde o modelo foi
-- adaptado) usa camelCase entre aspas ("dueDate", "paidAt") por herança do
-- Firebase — é dívida documentada no próprio repo dele e não se copia.
-- ============================================================

-- ── 1. Plano de contas ──────────────────────────────────────
-- `type` é o que permite montar DRE de verdade depois (agrupar por natureza,
-- não por nome digitado à mão).
create table if not exists public.financial_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null default 'despesa_operacional',
  -- receita_servico | receita_recorrente | despesa_operacional
  -- | marketing | pessoal | tributo | tarifa_gateway | investimento | outro
  parent_id     uuid references public.financial_categories(id) on delete set null,
  color         text,
  is_active     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists fincat_type_idx on public.financial_categories (type, is_active);

alter table public.financial_categories enable row level security;
revoke all on public.financial_categories from anon;

-- ── 2. Contas a receber ─────────────────────────────────────
create table if not exists public.receivables (
  id             uuid primary key default gen_random_uuid(),
  subject        text not null,
  client_name    text,
  lead_id        uuid references public.leads(id) on delete set null,
  charge_id      text,                       -- casa com charges.charge_id (Asaas)
  category_id    uuid references public.financial_categories(id) on delete set null,
  value          numeric(12,2) not null,
  status         text not null default 'pendente',   -- pendente | recebido | atrasado | cancelado
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

-- ── 3. Contas a pagar ───────────────────────────────────────
create table if not exists public.payables (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  supplier       text,
  document       text,
  category_id    uuid references public.financial_categories(id) on delete set null,
  value          numeric(12,2) not null,
  status         text not null default 'pendente',   -- pendente | pago | atrasado | cancelado
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

-- ── 4. Trilha de auditoria ──────────────────────────────────
-- Toda mutação financeira grava aqui. É o que permite descobrir depois
-- "quem mudou este valor e quando".
create table if not exists public.finance_logs (
  id         uuid primary key default gen_random_uuid(),
  action     text not null,          -- RECEITA_CRIADA | DESPESA_PAGA | ...
  entity     text,                   -- receivables | payables | charges
  entity_id  uuid,
  details    jsonb,
  user_email text,
  created_at timestamptz not null default now()
);
create index if not exists finlog_created_idx on public.finance_logs (created_at desc);

alter table public.finance_logs enable row level security;
revoke all on public.finance_logs from anon;

-- ── 5. `updated_at` automático ──────────────────────────────
-- Mesma extensão de 004_crm.sql (nada de função com cifrao-duplo, que o SQL Editor
-- do Supabase parte ao meio nos `;` internos).
create extension if not exists moddatetime schema extensions;

drop trigger if exists receivables_touch on public.receivables;
create trigger receivables_touch before update on public.receivables
  for each row execute procedure extensions.moddatetime(updated_at);

drop trigger if exists payables_touch on public.payables;
create trigger payables_touch before update on public.payables
  for each row execute procedure extensions.moddatetime(updated_at);

-- ── 6. Plano de contas inicial ──────────────────────────────
-- Só insere se a tabela estiver vazia — não sobrescreve o que você editar.
insert into public.financial_categories (name, type, display_order)
select * from (values
  ('Projetos e implantação',   'receita_servico',      10),
  ('Mensalidade / recorrência','receita_recorrente',   20),
  ('Tarifa de gateway',        'tarifa_gateway',       30),
  ('Ferramentas e software',   'despesa_operacional',  40),
  ('Hospedagem e infraestrutura','despesa_operacional',50),
  ('Mídia paga',               'marketing',            60),
  ('Equipe e prestadores',     'pessoal',              70),
  ('Impostos',                 'tributo',              80),
  ('Contador',                 'despesa_operacional',  90),
  ('Outros',                   'outro',               100)
) as seed(name, type, display_order)
where not exists (select 1 from public.financial_categories);
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

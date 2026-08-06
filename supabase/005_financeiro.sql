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

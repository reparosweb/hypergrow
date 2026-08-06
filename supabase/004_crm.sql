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

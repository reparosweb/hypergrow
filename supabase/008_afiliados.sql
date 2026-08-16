-- ============================================================
-- Hypergrow - Afiliados (programa de indicacao, comissao unica)
-- Rode no SQL Editor do Supabase do projeto Hypergrow
-- (htaxogmtaxebfbyetxel, conta reparosweb).
--
-- Rode DEPOIS de 001_leads.sql, 004_crm.sql, 005_financeiro.sql e
-- 007_usuarios.sql (este arquivo referencia leads, payables e admin_users).
-- Seguro rodar mais de uma vez: tudo eh "if not exists" / "drop ... if exists".
--
-- COMENTARIOS SO EM ASCII de proposito: o SQL Editor do Supabase ja quebrou
-- com acento e travessao neste projeto (ver 007_usuarios.sql). Sem
-- cifrao-duplo tambem, pelo mesmo motivo: o editor parte o script nos ";" e
-- uma funcao com corpo entre cifroes chega partida ao banco.
--
-- COMISSAO: unica, nao recorrente. O lead vira cliente UMA vez -> no maximo
-- uma comissao (garantido pelo indice unico parcial do item 3, nao so pelo
-- codigo da aplicacao). Fluxo do status: apurada -> aprovada -> o valor vira
-- um lancamento em "payables" (financeiro que ja existe). "pago" NUNCA e
-- gravado de novo aqui: e sempre lido do status do payable vinculado
-- (payable_id) para nao ter duas fontes de verdade pra mesma informacao.
-- ============================================================

create extension if not exists pgcrypto;

-- -- 1. Origem do lead: qual afiliado trouxe --------------------
-- NAO e chave estrangeira de proposito: e so o codigo que veio na URL
-- (?ref=CODIGO) no momento em que o clique foi validado pelo servidor. A
-- ligacao de verdade (com FK real) acontece em affiliate_events quando o
-- lead converte - ver item 3.
alter table public.leads add column if not exists affiliate_code text;
create index if not exists leads_affiliate_code_idx on public.leads (affiliate_code);

-- -- 2. Afiliados ------------------------------------------------
-- Um afiliado = um usuario do painel (admin_users, papel 'afiliado') que
-- ganhou um perfil de indicacao. O login continua sendo o mesmo de sempre; a
-- tabela so guarda o que e EXCLUSIVO de quem indica (codigo, comissao, pix,
-- status do programa) - nada disso faz sentido pra operador ou super.
create table if not exists public.affiliates (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.admin_users(id) on delete cascade,
  code            text not null,
  commission_pct  numeric not null check (commission_pct > 0 and commission_pct <= 100),
  pix_key         text,
  status          text not null default 'ativo' check (status in ('ativo','inativo')),
  created_at      timestamptz not null default now()
);

-- Codigo gerado pela APLICACAO (formato HG-XXXX, alfabeto sem 0/O/1/I - mesma
-- ideia do token de convite em lib/auth.ts). O banco so garante que nao repete.
create unique index if not exists affiliates_code_idx on public.affiliates (code);

-- Um usuario so pode ter UM perfil de afiliado. Sem isto, um clique duplo em
-- "criar afiliado" geraria dois codigos pro mesmo login e a comissao ficaria
-- espalhada em dois lugares.
create unique index if not exists affiliates_user_id_idx on public.affiliates (user_id);

create index if not exists affiliates_status_idx on public.affiliates (status);

-- -- 3. Eventos: clique e conversao -------------------------------
create table if not exists public.affiliate_events (
  id            uuid primary key default gen_random_uuid(),
  affiliate_id  uuid references public.affiliates(id) on delete cascade,
  lead_id       uuid references public.leads(id) on delete set null,
  type          text not null check (type in ('clique','conversao')),
  ip_hash       text,
  created_at    timestamptz not null default now()
);

-- CRITICO: antifraude no BANCO, nao so no codigo da aplicacao. Um mesmo lead
-- nunca pode gerar duas conversoes - nem se dois cliques simultaneos no CRM
-- tentarem mover o mesmo lead pra "cliente" ao mesmo tempo (corrida). O
-- indice unico PARCIAL (so nas linhas type='conversao') garante isso na
-- origem: o segundo insert falha no banco, mesmo com bug na aplicacao.
create unique index if not exists affiliate_events_conversao_unica
  on public.affiliate_events (lead_id)
  where type = 'conversao';

create index if not exists affiliate_events_affiliate_idx on public.affiliate_events (affiliate_id, type);
create index if not exists affiliate_events_created_idx   on public.affiliate_events (created_at desc);

-- -- 4. Comissoes ---------------------------------------------------
-- No maximo uma linha por lead_id, na pratica: garantido de fato pelo indice
-- unico parcial do item 3 (sem conversao duplicada, o codigo nunca chega a
-- criar comissao duplicada - ver lib/modules/mod-afiliados.ts).
create table if not exists public.affiliate_commissions (
  id            uuid primary key default gen_random_uuid(),
  affiliate_id  uuid references public.affiliates(id) on delete cascade,
  lead_id       uuid references public.leads(id) on delete set null,
  event_id      uuid references public.affiliate_events(id) on delete set null,
  -- payables ja existe (005_financeiro.sql): aqui fica o vinculo com o
  -- lancamento financeiro real, criado quando o super aprova a comissao.
  payable_id    uuid references public.payables(id) on delete set null,
  value         numeric not null check (value >= 0),
  status        text not null default 'apurada' check (status in ('apurada','aprovada')),
  created_at    timestamptz not null default now()
);

create index if not exists affiliate_commissions_affiliate_idx on public.affiliate_commissions (affiliate_id, status);
create index if not exists affiliate_commissions_lead_idx      on public.affiliate_commissions (lead_id);
create index if not exists affiliate_commissions_payable_idx   on public.affiliate_commissions (payable_id);

-- -- 5. RLS em modo cofre -------------------------------------------
-- Mesmo padrao de admin_users (007_usuarios.sql): estas 3 tabelas guardam
-- dado financeiro (comissao, pix) e regra de negocio (percentual). Ninguem
-- acessa pela chave publica nem pela chave de usuario logado - a policy nega
-- tudo (using false / with check false) e so a service_role, que roda o
-- roteador /api/app no servidor, enxerga.
alter table public.affiliates enable row level security;
drop policy if exists affiliates_service_only on public.affiliates;
create policy affiliates_service_only on public.affiliates
  for all using (false) with check (false);
revoke all on public.affiliates from anon, authenticated;

alter table public.affiliate_events enable row level security;
drop policy if exists affiliate_events_service_only on public.affiliate_events;
create policy affiliate_events_service_only on public.affiliate_events
  for all using (false) with check (false);
revoke all on public.affiliate_events from anon, authenticated;

alter table public.affiliate_commissions enable row level security;
drop policy if exists affiliate_commissions_service_only on public.affiliate_commissions;
create policy affiliate_commissions_service_only on public.affiliate_commissions
  for all using (false) with check (false);
revoke all on public.affiliate_commissions from anon, authenticated;

comment on table public.affiliates is
  'Perfil de afiliado (1:1 com admin_users, papel afiliado). Acesso somente via service_role.';
comment on table public.affiliate_events is
  'Clique (?ref=CODIGO validado no servidor) e conversao (lead virou cliente). Indice unico parcial impede conversao duplicada por lead.';
comment on table public.affiliate_commissions is
  'Comissao unica (nao recorrente) por lead convertido. status: apurada -> aprovada. "pago" e lido do status do payable vinculado (payable_id), nunca gravado aqui de novo.';
comment on column public.leads.affiliate_code is
  'Codigo do afiliado que trouxe o lead (?ref=CODIGO). Nao e FK - so o texto capturado no clique; a ligacao de verdade com o afiliado acontece em affiliate_events na conversao.';

-- -- 6. Conferencia ------------------------------------------
-- Rode isto depois para ver se ficou tudo de pe. Espera-se 3 linhas com
-- rowsecurity = true e os indices listados acima.
--   select relname, relrowsecurity from pg_class where relname in
--     ('affiliates','affiliate_events','affiliate_commissions');
--   select indexname from pg_indexes where tablename in
--     ('affiliates','affiliate_events','affiliate_commissions');
--
-- As 3 tabelas nascem VAZIAS de proposito. Para criar o primeiro afiliado:
--   1. Sistema > Usuarios: convide a pessoa com o papel "Afiliado".
--   2. Depois que ela aceitar o convite (ou mesmo antes, tanto faz):
--      Sistema > Afiliados > "Novo afiliado", escolha o nome dela na lista,
--      informe o percentual de comissao e (opcional) a chave PIX.
--   3. O sistema gera o codigo (formato HG-XXXX) e o link de indicacao dela
--      passa a ser https://SEU-SITE/?ref=HG-XXXX.

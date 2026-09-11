-- ============================================================
-- Hyper QR Code — SaaS de QR Code dinâmico (produto novo, pago)
-- Rode no SQL Editor do Supabase do projeto Hypergrow (htaxogmtaxebfbyetxel).
-- Seguro rodar mais de uma vez.
--
-- ISOLAMENTO DE PROPÓSITO: todo objeto novo tem prefixo `hqr_` — nenhuma
-- tabela referencia leads/appointments/charges do site institucional, e
-- nenhuma tabela do site institucional referencia isto. O motivo é dar pra
-- extrair este produto para um Supabase próprio no futuro (plano do dono:
-- "quando escalar vou pra versão paga [de infra]") só copiando as tabelas
-- `hqr_*` — sem precisar desembaraçar nada.
--
-- PRIMEIRO USO DE SUPABASE AUTH NESTE PROJETO: confirmado por busca no
-- código (nenhuma tabela/rota existente usa auth.uid()/auth.users antes
-- desta migration) — o resto do site usa sessão de admin própria
-- (cookie HMAC, ver lib/auth.ts), não Supabase Auth. Aqui é diferente de
-- propósito: cliente pagante final, cadastro público.
-- ============================================================

-- ── 0. Perfil do usuário (extensão de auth.users) ───────────────────────────
create table if not exists public.hqr_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text,
  telefone    text,
  documento   text,                 -- CPF/CNPJ, opcional — só quando for pagar
  criado_em   timestamptz not null default now()
);
alter table public.hqr_profiles enable row level security;
revoke all on public.hqr_profiles from anon;
grant select, insert, update on public.hqr_profiles to authenticated;

drop policy if exists hqr_profiles_select_own on public.hqr_profiles;
create policy hqr_profiles_select_own on public.hqr_profiles
  for select to authenticated using (id = auth.uid());
drop policy if exists hqr_profiles_upsert_own on public.hqr_profiles;
create policy hqr_profiles_insert_own on public.hqr_profiles
  for insert to authenticated with check (id = auth.uid());
create policy hqr_profiles_update_own on public.hqr_profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Cria o perfil sozinho no cadastro (o app NÃO precisa inserir manualmente,
-- mas a policy acima existe como rede de segurança se o trigger não disparar
-- em algum fluxo de login social futuro).
create or replace function public.hqr_criar_perfil_no_cadastro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.hqr_profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists hqr_on_auth_user_created on auth.users;
create trigger hqr_on_auth_user_created
  after insert on auth.users
  for each row execute function public.hqr_criar_perfil_no_cadastro();

-- ── 1. Catálogo de planos (leitura pública — a página de preço não precisa
--       de login) ───────────────────────────────────────────────────────────
create table if not exists public.hqr_planos (
  slug                    text primary key,
  nome                    text not null,
  tipo                    text not null check (tipo in ('avulso','assinatura')),
  preco_centavos          int  not null check (preco_centavos > 0),
  ciclo                   text check (ciclo in ('mensal') or ciclo is null),
  limite_qrcodes          int,                 -- null = ilimitado
  retencao_analytics_dias int  not null default 30,
  permite_personalizacao  boolean not null default false,
  permite_logo            boolean not null default false,
  ativo                   boolean not null default true,
  ordem                   int not null default 0
);
alter table public.hqr_planos enable row level security;
revoke all on public.hqr_planos from anon, authenticated;
grant select on public.hqr_planos to anon, authenticated;
drop policy if exists hqr_planos_leitura_publica on public.hqr_planos;
create policy hqr_planos_leitura_publica on public.hqr_planos
  for select to anon, authenticated using (ativo = true);

-- Preços R$5,90 e R$29,90 foram DECIDIDOS pelo dono. Os limites de cada
-- plano e os valores de Pro/Business são PROPOSTA (documentado no plano
-- aprovado) — ajustar aqui livremente, é só dado, não precisa mexer em
-- código nenhum para mudar.
insert into public.hqr_planos
  (slug, nome, tipo, preco_centavos, ciclo, limite_qrcodes, retencao_analytics_dias, permite_personalizacao, permite_logo, ordem)
values
  ('avulso',    'Arte avulsa', 'avulso',      590,  null,    1,    30,   false, false, 0),
  ('essencial', 'Essencial',   'assinatura', 2990, 'mensal', 10,  365,   true,  false, 1),
  ('pro',       'Pro',         'assinatura', 6990, 'mensal', 50,  36500, true,  true,  2),
  ('business',  'Business',    'assinatura', 17990,'mensal', null,36500,true,  true,  3)
on conflict (slug) do nothing;

-- ── 2. Assinaturas — 1 linha por usuário, estado da recorrência ────────────
create table if not exists public.hqr_assinaturas (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null unique references auth.users(id) on delete cascade,
  plano_slug            text not null references public.hqr_planos(slug),
  status                text not null default 'trialing'
                        check (status in ('trialing','pending','active','overdue','canceled','inactive')),
  asaas_customer_id     text,
  asaas_subscription_id text,
  periodo_atual_fim     timestamptz,
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now()
);
create index if not exists hqr_assinaturas_asaas_sub_idx on public.hqr_assinaturas (asaas_subscription_id);
create index if not exists hqr_assinaturas_asaas_cus_idx on public.hqr_assinaturas (asaas_customer_id);

create extension if not exists moddatetime schema extensions;
drop trigger if exists hqr_assinaturas_touch on public.hqr_assinaturas;
create trigger hqr_assinaturas_touch before update on public.hqr_assinaturas
  for each row execute procedure extensions.moddatetime(atualizado_em);

alter table public.hqr_assinaturas enable row level security;
revoke all on public.hqr_assinaturas from anon, authenticated;
grant select on public.hqr_assinaturas to authenticated;
drop policy if exists hqr_assinaturas_select_own on public.hqr_assinaturas;
create policy hqr_assinaturas_select_own on public.hqr_assinaturas
  for select to authenticated using (user_id = auth.uid());
-- Nenhuma policy de INSERT/UPDATE/DELETE para authenticated/anon de propósito:
-- só service_role escreve aqui (via app/api/qrcode/route.ts, chave de servidor).
-- O trigger abaixo é a SEGUNDA camada de defesa, para o caso de uma migration
-- futura abrir uma policy de escrita por engano — réplica adaptada do
-- `tenants_billing_guard` já comprovado no Agentop (RUN_ONCE_v161).
create table if not exists public.hqr_audit_logs (
  id        bigint generated always as identity primary key,
  user_id   uuid,
  tabela    text not null,
  acao      text not null,
  detalhe   jsonb,
  criado_em timestamptz not null default now()
);
revoke all on public.hqr_audit_logs from anon, authenticated;

create or replace function public.hqr_assinaturas_billing_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'trialing';
    new.asaas_customer_id := null;
    new.asaas_subscription_id := null;
  elsif tg_op = 'UPDATE' then
    if new.status is distinct from old.status
       or new.plano_slug is distinct from old.plano_slug
       or new.asaas_subscription_id is distinct from old.asaas_subscription_id
       or new.asaas_customer_id is distinct from old.asaas_customer_id then
      insert into public.hqr_audit_logs (user_id, tabela, acao, detalhe)
      values (old.user_id, 'hqr_assinaturas', 'update_bloqueado',
              jsonb_build_object('tentou_status', new.status, 'tinha_status', old.status));
      new.status := old.status;
      new.plano_slug := old.plano_slug;
      new.asaas_subscription_id := old.asaas_subscription_id;
      new.asaas_customer_id := old.asaas_customer_id;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists hqr_assinaturas_billing_guard on public.hqr_assinaturas;
create trigger hqr_assinaturas_billing_guard
  before insert or update on public.hqr_assinaturas
  for each row execute function public.hqr_assinaturas_billing_guard();

-- ── 3. Pagamento avulso — a arte R$5,90 (cobrança ÚNICA, Asaas
--       POST /v3/payments, não é assinatura — mesmo caminho que
--       createAddonPixPayment já usa em produção no Agentop) ───────────────
create table if not exists public.hqr_pagamentos_avulsos (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  qrcode_id         uuid,   -- FK pra hqr_qrcodes ligada mais abaixo (bloco 5) —
                            -- essa tabela vem antes na leitura, mas hqr_qrcodes
                            -- só existe depois; sem isso o CREATE TABLE falharia
  asaas_payment_id  text unique,
  valor_centavos    int  not null,
  status            text not null default 'pendente'
                    check (status in ('pendente','pago','estornado','cancelado')),
  criado_em         timestamptz not null default now(),
  pago_em           timestamptz
);
-- (a FK pra hqr_qrcodes é resolvida depois que a tabela existir — ver bloco 5)

create index if not exists hqr_pag_avulsos_user_idx on public.hqr_pagamentos_avulsos (user_id);

alter table public.hqr_pagamentos_avulsos enable row level security;
revoke all on public.hqr_pagamentos_avulsos from anon, authenticated;
grant select, insert on public.hqr_pagamentos_avulsos to authenticated;
drop policy if exists hqr_pag_avulsos_select_own on public.hqr_pagamentos_avulsos;
create policy hqr_pag_avulsos_select_own on public.hqr_pagamentos_avulsos
  for select to authenticated using (user_id = auth.uid());
drop policy if exists hqr_pag_avulsos_insert_own on public.hqr_pagamentos_avulsos;
create policy hqr_pag_avulsos_insert_own on public.hqr_pagamentos_avulsos
  for insert to authenticated with check (user_id = auth.uid());
-- Sem policy de UPDATE/DELETE para authenticated: só service_role confirma
-- pagamento (via webhook do Asaas). O trigger força status='pendente' no
-- INSERT independente do que o cliente mandar.
create or replace function public.hqr_pag_avulso_forcar_pendente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  new.status := 'pendente';
  new.pago_em := null;
  new.asaas_payment_id := null;
  return new;
end;
$$;
drop trigger if exists hqr_pag_avulso_forcar_pendente on public.hqr_pagamentos_avulsos;
create trigger hqr_pag_avulso_forcar_pendente
  before insert on public.hqr_pagamentos_avulsos
  for each row execute function public.hqr_pag_avulso_forcar_pendente();

-- ── 4. Gerador de código curto (base62, 8 chars — 62^8 ≈ 218 trilhões de
--       combinações, colisão desprezível em qualquer escala realista de
--       QR Codes criados; a UNIQUE em hqr_qrcodes.codigo é a rede de
--       segurança final) ───────────────────────────────────────────────────
create or replace function public.hqr_novo_codigo()
returns text
language plpgsql
as $$
declare
  alfabeto  text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  resultado text := '';
  i int;
begin
  for i in 1..8 loop
    resultado := resultado || substr(alfabeto, 1 + floor(random() * 62)::int, 1);
  end loop;
  return resultado;
end;
$$;

-- ── 5. QR Codes — o núcleo ──────────────────────────────────────────────────
create table if not exists public.hqr_qrcodes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  codigo         text not null unique default public.hqr_novo_codigo(),
  tipo           text not null check (tipo in
                   ('link','whatsapp','pix','wifi','vcard','pdf','texto','instagram')),
  titulo         text not null default 'Meu QR Code',
  conteudo       jsonb not null default '{}'::jsonb,   -- payload específico do tipo
  cor_frente     text not null default '#000000',
  cor_fundo      text not null default '#FFFFFF',
  logo_url       text,
  ativo          boolean not null default false,       -- só liga após pagamento confirmado
  origem_plano   text not null check (origem_plano in ('avulso','assinatura')),
  total_scans    bigint not null default 0,             -- contador denormalizado
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);
create index if not exists hqr_qrcodes_user_idx on public.hqr_qrcodes (user_id);
-- o índice único de `codigo` já existe pela constraint UNIQUE — é essa coluna
-- que o middleware consulta em TODO scan.

drop trigger if exists hqr_qrcodes_touch on public.hqr_qrcodes;
create trigger hqr_qrcodes_touch before update on public.hqr_qrcodes
  for each row execute procedure extensions.moddatetime(atualizado_em);

-- Agora que hqr_qrcodes existe, liga a FK pendente de hqr_pagamentos_avulsos.
alter table public.hqr_pagamentos_avulsos
  drop constraint if exists hqr_pagamentos_avulsos_qrcode_id_fkey;
alter table public.hqr_pagamentos_avulsos
  add constraint hqr_pagamentos_avulsos_qrcode_id_fkey
  foreign key (qrcode_id) references public.hqr_qrcodes(id) on delete set null;

alter table public.hqr_qrcodes enable row level security;
revoke all on public.hqr_qrcodes from anon, authenticated;
grant select, insert, delete on public.hqr_qrcodes to authenticated;
-- UPDATE liberado só nas colunas de conteúdo/edição — nunca `ativo`
-- (liga só via pagamento confirmado pelo service_role), nunca `total_scans`
-- (só a função de registrar scan mexe nisso), nunca `origem_plano`/`user_id`.
grant update (titulo, conteudo, cor_frente, cor_fundo, logo_url, atualizado_em)
  on public.hqr_qrcodes to authenticated;

drop policy if exists hqr_qrcodes_select_own on public.hqr_qrcodes;
create policy hqr_qrcodes_select_own on public.hqr_qrcodes
  for select to authenticated using (user_id = auth.uid());
drop policy if exists hqr_qrcodes_insert_own on public.hqr_qrcodes;
create policy hqr_qrcodes_insert_own on public.hqr_qrcodes
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists hqr_qrcodes_update_own on public.hqr_qrcodes;
create policy hqr_qrcodes_update_own on public.hqr_qrcodes
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists hqr_qrcodes_delete_own on public.hqr_qrcodes;
create policy hqr_qrcodes_delete_own on public.hqr_qrcodes
  for delete to authenticated using (user_id = auth.uid());
-- ⚠️ SEM policy de SELECT para `anon` de propósito — ver função
-- hqr_buscar_qrcode_publico logo abaixo. Uma policy `using (ativo = true)`
-- pareceria segura ("só ativo") mas RLS filtra LINHA, não a forma da
-- consulta: com a chave anônima (pública, embutida no navegador de
-- qualquer visitante) e uma policy dessas, qualquer um poderia rodar
-- `select * from hqr_qrcodes` direto pelo PostgREST e listar TODOS os
-- QR Codes ativos de TODOS os clientes — PIX, WhatsApp, destino privado,
-- tudo. A busca pública por `/q/{codigo}` tem que ir por uma função
-- SECURITY DEFINER que devolve só os campos necessários de UMA linha por
-- vez, nunca por uma policy de tabela aberta a `anon`.
create or replace function public.hqr_buscar_qrcode_publico(p_codigo text)
returns table (
  id          uuid,
  tipo        text,
  titulo      text,
  conteudo    jsonb,
  cor_frente  text,
  cor_fundo   text,
  logo_url    text
)
language sql
security definer
set search_path = public
stable
as $$
  select q.id, q.tipo, q.titulo, q.conteudo, q.cor_frente, q.cor_fundo, q.logo_url
  from public.hqr_qrcodes q
  where q.codigo = p_codigo and q.ativo = true
  limit 1;
$$;
revoke all on function public.hqr_buscar_qrcode_publico(text) from public;
grant execute on function public.hqr_buscar_qrcode_publico(text) to anon, authenticated;

-- Trigger de limite de plano — BEFORE INSERT. Caminho "assinatura": exige
-- assinatura ativa e respeita o limite do plano. Caminho "avulso": sem
-- limite de verdade (cada um é uma cobrança própria), só um teto de rascunho
-- não pago (10) pra não virar spam de linha inativa.
create or replace function public.hqr_checar_limite_qrcode()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limite  int;
  v_status  text;
  v_ativos  int;
  v_rascunhos int;
begin
  if new.origem_plano = 'assinatura' then
    select p.limite_qrcodes, a.status into v_limite, v_status
    from public.hqr_assinaturas a
    join public.hqr_planos p on p.slug = a.plano_slug
    where a.user_id = new.user_id;

    if v_status is distinct from 'active' then
      raise exception 'Sem assinatura ativa — não é possível criar QR Code por plano recorrente.';
    end if;

    if v_limite is not null then
      select count(*) into v_ativos
      from public.hqr_qrcodes
      where user_id = new.user_id and origem_plano = 'assinatura';
      if v_ativos >= v_limite then
        raise exception 'Limite de % QR Codes do seu plano atingido.', v_limite;
      end if;
    end if;
  elsif new.origem_plano = 'avulso' then
    select count(*) into v_rascunhos
    from public.hqr_qrcodes
    where user_id = new.user_id and origem_plano = 'avulso' and ativo = false;
    if v_rascunhos >= 10 then
      raise exception 'Muitos QR Codes avulsos não pagos em aberto (máximo 10) — finalize o pagamento de um deles antes de criar outro.';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists hqr_qrcodes_limite_guard on public.hqr_qrcodes;
create trigger hqr_qrcodes_limite_guard
  before insert on public.hqr_qrcodes
  for each row execute function public.hqr_checar_limite_qrcode();

-- ── 6. Eventos de scan — enxuta de propósito, pensada pra 100M+ linhas ─────
-- Deliberadamente SEM ip bruto nem user-agent completo (LGPD + linha pequena
-- = a diferença entre uma tabela de 100M linhas caber confortável ou não).
create table if not exists public.hqr_scan_events (
  id            bigint generated always as identity primary key,
  qrcode_id     uuid not null references public.hqr_qrcodes(id) on delete cascade,
  criado_em     timestamptz not null default now(),
  pais          char(2),               -- ISO-3166 alpha-2, de x-vercel-ip-country
  cidade        text,
  dispositivo   text check (dispositivo in ('mobile','desktop','tablet','outro')),
  referer_host  text                   -- só o host, nunca a URL completa
);
create index if not exists hqr_scan_qr_data_idx on public.hqr_scan_events (qrcode_id, criado_em desc);
create index if not exists hqr_scan_criado_em_brin_idx on public.hqr_scan_events
  using brin (criado_em);

alter table public.hqr_scan_events enable row level security;
revoke all on public.hqr_scan_events from anon, authenticated;
grant select on public.hqr_scan_events to authenticated;
drop policy if exists hqr_scan_events_select_own on public.hqr_scan_events;
create policy hqr_scan_events_select_own on public.hqr_scan_events
  for select to authenticated using (
    exists (
      select 1 from public.hqr_qrcodes q
      where q.id = hqr_scan_events.qrcode_id and q.user_id = auth.uid()
    )
  );
-- Nenhuma policy de INSERT: a única porta de entrada é a função abaixo.

-- Grava o evento de scan + incrementa o contador denormalizado numa
-- transação só. SECURITY DEFINER pra funcionar mesmo sem policy de INSERT
-- na tabela, e roda como `anon` (chamada pelo middleware, sem sessão de
-- usuário) — por isso valida tudo internamente, nunca confia no chamador.
create or replace function public.hqr_registrar_scan(
  p_codigo      text,
  p_pais        text default null,
  p_cidade      text default null,
  p_dispositivo text default null,
  p_referer_host text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qrcode_id uuid;
begin
  select id into v_qrcode_id from public.hqr_qrcodes
  where codigo = p_codigo and ativo = true
  limit 1;

  if v_qrcode_id is null then
    return false;
  end if;

  insert into public.hqr_scan_events (qrcode_id, pais, cidade, dispositivo, referer_host)
  values (
    v_qrcode_id,
    nullif(p_pais, ''),
    nullif(p_cidade, ''),
    case when p_dispositivo in ('mobile','desktop','tablet') then p_dispositivo else 'outro' end,
    nullif(p_referer_host, '')
  );

  update public.hqr_qrcodes set total_scans = total_scans + 1 where id = v_qrcode_id;

  return true;
end;
$$;
revoke all on function public.hqr_registrar_scan(text, text, text, text, text) from public;
grant execute on function public.hqr_registrar_scan(text, text, text, text, text) to anon, authenticated;

-- ── 7. Ledger de idempotência do webhook Asaas (só service_role) ──────────
create table if not exists public.hqr_webhook_events (
  id               bigint generated always as identity primary key,
  event_id         text not null unique,   -- id que o Asaas manda por evento
  evento           text not null,
  payment_id       text,
  subscription_id  text,
  recebido_em      timestamptz not null default now()
);
alter table public.hqr_webhook_events enable row level security;
revoke all on public.hqr_webhook_events from anon, authenticated;
-- nenhuma policy: só service_role (que ignora RLS) acessa esta tabela.

-- ============================================================
-- Fim. Depois de rodar, confira no painel do Supabase:
-- Table Editor → deve aparecer hqr_profiles, hqr_planos (com 4 linhas),
-- hqr_assinaturas, hqr_pagamentos_avulsos, hqr_qrcodes, hqr_scan_events,
-- hqr_webhook_events, hqr_audit_logs — todas com o cadeado de RLS ligado.
-- ============================================================

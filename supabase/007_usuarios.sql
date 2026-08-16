-- ============================================================
-- Hypergrow - Usuarios do painel (FRENTE C)
-- Rode no SQL Editor do Supabase do projeto Hypergrow
-- (htaxogmtaxebfbyetxel, conta reparosweb).
--
-- Rode DEPOIS de 004_crm.sql e 005_financeiro.sql.
-- Seguro rodar mais de uma vez: tudo eh "if not exists" / "drop ... if exists".
--
-- COMENTARIOS SO EM ASCII de proposito: o SQL Editor do Supabase ja quebrou
-- com acento e travessao neste projeto. Nada de cifrao-duplo aqui tambem - o
-- editor parte o script nos ";" e uma funcao com corpo entre cifroes chega
-- partida ao banco. Por isso o updated_at usa a extensao moddatetime, mesmo
-- padrao de 004 e 005.
-- ============================================================

-- Necessaria para gen_random_uuid() (ja vem no Supabase, mas garante).
create extension if not exists pgcrypto;
create extension if not exists moddatetime schema extensions;

-- -- 1. Tabela de usuarios do painel -------------------------
-- Ate aqui o painel tinha UMA senha global (ADMIN_PASSWORD na Vercel):
-- nao dava para saber quem fez o que, nem dar acesso parcial a alguem.
-- Esta tabela resolve isso.
--
-- password_hash guarda o formato autodescritivo do scrypt do proprio Node:
--     scrypt$N$r$p$salt_base64$hash_base64
-- Os parametros viajam junto do hash para permitir endurecer o custo no
-- futuro sem invalidar as senhas ja cadastradas.
create table if not exists public.admin_users (
  id                uuid primary key default gen_random_uuid(),
  email             text not null,
  name              text,
  role              text not null default 'operador'
                      check (role in ('super','operador','afiliado','cliente')),
  password_hash     text,
  status            text not null default 'convidado'
                      check (status in ('convidado','ativo','bloqueado')),
  -- null = usa o padrao do papel (ver lib/permissions.ts). Lista = permissao
  -- explicita, ex.: ["crm","agenda"].
  allowed_modules   jsonb,
  -- Convite: no banco fica SO o sha256 do token. O link com o token aparece
  -- uma unica vez, na tela de quem convidou.
  invite_token_hash text,
  invite_expires_at timestamptz,
  last_login_at     timestamptz,
  created_by        uuid references public.admin_users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- E-mail unico ignorando maiusculas: "Joao@x.com" e "joao@x.com" sao a mesma
-- pessoa. O codigo grava sempre em minusculas e consulta com "=", nunca com
-- ILIKE (no LIKE do Postgres o "_" eh curinga e eh comum em e-mail).
create unique index if not exists admin_users_email_lower_idx
  on public.admin_users (lower(email));

create index if not exists admin_users_status_idx on public.admin_users (status);
create index if not exists admin_users_role_idx   on public.admin_users (role);
create index if not exists admin_users_invite_idx on public.admin_users (invite_token_hash);

drop trigger if exists admin_users_touch on public.admin_users;
create trigger admin_users_touch before update on public.admin_users
  for each row execute procedure extensions.moddatetime(updated_at);

-- -- 2. RLS em modo cofre ------------------------------------
-- Esta tabela guarda HASH DE SENHA e token de convite. Ninguem acessa ela
-- pela chave publica nem pela chave de usuario logado: a policy nega tudo
-- (using false / with check false) e a service_role, que ignora RLS, eh a
-- unica que enxerga. Mesmo padrao de google_calendar_auth em 006_agenda.sql.
alter table public.admin_users enable row level security;
drop policy if exists admin_users_service_only on public.admin_users;
create policy admin_users_service_only on public.admin_users
  for all using (false) with check (false);
revoke all on public.admin_users from anon, authenticated;

comment on table public.admin_users is
  'Usuarios do painel /admin. Acesso somente via service_role (RLS nega tudo).';
comment on column public.admin_users.allowed_modules is
  'null = padrao do papel; lista jsonb = permissao explicita por modulo';
comment on column public.admin_users.password_hash is
  'scrypt$N$r$p$salt_base64$hash_base64 (crypto.scryptSync do Node)';

-- -- 3. Conferencia ------------------------------------------
-- Rode isto depois para ver se ficou tudo de pe. Espera-se 1 linha por indice
-- e a coluna rowsecurity = true.
--   select relname, relrowsecurity from pg_class where relname = 'admin_users';
--   select indexname from pg_indexes where tablename = 'admin_users';
--
-- A tabela nasce VAZIA de proposito. O primeiro acesso eh pelo break-glass:
-- entre em /admin/login com qualquer e-mail que NAO esteja na tabela e a
-- senha da variavel ADMIN_PASSWORD da Vercel. Depois use Sistema > Usuarios
-- para convidar as pessoas de verdade.

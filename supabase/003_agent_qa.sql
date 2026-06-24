-- ============================================================
-- HyperGrow — base de auto-aprendizado do agente de IA.
-- Cada pergunta de cliente + resposta vira conhecimento reutilizável.
-- Rode no SQL Editor do Supabase.
-- ============================================================
create table if not exists public.agent_qa (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text not null,
  created_at  timestamptz not null default now()
);
create index if not exists agent_qa_created_idx on public.agent_qa(created_at desc);

alter table public.agent_qa enable row level security;
revoke all on public.agent_qa from anon;

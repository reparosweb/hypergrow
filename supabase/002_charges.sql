-- ============================================================
-- HyperGrow — tabela de cobranças (Asaas). Rode no SQL Editor.
-- ============================================================
create table if not exists public.charges (
  id            uuid primary key default gen_random_uuid(),
  charge_id     text unique not null,
  customer_name text,
  customer_email text,
  value         numeric(12,2),
  billing_type  text,
  status        text default 'PENDING',  -- PENDING | RECEIVED | CONFIRMED | OVERDUE | REFUNDED | CHARGEBACK | CANCELLED
  invoice_url   text,
  pix_payload   text,
  pix_qr        text,
  description   text,
  paid_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists charges_created_idx on public.charges(created_at desc);
create index if not exists charges_status_idx on public.charges(status);

alter table public.charges enable row level security;
revoke all on public.charges from anon;

import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Webhook Asaas (cobranças HyperGrow) — fail-closed.
// Configure no Asaas: Integrações > Webhooks > URL = https://SEU_DOMINIO/api/webhook/asaas
// com o mesmo token de ASAAS_WEBHOOK_TOKEN.
export async function POST(req: NextRequest) {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected) return NextResponse.json({ error: "webhook não configurado" }, { status: 500 });
  const received = req.headers.get("asaas-access-token");
  if (received !== expected) return NextResponse.json({ error: "token inválido" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const event = body?.event;
  const payment = body?.payment;
  if (!event) return NextResponse.json({ error: "missing event" }, { status: 400 });
  if (!payment?.id) return NextResponse.json({ ok: true, ignored: true });

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false }, { status: 503 });

  const map: Record<string, string> = {
    PAYMENT_RECEIVED: "RECEIVED",
    PAYMENT_CONFIRMED: "CONFIRMED",
    PAYMENT_OVERDUE: "OVERDUE",
    PAYMENT_REFUNDED: "REFUNDED",
    PAYMENT_CHARGEBACK: "CHARGEBACK",
    PAYMENT_DELETED: "CANCELLED",
  };
  const status = map[event];
  if (status) {
    await supabase
      .from("charges")
      .update({ status, paid_at: status === "RECEIVED" || status === "CONFIRMED" ? new Date().toISOString() : null })
      .eq("charge_id", payment.id);
  }
  return NextResponse.json({ ok: true, status: status || "ignored" });
}

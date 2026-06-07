import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Recebe eventos do Cal.com (BOOKING_CREATED etc.) e registra/atualiza o lead
// no CRM no estágio "reuniao". Configure no Cal.com: Settings > Webhooks,
// URL = https://SEU_DOMINIO/api/calcom/webhook, secret = CALCOM_WEBHOOK_SECRET.

function verify(raw: string, sig: string | null): boolean {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secret) return true; // sem secret configurado, aceita (menos seguro)
  if (!sig) return false;
  const expect = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-cal-signature-256");
  if (!verify(raw, sig)) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  let evt: any = {};
  try {
    evt = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "json inválido" }, { status: 400 });
  }

  const trigger = evt?.triggerEvent;
  const p = evt?.payload || {};
  const attendee = (p.attendees && p.attendees[0]) || {};
  const name = attendee.name || p.responses?.name?.value || "Contato (Cal.com)";
  const email = (attendee.email || p.responses?.email?.value || "").toLowerCase();
  const when = p.startTime ? new Date(p.startTime).toLocaleString("pt-BR") : "";
  const title = p.title || "Reunião";

  if (!email) return NextResponse.json({ ok: true, skipped: "sem email" });

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "db_off" }, { status: 503 });

  const cancel = trigger === "BOOKING_CANCELLED";
  const note = cancel
    ? `Reunião CANCELADA (${title}) ${when}`.trim()
    : `Reunião agendada via Cal.com: ${title}${when ? " — " + when : ""}`;

  // Já existe lead com esse e-mail? Atualiza o estágio; senão cria.
  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("email", email)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from("leads")
      .update({ status: cancel ? "em_contato" : "reuniao", message: note })
      .eq("id", existing.id);
  } else {
    await supabase.from("leads").insert({
      name,
      email,
      message: note,
      source: "cal.com",
      status: cancel ? "em_contato" : "reuniao",
    });
  }

  return NextResponse.json({ ok: true });
}

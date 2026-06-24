import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, ADMIN_COOKIE } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase";
import { asaasReady, getOrCreateCustomer, createPayment, getPixQrCode, sanitizeAsaas, isValidCpfCnpj } from "@/lib/asaas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authed() {
  return verifySession(cookies().get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!authed()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });
  const { data, error } = await supabase
    .from("charges")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ charges: [], warning: error.message });
  return NextResponse.json({ charges: data || [], asaas: asaasReady() });
}

export async function POST(req: NextRequest) {
  if (!authed()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  if (!asaasReady()) return NextResponse.json({ error: "Asaas não configurado. Defina ASAAS_API_KEY na Vercel." }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const name = sanitizeAsaas(String(body?.name || ""), 100);
  const email = String(body?.email || "").trim().toLowerCase();
  const cpf = String(body?.cpf || "").replace(/\D/g, "");
  const value = Math.round(Number(body?.value) * 100) / 100;
  const billingType = ["PIX", "CREDIT_CARD", "BOLETO"].includes(body?.billingType) ? body.billingType : "PIX";
  const description = sanitizeAsaas(String(body?.description || `HyperGrow - servico`), 160);

  if (name.length < 2) return NextResponse.json({ error: "Informe o nome do cliente." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  if (!isValidCpfCnpj(cpf)) return NextResponse.json({ error: "CPF/CNPJ inválido." }, { status: 400 });
  if (!isFinite(value) || value < 5) return NextResponse.json({ error: "Valor mínimo R$5,00." }, { status: 400 });

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });

  try {
    const customer = await getOrCreateCustomer({ name, email, cpfCnpj: cpf });
    const due = new Date(); due.setDate(due.getDate() + 3);
    const dueDate = due.toISOString().split("T")[0];

    const charge = await createPayment({ customer, billingType, value, dueDate, description });

    let pixPayload: string | null = null;
    let pixQr: string | null = null;
    if (billingType === "PIX") {
      try {
        const pix = await getPixQrCode(charge.id);
        pixPayload = pix.payload ?? null;
        pixQr = pix.encodedImage ?? null;
      } catch { /* PIX QR pode demorar */ }
    }

    await supabase.from("charges").insert({
      charge_id: charge.id,
      customer_name: name,
      customer_email: email,
      value,
      billing_type: billingType,
      status: "PENDING",
      invoice_url: charge.invoiceUrl ?? null,
      pix_payload: pixPayload,
      pix_qr: pixQr,
      description,
    });

    return NextResponse.json({
      ok: true,
      chargeId: charge.id,
      billingType,
      invoiceUrl: charge.invoiceUrl ?? null,
      pixPayload,
      pixQr,
      value,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao criar cobrança." }, { status: 500 });
  }
}

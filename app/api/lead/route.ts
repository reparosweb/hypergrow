import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { notificarLeadNovo } from "@/lib/notificar";

export const runtime = "nodejs";

/** Origens aceitas. Lista fechada de propósito: `source` alimenta o relatório
 *  de origem no painel, e aceitar string livre do cliente encheria o relatório
 *  de lixo (ou de valor forjado por quem chamasse a API na mão). */
const ORIGENS = ["site", "diagnostico", "afiliado", "ferramenta"] as const;
type Origem = (typeof ORIGENS)[number];

type LeadPayload = {
  name?: string;
  email?: string;
  phone?: string;
  product?: string;
  message?: string;
  /** De onde veio (ver ORIGENS). Ausente ou inválido cai em "site". */
  source?: string;
  // honeypot — bots fill this, humans never see it
  company_website?: string;
};

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: NextRequest) {
  let body: LeadPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  // Honeypot: silently accept to not tip off bots, but do nothing.
  if (body.company_website) {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const phone = (body.phone || "").trim();
  const product = (body.product || "").trim();
  const message = (body.message || "").trim();

  if (name.length < 2) {
    return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    // Backend not configured yet. Don't lose the lead silently — log it
    // (visible in Vercel runtime logs) and tell the client to use WhatsApp.
    console.warn("[lead] Supabase não configurado. Lead recebido:", {
      name,
      email,
      phone,
      product,
    });
    return NextResponse.json(
      {
        ok: false,
        fallback: true,
        error:
          "Recebemos seus dados, mas o banco ainda não está conectado. Fale conosco no WhatsApp.",
      },
      { status: 503 }
    );
  }

  const source: Origem = ORIGENS.includes(body.source as Origem)
    ? (body.source as Origem)
    : "site";

  const { error } = await supabase.from("leads").insert({
    name,
    email,
    phone: phone || null,
    product: product || null,
    message: message || null,
    source,
    user_agent: req.headers.get("user-agent") || null,
  });

  if (error) {
    console.error("[lead] erro ao salvar:", error.message);
    return NextResponse.json(
      { error: "Não foi possível salvar agora. Tente novamente." },
      { status: 500 }
    );
  }

  /* Avisa a equipe. `await` de propósito (e não fire-and-forget): em ambiente
     serverless a função pode ser congelada assim que a resposta é devolvida, e
     uma promessa solta seria descartada no meio — o aviso simplesmente não
     sairia, de forma intermitente e difícil de diagnosticar. O custo é ~200ms
     na resposta do formulário.
     `notificarLeadNovo` nunca lança e nunca bloqueia o sucesso: o lead já está
     salvo neste ponto, e falhar o envio do aviso não pode virar erro na tela
     de quem preencheu. */
  await notificarLeadNovo({ name, email, phone, product, message, source });

  return NextResponse.json({ ok: true });
}

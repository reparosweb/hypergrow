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

  /* Atribuição de afiliado: o cookie `hg_ref` foi gravado pelo
     components/site/RefTracker.tsx quando o visitante chegou com `?ref=CODIGO`
     na URL (ver lib/modules/mod-afiliados.ts para como o clique em si é
     validado). Aqui não se confere se o código existe de verdade em
     `affiliates` — isso é decidido depois, na conversão (quando o lead vira
     cliente em mod-crm.ts). Um código inválido só faz o lead nascer com uma
     tag que nunca vira comissão; não é motivo pra atrasar o cadastro do lead
     com uma consulta extra ao banco.
     `affiliate_code` (não `source`) é o campo que o programa de afiliados de
     fato lê — por isso ele é gravado sempre que o cookie existir, mesmo
     quando `source` continua sendo o valor que o formulário declarou. */
  const refCookie = req.cookies.get("hg_ref")?.value?.trim().toUpperCase().slice(0, 20) || null;

  const source: Origem = ORIGENS.includes(body.source as Origem)
    ? (body.source as Origem)
    : refCookie
      ? "afiliado"
      : "site";

  const linha = {
    name,
    email,
    phone: phone || null,
    product: product || null,
    message: message || null,
    source,
    user_agent: req.headers.get("user-agent") || null,
    affiliate_code: refCookie,
  };

  let { error } = await supabase.from("leads").insert(linha);

  /* Bug real, achado em produção (2026-08-16): a coluna affiliate_code só
     existe depois que o dono roda supabase/008_afiliados.sql no editor do
     Supabase — e até isso acontecer, TODO lead do site (não só o
     diagnóstico) falhava com "não foi possível salvar agora", porque este
     INSERT tenta gravar uma coluna que ainda não existe no banco.
     Captura de lead é o coração do funil: não pode depender de uma migração
     opcional ter rodado. Se o erro for especificamente sobre essa coluna,
     tenta de novo sem ela — o lead se salva normalmente, só sem a atribuição
     de afiliado (reconciliável depois, uma vez a migração rodada). Qualquer
     OUTRO erro de banco continua caindo no fallback normal abaixo.

     CÓDIGO CONFERIDO AO VIVO (não suposto): a primeira versão deste fix
     testava error.code === "42703" (o código do Postgres puro) e NÃO
     resolveu em produção — expus error.code/message temporariamente na
     resposta e testei com curl. O Supabase-js fala PostgREST, que tem seu
     PRÓPRIO código pra isso: "PGRST204" ("Could not find the 'affiliate_code'
     column of 'leads' in the schema cache"), não 42703. Guardo os dois
     porque não sei se a mensagem exata muda depois que a migração roda
     (poderia virar um erro de permissão/RLS com outro código, por exemplo). */
  if (
    (error?.code === "PGRST204" || error?.code === "42703") &&
    /affiliate_code/.test(error.message)
  ) {
    console.warn("[lead] coluna affiliate_code ainda não existe (008_afiliados.sql pendente) — salvando sem atribuição de afiliado.");
    const { affiliate_code: _omitido, ...semAfiliado } = linha;
    void _omitido;
    ({ error } = await supabase.from("leads").insert(semAfiliado));
  }

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

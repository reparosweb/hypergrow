import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSupabase } from "@/lib/supabase";
import { rodarMotor } from "@/lib/automacoes-motor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────────────────────────
   CRON DAS AUTOMAÇÕES — a 9ª função serverless do projeto.

   O comentário do roteador único (`app/api/app/route.ts`) já reservava
   exatamente este caminho como exceção: "`/api/cron` — o agendador da Vercel
   chama um caminho fixo." Este projeto não usa Vercel Cron (não está no
   plano); o agendador real é externo (ex. cron-job.org, grátis), por isso a
   rota aceita GET além de POST — a maioria dos agendadores gratuitos só sabe
   fazer GET.

   FAIL-CLOSED, mesmo padrão de `app/api/calcom/webhook/route.ts` e
   `app/api/webhook/asaas/route.ts`: sem `CRON_SECRET` configurado, a rota
   recusa TUDO (503) e não toca em nenhuma tabela. Com o segredo configurado,
   só aceita quem mandar o mesmo valor em `Authorization: Bearer <segredo>` OU
   `?secret=<segredo>` na URL.

   O motor em si (quais réguas avaliar, o que enviar, o dedupe) mora em
   `lib/automacoes-motor.ts` — esta rota só autentica e devolve o resumo.
   ──────────────────────────────────────────────────────────────────────────── */

function seguro(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function autorizado(req: NextRequest, segredo: string): boolean {
  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ") && seguro(auth.slice(7), segredo)) return true;

  const q = new URL(req.url).searchParams.get("secret") || "";
  if (q && seguro(q, segredo)) return true;

  return false;
}

async function handler(req: NextRequest) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) {
    return NextResponse.json({ ok: false, error: "motor desligado (falta CRON_SECRET no ambiente)." }, { status: 503 });
  }
  if (!autorizado(req, segredo)) {
    return NextResponse.json({ ok: false, error: "segredo inválido." }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "banco não configurado (faltam as variáveis do Supabase)." }, { status: 503 });
  }

  try {
    const resumo = await rodarMotor(supabase);
    return NextResponse.json({ ok: true, ...resumo });
  } catch (e) {
    console.error("[api/cron] falha ao rodar o motor de automações:", e);
    return NextResponse.json({ ok: false, error: "erro interno ao processar automações." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handler(req);
}

// Agendadores externos gratuitos (cron-job.org etc.) muitas vezes só fazem
// GET — aceitar os dois métodos evita depender de um agendador pago.
export async function GET(req: NextRequest) {
  return handler(req);
}

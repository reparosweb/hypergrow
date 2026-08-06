import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { isAuthed, type Ctx } from "@/lib/modules/_shared";
import { modCrm } from "@/lib/modules/mod-crm";
import { modFinanceiro } from "@/lib/modules/mod-financeiro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────────────────────────
   ROTEADOR ÚNICO do painel — `POST /api/app?module=X&action=Y`

   Por que não uma rota por recurso: a Vercel no plano Hobby aceita no máximo
   12 funções serverless e cada `route.ts` vira uma. O site já usa 8; CRM,
   financeiro, agenda, Google e e-mail em rotas separadas passariam de 15 e o
   deploy falharia. Aqui tudo entra em UMA função.

   Ficam de fora, por necessidade e não por gosto:
   · `/api/oauth-callback` — o Google exige uma URL de retorno fixa e própria;
   · `/api/cron` — o agendador da Vercel chama um caminho fixo.

   AUTENTICAÇÃO: o `middleware.ts` cobre `/admin*` mas NÃO cobre `/api/*` —
   por isso a checagem de sessão é feita aqui dentro, e não pode ser removida
   confiando no middleware.
   ──────────────────────────────────────────────────────────────────────────── */

const MODULOS: Record<string, (action: string, ctx: Ctx) => Promise<Record<string, unknown>>> = {
  crm: modCrm,
  financeiro: modFinanceiro,
};

export async function POST(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ ok: false, error: "Sessão expirada. Entre de novo." }, { status: 401 });
  }

  const url = new URL(req.url);
  const modulo = url.searchParams.get("module") || "";
  const handler = MODULOS[modulo];
  if (!handler) {
    return NextResponse.json({ ok: false, error: `Módulo desconhecido: ${modulo}` }, { status: 404 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Banco não configurado (faltam as variáveis do Supabase)." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    /* corpo vazio é válido para ações de leitura */
  }

  const action = String(url.searchParams.get("action") || body.action || "");

  try {
    const r = await handler(action, { supabase, body });
    const status = typeof r.status === "number" ? (r.status as number) : r.ok === false ? 400 : 200;
    delete r.status;
    return NextResponse.json(r, { status });
  } catch (e) {
    // Erro inesperado não pode vazar detalhe de banco para o navegador.
    console.error(`[api/app] ${modulo}.${action}`, e);
    return NextResponse.json({ ok: false, error: "Erro interno ao processar." }, { status: 500 });
  }
}

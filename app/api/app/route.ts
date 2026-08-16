import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { requireUser, type Ctx } from "@/lib/modules/_shared";
import { userCanAccess } from "@/lib/permissions";
import { modCrm } from "@/lib/modules/mod-crm";
import { modFinanceiro } from "@/lib/modules/mod-financeiro";
import { modCobrancas } from "@/lib/modules/mod-cobrancas";
import { modUsuarios } from "@/lib/modules/mod-usuarios";
import { modAgenda } from "@/lib/modules/mod-agenda";
import { modRelatorios } from "@/lib/modules/mod-relatorios";
import { modAutomacoes } from "@/lib/modules/mod-automacoes";
import { modAfiliados } from "@/lib/modules/mod-afiliados";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────────────────────────
   ROTEADOR ÚNICO do painel — `POST /api/app?module=X&action=Y`

   Por que não uma rota por recurso: a Vercel no plano Hobby aceita no máximo
   12 funções serverless e cada `route.ts` vira uma. O site usa 7 (as duas
   rotas legadas de admin — leads e charge — foram absorvidas aqui). CRM,
   financeiro, cobranças, usuários, agenda, relatórios e automações em rotas
   separadas passariam de 15 e o deploy falharia. Aqui tudo entra em UMA função.

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
  cobrancas: modCobrancas,
  usuarios: modUsuarios,
  agenda: modAgenda,
  relatorios: modRelatorios,
  automacoes: modAutomacoes,
  // Chave "afiliado" (singular) de propósito: é o nome já registrado em
  // MODULE_ACCESS de lib/permissions.ts. O arquivo do módulo se chama
  // mod-afiliados.ts (plural) só por convenção de nome de arquivo.
  afiliado: modAfiliados,
};

/* ─────────────────────────────────────────────────────────────────────────────
   Ações que rodam SEM sessão. Lista fechada, no formato `modulo:acao`.

   Só entra aqui o que, por definição, acontece antes de existir login: aceitar
   o convite é o usuário criando a própria senha — ele ainda não tem sessão
   nenhuma. A própria ação valida o token do convite (hash + prazo), então
   "público" não significa "sem prova": significa que a prova é o token, não o
   cookie.

   O clique de afiliado (`afiliado:clique`) entra pelo MESMO motivo: acontece
   na primeira visita de um estranho ao site, que não tem sessão nenhuma. A
   ação em si não confia no `code` da URL — ela confere no banco se o código
   existe antes de gravar qualquer coisa (ver mod-afiliados.ts).

   ⚠️ Nunca adicione aqui uma ação que LEIA ou ALTERE dados de negócio.
   ──────────────────────────────────────────────────────────────────────────── */
const PUBLIC_ACTIONS = new Set<string>(["usuarios:aceitar-convite", "afiliado:clique"]);

export async function POST(req: Request) {
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

  // Só usado hoje pelo módulo de afiliados (hash de clique, ver
  // mod-afiliados.ts). Fica extraído aqui porque é o único lugar do roteador
  // com acesso ao `Request` cru — os módulos só recebem `Ctx`.
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || null;

  const ctx: Ctx = { supabase, body, user: null, ip };

  if (!PUBLIC_ACTIONS.has(`${modulo}:${action}`)) {
    const user = await requireUser(supabase);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Sessão expirada. Entre de novo." }, { status: 401 });
    }
    if (!userCanAccess(user, modulo)) {
      return NextResponse.json(
        { ok: false, error: "Seu acesso não inclui este módulo. Fale com o administrador." },
        { status: 403 }
      );
    }
    ctx.user = user;
  }

  try {
    const r = await handler(action, ctx);
    const status = typeof r.status === "number" ? (r.status as number) : r.ok === false ? 400 : 200;
    delete r.status;
    return NextResponse.json(r, { status });
  } catch (e) {
    // Erro inesperado não pode vazar detalhe de banco para o navegador.
    console.error(`[api/app] ${modulo}.${action}`, e);
    return NextResponse.json({ ok: false, error: "Erro interno ao processar." }, { status: 500 });
  }
}

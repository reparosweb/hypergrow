import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────────────────────────
   ROTEADOR ÚNICO do Hyper QR Code — `POST /api/qrcode?action=Y`

   Mesmo motivo do roteador do painel (app/api/app/route.ts): a Vercel Hobby
   aceita só 12 funções serverless. O site já usa 9 antes desta rota — esta é
   a 10ª. Todo endpoint futuro do produto (Asaas, ações que exigem segredo de
   servidor) entra AQUI dentro, nunca em route.ts novo.

   ⚠️ AUTENTICAÇÃO DIFERENTE do resto do site: este produto usa Supabase Auth
   de verdade (cliente final, cadastro público) — NÃO o cookie de sessão do
   painel admin (`lib/auth.ts`/`requireUser` de `lib/modules/_shared.ts`, que é
   pra equipe interna da agência). Aqui a prova é o token JWT do Supabase Auth
   no header `Authorization: Bearer <token>`, que o cliente já guarda sozinho
   (supabase-js cuida disso). Os dois sistemas de login NUNCA se misturam.

   CRUD simples de QR Code (criar/listar/editar/pausar) NÃO passa por aqui —
   vai direto do navegador via Supabase PostgREST + RLS (ver
   supabase/009_hyper_qrcode.sql), sem gastar function nenhuma. Só entra
   aqui o que precisa de segredo de servidor: chamar a API do Asaas, e
   resolver preço (nunca confiando no valor vindo do navegador — mesma
   lição do FIX 2026-08-23 do Agentop, documentada na migration).

   ── STATUS DESTE ARQUIVO (Passo 2 do plano aprovado) ────────────────────────
   Ações de LEITURA (perfil, assinatura) já funcionam de ponta a ponta.
   Ações de PAGAMENTO (Asaas) ainda são um esqueleto que devolve
   "ainda não implementado" — entram no Passo 6 do plano (Planos + Asaas),
   quando as env vars HQR_ASAAS_* existirem. Preferível a fingir que
   funciona: nenhuma ação aqui promete o que ainda não faz de verdade.
   ──────────────────────────────────────────────────────────────────────────── */

type CtxHqr = { supabase: NonNullable<ReturnType<typeof getServerSupabase>>; userId: string; body: Record<string, unknown> };

async function autenticar(req: Request, supabase: NonNullable<ReturnType<typeof getServerSupabase>>): Promise<string | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

// ── Ações ───────────────────────────────────────────────────────────────────

async function acaoMeuPerfil({ supabase, userId }: CtxHqr) {
  const { data, error } = await supabase.from("hqr_profiles").select("id,nome,telefone,documento,criado_em").eq("id", userId).maybeSingle();
  if (error) return { ok: false, error: "Não foi possível carregar o perfil.", status: 500 };
  return { ok: true, perfil: data };
}

async function acaoMinhaAssinatura({ supabase, userId }: CtxHqr) {
  const { data, error } = await supabase
    .from("hqr_assinaturas")
    .select("plano_slug,status,periodo_atual_fim,hqr_planos(nome,limite_qrcodes,preco_centavos)")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return { ok: false, error: "Não foi possível carregar a assinatura.", status: 500 };
  // Sem linha ainda = nunca assinou (não é erro; painel mostra "escolha um plano").
  return { ok: true, assinatura: data };
}

async function acaoAindaNaoImplementado() {
  return { ok: false, error: "Esta ação ainda não está disponível — faz parte de uma etapa futura do produto.", status: 501 };
}

const ACOES: Record<string, (ctx: CtxHqr) => Promise<Record<string, unknown>>> = {
  meuPerfil: acaoMeuPerfil,
  minhaAssinatura: acaoMinhaAssinatura,
  // Passo 6 do plano aprovado (Planos + Asaas): criarAssinaturaPix,
  // criarAssinaturaCartao, comprarAvulso, cancelarAssinatura.
  criarAssinaturaPix: acaoAindaNaoImplementado,
  comprarAvulso: acaoAindaNaoImplementado,
  cancelarAssinatura: acaoAindaNaoImplementado,
};

export async function POST(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";
  const handler = ACOES[action];
  if (!handler) {
    return NextResponse.json({ ok: false, error: `Ação desconhecida: ${action}` }, { status: 404 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Banco não configurado (faltam as variáveis do Supabase)." }, { status: 503 });
  }

  const userId = await autenticar(req, supabase);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Sessão expirada ou inválida. Entre novamente." }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    /* corpo vazio é válido para ações de leitura */
  }

  try {
    const r = await handler({ supabase, userId, body });
    const status = typeof r.status === "number" ? (r.status as number) : r.ok === false ? 400 : 200;
    delete r.status;
    return NextResponse.json(r, { status });
  } catch (e) {
    console.error(`[api/qrcode] ${action}`, e);
    return NextResponse.json({ ok: false, error: "Erro interno ao processar." }, { status: 500 });
  }
}

import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySession } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase";

/* ─────────────────────────────────────────────────────────────────────────────
   Base compartilhada dos módulos do painel.

   POR QUE EXISTE UM ROTEADOR EM VEZ DE UMA ROTA POR RECURSO:
   a Vercel no plano Hobby permite no máximo 12 funções serverless, e cada
   `route.ts` do App Router vira uma função. O site já usa 8. CRM + financeiro
   + agenda + Google + e-mail + cron passariam de 15 e o deploy simplesmente
   falharia. Por isso um único `/api/app?module=X` despacha para os módulos
   daqui — mesmo padrão que o Agentop adotou pela mesma restrição.
   Só duas coisas ficam fora, por necessidade real: o callback do OAuth
   (o Google exige URL fixa própria) e o cron.
   ──────────────────────────────────────────────────────────────────────────── */

export type Ctx = {
  supabase: NonNullable<ReturnType<typeof getServerSupabase>>;
  body: Record<string, unknown>;
};

export type ModResult = { status?: number; [k: string]: unknown };

/** Sessão do painel. O middleware só confere a PRESENÇA do cookie na borda;
 *  a assinatura é validada aqui, com Node crypto. */
export function isAuthed(): boolean {
  return verifySession(cookies().get(ADMIN_COOKIE)?.value);
}

export function ok(data: ModResult = {}): ModResult {
  return { ok: true, ...data };
}

export function fail(error: string, status = 400): ModResult {
  return { ok: false, error, status };
}

/** Converte "12,50" ou "R$ 1.234,56" em número. O formulário é brasileiro;
 *  `Number("1.234,56")` devolve NaN e gravaria lixo no banco. */
export function parseValor(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v !== "string") return null;
  const limpo = v.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

export function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function str(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

/* ── Guarda contra gravação silenciosa ────────────────────────────────────────
   Este projeto já teve o bug de "salvou mas não salvou": a chamada não dá erro,
   mas o RLS recusou e nenhuma linha foi tocada. Toda mutação passa por aqui —
   se voltou zero linha, é falha, não sucesso.
   (Mesmo cuidado que o Agentop tomou depois de sofrer com isso.) */
export function assertGravou<T>(data: T[] | null, erro: unknown, oQue: string): T[] {
  if (erro) throw new Error(`${oQue}: ${(erro as { message?: string })?.message || "erro no banco"}`);
  if (!data || data.length === 0) {
    throw new Error(`${oQue}: nenhuma linha foi gravada — sessão expirada ou permissão negada no banco.`);
  }
  return data;
}

/** Trilha de auditoria. Nunca derruba a operação principal: se o log falhar,
 *  a receita continua lançada. */
export async function logFinanceiro(
  ctx: Ctx,
  action: string,
  entity: string,
  entityId: string | null,
  details: Record<string, unknown> = {}
) {
  try {
    await ctx.supabase.from("finance_logs").insert({ action, entity, entity_id: entityId, details });
  } catch {
    /* silencioso de propósito — ver comentário acima */
  }
}

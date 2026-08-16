import { cookies } from "next/headers";
import { ADMIN_COOKIE, ENV_SUPER_ID, verifySession } from "@/lib/auth";
import { modulosEfetivos, isPapel, type UsuarioSessao } from "@/lib/permissions";
import { getServerSupabase } from "@/lib/supabase";

/* ─────────────────────────────────────────────────────────────────────────────
   Base compartilhada dos módulos do painel.

   POR QUE EXISTE UM ROTEADOR EM VEZ DE UMA ROTA POR RECURSO:
   a Vercel no plano Hobby permite no máximo 12 funções serverless, e cada
   `route.ts` do App Router vira uma função. O site já usa 7. CRM + financeiro
   + cobranças + agenda + relatórios + usuários + automações em rotas separadas
   passariam de 15 e o deploy simplesmente falharia. Por isso um único
   `/api/app?module=X` despacha para os módulos daqui — mesmo padrão que o
   Agentop adotou pela mesma restrição.
   Só duas coisas ficam fora, por necessidade real: o callback do OAuth
   (o Google exige URL fixa própria) e o cron.
   ──────────────────────────────────────────────────────────────────────────── */

export type Supa = NonNullable<ReturnType<typeof getServerSupabase>>;

export type Ctx = {
  supabase: Supa;
  body: Record<string, unknown>;
  /** Quem está logado. `null` só nas ações da whitelist PUBLIC_ACTIONS do
   *  roteador (hoje: aceitar convite e o clique de afiliado, que acontecem
   *  antes de existir sessão). */
  user: UsuarioSessao | null;
  /** IP do visitante (de `x-forwarded-for`), já extraído pelo roteador. Só o
   *  módulo de afiliados usa isto hoje (para o hash de clique, ver
   *  mod-afiliados.ts) — `null` quando o header não vem no request. */
  ip?: string | null;
};

export type ModResult = { status?: number; [k: string]: unknown };

/* ─────────────────────────────────────────────────────────────────────────────
   requireUser — a porta de entrada de tudo no painel.

   Valida o cookie assinado e, em seguida, RECONFERE o usuário no banco. Por que
   não confiar só no token: se alguém for bloqueado ou rebaixado, o token dele
   continua válido até expirar (12h). Uma leitura por chave primária custa
   quase nada e faz o bloqueio valer no próximo clique.

   O `ENV_SUPER_ID` ("break-glass") não tem linha no banco de propósito — é o
   acesso de emergência do dono pela ADMIN_PASSWORD da Vercel. Consultar o banco
   por ele daria erro (não é UUID), então ele é resolvido antes.
   ──────────────────────────────────────────────────────────────────────────── */
export async function requireUser(supabase: Supa | null): Promise<UsuarioSessao | null> {
  const sessao = verifySession(cookies().get(ADMIN_COOKIE)?.value);
  if (!sessao) return null;

  /* O break-glass é resolvido ANTES de tocar no banco de propósito: se o
     Supabase estiver fora do ar ou sem variáveis, o dono ainda consegue abrir
     o painel e ver os avisos de "banco não configurado" em vez de levar um
     redirect para o login sem explicação. */
  if (sessao.userId === ENV_SUPER_ID) {
    return {
      id: ENV_SUPER_ID,
      email: (process.env.ADMIN_EMAIL || "admin@hypergrow").toLowerCase(),
      name: "Acesso de emergência",
      role: "super",
      modules: ["*"],
    };
  }

  if (!supabase) return null;

  const { data, error } = await supabase
    .from("admin_users")
    .select("id,email,name,role,status,allowed_modules")
    .eq("id", sessao.userId)
    .maybeSingle();

  if (error || !data) return null;
  if (data.status !== "ativo") return null; // bloqueado ou convite não aceito
  if (!isPapel(data.role)) return null;

  return {
    id: data.id as string,
    email: String(data.email || "").toLowerCase(),
    name: (data.name as string | null) ?? null,
    role: data.role,
    modules: modulosEfetivos(data.role, data.allowed_modules),
  };
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

/** Data no formato AAAA-MM-DD (o que o Postgres espera em coluna `date`). */
export function dataISO(v: unknown): string | null {
  const s = str(v, 10);
  return s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
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
 *  a receita continua lançada.
 *
 *  `user_email` era gravado VAZIO até a Frente C — a coluna existia desde
 *  `005_financeiro.sql` mas ninguém a preenchia, então a trilha não respondia
 *  "quem fez". Agora sai o e-mail de quem estava logado. */
export async function logFinanceiro(
  ctx: Ctx,
  action: string,
  entity: string,
  entityId: string | null,
  details: Record<string, unknown> = {}
) {
  try {
    await ctx.supabase.from("finance_logs").insert({
      action,
      entity,
      entity_id: entityId,
      details,
      user_email: ctx.user?.email ?? null,
    });
  } catch {
    /* silencioso de propósito — ver comentário acima */
  }
}

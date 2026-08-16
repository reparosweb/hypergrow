/* ─────────────────────────────────────────────────────────────────────────────
   Papéis e módulos do painel — fonte ÚNICA de "quem pode ver o quê".

   Sem nenhum import de propósito: este arquivo é lido pelo servidor (roteador
   `/api/app`) E pelo navegador (a barra lateral esconde o que o usuário não
   pode abrir). Se ele dependesse de `node:crypto` ou do Supabase, não daria
   para usar nos dois lados.

   ⚠️ A barra lateral esconder um item NÃO é segurança — é conforto. A regra
   que vale é a checagem no servidor, em `app/api/app/route.ts`, antes de
   despachar para o módulo. Mudar só a lista da tela não libera nada.
   ──────────────────────────────────────────────────────────────────────────── */

export const PAPEIS = ["super", "operador", "afiliado", "cliente"] as const;
export type Papel = (typeof PAPEIS)[number];

export const ROTULO_PAPEL: Record<Papel, string> = {
  super: "Administrador",
  operador: "Operador",
  afiliado: "Afiliado",
  cliente: "Cliente",
};

/** Módulos existentes. O nome é o mesmo do `?module=` do roteador. */
export const MODULOS = [
  "crm",
  "cobrancas",
  "financeiro",
  "relatorios",
  "agenda",
  "usuarios",
  "afiliado",
  "automacoes",
] as const;
export type Modulo = (typeof MODULOS)[number];

export const ROTULO_MODULO: Record<Modulo, string> = {
  crm: "CRM / Leads",
  cobrancas: "Cobranças",
  financeiro: "Financeiro",
  relatorios: "Relatórios",
  agenda: "Agenda e Meu dia",
  usuarios: "Usuários",
  afiliado: "Área do afiliado",
  automacoes: "Automações",
};

/** Módulos que cada papel recebe quando `allowed_modules` está vazio no banco. */
export const DEFAULT_MODULES: Record<Papel, string[]> = {
  super: ["*"],
  operador: ["crm", "agenda", "relatorios"],
  afiliado: ["afiliado"],
  // Ainda não existe área do cliente. Deixar vazio é honesto: quem tem este
  // papel entra e não vê módulo nenhum, em vez de ver uma tela que não é dele.
  cliente: [],
};

/* Teto por módulo: quais papéis PODEM receber cada um. É o freio que impede o
   super de, por engano, marcar "usuarios" para um operador e entregar a gestão
   de acessos (e os hashes de senha) para quem não deveria. */
export const MODULE_ACCESS: Record<Modulo, Papel[]> = {
  crm: ["super", "operador"],
  cobrancas: ["super", "operador"],
  financeiro: ["super"],
  relatorios: ["super", "operador"],
  agenda: ["super", "operador"],
  usuarios: ["super"],
  afiliado: ["super", "afiliado"],
  automacoes: ["super"],
};

/** O usuário logado, do jeito que o resto do sistema enxerga. */
export type UsuarioSessao = {
  id: string;
  email: string;
  name: string | null;
  role: Papel;
  /** Já resolvido: `allowed_modules` do banco OU o padrão do papel. */
  modules: string[];
};

export function isPapel(v: unknown): v is Papel {
  return typeof v === "string" && (PAPEIS as readonly string[]).includes(v);
}

/** Resolve os módulos efetivos: o que está gravado no usuário vence; se não
 *  houver nada gravado, vale o padrão do papel. */
export function modulosEfetivos(role: Papel, allowed: unknown): string[] {
  if (Array.isArray(allowed) && allowed.length > 0) {
    return allowed.filter((m): m is string => typeof m === "string");
  }
  return DEFAULT_MODULES[role] ?? [];
}

/** A pergunta que o roteador faz antes de despachar. */
export function userCanAccess(user: Pick<UsuarioSessao, "role" | "modules">, modulo: string): boolean {
  const permitidos = MODULE_ACCESS[modulo as Modulo];
  if (!permitidos) return false; // módulo desconhecido: nega por padrão
  if (!permitidos.includes(user.role)) return false; // teto do papel
  if (user.modules.includes("*")) return true;
  return user.modules.includes(modulo);
}

/** Módulos que um papel pode receber — usado na tela de usuários para montar
 *  as caixinhas de permissão sem oferecer o que o papel nunca poderá abrir. */
export function modulosDisponiveisPara(role: Papel): Modulo[] {
  return MODULOS.filter((m) => MODULE_ACCESS[m].includes(role));
}

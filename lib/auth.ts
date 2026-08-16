import crypto from "crypto";
import { ADMIN_COOKIE, SESSAO_TTL_MS, ENV_SUPER_ID, ROTAS_ADMIN_PUBLICAS } from "./auth-constants";
import { isPapel, type Papel } from "./permissions";

/* Reexportado para não quebrar quem já importava daqui. O middleware, porém,
   deve importar de `lib/auth-constants` — este arquivo carrega node:crypto e
   não pode entrar no bundle da borda. */
export { ADMIN_COOKIE, SESSAO_TTL_MS, ENV_SUPER_ID, ROTAS_ADMIN_PUBLICAS };

function secret(): string {
  return process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export type Sessao = { userId: string; role: Papel; exp: number };

/* ─────────────────────────────────────────────────────────────────────────────
   TOKEN v2 — `v2.{userId}.{role}.{exp}.{assinatura}` (5 partes).

   O v1 era `admin.{exp}.{assinatura}`: só dizia "é o admin", não QUEM é. Com
   vários usuários isso não serve — o log de auditoria precisa do e-mail e o
   roteador precisa do papel. Como o formato mudou, todo token v1 emitido antes
   do deploy passa a ser inválido: quem estiver logado precisa entrar de novo.
   É aceito de propósito (hoje existe 1 usuário e a sessão dura 12h).

   O `role` viaja no token só para atalho de leitura; a decisão real de permissão
   é sempre reconferida no banco em `requireUser` (uma linha em admin_users).
   Assim, bloquear ou rebaixar alguém tem efeito IMEDIATO, sem esperar o token
   expirar.
   ──────────────────────────────────────────────────────────────────────────── */

function assinar(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function signSession(userId: string, role: Papel, ttlMs = SESSAO_TTL_MS): string {
  const exp = Date.now() + ttlMs;
  const payload = `v2.${userId}.${role}.${exp}`;
  return `${payload}.${assinar(payload)}`;
}

export function verifySession(token?: string | null): Sessao | null {
  if (!token || !secret()) return null;
  const parts = token.split(".");
  if (parts.length !== 5) return null; // token v1 (3 partes) cai aqui e é recusado
  const [versao, userId, role, exp, sig] = parts;
  if (versao !== "v2" || !userId || !isPapel(role)) return null;

  const esperado = assinar(`${versao}.${userId}.${role}.${exp}`);
  if (sig.length !== esperado.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(esperado))) return null;

  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Date.now()) return null;

  return { userId, role, exp: expNum };
}

/* ─────────────────────────────────────────────────────────────────────────────
   SENHA — scrypt do próprio Node. Nenhuma dependência nova entra no projeto.

   O formato gravado é autodescritivo:
       scrypt$N$r$p$salt_base64$hash_base64
   Guardar os parâmetros junto do hash permite endurecer o custo no futuro sem
   invalidar as senhas já cadastradas: a verificação usa os parâmetros da
   própria linha, não os constantes de hoje.
   ──────────────────────────────────────────────────────────────────────────── */

const SCRYPT_N = 16384; // custo de CPU/memória (~16 MB por hash)
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_LEN = 64;

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain, salt, SCRYPT_LEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64"),
    hash.toString("base64"),
  ].join("$");
}

export function verifyPassword(plain: string, stored?: string | null): boolean {
  if (!plain || !stored) return false;
  const p = stored.split("$");
  if (p.length !== 6 || p[0] !== "scrypt") return false;

  const N = Number(p[1]);
  const r = Number(p[2]);
  const par = Number(p[3]);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(par)) return false;

  try {
    const salt = Buffer.from(p[4], "base64");
    const esperado = Buffer.from(p[5], "base64");
    const calculado = crypto.scryptSync(plain, salt, esperado.length, { N, r, p: par });
    return crypto.timingSafeEqual(calculado, esperado);
  } catch {
    return false;
  }
}

/** Comparação de texto em tempo constante — usada no break-glass da
 *  ADMIN_PASSWORD, que é comparação de senha em claro e não pode vazar o
 *  tamanho/prefixo pelo tempo de resposta. */
export function segredoIgual(a: string, b: string): boolean {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONVITE — o link que o super manda por WhatsApp.

   Alfabeto sem 0/O/1/I/L: o dono lê o código em voz alta ou digita à mão
   quando o link quebra no WhatsApp; esses caracteres são os que se confundem.
   No banco fica só o SHA-256 — quem tiver acesso à tabela não consegue usar o
   convite de ninguém.
   ──────────────────────────────────────────────────────────────────────────── */

const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function gerarTokenConvite(tamanho = 32): string {
  const bytes = crypto.randomBytes(tamanho);
  let out = "";
  for (let i = 0; i < tamanho; i++) out += ALFABETO[bytes[i] % ALFABETO.length];
  return out;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

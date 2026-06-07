import crypto from "crypto";

export const ADMIN_COOKIE = "hg_admin";

function secret(): string {
  return process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

// Cria um token de sessão assinado (HMAC-SHA256). Sem banco de sessão.
export function signSession(ttlMs = 1000 * 60 * 60 * 12): string {
  const exp = Date.now() + ttlMs;
  const payload = `admin.${exp}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySession(token?: string | null): boolean {
  if (!token || !secret()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, exp, sig] = parts;
  const payload = `${role}.${exp}`;
  const expect = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  if (sig.length !== expect.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return false;
  if (Number(exp) < Date.now()) return false;
  return role === "admin";
}

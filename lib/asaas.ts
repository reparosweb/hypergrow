// Cliente Asaas (cobrança) — metodologia extraída do Sorteio Bilionário, adaptada
// para o Next App Router (fetch, sem axios). Tudo env-driven.

export const ASAAS_BASE = process.env.ASAAS_BASE || "https://www.asaas.com/api/v3";

export function asaasReady(): boolean {
  return !!process.env.ASAAS_API_KEY;
}

export function asaasHeaders(): Record<string, string> {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error("ASAAS_API_KEY não configurada");
  return { "Content-Type": "application/json", access_token: key };
}

/** Asaas rejeita emoji/em-dash/aspas curvas/bullets — mantém ASCII + acentos PT. */
export function sanitizeAsaas(s: string, maxLen = 200): string {
  return String(s ?? "")
    .replace(/[‐-―−]/g, "-")
    .replace(/[‘’“”]/g, "'")
    .replace(/[·•●◦▪]/g, "-")
    .replace(/[^\w\s.,:;!?\-()\/+'&áàâãéèêíïóôõöúüçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÜÇñÑ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

export function isValidCpfCnpj(v: string): boolean {
  const d = String(v).replace(/\D/g, "");
  return d.length === 11 || d.length === 14;
}

async function asaasFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${ASAAS_BASE}${path}`, {
    ...init,
    headers: { ...asaasHeaders(), ...(init?.headers || {}) },
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  if (!res.ok) {
    const msg = json?.errors?.[0]?.description || json?.message || `Asaas ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

/** Cria ou reutiliza o cliente Asaas por e-mail. */
export async function getOrCreateCustomer(p: { name: string; email: string; cpfCnpj: string; externalReference?: string }) {
  const found = await asaasFetch(`/customers?email=${encodeURIComponent(p.email)}`);
  if (found?.data?.length > 0) return found.data[0].id as string;
  const created = await asaasFetch(`/customers`, {
    method: "POST",
    body: JSON.stringify({ name: p.name, email: p.email, cpfCnpj: p.cpfCnpj.replace(/\D/g, ""), externalReference: p.externalReference }),
  });
  return created.id as string;
}

/** Cria cobrança avulsa (PIX/cartão/boleto). */
export async function createPayment(p: {
  customer: string; billingType: "PIX" | "CREDIT_CARD" | "BOLETO"; value: number; dueDate: string; description: string; externalReference?: string;
}) {
  return asaasFetch(`/payments`, { method: "POST", body: JSON.stringify(p) });
}

/** Busca o QR Code PIX de uma cobrança. */
export async function getPixQrCode(chargeId: string) {
  return asaasFetch(`/payments/${chargeId}/pixQrCode`);
}

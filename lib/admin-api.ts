/* Chamada única para o roteador do painel. Existia copiada dentro de CrmView e
   de Financeiro; as telas novas usam esta. Lança com a mensagem que o servidor
   mandou — quem chama decide como mostrar. */
export async function chamarApi<T = Record<string, unknown>>(
  modulo: string,
  action: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const r = await fetch(`/api/app?module=${encodeURIComponent(modulo)}&action=${encodeURIComponent(action)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({ ok: false, error: "Resposta inválida do servidor." }));
  if (!r.ok || j.ok === false) throw new Error(j.error || "Falha na operação.");
  return j as T;
}

export const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function fmtData(v: string | null | undefined): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  } catch {
    return "—";
  }
}

export function fmtDataHora(v: string | null | undefined): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function fmtHora(v: string | null | undefined): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

/* ── Fuso horário: converter nos DOIS sentidos ────────────────────────────────
   O <input type="datetime-local"> fala em horário LOCAL sem fuso ("2026-08-15T14:00").
   O banco guarda instante com fuso (timestamptz). A conversão precisa acontecer
   no NAVEGADOR: o servidor da Vercel roda em UTC e transformaria 14:00 de
   Brasília em 14:00 UTC (11:00 no relógio do dono). */
export function localParaISO(valorInput: string): string | null {
  if (!valorInput) return null;
  const d = new Date(valorInput);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function isoParaLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Copy, Check, AlertTriangle, RefreshCw } from "lucide-react";

export type Charge = {
  id: string;
  charge_id: string;
  customer_name: string | null;
  customer_email: string | null;
  value: number | null;
  billing_type: string | null;
  status: string | null;
  invoice_url: string | null;
  pix_payload: string | null;
  pix_qr: string | null;
  description: string | null;
  created_at: string;
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "#f59e0b", RECEIVED: "#22c55e", CONFIRMED: "#22c55e",
  OVERDUE: "#ef4444", REFUNDED: "#64748b", CHARGEBACK: "#ef4444", CANCELLED: "#64748b",
};

export default function Billing({ initialCharges, asaasReady, dbReady }: { initialCharges: Charge[]; asaasReady: boolean; dbReady: boolean }) {
  const router = useRouter();
  const [charges, setCharges] = useState<Charge[]>(initialCharges);
  const [form, setForm] = useState({ name: "", email: "", cpf: "", value: "", billingType: "PIX", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Sincroniza a lista quando o servidor recarrega (botão Atualizar / router.refresh).
  useEffect(() => { setCharges(initialCharges); }, [initialCharges]);

  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/admin/charge", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, value: parseFloat(form.value) }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setResult(json);
        router.refresh();
      } else setError(json.error || "Erro ao criar cobrança.");
    } catch { setError("Sem conexão."); }
    finally { setLoading(false); }
  }

  function copyPix() {
    if (result?.pixPayload) { navigator.clipboard.writeText(result.pixPayload); setCopied(true); setTimeout(() => setCopied(false), 1800); }
  }

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan text-white">H</span>
            Hyper<span className="gradient-text">grow</span><span className="ml-1 text-xs font-normal text-slate-500">· Cobranças</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.refresh()} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"><RefreshCw size={15} /> Atualizar</button>
            <a href="/admin" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"><ArrowLeft size={15} /> Pipeline</a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-4 py-6">
        {(!asaasReady || !dbReady) && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <AlertTriangle size={16} />
            {!asaasReady ? "Asaas não configurado — defina ASAAS_API_KEY na Vercel." : "Tabela 'charges' não encontrada — rode supabase/002_charges.sql."}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* form */}
          <form onSubmit={submit} className="h-fit rounded-2xl border border-white/10 bg-ink-800/70 p-5">
            <h2 className="font-display text-lg font-bold text-white">Nova cobrança</h2>
            <div className="mt-4 space-y-3">
              <input required placeholder="Nome do cliente" value={form.name} onChange={set("name")} className="input" />
              <input required type="email" placeholder="E-mail" value={form.email} onChange={set("email")} className="input" />
              <input required placeholder="CPF/CNPJ" value={form.cpf} onChange={set("cpf")} className="input" />
              <div className="flex gap-2">
                <input required type="number" step="0.01" min="5" placeholder="Valor (R$)" value={form.value} onChange={set("value")} className="input" />
                <select value={form.billingType} onChange={set("billingType")} className="input">
                  <option value="PIX">PIX</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="CREDIT_CARD">Cartão</option>
                </select>
              </div>
              <input placeholder="Descrição (opcional)" value={form.description} onChange={set("description")} className="input" />
            </div>
            {error && <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
            <button type="submit" disabled={loading} className="shine mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-violet px-6 py-3 font-semibold text-white disabled:opacity-60">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null} Gerar cobrança
            </button>

            {result && (
              <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                <p className="text-sm font-semibold text-emerald-300">Cobrança criada!</p>
                {result.pixQr && <img src={`data:image/png;base64,${result.pixQr}`} alt="QR PIX" className="mx-auto mt-3 h-44 w-44 rounded-lg bg-white p-1" />}
                {result.pixPayload && (
                  <button onClick={copyPix} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10">
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copiado!" : "Copiar código PIX"}
                  </button>
                )}
                {result.invoiceUrl && <a href={result.invoiceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-center text-xs text-brand-300 underline">Abrir fatura</a>}
              </div>
            )}
          </form>

          {/* list */}
          <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-5">
            <h2 className="font-display text-lg font-bold text-white">Cobranças ({charges.length})</h2>
            <div className="mt-4 space-y-2">
              {charges.length === 0 && <p className="text-sm text-slate-500">Nenhuma cobrança ainda.</p>}
              {charges.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-ink-900/50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{c.customer_name || c.customer_email}</p>
                    <p className="truncate text-xs text-slate-500">{c.description} · {c.billing_type}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold text-white">R$ {Number(c.value || 0).toFixed(2)}</span>
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: `${STATUS_COLOR[c.status || "PENDING"]}22`, color: STATUS_COLOR[c.status || "PENDING"] }}>{c.status}</span>
                    {c.invoice_url && <a href={c.invoice_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-300 underline">fatura</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

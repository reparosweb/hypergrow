"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw, Mail, Phone, Tag, AlertTriangle } from "lucide-react";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  product: string | null;
  message: string | null;
  source: string | null;
  status: string | null;
  created_at: string;
};

const STAGES: { key: string; label: string; color: string }[] = [
  { key: "novo", label: "Novo", color: "#6366f1" },
  { key: "em_contato", label: "Em contato", color: "#06b6d4" },
  { key: "reuniao", label: "Reunião agendada", color: "#a855f7" },
  { key: "proposta", label: "Proposta enviada", color: "#f59e0b" },
  { key: "cliente", label: "Cliente", color: "#22c55e" },
  { key: "descartado", label: "Descartado", color: "#64748b" },
];

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  } catch {
    return "";
  }
}

export default function Kanban({ initialLeads, dbError }: { initialLeads: Lead[]; dbError?: boolean }) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [busy, setBusy] = useState<string | null>(null);

  const byStage = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    STAGES.forEach((s) => (map[s.key] = []));
    leads.forEach((l) => {
      const k = l.status && map[l.status] ? l.status : "novo";
      map[k].push(l);
    });
    return map;
  }, [leads]);

  async function move(id: string, status: string) {
    const prev = leads;
    setBusy(id);
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) setLeads(prev);
    } catch {
      setLeads(prev);
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan text-white">H</span>
            Hyper<span className="gradient-text">grow</span>
            <span className="ml-1 text-xs font-normal text-slate-500">· CRM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-400 sm:block">{leads.length} leads</span>
            <button
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              <RefreshCw size={15} /> Atualizar
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              <LogOut size={15} /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6">
        {dbError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <AlertTriangle size={16} /> Banco não configurado. Verifique as variáveis do Supabase na Vercel.
          </div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((s) => (
            <div key={s.key} className="flex w-[300px] shrink-0 flex-col">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="font-semibold text-white">{s.label}</span>
                </div>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">
                  {byStage[s.key].length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {byStage[s.key].length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-slate-600">
                    Vazio
                  </div>
                )}
                {byStage[s.key].map((l) => (
                  <article
                    key={l.id}
                    className={`rounded-2xl border border-white/10 bg-ink-800/70 p-4 transition-opacity ${busy === l.id ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white">{l.name}</h3>
                      <span className="shrink-0 text-[10px] text-slate-500">{fmtDate(l.created_at)}</span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-slate-400">
                      <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 hover:text-white">
                        <Mail size={12} /> {l.email}
                      </a>
                      {l.phone && (
                        <a
                          href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-white"
                        >
                          <Phone size={12} /> {l.phone}
                        </a>
                      )}
                      {l.product && (
                        <p className="flex items-center gap-1.5">
                          <Tag size={12} /> {l.product}
                        </p>
                      )}
                    </div>
                    {l.message && (
                      <p className="mt-2 line-clamp-3 rounded-lg bg-ink-900/60 px-3 py-2 text-xs text-slate-400">
                        {l.message}
                      </p>
                    )}
                    <select
                      value={l.status || "novo"}
                      onChange={(e) => move(l.id, e.target.value)}
                      className="mt-3 w-full rounded-lg border border-white/10 bg-ink-900 px-2 py-1.5 text-xs text-white outline-none focus:border-brand-400"
                    >
                      {STAGES.map((st) => (
                        <option key={st.key} value={st.key}>
                          Mover para: {st.label}
                        </option>
                      ))}
                    </select>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

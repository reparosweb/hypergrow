"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut, RefreshCw, Mail, Phone, Tag, AlertTriangle, CreditCard, Plus, Search, X, Trash2,
} from "lucide-react";
import KanbanBoard, { type KanbanStage } from "./KanbanBoard";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  product: string | null;
  message: string | null;
  notes?: string | null;
  owner?: string | null;
  value?: number | null;
  source: string | null;
  status: string | null;
  created_at: string;
};

/* Os 6 estágios vêm do que já existia na API (`ALLOWED_STAGES`). Mudar esta
   lista sem migrar os dados deixa lead numa coluna que não existe mais. */
const STAGES: KanbanStage[] = [
  { key: "novo", label: "Novo", color: "#6366f1" },
  { key: "em_contato", label: "Em contato", color: "#06b6d4" },
  { key: "reuniao", label: "Reunião agendada", color: "#a855f7" },
  { key: "proposta", label: "Proposta enviada", color: "#f59e0b" },
  { key: "cliente", label: "Cliente", color: "#22c55e" },
  { key: "descartado", label: "Descartado", color: "#64748b" },
];

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function fmtData(s: string) {
  try {
    return new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  } catch { return ""; }
}

async function api(action: string, body: Record<string, unknown> = {}) {
  const r = await fetch(`/api/app?module=crm&action=${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({ ok: false, error: "Resposta inválida do servidor." }));
  if (!r.ok || j.ok === false) throw new Error(j.error || "Falha na operação.");
  return j;
}

export default function CrmView({ initialLeads, dbError }: { initialLeads: Lead[]; dbError?: boolean }) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aberto, setAberto] = useState<Lead | null>(null);
  const [novo, setNovo] = useState(false);

  const visiveis = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return leads;
    return leads.filter((l) =>
      [l.name, l.email, l.product, l.owner].some((c) => c?.toLowerCase().includes(t))
    );
  }, [leads, busca]);

  /* Update otimista com rollback: a UI responde na hora, e se o servidor
     recusar o card volta para onde estava. Sem o rollback, uma falha de rede
     deixaria a tela mentindo sobre o estado real do banco. */
  const mover = useCallback(async (id: string, status: string) => {
    const antes = leads;
    setErro(null);
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      await api("move", { id, status });
      return true;
    } catch (e) {
      setLeads(antes);
      setErro((e as Error).message);
      return false;
    }
  }, [leads]);

  async function excluir(l: Lead) {
    if (!confirm(`Excluir o lead "${l.name}"? Isso não pode ser desfeito.`)) return;
    const antes = leads;
    setLeads((ls) => ls.filter((x) => x.id !== l.id));
    setAberto(null);
    try { await api("delete", { id: l.id }); }
    catch (e) { setLeads(antes); setErro((e as Error).message); }
  }

  async function salvar(form: HTMLFormElement, l: Lead | null) {
    const fd = new FormData(form);
    const payload = {
      id: l?.id,
      name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"),
      product: fd.get("product"), owner: fd.get("owner"), value: fd.get("value"),
      notes: fd.get("notes"),
      ...(l ? {} : { status: fd.get("status") }),
    };
    setErro(null);
    try {
      const j = await api(l ? "update" : "create", payload);
      const salvo = j.lead as Lead;
      setLeads((ls) => (l ? ls.map((x) => (x.id === salvo.id ? { ...x, ...salvo } : x)) : [salvo, ...ls]));
      setAberto(null); setNovo(false);
    } catch (e) { setErro((e as Error).message); }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <header className="mb-5 flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-lg font-semibold text-white">Leads</h1>
          <p className="text-sm text-slate-400">{leads.length} no total · arraste os cards entre as colunas</p>
        </div>

        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail…" aria-label="Buscar leads"
            className="h-10 w-56 rounded-xl border border-white/10 bg-ink-900/70 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-400"
          />
        </div>

        <button onClick={() => setNovo(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-400">
          <Plus size={16} /> Novo lead
        </button>
        <button onClick={() => router.refresh()} aria-label="Atualizar" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/5">
          <RefreshCw size={16} />
        </button>
        <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); }}
          aria-label="Sair" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/5">
          <LogOut size={16} />
        </button>
      </header>

      {dbError && (
        <p className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle size={16} /> Banco não configurado — os leads não estão sendo carregados.
        </p>
      )}
      {erro && (
        <p role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <AlertTriangle size={16} /> {erro}
        </p>
      )}

      <KanbanBoard
        stages={STAGES}
        items={visiveis}
        onMove={mover}
        onOpen={(l) => setAberto(l as Lead)}
        emptyLabel="Nenhum lead"
        renderCard={(l) => {
          const lead = l as Lead;
          return (
            <>
              <b className="block text-[13.5px] font-semibold text-white">{lead.name}</b>
              <span className="mt-0.5 block text-[11.5px] text-slate-500">{fmtData(lead.created_at)}</span>
              {typeof lead.value === "number" && lead.value > 0 && (
                <span className="mt-1.5 inline-block rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-300">
                  {BRL.format(lead.value)}
                </span>
              )}
              {lead.product && (
                <span className="mt-1.5 flex items-center gap-1.5 text-[12px] text-slate-400">
                  <Tag size={12} /> {lead.product}
                </span>
              )}
              <div className="mt-2 flex gap-2">
                <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} aria-label={`E-mail para ${lead.name}`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-slate-400 hover:text-white">
                  <Mail size={13} />
                </a>
                {lead.phone && (
                  <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                    onClick={(e) => e.stopPropagation()} aria-label={`WhatsApp de ${lead.name}`}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-slate-400 hover:text-white">
                    <Phone size={13} />
                  </a>
                )}
              </div>
            </>
          );
        }}
      />

      {(aberto || novo) && (
        <div role="dialog" aria-modal="true" aria-label={aberto ? "Editar lead" : "Novo lead"}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) { setAberto(null); setNovo(false); } }}>
          <form
            onSubmit={(e) => { e.preventDefault(); salvar(e.currentTarget, aberto); }}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-ink-950 p-5 sm:rounded-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <h2 className="mr-auto text-base font-semibold text-white">{aberto ? "Editar lead" : "Novo lead"}</h2>
              <button type="button" onClick={() => { setAberto(null); setNovo(false); }} aria-label="Fechar"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo nome="name" rotulo="Nome" valor={aberto?.name} obrigatorio />
              <Campo nome="email" rotulo="E-mail" tipo="email" valor={aberto?.email} obrigatorio />
              <Campo nome="phone" rotulo="WhatsApp" valor={aberto?.phone ?? ""} />
              <Campo nome="product" rotulo="Interesse" valor={aberto?.product ?? ""} />
              <Campo nome="owner" rotulo="Responsável" valor={aberto?.owner ?? ""} />
              <Campo nome="value" rotulo="Valor (R$)" valor={aberto?.value != null ? String(aberto.value) : ""} />
            </div>

            {!aberto && (
              <label className="mt-3 block text-[13px] font-semibold text-slate-300">
                Estágio
                <select name="status" defaultValue="novo"
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-ink-900/70 px-3 text-sm text-white outline-none focus:border-brand-400">
                  {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </label>
            )}

            <label className="mt-3 block text-[13px] font-semibold text-slate-300">
              Anotações internas
              <textarea name="notes" rows={3} defaultValue={aberto?.notes ?? ""}
                className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-ink-900/70 p-3 text-sm text-white outline-none focus:border-brand-400" />
            </label>

            {aberto?.message && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[.03] p-3">
                <span className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">Mensagem do cliente</span>
                <p className="mt-1 whitespace-pre-wrap text-[13.5px] text-slate-300">{aberto.message}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button type="submit" className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-400">
                Salvar
              </button>
              {aberto && (
                <>
                  <a href="/admin/cobrancas" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-slate-200 hover:bg-white/5">
                    <CreditCard size={15} /> Cobrar
                  </a>
                  <button type="button" onClick={() => excluir(aberto)} aria-label="Excluir lead"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10">
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Campo({ nome, rotulo, valor, tipo = "text", obrigatorio }: {
  nome: string; rotulo: string; valor?: string; tipo?: string; obrigatorio?: boolean;
}) {
  return (
    <label className="block text-[13px] font-semibold text-slate-300">
      {rotulo}{obrigatorio && <span className="text-rose-400"> *</span>}
      <input name={nome} type={tipo} defaultValue={valor} required={obrigatorio}
        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-ink-900/70 px-3 text-sm text-white outline-none focus:border-brand-400" />
    </label>
  );
}

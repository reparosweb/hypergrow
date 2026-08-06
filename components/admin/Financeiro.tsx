"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, LogOut, RefreshCw, Plus, X, Trash2, Check, AlertTriangle,
  TrendingUp, TrendingDown, Wallet, FileBarChart, Search,
} from "lucide-react";

export type Categoria = { id: string; name: string; type: string; color: string | null; display_order: number };
export type Receivable = {
  id: string; subject: string; client_name: string | null; lead_id: string | null; charge_id: string | null;
  category_id: string | null; value: number; status: string; payment_method: string | null;
  due_date: string | null; paid_at: string | null; notes: string | null; created_at: string; updated_at: string;
};
export type Payable = {
  id: string; title: string; supplier: string | null; document: string | null; category_id: string | null;
  value: number; status: string; payment_method: string | null; due_date: string | null; paid_at: string | null;
  is_recurring: boolean; notes: string | null; created_at: string; updated_at: string;
};

type ExtratoLinha = { tipo: "receita" | "despesa"; origem: string; id: string; data: string | null; descricao: string; contraparte: string | null; valor: number };
type DreGrupo = { categoria: string; total: number };

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const STATUS_RECEBER = ["pendente", "recebido", "atrasado", "cancelado"] as const;
const STATUS_PAGAR = ["pendente", "pago", "atrasado", "cancelado"] as const;

const COR_STATUS: Record<string, string> = {
  pendente: "#f59e0b", recebido: "#22c55e", pago: "#22c55e", atrasado: "#ef4444", cancelado: "#64748b",
};

function fmtData(s: string | null) {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }); }
  catch { return "—"; }
}

function hojeISO(offsetDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return d.toISOString().slice(0, 10);
}

function inicioMesISO(offsetMeses = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMeses, 1);
  return d.toISOString().slice(0, 10);
}

function fimMesISO(offsetMeses = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMeses + 1, 0);
  return d.toISOString().slice(0, 10);
}

async function api(action: string, body: Record<string, unknown> = {}) {
  const r = await fetch(`/api/app?module=financeiro&action=${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({ ok: false, error: "Resposta inválida do servidor." }));
  if (!r.ok || j.ok === false) throw new Error(j.error || "Falha na operação.");
  return j;
}

type Aba = "receber" | "pagar" | "extrato" | "dre";

export default function Financeiro({
  initialCategorias, initialReceber, initialPagar, dbError,
}: { initialCategorias: Categoria[]; initialReceber: Receivable[]; initialPagar: Payable[]; dbError?: boolean }) {
  const router = useRouter();
  const [categorias] = useState<Categoria[]>(initialCategorias);
  const [receber, setReceber] = useState<Receivable[]>(initialReceber);
  const [pagar, setPagar] = useState<Payable[]>(initialPagar);
  const [aba, setAba] = useState<Aba>("receber");
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [modalReceber, setModalReceber] = useState<Receivable | "novo" | null>(null);
  const [modalPagar, setModalPagar] = useState<Payable | "novo" | null>(null);

  const nomeCategoria = useCallback((id: string | null) => categorias.find((c) => c.id === id)?.name ?? "Sem categoria", [categorias]);

  const receberVisiveis = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return receber;
    return receber.filter((r) => [r.subject, r.client_name].some((c) => c?.toLowerCase().includes(t)));
  }, [receber, busca]);

  const pagarVisiveis = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return pagar;
    return pagar.filter((p) => [p.title, p.supplier].some((c) => c?.toLowerCase().includes(t)));
  }, [pagar, busca]);

  async function marcarRecebido(r: Receivable) {
    const alvo = r.status !== "recebido";
    setErro(null);
    setReceber((ls) => ls.map((x) => (x.id === r.id ? { ...x, status: alvo ? "recebido" : "pendente" } : x)));
    try { await api("receber-marcar", { id: r.id, recebido: alvo }); }
    catch (e) { setErro((e as Error).message); router.refresh(); }
  }

  async function marcarPago(p: Payable) {
    const alvo = p.status !== "pago";
    setErro(null);
    setPagar((ls) => ls.map((x) => (x.id === p.id ? { ...x, status: alvo ? "pago" : "pendente" } : x)));
    try { await api("pagar-marcar", { id: p.id, pago: alvo }); }
    catch (e) { setErro((e as Error).message); router.refresh(); }
  }

  async function excluirReceber(r: Receivable) {
    if (!confirm(`Excluir "${r.subject}"? Isso não pode ser desfeito.`)) return;
    const antes = receber;
    setReceber((ls) => ls.filter((x) => x.id !== r.id));
    setModalReceber(null);
    try { await api("receber-delete", { id: r.id }); }
    catch (e) { setReceber(antes); setErro((e as Error).message); }
  }

  async function excluirPagar(p: Payable) {
    if (!confirm(`Excluir "${p.title}"? Isso não pode ser desfeito.`)) return;
    const antes = pagar;
    setPagar((ls) => ls.filter((x) => x.id !== p.id));
    setModalPagar(null);
    try { await api("pagar-delete", { id: p.id }); }
    catch (e) { setPagar(antes); setErro((e as Error).message); }
  }

  async function salvarReceber(form: HTMLFormElement, r: Receivable | null) {
    const fd = new FormData(form);
    const payload = {
      id: r?.id, subject: fd.get("subject"), client_name: fd.get("client_name"),
      category_id: fd.get("category_id") || null, value: fd.get("value"),
      payment_method: fd.get("payment_method"), due_date: fd.get("due_date"), notes: fd.get("notes"),
      ...(r ? {} : { status: fd.get("status") }),
    };
    setErro(null);
    try {
      const j = await api(r ? "receber-update" : "receber-create", payload);
      const salvo = j.item as Receivable;
      setReceber((ls) => (r ? ls.map((x) => (x.id === salvo.id ? { ...x, ...salvo } : x)) : [salvo, ...ls]));
      setModalReceber(null);
    } catch (e) { setErro((e as Error).message); }
  }

  async function salvarPagar(form: HTMLFormElement, p: Payable | null) {
    const fd = new FormData(form);
    const payload = {
      id: p?.id, title: fd.get("title"), supplier: fd.get("supplier"), document: fd.get("document"),
      category_id: fd.get("category_id") || null, value: fd.get("value"),
      payment_method: fd.get("payment_method"), due_date: fd.get("due_date"),
      is_recurring: fd.get("is_recurring") === "on", notes: fd.get("notes"),
      ...(p ? {} : { status: fd.get("status") }),
    };
    setErro(null);
    try {
      const j = await api(p ? "pagar-update" : "pagar-create", payload);
      const salvo = j.item as Payable;
      setPagar((ls) => (p ? ls.map((x) => (x.id === salvo.id ? { ...x, ...salvo } : x)) : [salvo, ...ls]));
      setModalPagar(null);
    } catch (e) { setErro((e as Error).message); }
  }

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1300px] flex-wrap items-center gap-3 px-4 py-3">
          <div className="mr-auto flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan text-white">H</span>
            Hyper<span className="gradient-text">grow</span><span className="ml-1 text-xs font-normal text-slate-500">· Financeiro</span>
          </div>
          <button onClick={() => router.refresh()} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-200 hover:bg-white/10">
            <RefreshCw size={15} /> Atualizar
          </button>
          <a href="/admin" className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-200 hover:bg-white/10">
            <ArrowLeft size={15} /> Pipeline
          </a>
          <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); }}
            aria-label="Sair" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5">
            <LogOut size={16} />
          </button>
        </div>

        <nav className="mx-auto flex max-w-[1300px] gap-1 px-4 pb-2">
          {([
            ["receber", "A receber", TrendingUp],
            ["pagar", "A pagar", TrendingDown],
            ["extrato", "Extrato", Wallet],
            ["dre", "DRE", FileBarChart],
          ] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setAba(key)}
              className={"inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition " +
                (aba === key ? "bg-brand-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200")}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-[1300px] px-4 py-6">
        {dbError && (
          <p className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <AlertTriangle size={16} /> Banco não configurado — os dados financeiros não estão sendo carregados.
          </p>
        )}
        {erro && (
          <p role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <AlertTriangle size={16} /> {erro}
          </p>
        )}

        {aba === "receber" && (
          <ListaFinanceira
            titulo="Contas a receber" corValor="text-emerald-300" acaoLabel="Novo recebível"
            busca={busca} onBusca={setBusca} onNovo={() => setModalReceber("novo")}
          >
            {receberVisiveis.length === 0 && <VazioLinha texto="Nenhum recebível lançado." />}
            {receberVisiveis.map((r) => (
              <LinhaFinanceira key={r.id} status={r.status} onClick={() => setModalReceber(r)}
                titulo={r.subject} sub={r.client_name || nomeCategoria(r.category_id)}
                data={fmtData(r.due_date)} valor={r.value} marcado={r.status === "recebido"}
                onMarcar={(e) => { e.stopPropagation(); marcarRecebido(r); }}
                marcarLabel={r.status === "recebido" ? "Recebido" : "Marcar recebido"}
              />
            ))}
          </ListaFinanceira>
        )}

        {aba === "pagar" && (
          <ListaFinanceira
            titulo="Contas a pagar" corValor="text-rose-300" acaoLabel="Nova despesa"
            busca={busca} onBusca={setBusca} onNovo={() => setModalPagar("novo")}
          >
            {pagarVisiveis.length === 0 && <VazioLinha texto="Nenhuma despesa lançada." />}
            {pagarVisiveis.map((p) => (
              <LinhaFinanceira key={p.id} status={p.status} onClick={() => setModalPagar(p)}
                titulo={p.title} sub={p.supplier || nomeCategoria(p.category_id)}
                data={fmtData(p.due_date)} valor={p.value} marcado={p.status === "pago"}
                onMarcar={(e) => { e.stopPropagation(); marcarPago(p); }}
                marcarLabel={p.status === "pago" ? "Pago" : "Marcar pago"}
              />
            ))}
          </ListaFinanceira>
        )}

        {aba === "extrato" && <Extrato onErro={setErro} />}
        {aba === "dre" && <Dre onErro={setErro} />}
      </div>

      {modalReceber && (
        <ModalForm titulo={modalReceber === "novo" ? "Novo recebível" : "Editar recebível"} onFechar={() => setModalReceber(null)}
          onSubmit={(form) => salvarReceber(form, modalReceber === "novo" ? null : modalReceber)}
          onExcluir={modalReceber !== "novo" ? () => excluirReceber(modalReceber) : undefined}
        >
          {(r) => {
            const item = r === "novo" ? null : (r as Receivable);
            return (
              <>
                <Campo nome="subject" rotulo="Descrição" valor={item?.subject} obrigatorio />
                <Campo nome="client_name" rotulo="Cliente" valor={item?.client_name ?? ""} />
                <SelectCategoria nome="category_id" categorias={categorias} valor={item?.category_id ?? ""} />
                <Campo nome="value" rotulo="Valor (R$)" valor={item?.value != null ? String(item.value) : ""} obrigatorio />
                <Campo nome="due_date" rotulo="Vencimento" tipo="date" valor={item?.due_date ?? ""} />
                <SelectSimples nome="payment_method" rotulo="Forma de pagamento" valor={item?.payment_method ?? "pix"}
                  opcoes={[["pix", "PIX"], ["boleto", "Boleto"], ["cartao", "Cartão"], ["transferencia", "Transferência"], ["outro", "Outro"]]} />
                {!item && (
                  <SelectSimples nome="status" rotulo="Status" valor="pendente"
                    opcoes={STATUS_RECEBER.map((s) => [s, s[0].toUpperCase() + s.slice(1)])} />
                )}
              </>
            );
          }}
        </ModalForm>
      )}

      {modalPagar && (
        <ModalForm titulo={modalPagar === "novo" ? "Nova despesa" : "Editar despesa"} onFechar={() => setModalPagar(null)}
          onSubmit={(form) => salvarPagar(form, modalPagar === "novo" ? null : modalPagar)}
          onExcluir={modalPagar !== "novo" ? () => excluirPagar(modalPagar) : undefined}
        >
          {(p) => {
            const item = p === "novo" ? null : (p as Payable);
            return (
              <>
                <Campo nome="title" rotulo="Descrição" valor={item?.title} obrigatorio />
                <Campo nome="supplier" rotulo="Fornecedor" valor={item?.supplier ?? ""} />
                <Campo nome="document" rotulo="Documento/NF" valor={item?.document ?? ""} />
                <SelectCategoria nome="category_id" categorias={categorias} valor={item?.category_id ?? ""} />
                <Campo nome="value" rotulo="Valor (R$)" valor={item?.value != null ? String(item.value) : ""} obrigatorio />
                <Campo nome="due_date" rotulo="Vencimento" tipo="date" valor={item?.due_date ?? ""} />
                <SelectSimples nome="payment_method" rotulo="Forma de pagamento" valor={item?.payment_method ?? "boleto"}
                  opcoes={[["boleto", "Boleto"], ["pix", "PIX"], ["cartao", "Cartão"], ["transferencia", "Transferência"], ["outro", "Outro"]]} />
                {!item && (
                  <SelectSimples nome="status" rotulo="Status" valor="pendente"
                    opcoes={STATUS_PAGAR.map((s) => [s, s[0].toUpperCase() + s.slice(1)])} />
                )}
                <label className="mt-1 flex items-center gap-2 text-[13px] font-medium text-slate-300 sm:col-span-2">
                  <input type="checkbox" name="is_recurring" defaultChecked={item?.is_recurring} className="h-4 w-4 rounded border-white/20 bg-ink-900" />
                  Despesa recorrente (repete todo mês)
                </label>
              </>
            );
          }}
        </ModalForm>
      )}
    </main>
  );
}

/* ── Lista genérica (usada por Receber e Pagar) ────────────────────────────── */
function ListaFinanceira({ titulo, corValor, acaoLabel, busca, onBusca, onNovo, children }: {
  titulo: string; corValor: string; acaoLabel: string; busca: string; onBusca: (v: string) => void; onNovo: () => void; children: React.ReactNode;
}) {
  void corValor;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-lg font-semibold text-white">{titulo}</h1>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={busca} onChange={(e) => onBusca(e.target.value)} placeholder="Buscar…" aria-label="Buscar"
            className="h-10 w-52 rounded-xl border border-white/10 bg-ink-900/70 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-400" />
        </div>
        <button onClick={onNovo} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-400">
          <Plus size={16} /> {acaoLabel}
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">{children}</div>
    </div>
  );
}

function VazioLinha({ texto }: { texto: string }) {
  return <p className="p-8 text-center text-sm text-slate-500">{texto}</p>;
}

function LinhaFinanceira({ status, titulo, sub, data, valor, marcado, onMarcar, marcarLabel, onClick }: {
  status: string; titulo: string; sub: string | null; data: string; valor: number;
  marcado: boolean; onMarcar: (e: React.MouseEvent) => void; marcarLabel: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 border-b border-white/5 bg-white/[.015] px-4 py-3 text-left last:border-b-0 hover:bg-white/[.04]">
      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: COR_STATUS[status] ?? "#64748b" }} />
      <span className="min-w-0 flex-1">
        <b className="block truncate text-[13.5px] font-semibold text-white">{titulo}</b>
        <span className="block truncate text-[12px] text-slate-500">{sub || "—"} · vence {data}</span>
      </span>
      <span className="whitespace-nowrap text-[13.5px] font-semibold text-slate-200">{BRL.format(valor)}</span>
      <span
        onClick={onMarcar}
        role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onMarcar(e as unknown as React.MouseEvent); } }}
        className={"inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-[12px] font-semibold " +
          (marcado ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 text-slate-400 hover:bg-white/5")}
      >
        <Check size={13} /> {marcarLabel}
      </span>
    </button>
  );
}

/* ── Modal de criar/editar ──────────────────────────────────────────────────── */
function ModalForm<T>({ titulo, onFechar, onSubmit, onExcluir, children }: {
  titulo: string; onFechar: () => void; onSubmit: (form: HTMLFormElement) => void; onExcluir?: () => void;
  children: (item: T | "novo") => React.ReactNode;
}) {
  return (
    <div role="dialog" aria-modal="true" aria-label={titulo}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(e.currentTarget); }}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-ink-950 p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="mr-auto text-base font-semibold text-white">{titulo}</h2>
          <button type="button" onClick={onFechar} aria-label="Fechar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300">
            <X size={16} />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">{children("novo" as never)}</div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button type="submit" className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-400">
            Salvar
          </button>
          {onExcluir && (
            <button type="button" onClick={onExcluir} aria-label="Excluir"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </form>
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

function SelectSimples({ nome, rotulo, valor, opcoes }: { nome: string; rotulo: string; valor: string; opcoes: [string, string][] }) {
  return (
    <label className="block text-[13px] font-semibold text-slate-300">
      {rotulo}
      <select name={nome} defaultValue={valor}
        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-ink-900/70 px-3 text-sm text-white outline-none focus:border-brand-400">
        {opcoes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function SelectCategoria({ nome, categorias, valor }: { nome: string; categorias: Categoria[]; valor: string }) {
  return (
    <label className="block text-[13px] font-semibold text-slate-300 sm:col-span-2">
      Categoria
      <select name={nome} defaultValue={valor}
        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-ink-900/70 px-3 text-sm text-white outline-none focus:border-brand-400">
        <option value="">Sem categoria</option>
        {categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </label>
  );
}

/* ── Extrato ─────────────────────────────────────────────────────────────────── */
function Extrato({ onErro }: { onErro: (e: string | null) => void }) {
  const [de, setDe] = useState(inicioMesISO());
  const [ate, setAte] = useState(hojeISO());
  const [linhas, setLinhas] = useState<ExtratoLinha[] | null>(null);
  const [totais, setTotais] = useState<{ totalReceita: number; totalDespesa: number; saldo: number } | null>(null);
  const [carregando, setCarregando] = useState(false);

  const gerar = useCallback(async (d: string, a: string) => {
    setCarregando(true); onErro(null);
    try {
      const j = await api("extrato", { de: d, ate: a });
      setLinhas(j.linhas as ExtratoLinha[]);
      setTotais({ totalReceita: j.totalReceita as number, totalDespesa: j.totalDespesa as number, saldo: j.saldo as number });
    } catch (e) { onErro((e as Error).message); }
    finally { setCarregando(false); }
  }, [onErro]);

  function preset(d: string, a: string) { setDe(d); setAte(a); gerar(d, a); }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-[13px] font-semibold text-slate-300">De
          <input type="date" value={de} onChange={(e) => setDe(e.target.value)}
            className="mt-1.5 block h-10 rounded-xl border border-white/10 bg-ink-900/70 px-3 text-sm text-white outline-none focus:border-brand-400" />
        </label>
        <label className="text-[13px] font-semibold text-slate-300">Até
          <input type="date" value={ate} onChange={(e) => setAte(e.target.value)}
            className="mt-1.5 block h-10 rounded-xl border border-white/10 bg-ink-900/70 px-3 text-sm text-white outline-none focus:border-brand-400" />
        </label>
        <button onClick={() => gerar(de, ate)} className="inline-flex h-10 items-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-400">
          Gerar
        </button>
        <div className="ml-auto flex gap-2">
          <button onClick={() => preset(inicioMesISO(), hojeISO())} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5">Este mês</button>
          <button onClick={() => preset(inicioMesISO(-1), fimMesISO(-1))} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5">Mês passado</button>
          <button onClick={() => preset(hojeISO(-30), hojeISO())} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5">Últimos 30 dias</button>
        </div>
      </div>

      {totais && (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <CardTotal label="Entrou" valor={totais.totalReceita} cor="text-emerald-300" />
          <CardTotal label="Saiu" valor={totais.totalDespesa} cor="text-rose-300" />
          <CardTotal label="Saldo do período" valor={totais.saldo} cor={totais.saldo >= 0 ? "text-emerald-300" : "text-rose-300"} />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10">
        {carregando && <p className="p-8 text-center text-sm text-slate-500">Carregando…</p>}
        {!carregando && linhas === null && <p className="p-8 text-center text-sm text-slate-500">Escolha um período e clique em Gerar.</p>}
        {!carregando && linhas?.length === 0 && <VazioLinha texto="Nenhuma movimentação nesse período." />}
        {!carregando && linhas?.map((l) => (
          <div key={`${l.origem}-${l.id}`} className="flex items-center gap-3 border-b border-white/5 bg-white/[.015] px-4 py-3 last:border-b-0">
            {l.tipo === "receita" ? <TrendingUp size={15} className="flex-shrink-0 text-emerald-400" /> : <TrendingDown size={15} className="flex-shrink-0 text-rose-400" />}
            <span className="min-w-0 flex-1">
              <b className="block truncate text-[13.5px] font-semibold text-white">{l.descricao}</b>
              <span className="block truncate text-[12px] text-slate-500">{l.contraparte || "—"} · {fmtData(l.data)}{l.origem === "asaas" ? " · via Asaas" : ""}</span>
            </span>
            <span className={"whitespace-nowrap text-[13.5px] font-semibold " + (l.tipo === "receita" ? "text-emerald-300" : "text-rose-300")}>
              {l.tipo === "receita" ? "+" : "−"} {BRL.format(l.valor)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardTotal({ label, valor, cor }: { label: string; valor: number; cor: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.02] p-4">
      <span className="block text-[12px] font-medium text-slate-500">{label}</span>
      <span className={"mt-1 block text-xl font-bold " + cor}>{BRL.format(valor)}</span>
    </div>
  );
}

/* ── DRE ─────────────────────────────────────────────────────────────────────── */
function Dre({ onErro }: { onErro: (e: string | null) => void }) {
  const [de, setDe] = useState(inicioMesISO());
  const [ate, setAte] = useState(hojeISO());
  const [regime, setRegime] = useState<"caixa" | "competencia">("caixa");
  const [resultado, setResultado] = useState<{ receitas: DreGrupo[]; despesas: DreGrupo[]; totalReceitas: number; totalDespesas: number; resultado: number } | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function gerar() {
    setCarregando(true); onErro(null);
    try {
      const j = await api("dre", { de, ate, regime });
      setResultado(j as typeof resultado);
    } catch (e) { onErro((e as Error).message); }
    finally { setCarregando(false); }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-[13px] font-semibold text-slate-300">De
          <input type="date" value={de} onChange={(e) => setDe(e.target.value)}
            className="mt-1.5 block h-10 rounded-xl border border-white/10 bg-ink-900/70 px-3 text-sm text-white outline-none focus:border-brand-400" />
        </label>
        <label className="text-[13px] font-semibold text-slate-300">Até
          <input type="date" value={ate} onChange={(e) => setAte(e.target.value)}
            className="mt-1.5 block h-10 rounded-xl border border-white/10 bg-ink-900/70 px-3 text-sm text-white outline-none focus:border-brand-400" />
        </label>
        <label className="text-[13px] font-semibold text-slate-300">Regime
          <select value={regime} onChange={(e) => setRegime(e.target.value as "caixa" | "competencia")}
            className="mt-1.5 block h-10 rounded-xl border border-white/10 bg-ink-900/70 px-3 text-sm text-white outline-none focus:border-brand-400">
            <option value="caixa">Caixa (o que entrou/saiu)</option>
            <option value="competencia">Competência (o que venceu)</option>
          </select>
        </label>
        <button onClick={gerar} className="inline-flex h-10 items-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-400">
          Gerar
        </button>
      </div>

      {carregando && <p className="p-8 text-center text-sm text-slate-500">Carregando…</p>}

      {!carregando && resultado && (
        <div className="grid gap-4 sm:grid-cols-2">
          <GrupoDre titulo="Receitas" grupos={resultado.receitas} total={resultado.totalReceitas} cor="text-emerald-300" />
          <GrupoDre titulo="Despesas" grupos={resultado.despesas} total={resultado.totalDespesas} cor="text-rose-300" />
          <div className="sm:col-span-2">
            <CardTotal label="Resultado do período (receitas − despesas)" valor={resultado.resultado} cor={resultado.resultado >= 0 ? "text-emerald-300" : "text-rose-300"} />
          </div>
        </div>
      )}
      {!carregando && !resultado && <p className="p-8 text-center text-sm text-slate-500">Escolha um período e clique em Gerar.</p>}
    </div>
  );
}

function GrupoDre({ titulo, grupos, total, cor }: { titulo: string; grupos: DreGrupo[]; total: number; cor: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[.03] px-4 py-3">
        <b className="text-sm text-white">{titulo}</b>
        <span className={"text-sm font-bold " + cor}>{BRL.format(total)}</span>
      </div>
      {grupos.length === 0 && <VazioLinha texto="Nada nesse período." />}
      {grupos.map((g) => (
        <div key={g.categoria} className="flex items-center justify-between border-b border-white/5 px-4 py-2.5 text-[13px] last:border-b-0">
          <span className="text-slate-300">{g.categoria}</span>
          <span className="font-semibold text-slate-200">{BRL.format(g.total)}</span>
        </div>
      ))}
    </div>
  );
}

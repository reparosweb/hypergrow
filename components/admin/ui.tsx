"use client";

import { AlertTriangle, Info, Loader2 } from "lucide-react";

/* Peças visuais repetidas das telas do painel. Nada de sistema visual novo:
   são as mesmas classes Tailwind escuras que CrmView e Financeiro já usavam,
   só que num lugar só. */

export function Painel({ titulo, acao, children }: { titulo: string; acao?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/40">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-white/[.03] px-4 py-3">
        <h2 className="mr-auto text-sm font-semibold text-white">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

export function Metrica({
  rotulo,
  valor,
  detalhe,
  cor = "text-white",
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  cor?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/40 px-4 py-3.5">
      <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[.12em] text-slate-500">{rotulo}</p>
      <p className={"mt-1.5 text-xl font-bold " + cor}>{valor}</p>
      {detalhe && <p className="mt-0.5 text-[11.5px] text-slate-500">{detalhe}</p>}
    </div>
  );
}

export function Vazio({ texto }: { texto: string }) {
  return <p className="px-4 py-8 text-center text-sm text-slate-500">{texto}</p>;
}

export function Erro({ texto }: { texto: string }) {
  return (
    <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {texto}
    </p>
  );
}

export function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** Nota de método: explica COMO um número foi calculado. Usada onde o dado é
 *  aproximação — nunca deixar o dono achar que é medida exata. */
export function Nota({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[.02] px-4 py-3 text-[12.5px] leading-relaxed text-slate-400">
      <Info size={15} className="mt-0.5 shrink-0 text-slate-500" />
      <span>{children}</span>
    </p>
  );
}

export function Carregando({ texto = "Carregando…" }: { texto?: string }) {
  return (
    <p className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500">
      <Loader2 size={16} className="animate-spin" /> {texto}
    </p>
  );
}

export function Campo({
  nome,
  rotulo,
  valor,
  tipo = "text",
  obrigatorio,
  placeholder,
  min,
}: {
  nome: string;
  rotulo: string;
  valor?: string;
  tipo?: string;
  obrigatorio?: boolean;
  placeholder?: string;
  min?: string | number;
}) {
  return (
    <label className="block text-[13px] font-semibold text-slate-300">
      {rotulo}
      {obrigatorio && <span className="text-rose-400"> *</span>}
      <input
        name={nome}
        type={tipo}
        defaultValue={valor}
        required={obrigatorio}
        placeholder={placeholder}
        min={min}
        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-ink-900/70 px-3 text-sm text-white outline-none focus:border-brand-400"
      />
    </label>
  );
}

export function Selecao({
  nome,
  rotulo,
  valor,
  opcoes,
}: {
  nome: string;
  rotulo: string;
  valor?: string;
  opcoes: { valor: string; rotulo: string }[];
}) {
  return (
    <label className="block text-[13px] font-semibold text-slate-300">
      {rotulo}
      <select
        name={nome}
        defaultValue={valor}
        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-ink-900/70 px-3 text-sm text-white outline-none focus:border-brand-400"
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Modal({
  titulo,
  onFechar,
  children,
}: {
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-ink-950 p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="mr-auto text-base font-semibold text-white">{titulo}</h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

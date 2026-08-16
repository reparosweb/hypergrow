"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Video, Trash2, Check, X, CalendarClock } from "lucide-react";
import { chamarApi, fmtDataHora, localParaISO, isoParaLocal } from "@/lib/admin-api";
import { Painel, Vazio, Erro, Carregando, Modal, Campo } from "./ui";

type Compromisso = {
  id: string; lead_id: string | null; client_name: string; client_email: string; client_phone: string | null;
  title: string; notes: string | null; start_time: string; end_time: string; status: string;
  source: string | null; meeting_link: string | null;
};

const STATUS: { valor: string; rotulo: string; cor: string }[] = [
  { valor: "agendado", rotulo: "Agendado", cor: "#6366f1" },
  { valor: "confirmado", rotulo: "Confirmado", cor: "#06b6d4" },
  { valor: "concluido", rotulo: "Concluído", cor: "#22c55e" },
  { valor: "faltou", rotulo: "Não compareceu", cor: "#f59e0b" },
  { valor: "cancelado", rotulo: "Cancelado", cor: "#64748b" },
];

const corDoStatus = (s: string) => STATUS.find((x) => x.valor === s)?.cor ?? "#64748b";
const rotuloDoStatus = (s: string) => STATUS.find((x) => x.valor === s)?.rotulo ?? s;

export default function Agenda() {
  const [itens, setItens] = useState<Compromisso[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [modal, setModal] = useState<Compromisso | "novo" | null>(null);
  const [dias, setDias] = useState(30);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      // Janela: de ontem até `dias` à frente — a agenda serve para o que vem,
      // com uma folga curta para trás para conferir o que acabou de passar.
      const de = new Date();
      de.setDate(de.getDate() - 1);
      de.setHours(0, 0, 0, 0);
      const ate = new Date();
      ate.setDate(ate.getDate() + dias);
      ate.setHours(23, 59, 59, 999);

      const j = await chamarApi<{ itens: Compromisso[] }>("agenda", "list", {
        de: de.toISOString(),
        ate: ate.toISOString(),
      });
      setItens(j.itens);
    } catch (e) {
      setErro((e as Error).message);
      setItens([]);
    }
  }, [dias]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvar(form: HTMLFormElement, atual: Compromisso | null) {
    const fd = new FormData(form);
    /* A conversão para ISO acontece AQUI, no navegador: é o único lugar que
       conhece o fuso do dono. Ver o comentário em lib/admin-api.ts. */
    const inicio = localParaISO(String(fd.get("start_time") || ""));
    const fim = localParaISO(String(fd.get("end_time") || ""));
    if (!inicio || !fim) {
      setErro("Informe a data e a hora de início e de término.");
      return;
    }

    const payload = {
      id: atual?.id,
      client_name: fd.get("client_name"),
      client_email: fd.get("client_email"),
      client_phone: fd.get("client_phone"),
      title: fd.get("title"),
      meeting_link: fd.get("meeting_link"),
      notes: fd.get("notes"),
      start_time: inicio,
      end_time: fim,
    };

    setErro(null);
    try {
      const j = await chamarApi<{ item: Compromisso }>("agenda", atual ? "update" : "create", payload);
      setItens((ls) =>
        atual
          ? (ls ?? []).map((x) => (x.id === j.item.id ? j.item : x))
          : [...(ls ?? []), j.item].sort((a, b) => a.start_time.localeCompare(b.start_time))
      );
      setModal(null);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function mudarStatus(c: Compromisso, status: string) {
    setErro(null);
    const antes = itens ?? [];
    setItens((ls) => (ls ?? []).map((x) => (x.id === c.id ? { ...x, status } : x)));
    try {
      await chamarApi("agenda", "status", { id: c.id, status });
    } catch (e) {
      setItens(antes);
      setErro((e as Error).message);
    }
  }

  async function excluir(c: Compromisso) {
    if (!confirm(`Excluir o compromisso "${c.title}" de ${c.client_name}? Isso não pode ser desfeito.`)) return;
    const antes = itens ?? [];
    setItens((ls) => (ls ?? []).filter((x) => x.id !== c.id));
    setModal(null);
    try {
      await chamarApi("agenda", "delete", { id: c.id });
    } catch (e) {
      setItens(antes);
      setErro((e as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      {erro && <Erro texto={erro} />}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="text-[13px] text-slate-400">
          Mostrar os próximos
          <select
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            className="ml-2 h-9 rounded-lg border border-white/10 bg-ink-900/70 px-2 text-sm text-white outline-none focus:border-brand-400"
          >
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>90 dias</option>
          </select>
        </label>
        <button
          onClick={() => setModal("novo")}
          className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-400"
        >
          <Plus size={16} /> Novo compromisso
        </button>
      </div>

      {itens === null ? (
        <Carregando />
      ) : (
        <Painel titulo={`Compromissos (${itens.length})`}>
          {itens.length === 0 && <Vazio texto="Nada marcado nesse período." />}
          {itens.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
              <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[12.5px] text-slate-300">
                <CalendarClock size={13} className="text-slate-500" /> {fmtDataHora(c.start_time)}
              </span>
              <button onClick={() => setModal(c)} className="min-w-0 flex-1 text-left">
                <b className="block truncate text-[13.5px] text-white hover:underline">{c.title}</b>
                <span className="block truncate text-[12px] text-slate-500">{c.client_name} · {c.client_email}</span>
              </button>

              <span
                className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                style={{ background: `${corDoStatus(c.status)}22`, color: corDoStatus(c.status) }}
              >
                {rotuloDoStatus(c.status)}
              </span>

              {c.meeting_link && (
                <a href={c.meeting_link} target="_blank" rel="noreferrer" aria-label="Abrir sala da reunião"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white">
                  <Video size={14} />
                </a>
              )}
              {c.status !== "concluido" && c.status !== "cancelado" && (
                <>
                  <button onClick={() => mudarStatus(c, "concluido")} title="Marcar como concluído" aria-label="Marcar como concluído"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
                    <Check size={14} />
                  </button>
                  <button onClick={() => mudarStatus(c, "cancelado")} title="Cancelar" aria-label="Cancelar compromisso"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white">
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </Painel>
      )}

      {modal && (
        <Modal titulo={modal === "novo" ? "Novo compromisso" : "Editar compromisso"} onFechar={() => setModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); salvar(e.currentTarget, modal === "novo" ? null : modal); }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo nome="title" rotulo="Título" obrigatorio valor={modal === "novo" ? "Reunião" : modal.title} />
              <Campo nome="client_name" rotulo="Cliente" obrigatorio valor={modal === "novo" ? "" : modal.client_name} />
              <Campo nome="client_email" rotulo="E-mail" tipo="email" obrigatorio valor={modal === "novo" ? "" : modal.client_email} />
              <Campo nome="client_phone" rotulo="WhatsApp" valor={modal === "novo" ? "" : modal.client_phone ?? ""} />
              <Campo nome="start_time" rotulo="Início" tipo="datetime-local" obrigatorio valor={modal === "novo" ? "" : isoParaLocal(modal.start_time)} />
              <Campo nome="end_time" rotulo="Término" tipo="datetime-local" obrigatorio valor={modal === "novo" ? "" : isoParaLocal(modal.end_time)} />
            </div>

            <div className="mt-3">
              <Campo nome="meeting_link" rotulo="Link da reunião (Meet, Zoom…)" valor={modal === "novo" ? "" : modal.meeting_link ?? ""} placeholder="https://" />
            </div>

            <label className="mt-3 block text-[13px] font-semibold text-slate-300">
              Anotações
              <textarea name="notes" rows={3} defaultValue={modal === "novo" ? "" : modal.notes ?? ""}
                className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-ink-900/70 p-3 text-sm text-white outline-none focus:border-brand-400" />
            </label>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button type="submit" className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-400">
                Salvar
              </button>
              {modal !== "novo" && (
                <button type="button" onClick={() => excluir(modal)} aria-label="Excluir compromisso"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

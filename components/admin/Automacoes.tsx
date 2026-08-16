"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, AlertTriangle, Workflow, History } from "lucide-react";
import { chamarApi, fmtDataHora } from "@/lib/admin-api";
import { Painel, Vazio, Erro, Carregando, Campo, Selecao, Modal, Nota } from "./ui";

/* ─────────────────────────────────────────────────────────────────────────────
   Automações — réguas de mensagem (`automation_rules`) e histórico (`message_log`).

   ⚠️ O MOTOR NÃO EXISTE — leia `lib/modules/mod-automacoes.ts` antes de mexer.
   As réguas cadastradas aqui NÃO disparam mensagem nenhuma: não há cron nem
   provedor de e-mail configurado. `motorAtivo` vem do próprio módulo em cada
   resposta (`list` e `log`) e é `false` hoje — o aviso grande no topo da tela
   existe para o dono nunca achar que está funcionando só porque marcou "ativa".

   ROTULO_GATILHO é replicado aqui de propósito, e não importado de
   `lib/modules/mod-automacoes.ts`: aquele arquivo importa `_shared.ts`, que
   importa `next/headers` (API só de servidor). Importar direto num componente
   client quebraria o build. A LISTA de gatilhos válidos, por outro lado, vem
   sempre da API (`gatilhos` na resposta de `list`) — só o texto do rótulo é
   local, e precisa continuar em sincronia manual com o módulo se um gatilho
   novo for adicionado lá.
   ──────────────────────────────────────────────────────────────────────────── */

const ROTULO_GATILHO: Record<string, string> = {
  appointment_created: "Compromisso agendado",
  appointment_reminder: "Lembrete de compromisso",
  appointment_cancelled: "Compromisso cancelado",
  new_lead: "Lead novo chegou",
  payment_received: "Pagamento recebido",
};

type Regra = {
  id: string;
  name: string;
  trigger_event: string;
  offset_minutes: number;
  channels: string[];
  subject_template: string | null;
  message_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Envio = {
  id: string;
  channel: string;
  target: string;
  subject: string | null;
  status: string;
  error_msg: string | null;
  rule_id: string | null;
  related_type: string | null;
  related_id: string | null;
  sent_at: string;
};

type Aba = "regras" | "historico";

function rotuloGatilho(g: string): string {
  return ROTULO_GATILHO[g] ?? g;
}

function rotuloAntecedencia(min: number): string {
  if (min === 0) return "no momento do evento";
  if (min < 0) return `${Math.abs(min)} min antes`;
  return `${min} min depois`;
}

export default function Automacoes() {
  const [aba, setAba] = useState<Aba>("regras");

  const [regras, setRegras] = useState<Regra[] | null>(null);
  const [gatilhos, setGatilhos] = useState<string[]>(Object.keys(ROTULO_GATILHO));
  const [motorAtivo, setMotorAtivo] = useState<boolean>(false);

  const [envios, setEnvios] = useState<Envio[] | null>(null);

  const [erro, setErro] = useState("");
  const [modal, setModal] = useState<Regra | "novo" | null>(null);

  const carregarRegras = useCallback(async () => {
    setErro("");
    try {
      const r = await chamarApi<{ regras: Regra[]; motorAtivo: boolean; gatilhos: string[] }>("automacoes", "list");
      setRegras(r.regras ?? []);
      setMotorAtivo(r.motorAtivo);
      if (r.gatilhos?.length) setGatilhos(r.gatilhos);
    } catch (e) {
      setErro((e as Error).message);
      setRegras([]);
    }
  }, []);

  const carregarHistorico = useCallback(async () => {
    setErro("");
    try {
      const r = await chamarApi<{ envios: Envio[]; motorAtivo: boolean }>("automacoes", "log");
      setEnvios(r.envios ?? []);
      setMotorAtivo(r.motorAtivo);
    } catch (e) {
      setErro((e as Error).message);
      setEnvios([]);
    }
  }, []);

  useEffect(() => {
    carregarRegras();
  }, [carregarRegras]);

  useEffect(() => {
    if (aba === "historico" && envios === null) carregarHistorico();
  }, [aba, envios, carregarHistorico]);

  async function salvar(form: HTMLFormElement, regra: Regra | null) {
    const fd = new FormData(form);
    const payload = {
      id: regra?.id,
      name: fd.get("name"),
      trigger_event: fd.get("trigger_event"),
      offset_minutes: fd.get("offset_minutes"),
      subject_template: fd.get("subject_template"),
      message_template: fd.get("message_template"),
      is_active: fd.get("is_active") === "on",
    };
    setErro("");
    try {
      const j = await chamarApi<{ regra: Regra }>("automacoes", regra ? "update" : "create", payload);
      setRegras((ls) => {
        const base = ls ?? [];
        return regra ? base.map((x) => (x.id === j.regra.id ? j.regra : x)) : [j.regra, ...base];
      });
      setModal(null);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function excluir(r: Regra) {
    if (!confirm(`Excluir a régua "${r.name}"? Isso não pode ser desfeito.`)) return;
    const antes = regras;
    setRegras((ls) => (ls ?? []).filter((x) => x.id !== r.id));
    setModal(null);
    try {
      await chamarApi("automacoes", "delete", { id: r.id });
    } catch (e) {
      setRegras(antes);
      setErro((e as Error).message);
    }
  }

  async function alternarAtivo(r: Regra) {
    const alvo = !r.is_active;
    setErro("");
    setRegras((ls) => (ls ?? []).map((x) => (x.id === r.id ? { ...x, is_active: alvo } : x)));
    try {
      await chamarApi("automacoes", "update", { id: r.id, is_active: alvo });
    } catch (e) {
      setErro((e as Error).message);
      carregarRegras();
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
      <h1 className="mb-4 text-lg font-semibold text-white">Automações</h1>

      {!motorAtivo && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 px-4 py-4"
        >
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-300" />
          <div>
            <p className="text-sm font-bold text-amber-100">O motor de envio ainda não está ligado</p>
            <p className="mt-1 text-[13px] leading-relaxed text-amber-200/90">
              As réguas abaixo ficam salvas, mas <b>nada é enviado de verdade</b> — não existe cron nem provedor de
              e-mail configurado no servidor ainda. Marcar uma régua como <b>ativa</b> aqui NÃO dispara mensagem
              nenhuma para ninguém. É só cadastro, por enquanto.
            </p>
          </div>
        </div>
      )}

      {erro && <Erro texto={erro} />}

      <div className="mb-4 inline-flex gap-1 rounded-xl border border-white/10 bg-ink-900/40 p-1">
        <button
          onClick={() => setAba("regras")}
          className={
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition " +
            (aba === "regras" ? "bg-brand-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200")
          }
        >
          <Workflow size={14} /> Réguas
        </button>
        <button
          onClick={() => setAba("historico")}
          className={
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition " +
            (aba === "historico" ? "bg-brand-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200")
          }
        >
          <History size={14} /> Histórico
        </button>
      </div>

      {aba === "regras" && (
        <Painel
          titulo="Réguas de mensagem"
          acao={
            <button
              onClick={() => setModal("novo")}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-400"
            >
              <Plus size={16} /> Nova régua
            </button>
          }
        >
          {regras === null && <Carregando />}
          {regras?.length === 0 && <Vazio texto="Nenhuma régua cadastrada ainda." />}
          {!!regras?.length && (
            <div className="overflow-hidden rounded-xl border border-white/10">
              {regras.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
                  <button onClick={() => setModal(r)} className="min-w-[200px] flex-1 text-left">
                    <b className="block truncate text-[13.5px] font-semibold text-white">{r.name}</b>
                    <span className="block truncate text-[12px] text-slate-500">
                      {rotuloGatilho(r.trigger_event)} · {rotuloAntecedencia(r.offset_minutes)}
                    </span>
                  </button>
                  <span className="hidden max-w-[220px] truncate text-[12px] text-slate-500 lg:block">
                    {r.message_template}
                  </span>
                  <button
                    onClick={() => alternarAtivo(r)}
                    title={r.is_active ? "Desativar régua" : "Ativar régua"}
                    className={
                      "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold " +
                      (r.is_active
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-white/10 text-slate-400 hover:bg-white/5")
                    }
                  >
                    {r.is_active ? "Ativa" : "Inativa"}
                  </button>
                  <button
                    onClick={() => excluir(r)}
                    title="Excluir régua"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Painel>
      )}

      {aba === "historico" && (
        <Painel titulo="Histórico de envios">
          {envios === null && <Carregando />}
          {envios?.length === 0 && (
            <>
              <Vazio texto="Nenhum envio registrado ainda." />
              <div className="px-4 pb-4">
                <Nota>
                  Isso é esperado: o motor de disparo ainda não está ligado, então nada foi enviado — esta lista vai
                  continuar vazia até o cron e o provedor de e-mail entrarem em produção.
                </Nota>
              </div>
            </>
          )}
          {!!envios?.length && (
            <div className="overflow-hidden rounded-xl border border-white/10">
              {envios.map((e) => (
                <div key={e.id} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
                  <span className="min-w-[70px] text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                    {e.channel}
                  </span>
                  <span className="min-w-[160px] flex-1 truncate text-[13px] text-white">{e.target}</span>
                  <span className="hidden max-w-[200px] truncate text-[12.5px] text-slate-400 sm:block">
                    {e.subject || "—"}
                  </span>
                  <span
                    className={
                      "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold " +
                      (e.error_msg
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300")
                    }
                  >
                    {e.status}
                  </span>
                  <span className="whitespace-nowrap text-[12px] text-slate-500">{fmtDataHora(e.sent_at)}</span>
                  {e.error_msg && <span className="w-full text-[12px] text-rose-300">{e.error_msg}</span>}
                </div>
              ))}
            </div>
          )}
        </Painel>
      )}

      {modal && (
        <Modal titulo={modal === "novo" ? "Nova régua" : "Editar régua"} onFechar={() => setModal(null)}>
          <RegraForm
            item={modal === "novo" ? null : modal}
            gatilhos={gatilhos}
            onSalvar={(form) => salvar(form, modal === "novo" ? null : modal)}
            onExcluir={modal !== "novo" ? () => excluir(modal) : undefined}
          />
        </Modal>
      )}
    </div>
  );
}

function RegraForm({
  item,
  gatilhos,
  onSalvar,
  onExcluir,
}: {
  item: Regra | null;
  gatilhos: string[];
  onSalvar: (form: HTMLFormElement) => void;
  onExcluir?: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSalvar(e.currentTarget);
      }}
      className="grid gap-3"
    >
      <Campo nome="name" rotulo="Nome da régua" valor={item?.name} obrigatorio />
      <Selecao
        nome="trigger_event"
        rotulo="Gatilho"
        valor={item?.trigger_event ?? gatilhos[0] ?? ""}
        opcoes={gatilhos.map((g) => ({ valor: g, rotulo: rotuloGatilho(g) }))}
      />
      <Campo
        nome="offset_minutes"
        rotulo="Antecedência em minutos (negativo = antes do evento, positivo = depois)"
        tipo="number"
        valor={String(item?.offset_minutes ?? 0)}
      />
      <Campo nome="subject_template" rotulo="Assunto do e-mail" valor={item?.subject_template ?? ""} />
      <label className="block text-[13px] font-semibold text-slate-300">
        Mensagem<span className="text-rose-400"> *</span>
        <textarea
          name="message_template"
          defaultValue={item?.message_template ?? ""}
          required
          rows={5}
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink-900/70 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-400"
        />
      </label>
      <label className="flex items-center gap-2 text-[13px] font-medium text-slate-300">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={item?.is_active ?? true}
          className="h-4 w-4 rounded border-white/20 bg-ink-900"
        />
        Régua ativa (só marca o cadastro — não dispara nada enquanto o motor não estiver ligado)
      </label>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="submit"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-400"
        >
          Salvar
        </button>
        {onExcluir && (
          <button
            type="button"
            onClick={onExcluir}
            aria-label="Excluir"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </form>
  );
}

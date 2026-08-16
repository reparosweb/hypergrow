"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, UserPlus, Wallet, Video, Mail, Phone } from "lucide-react";
import { chamarApi, BRL, fmtHora, fmtData } from "@/lib/admin-api";
import { Painel, Vazio, Erro, Carregando, Nota } from "./ui";

type Compromisso = {
  id: string; client_name: string; client_email: string; title: string;
  start_time: string; end_time: string; status: string; meeting_link: string | null;
};
type LeadNovo = {
  id: string; name: string; email: string; phone: string | null;
  product: string | null; value: number | null; created_at: string;
};
type Recebivel = { id: string; subject: string; client_name: string | null; value: number; due_date: string | null };

type Resposta = {
  compromissos: Compromisso[];
  leadsSemContato: LeadNovo[];
  recebiveis: Recebivel[];
  avisos: string[];
};

export default function MeuDia() {
  const [dados, setDados] = useState<Resposta | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      /* O começo e o fim do dia saem do relógio do NAVEGADOR. O servidor roda
         em UTC: se ele decidisse o que é "hoje", das 21h em diante o painel já
         mostraria os compromissos do dia seguinte. */
      const inicio = new Date();
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date();
      fim.setHours(23, 59, 59, 999);

      const j = await chamarApi<Resposta>("agenda", "meu-dia", {
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
      });
      setDados(j);
    } catch (e) {
      setErro((e as Error).message);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (erro) return <div className="mx-auto max-w-[1100px] px-4 py-6"><Erro texto={erro} /></div>;
  if (!dados) return <Carregando />;

  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  const totalReceber = dados.recebiveis.reduce((s, r) => s + (Number(r.value) || 0), 0);

  return (
    <div className="mx-auto max-w-[1100px] space-y-5 px-4 py-6">
      <p className="text-sm capitalize text-slate-400">{hoje}</p>

      {dados.avisos?.length > 0 && <Erro texto={`Parte dos dados não carregou: ${dados.avisos.join(" · ")}`} />}

      <Painel titulo={`Compromissos de hoje (${dados.compromissos.length})`}>
        {dados.compromissos.length === 0 && <Vazio texto="Nenhum compromisso marcado para hoje." />}
        {dados.compromissos.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500/15 px-2.5 py-1 font-mono text-[12.5px] font-semibold text-brand-300">
              <CalendarDays size={13} /> {fmtHora(c.start_time)}
            </span>
            <div className="min-w-0 flex-1">
              <b className="block truncate text-[13.5px] text-white">{c.title}</b>
              <span className="block truncate text-[12px] text-slate-500">{c.client_name} · {c.client_email}</span>
            </div>
            {c.meeting_link && (
              <a href={c.meeting_link} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5">
                <Video size={13} /> Entrar
              </a>
            )}
            <span className="rounded-md border border-white/10 px-2 py-0.5 text-[11px] text-slate-400">{c.status}</span>
          </div>
        ))}
      </Painel>

      <Painel titulo={`Leads esperando contato (${dados.leadsSemContato.length})`}>
        {dados.leadsSemContato.length === 0 && <Vazio texto="Nenhum lead parado na primeira coluna." />}
        {dados.leadsSemContato.map((l) => (
          <div key={l.id} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
            <UserPlus size={15} className="shrink-0 text-slate-500" />
            <div className="min-w-0 flex-1">
              <b className="block truncate text-[13.5px] text-white">{l.name}</b>
              <span className="block truncate text-[12px] text-slate-500">
                {l.product || "Sem interesse informado"} · entrou em {fmtData(l.created_at)}
              </span>
            </div>
            {typeof l.value === "number" && l.value > 0 && (
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-300">
                {BRL.format(l.value)}
              </span>
            )}
            <a href={`mailto:${l.email}`} aria-label={`E-mail para ${l.name}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white">
              <Mail size={14} />
            </a>
            {l.phone && (
              <a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                aria-label={`WhatsApp de ${l.name}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white">
                <Phone size={14} />
              </a>
            )}
          </div>
        ))}
        <Nota>
          &quot;Esperando contato&quot; é o que o banco consegue afirmar: são os leads que
          ainda estão na coluna <b>Novo</b> do CRM. Não existe registro de tentativa de
          contato, então ninguém sabe se você já ligou — mover o card é o que tira o lead daqui.
        </Nota>
      </Painel>

      <Painel titulo={`A receber nos próximos 7 dias — ${BRL.format(totalReceber)}`}>
        {dados.recebiveis.length === 0 && <Vazio texto="Nada vencendo nos próximos 7 dias." />}
        {dados.recebiveis.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
            <Wallet size={15} className="shrink-0 text-slate-500" />
            <div className="min-w-0 flex-1">
              <b className="block truncate text-[13.5px] text-white">{r.subject}</b>
              <span className="block truncate text-[12px] text-slate-500">{r.client_name || "Sem cliente"}</span>
            </div>
            <span className="font-mono text-[12px] text-slate-400">vence {fmtData(r.due_date)}</span>
            <span className="text-[13.5px] font-semibold text-emerald-300">{BRL.format(Number(r.value) || 0)}</span>
          </div>
        ))}
      </Painel>
    </div>
  );
}

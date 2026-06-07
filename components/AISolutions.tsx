"use client";

import { motion } from "framer-motion";
import { MessageSquare, CalendarClock, Video, KanbanSquare, Bot, Zap } from "lucide-react";

const flow = [
  { icon: MessageSquare, title: "Atende e qualifica", desc: "O agente de IA responde dúvidas 24/7 no site e no WhatsApp e entende o que o cliente precisa." },
  { icon: CalendarClock, title: "Agenda sozinho", desc: "Sugere horários livres e envia o link de agendamento para o cliente escolher." },
  { icon: Video, title: "Reunião no Meet", desc: "Cria o evento no Google Meet automaticamente e envia o convite com a pauta." },
  { icon: KanbanSquare, title: "Joga no CRM", desc: "O lead entra no pipeline do CRM no estágio certo, com todo o histórico da conversa." },
];

export default function AISolutions() {
  return (
    <section id="solucoes-ia" className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-72 max-w-4xl -translate-y-1/2 rounded-full bg-accent-violet/10 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300">
            <Bot className="h-4 w-4 text-accent-violet" /> Soluções de Inteligência Artificial
          </div>
          <h2 className="font-display text-3xl font-bold text-white sm:text-5xl">
            Um <span className="gradient-text">agente de IA</span> que atende, agenda e vende por você
          </h2>
          <p className="mt-4 text-slate-400">
            Implantamos agentes de IA que conversam com seus clientes, marcam reuniões no
            Google Meet e alimentam seu CRM — sem intervenção manual, 24 horas por dia.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {flow.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-glow relative rounded-3xl border border-white/10 bg-ink-800/60 p-6"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent-violet to-brand-500 text-white">
                <f.icon className="h-6 w-6" strokeWidth={1.6} />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="font-display text-xs font-bold text-slate-500">0{i + 1}</span>
                <h3 className="font-display text-lg font-bold text-white">{f.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400">
          {["Chatbots", "Agentes IA", "IA para vendas", "IA para suporte", "Análise de dados"].map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
              <Zap className="h-3.5 w-3.5 text-accent-cyan" /> {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

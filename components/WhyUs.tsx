"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ShieldCheck, Clock, TrendingUp, ArrowRight } from "lucide-react";

const pains = [
  "Você perde clientes porque o atendimento não responde a tempo.",
  "Tarefas manuais consomem horas da sua equipe todos os dias.",
  "Seu site não aparece no Google e não gera orçamentos.",
  "Faltam dados para decidir — você opera no escuro.",
];

const gains = [
  "Atendimento e vendas 24/7 com inteligência artificial.",
  "Processos automatizados: menos custo, menos erro.",
  "Presença digital que atrai e converte clientes.",
  "Painéis e relatórios para decidir com clareza.",
];

const IMG =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80";

export default function WhyUs() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <section className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-72 max-w-5xl -translate-y-1/2 rounded-full bg-brand-500/10 blur-[140px]" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">Por que agir agora</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">
            Cada dia sem tecnologia é <span className="gradient-text">dinheiro saindo</span> do seu caixa
          </h2>
          <p className="mt-4 text-slate-400">
            A boa notícia: tudo isso tem solução — e a gente implementa de ponta a ponta.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
          {/* Pain vs Gain */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-rose-300">Sem a HyperGrow</p>
              <ul className="space-y-3">
                {pains.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-glow rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-300">Com a HyperGrow</p>
              <ul className="space-y-3">
                {gains.map((g) => (
                  <li key={g} className="flex items-start gap-2 text-sm text-slate-200">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Image + floating stat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="card-glow relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-600/40 via-ink-800 to-accent-cyan/30">
              {imgOk && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={IMG}
                  alt="Equipe analisando resultados de crescimento em dashboards"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setImgOk(false)}
                  className="h-full w-full object-cover opacity-90"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/10 bg-ink-900/80 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-2 text-sm text-white">
                  <TrendingUp className="h-5 w-5 text-emerald-400" /> Crescimento em foco
                </div>
                <span className="text-xs text-slate-400">resultados reais</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Guarantee / urgency band */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "Diagnóstico gratuito", d: "Avaliamos seu cenário sem custo. Você só avança se fizer sentido para você." },
            { icon: TrendingUp, t: "Foco em ROI", d: "Cada entrega é pensada para gerar resultado e se pagar — não é gasto, é investimento." },
            { icon: Clock, t: "Vagas limitadas", d: "Atendemos poucos projetos por mês para garantir qualidade. Garanta a sua." },
          ].map((c, i) => (
            <motion.div
              key={c.t}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="card-glow rounded-2xl border border-white/10 bg-ink-800/60 p-6"
            >
              <c.icon className="h-7 w-7 text-brand-300" strokeWidth={1.6} />
              <h3 className="mt-3 font-display text-lg font-bold text-white">{c.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{c.d}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#contato"
            className="shine group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-violet px-8 py-4 font-semibold text-white shadow-xl shadow-brand-600/30 transition-transform hover:scale-[1.03]"
          >
            Quero resolver isso agora
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

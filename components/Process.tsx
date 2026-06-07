"use client";

import { motion } from "framer-motion";
import { Lightbulb, Hammer, Rocket, LineChart } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    title: "Descoberta",
    desc: "Entendemos o problema do seu mercado e validamos a ideia antes de escrever uma linha de código.",
  },
  {
    icon: Hammer,
    title: "Construção",
    desc: "Produto completo com IA, banco de dados, painel admin e pagamento — nível Netflix/OpenAI, sem simulações.",
  },
  {
    icon: Rocket,
    title: "Lançamento",
    desc: "Colocamos no ar em domínio próprio, responsivo e automatizado para WhatsApp e e-mail.",
  },
  {
    icon: LineChart,
    title: "Operação & escala",
    desc: "Monitoramos, otimizamos e escalamos — receita recorrente com operação automatizada 24/7.",
  },
];

export default function Process() {
  return (
    <section id="como" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
            Como funciona
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">
            Da ideia ao <span className="gradient-text">produto lucrativo</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-glow relative rounded-3xl border border-white/10 bg-ink-800/60 p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan text-white">
                  <s.icon className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <span className="font-display text-sm font-bold text-slate-500">
                  0{i + 1}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

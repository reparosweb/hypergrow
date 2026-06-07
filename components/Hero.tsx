"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32">
      {/* animated mesh background */}
      <div className="pointer-events-none absolute inset-0 bg-mesh" />
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/30 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-cyan opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cyan" />
          </span>
          Estúdio de produtos digitais que vendem
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl"
        >
          Ideias viram <span className="gradient-text">produtos reais</span>
          <br className="hidden sm:block" /> que geram receita.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg"
        >
          A Nexlab cria, lança e opera SaaS de verdade — agendamento, captação,
          IA, saúde e logística. Não fazemos demonstrações: entregamos produtos
          no ar, com clientes pagando.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href="#produtos"
            className="shine group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-violet px-7 py-3.5 font-semibold text-white shadow-xl shadow-brand-600/30 transition-transform hover:scale-[1.03]"
          >
            Ver os produtos
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#contato"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
          >
            <Play size={16} /> Quero um produto assim
          </a>
        </motion.div>

        {/* floating product chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400"
        >
          {["Agentop", "Marido de Aluguel", "Sorteio Bilionário", "NutriSnap", "Unixx", "Packslog"].map(
            (name) => (
              <span
                key={name}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5"
              >
                {name}
              </span>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}

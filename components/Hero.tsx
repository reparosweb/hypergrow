"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Cpu, BrainCircuit, TrendingUp, BarChart3, Workflow } from "lucide-react";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "";

export default function Hero() {
  const wa = WHATSAPP
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Quero falar com a HyperGrow sobre um projeto.")}`
    : "#contato";

  return (
    <section id="inicio" className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-mesh" />
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/30 blur-[120px]" />
      <div className="pointer-events-none absolute top-10 right-10 h-72 w-72 rounded-full bg-accent-cyan/20 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-cyan opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cyan" />
            </span>
            Transformação digital · IA · Automação
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Crescimento <span className="gradient-text">Exponencial</span> Através da Tecnologia
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-xl text-base text-slate-300 sm:text-lg"
          >
            Criamos websites, e-commerces, sistemas personalizados, automações
            inteligentes e soluções de inteligência artificial para acelerar os
            resultados da sua empresa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="#contato"
              className="shine group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-violet px-7 py-3.5 font-semibold text-white shadow-xl shadow-brand-600/30 transition-transform hover:scale-[1.03]"
            >
              Solicitar Orçamento
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={wa}
              target={WHATSAPP ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
            >
              <MessageCircle size={18} /> Falar no WhatsApp
            </a>
          </motion.div>
        </div>

        {/* Tech illustration: animated dashboard / AI nodes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="card-glow glass relative rounded-3xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <span className="ml-3 text-xs text-slate-400">hypergrow · dashboard</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: BrainCircuit, label: "IA", val: "Online" },
                { icon: Workflow, label: "Automação", val: "24/7" },
                { icon: TrendingUp, label: "Crescimento", val: "+38%" },
              ].map((c, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-ink-900/60 p-3">
                  <c.icon className="h-5 w-5 text-brand-300" strokeWidth={1.6} />
                  <div className="mt-3 text-[10px] uppercase tracking-wide text-slate-500">{c.label}</div>
                  <div className="text-sm font-semibold text-white">{c.val}</div>
                </div>
              ))}
            </div>

            {/* animated bars */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-ink-900/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">Resultados</span>
                <BarChart3 className="h-4 w-4 text-accent-cyan" />
              </div>
              <div className="flex items-end gap-2" style={{ height: 90 }}>
                {[40, 62, 48, 78, 90, 70, 96].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.07 }}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-brand-600 to-accent-cyan"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* floating chips */}
          <div className="absolute -left-6 top-10 animate-float rounded-2xl border border-white/10 bg-ink-800/80 px-4 py-2 text-xs text-slate-200 shadow-lg backdrop-blur">
            <Cpu className="mr-1 inline h-3.5 w-3.5 text-accent-cyan" /> Sistemas sob medida
          </div>
          <div className="absolute -right-4 bottom-12 animate-float rounded-2xl border border-white/10 bg-ink-800/80 px-4 py-2 text-xs text-slate-200 shadow-lg backdrop-blur" style={{ animationDelay: "1.5s" }}>
            <BrainCircuit className="mr-1 inline h-3.5 w-3.5 text-accent-violet" /> Agente de IA
          </div>
        </motion.div>
      </div>
    </section>
  );
}

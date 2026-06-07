"use client";

import { motion } from "framer-motion";
import { ProductIcon } from "./Icon";
import { processSteps } from "@/lib/content";

export default function Process() {
  return (
    <section id="processo" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">Processo</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">
            Do diagnóstico ao <span className="gradient-text">crescimento</span>
          </h2>
        </div>

        <div className="relative mt-16">
          {/* connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
          <div className="grid gap-8 md:grid-cols-5">
            {processSteps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-ink-900 text-white shadow-lg">
                  <ProductIcon name={s.icon} className="h-6 w-6 text-brand-300" />
                </div>
                <div className="mt-4 font-display text-xs font-bold text-slate-500">PASSO {i + 1}</div>
                <h3 className="mt-1 font-display text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

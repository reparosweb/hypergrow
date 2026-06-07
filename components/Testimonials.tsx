"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { testimonials } from "@/lib/content";

export default function Testimonials() {
  const [i, setI] = useState(0);
  const n = testimonials.length;
  const go = (d: number) => setI((p) => (p + d + n) % n);
  const t = testimonials[i];

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">Depoimentos</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Quem trabalha com a gente, <span className="gradient-text">cresce</span>
          </h2>
        </div>

        <div className="card-glow relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-ink-800/60 p-8 sm:p-12">
          <Quote className="h-10 w-10 text-brand-500/40" />
          <div className="min-h-[150px]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="mt-4"
              >
                <p className="text-lg leading-relaxed text-slate-200 sm:text-xl">“{t.quote}”</p>
                <footer className="mt-6">
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-slate-400">{t.role}</div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Depoimento ${idx + 1}`}
                  onClick={() => setI(idx)}
                  className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-brand-400" : "w-2 bg-white/20"}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => go(-1)} aria-label="Anterior" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => go(1)} aria-label="Próximo" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

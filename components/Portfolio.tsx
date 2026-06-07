"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ProductIcon } from "./Icon";
import { products, portfolioCategories } from "@/lib/products";

export default function Portfolio() {
  const [active, setActive] = useState<string>("Todos");

  const filtered =
    active === "Todos" ? products : products.filter((p) => p.tags.includes(active));

  return (
    <section id="portfolio" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">Portfólio</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">
            Projetos reais, <span className="gradient-text">no ar e gerando receita</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Não mostramos mockups. Cada projeto abaixo é um produto que construímos e que está rodando hoje.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {portfolioCategories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                active === c
                  ? "border-brand-400 bg-brand-500/20 text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.article
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
                className="card-glow group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-800/60 p-6"
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-50"
                  style={{ background: p.accent }}
                />
                <div className="flex items-start justify-between">
                  <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${p.gradient} text-white shadow-lg`}>
                    <ProductIcon name={p.icon} className="h-7 w-7" />
                  </div>
                  <div className="flex flex-wrap justify-end gap-1">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-white">{p.name}</h3>
                <p className="mt-2 text-sm text-slate-300">{p.tagline}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{p.solution}</p>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-white transition-colors hover:text-brand-300"
                >
                  Ver projeto
                  <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ProductIcon } from "./Icon";
import { services } from "@/lib/content";

export default function Services() {
  return (
    <section id="servicos" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">Serviços</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">
            Tudo o que sua empresa precisa para <span className="gradient-text">crescer</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Da primeira linha de código à inteligência artificial que vende por você.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.article
              key={s.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="card-glow group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-800/60 p-6"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-50"
                style={{ background: s.accent }}
              />
              <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${s.gradient} text-white shadow-lg`}>
                <ProductIcon name={s.icon} className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.description}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {s.items.map((it) => (
                  <li
                    key={it}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                  >
                    <Check className="h-3 w-3" style={{ color: s.accent }} />
                    {it}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

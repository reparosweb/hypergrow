"use client";

import { motion } from "framer-motion";
import { ProductIcon } from "./Icon";
import { differentials } from "@/lib/content";

export default function Differentials() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">Diferenciais</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Por que escolher a <span className="gradient-text">HyperGrow</span>?
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {differentials.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}
              className="card-glow group rounded-2xl border border-white/10 bg-ink-800/60 p-5 text-center"
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan text-white transition-transform group-hover:scale-110">
                <ProductIcon name={d.icon} className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{d.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

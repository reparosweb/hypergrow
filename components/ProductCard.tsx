"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { ProductIcon } from "./Icon";
import type { Product } from "@/lib/products";

const statusLabel: Record<Product["status"], string> = {
  live: "No ar",
  beta: "Em beta",
  soon: "Em breve",
};

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="card-glow group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-800/60 p-6"
      style={{ ["--accent" as string]: product.accent }}
    >
      {/* accent glow blob */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: product.accent }}
      />

      <div className="mb-5 flex items-start justify-between">
        <div
          className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${product.gradient} text-white shadow-lg`}
        >
          <ProductIcon name={product.icon} className="h-7 w-7" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: product.status === "live" ? "#22c55e" : "#f59e0b" }}
          />
          {statusLabel[product.status]}
        </span>
      </div>

      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {product.category}
      </p>
      <h3 className="mt-1 font-display text-2xl font-bold text-white">{product.name}</h3>
      <p className="mt-2 text-sm text-slate-300">{product.tagline}</p>

      <p className="mt-4 text-sm leading-relaxed text-slate-400">{product.solution}</p>

      <ul className="mt-5 space-y-2">
        {product.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: product.accent }} />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
        <span className="text-xs text-slate-500">{product.audience}</span>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-white transition-colors hover:text-brand-300"
        >
          Acessar
          <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </motion.article>
  );
}

"use client";

import { motion } from "framer-motion";
import { stats } from "@/lib/products";

export default function Stats() {
  return (
    <section className="relative py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="glass grid grid-cols-2 gap-6 rounded-3xl px-6 py-10 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="font-display text-3xl font-bold text-white sm:text-4xl">
                <span className="gradient-text">{s.value}</span>
              </div>
              <div className="mt-1 text-xs text-slate-400 sm:text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

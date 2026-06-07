"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="sobre" className="relative py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="card-glow relative overflow-hidden rounded-3xl border border-white/10 bg-ink-800/60 p-8 sm:p-14">
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-accent-violet/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-accent-cyan/20 blur-3xl" />

          <div className="relative grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
                Sobre a Nexlab
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                Um estúdio que <span className="gradient-text">opera</span>, não só desenha.
              </h2>
              <p className="mt-4 text-slate-400">
                A Nexlab não entrega protótipo bonito que morre na gaveta.
                Construímos, lançamos e operamos cada produto como um negócio:
                com IA real, banco de dados, painel administrativo, pagamento e
                automação de ponta a ponta.
              </p>
              <p className="mt-4 text-slate-400">
                Nosso portfólio cobre saúde, serviços, apostas, nutrição e
                logística — sempre com a mesma régua: nível mundial, experiência
                surpreendente e foco em receita recorrente.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { k: "Produtos próprios", v: "6" },
                { k: "Mercados atendidos", v: "5" },
                { k: "Operação", v: "24/7" },
                { k: "Construído com IA", v: "100%" },
              ].map((item, i) => (
                <motion.div
                  key={item.k}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="glass rounded-2xl p-5 text-center"
                >
                  <div className="font-display text-3xl font-bold gradient-text">
                    {item.v}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{item.k}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

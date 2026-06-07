"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Bot, CalendarClock } from "lucide-react";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  const wa = WHATSAPP
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Quero falar com a HyperGrow.")}`
    : "#contato";

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="glass fixed bottom-24 right-5 z-50 w-[320px] overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-accent-violet px-4 py-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Assistente HyperGrow</p>
                <p className="text-[11px] text-white/80">Online · responde na hora</p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="rounded-2xl rounded-tl-sm bg-ink-800 px-4 py-3 text-sm text-slate-200">
                Olá! 👋 Sou o assistente da HyperGrow. Posso tirar dúvidas e já
                marcar uma reunião com nosso time. Como prefere começar?
              </div>
              <a
                href={wa}
                target={WHATSAPP ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white"
              >
                <MessageCircle size={16} /> Falar no WhatsApp
              </a>
              <a
                href="#contato"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <CalendarClock size={16} /> Solicitar orçamento / reunião
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir chat"
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-violet text-white shadow-xl shadow-brand-600/40 transition-transform hover:scale-110"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}

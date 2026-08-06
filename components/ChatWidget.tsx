"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Bot, Send, CalendarClock, Loader2 } from "lucide-react";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "";
const CALCOM = process.env.NEXT_PUBLIC_CALCOM_LINK || "";

type Msg = { role: "user" | "assistant"; content: string };

/* ─────────────────────────────────────────────────────────────────────────────
   POSIÇÃO DOS ELEMENTOS FLUTUANTES — contrato com app/claro-tokens.css.

   Este botão e o `.wa-f` (WhatsApp, em components/claro/ClaroClose.tsx) ficavam
   os dois no canto inferior direito, praticamente no mesmo ponto: `bottom-5
   right-5` aqui contra `right:22px;bottom:22px` lá. Em telas ≤600px o WhatsApp
   perde o rótulo e vira um círculo — aí a sobreposição deixava de ser "quase" e
   passava a esconder um botão atrás do outro.

   A régua agora é única e mora no `:root` de claro-tokens.css (bloco `--fab-*`):
   este botão é o DEGRAU 1 (canto) e o WhatsApp o DEGRAU 2, sempre `--fab-gap`
   acima. Os `var(..., fallback)` abaixo mantêm o widget funcional em qualquer
   rota que não carregue aquela folha.

   `env(safe-area-inset-bottom)` no fallback: sem isso, no iPhone o botão fica
   por baixo da barra de gestos (a faixa preta que o iOS reserva embaixo) e o
   toque só pega na metade de cima dele.

   O PAINEL usa `dvh`, não `vh`: `100vh` no iOS mede a tela COM a barra de
   endereço recolhida, então um painel de 480px em aparelho de tela baixa (ou em
   paisagem) era cortado por baixo pela barra do navegador. Fica em CSS, e não
   em style inline, porque precisa de duas declarações em cascata (`vh` como
   reserva, `dvh` por cima) — coisa que um objeto de estilo do React não
   permite, já que a segunda chave sobrescreveria a primeira.
   Sempre `dangerouslySetInnerHTML` (regra 1 da skill hg-regras-de-bug). */
const FAB_CSS = `
  .hg-fab{
    position:fixed;
    right:var(--fab-r,calc(20px + env(safe-area-inset-right,0px)));
    bottom:var(--fab-b,calc(20px + env(safe-area-inset-bottom,0px)));
  }
  .hg-chat-panel{
    position:fixed;
    right:var(--fab-r,calc(20px + env(safe-area-inset-right,0px)));
    bottom:calc(var(--fab-b,calc(20px + env(safe-area-inset-bottom,0px))) + var(--fab-size,56px) + var(--fab-gap,12px));
    width:350px;
    max-width:calc(100vw - 2.5rem);
    height:480px;
    max-height:calc(100vh - 150px - env(safe-area-inset-bottom,0px));
    max-height:calc(100dvh - 150px - env(safe-area-inset-bottom,0px));
  }
  /* Celular deitado: sobra tão pouca altura que o painel encosta nas duas
     bordas. Vira uma folha quase de tela cheia, que é o comportamento que um
     aplicativo teria. */
  @media(max-height:520px){
    .hg-chat-panel{
      top:calc(12px + env(safe-area-inset-top,0px));
      height:auto;
      max-height:none;
    }
  }
`;

const GREETING: Msg = {
  role: "assistant",
  content:
    "Olá! Sou o assistente da HyperGrow. Posso tirar dúvidas sobre sites, sistemas, automação e IA — e já marcar uma reunião com nosso time. Como posso ajudar?",
};

function calUrl() {
  if (!CALCOM) return "#contato";
  return CALCOM.startsWith("http") ? CALCOM : `https://cal.com/${CALCOM}`;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  const wa = WHATSAPP
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Quero falar com a HyperGrow.")}`
    : "#contato";

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m.role !== "assistant" || m !== GREETING) }),
      });
      const json = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: json.reply || "..." }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Tive um problema de conexão. Tente novamente ou fale no WhatsApp." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="glass hg-chat-panel z-50 flex flex-col overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-accent-violet px-4 py-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Assistente HyperGrow</p>
                <p className="text-[11px] text-white/80">Online · responde na hora</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Fechar" className="text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${
                      m.role === "user"
                        ? "rounded-br-sm bg-brand-600 text-white"
                        : "rounded-tl-sm bg-ink-800 text-slate-200"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm bg-ink-800 px-3.5 py-2.5 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-3">
              <div className="mb-2 flex gap-2">
                <a
                  href={calUrl()}
                  target={CALCOM ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  <CalendarClock size={14} /> Agendar reunião
                </a>
                <a
                  href={wa}
                  target={WHATSAPP ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-semibold text-white"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>
              <form onSubmit={send} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escreva sua mensagem..."
                  className="flex-1 rounded-full border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-400"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Enviar"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-violet text-white disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar chat" : "Abrir chat"}
        aria-expanded={open}
        className="hg-fab z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-violet text-white shadow-xl shadow-brand-600/40 transition-transform hover:scale-110"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      <style dangerouslySetInnerHTML={{ __html: FAB_CSS }} />
    </>
  );
}

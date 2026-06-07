"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { products } from "@/lib/products";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || ""; // ex: 5532999999999

export default function LeadForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok && json.ok) {
        setStatus("ok");
        form.reset();
      } else {
        setStatus("error");
        setErrorMsg(json.error || "Algo deu errado. Tente novamente.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Sem conexão. Tente novamente ou fale no WhatsApp.");
    }
  }

  const whatsappHref = WHATSAPP
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
        "Olá! Vim pelo site da Nexlab e quero conversar sobre um produto."
      )}`
    : null;

  if (status === "ok") {
    return (
      <div className="glass flex flex-col items-center rounded-3xl p-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-400" />
        <h3 className="mt-4 font-display text-2xl font-bold text-white">
          Recebemos sua mensagem!
        </h3>
        <p className="mt-2 max-w-sm text-slate-400">
          Nossa equipe vai entrar em contato em breve. Quer agilizar? Fale com a
          gente agora mesmo.
        </p>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white"
          >
            <MessageCircle size={18} /> Chamar no WhatsApp
          </a>
        )}
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-slate-400 underline-offset-4 hover:underline"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 sm:p-8">
      {/* honeypot */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px]"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome *">
          <input
            name="name"
            required
            minLength={2}
            placeholder="Seu nome"
            className="input"
          />
        </Field>
        <Field label="E-mail *">
          <input
            name="email"
            type="email"
            required
            placeholder="voce@email.com"
            className="input"
          />
        </Field>
        <Field label="WhatsApp / Telefone">
          <input name="phone" placeholder="(00) 00000-0000" className="input" />
        </Field>
        <Field label="Tenho interesse em">
          <select name="product" defaultValue="" className="input">
            <option value="">Selecione um produto</option>
            {products.map((p) => (
              <option key={p.slug} value={p.name}>
                {p.name}
              </option>
            ))}
            <option value="Produto sob medida">Um produto sob medida</option>
          </select>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Mensagem">
          <textarea
            name="message"
            rows={4}
            placeholder="Conte rapidamente o que você precisa..."
            className="input resize-none"
          />
        </Field>
      </div>

      {status === "error" && (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {errorMsg}
          {whatsappHref && (
            <>
              {" "}
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="underline">
                Falar no WhatsApp
              </a>
            </>
          )}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={status === "loading"}
          className="shine inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-violet px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Enviando...
            </>
          ) : (
            <>
              <Send size={18} /> Enviar mensagem
            </>
          )}
        </button>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-slate-300">{label}</span>
      {children}
    </label>
  );
}

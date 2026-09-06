"use client";

import { useState } from "react";
import { Mail, CheckCheck, Bell } from "lucide-react";
import { EVENTOS, rastrear } from "@/lib/track";

/* ─────────────────────────────────────────────────────────────────────────────
   CADASTRO DE NOVIDADES (e-mail + WhatsApp) — pedido do dono (2026-08-16):
   um campo onde o visitante deixa e-mail e WhatsApp para receber novidades, e
   "isso precisa estar ativo".

   ATIVO DE VERDADE (o que faz e o que ainda não faz — honestidade obrigatória):
   · a CAPTURA está ativa: o contato é gravado no mesmo /api/lead + Supabase que
     o resto do site usa, com source="newsletter". Aparece no CRM na hora, dá
     para filtrar por origem. Isso funciona sem o dono configurar nada.
   · o ENVIO das novidades (mandar de fato o e-mail/WhatsApp) NÃO é automático
     ainda: depende de um provedor de e-mail (Resend) e de uma ferramenta de
     disparo, que são item do checklist do dono. Enquanto isso, os inscritos
     ficam guardados e podem ser exportados/disparados quando ligar. O texto da
     tela promete "novidades", não "e-mail automático na hora" — para não
     prometer o que ainda não dispara sozinho.
   ──────────────────────────────────────────────────────────────────────────── */

export default function ClaroNews() {
  const [email, setEmail] = useState("");
  const [whats, setWhats] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const mail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) {
      setErro("Confira o e-mail: falta algo nele.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // /api/lead exige nome (o comercial descobre o resto depois). Aqui é
          // inscrição, não lead de venda: marcamos a origem no lugar do nome.
          name: "Novidades",
          email: mail,
          phone: whats.trim() || undefined,
          message: "Cadastro para receber novidades da HyperGrow.",
          source: "newsletter",
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setOk(true);
        rastrear(EVENTOS.leadEnviado, { origem: "newsletter" });
      } else {
        setErro(j.error || "Não foi possível cadastrar agora. Tente de novo em instantes.");
      }
    } catch {
      setErro("Sem conexão agora. Tente de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="sec cl-news-sec" aria-labelledby="cl-news-t">
      <div className="wrap">
        <div className="cl-news lit">
          <div className="cl-news-body">
            <span className="cl-news-kicker">
              <Bell size={13} aria-hidden /> Novidades
            </span>
            <h2 className="cl-news-h" id="cl-news-t">
              Receba o que a gente aprende operando
            </h2>
            <p className="cl-news-p">
              Ferramenta grátis nova, guia prático de e-commerce e marketing, e o que
              funciona de verdade — direto no seu e-mail e no WhatsApp. Sem spam, sai quando quiser.
            </p>
          </div>

          {ok ? (
            <p className="cl-news-ok" role="status">
              <CheckCheck size={17} aria-hidden /> Pronto! Você está na lista. As novidades chegam
              assim que sairem.
            </p>
          ) : (
            <form className="cl-news-form" onSubmit={enviar}>
              <div className="cl-news-row">
                <label className="cl-news-lbl" htmlFor="cl-news-email">Seu e-mail</label>
                <input
                  id="cl-news-email" type="email" inputMode="email" autoComplete="email"
                  className="cl-news-in" placeholder="voce@email.com.br" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!erro} aria-describedby={erro ? "cl-news-e" : undefined}
                />
              </div>
              <div className="cl-news-row">
                <label className="cl-news-lbl" htmlFor="cl-news-whats">WhatsApp (opcional)</label>
                <input
                  id="cl-news-whats" type="tel" inputMode="tel" autoComplete="tel"
                  className="cl-news-in" placeholder="(11) 90000-0000" value={whats}
                  onChange={(e) => setWhats(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-p cl-news-btn" disabled={enviando}>
                <Mail size={16} aria-hidden /> {enviando ? "Cadastrando…" : "Quero receber"}
              </button>
              {erro && <span className="cl-news-err" id="cl-news-e">{erro}</span>}
              <span className="cl-news-note">
                Ao cadastrar, você concorda em receber novidades da HyperGrow. Pode sair a
                qualquer momento.
              </span>
            </form>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .cl .cl-news-sec{padding-top:clamp(40px,5vw,64px);padding-bottom:clamp(40px,5vw,64px)}
        .cl .cl-news{--acc:var(--brand);--beam:var(--brand);position:relative;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:clamp(24px,4vw,52px);align-items:center;
          padding:clamp(24px,3.2vw,40px);border-radius:22px;border:1px solid var(--line);
          background:radial-gradient(120% 140% at 0% 0%,var(--acc-soft),transparent 58%),var(--card);box-shadow:var(--sh-2)}
        .cl .cl-news-body{min-width:0}
        .cl .cl-news-kicker{display:inline-flex;align-items:center;gap:7px;font:600 11px var(--font-mono);letter-spacing:.16em;text-transform:uppercase;color:var(--brand);
          padding:6px 12px;border-radius:999px;border:1px solid var(--acc-line);background:var(--acc-soft)}
        .cl .cl-news-h{font:800 clamp(24px,3vw,34px)/1.08 var(--font-display);letter-spacing:-.03em;color:var(--ink);margin:14px 0 0;text-wrap:balance}
        .cl .cl-news-p{font:400 clamp(14.5px,1.3vw,16px)/1.6 var(--font-sans);color:var(--ink-2);margin:12px 0 0;max-width:50ch;text-wrap:pretty}
        .cl .cl-news-form{min-width:0;display:flex;flex-direction:column;gap:12px}
        .cl .cl-news-row{display:flex;flex-direction:column;gap:6px}
        .cl .cl-news-lbl{font:600 13px var(--font-sans);color:var(--ink)}
        .cl .cl-news-in{width:100%;min-height:50px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--card);font:400 15px var(--font-sans);color:var(--ink);
          transition:border-color .2s var(--ease),box-shadow .2s var(--ease)}
        .cl .cl-news-in::placeholder{color:var(--ink-3)}
        .cl .cl-news-in:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 3px var(--acc-soft)}
        .cl .cl-news-in[aria-invalid=true]{border-color:var(--cta)}
        .cl .cl-news-btn{margin-top:2px;justify-content:center;gap:8px}
        .cl .cl-news-err{font:500 12.5px var(--font-sans);color:var(--cta)}
        .cl .cl-news-note{font:400 12px/1.5 var(--font-sans);color:var(--ink-3)}
        .cl .cl-news-ok{display:flex;align-items:center;gap:10px;padding:16px 18px;border-radius:14px;
          background:rgba(15,157,88,.08);border:1px solid rgba(15,157,88,.24);font:500 15px var(--font-sans);color:var(--wa)}
        @media(max-width:760px){ .cl .cl-news{grid-template-columns:1fr} }
      ` }} />
    </section>
  );
}

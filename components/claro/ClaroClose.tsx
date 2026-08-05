"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Quote, Plus, Minus, MessageCircle, Mail, ArrowUpRight, Check, Send, Clock,
} from "lucide-react";
import { HOME_FAQ } from "@/lib/home-faq";
import { ClaroLogo, ClaroHead } from "./ClaroUI";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "";

/* Mesma regra do site escuro: nada que dependa de env var pode mudar o que é
   renderizado na PRIMEIRA passagem (servidor vs. cliente) — já quebrou
   hidratação aqui uma vez. `ativo` começa false em toda renderização e só
   "liga" depois do mount. */
function useClaroWhatsApp() {
  const [pronto, setPronto] = useState(false);
  useEffect(() => { setPronto(true); }, []);
  const ativo = pronto && !!WHATSAPP;
  return { ativo, url: ativo ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Quero falar com a HyperGrow.")}` : "#contato" };
}

/* ─────────────────────────────────────────────────────────────────────────────
   RESULTADOS (case) e DEPOIMENTOS — ⚠️ PLACEHOLDER, por decisão explícita do
   dono nesta sessão ("manter como placeholder por ora"). O case de evolução
   mês-a-mês e as 3 falas de cliente são as MESMAS do mockup original — não
   foi inventado nada NOVO, só portado com o aviso de que precisam virar dado
   real (ou sair do ar) antes desta rota ser promovida a produção.

   Diferença deliberada do mockup: os depoimentos usavam foto de banco (Pexels)
   como se fosse o rosto da pessoa que "disse" a frase — isso não foi portado.
   Aqui é iniciais num círculo, sem vincular rosto de banco a uma citação que a
   pessoa nunca disse. ────────────────────────────────────────────────────── */
const RESULTADOS_PLACEHOLDER = [
  { t: "Mês 0 · Diagnóstico", d: "Loja com tráfego caro, ficha de produto incompleta e nenhum acompanhamento de pedido. Faturamento oscilando entre R$ 48 mil e R$ 90 mil.", k: "Ponto de partida", hex: "#B0155F" },
  { t: "Mês 3 · Estrutura", d: "Produtos recadastrados, ERP integrado, checkout otimizado e campanhas reorganizadas por margem — não por volume.", k: "Base arrumada", hex: "#A8560B" },
  { t: "Mês 12 · Escala", d: "Faturamento médio de R$ 210 mil/mês, ROAS 7,4 e um time que sabe o que fazer sem esperar reunião.", k: "Crescimento sustentável", hex: "#1550E8" },
] as const;

export function ClaroResultados() {
  return (
    <section id="resultados" className="sec alt">
      <div className="wrap">
        <ClaroHead center eyebrow="Resultados" sub="Um caso real, mês a mês. Sem gráfico bonito sem contexto — o que mudou na operação e o que isso fez com o faturamento.">
          A evolução de <span className="grad">um cliente nosso</span>
        </ClaroHead>
        {/* ⚠️ PLACEHOLDER — ver comentário acima. */}
        <div className="cl-res-g">
          {RESULTADOS_PLACEHOLDER.map((s, i) => (
            <article className="card cl-res-c rv" key={s.t}>
              <span className="cl-res-n" style={{ background: s.hex }}>{i + 1}</span>
              <span className="mono" style={{ color: s.hex }}>{s.k}</span>
              <h3 className="h3" style={{ marginTop: 8 }}>{s.t}</h3>
              <p className="body" style={{ marginTop: 10 }}>{s.d}</p>
            </article>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .cl-res-g{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:40px}
        .cl-res-c{position:relative;padding:30px 26px 26px}
        .cl-res-n{position:absolute;top:-16px;left:26px;width:34px;height:34px;border-radius:99px;color:#fff;display:inline-flex;align-items:center;justify-content:center;font:700 15px var(--disp);box-shadow:var(--sh-2)}
        @media(max-width:900px){.cl-res-g{grid-template-columns:1fr}}
      `}} />
    </section>
  );
}

const DEPOIMENTOS_PLACEHOLDER = [
  { q: "Entrei achando que precisava de mais anúncio. Saí com a loja arrumada, o estoque batendo com o ERP e o faturamento previsível. A diferença foi o método.", n: "Sócia-proprietária", r: "Loja de decoração" },
  { q: "A automação de WhatsApp resolveu o que eu não conseguia: responder rápido. Hoje o cliente é atendido em segundos, mesmo de madrugada.", n: "Diretor de operações", r: "Clínica multiprofissional" },
  { q: "Em três meses o cadastro de produtos deixou de ser gargalo e o tráfego passou a dar lucro, não só visita.", n: "Fundador", r: "Marca de moda" },
] as const;

export function ClaroDepoimentos() {
  return (
    <section id="depoimentos" className="sec">
      <div className="wrap">
        <ClaroHead center eyebrow="Clientes" sub="Três frases que resumem por que as pessoas ficam.">Quem trabalha com a gente, <span className="grad">cresce</span></ClaroHead>
        {/* ⚠️ PLACEHOLDER — ver comentário no topo do arquivo. */}
        <div className="g g-280" style={{ marginTop: 40 }}>
          {DEPOIMENTOS_PLACEHOLDER.map((t) => {
            const iniciais = t.n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
            return (
              <article className="card rv" key={t.n} style={{ padding: 26, display: "flex", flexDirection: "column" }}>
                <Quote size={26} style={{ color: "var(--brand)", opacity: 0.5 }} />
                <p style={{ font: "400 16.5px/1.6 var(--text)", color: "var(--ink)", marginTop: 14, flex: 1, textWrap: "pretty" }}>{t.q}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line-2)" }}>
                  <span aria-hidden style={{ width: 46, height: 46, borderRadius: 99, background: "var(--paper-2)", border: "1px solid var(--line)", display: "inline-flex", alignItems: "center", justifyContent: "center", font: "700 15px var(--disp)", color: "var(--ink-3)", flexShrink: 0 }}>{iniciais}</span>
                  <div>
                    <div style={{ font: "600 14.5px var(--text)", color: "var(--ink)" }}>{t.n}</div>
                    <div className="small">{t.r}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ — reaproveita HOME_FAQ (lib/home-faq.ts), mesma fonte que já vira
   schema FAQPage na home escura. Zero pergunta nova inventada aqui. ────────── */
export function ClaroFaq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="sec alt">
      <div className="wrap" style={{ maxWidth: 880 }}>
        <ClaroHead center eyebrow="Dúvidas" sub="Perguntas honestas, respostas honestas.">Antes que você <span className="grad">pergunte</span></ClaroHead>
        <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 10 }}>
          {HOME_FAQ.map((item, i) => {
            const on = open === i;
            return (
              <div className="card rv" key={item.q} style={{ padding: 0, overflow: "hidden", transform: "none" }}>
                <button type="button" onClick={() => setOpen(on ? -1 : i)} aria-expanded={on} aria-controls={`cl-faq-${i}`}
                  style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", background: "none", border: "none", padding: "19px 22px", font: "600 16.5px var(--text)", color: "var(--ink)", minHeight: 44 }}>
                  <span style={{ flex: 1 }}>{item.q}</span>
                  {on ? <Minus size={18} style={{ color: "var(--brand)", flexShrink: 0 }} /> : <Plus size={18} style={{ color: "var(--brand)", flexShrink: 0 }} />}
                </button>
                <div id={`cl-faq-${i}`} hidden={!on}>
                  <p className="body cl-faq-a" style={{ padding: "0 22px 22px" }}>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .cl-faq-a{animation:cl-faqin .3s var(--ease)}
        @keyframes cl-faqin{from{opacity:0;transform:translateY(-4px)}}
      `}} />
    </section>
  );
}

/* ── Contato — formulário PRÓPRIO desta rota (não reaproveita ContactForm.tsx:
   aquele componente tem cor de tema ESCURO fixa no código, incompatível com
   fundo claro). Mesma lógica de envio: POST /api/lead, mesmos nomes de campo
   — a rota /api/lead não foi tocada, então cai no MESMO CRM em /admin. ────── */
export function ClaroContato() {
  const [form, setForm] = useState({ nome: "", email: "", zap: "", empresa: "", servico: "", msg: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const wa = useClaroWhatsApp();
  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.nome, email: form.email, phone: form.zap, product: form.servico || form.empresa, message: form.msg }),
      });
      const j = await res.json();
      if (res.ok && j.ok) setSent(true);
      else setErr(j.error || "Não foi possível enviar. Tente novamente.");
    } catch {
      setErr("Sem conexão. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contato" className="sec">
      <div className="wrap">
        <div className="split" style={{ alignItems: "start" }}>
          <div>
            <ClaroHead eyebrow="Contato" sub="Conte o que está travando. A gente responde com um diagnóstico, não com um orçamento genérico.">
              Vamos olhar <span className="grad">a sua operação</span>
            </ClaroHead>
            <div className="rv" style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
              {wa.ativo ? (
                <a className="card cl-ct-row" href={wa.url} target="_blank" rel="noreferrer">
                  <span className="cl-ct-ic" style={{ background: "rgba(15,157,88,.1)", color: "var(--wa)" }}><MessageCircle size={19} /></span>
                  <span><b>WhatsApp</b><em>resposta no mesmo dia útil</em></span>
                  <ArrowUpRight size={17} style={{ marginLeft: "auto", color: "var(--ink-3)" }} />
                </a>
              ) : (
                <div className="card cl-ct-row" style={{ cursor: "default" }}>
                  <span className="cl-ct-ic" style={{ background: "var(--paper-2)", color: "var(--ink-3)" }}><Clock size={19} /></span>
                  <span><b>Formulário ao lado</b><em>resposta em até 1 dia útil</em></span>
                </div>
              )}
              {/* Sem link mailto: o domínio hypergrow.com.br ainda não existe
                  (confirmado por DNS nesta sessão) — anunciar e-mail que devolve
                  erro é pior que não anunciar. */}
              <div className="card cl-ct-row" style={{ cursor: "default" }}>
                <span className="cl-ct-ic" style={{ background: "rgba(21,80,232,.1)", color: "var(--brand)" }}><Mail size={19} /></span>
                <span><b>Formulário oficial</b><em>cai direto no nosso painel</em></span>
              </div>
            </div>
          </div>

          <form className="card rv" style={{ padding: 28, transform: "none" }} onSubmit={submit}>
            {sent ? (
              <div role="status" aria-live="polite" style={{ textAlign: "center", padding: "30px 6px" }}>
                <span style={{ width: 54, height: 54, borderRadius: 99, background: "rgba(15,157,88,.1)", color: "var(--wa)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Check size={26} /></span>
                <h3 className="h3" style={{ marginTop: 16 }}>Recebido.</h3>
                <p className="body" style={{ marginTop: 8 }}>Retornamos no próximo dia útil com um primeiro diagnóstico da sua operação.</p>
              </div>
            ) : (
              <>
                <div className="cl-f-g">
                  <label>Seu nome<input id="cl-nome" name="nome" autoComplete="name" required placeholder="Como te chamamos?" value={form.nome} onChange={set("nome")} /></label>
                  <label>E-mail<input id="cl-email" name="email" type="email" autoComplete="email" required placeholder="voce@empresa.com.br" value={form.email} onChange={set("email")} /></label>
                  <label>WhatsApp<input id="cl-zap" name="telefone" autoComplete="tel" required placeholder="(00) 00000-0000" value={form.zap} onChange={set("zap")} /></label>
                  <label>Empresa / loja<input id="cl-empresa" name="empresa" autoComplete="organization" placeholder="Nome do negócio" value={form.empresa} onChange={set("empresa")} /></label>
                </div>
                <label style={{ display: "block", marginTop: 14 }} htmlFor="cl-servico">O que você precisa
                  <select id="cl-servico" name="servico" value={form.servico} onChange={set("servico")}>
                    <option value="">Selecione uma frente</option>
                    {["Vender online", "Atrair demanda", "Marca & conteúdo", "Operar com IA"].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </label>
                <label style={{ display: "block", marginTop: 14 }} htmlFor="cl-msg">Onde está travando
                  <textarea id="cl-msg" name="mensagem" rows={4} placeholder='Ex.: a loja tem visita mas não vende; o estoque não bate com o ERP…' value={form.msg} onChange={set("msg")} />
                </label>
                {err && <p role="alert" className="small" style={{ marginTop: 12, color: "#B0155F" }}>{err}</p>}
                <button className="btn btn-p" style={{ width: "100%", marginTop: 18 }} type="submit" disabled={loading}>
                  {loading ? "Enviando..." : "Quero meu diagnóstico"} <Send size={16} />
                </button>
                <p className="small" style={{ marginTop: 12, textAlign: "center" }}>Sem spam. Sem ligação de vendas sem aviso.</p>
              </>
            )}
          </form>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .cl-ct-row{display:flex;align-items:center;gap:13px;padding:17px 18px;color:var(--ink);text-decoration:none}
        .cl-ct-ic{flex-shrink:0;width:40px;height:40px;border-radius:11px;display:inline-flex;align-items:center;justify-content:center}
        .cl-ct-row b{display:block;font:600 15.5px var(--text)}
        .cl-ct-row em{display:block;font:400 13.5px var(--text);font-style:normal;color:var(--ink-3);margin-top:2px}
        .cl-f-g{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        #contato form label{display:block;font:600 13.5px var(--text);color:var(--ink-2)}
        #contato form input,#contato form select,#contato form textarea{display:block;width:100%;box-sizing:border-box;margin-top:7px;padding:13px 14px;border:1px solid var(--line);border-radius:11px;background:#fff;font:400 15.5px var(--text);color:var(--ink);transition:border-color .2s,box-shadow .2s}
        #contato form input:focus,#contato form select:focus,#contato form textarea:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 3px rgba(21,80,232,.14)}
        #contato form textarea{resize:vertical}
        @media(max-width:560px){.cl-f-g{grid-template-columns:1fr}}
      `}} />
    </section>
  );
}

export function ClaroFooter() {
  return (
    <footer style={{ background: "var(--ink)", color: "#fff", paddingTop: 62 }}>
      <div className="wrap">
        <div className="cl-ft-g">
          <div>
            <ClaroLogo height={40} light />
            <p style={{ font: "400 15px/1.6 var(--text)", color: "rgba(255,255,255,.6)", marginTop: 16, maxWidth: 300 }}>
              Marketing, e-commerce e automação operados por gente — com método, transparência e responsabilidade de dono.
            </p>
          </div>
          {[
            ["Frentes", ["Vender online", "Atrair demanda", "Marca & conteúdo", "Operar com IA"]],
            ["Empresa", ["Nossa agência", "Resultados", "Diagnóstico gratuito", "Portfólio"]],
          ].map(([t, items]) => (
            <div key={t as string}>
              <div className="mono" style={{ color: "rgba(255,255,255,.45)" }}>{t}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                {(items as string[]).map((x) => <a key={x} href="#solucoes" style={{ font: "400 15px var(--text)", color: "rgba(255,255,255,.72)" }}>{x}</a>)}
              </div>
            </div>
          ))}
          <div>
            <div className="mono" style={{ color: "rgba(255,255,255,.45)" }}>Contato</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              <a href="#contato" style={{ font: "400 15px var(--text)", color: "rgba(255,255,255,.72)" }}>Formulário</a>
              <Link href="/" style={{ font: "400 15px var(--text)", color: "rgba(255,255,255,.72)" }}>Versão escura do site</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.12)", marginTop: 44, padding: "22px 0 30px", display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <span className="small" style={{ color: "rgba(255,255,255,.5)" }}>© 2026 HyperGrow. Todos os direitos reservados.</span>
          <span className="small" style={{ color: "rgba(255,255,255,.5)" }}>Prévia de layout — conteúdo em revisão</span>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        footer a:hover{color:#fff!important}
        .cl-ft-g{display:grid;grid-template-columns:1.4fr 1fr 1fr .9fr;gap:34px}
        @media(max-width:900px){.cl-ft-g{grid-template-columns:1fr 1fr}}
        @media(max-width:560px){.cl-ft-g{grid-template-columns:1fr}}
      `}} />
    </footer>
  );
}

export function ClaroWa() {
  const wa = useClaroWhatsApp();
  if (!wa.ativo) return null;
  return (
    <a className="wa-f" href={wa.url} target="_blank" rel="noreferrer">
      <MessageCircle size={20} /><span>Falar no WhatsApp</span>
    </a>
  );
}

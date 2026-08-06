"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Quote, Plus, MessageCircle, Mail, ArrowUpRight, Check, Send, Clock,
  AlertCircle, ChevronDown,
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
        {/* ⚠️ PLACEHOLDER — ver comentário acima. Só o VISUAL foi refinado
            (borda de luz na cor da etapa, medalha que reage ao hover); texto e
            números continuam exatamente os do mockup. */}
        <div className="cl-res-g">
          {RESULTADOS_PLACEHOLDER.map((s, i) => (
            <article className="card cl-res-c lit rv" key={s.t} style={{ ["--beam" as string]: s.hex, transitionDelay: i * 0.08 + "s" }}>
              <span className="cl-res-n" style={{ background: s.hex }} aria-hidden>{i + 1}</span>
              <span className="mono cl-res-k" style={{ color: s.hex }}>{s.k}</span>
              <h3 className="h3 cl-res-t">{s.t}</h3>
              <p className="body cl-res-d">{s.d}</p>
            </article>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        #resultados .cl-res-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--gap);margin-top:46px}
        /* IMPORTANTE: o .rv da folha de tokens declara "transition:opacity .7s,
           transform .7s" e, por vir depois do .card, ganha dele — ou seja, TODO
           card com reveal levantava no hover em 700ms, que é lento a ponto de
           parecer que não tem efeito nenhum. Aqui a lista é declarada inteira:
           entrada suave, hover rápido. */
        #resultados .cl-res-c{position:relative;padding:32px 26px 28px;transition:opacity .6s var(--ease),transform .34s var(--ease),box-shadow .3s var(--ease),border-color .3s var(--ease)}
        /* hover reposto com id: ".cl .rv.in{transform:none}" da folha de tokens
           vence o ".cl .card:hover" e travava o levantar de todo card revelado. */
        #resultados .cl-res-c:hover{transition-delay:0s!important;transform:translateY(-4px);box-shadow:var(--sh-2);border-color:#D6DDEA}
        #resultados .cl-res-n{position:absolute;top:-16px;left:26px;width:36px;height:36px;border-radius:99px;color:#fff;display:inline-flex;align-items:center;justify-content:center;font:700 15px var(--disp);box-shadow:var(--sh-2);transition:transform .32s var(--ease),box-shadow .32s var(--ease);z-index:5}
        #resultados .cl-res-c:hover .cl-res-n{transform:scale(1.1) translateY(-2px);box-shadow:0 12px 24px -10px var(--beam,var(--brand))}
        #resultados .cl-res-k{display:block}
        #resultados .cl-res-t{margin-top:9px}
        #resultados .cl-res-d{margin-top:11px}
        @media(prefers-reduced-motion:reduce){#resultados .cl-res-c{transition-delay:0s!important}#resultados .cl-res-c:hover{transform:none}#resultados .cl-res-c:hover .cl-res-n{transform:none}}
        /* MD da escala oficial (ver o bloco de breakpoints em
           app/claro-tokens.css): três cartões de texto lado a lado abaixo de
           900px dão ~260px cada — o título "Mês 0 · Diagnóstico" já quebra em
           três linhas. Uma coluna. */
        @media(max-width:900px){#resultados .cl-res-g{grid-template-columns:minmax(0,1fr)}}
        /* SM: o número da etapa (círculo em -16px) encostava na borda do cartão
           quando o respiro lateral do .wrap cai para 20px. */
        @media(max-width:600px){#resultados .cl-res-g{margin-top:38px}#resultados .cl-res-c{padding:28px 20px 24px}#resultados .cl-res-n{left:20px}}
      `}} />
    </section>
  );
}

/* Acento por card — mesma progressão azul → violeta → rosa do `.grad` da
   marca. Só cor de UI; nada aqui vira afirmação sobre cliente. */
const DEP_BEAM = ["#1550E8", "#3B2FCC", "#E0165F"];

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
        {/* ⚠️ PLACEHOLDER — ver comentário no topo do arquivo. Igual aos
            Resultados: mexi só no visual (cor de acento por card, avatar que
            acende no hover), nenhuma palavra da citação foi alterada. */}
        <div className="g g-280 cl-dp">
          {DEPOIMENTOS_PLACEHOLDER.map((t, i) => {
            const iniciais = t.n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
            const hex = DEP_BEAM[i % DEP_BEAM.length];
            return (
              <article className="card lit rv cl-dp-c" key={t.n} style={{ ["--beam" as string]: hex }}>
                <Quote className="cl-dp-q" size={26} style={{ color: hex }} aria-hidden />
                <p className="cl-dp-t">{t.q}</p>
                <div className="cl-dp-f">
                  <span aria-hidden className="glow cl-dp-av">{iniciais}</span>
                  <div>
                    <div className="cl-dp-n">{t.n}</div>
                    <div className="small">{t.r}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        #depoimentos .cl-dp{margin-top:44px}
        /* mesma correção de transição explicada em #resultados */
        #depoimentos .cl-dp-c{padding:28px;display:flex;flex-direction:column;transition:opacity .6s var(--ease),transform .34s var(--ease),box-shadow .3s var(--ease),border-color .3s var(--ease)}
        #depoimentos .cl-dp-c:hover{transform:translateY(-4px);box-shadow:var(--sh-2);border-color:#D6DDEA}
        #depoimentos .cl-dp-q{opacity:.45;transition:opacity .3s var(--ease),transform .35s var(--ease)}
        #depoimentos .cl-dp-c:hover .cl-dp-q{opacity:1;transform:translateY(-2px)}
        #depoimentos .cl-dp-t{font:400 16.5px/1.62 var(--text);color:var(--ink);margin-top:16px;flex:1;text-wrap:pretty}
        #depoimentos .cl-dp-f{display:flex;align-items:center;gap:13px;margin-top:24px;padding-top:19px;border-top:1px solid var(--line-2)}
        #depoimentos .cl-dp-av{width:46px;height:46px;border-radius:99px;background:var(--paper-2);border:1px solid var(--line);display:inline-flex;align-items:center;justify-content:center;font:700 15px var(--disp);color:var(--ink-3);flex-shrink:0}
        #depoimentos .cl-dp-n{font:600 14.5px var(--text);color:var(--ink)}
        @media(prefers-reduced-motion:reduce){#depoimentos .cl-dp-c:hover{transform:none}#depoimentos .cl-dp-c:hover .cl-dp-q{transform:none}}
      `}} />
    </section>
  );
}

/* ── FAQ — reaproveita HOME_FAQ (lib/home-faq.ts), mesma fonte que já vira
   schema FAQPage na home escura. Zero pergunta nova inventada aqui. ────────── */
export function ClaroFaq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="sec alt">
      <div className="wrap cl-faq-w">
        <ClaroHead center eyebrow="Dúvidas" sub="Perguntas honestas, respostas honestas.">Antes que você <span className="grad">pergunte</span></ClaroHead>
        <div className="cl-faq-l">
          {HOME_FAQ.map((item, i) => {
            const on = open === i;
            return (
              <div className={"card rv cl-faq-i" + (on ? " on" : "")} key={item.q}>
                <button type="button" id={`cl-faq-b-${i}`} className="cl-faq-b" onClick={() => setOpen(on ? -1 : i)}
                  aria-expanded={on} aria-controls={`cl-faq-${i}`}>
                  <span className="cl-faq-q">{item.q}</span>
                  <span className="cl-faq-ic" aria-hidden><Plus size={17} /></span>
                </button>
                {/* Abre com transição de verdade (grid-template-rows 0fr→1fr),
                    não com `hidden`, que corta o conteúdo sem animar nada.
                    `visibility` some junto: assim o texto fechado continua fora
                    do leitor de tela e fora da ordem de Tab, que é o que o
                    `hidden` garantia. */}
                <div id={`cl-faq-${i}`} className={"cl-faq-p" + (on ? " on" : "")} role="region" aria-labelledby={`cl-faq-b-${i}`}>
                  <div className="cl-faq-pi">
                    <p className="body cl-faq-a">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="small cl-faq-more rv">
          Ficou uma dúvida que não está aqui? <a href="#contato">Pergunte para a gente</a>.
        </p>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        #faq .cl-faq-w{max-width:880px}
        #faq .cl-faq-l{margin-top:40px;display:flex;flex-direction:column;gap:10px}
        #faq .cl-faq-i{position:relative;padding:0;overflow:hidden;transition:opacity .6s var(--ease),transform .34s var(--ease),border-color .3s var(--ease),box-shadow .3s var(--ease)}
        /* acordeão não levanta no hover: o card fica parado e responde com
           borda + fundo, senão o item pula debaixo do cursor ao abrir. */
        #faq .cl-faq-i:hover{transform:none;border-color:#CFD8E8;box-shadow:var(--sh-2)}
        #faq .cl-faq-i.on{border-color:#C9D6F5;box-shadow:var(--sh-2)}
        #faq .cl-faq-i::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,var(--brand),#5B3CFF);transform:scaleY(0);transform-origin:top;transition:transform .4s var(--ease)}
        #faq .cl-faq-i.on::before{transform:scaleY(1)}
        #faq .cl-faq-b{display:flex;align-items:center;gap:14px;width:100%;text-align:left;background:none;border:none;border-radius:17px;padding:20px 22px;min-height:64px;font:600 16.5px/1.4 var(--text);color:var(--ink);transition:background .25s var(--ease),color .25s var(--ease)}
        #faq .cl-faq-b:hover{background:rgba(21,80,232,.04)}
        /* offset NEGATIVO de propósito: o card tem overflow:hidden e um anel de
           foco para fora seria cortado — some justo para quem navega no teclado. */
        #faq .cl-faq-b:focus-visible{outline:2px solid var(--brand);outline-offset:-3px}
        #faq .cl-faq-q{flex:1;text-wrap:pretty}
        #faq .cl-faq-ic{flex-shrink:0;width:32px;height:32px;border-radius:99px;display:inline-flex;align-items:center;justify-content:center;color:var(--brand);background:rgba(21,80,232,.09);transition:transform .35s var(--ease),background .3s var(--ease),color .3s var(--ease)}
        #faq .cl-faq-b:hover .cl-faq-ic{background:rgba(21,80,232,.16)}
        #faq .cl-faq-i.on .cl-faq-ic{transform:rotate(45deg);background:var(--brand);color:#fff}
        #faq .cl-faq-p{display:grid;grid-template-rows:0fr;visibility:hidden;transition:grid-template-rows .4s var(--ease),visibility .4s var(--ease)}
        #faq .cl-faq-p.on{grid-template-rows:1fr;visibility:visible}
        #faq .cl-faq-pi{overflow:hidden;min-height:0}
        #faq .cl-faq-a{padding:0 22px 22px;opacity:0;transform:translateY(-6px);transition:opacity .32s var(--ease) .06s,transform .32s var(--ease) .06s}
        #faq .cl-faq-p.on .cl-faq-a{opacity:1;transform:none}
        #faq .cl-faq-more{margin-top:24px;text-align:center}
        #faq .cl-faq-more a{font-weight:600;border-bottom:1px solid rgba(21,80,232,.35);transition:border-color .25s,color .25s}
        #faq .cl-faq-more a:hover{border-color:var(--brand-d)}
        #faq .cl-faq-more a:focus-visible{outline:2px solid var(--brand);outline-offset:3px;border-radius:4px}
        @media(prefers-reduced-motion:reduce){
          #faq .cl-faq-p,#faq .cl-faq-a,#faq .cl-faq-ic,#faq .cl-faq-i::before{transition:none}
        }
        /* SM da escala oficial (era 560px — ver o bloco de breakpoints em
           app/claro-tokens.css: seis larguras viraram quatro). */
        @media(max-width:600px){#faq .cl-faq-b{padding:18px 16px;font-size:15.5px}#faq .cl-faq-a{padding:0 16px 20px}}
      `}} />
    </section>
  );
}

/* ── Contato — formulário PRÓPRIO desta rota (não reaproveita ContactForm.tsx:
   aquele componente tem cor de tema ESCURO fixa no código, incompatível com
   fundo claro). Mesma lógica de envio: POST /api/lead, mesmos nomes de campo
   — a rota /api/lead não foi tocada, então cai no MESMO CRM em /admin. ────── */
type ClaroLead = { nome: string; email: string; zap: string; empresa: string; servico: string; msg: string };

/* Validação própria (o form vai `noValidate`): a bolha nativa do navegador
   muda de texto e de posição em cada browser e some sozinha — com erro no
   próprio campo o visitante vê O QUE errou e ONDE, e o leitor de tela recebe
   pelo aria-describedby. */
function validarLead(f: ClaroLead) {
  const e: Partial<Record<keyof ClaroLead, string>> = {};
  if (f.nome.trim().length < 2) e.nome = "Diga como podemos te chamar.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Confira o e-mail: falta algo nele.";
  if (f.zap.replace(/\D/g, "").length < 10) e.zap = "Telefone com DDD, por favor.";
  return e;
}

/* Máscara de telefone BR — só formata o que o visitante já digitou, nunca
   inventa dígito. O que vai para /api/lead é esta mesma string formatada. */
function mascaraZap(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function ClaroContato() {
  const [form, setForm] = useState<ClaroLead>({ nome: "", email: "", zap: "", empresa: "", servico: "", msg: "" });
  const [erros, setErros] = useState<Partial<Record<keyof ClaroLead, string>>>({});
  const [tentou, setTentou] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const wa = useClaroWhatsApp();
  const okRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (sent) okRef.current?.focus(); }, [sent]);

  const set = (k: keyof ClaroLead) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const valor = k === "zap" ? mascaraZap(ev.target.value) : ev.target.value;
    const proximo = { ...form, [k]: valor };
    setForm(proximo);
    // só re-valida ao vivo DEPOIS da primeira tentativa: corrigir o visitante
    // enquanto ele ainda está digitando a primeira letra é hostil.
    if (tentou) setErros(validarLead(proximo));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const falhas = validarLead(form);
    setTentou(true);
    setErros(falhas);
    if (Object.keys(falhas).length) {
      const primeiro = (["nome", "email", "zap"] as const).find((k) => falhas[k]);
      if (primeiro) document.getElementById("cl-" + primeiro)?.focus();
      return;
    }
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
            <div className="rv cl-ct-l">
              {wa.ativo ? (
                <a className="card cl-ct-row lit" href={wa.url} target="_blank" rel="noreferrer"
                  style={{ ["--beam" as string]: "var(--wa)" }}>
                  <span className="cl-ct-ic glow" style={{ background: "rgba(15,157,88,.1)", color: "var(--wa)" }}><MessageCircle size={19} /></span>
                  <span><b className="glow-t">WhatsApp</b><em>resposta no mesmo dia útil</em></span>
                  <ArrowUpRight className="cl-ct-go" size={17} />
                </a>
              ) : (
                // Linha informativa, não clicável: sem levantar no hover — card
                // que se mexe promete clique, e aqui não há para onde clicar.
                <div className="card cl-ct-row cl-ct-row--fixo">
                  <span className="cl-ct-ic" style={{ background: "var(--paper-2)", color: "var(--ink-3)" }}><Clock size={19} /></span>
                  <span><b>Formulário ao lado</b><em>resposta em até 1 dia útil</em></span>
                </div>
              )}
              {/* Sem link mailto: o domínio hypergrow.com.br ainda não existe
                  (confirmado por DNS nesta sessão) — anunciar e-mail que devolve
                  erro é pior que não anunciar. */}
              <div className="card cl-ct-row cl-ct-row--fixo">
                <span className="cl-ct-ic" style={{ background: "rgba(21,80,232,.1)", color: "var(--brand)" }}><Mail size={19} /></span>
                <span><b>Formulário oficial</b><em>cai direto no nosso painel</em></span>
              </div>
            </div>
          </div>

          <form className="card rv cl-fm" onSubmit={submit} noValidate>
            {sent ? (
              // foco vai para a confirmação: quem usa leitor de tela ou teclado
              // apertou "enviar" num botão que deixou de existir — sem isso o
              // foco cai no corpo da página e a pessoa não ouve o resultado.
              <div ref={okRef} tabIndex={-1} role="status" aria-live="polite" className="cl-fm-ok">
                <span className="cl-fm-ok-ic"><Check size={26} /></span>
                <h3 className="h3">Recebido.</h3>
                <p className="body">Retornamos no próximo dia útil com um primeiro diagnóstico da sua operação.</p>
              </div>
            ) : (
              <>
                <p className="small cl-fm-hint">Campos com <i>*</i> são obrigatórios.</p>
                <div className="cl-f-g">
                  <div className="cl-f">
                    <label htmlFor="cl-nome">Seu nome <i aria-hidden>*</i></label>
                    <input id="cl-nome" name="nome" autoComplete="name" required aria-required="true"
                      aria-invalid={!!erros.nome} aria-describedby={erros.nome ? "cl-nome-e" : undefined}
                      placeholder="Como te chamamos?" value={form.nome} onChange={set("nome")} />
                    {erros.nome && <span className="cl-f-e" id="cl-nome-e"><AlertCircle size={13} aria-hidden />{erros.nome}</span>}
                  </div>
                  <div className="cl-f">
                    <label htmlFor="cl-email">E-mail <i aria-hidden>*</i></label>
                    <input id="cl-email" name="email" type="email" inputMode="email" autoComplete="email" required aria-required="true"
                      aria-invalid={!!erros.email} aria-describedby={erros.email ? "cl-email-e" : undefined}
                      placeholder="voce@empresa.com.br" value={form.email} onChange={set("email")} />
                    {erros.email && <span className="cl-f-e" id="cl-email-e"><AlertCircle size={13} aria-hidden />{erros.email}</span>}
                  </div>
                  <div className="cl-f">
                    <label htmlFor="cl-zap">WhatsApp <i aria-hidden>*</i></label>
                    <input id="cl-zap" name="telefone" type="tel" inputMode="tel" autoComplete="tel" required aria-required="true"
                      aria-invalid={!!erros.zap} aria-describedby={erros.zap ? "cl-zap-e" : undefined}
                      placeholder="(00) 00000-0000" value={form.zap} onChange={set("zap")} />
                    {erros.zap && <span className="cl-f-e" id="cl-zap-e"><AlertCircle size={13} aria-hidden />{erros.zap}</span>}
                  </div>
                  <div className="cl-f">
                    <label htmlFor="cl-empresa">Empresa / loja</label>
                    <input id="cl-empresa" name="empresa" autoComplete="organization" placeholder="Nome do negócio" value={form.empresa} onChange={set("empresa")} />
                  </div>
                </div>
                <div className="cl-f cl-f--mt">
                  <label htmlFor="cl-servico">O que você precisa</label>
                  <div className="cl-f-sel">
                    <select id="cl-servico" name="servico" value={form.servico} onChange={set("servico")}>
                      <option value="">Selecione uma frente</option>
                      {["Vender online", "Atrair demanda", "Marca & conteúdo", "Operar com IA"].map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={17} aria-hidden />
                  </div>
                </div>
                <div className="cl-f cl-f--mt">
                  <label htmlFor="cl-msg">Onde está travando</label>
                  <textarea id="cl-msg" name="mensagem" rows={4} placeholder="Ex.: a loja tem visita mas não vende; o estoque não bate com o ERP…" value={form.msg} onChange={set("msg")} />
                </div>
                {err && (
                  <p role="alert" className="cl-fm-err">
                    <AlertCircle size={15} aria-hidden />{err}
                  </p>
                )}
                <button className="btn btn-p cl-fm-b" type="submit" disabled={loading}>
                  {loading ? "Enviando..." : "Quero meu diagnóstico"} <Send size={16} className="cl-arw" aria-hidden />
                </button>
                <p className="small cl-fm-note">Sem spam. Sem ligação de vendas sem aviso.</p>
              </>
            )}
          </form>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        #contato .cl-ct-l{margin-top:30px;display:flex;flex-direction:column;gap:12px}
        #contato .cl-ct-row{display:flex;align-items:center;gap:13px;padding:18px;color:var(--ink);text-decoration:none;min-height:76px}
        #contato .cl-ct-row--fixo{cursor:default}
        #contato .cl-ct-row--fixo:hover{transform:none;box-shadow:var(--sh-1);border-color:var(--line)}
        #contato a.cl-ct-row:focus-visible{outline:2px solid var(--wa);outline-offset:3px}
        #contato .cl-ct-ic{flex-shrink:0;width:42px;height:42px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center}
        #contato .cl-ct-row b{display:block;font:600 15.5px var(--text);transition:color .3s}
        #contato .cl-ct-row em{display:block;font:400 13.5px var(--text);font-style:normal;color:var(--ink-3);margin-top:2px}
        #contato .cl-ct-go{margin-left:auto;flex-shrink:0;color:var(--ink-3);transition:transform .3s var(--ease),color .3s var(--ease)}
        #contato a.cl-ct-row:hover .cl-ct-go,#contato a.cl-ct-row:focus-visible .cl-ct-go{color:var(--wa);transform:translate(2px,-2px)}

        #contato .cl-fm{padding:30px}
        #contato .cl-fm:hover{transform:none;box-shadow:var(--sh-1);border-color:var(--line)}
        #contato .cl-fm-hint{margin-bottom:16px}
        #contato .cl-fm-hint i{font-style:normal;color:var(--cta);font-weight:700}
        #contato .cl-fm-ok:focus{outline:none}
        #contato .cl-fm-ok:focus-visible{outline:2px solid var(--wa);outline-offset:6px;border-radius:14px}
        #contato .cl-f-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
        #contato .cl-f--mt{margin-top:15px}
        #contato .cl-f label{display:block;font:600 13.5px var(--text);color:var(--ink-2)}
        #contato .cl-f label i{font-style:normal;color:var(--cta)}
        #contato .cl-f input,#contato .cl-f select,#contato .cl-f textarea{display:block;width:100%;box-sizing:border-box;margin-top:7px;min-height:48px;padding:13px 14px;border:1px solid var(--line);border-radius:11px;background:#fff;font:400 15.5px var(--text);color:var(--ink);transition:border-color .2s var(--ease),box-shadow .2s var(--ease),background .2s}
        #contato .cl-f input::placeholder,#contato .cl-f textarea::placeholder{color:#9AA4B4}
        #contato .cl-f input:hover,#contato .cl-f select:hover,#contato .cl-f textarea:hover{border-color:#C7CFDE}
        /* foco: anel grosso o bastante para enxergar de longe, na cor da marca */
        #contato .cl-f input:focus,#contato .cl-f select:focus,#contato .cl-f textarea:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 3px rgba(21,80,232,.18)}
        /* erro: borda + fundo + ícone + texto, não só uma borda vermelha */
        #contato .cl-f input[aria-invalid=true],#contato .cl-f textarea[aria-invalid=true]{border-color:var(--cta);background:rgba(224,22,95,.035)}
        #contato .cl-f input[aria-invalid=true]:focus,#contato .cl-f textarea[aria-invalid=true]:focus{border-color:var(--cta);box-shadow:0 0 0 3px rgba(224,22,95,.18)}
        #contato .cl-f-e{display:flex;align-items:center;gap:6px;margin-top:6px;font:500 12.5px var(--text);color:#B0155F}
        #contato .cl-f textarea{resize:vertical;min-height:112px}
        #contato .cl-f-sel{position:relative}
        #contato .cl-f-sel select{appearance:none;-webkit-appearance:none;padding-right:42px;cursor:pointer}
        #contato .cl-f-sel svg{position:absolute;right:14px;bottom:16px;color:var(--ink-3);pointer-events:none;transition:transform .25s var(--ease),color .25s}
        #contato .cl-f-sel:hover svg{color:var(--ink-2)}
        #contato .cl-f-sel select:focus + svg{color:var(--brand);transform:translateY(1px)}
        #contato .cl-fm-err{display:flex;align-items:center;gap:8px;margin-top:14px;padding:12px 14px;border-radius:11px;background:rgba(224,22,95,.07);border:1px solid rgba(224,22,95,.25);font:500 14px var(--text);color:#B0155F}
        #contato .cl-fm-b{width:100%;margin-top:20px}
        #contato .cl-fm-b .cl-arw{transition:transform .25s var(--ease)}
        #contato .cl-fm-b:hover .cl-arw{transform:translateX(3px)}
        #contato .cl-fm-b:focus-visible{outline:2px solid var(--cta);outline-offset:3px}
        /* botão desabilitado precisa PARECER desabilitado: sem levantar, sem
           cursor de clique — senão o visitante clica de novo achando que falhou. */
        #contato .cl-fm-b[disabled]{opacity:.62;cursor:progress}
        #contato .cl-fm-b[disabled]:hover{transform:none;background:var(--cta);box-shadow:0 12px 28px -14px rgba(224,22,95,.7)}
        #contato .cl-fm-note{margin-top:13px;text-align:center}
        #contato .cl-fm-ok{text-align:center;padding:30px 6px;animation:cl-okin .45s var(--ease)}
        @keyframes cl-okin{from{opacity:0;transform:translateY(10px)}}
        #contato .cl-fm-ok-ic{width:56px;height:56px;border-radius:99px;background:rgba(15,157,88,.1);color:var(--wa);display:inline-flex;align-items:center;justify-content:center;animation:cl-okpop .5s var(--ease) .08s both}
        @keyframes cl-okpop{from{opacity:0;transform:scale(.7)}}
        #contato .cl-fm-ok .h3{margin-top:16px}
        #contato .cl-fm-ok .body{margin-top:9px}
        @media(prefers-reduced-motion:reduce){
          #contato .cl-fm-ok,#contato .cl-fm-ok-ic{animation:none}
          #contato .cl-ct-go,#contato .cl-fm-b .cl-arw{transition:none}
          #contato a.cl-ct-row:hover .cl-ct-go{transform:none}
        }
        /* SM da escala oficial (era 560px). Dois campos lado a lado num celular
           deixam cada um com ~130px — não cabe "(00) 00000-0000". */
        @media(max-width:600px){#contato .cl-f-g{grid-template-columns:minmax(0,1fr)}#contato .cl-fm{padding:22px}}
      `}} />
    </section>
  );
}

/* Cada link do rodapé aponta para a seção QUE ELE NOMEIA. Antes os oito itens
   das duas colunas iam todos para "#solucoes" — quem clicava em "Portfólio" ou
   "Diagnóstico gratuito" caía no lugar errado e voltava. As quatro frentes
   continuam em #solucoes de propósito: é lá que a frente é escolhida (a aba não
   tem URL própria), e o catálogo completo tem o seu próprio link. */
const RODAPE: [string, [string, string][]][] = [
  ["Frentes", [
    ["Vender online", "#solucoes"],
    ["Atrair demanda", "#solucoes"],
    ["Marca & conteúdo", "#solucoes"],
    ["Operar com IA", "#solucoes"],
  ]],
  ["Empresa", [
    ["Nossa agência", "#sobre"],
    ["Resultados", "#resultados"],
    ["Diagnóstico gratuito", "#diagnostico"],
    ["Portfólio", "#portfolio"],
  ]],
];

export function ClaroFooter() {
  return (
    <footer className="cl-ft">
      <div className="wrap">
        <div className="cl-ft-g">
          <div>
            <ClaroLogo height={40} light />
            <p className="cl-ft-p">
              Marketing, e-commerce e automação operados por gente — com método, transparência e responsabilidade de dono.
            </p>
          </div>
          {RODAPE.map(([t, items]) => (
            <div key={t}>
              <div className="mono cl-ft-h">{t}</div>
              <div className="cl-ft-c">
                {items.map(([rotulo, alvo]) => <a key={rotulo} href={alvo}><span>{rotulo}</span></a>)}
              </div>
            </div>
          ))}
          <div>
            <div className="mono cl-ft-h">Contato</div>
            <div className="cl-ft-c">
              <a href="#contato"><span>Formulário</span></a>
              <Link href="/blog"><span>Blog</span></Link>
              <Link href="/servicos"><span>Catálogo de serviços</span></Link>
            </div>
          </div>
        </div>
        <div className="cl-ft-b">
          <span className="small">© 2026 HyperGrow. Todos os direitos reservados.</span>
          <span className="small">Prévia de layout — conteúdo em revisão</span>
        </div>
      </div>
      {/* Links de rodapé tinham 15px de altura de toque e nenhum estado de foco.
          Agora têm 40px de alvo, sublinhado que cresce da esquerda e anel de
          foco visível — é o bloco mais usado por quem navega só de teclado. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .cl-ft{background:var(--ink);color:#fff;padding-top:66px}
        .cl-ft-g{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:34px}
        /* LG da escala oficial: a partir de 1180px o menu já virou burger, então
           o corpo também comprime — quatro colunas com 34px de gap deixavam a
           primeira (logotipo + parágrafo) sem largura para o texto. */
        @media(max-width:1180px){.cl-ft{padding-top:56px}.cl-ft-g{gap:26px}}
        .cl-ft-p{font:400 15px/1.6 var(--text);color:rgba(255,255,255,.62);margin-top:18px;max-width:300px}
        .cl-ft-h{color:rgba(255,255,255,.45)}
        .cl-ft-c{display:flex;flex-direction:column;align-items:flex-start;margin-top:12px}
        /* prefixo .cl de propósito: sem ele estes seletores EMPATAM em
           especificidade com o ".cl a" da folha de tokens (azul de marca) e o
           vencedor passaria a depender da ordem de carregamento do CSS. */
        /* 44px, não 40px: é o alvo de toque mínimo (WCAG 2.5.8 / guia de
           interface da Apple). O rodapé é uma pilha de links pequenos e
           próximos — 4px a menos aqui é o erro de toque que faz a pessoa abrir
           a página errada no celular. */
        .cl .cl-ft-c a{display:inline-flex;align-items:center;min-height:44px;font:400 15px var(--text);color:rgba(255,255,255,.72);transition:color .25s var(--ease),transform .25s var(--ease)}
        .cl .cl-ft-c a span{position:relative}
        .cl .cl-ft-c a span::after{content:'';position:absolute;left:0;right:0;bottom:-3px;height:1px;background:currentColor;transform:scaleX(0);transform-origin:left;transition:transform .28s var(--ease)}
        .cl .cl-ft-c a:hover{color:#fff;transform:translateX(3px)}
        .cl .cl-ft-c a:hover span::after{transform:scaleX(1)}
        .cl .cl-ft-c a:focus-visible{outline:2px solid #fff;outline-offset:3px;border-radius:6px;color:#fff}
        /* O rodapé é o ÚLTIMO elemento da página. Com viewport-fit cover
           (app/layout.tsx) a página vai até a borda física do iPhone, então sem
           somar a área segura aqui a faixa da barra de gestos ficaria pintada
           com o branco do documento — tarja clara debaixo do rodapé escuro.
           (Sem crase neste comentário de propósito: ele mora dentro de um
           template literal, e uma crase aqui FECHA a string — foi exatamente o
           erro de compilação que este arquivo acabou de dar.) */
        .cl-ft-b{border-top:1px solid rgba(255,255,255,.12);margin-top:46px;padding:22px 0 calc(30px + var(--sa-b));display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}
        .cl-ft-b .small{color:rgba(255,255,255,.5)}
        @media(prefers-reduced-motion:reduce){.cl .cl-ft-c a:hover{transform:none}.cl .cl-ft-c a span::after{transition:none}}
        @media(max-width:900px){.cl-ft-g{grid-template-columns:1fr 1fr}}
        /* SM da escala oficial (era 560px). O último bloco ganha respiro extra
           embaixo: os dois botões flutuantes ficam exatamente sobre este canto. */
        @media(max-width:600px){.cl-ft-g{grid-template-columns:1fr;gap:28px}.cl-ft-b{padding-bottom:calc(30px + var(--sa-b));text-align:left}}
      `}} />
    </footer>
  );
}

export function ClaroWa() {
  const wa = useClaroWhatsApp();
  if (!wa.ativo) return null;
  return (
    <>
      {/* aria-label explícito: no celular o rótulo de texto some (CSS) e sobra
          só o ícone — sem isso o leitor de tela anuncia um link sem nome. */}
      <a className="wa-f cl-wa" href={wa.url} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp (abre em nova aba)">
        <MessageCircle size={20} aria-hidden /><span>Falar no WhatsApp</span>
      </a>
      <style dangerouslySetInnerHTML={{ __html: `
        .cl .cl-wa{transition:transform .25s var(--ease),background .25s var(--ease),box-shadow .25s var(--ease)}
        .cl .cl-wa:focus-visible{outline:2px solid var(--wa);outline-offset:3px}
        .cl .cl-wa:active{transform:scale(.97)}
        @media(prefers-reduced-motion:reduce){.cl .cl-wa{transition:none}.cl .cl-wa:hover{transform:none}}
      `}} />
    </>
  );
}

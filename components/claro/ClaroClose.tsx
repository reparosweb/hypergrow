"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Plus, MessageCircle, Mail, ArrowUpRight, Check, Send, Clock,
  AlertCircle, ChevronDown,
} from "lucide-react";
import { HOME_FAQ } from "@/lib/home-faq";
/* Módulo LEVE (só dados) — seguro no bundle do cliente, é o mesmo que o
   portfólio e /sobre já consomem. Ver nota no topo de lib/projects.ts. */
import { PROJECTS } from "@/lib/projects";
import { PILLARS } from "@/lib/pillars";
import { EVENTOS, rastrear } from "@/lib/track";
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
   NOTA HISTÓRICA — este arquivo já foi o que mais tinha texto inventado do
   site. Sessões anteriores mantiveram "por ora" um case de cliente e 3
   depoimentos, ambos vindos do mockup de design, ambos publicados como se
   fossem reais. Em 2026-08-06 o dono foi consultado de novo, confirmou que
   não tem depoimento nem avaliação coletada, e autorizou remover tudo.
   As duas seções abaixo passaram a se sustentar só no que é verificável.
   Regra que fica para quem vier depois: nada aqui volta a afirmar número
   sobre cliente sem fonte auditável. ─────────────────────────────────────── */

/* CASE INVENTADO REMOVIDO (2026-08-06, autorizado pelo dono).
   Aqui vivia "A evolução de um cliente nosso": três etapas com faturamento
   saindo de "R$ 48 a 90 mil" para "R$ 210 mil/mês, ROAS 7,4". Vinha do
   mockup, o cliente não existe e o número nunca foi medido — era o texto de
   maior risco do site inteiro, porque é promessa financeira específica
   atribuída a um caso real.

   O QUE ENTROU: a seção continua se chamando "Resultados" (o link do menu
   aponta para #resultados e continua coerente), mas em vez de mostrar o
   gráfico de uma empresa que não existe, ela explica COMO o resultado do
   visitante vai ser medido e o que a HyperGrow garante antes de qualquer
   número. Cada frase abaixo é um compromisso operacional verificável, não
   uma estatística — inclusive a de "diagnóstico gratuito", que é o mesmo que
   o formulário de contato desta página já entrega. */
const RESULTADOS = [
  { t: "Diagnóstico, não promessa", d: "Antes de falar em meta, olhamos a sua operação e dizemos onde ela trava — mesmo quando a conclusão honesta é que você ainda não precisa da gente.", k: "Antes de assinar", hex: "#B0155F" },
  { t: "Relatório sem maquiagem", d: "Todo mês, o que deu certo e o que não deu, com o número do lado. Sem gráfico bonito escondendo a campanha que não converteu.", k: "Enquanto roda", hex: "#A8560B" },
  { t: "Uma pessoa com nome", d: "Campanha parou de entregar, pedido não caiu no ERP, site fora do ar: você chama alguém que conhece a sua operação, não abre protocolo numa fila.", k: "Quando trava", hex: "#1550E8" },
] as const;

export function ClaroResultados() {
  return (
    <section id="resultados" className="sec alt">
      <div className="wrap">
        <ClaroHead center eyebrow="Resultados" sub="Não vamos mostrar o gráfico de outra empresa para te convencer. Vamos mostrar como o SEU resultado é medido — e o que garantimos antes de existir número.">
          O que a gente <span className="grad">assume com você</span>
        </ClaroHead>
        <div className="cl-res-g">
          {RESULTADOS.map((s, i) => (
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

/* ─────────────────────────────────────────────────────────────────────────────
   PROVA REAL — substituiu os 3 depoimentos de mockup (2026-08-06).

   POR QUE MUDOU: as 3 falas que viviam aqui ("Sócia-proprietária, Loja de
   decoração"...) vinham do arquivo de design e NUNCA foram ditas por ninguém.
   Estavam no ar como se fossem cliente real. O dono foi consultado nesta
   sessão, confirmou que hoje NÃO tem depoimento nem avaliação de Google
   coletada, e escolheu prova verificável em vez de prova inventada.

   O QUE ENTROU NO LUGAR: os projetos que estão publicados AGORA, cada um com
   endereço clicável. É a única prova social que este site pode fazer sem
   mentir — e é mais forte que depoimento, porque o visitante confere sozinho
   em vez de acreditar. Fonte: lib/projects.ts (a mesma do portfólio e de
   /sobre; duas cópias da mesma verdade é como o site passa a mentir em uma
   delas).

   Os números são CONTADOS do array em tempo de render, nunca digitados à mão:
   se um projeto entrar ou sair, o texto acompanha sozinho e não vira
   estatística velha. ──────────────────────────────────────────────────────── */
export function ClaroDepoimentos() {
  const noAr = PROJECTS.filter((p) => !!p.url);
  const deCliente = noAr.filter((p) => !p.own).length;
  const proprios = noAr.filter((p) => p.own).length;

  return (
    <section id="depoimentos" className="sec">
      <div className="wrap">
        <ClaroHead
          center
          eyebrow="Prova real"
          sub={`${noAr.length} endereços publicados: ${deCliente} projetos de cliente e ${proprios} produtos que são nossos e sustentamos com o nosso dinheiro. Clique em qualquer um.`}
        >
          Não peça para acreditar. <span className="grad">Confira.</span>
        </ClaroHead>

        <div className="g g-280 cl-dp">
          {noAr.map((p, i) => {
            const hex = DEP_BEAM[i % DEP_BEAM.length];
            // rótulo do endereço sem "https://www." — o que interessa é o domínio
            const dominio = p.url!.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
            return (
              <a
                className="card lit rv cl-dp-c"
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                style={{ ["--beam" as string]: hex }}
                aria-label={`Abrir ${p.name} em nova aba`}
              >
                <span className="cl-dp-tag" style={{ color: hex, borderColor: hex + "40", background: hex + "0f" }}>
                  {p.own ? "Produto próprio" : "Projeto de cliente"}
                </span>
                <b className="glow-t cl-dp-n">{p.name}</b>
                <p className="cl-dp-t">{p.desc}</p>
                <span className="cl-dp-f">
                  <span className="mono cl-dp-url">{dominio}</span>
                  <ArrowUpRight className="cl-dp-go" size={16} aria-hidden />
                </span>
              </a>
            );
          })}
        </div>

        <p className="small cl-dp-note rv">
          Ainda não publicamos depoimento de cliente aqui: só entra com nome, autorização e a
          pessoa por trás. Enquanto isso, o que mostramos é o que está no ar.
        </p>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        #depoimentos .cl-dp{margin-top:44px}
        /* mesma correção de transição explicada em #resultados */
        #depoimentos .cl-dp-c{padding:26px;display:flex;flex-direction:column;text-decoration:none;color:inherit;transition:opacity .6s var(--ease),transform .34s var(--ease),box-shadow .3s var(--ease),border-color .3s var(--ease)}
        #depoimentos .cl-dp-c:hover{transform:translateY(-4px);box-shadow:var(--sh-2);border-color:#D6DDEA}
        #depoimentos .cl-dp-c:focus-visible{outline:2px solid var(--beam);outline-offset:3px;transform:translateY(-4px);box-shadow:var(--sh-2)}
        #depoimentos .cl-dp-tag{align-self:flex-start;display:inline-flex;align-items:center;padding:4px 10px;border-radius:99px;border:1px solid;font:600 11.5px var(--text)}
        #depoimentos .cl-dp-n{display:block;font:700 17.5px/1.3 var(--disp);letter-spacing:-.02em;color:var(--ink);margin-top:14px;transition:color .3s var(--ease)}
        #depoimentos .cl-dp-t{font:400 14.5px/1.6 var(--text);color:var(--ink-2);margin-top:9px;flex:1;text-wrap:pretty}
        #depoimentos .cl-dp-f{display:flex;align-items:center;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--line-2)}
        #depoimentos .cl-dp-url{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-3);font-size:12.5px}
        #depoimentos .cl-dp-go{flex-shrink:0;color:var(--beam);transition:transform .3s var(--ease)}
        #depoimentos .cl-dp-c:hover .cl-dp-go,#depoimentos .cl-dp-c:focus-visible .cl-dp-go{transform:translate(2px,-2px)}
        #depoimentos .cl-dp-note{margin-top:26px;text-align:center;max-width:62ch;margin-inline:auto}
        @media(prefers-reduced-motion:reduce){#depoimentos .cl-dp-c:hover,#depoimentos .cl-dp-c:focus-visible{transform:none}#depoimentos .cl-dp-c:hover .cl-dp-go{transform:none}}
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
      if (res.ok && j.ok) {
        setSent(true);
        // Só depois do sucesso confirmado pelo servidor: medir "enviou" no
        // clique contaria como conversão até tentativa que falhou.
        rastrear(EVENTOS.leadEnviado, { frente: form.servico || "nao_informado" });
      }
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

            {/* Rosto humano perto do formulário — pedido do dono. Foto de banco
                (Pexels, mesma licença livre do resto do site) recortada em
                círculo: é o jeito mais simples de simular "recorte" sem CSS de
                máscara/feather, que arrisca borda serrilhada em telas de baixa
                densidade. Sem nome/cargo inventado — "Atendimento HyperGrow"
                descreve a FUNÇÃO, não uma pessoa específica que não existe. */}
            <div className="rv cl-ct-face">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.pexels.com/photos/7709255/pexels-photo-7709255.jpeg?auto=compress&cs=tinysrgb&w=240"
                alt="Atendente sorrindo com headset, representando o time de suporte da HyperGrow"
                width={72} height={72} loading="lazy" decoding="async"
              />
              <span>
                <b>Atendimento HyperGrow</b>
                <em>Responde pessoa, não robô — no WhatsApp ou pelo formulário</em>
              </span>
            </div>

            <div className="rv cl-ct-l">
              {wa.ativo ? (
                <a className="card cl-ct-row lit" href={wa.url} target="_blank" rel="noreferrer"
                  onClick={() => rastrear(EVENTOS.whatsapp, { origem: "card_contato" })}
                  style={{ ["--beam" as string]: "var(--wa)" }}>
                  <span className="cl-ct-ic glow" style={{ background: "rgba(15,157,88,.1)", color: "var(--wa)" }}><MessageCircle size={19} /></span>
                  <span><b className="glow-t">WhatsApp</b><em>resposta no mesmo dia útil</em></span>
                  <ArrowUpRight className="cl-ct-go" size={17} />
                </a>
              ) : (
                // Linha informativa, não clicável: sem levantar no hover — card
                // que se mexe promete clique, e aqui não há para onde clicar.
                // Mesmo assim precisa de um tratamento de borda PADRONIZADO (não
                // zero): antes o hover zerava sombra/borda de volta pro estado de
                // repouso e o card parecia "quebrado" perto dos outros da página
                // (bronca real do dono). Agora ganha o mesmo trilho de cor à
                // esquerda que o FAQ usa em `.cl-faq-i::before`, só que ESTÁTICO
                // (sem depender de hover/estado `.on`) — sinaliza "isto é
                // informativo", não "isto não responde a nada".
                <div className="card cl-ct-row cl-ct-row--fixo" style={{ ["--fixo-accent" as string]: "var(--ink-3)" }}>
                  <span className="cl-ct-ic" style={{ background: "var(--paper-2)", color: "var(--ink-3)" }}><Clock size={19} /></span>
                  <span><b>Formulário ao lado</b><em>resposta em até 1 dia útil</em></span>
                </div>
              )}
              {/* Sem link mailto: o domínio hypergrow.com.br ainda não existe
                  (confirmado por DNS nesta sessão) — anunciar e-mail que devolve
                  erro é pior que não anunciar. */}
              <div className="card cl-ct-row cl-ct-row--fixo" style={{ ["--fixo-accent" as string]: "var(--brand)" }}>
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
                      <option value="">Selecione um departamento</option>
                      {/* Derivado de PILLARS: esta lista estava digitada à mão
                          com os 4 rótulos antigos e teria continuado oferecendo
                          "Vender online" depois que os departamentos mudaram —
                          o lead chegaria no CRM com uma categoria que não
                          existe mais. */}
                      {PILLARS.map((p) => <option key={p.key}>{p.label}</option>)}
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
        #contato .cl-ct-face{display:flex;align-items:center;gap:13px;margin-top:24px}
        #contato .cl-ct-face img{width:72px;height:72px;border-radius:99px;object-fit:cover;object-position:50% 22%;flex-shrink:0;box-shadow:var(--sh-2);border:2px solid #fff;outline:1px solid var(--line)}
        #contato .cl-ct-face b{display:block;font:600 14.5px var(--text);color:var(--ink)}
        #contato .cl-ct-face em{display:block;font:400 13px/1.4 var(--text);font-style:normal;color:var(--ink-3);margin-top:2px}
        #contato .cl-ct-l{margin-top:18px;display:flex;flex-direction:column;gap:12px}
        #contato .cl-ct-row{display:flex;align-items:center;gap:13px;padding:18px;color:var(--ink);text-decoration:none;min-height:76px}
        /* Trilho estático de 3px, mesma receita do FAQ (.cl-faq-i::before) mas
           sempre aceso (não é gatilho de hover/estado) e com padding-left extra
           pra não colidir com o ícone. Cor por card via --fixo-accent (cinza
           neutro no card do Clock, azul de marca no card do Mail) — cada um usa
           a MESMA cor que já tinha no ícone, então nada de paleta nova aqui. */
        #contato .cl-ct-row--fixo{cursor:default;position:relative;padding-left:23px;border-color:color-mix(in srgb,var(--fixo-accent,var(--line)) 22%,var(--line))}
        #contato .cl-ct-row--fixo::before{content:'';position:absolute;left:0;top:14px;bottom:14px;width:3px;border-radius:0 3px 3px 0;background:var(--fixo-accent,var(--line-2))}
        /* Hover fica IGUAL ao repouso, de propósito: card não-clicável não deve
           fingir affordance de clique (nada de sombra subindo, borda mudando de
           cor ou levantar). A diferença com o bug antigo é que agora o REPOUSO
           já carrega tratamento visível (trilho + borda tingida na cor do
           ícone) — antes o repouso também era "sem nada", e por isso o hover
           parecia quebrado. Fixar os MESMOS valores do repouso aqui garante que
           nada mude, sem depender da ordem de carregamento do CSS. */
        #contato .cl-ct-row--fixo:hover{transform:none;box-shadow:var(--sh-1);border-color:color-mix(in srgb,var(--fixo-accent,var(--line)) 22%,var(--line))}
        #contato a.cl-ct-row:focus-visible{outline:2px solid var(--wa);outline-offset:3px}
        #contato .cl-ct-ic{flex-shrink:0;width:42px;height:42px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center}
        #contato .cl-ct-row b{display:block;font:600 15.5px var(--text);transition:color .3s}
        #contato .cl-ct-row em{display:block;font:400 13.5px var(--text);font-style:normal;color:var(--ink-3);margin-top:2px}
        #contato .cl-ct-go{margin-left:auto;flex-shrink:0;color:var(--ink-3);transition:transform .3s var(--ease),color .3s var(--ease)}
        #contato a.cl-ct-row:hover .cl-ct-go,#contato a.cl-ct-row:focus-visible .cl-ct-go{color:var(--wa);transform:translate(2px,-2px)}

        #contato .cl-fm{padding:30px}
        /* Varredura de padronização (2026-08-06): esta regra resetava
           box-shadow/border-color de volta pro valor de repouso no hover — ou
           seja, o formulário inteiro não respondia a NADA (mesmo bug relatado
           nos cartões fixos de contato). O formulário é um container, não um
           link único, então continua sem levantar (senão os campos "pulam"
           debaixo do cursor) — mas agora recebe a mesma sombra elevada que
           .cl-dg (o card do diagnóstico, mesma categoria: card não-clicável
           que guarda campos interativos) já usa em #diagnostico .cl-dg:hover. */
        #contato .cl-fm:hover{transform:none;box-shadow:var(--sh-2)}
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
   "Diagnóstico gratuito" caía no lugar errado e voltava.

   Os departamentos agora saem de PILLARS (lib/pillars.ts) em vez de digitados:
   quando passaram de 4 para 5 em 2026-08-07, esta lista teria ficado com os
   rótulos velhos sem ninguém notar. Cada um leva à sua âncora dentro do
   catálogo da home, que é onde o grupo tem cabeçalho próprio. */
const RODAPE: [string, [string, string][]][] = [
  ["Departamentos", PILLARS.map((p) => [p.label, `#dep-${p.key}`] as [string, string])],
  ["Empresa", [
    ["Nossa agência", "#sobre"],
    ["Resultados", "#resultados"],
    ["Diagnóstico gratuito", "#diagnostico"],
    ["Portfólio", "#portfolio"],
    ["Programa de afiliados", "/afiliados"],
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
      <a className="wa-f cl-wa" href={wa.url} target="_blank" rel="noreferrer"
        onClick={() => rastrear(EVENTOS.whatsapp, { origem: "botao_flutuante" })}
        aria-label="Falar no WhatsApp (abre em nova aba)">
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

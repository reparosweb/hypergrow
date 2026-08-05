"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search, Ruler, Wrench, Gauge, TrendingUp, ArrowRight, MessageCircle,
} from "lucide-react";
import { PROJECTS } from "@/lib/projects";
import { blogPosts } from "@/lib/blog-posts";
import { BrowserFrame } from "@/components/site/DeviceMockup";
import { ClaroHead } from "./ClaroUI";

/* ─────────────────────────────────────────────────────────────────────────────
   BANNER, FLUXO, PORTFÓLIO, CLIENTES, SOBRE, BLOG — versão clara.

   Portfólio, clientes e blog usam os MESMOS dados reais já publicados no site
   escuro (lib/projects.ts, lib/blog-posts.ts) — o mockup original tinha 4
   projetos de clientes FICTÍCIOS ("Cafeteria de bairro", "Ateliê de flores"...)
   com foto de banco Pexels fingindo ser projeto real, e uma marquee que
   misturava 4 nomes reais (Agentop, NutriSnap, Unixx, Packslog) com 6
   inventados. Trocar por dado real custa a mesma linha de código e é
   estritamente melhor — não há motivo pra portar o fictício aqui.

   Os cartões de ESTATÍSTICA da seção Clientes (20+ anos, 480+ projetos, 7,4x
   ROAS, 98% renovação) são a exceção: o dono pediu para MANTER como
   placeholder por ora, não trocar por dado real (não existe dado real
   equivalente ainda). Ficam com os MESMOS números do mockup original — não
   um novo número inventado — e marcados abaixo com comentário PLACEHOLDER. */

/* ── Banner full-bleed em vídeo ───────────────────────────────────────────── */
export function ClaroBanner() {
  const v = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = v.current; if (!el) return;
    const kick = () => el.play().catch(() => {});
    el.addEventListener("loadeddata", kick);
    el.addEventListener("canplay", kick);
    kick();
    return () => { el.removeEventListener("loadeddata", kick); el.removeEventListener("canplay", kick); };
  }, []);
  return (
    <section className="cl-bn">
      <video ref={v} className="cl-bn-v" poster="/media/launch-poster.webp" autoPlay muted loop playsInline preload="metadata">
        <source src="/media/launch.mp4" type="video/mp4" />
      </video>
      <div className="cl-bn-grade" aria-hidden />
      <div className="wrap cl-bn-in">
        <div className="eyebrow" style={{ color: "rgba(255,255,255,.72)" }}><i style={{ background: "#E0165F" }} />Operação em ignição</div>
        <h2 className="h2" style={{ color: "#fff", marginTop: 16, maxWidth: 720 }}>
          Empresa boa não precisa de sorte.<br />Precisa de <span style={{ color: "#7C93FF" }}>estrutura para escalar</span>.
        </h2>
        <p className="lead" style={{ color: "rgba(255,255,255,.82)", marginTop: 16, maxWidth: 560 }}>
          Loja, anúncio, atendimento e time comercial funcionando como um sistema — não como seis fornecedores diferentes.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
          <Link href="#diagnostico" className="btn btn-p">Fazer o diagnóstico gratuito <ArrowRight size={17} /></Link>
          <Link href="#contato" className="btn" style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", backdropFilter: "blur(10px)" }}>Falar com especialista</Link>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .cl-bn{position:relative;min-height:min(520px,70vh);display:flex;align-items:center;overflow:hidden;background:#0D1013}
        .cl-bn-v{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:58% 42%}
        .cl-bn-grade{position:absolute;inset:0;background:linear-gradient(96deg,rgba(13,16,19,.94) 0%,rgba(13,16,19,.72) 42%,rgba(13,16,19,.3) 74%,rgba(13,16,19,.55) 100%)}
        .cl-bn-in{position:relative;padding:76px 34px}
        @media(max-width:760px){.cl-bn{min-height:460px}.cl-bn-in{padding:60px 20px}.cl-bn-grade{background:linear-gradient(180deg,rgba(13,16,19,.6),rgba(13,16,19,.92))}}
      `}} />
    </section>
  );
}

/* ── Fluxo do processo — MESMA copy já aprovada no site escuro (Process(),
   HypergrowSite.tsx), não uma nova redação para esta rota. ─────────────────── */
const FLUXO = [
  { Ic: Search, t: "Diagnóstico", d: "Entendemos sua operação, metas e gargalos antes de propor qualquer solução.", hex: "#0A6C9E" },
  { Ic: Ruler, t: "Planejamento", d: "Desenhamos a estratégia, o escopo e o roadmap de tecnologia ideal.", hex: "#1B3B8B" },
  { Ic: Wrench, t: "Desenvolvimento", d: "Construímos com tecnologia de ponta, IA e automação — direto ao ponto.", hex: "#3B2FCC" },
  { Ic: Gauge, t: "Implantação", d: "Colocamos no ar, integramos e treinamos sua equipe para usar.", hex: "#5B3CFF" },
  { Ic: TrendingUp, t: "Crescimento", d: "Monitoramos, otimizamos e escalamos os resultados de forma contínua.", hex: "#E0165F" },
];

export function ClaroFluxo() {
  return (
    <section id="processo" className="sec alt">
      <div className="wrap">
        <ClaroHead center eyebrow="Como trabalhamos" sub="Nada de improviso. Cada etapa tem responsável, prazo e entregável definido.">
          Um processo que você <span className="grad">consegue acompanhar</span>
        </ClaroHead>
        <div className="cl-fx rv">
          <span className="cl-fx-line" aria-hidden><i /></span>
          {FLUXO.map(({ Ic, t, d, hex }, i) => (
            <article className="card cl-fx-node lit" key={t} style={{ ["--beam" as string]: hex, animationDelay: i * 0.12 + "s" }}>
              <span className="cl-fx-ic glow" style={{ color: hex, background: hex + "12", borderColor: hex + "2e" }}><Ic size={20} /></span>
              <span className="cl-fx-n mono" style={{ color: hex }}>Etapa {i + 1}</span>
              <b className="glow-t">{t}</b>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .cl-fx{position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-top:46px}
        .cl-fx-line{position:absolute;top:46px;left:6%;right:6%;height:2px;background:repeating-linear-gradient(90deg,var(--line) 0 7px,transparent 7px 14px);overflow:hidden}
        .cl-fx-line i{position:absolute;top:-1px;left:-18%;width:18%;height:4px;border-radius:99px;background:linear-gradient(90deg,transparent,var(--brand),transparent);animation:cl-fxpulse 3.4s linear infinite}
        @keyframes cl-fxpulse{to{left:110%}}
        .cl-fx-node{position:relative;padding:20px 18px;animation:cl-fxin .6s var(--ease) both}
        @keyframes cl-fxin{from{opacity:0;transform:translateY(14px)}}
        .cl-fx-ic{width:44px;height:44px;border-radius:13px;border:1px solid;display:inline-flex;align-items:center;justify-content:center;background:#fff}
        .cl-fx-n{display:block;margin-top:14px}
        .cl-fx-node b{display:block;font:600 17px var(--disp);letter-spacing:-.02em;color:var(--ink);margin-top:5px;transition:color .3s}
        .cl-fx-node p{font:400 14px/1.55 var(--text);color:var(--ink-3);margin-top:7px;text-wrap:pretty}
        @media(max-width:1000px){.cl-fx{grid-template-columns:1fr 1fr}.cl-fx-line{display:none}}
        @media(max-width:600px){.cl-fx{grid-template-columns:1fr}}
      `}} />
    </section>
  );
}

/* ── Portfólio — os 10 projetos REAIS (lib/projects.ts), tela real dentro de
   moldura de navegador (mesmo componente já usado em /sobre) em vez de foto de
   banco de negócio fictício. Card inteiro clicável quando há URL — mesmo
   ajuste de acessibilidade feito hoje no portfólio do site escuro. ─────────── */
function hostOf(url?: string) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export function ClaroPortfolio() {
  return (
    <section id="portfolio" className="sec">
      <div className="wrap">
        <ClaroHead center eyebrow="Portfólio" sub="Negócios reais, do pequeno ao grande — o mesmo padrão de cuidado.">
          Projetos que estão <span className="grad">no ar e vendendo</span>
        </ClaroHead>
        <div className="cl-pf">
          {PROJECTS.map((p) => {
            const inner = (
              <>
                <BrowserFrame src={`/portfolio/${p.id}.webp`} alt={`${p.name} — tela real do produto`} title={hostOf(p.url) || p.name} maxWidth={640} />
                <div className="cl-pf-b">
                  <div className="cl-pf-tags">
                    <span>{p.own ? "Produto próprio" : "Cliente"}</span>
                    {p.tags.slice(0, 1).map((t) => <span key={t}>{t}</span>)}
                  </div>
                  <b>{p.name}</b>
                  <em>{p.desc}</em>
                </div>
              </>
            );
            return p.url ? (
              <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="cl-pf-c lit rv">{inner}</a>
            ) : (
              <article key={p.id} className="cl-pf-c lit rv">{inner}</article>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .cl-pf{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:42px}
        .cl-pf-c{display:block;border-radius:18px;overflow:hidden;background:#fff;border:1px solid var(--line);box-shadow:var(--sh-1);transition:transform .35s var(--ease),box-shadow .35s var(--ease);text-decoration:none;color:inherit}
        .cl-pf-c:hover{transform:translateY(-5px);box-shadow:var(--sh-3)}
        .cl-pf-b{padding:18px}
        .cl-pf-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px}
        .cl-pf-tags span{font:600 10.5px var(--text);letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2);background:var(--paper-2);border:1px solid var(--line);border-radius:99px;padding:4px 9px}
        .cl-pf-b b{display:block;font:600 17px var(--disp);letter-spacing:-.02em;color:var(--ink)}
        .cl-pf-b em{display:block;font:400 13.5px var(--text);font-style:normal;color:var(--ink-3);margin-top:3px}
        @media(max-width:1000px){.cl-pf{grid-template-columns:1fr 1fr}}
        @media(max-width:600px){.cl-pf{grid-template-columns:1fr}}
      `}} />
    </section>
  );
}

/* ── Clientes: marquee com os 10 nomes REAIS + estatísticas ──────────────────
   PLACEHOLDER (declarado ao dono, não substituído por dado real ainda):
   os 4 números abaixo são os MESMOS do mockup original — não foram trocados
   por outro número inventado, só portados com o aviso explícito de que
   precisam de dado real antes de esta rota virar produção. */
const STATS_PLACEHOLDER = [
  ["20+", "anos de estrada"],
  ["480+", "projetos entregues"],
  ["7,4x", "ROAS médio"],
  ["98%", "clientes que renovam"],
] as const;

export function ClaroClientes() {
  const nomes = PROJECTS.map((p) => p.name);
  const loop = [...nomes, ...nomes];
  return (
    <section id="clientes" className="sec alt">
      <div className="wrap">
        <ClaroHead center eyebrow="Projetos" sub="Produtos próprios e projetos de cliente — o mesmo padrão de cuidado em todos.">
          Marcas que <span className="grad">operam com a gente</span>
        </ClaroHead>
      </div>
      <div className="rv" style={{ marginTop: 38 }}>
        <div className="mq" tabIndex={0} role="group" aria-label="Projetos — pause com o mouse ou Tab">
          <div className="mq-t">{loop.map((x, i) => <span className="mq-i" key={i}>{x}</span>)}</div>
          <div className="mq-t" aria-hidden>{loop.map((x, i) => <span className="mq-i" key={"b" + i}>{x}</span>)}</div>
        </div>
      </div>
      <div className="wrap">
        {/* ⚠️ PLACEHOLDER — ver comentário de STATS_PLACEHOLDER acima. Não promover
            esta rota sem substituir por número real ou remover a faixa. */}
        <div className="g g-220 rv" style={{ marginTop: 40 }}>
          {STATS_PLACEHOLDER.map(([v, l]) => (
            <div className="card lit" key={l} style={{ padding: "26px 22px", textAlign: "center" }}>
              <div style={{ font: "700 40px/1 var(--disp)", letterSpacing: "-.04em", color: "var(--brand)" }}>{v}</div>
              <div className="small" style={{ marginTop: 9 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Sobre ─────────────────────────────────────────────────────────────────
   Foto real (CC0) em vez de foto de banco apresentada como "nossa equipe" —
   a mesma regra já aplicada no resto do site: contexto, não retrato falso. */
export function ClaroSobre() {
  return (
    // "alt" pra alternar com Depoimentos (plain) logo antes na ordem final da
    // página — ver mapa de seções em ClaroSite.tsx.
    <section id="sobre" className="sec alt">
      <div className="wrap">
        <div className="split">
          <figure className="rv" style={{ margin: 0, borderRadius: 22, overflow: "hidden", boxShadow: "var(--sh-3)", aspectRatio: "5/4" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fotos/escritorio-equipe.webp" alt="Profissional organizando a operação de um cliente" loading="lazy" width={960} height={641} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </figure>
          <div>
            <ClaroHead eyebrow="Nossa agência" sub="Não entregamos apresentação bonita que morre na gaveta. Implantamos, operamos e respondemos pelo número.">
              Um time que <span className="grad">opera</span>, não só planeja
            </ClaroHead>
            <div className="rv" style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["Gestor humano dedicado", "Sem fila de suporte, sem chatbot para falar com a gente."],
                ["Relatório sem maquiagem", "Você vê o que deu certo e o que não deu — com o número do lado."],
                ["Responsabilidade de dono", "Tratamos a sua operação como se o faturamento fosse nosso."],
              ].map(([t, d]) => (
                <div className="card lit" key={t} style={{ display: "flex", gap: 13, padding: 17 }}>
                  <span className="glow" style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 11, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--brand)", background: "rgba(21,80,232,.09)" }}>
                    <MessageCircle size={19} />
                  </span>
                  <div>
                    <b className="glow-t" style={{ display: "block", font: "600 15.5px var(--text)", color: "var(--ink)" }}>{t}</b>
                    <span className="small" style={{ display: "block", marginTop: 3 }}>{d}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Blog — os 4 posts REAIS (lib/blog-posts.ts). Sem foto por post: o
   /blog de verdade também não tem (nenhum campo `image` no tipo BlogPost) —
   inventar uma capa aqui criaria um recurso que não existe em lugar nenhum
   do site de verdade. Tempo de leitura: mesma fórmula já usada em
   app/blog/page.tsx (palavras / 200), calculada do corpo REAL do post. ────── */
function readingTime(body: { h: string; p: string }[], intro: string) {
  const text = [intro, ...body.flatMap((b) => [b.h, b.p])].join(" ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function ClaroBlog() {
  return (
    // "plain" (sem alt) pra alternar com Sobre (alt) logo antes.
    <section id="blog" className="sec">
      <div className="wrap">
        <ClaroHead center eyebrow="Blog" sub="Estratégia e operação explicadas sem enrolação.">Conteúdo que <span className="grad">acelera você</span></ClaroHead>
        <div className="g g-280" style={{ marginTop: 40 }}>
          {blogPosts.map((p) => (
            <Link href={`/blog/${p.slug}`} className="card lit rv" key={p.slug} style={{ padding: 22, display: "block" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="chip" style={{ padding: "4px 10px", fontSize: 12 }}>{p.category}</span>
                <span className="small">{readingTime(p.body, p.intro)} min de leitura</span>
              </div>
              <b className="glow-t" style={{ display: "block", font: "600 18px/1.32 var(--disp)", letterSpacing: "-.02em", color: "var(--ink)", marginTop: 14 }}>{p.title}</b>
              <p className="body" style={{ fontSize: 15, marginTop: 9 }}>{p.description}</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, font: "600 14px var(--text)", color: "var(--brand)" }}>Ler artigo <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

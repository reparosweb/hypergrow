// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Script from "next/script";
import TrustMarquee from "./TrustMarquee";
import ServiceGlyph from "./ServiceGlyphs";
import ContactForm from "./ContactForm";
import { BrowserFrame } from "./DeviceMockup";
// Importa do módulo LEVE (não de site-services.ts): este é um client component,
// e site-services.ts carrega o conteúdo completo das 19 páginas de serviço —
// 62.992 bytes de texto (41% do JS da home) que o navegador não precisa.
// A lista enxuta de serviços chega por prop, vinda do server component.
import { PILLARS, pillarOf, FLAGSHIP_SLUGS } from "@/lib/pillars";
import type { ServiceCardData } from "@/lib/pillars";
import { HOME_FAQ } from "@/lib/home-faq";
import { PROJECTS, PROJECT_CATS } from "@/lib/projects";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "";
const waUrl = WHATSAPP
  ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Quero falar com a HyperGrow.")}`
  : "#contato";

/* ───────────────────────── Logo ─────────────────────────
   IDs dos gradientes/filtros do SVG precisam ser ESTÁVEIS entre SSR e cliente.
   `useId()` gerava prefixos diferentes no servidor (ex. "R1a6fsq") e no cliente
   ("r0"), o que fazia o React acusar divergência de hidratação (#418/#423/#425)
   e DESCARTAR o HTML do servidor, re-renderizando a página toda no cliente —
   um custo de performance real. Uma chave derivada das props é determinística
   e suficiente aqui (o Logo aparece em variantes distintas: 32/34, com/sem palavra). */
function Logo({ height = 34, showWord = true }) {
  const uid = `${height}${showWord ? "w" : "n"}`;
  const g1 = `hgA-${uid}`, g2 = `hgB-${uid}`, gl = `hgGlow-${uid}`, sh = `hgSheen-${uid}`;
  const markH = height, markW = height;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: height * 0.34 }}>
      <svg width={markW} height={markH} viewBox="0 0 64 64" fill="none" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={g1} x1="6" y1="58" x2="20" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0FA968" /><stop offset="1" stopColor="#2DD4A0" />
          </linearGradient>
          <linearGradient id={g2} x1="44" y1="58" x2="58" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0B7A4C" /><stop offset="1" stopColor="#6FE3B4" />
          </linearGradient>
          <linearGradient id={sh} x1="10" y1="50" x2="56" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#C4763C" /><stop offset="1" stopColor="#D99461" />
          </linearGradient>
          <filter id={gl} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="8" y="8" width="9" height="48" rx="4.5" fill={`url(#${g1})`} />
        <rect x="47" y="8" width="9" height="48" rx="4.5" fill={`url(#${g2})`} />
        <g filter={`url(#${gl})`}>
          <path d="M14 42 L28 34 L36 38 L52 22" stroke={`url(#${sh})`} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M44 20 L54 18 L52 28 Z" fill="#D99461" />
        </g>
        <circle r="3" fill="#fff" filter={`url(#${gl})`} opacity="0.95">
          <animateMotion dur="2.8s" repeatCount="indefinite" path="M14 42 L28 34 L36 38 L52 22" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" />
          <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.12;0.86;1" dur="2.8s" repeatCount="indefinite" />
        </circle>
      </svg>
      {showWord && (
        <span style={{ font: `700 ${height * 0.62}px var(--font-display)`, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>
          Hyper<span style={{ background: "linear-gradient(120deg,#2DD4A0,#0B7A4C 55%,#C4763C)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Grow</span>
        </span>
      )}
    </div>
  );
}

/* ─────────────────── shared helpers ─────────────────── */
function SectionHead({ eyebrow, title, accent, sub, center, dotColor = "#6FBF9A", style = {} }) {
  return (
    <div className="reveal" style={{ textAlign: center ? "center" : "left", ...style }}>
      {eyebrow && <div className="eyebrow"><span className="dot" style={{ background: dotColor, boxShadow: `0 0 10px ${dotColor}, 0 0 4px #fff` }}></span>{eyebrow}</div>}
      <h2 className="h-sec" style={center ? { marginLeft: "auto", marginRight: "auto" } : {}}>
        {title} {accent && <span className="accent">{accent}</span>}
      </h2>
      {sub && <p className="sub" style={center ? { marginLeft: "auto", marginRight: "auto" } : {}}>{sub}</p>}
    </div>
  );
}

function useSpotlight() {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);
  return { ref, onMouseMove: onMove, className: "spotlight" };
}

function cardGlow(color) {
  return {
    onMouseMove: (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty("--gx", `${e.clientX - r.left}px`);
      e.currentTarget.style.setProperty("--gy", `${e.clientY - r.top}px`);
      e.currentTarget.style.setProperty("--cardglow", color);
    },
    onMouseEnter: (e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; },
    onMouseLeave: (e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; },
  };
}

/* PERFORMANCE (P2): as 10 capas do portfólio (800×500, ~201 KB somadas) ficam
   muito abaixo da dobra, mas `loading="lazy"` NÃO segura — o Chrome dispara o
   lazy de tudo que está no documento assim que o layout resolve, e a auditoria
   mediu as 10 baixando ANTES do FCP, disputando banda com o que está na tela.

   Aqui o `src` só é escrito no DOM quando o card chega a 500 px da viewport.
   Antes disso não existe requisição nenhuma. `loading="lazy"` continua como
   segunda camada de segurança.

   `width`/`height` são os valores REAIS do arquivo (medidos, não chutados): dão
   ao navegador a proporção antes do download e evitam salto de layout. */
function ImageSlot({ placeholder, src, w = 800, h = 500 }) {
  const [ok, setOk] = useState(true);
  const [near, setNear] = useState(false);
  const boxRef = useRef(null);
  // Reseta o estado de erro quando o src muda — sem isso, uma imagem que falhou
  // uma vez ficava presa no fallback mesmo trocando para outro src válido.
  useEffect(() => { setOk(true); }, [src]);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    // Sem IntersectionObserver (navegador antigo): carrega direto, sem quebrar.
    if (typeof IntersectionObserver === "undefined") { setNear(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setNear(true); io.disconnect(); }
    }, { rootMargin: "500px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const show = src && ok && near;
  return (
    <div ref={boxRef} style={{ position: "absolute", inset: 0 }}>
      {show && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={src} alt={placeholder} width={w} height={h} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setOk(false)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {(!src || !ok) && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", padding: 16, color: "rgba(255,255,255,0.6)", font: "500 12px var(--font-sans)" }}>
          {placeholder}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Nav ───────────────────────── */
function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    ["Serviços", "#servicos"], ["Soluções IA", "#ia"], ["Portfólio", "#portfolio"],
    ["Processo", "#processo"], ["Sobre", "#sobre"], ["Blog", "/blog"], ["Contato", "#contato"],
  ];
  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, transition: "all .4s var(--ease-out-premium)", background: solid ? "rgba(7,13,28,0.72)" : "transparent", backdropFilter: solid ? "blur(20px) saturate(1.3)" : "none", borderBottom: solid ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent" }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
        <a href="#top" aria-label="HyperGrow"><Logo height={32} /></a>
        <nav style={{ display: "flex", gap: 30 }} className="nav-links">
          {links.map(([l, h]) => (
            <a key={l} href={h} style={{ font: "500 14px var(--font-sans)", color: "rgba(255,255,255,0.74)", transition: "color .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.74)")}>{l}</a>
          ))}
        </nav>
        <a href="#contato" className="btn btn-cta nav-cta" style={{ padding: "11px 18px", fontSize: 14, borderRadius: 12 }}>
          Solicitar orçamento <i data-lucide="arrow-up-right" style={{ width: 16, height: 16 }}></i>
        </a>
        <button className="nav-burger" aria-label="Menu" onClick={() => setOpen((v) => !v)} style={{ display: "none", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, width: 42, height: 42, color: "#fff", alignItems: "center", justifyContent: "center" }}>
          <i data-lucide={open ? "x" : "menu"} style={{ width: 20, height: 20 }}></i>
        </button>
      </div>
      {open && (
        <div className="wrap" style={{ paddingBottom: 18, display: "flex", flexDirection: "column", gap: 4 }}>
          {links.map(([l, h]) => (
            <a key={l} href={h} onClick={() => setOpen(false)} style={{ padding: "12px 6px", font: "500 16px var(--font-sans)", color: "rgba(255,255,255,0.82)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{l}</a>
          ))}
          <a href="#contato" onClick={() => setOpen(false)} className="btn btn-cta" style={{ marginTop: 10, justifyContent: "center" }}>Solicitar orçamento</a>
        </div>
      )}
      <style>{`@media (max-width: 880px){ .nav-links, .nav-cta { display: none !important; } .nav-burger { display: inline-flex !important; } }`}</style>
    </header>
  );
}

/* ───────────────────────── Hero ───────────────────────── */
function Hero() {
  const vidRef = useRef(null);
  const telAlt = useRef(null), telVel = useRef(null), telT = useRef(null);
  const [vidOn, setVidOn] = useState(false);

  // Performance: só baixa o vídeo (9MB) em telas grandes, sem economia de dados e sem reduced-motion.
  useEffect(() => {
    const small = window.matchMedia("(max-width: 760px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const save = (navigator).connection?.saveData;
    if (!small && !reduce && !save) setVidOn(true);
  }, []);

  // Loop NATIVO (atributo `loop` no <video>) — roda liso. O loop manual com seek+flicker
  // foi removido: ele causava stall de buffer e piscadas a cada ciclo ("travando").
  useEffect(() => {
    if (!vidOn) return;
    const v = vidRef.current; if (!v) return;
    const play = () => { v.play().catch(() => {}); };
    v.addEventListener("loadedmetadata", play);
    v.addEventListener("canplay", play);
    if (v.readyState >= 2) play();
    return () => { v.removeEventListener("loadedmetadata", play); v.removeEventListener("canplay", play); };
  }, [vidOn]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf, start = performance.now(), last = 0;
    const tick = (now) => {
      const tsec = (now - start) / 1000;
      if (now - last > 90) {
        last = now;
        const alt = 0.5 * 6.4 * tsec * tsec;
        const vel = 6.4 * tsec * 3.6 * 90;
        if (telAlt.current) telAlt.current.textContent = (alt % 420).toFixed(1).padStart(5, "0");
        if (telVel.current) telVel.current.textContent = Math.round(vel % 28000).toLocaleString("pt-BR");
        if (telT.current) { const s = Math.floor(tsec % 600); telT.current.textContent = "T+ " + String((s / 60) | 0).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
      }
      raf = requestAnimationFrame(tick);
    };
    if (!reduce) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section id="top" style={{ position: "relative", height: "100svh", minHeight: 620, overflow: "hidden", background: "#04060f" }}>
      <div className="hero-video-wrap" aria-hidden="true">
        {vidOn ? (
          <video ref={vidRef} className="hero-video" poster="/media/launch-poster.webp" autoPlay muted loop playsInline preload="metadata">
            <source src="/media/launch.mp4" type="video/mp4" />
          </video>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img className="hero-video" src="/media/launch-poster.webp" width={720} height={405} alt="Foguete em lançamento — HyperGrow, tecnologia e IA para crescimento de e-commerce" fetchPriority="high" />
        )}
      </div>

      {/* overlays estilo YLIP: leitura + vinheta de marca (azul/magenta) + fade inferior */}
      <div className="hero-grade-read" aria-hidden="true"></div>
      <div className="hero-grade-brand" aria-hidden="true"></div>
      <div className="hero-grade-foot" aria-hidden="true"></div>

      <div className="wrap hero-inner">
        <div className="hero-copy">
          <div className="eyebrow" style={{ marginBottom: 26 }}><span className="dot"></span>E-commerce · Marketing · IA · Automação</div>
          <h1 className="hero-h1">Crescimento <span className="hero-accent">exponencial</span></h1>
          <p className="hero-lead">Loja virtual, marketing, design, automação e IA para colocar o seu e-commerce em órbita — construído, no ar e gerando receita.</p>
          <div className="hero-actions">
            <a href="#contato" className="btn btn-cta" style={{ padding: "16px 28px", fontSize: 16 }}>Solicitar orçamento <i data-lucide="arrow-right" style={{ width: 18, height: 18 }}></i></a>
            <a href="#servicos" className="btn btn-ghost" style={{ padding: "16px 26px", fontSize: 16 }}><i data-lucide="play" style={{ width: 16, height: 16 }}></i> Ver serviços</a>
          </div>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span className="scroll-track"><span className="scroll-dot"></span></span>
      </div>

      <style>{`
        .hero-video-wrap { position: absolute; inset: 0; overflow: hidden; }
        /* Vídeo protagonista (estilo YLIP): full-bleed, loop nativo, opacity alta — sem zoom/crop. */
        .hero-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 45%; opacity: 0.85; }
        /* 3 camadas elegantes: leitura + vinheta de marca + fade inferior. */
        .hero-grade-read { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(5,11,26,0.62) 0%, rgba(5,11,26,0.30) 38%, rgba(5,11,26,0.55) 72%, rgba(5,11,26,0.96) 100%); }
        .hero-grade-brand { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen;
          background: radial-gradient(900px 620px at 6% 28%, rgba(15,169,104,0.34), transparent 60%), radial-gradient(880px 600px at 96% 78%, rgba(196,118,60,0.26), transparent 62%); }
        .hero-grade-foot { position: absolute; left: 0; right: 0; bottom: 0; height: 170px; pointer-events: none; background: linear-gradient(180deg, transparent, #0D1013); }
        .hero-inner { position: relative; z-index: 6; height: 100%; display: flex; flex-direction: column; justify-content: center; }
        .hero-copy { max-width: 760px; }
        .hero-h1 { margin: 0; font: 800 clamp(40px,7.4vw,88px)/1.02 var(--font-display); letter-spacing: -0.045em; color: #fff; text-wrap: balance; text-shadow: 0 6px 44px rgba(0,0,0,0.6); }
        .hero-accent { background: linear-gradient(104deg, #6FE3B4 0%, #0B7A4C 46%, #D99461 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-lead { font: 400 clamp(16px,1.5vw,20px)/1.6 var(--font-sans); color: rgba(255,255,255,0.86); max-width: 600px; margin: 24px 0 0; text-wrap: pretty; text-shadow: 0 2px 16px rgba(0,0,0,0.6); }
        .hero-lead strong { color: #fff; font-weight: 600; }
        .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 36px; }
        .scroll-cue { position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 6; }
        .scroll-track { width: 22px; height: 36px; border: 1.5px solid rgba(255,255,255,0.30); border-radius: 999px; display: flex; justify-content: center; padding-top: 6px; }
        .scroll-dot { width: 4px; height: 8px; border-radius: 999px; background: #6FBF9A; box-shadow: 0 0 8px #6FBF9A; animation: scroll-bob 1.6s ease-in-out infinite; }
        @keyframes scroll-bob { 0%,100% { transform: translateY(0); opacity: 1; } 60% { transform: translateY(12px); opacity: 0.2; } }
        @media (max-width: 760px) { .hero-video { object-position: 50% 40%; } .hero-grade-read { background: linear-gradient(180deg, rgba(5,11,26,0.5) 0%, rgba(5,11,26,0.42) 45%, rgba(5,11,26,0.97) 100%); } }
        @media (prefers-reduced-motion: reduce) { .scroll-dot { animation: none; } }
      `}</style>
    </section>
  );
}

/* ───────────────────────── Services ─────────────────────────
   Identidade visual escaneável. O visitante precisava LER cada card para saber
   o que era (19 cards idênticos, ícone de 23px = 0,45% da área do card).
   Sistema atual, em 4 camadas:
     1. GRAFISMO desenhado por serviço  → diz O QUE É sem leitura
     2. cor + trilho do pilar           → diz DE QUE FAMÍLIA é
     3. badge de texto                  → torna o código à prova de erro (a11y)
     4. blocos por pilar + bento        → mata a "parede de 19 cards"
   No celular o card vira LINHA horizontal: a seção cai de ~7,8 telas p/ ~3,
   e o grafismo continua sendo a pista (ele carrega a identidade, não o texto). */
function ServiceCard({ s }) {
  const pil = pillarOf(s.slug);
  const big = FLAGSHIP_SLUGS.includes(s.slug);
  const inverted = s.slug === "automacoes-ia"; // único card claro da página: o sinal mais forte que existe
  const titleColor = inverted ? "#12151A" : "#fff";
  const descColor = inverted ? "rgba(18,21,26,0.68)" : "rgba(255,255,255,0.62)";
  return (
    <a href={`/servicos/${s.slug}`} className={`glowcard neon-card svc-card${inverted ? " svc-inv" : ""}`} data-big={big ? "1" : undefined} {...cardGlow(s.glow)}
      style={{ position: "relative", overflow: "hidden", gridColumn: `span ${big ? 3 : 2}`, borderRadius: 20, padding: 26, minHeight: big ? 268 : 248, display: "flex", flexDirection: "column", color: "inherit",
        ...(inverted ? { background: "linear-gradient(165deg,#EFEAE1,#DED6C8)", border: "1px solid rgba(18,21,26,0.14)" } : null) }}>
      {/* Trilho na cor do pilar: aresta dura no topo — sinal pré-atento (o olho
          pega antes de ler). */}
      <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: pil.rail, opacity: 0.9, pointerEvents: "none" }}></span>
      {!inverted && (
        <span aria-hidden style={{ position: "absolute", top: -70, right: -70, width: "min(190px, 60%)", height: 190, borderRadius: "50%", background: `radial-gradient(circle, ${s.accent}24, transparent 68%)`, pointerEvents: "none" }}></span>
      )}

      <div className="svc-head" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        {/* GRAFISMO: o desenho é o que diz O QUE É. Herda a cor via currentColor. */}
        <span className="svc-glyph" style={{ color: inverted ? pil.rail : s.accent, display: "block", flexShrink: 0 }}>
          <ServiceGlyph slug={s.slug} height={big ? 84 : 72} />
        </span>
        {/* Badge: nomeia a categoria — o código não depende SÓ da cor (a11y) e é
            aprendido já no primeiro card lido. */}
        <span style={{ flexShrink: 0, font: "600 10px var(--font-sans)", letterSpacing: "0.09em", textTransform: "uppercase", color: inverted ? pil.rail : s.accent, padding: "5px 10px", borderRadius: 999, background: inverted ? "rgba(18,21,26,0.06)" : `${s.accent}14`, border: `1px solid ${inverted ? "rgba(18,21,26,0.14)" : s.accent + "3d"}` }}>{pil.short}</span>
      </div>
      <div className="svc-body">
        <h3 style={{ font: `700 ${big ? 21 : 18.5}px var(--font-display)`, letterSpacing: "-0.02em", color: titleColor, margin: "18px 0 8px" }}>{s.title}</h3>
        <p style={{ font: "400 14px/1.55 var(--font-sans)", color: descColor, margin: 0 }}>{s.desc}</p>
        {/* 2 tags (eram 4): 76 pílulas idênticas viravam uma textura cinza
            uniforme em todo card — 2º maior motivo de "tudo igual". */}
        <div className="svc-tags" style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 16 }}>
          {s.tags.slice(0, 2).map((t) => (<span key={t} style={{ font: "500 11.5px var(--font-sans)", color: inverted ? "rgba(18,21,26,0.7)" : "rgba(255,255,255,0.72)", padding: "5px 10px", borderRadius: 999, background: inverted ? "rgba(18,21,26,0.05)" : "rgba(255,255,255,0.045)", border: `1px solid ${inverted ? "rgba(18,21,26,0.12)" : "rgba(255,255,255,0.09)"}` }}>{t}</span>))}
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: "auto", paddingTop: 16, font: "600 13px var(--font-sans)", color: inverted ? pil.rail : s.accent }}>
          Saiba mais <i data-lucide="arrow-right" style={{ width: 14, height: 14 }}></i>
        </span>
      </div>
    </a>
  );
}

function Services({ services }) {
  const spot = useSpotlight();
  const [pillar, setPillar] = useState("todos");
  const shown = pillar === "todos" ? PILLARS : PILLARS.filter((p) => p.key === pillar);
  return (
    <section id="servicos" className="sec">
      <div className="wrap">
        <SectionHead center eyebrow="Serviços" title="Tudo que a" accent="HyperGrow faz" dotColor="#2DD4A0" sub="4 frentes, 19 serviços, uma operação só — da loja virtual à IA que atende por você." />
        {/* Pilares: legenda viva do código de cores — cada um na SUA cor, então
            a taxonomia ensina o sistema. Clicar filtra. */}
        <div className="reveal stagger" style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 14 }}>
          {PILLARS.map((p) => {
            const on = pillar === p.key;
            return (
              <button key={p.key} onClick={() => setPillar(on ? "todos" : p.key)} className="glowcard neon-card" {...cardGlow(p.glow)}
                aria-pressed={on}
                style={{ textAlign: "left", cursor: "pointer", borderRadius: 16, padding: 18, display: "flex", gap: 12, alignItems: "flex-start",
                  background: on ? `linear-gradient(180deg, ${p.accent}1f, rgba(255,255,255,0.02))` : undefined,
                  border: `1px solid ${on ? p.accent + "8c" : "rgba(255,255,255,0.08)"}` }}>
                <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", color: p.accent, background: `${p.accent}1f`, border: `1px solid ${p.accent}59` }}>
                  <i data-lucide={p.icon} style={{ width: 19, height: 19 }}></i>
                </span>
                <div>
                  <div style={{ font: "700 14.5px var(--font-sans)", color: "#fff" }}>{p.label}</div>
                  <div style={{ font: "400 12.5px/1.4 var(--font-sans)", color: "rgba(255,255,255,0.55)", marginTop: 3 }}>{p.desc}</div>
                  <div style={{ font: "600 11px var(--font-mono)", color: p.accent, marginTop: 8, letterSpacing: "0.04em" }}>{p.slugs.length} serviços</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Um BLOCO por pilar, com cabeçalho próprio — em vez de uma parede de
            19 cards soltos, o visitante lê 4 grupos com significado. */}
        {shown.map((p) => (
          <div key={p.key} style={{ marginTop: 44 }}>
            <div className="reveal" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <span aria-hidden style={{ width: 3, height: 30, borderRadius: 2, background: p.rail, flexShrink: 0 }}></span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <h3 style={{ font: "700 clamp(19px,2.2vw,24px) var(--font-display)", letterSpacing: "-0.025em", color: "#fff", margin: 0 }}>{p.label}</h3>
                <span style={{ font: "400 13.5px var(--font-sans)", color: "rgba(255,255,255,0.5)" }}>{p.desc}</span>
              </div>
            </div>
            <div ref={spot.ref} onMouseMove={spot.onMouseMove} className="spotlight reveal stagger svc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 18, borderRadius: 24, padding: 2 }}>
              {services.filter((s) => p.slugs.includes(s.slug)).map((s) => <ServiceCard key={s.slug} s={s} />)}
            </div>
          </div>
        ))}
      </div>
      {/* Bento responsivo: 6 col (3 cards/linha, carro-chefe ocupa metade)
          → 4 col no tablet → LINHA HORIZONTAL no celular. */}
      <style>{`
        @media (max-width: 1100px){
          .svc-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .svc-card { grid-column: span 2 !important; }
        }
        /* Celular: o card deita. Grafismo à esquerda (continua sendo a pista
           visual), texto à direita. Altura cai de ~320px para ~132px — a seção
           inteira sai de ~7,8 telas de rolagem para ~3, sem perder identidade. */
        @media (max-width: 720px){
          .svc-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .svc-card {
            grid-column: span 1 !important;
            min-height: 0 !important;
            flex-direction: row !important;
            align-items: center;
            gap: 16px;
            padding: 16px !important;
          }
          .svc-card .svc-head { flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0; }
          .svc-card .svc-glyph svg { height: 56px !important; width: 84px !important; }
          .svc-card .svc-body { flex: 1; min-width: 0; }
          .svc-card .svc-body h3 { margin: 0 0 4px !important; font-size: 16px !important; }
          .svc-card .svc-body p { font-size: 13px !important; line-height: 1.45 !important; }
          /* No formato deitado as tags viram ruído: o grafismo + título bastam. */
          .svc-card .svc-tags { display: none !important; }
          .svc-card .svc-body > span:last-child { padding-top: 10px !important; font-size: 12.5px !important; }
        }
      `}</style>
    </section>
  );
}

/* ───────────────────────── PainPoints ─────────────────────────
   Seção signature: em vez de listar serviços, parte da DOR real do visitante
   e mostra o diagnóstico + o serviço exato que resolve. É o elemento que a
   página é lembrada — útil, não decorativo. */
/* As fotos são fotografia real (StockSnap, CC0 1.0 — uso comercial liberado,
   créditos em public/fotos/CREDITOS.json). Entram como CONTEXTO da dor do
   visitante, nunca como "a equipe da HyperGrow": apresentar gente de banco de
   imagem como sendo o nosso time seria mentira, e mentira no site é o que a
   auditoria já teve de remover uma vez (os depoimentos inventados). */
const PAINS = [
  { icon: "monitor-x", pain: "Meu site não vende", diag: "Ou ninguém acha o seu site no Google, ou quem acha não entende o que você faz em 5 segundos e sai. Isso não se resolve deixando \"mais bonito\" — se resolve com estrutura, velocidade e uma oferta clara.", slug: "criacao-de-site", fix: "Criação de Site & Landing Pages", photo: "/fotos/checkout-loja-virtual.webp", photoAlt: "Cliente com o cartão na mão diante de uma loja virtual aberta no notebook" },
  { icon: "phone-missed", pain: "Perco cliente fora do horário", diag: "Mensagem chega às 22h, no fim de semana, no feriado — e só é respondida no dia seguinte. Nesse intervalo o cliente já comprou com o concorrente que respondeu na hora.", slug: "automacoes-ia", fix: "Automações & IA", proofId: "agentop", photo: "/fotos/operacao-diaria.webp", photoAlt: "Profissional atendendo pelo notebook em uma mesa de trabalho" },
  { icon: "flame", pain: "Anúncio queima dinheiro sem resultado", diag: "Campanha ligada sem estratégia de público, criativo ou funil só transforma orçamento em cliques que não convertem. O problema raramente é a plataforma — é a falta de plano por trás dela.", slug: "marketing-trafego", fix: "Marketing Digital & Tráfego Pago", photo: "/fotos/painel-resultados.webp", photoAlt: "Painel de métricas e gráficos de campanha aberto no notebook" },
  { icon: "instagram", pain: "Meu Instagram não traz cliente", diag: "Postar sem calendário, sem pilar de conteúdo e sem chamada para ação vira feed bonito que não gera venda. Rede social sem estratégia é vitrine vazia.", slug: "redes-sociais", fix: "Gestão de Redes Sociais", photo: "/fotos/reuniao-projeto.webp", photoAlt: "Duas pessoas planejando um calendário de conteúdo sobre a mesa" },
];

function PainPoints() {
  const [active, setActive] = useState(0);
  const p = PAINS[active];
  return (
    <section className="sec" id="dores">
      <div className="wrap">
        <SectionHead center eyebrow="Reconhece algum desses?" title="Provavelmente você chegou aqui por" accent="um desses motivos" dotColor="#C4763C" sub="Escolha a dor que mais pesa hoje — a gente mostra exatamente o que resolve ela." />
        <div className="reveal" style={{ marginTop: 44, display: "grid", gridTemplateColumns: "minmax(0,0.85fr) minmax(0,1.15fr)", gap: 24, alignItems: "stretch" }} id="pain-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PAINS.map((item, i) => (
              <button key={item.pain} onClick={() => setActive(i)} className={active === i ? "neon-card" : "glowcard neon-card"}
                style={{ textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, borderRadius: 16, padding: "16px 18px",
                  background: active === i ? "linear-gradient(180deg, rgba(196,118,60,0.14), rgba(255,255,255,0.02))" : undefined,
                  border: active === i ? "1px solid rgba(196,118,60,0.5)" : "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 11, display: "inline-flex", alignItems: "center", justifyContent: "center", color: active === i ? "#D99461" : "rgba(255,255,255,0.6)", background: active === i ? "rgba(196,118,60,0.16)" : "rgba(255,255,255,0.05)" }}>
                  <i data-lucide={item.icon} style={{ width: 18, height: 18 }}></i>
                </span>
                <span style={{ font: "600 15px var(--font-sans)", color: "#fff" }}>{item.pain}</span>
                <i data-lucide="chevron-right" style={{ width: 16, height: 16, marginLeft: "auto", color: "rgba(255,255,255,0.4)", transform: active === i ? "translateX(2px)" : "none", transition: "transform .3s" }}></i>
              </button>
            ))}
          </div>
          <div className="neon-card glass-top" style={{ borderRadius: 22, padding: 0, background: "linear-gradient(165deg, rgba(196,118,60,0.08), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Foto do contexto da dor: a seção signature deixa de ser um bloco de
                texto e passa a mostrar a situação de que o visitante já reconhece. */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/7", background: "#171B20", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={p.photo} src={p.photo} alt={p.photoAlt} width={960} height={640} loading="lazy" decoding="async"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 42%" }} />
              <span aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(13,16,19,0.15) 0%, rgba(13,16,19,0.55) 62%, rgba(13,16,19,0.94) 100%)" }}></span>
            </div>
            <div style={{ padding: "22px 34px 34px", display: "flex", flexDirection: "column", flex: 1, marginTop: -6 }}>
            <div className="eyebrow" style={{ alignSelf: "flex-start" }}><span className="dot" style={{ background: "#D99461", boxShadow: "0 0 10px #D99461" }}></span>Diagnóstico</div>
            <p style={{ font: "500 19px/1.55 var(--font-display)", color: "#fff", margin: "18px 0 0", textWrap: "pretty" }}>{p.diag}</p>
            <div style={{ marginTop: "auto", paddingTop: 26, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
              <span style={{ font: "400 13px var(--font-sans)", color: "rgba(255,255,255,0.55)" }}>O que resolve:</span>
              <a href={`/servicos/${p.slug}`} className="pill" style={{ textDecoration: "none", color: "#fff", background: "rgba(196,118,60,0.14)", borderColor: "rgba(196,118,60,0.4)" }}>{p.fix} <i data-lucide="arrow-right" style={{ width: 13, height: 13 }}></i></a>
            </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width:760px){ #pain-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* ───────────────────────── AIAgent + Differentiators ───────────────────────── */
function AIAgent() {
  const spot = useSpotlight();
  const steps = [
    { n: "01", icon: "message-circle-heart", t: "Atende e qualifica", d: "Responde no WhatsApp 24/7, tira dúvidas e qualifica o lead antes de você.", c: "#6FBF9A" },
    { n: "02", icon: "calendar-plus", t: "Agenda sozinho", d: "Consulta horários livres e marca o compromisso direto na sua agenda.", c: "#2DD4A0" },
    { n: "03", icon: "video", t: "Reunião no Meet", d: "Cria o evento no Google Meet e dispara o link automaticamente.", c: "#6FE3B4" },
    { n: "04", icon: "database", t: "Joga no CRM", d: "O lead entra no CRM com todo o histórico da conversa registrado.", c: "#D99461" },
  ];
  const chips = ["Chatbots", "Agentes IA", "IA para vendas", "IA para suporte", "Análise de dados"];
  return (
    <section id="ia" className="sec" style={{ position: "relative" }}>
      <div aria-hidden="true" style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "min(780px, 100%)", height: 360, background: "radial-gradient(ellipse, rgba(111,191,154,0.12), transparent 64%)", pointerEvents: "none" }}></div>
      <div className="wrap" style={{ position: "relative" }}>
        <SectionHead center eyebrow="Soluções de Inteligência Artificial" dotColor="#6FBF9A" title="Um agente de IA que atende, agenda e" accent="vende por você" sub="Implantamos agentes que conversam com seus clientes, marcam reuniões no Google Meet e alimentam seu CRM — sem intervenção manual, 24 horas por dia." />
        <div ref={spot.ref} onMouseMove={spot.onMouseMove} className="spotlight reveal stagger" style={{ marginTop: 52, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, borderRadius: 24 }}>
          {steps.map((s) => (
            <article key={s.n} className="glowcard neon-card" {...cardGlow(s.c + "70")} style={{ borderRadius: 18, padding: 24, position: "relative" }}>
              <div className="mono" style={{ font: "700 13px var(--font-mono)", color: s.c, opacity: 0.7, marginBottom: 16 }}>{s.n}</div>
              <span style={{ width: 46, height: 46, borderRadius: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", color: s.c, background: "rgba(255,255,255,0.05)", border: `1px solid ${s.c}44`, boxShadow: `0 0 22px -12px ${s.c}` }}>
                <i data-lucide={s.icon} className="bob" style={{ width: 21, height: 21 }}></i>
              </span>
              <h3 style={{ font: "700 16.5px var(--font-display)", color: "#fff", margin: "16px 0 8px" }}>{s.t}</h3>
              <p style={{ font: "400 13.5px/1.55 var(--font-sans)", color: "rgba(255,255,255,0.58)", margin: 0 }}>{s.d}</p>
            </article>
          ))}
        </div>
        <div className="reveal" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10, marginTop: 32 }}>
          {chips.map((c) => <span key={c} className="pill"><i data-lucide="zap" style={{ width: 13, height: 13, color: "#6FBF9A" }}></i>{c}</span>)}
        </div>
      </div>
    </section>
  );
}

function Differentiators() {
  const spot = useSpotlight();
  const items = [
    ["zap", "Entrega rápida", "#6FBF9A"], ["cpu", "Tecnologia de ponta", "#2DD4A0"],
    ["brain-circuit", "IA integrada", "#6FE3B4"], ["workflow", "Automação completa", "#0B7A4C"],
    ["trending-up", "Escalabilidade", "#3FAE7C"], ["headset", "Suporte especializado", "#D99461"],
    ["shield-check", "Segurança avançada", "#6FE3B4"], ["sliders-horizontal", "Soluções personalizadas", "#fbbf24"],
  ];
  return (
    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <SectionHead center eyebrow="Diferenciais" title="Por que escolher a" accent="HyperGrow?" dotColor="#D99461" sub="Não vendemos código. Entregamos resultado — no ar, gerando receita." />
        <div ref={spot.ref} onMouseMove={spot.onMouseMove} className="spotlight reveal stagger diff-grid" style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, borderRadius: 24 }}>
          {items.map(([ic, t, c]) => (
            <div key={t} className="glowcard neon-card" {...cardGlow(c + "66")} style={{ borderRadius: 16, padding: "26px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <span style={{ width: 52, height: 52, borderRadius: 15, display: "inline-flex", alignItems: "center", justifyContent: "center", color: c, background: "rgba(255,255,255,0.05)", border: `1px solid ${c}44`, boxShadow: `0 0 26px -14px ${c}` }}>
                <i data-lucide={ic} className="bob" style={{ width: 24, height: 24 }}></i>
              </span>
              <span style={{ font: "600 14.5px var(--font-sans)", color: "#fff" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width:900px){ #ia .spotlight { grid-template-columns: 1fr 1fr !important; } .diff-grid { grid-template-columns: 1fr 1fr !important; } } @media (max-width:560px){ #ia .spotlight { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* ───────────────────────── Portfolio + Process ───────────────────────── */
function Portfolio() {
  // Lista em lib/projects.ts — a página /sobre usa a MESMA fonte.
  const cats = PROJECT_CATS;
  const [active, setActive] = useState("Todos");
  const shown = PROJECTS.filter((p) => active === "Todos" || p.cat.includes(active));
  return (
    <section id="portfolio" className="sec">
      <div className="wrap">
        <SectionHead center eyebrow="Portfólio" title="Projetos reais," accent="no ar e gerando receita" dotColor="#0B7A4C" sub="Não vendemos mockups. Cada projeto abaixo é um produto que conhecemos e que está rodando hoje." />
        <div className="reveal" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 9, marginTop: 34 }}>
          {cats.map((c) => (
            <button key={c} onClick={() => setActive(c)} style={{ font: "600 13px var(--font-sans)", padding: "9px 16px", borderRadius: 999, cursor: "pointer", transition: "all .25s var(--ease-out-premium)", color: active === c ? "#fff" : "rgba(255,255,255,0.66)", background: active === c ? "linear-gradient(135deg,#0B7A4C,#0FA968)" : "rgba(255,255,255,0.04)", border: active === c ? "1px solid rgba(11,122,76,0.6)" : "1px solid rgba(255,255,255,0.1)", boxShadow: active === c ? "0 0 22px -6px rgba(11,122,76,0.8)" : "none" }}>{c}</button>
          ))}
        </div>
        <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="port-grid">
          {shown.map((p) => (
            <article key={p.id} className="glowcard neon-card reveal in" {...cardGlow("rgba(11,122,76,0.4)")} style={{ borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", aspectRatio: "16/10", background: p.grad }}>
                {/* Todos os 10 projetos têm capa real em /portfolio/ — print do site (6) ou card de marca desenhado (4, sem URL pública). */}
                <ImageSlot placeholder={`Print do ${p.name}`} src={`/portfolio/${p.id}.webp`} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(5,11,26,0.55))", pointerEvents: "none" }}></div>
                <div style={{ position: "absolute", left: 14, top: 14, display: "flex", gap: 6, pointerEvents: "none" }}>
                  {p.tags.map((t) => <span key={t} style={{ font: "600 10px var(--font-sans)", letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", padding: "4px 9px", borderRadius: 999, background: "rgba(5,11,26,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>{t}</span>)}
                </div>
              </div>
              <div style={{ padding: 22, display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ font: "700 18px var(--font-display)", color: "#fff", margin: "0 0 8px" }}>{p.name}</h3>
                <p style={{ font: "400 13.5px/1.55 var(--font-sans)", color: "rgba(255,255,255,0.58)", margin: 0, flex: 1 }}>{p.desc}</p>
                <a href={p.url || "#contato"} target={p.url ? "_blank" : undefined} rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, font: "600 13px var(--font-sans)", color: "#6FE3B4", transition: "gap .2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.gap = "11px"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.gap = "7px"; e.currentTarget.style.color = "#6FE3B4"; }}>
                  {p.url ? "Ver site" : "Ver projeto"} <i data-lucide={p.url ? "external-link" : "arrow-right"} style={{ width: 15, height: 15 }}></i>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
      <style>{`@media (max-width:900px){ .port-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function Process() {
  const steps = [
    { n: "01", icon: "search", t: "Diagnóstico", d: "Entendemos sua operação, metas e gargalos antes de propor qualquer solução." },
    { n: "02", icon: "clipboard-list", t: "Planejamento", d: "Desenhamos a estratégia, o escopo e o roadmap de tecnologia ideal." },
    { n: "03", icon: "code-2", t: "Desenvolvimento", d: "Construímos com tecnologia de ponta, IA e automação — direto ao ponto." },
    { n: "04", icon: "rocket", t: "Implantação", d: "Colocamos no ar, integramos e treinamos sua equipe para usar." },
    { n: "05", icon: "trending-up", t: "Crescimento", d: "Monitoramos, otimizamos e escalamos os resultados de forma contínua." },
  ];
  return (
    <section id="processo" className="sec">
      <div className="wrap">
        <SectionHead center eyebrow="Processo" title="Do diagnóstico ao" accent="crescimento" dotColor="#6FE3B4" sub="Um método claro, do primeiro diagnóstico ao crescimento que não para." />
        <div className="reveal stagger proc-grid" style={{ position: "relative", marginTop: 56, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
          <div aria-hidden="true" className="proc-beam" style={{ position: "absolute", top: 30, left: "10%", right: "10%", height: 2, background: "linear-gradient(90deg, #0FA968, #0B7A4C, #C4763C)", boxShadow: "0 0 16px -2px rgba(11,122,76,0.8)", opacity: 0.5 }}></div>
          {steps.map((s) => (
            <div key={s.n} style={{ position: "relative", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span className="neon-card" style={{ width: 60, height: 60, borderRadius: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "linear-gradient(150deg, rgba(10,90,63,0.9), rgba(11,122,76,0.9))", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 0 30px -10px rgba(11,122,76,0.9)", position: "relative", zIndex: 1 }}>
                <i data-lucide={s.icon} style={{ width: 24, height: 24 }}></i>
              </span>
              <div className="mono" style={{ font: "700 11px var(--font-mono)", color: "#6FE3B4", letterSpacing: "0.1em", margin: "16px 0 6px" }}>PASSO {s.n}</div>
              <h3 style={{ font: "700 16px var(--font-display)", color: "#fff", margin: "0 0 8px" }}>{s.t}</h3>
              <p style={{ font: "400 13px/1.5 var(--font-sans)", color: "rgba(255,255,255,0.56)", margin: 0, maxWidth: 200 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width:900px){ .proc-grid { grid-template-columns: 1fr !important; gap: 28px !important; } .proc-beam { display:none; } }`}</style>
    </section>
  );
}

/* ───────────────────────── Testimonials + About ───────────────────────── */
// Prova verificável em vez de depoimento inventado: fato concreto de um projeto
// REAL, no ar, com link — qualquer visitante pode clicar e conferir. Substituiu
// os 3 depoimentos placeholder (ninguém disse aquelas frases).
function Testimonials() {
  /* `id` aponta para a capa REAL em /portfolio/<id>.webp — a mesma tela que está
     no ar. A prova deixou de ser só uma frase: agora o visitante VÊ o produto
     dentro de uma moldura de navegador com o domínio verdadeiro na barra. */
  const items = [
    { id: "sorteio", fact: "Analisa 24 meses de sorteios oficiais da Caixa, gera combinações por IA e cobra por PIX real com liberação automática via webhook.", project: "Sorteio Bilionário IA", url: "https://www.sorteiobilionario.com.br", host: "sorteiobilionario.com.br", c: "#D99461" },
    { id: "agentop", fact: "Agenda, CRM, financeiro e um agente de IA que atende no WhatsApp — rodando multi-tenant para dezenas de profissionais autônomos.", project: "Agentop", url: "https://agentop.com.br", host: "agentop.com.br", c: "#6FBF9A" },
    { id: "clicouenviou", fact: "Reúne múltiplas transportadoras num painel único, simplificando o envio de quem vende em e-commerce.", project: "Clicou Enviou", url: "https://www.clicouenviou.com.br", host: "clicouenviou.com.br", c: "#0B7A4C" },
    { id: "nutri", fact: "Estima macronutrientes a partir de uma foto do prato, com visão computacional em tempo real.", project: "NutriSnap", url: "https://calorias.app.br", host: "calorias.app.br", c: "#2DD4A0" },
  ];
  const [i, setI] = useState(0);
  const secRef = useRef(null);
  const go = (d) => setI((v) => (v + d + items.length) % items.length);
  /* ⚠️ ISTO CAUSAVA A FALHA DE HIDRATAÇÃO DA HOME (React #425 x4, #418, #423).
     O relógio antigo (`setInterval` no mount) começava a girar enquanto o React
     AINDA estava hidratando — a home tem ~1.500 nós e a hidratação leva segundos
     no celular. Quando o índice mudava no meio disso, o texto do cartão deixava
     de bater com o HTML do servidor: 4 textos divergentes (frase, nome do
     projeto, link e domínio) = exatamente os 4 erros #425 medidos em produção.
     O React então DESCARTAVA o HTML do servidor e re-renderizava a página
     inteira no cliente — comprovado por MutationObserver: HEADER, MAIN e FOOTER
     removidos de uma vez.

     Agora só gira enquanto a seção está VISÍVEL. Como ela fica muito abaixo da
     dobra, nada muda durante a hidratação. De brinde, o timer para de rodar fora
     da tela (economia de bateria/INP, item que a auditoria de performance pedia). */
  useEffect(() => {
    const el = secRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let t = null;
    const parar = () => { if (t) { clearInterval(t); t = null; } };
    const io = new IntersectionObserver((entries) => {
      const visivel = entries.some((e) => e.isIntersecting);
      if (visivel && !t) t = setInterval(() => setI((v) => (v + 1) % items.length), 7000);
      else if (!visivel) parar();
    }, { threshold: 0.25 });
    io.observe(el);
    return () => { parar(); io.disconnect(); };
  }, []);
  const t = items[i];
  return (
    <section className="sec" id="depoimentos" ref={secRef}>
      <div className="wrap">
        <SectionHead center eyebrow="Prova, não promessa" title="Não é depoimento inventado." accent="É o produto no ar." dotColor="#D99461" sub="Cada fato abaixo é sobre um projeto real da HyperGrow, ainda funcionando hoje. Clique e confira você mesmo." />
        <div className="reveal" style={{ maxWidth: 1080, margin: "44px auto 0" }}>
          <a href={t.url} target="_blank" rel="noopener noreferrer" className="neon-card glass-top" style={{ position: "relative", display: "block", borderRadius: 24, padding: "clamp(24px, 3vw, 38px)", background: "linear-gradient(165deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 90px -40px rgba(0,0,0,0.7)", overflow: "hidden", color: "inherit" }}>
            <div aria-hidden="true" style={{ position: "absolute", top: -40, right: -20, width: "min(220px, 60%)", height: 220, background: `radial-gradient(circle, ${t.c}33, transparent 66%)`, transition: "all .6s", pointerEvents: "none" }}></div>
            <div className="prova-grid" style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.06fr)", gap: "clamp(22px, 3vw, 38px)", alignItems: "center" }}>
              <div>
                <i data-lucide="badge-check" style={{ width: 36, height: 36, color: t.c, opacity: 0.75, marginBottom: 16 }}></i>
                <p style={{ font: "500 clamp(18px, 1.9vw, 22px)/1.5 var(--font-display)", letterSpacing: "-0.015em", color: "#fff", margin: 0, textWrap: "pretty" }}>{t.fact}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
                  <span style={{ font: "600 15px var(--font-sans)", color: "#fff" }}>{t.project}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "600 12.5px var(--font-sans)", color: t.c }}>Ver no ar <i data-lucide="external-link" style={{ width: 13, height: 13 }}></i></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 22 }} onClick={(e) => e.preventDefault()}>
                  <div style={{ display: "flex", gap: 7 }}>
                    {items.map((_, k) => (<button key={k} onClick={(e) => { e.preventDefault(); setI(k); }} aria-label={`Prova ${k + 1}`} style={{ width: k === i ? 26 : 8, height: 8, borderRadius: 999, border: "none", cursor: "pointer", transition: "all .3s", background: k === i ? "linear-gradient(90deg,#0B7A4C,#C4763C)" : "rgba(255,255,255,0.2)" }}></button>))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["chevron-left", -1], ["chevron-right", 1]].map(([ic, d]) => (
                      <button key={ic} onClick={(e) => { e.preventDefault(); go(d); }} className="neon-card" style={{ width: 40, height: 40, borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)" }}>
                        <i data-lucide={ic} style={{ width: 18, height: 18 }}></i>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* A tela REAL do produto, na moldura do navegador com o domínio de
                  verdade na barra. É a diferença entre afirmar e mostrar. */}
              <BrowserFrame key={t.id} src={`/portfolio/${t.id}.webp`} alt={`${t.project} — tela real do produto no ar`} title={t.host} maxWidth={540} />
            </div>
          </a>
        </div>
      </div>
      <style>{`@media (max-width: 860px){ .prova-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function About() {
  const stats = [
    { v: "6", l: "Projetos próprios", c: "#2DD4A0" },
    { v: "5", l: "Mercados atendidos", c: "#6FE3B4" },
    { v: "24/7", l: "Operação ativa", c: "#6FE3B4" },
    { v: "100%", l: "Construído com IA", c: "#D99461" },
  ];
  return (
    <section id="sobre" className="sec">
      <div className="wrap">
        <div className="neon-card reveal about-card glass-top" style={{ borderRadius: 28, overflow: "hidden", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 0, background: "linear-gradient(150deg, rgba(23,27,32,0.7), rgba(13,16,19,0.7))", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 50px 120px -50px rgba(0,0,0,0.8)" }}>
          <div style={{ padding: "52px 48px" }} className="about-copy">
            <div className="eyebrow" style={{ marginBottom: 22 }}><span className="dot"></span>Sobre a HyperGrow</div>
            <h2 style={{ font: "700 clamp(28px,3.4vw,40px)/1.08 var(--font-display)", letterSpacing: "-0.03em", color: "#fff", margin: 0, textWrap: "balance" }}>Um estúdio que <span className="accent">opera</span>,<br />não só desenha.</h2>
            <p style={{ font: "400 16px/1.65 var(--font-sans)", color: "rgba(255,255,255,0.64)", margin: "22px 0 0", maxWidth: 460, textWrap: "pretty" }}>A HyperGrow não entrega projeto bonito que morre na gaveta. Construímos, botamos e operamos cada produto como se fosse o nosso — testando em mercados reais, evoluindo com dados e automação por padrão.</p>
            <p style={{ font: "400 16px/1.65 var(--font-sans)", color: "rgba(255,255,255,0.64)", margin: "16px 0 0", maxWidth: 460, textWrap: "pretty" }}>Nosso portfólio cobre saúde, serviços, apostas, funções e logística — sempre com a mesma régua: nível premium, experiência supersônica e foco em metas reais.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 34, maxWidth: 420 }}>
              {stats.map((s) => (<div key={s.l}><div style={{ font: "800 38px/1 var(--font-display)", letterSpacing: "-0.03em", color: s.c, textShadow: `0 0 26px ${s.c}66` }}>{s.v}</div><div style={{ font: "500 13px var(--font-sans)", color: "rgba(255,255,255,0.6)", marginTop: 6 }}>{s.l}</div></div>))}
            </div>
          </div>
          {/* Composição de marca (não uma foto — a HyperGrow ainda não tem fotos reais do time
              para usar aqui; um placeholder de "foto" seria enganoso). */}
          <div style={{ position: "relative", minHeight: 380, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "linear-gradient(160deg,#0A7048,#0B7A4C 60%,#C4763C)" }} className="about-photo">
            <span aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "38px 38px", WebkitMaskImage: "radial-gradient(70% 70% at 50% 50%, #000, transparent 82%)", maskImage: "radial-gradient(70% 70% at 50% 50%, #000, transparent 82%)" }}></span>
            <span aria-hidden style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.18)" }}></span>
            <span aria-hidden style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)" }}></span>
            <div style={{ position: "relative", transform: "scale(2.1)" }}><Logo height={34} showWord={false} /></div>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(13,16,19,0.5), transparent 40%)", pointerEvents: "none" }}></div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width:900px){ .about-card { grid-template-columns: 1fr !important; } .about-photo { min-height: 280px !important; } .about-copy { padding: 40px 28px !important; } }`}</style>
    </section>
  );
}

/* ───────────────────────── FAQ + FinalCTA + Contact ───────────────────────── */
function FAQ() {
  // As perguntas vêm de lib/home-faq.ts — o MESMO array que app/page.tsx usa para
  // emitir o schema FAQPage. Fonte única: o que está na tela e o que o Google lê
  // não podem divergir.
  const qs = HOME_FAQ.map((f) => [f.q, f.a]);
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <SectionHead center eyebrow="FAQ" title="Perguntas" accent="frequentes" dotColor="#6FE3B4" />
        <div className="reveal" style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
          {qs.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="neon-card" onClick={() => setOpen(isOpen ? -1 : i)} style={{ borderRadius: 16, cursor: "pointer", overflow: "hidden", background: isOpen ? "linear-gradient(180deg, rgba(11,122,76,0.1), rgba(255,255,255,0.02))" : "rgba(255,255,255,0.03)", border: `1px solid ${isOpen ? "rgba(11,122,76,0.4)" : "rgba(255,255,255,0.08)"}`, boxShadow: isOpen ? "0 0 30px -10px rgba(11,122,76,0.5)" : "none", transition: "all .3s var(--ease-out-premium)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "19px 22px" }}>
                  <span style={{ font: "600 16px var(--font-sans)", color: "#fff" }}>{q}</span>
                  <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", color: isOpen ? "#fff" : "#6FE3B4", background: isOpen ? "linear-gradient(135deg,#0B7A4C,#0FA968)" : "rgba(255,255,255,0.05)", transition: "transform .3s", transform: isOpen ? "rotate(45deg)" : "none" }}>
                    <i data-lucide="plus" style={{ width: 17, height: 17 }}></i>
                  </span>
                </div>
                <div style={{ maxHeight: isOpen ? 240 : 0, transition: "max-height .42s var(--ease-out-premium)", overflow: "hidden" }}>
                  <p style={{ font: "400 14.5px/1.65 var(--font-sans)", color: "rgba(255,255,255,0.62)", margin: 0, padding: "0 22px 22px" }}>{a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="neon-card reveal reveal--scale glass-top" style={{ position: "relative", borderRadius: 28, padding: "64px 40px", textAlign: "center", overflow: "hidden", background: "radial-gradient(120% 120% at 50% -20%, rgba(11,122,76,0.35), rgba(23,27,32,0.6) 55%, rgba(13,16,19,0.7))", border: "1px solid rgba(11,122,76,0.35)", boxShadow: "0 0 80px -30px rgba(11,122,76,0.7)" }}>
          <div aria-hidden="true" style={{ position: "absolute", bottom: -120, left: "50%", transform: "translateX(-50%)", width: "min(600px, 100%)", height: 300, background: "radial-gradient(ellipse, rgba(196,118,60,0.3), transparent 64%)", pointerEvents: "none" }}></div>
          <div style={{ position: "relative" }}>
            <h2 style={{ font: "800 clamp(30px,4.4vw,52px)/1.05 var(--font-display)", letterSpacing: "-0.035em", color: "#fff", margin: 0, textWrap: "balance", maxWidth: 720, marginInline: "auto" }}>Pronto para acelerar o <span className="neon-tube blue" style={{ fontStyle: "italic" }}>crescimento</span> da sua empresa?</h2>
            <p style={{ font: "400 17px/1.6 var(--font-sans)", color: "rgba(255,255,255,0.7)", margin: "20px auto 0", maxWidth: 520 }}>Transforme sua operação com tecnologia, automação e inteligência artificial.</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 34 }}>
              <a href="#contato" className="btn btn-cta">Solicitar proposta <i data-lucide="arrow-right" style={{ width: 18, height: 18 }}></i></a>
              <a href={waUrl} target={WHATSAPP ? "_blank" : undefined} rel="noopener noreferrer" className="btn btn-ghost"><i data-lucide="message-circle" style={{ width: 18, height: 18 }}></i> Conversar no WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* O formulário em si mora em components/site/ContactForm.tsx — a página /contato
   usa exatamente o mesmo componente (mesma rota /api/lead, mesmo payload). */
function Contact() {
  return (
    <section id="contato" className="sec">
      <div className="wrap">
        <div className="reveal contact-grid" style={{ display: "grid", gridTemplateColumns: "0.86fr 1.14fr", gap: 40, alignItems: "start" }}>
          <div className="contact-left">
            <div className="eyebrow" style={{ marginBottom: 20 }}><span className="dot"></span>Contato</div>
            <h2 style={{ font: "700 clamp(30px,3.6vw,44px)/1.06 var(--font-display)", letterSpacing: "-0.03em", color: "#fff", margin: 0 }}>Solicite seu <span className="accent">orçamento</span></h2>
            <p style={{ font: "400 16px/1.6 var(--font-sans)", color: "rgba(255,255,255,0.62)", margin: "18px 0 28px", maxWidth: 380 }}>Conte o que a empresa precisa e em até 1 dia útil você recebe uma proposta sob medida.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 30 }}>
              {[["rocket", "No ar rápido", "Primeira versão funcional no menor tempo"], ["smartphone", "Mobile-first", "Tudo pensado primeiro para o celular"], ["shield-check", "Sem dor de cabeça", "Cuidamos de domínio, hospedagem e suporte"]].map(([ic, t, d]) => (
                <div key={t} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 11, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#6FE3B4", background: "rgba(15,169,104,0.12)", border: "1px solid rgba(15,169,104,0.3)" }}><i data-lucide={ic} style={{ width: 18, height: 18 }}></i></span>
                  <div><div style={{ font: "600 15px var(--font-sans)", color: "#fff" }}>{t}</div><div style={{ font: "400 13px var(--font-sans)", color: "rgba(255,255,255,0.55)" }}>{d}</div></div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, font: "500 14px var(--font-sans)", color: "rgba(255,255,255,0.7)" }}>
              {/* Ver nota no rodapé: o e-mail contato@hypergrow.com.br não existe
                  enquanto o domínio não for registrado — anunciá-lo faz o visitante
                  escrever para um endereço que devolve erro. */}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><i data-lucide="send" style={{ width: 16, height: 16, color: "#6FE3B4" }}></i> Preencha o formulário ao lado</span>
              {WHATSAPP ? (
                <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "inherit" }}><i data-lucide="message-circle" style={{ width: 16, height: 16, color: "#6FE3B4" }}></i> Atendimento via WhatsApp</a>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><i data-lucide="clock" style={{ width: 16, height: 16, color: "#6FE3B4" }}></i> Resposta em até 1 dia útil</span>
              )}
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
      <style>{`@media (max-width:900px){ .contact-grid { grid-template-columns: 1fr !important; } .contact-fields { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function Footer() {
  /* Links REAIS. Antes os 13 apontavam para "#contato": o rodapé é onde o Google
     entende a hierarquia do site, e um rodapé que só volta para a mesma âncora
     não distribui autoridade nenhuma para as 19 páginas de serviço. Também era
     ruim para o visitante — nenhum link levava ao que prometia. */
  const cols: [string, [string, string][]][] = [
    ["Serviços", [
      ["Criação de Site", "/servicos/criacao-de-site"],
      ["Loja Virtual", "/servicos/loja-virtual"],
      ["Tráfego Pago", "/servicos/marketing-trafego"],
      ["SEO", "/servicos/seo"],
      ["Redes Sociais", "/servicos/redes-sociais"],
      ["Automações & IA", "/servicos/automacoes-ia"],
      ["Ver todos os 19 →", "/servicos"],
    ]],
    ["Empresa", [
      ["Sobre a HyperGrow", "/sobre"],
      ["Portfólio", "#portfolio"],
      ["Processo", "#processo"],
      ["Blog", "/blog"],
      ["Contato", "/contato"],
    ]],
  ];
  /* Perfis sociais: os 3 ícones que existiam aqui (Instagram/LinkedIn/Facebook)
     apontavam para "#contato" — link falso, com aria-label mentindo para o leitor
     de tela. Removidos até haver perfil real. Para religar: preencher `url` aqui
     e declarar os mesmos endereços em `sameAs` no schema (app/layout.tsx). */
  const socials: { label: string; url: string; d: string }[] = [];
  return (
    <footer style={{ position: "relative", borderTop: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(180deg, transparent, rgba(13,16,19,0.6))" }}>
      <hr className="beam-divider" />
      <div className="wrap foot-grid" style={{ padding: "56px 32px 28px", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1.2fr", gap: 36 }}>
        <div>
          <Logo height={34} />
          <p style={{ font: "400 14px/1.6 var(--font-sans)", color: "rgba(255,255,255,0.55)", margin: "18px 0 0", maxWidth: 280 }}>Desenvolvimento de software, inteligência artificial e automação para acelerar o crescimento da sua empresa.</p>
          {socials.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              {socials.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="neon-card" style={{ width: 40, height: 40, borderRadius: 11, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", transition: "color .2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={s.d}></path></svg>
                </a>
              ))}
            </div>
          )}
        </div>
        {cols.map(([h, links]) => (
          <div key={h}>
            <div style={{ font: "600 12px var(--font-sans)", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>{h}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {links.map(([l, h]) => <a key={l} href={h} style={{ font: "400 14px var(--font-sans)", color: "rgba(255,255,255,0.66)", transition: "color .2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.66)")}>{l}</a>)}
            </div>
          </div>
        ))}
        <div>
          <div style={{ font: "600 12px var(--font-sans)", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Contato</div>
          {/* Só canal que FUNCIONA. O e-mail contato@hypergrow.com.br estava
              publicado aqui, mas o domínio ainda não existe (DNS NXDOMAIN): toda
              mensagem enviada para lá volta com erro. Publicar endereço morto é
              pior que não publicar. Volta assim que o domínio for registrado. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 11, font: "400 14px var(--font-sans)", color: "rgba(255,255,255,0.66)" }}>
            <a href="#contato" style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "inherit" }}><i data-lucide="send" style={{ width: 15, height: 15, color: "#6FE3B4" }}></i> Formulário de contato</a>
            {WHATSAPP ? (
              <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "inherit" }}><i data-lucide="message-circle" style={{ width: 15, height: 15, color: "#6FE3B4" }}></i> WhatsApp comercial</a>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}><i data-lucide="clock" style={{ width: 15, height: 15, color: "#6FE3B4" }}></i> Resposta em até 1 dia útil</span>
            )}
            <a href="#contato" className="btn btn-blue" style={{ marginTop: 8, fontSize: 13, padding: "11px 18px", justifyContent: "center" }}>Solicitar orçamento</a>
          </div>
        </div>
      </div>
      <div className="wrap foot-legal" style={{ padding: "20px 32px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, font: "400 13px var(--font-sans)", color: "rgba(255,255,255,0.45)" }}>
        <span>© 2026 HyperGrow · Todos os direitos reservados</span>
        {/* /privacidade e /termos existiam mas NENHUMA página linkava para elas —
            eram páginas órfãs (o Google chega nelas só pelo sitemap) e a LGPD
            espera o aviso de privacidade acessível de qualquer página. */}
        <span style={{ display: "inline-flex", gap: 16, flexWrap: "wrap" }}>
          <a href="/privacidade" style={{ color: "inherit" }}>Privacidade</a>
          <a href="/termos" style={{ color: "inherit" }}>Termos de uso</a>
        </span>
      </div>
      <style>{`@media (max-width:900px){ .foot-grid { grid-template-columns: 1fr 1fr !important; } } @media (max-width:760px){ .foot-legal { padding-bottom: 96px !important; flex-direction: column; gap: 6px; text-align: center; justify-content: center; } }`}</style>
    </footer>
  );
}

/* ───────────────────────── Root ───────────────────────── */
/** `services` chega do server component (app/page.tsx) já enxuto: só os 7 campos
 *  que a home usa. Assim o conteúdo das páginas de serviço nunca entra no bundle. */
export default function HypergrowSite({ services }: { services: ServiceCardData[] }) {
  // scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  /* ⚠️ CORRIDA COM A HIDRATAÇÃO (erro React #418/#423/#425 medido em PRODUÇÃO).
     O `createIcons()` do lucide TROCA cada <i data-lucide> por um <svg> direto no
     DOM. Com `strategy="afterInteractive"`, esse script de 348 KB podia executar
     no MEIO da hidratação — o React então encontrava <svg> onde tinha escrito
     <i>, acusava divergência e DESCARTAVA o HTML do servidor, re-renderizando a
     página inteira no cliente. É o mesmo estrago que o bug do `useId()` já tinha
     causado aqui, por outro caminho.

     Correção: `mounted` é false no servidor E na primeira renderização do
     cliente (a de hidratação), então a tag <Script> só entra na árvore DEPOIS
     que a hidratação terminou — a corrida deixa de existir. Efeito colateral
     bom: tira 348 KB do caminho crítico. Custo: os ícones aparecem um instante
     depois. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  // lucide icons — refresh after every render (covers dynamic icon swaps)
  useEffect(() => { try { window.lucide?.createIcons?.(); } catch {} });

  return (
    <>
      {mounted && <Script src="/lucide.min.js" strategy="afterInteractive" onLoad={() => { try { window.lucide?.createIcons?.(); } catch {} }} />}
      <div id="bg-field" aria-hidden="true"></div>
      <div className="grain" aria-hidden="true"></div>
      <Nav />
      <main>
        <Hero />
        <TrustMarquee />
        <Services services={services} />
        <PainPoints />
        <AIAgent />
        <Differentiators />
        <Portfolio />
        <Process />
        <Testimonials />
        <About />
        <FAQ />
        <FinalCTA />
        <Contact />
      </main>
      <Footer />
      <a href={waUrl} target={WHATSAPP ? "_blank" : undefined} rel="noopener noreferrer" aria-label="WhatsApp" className="wa-float" style={{ position: "fixed", left: 22, bottom: 22, zIndex: 900, width: 58, height: 58, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "linear-gradient(135deg,#25D366,#11875a)", boxShadow: "0 12px 34px -8px rgba(15,169,104,0.7), 0 0 0 1px rgba(255,255,255,0.1)", animation: "wa-pulse 2.6s ease-in-out infinite" }}>
        <i data-lucide="message-circle" style={{ width: 26, height: 26 }}></i>
      </a>
      <style>{`
        #bg-field { position: fixed; inset: 0; z-index: -1; pointer-events: none;
          background: radial-gradient(80% 50% at 15% -5%, rgba(15,169,104,0.20), transparent 60%), radial-gradient(70% 45% at 92% 8%, rgba(196,118,60,0.16), transparent 60%), radial-gradient(90% 60% at 50% 108%, rgba(11,122,76,0.18), transparent 62%), #0D1013; }
        #bg-field::after { content: ''; position: absolute; inset: 0; opacity: 0.5; background-image: linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px); background-size: 96px 96px; -webkit-mask-image: radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 78%); mask-image: radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 78%); }
        .h-sec .accent { filter: drop-shadow(0 0 22px rgba(11,122,76,0.55)) drop-shadow(0 0 38px rgba(196,118,60,0.35)); }
        .glowcard:hover { border-color: rgba(15,122,76,0.45) !important; }
        @keyframes wa-pulse { 0%,100% { box-shadow: 0 12px 34px -8px rgba(15,169,104,0.7), 0 0 0 0 rgba(15,169,104,0.5); } 50% { box-shadow: 0 12px 34px -8px rgba(15,169,104,0.7), 0 0 0 12px rgba(15,169,104,0); } }
      `}</style>
    </>
  );
}

"use client";

import type { ReactNode } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   PRIMITIVOS COMPARTILHADOS da rota /claro (tema claro, jade+cobre).

   Ícones: usamos `lucide-react` com IMPORT NOMEADO por arquivo (não um lookup
   dinâmico tipo `Icons[nome]`), de propósito — esse projeto já teve duas
   auditorias de performance apontando bundle inchado, e um lookup dinâmico
   por string desativa o tree-shaking do webpack (baixaria a biblioteca
   inteira). Cada arquivo de seção importa só os ícones que usa.

   Logo: MESMA geometria SVG do mark da marca (Logo() em HypergrowSite.tsx,
   viewBox 0 0 64 64) — não desenhei um novo. As cores já eram jade+cobre no
   mockup importado por coincidência nenhuma: é literalmente o mark oficial.
   Chave determinística (não useId()) — o motivo já custou bug real neste
   projeto: useId() gera prefixo diferente no servidor e no cliente para um
   <defs> de SVG, o React acusa divergência de hidratação e descarta o HTML do
   servidor inteiro.
   ──────────────────────────────────────────────────────────────────────────── */

export function ClaroLogo({ height = 34, showWord = true, light = false }: { height?: number; showWord?: boolean; light?: boolean }) {
  const uid = `cl${height}${showWord ? "w" : "n"}`;
  const g1 = `clA-${uid}`, g2 = `clB-${uid}`, gl = `clGlow-${uid}`, sh = `clSheen-${uid}`;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: height * 0.34 }}>
      <svg width={height} height={height} viewBox="0 0 64 64" fill="none" style={{ overflow: "visible", flexShrink: 0 }}>
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
      </svg>
      {showWord && (
        <span style={{ font: `700 ${height * 0.62}px var(--font-display)`, letterSpacing: "-0.04em", color: light ? "#fff" : "var(--ink)", lineHeight: 1, transition: "color .3s" }}>
          Hyper<span style={{ background: "linear-gradient(120deg,#2DD4A0,#0B7A4C 55%,#C4763C)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Grow</span>
        </span>
      )}
    </span>
  );
}

export function ClaroHead({ eyebrow, children, sub, center, style }: { eyebrow?: string; children: ReactNode; sub?: string; center?: boolean; style?: React.CSSProperties }) {
  return (
    <div className="rv" style={{ textAlign: center ? "center" : "left", ...style }}>
      {eyebrow && <div className="eyebrow"><i /> {eyebrow}</div>}
      <h2 className="h2" style={{ marginTop: 14 }}>{children}</h2>
      {sub && <p className="lead" style={{ marginTop: 16, marginLeft: center ? "auto" : 0, marginRight: center ? "auto" : 0 }}>{sub}</p>}
    </div>
  );
}

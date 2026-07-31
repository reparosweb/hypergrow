import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";
import SiteHeader from "./SiteHeader";

/* ─────────────────────────────────────────────────────────────────────────────
   SHELL DAS PÁGINAS INSTITUCIONAIS (/servicos, /sobre, /contato)

   Server component puro — nenhum JS vai para o navegador. As páginas internas
   NÃO carregam o HypergrowSite (que é a home inteira, client), então também não
   têm o script do lucide nem o IntersectionObserver que liga `.reveal`. Por isso
   aqui: ícones em SVG inline e estado base VISÍVEL (a entrada é animação de
   tempo, que sempre completa — `.reveal` sem observer ficaria opacity:0 para
   sempre, bug já cometido antes neste projeto).

   Regras de layout que custaram bug real e estão respeitadas abaixo:
   · nenhuma largura fixa em px sem min(Xpx, 100%)
   · grids sempre repeat(auto-fit, minmax(min(100%, X), 1fr))
   · nenhum filter:blur()/backdrop-filter em elemento grande fixo (trava scroll no mobile)
   ──────────────────────────────────────────────────────────────────────────── */

export type Crumb = { label: string; href?: string };

export function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Check() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, marginTop: 3 }}>
      <path d="M20 6 9 17l-5-5" stroke="var(--acc)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PageShell({
  crumbs,
  accent = "#2DD4A0",
  rail = "#0FA968",
  glow = "rgba(45,212,160,0.30)",
  children,
}: {
  crumbs: Crumb[];
  accent?: string;
  rail?: string;
  glow?: string;
  children: ReactNode;
}) {
  const cssVars = { "--acc": accent, "--rail": rail, "--glow": glow } as unknown as CSSProperties;
  return (
    <main id="main" className="pg" style={{ minHeight: "100vh", position: "relative", ...cssVars }}>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          background: `radial-gradient(65% 45% at 12% -8%, ${glow}, transparent 62%), radial-gradient(60% 40% at 95% 4%, rgba(196,118,60,0.11), transparent 60%), #0D1013`,
        }}
      />
      <div className="pg-rail" aria-hidden />

      {/* Header ÚNICO do site (antes cada rota tinha o seu, e três delas ficavam
          sem menu nenhum no celular — só o logo). */}
      <SiteHeader />

      <nav className="wrap pg-crumbs" aria-label="Você está aqui">
        {crumbs.map((c, i) => (
          <span key={c.label} style={{ display: "contents" }}>
            {i > 0 && <span aria-hidden>/</span>}
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span className="pg-crumb-now">{c.label}</span>}
          </span>
        ))}
      </nav>

      {children}

      <footer className="pg-footer">
        <div className="wrap pg-footer-in">
          <span>© 2026 HyperGrow</span>
          <span className="pg-footer-links">
            <Link href="/servicos">Serviços</Link>
            <Link href="/sobre">Sobre</Link>
            <Link href="/contato">Contato</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/termos">Termos</Link>
          </span>
        </div>
      </footer>

      <style>{`
        .pg { --maxw-txt: 74ch; }
        .pg-rail { height: 3px; background: linear-gradient(90deg, var(--rail), transparent 72%); opacity: 0.95; }

        .pg-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-top: 22px; padding-bottom: 6px; }
        .pg-logo { font: 800 21px var(--font-display); letter-spacing: -0.04em; color: #fff; text-decoration: none; }
        .pg-top-cta { padding: 11px 18px !important; font-size: 13.5px !important; border-radius: 12px !important; }

        .pg-crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; padding-top: 26px;
          font: 500 12.5px var(--font-mono); letter-spacing: 0.02em; color: rgba(232,226,217,0.62); }
        .pg-crumbs a { color: rgba(232,226,217,0.62); text-decoration: none; transition: color .2s; }
        .pg-crumbs a:hover { color: var(--acc); }
        .pg-crumb-now { color: var(--acc); }

        /* ── tipografia de página ── */
        .pg-kicker { display: inline-block; font: 600 11px var(--font-mono); letter-spacing: 0.16em; text-transform: uppercase; color: var(--acc); margin-bottom: 14px; }
        .pg-h1 { font: 800 clamp(34px, 5.4vw, 60px)/1.03 var(--font-display); letter-spacing: -0.042em; color: #fff; margin: 0; text-wrap: balance; }
        .pg-lede { font: 400 clamp(16px, 1.6vw, 19px)/1.62 var(--font-sans); color: rgba(232,226,217,0.68); margin: 22px 0 0; max-width: min(66ch, 100%); text-wrap: pretty; }
        .pg-h2 { font: 700 clamp(23px, 2.7vw, 32px)/1.14 var(--font-display); letter-spacing: -0.03em; color: #fff; margin: 0 0 14px; text-wrap: balance; }
        .pg-h3 { font: 700 17px var(--font-display); letter-spacing: -0.02em; color: #fff; margin: 0 0 7px; }
        .pg-p { font: 400 15.5px/1.72 var(--font-sans); color: rgba(232,226,217,0.66); margin: 0 0 16px; max-width: min(72ch, 100%); text-wrap: pretty; }
        .pg-p:last-child { margin-bottom: 0; }
        .pg-p strong { color: rgba(232,226,217,0.92); font-weight: 600; }

        /* entrada por TEMPO (não depende de observer — sempre completa) */
        .pg-in { animation: pg-rise .7s var(--ease-silk, cubic-bezier(.16,1,.3,1)) both; }
        @keyframes pg-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .pg-in { animation: none; } }

        /* ── TABELA (AEO) ──────────────────────────────────────────────────
           É o formato que motor de busca e IA citam com mais frequência, e o
           site não tinha nenhuma. Rola sozinha no celular sem empurrar a página. */
        .pg-tablewrap { overflow-x: auto; border: 1px solid rgba(232,226,217,0.10); border-radius: 14px; background: rgba(23,27,32,0.55); }
        .pg-table { width: 100%; border-collapse: collapse; min-width: 560px; }
        .pg-table caption { text-align: left; padding: 16px 18px 0; font: 500 13px var(--font-sans); color: rgba(232,226,217,0.5); caption-side: top; }
        .pg-table th, .pg-table td { text-align: left; padding: 13px 18px; font: 400 14px/1.5 var(--font-sans); color: rgba(232,226,217,0.72); border-bottom: 1px solid rgba(232,226,217,0.07); vertical-align: top; }
        .pg-table thead th { font: 600 11.5px var(--font-mono); letter-spacing: 0.09em; text-transform: uppercase; color: rgba(232,226,217,0.5); background: rgba(232,226,217,0.03); }
        .pg-table tbody tr:last-child td { border-bottom: none; }
        .pg-table tbody th { font: 600 14px var(--font-sans); color: #fff; }
        .pg-table tbody tr:hover td, .pg-table tbody tr:hover th { background: rgba(232,226,217,0.02); }

        /* ── listas ── */
        .pg-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 11px; }
        .pg-list li { display: flex; gap: 11px; align-items: flex-start; font: 400 15px/1.6 var(--font-sans); color: rgba(232,226,217,0.7); }

        /* ── cards ── */
        .pg-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 16px; }
        .pg-card { display: block; border-radius: 18px; padding: 22px; text-decoration: none; color: inherit;
          background: linear-gradient(168deg, rgba(232,226,217,0.045), rgba(232,226,217,0.015)); border: 1px solid rgba(232,226,217,0.09); }
        .pg-card-go { display: inline-flex; align-items: center; gap: 7px; margin-top: 14px; font: 600 13px var(--font-sans); color: var(--acc); }
        a.pg-card:hover { border-color: rgba(232,226,217,0.2); }
        a.pg-card:hover .pg-card-go { gap: 11px; }

        .pg-footer { border-top: 1px solid rgba(232,226,217,0.08); margin-top: 40px; }
        .pg-footer-in { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
          padding: 22px 0 34px; font: 400 13px var(--font-sans); color: rgba(232,226,217,0.62); }
        .pg-footer-links { display: flex; flex-wrap: wrap; gap: 18px; }
        .pg-footer-links a { color: inherit; text-decoration: none; transition: color .2s; }
        .pg-footer-links a:hover { color: var(--acc); }

        @media (max-width: 560px) {
          .pg-top-cta { display: none !important; }
          .pg-footer-in { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </main>
  );
}

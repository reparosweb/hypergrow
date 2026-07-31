"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────────────────────
   HEADER ÚNICO DO SITE

   POR QUE ESTE ARQUIVO EXISTE — auditoria de UX, medida no ar:
   o site tinha QUATRO topos diferentes e três deles SEM MENU NENHUM:

     home ............... header fixo, 7 links, CTA e hambúrguer
     /servicos /sobre /contato .. logo + CTA (que sumia abaixo de 560px) + trilha
     /servicos/[slug] ... logo + CTA + trilha
     /blog .............. logo + CTA

   No celular, quem entrava por uma página interna ficava só com o LOGO — sem
   menu, sem botão, sem saída. E o menu da home apontava para âncoras (#servicos,
   #sobre, #contato) em vez das páginas reais, que existiam e eram invisíveis.

   Era isso, mais do que qualquer outra coisa, que fazia o site "mudar de
   identidade" a cada clique — a sensação que o dono descreveu como "não parece
   um software bom".

   DECISÕES:
   · O CTA NUNCA some no celular. Ele encolhe para "Orçamento", não desaparece.
   · O hambúrguer é SVG inline, não `<i data-lucide>`: o lucide troca o elemento
     por um <svg> fora do controle do React, e por isso o ícone não virava "X"
     ao abrir o menu (bug medido no ar).
   · Alvos de toque com 44px de altura mínima no celular.
   · Nada aqui depende de variável de ambiente nem tem aspas/`>` dentro de
     <style> — as duas coisas que já quebraram a hidratação deste site.
   ──────────────────────────────────────────────────────────────────────────── */

type Props = {
  /** `home` mantém as âncoras locais; qualquer outra página aponta para /#ancora. */
  variant?: "home" | "inner";
};

const CSS = `
  .sh { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; transition: background .35s ease, border-color .35s ease; border-bottom: 1px solid transparent; }
  .sh.solid { background: rgba(13,16,19,0.88); border-bottom-color: rgba(232,226,217,0.09); }
  .sh-in { display: flex; align-items: center; justify-content: space-between; gap: 16px; height: 66px; }
  .sh-logo { font: 800 21px var(--font-display); letter-spacing: -0.04em; color: #fff; text-decoration: none; flex-shrink: 0; }
  .sh-nav { display: flex; align-items: center; gap: 26px; }
  .sh-nav a { font: 500 14px var(--font-sans); color: rgba(232,226,217,0.74); text-decoration: none; transition: color .2s; white-space: nowrap; }
  .sh-nav a:hover { color: #fff; }
  .sh-cta { padding: 11px 18px !important; font-size: 13.5px !important; border-radius: 12px !important; white-space: nowrap; }
  .sh-cta-short { display: none; }
  .sh-burger { display: none; width: 44px; height: 44px; align-items: center; justify-content: center; flex-shrink: 0;
    background: rgba(232,226,217,0.06); border: 1px solid rgba(232,226,217,0.14); border-radius: 11px; color: #fff; cursor: pointer; }
  .sh-drawer { border-top: 1px solid rgba(232,226,217,0.08); background: rgba(13,16,19,0.97); }
  .sh-drawer a { display: flex; align-items: center; min-height: 48px; padding: 2px 4px;
    font: 500 16px var(--font-sans); color: rgba(232,226,217,0.86); text-decoration: none; border-bottom: 1px solid rgba(232,226,217,0.06); }
  .sh-drawer a:last-of-type { border-bottom: none; }
  .sh-spacer { height: 66px; }

  @media (max-width: 940px) {
    .sh-nav { display: none; }
    .sh-burger { display: inline-flex; }
    .sh-cta { padding: 11px 15px !important; font-size: 13px !important; }
    .sh-cta-full { display: none; }
    .sh-cta-short { display: inline; }
  }
`;

const LINKS_HOME: [string, string][] = [
  ["Serviços", "/servicos"],
  ["Soluções IA", "#ia"],
  ["Portfólio", "#portfolio"],
  ["Processo", "#processo"],
  ["Sobre", "/sobre"],
  ["Blog", "/blog"],
  ["Contato", "/contato"],
];

const LINKS_INNER: [string, string][] = [
  ["Serviços", "/servicos"],
  ["Soluções IA", "/#ia"],
  ["Portfólio", "/#portfolio"],
  ["Processo", "/#processo"],
  ["Sobre", "/sobre"],
  ["Blog", "/blog"],
  ["Contato", "/contato"],
];

export default function SiteHeader({ variant = "inner" }: Props) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const links = variant === "home" ? LINKS_HOME : LINKS_INNER;

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu ao apertar Esc — quem abre com teclado precisa poder sair com teclado.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className={solid || open ? "sh solid" : "sh"}>
        <div className="wrap sh-in">
          <Link href="/" className="sh-logo" aria-label="HyperGrow — início">
            Hyper<span style={{ background: "linear-gradient(120deg,#2DD4A0,#0B7A4C 55%,#C4763C)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Grow</span>
          </Link>

          <nav className="sh-nav" aria-label="Navegação principal">
            {links.map(([rotulo, href]) => (
              <Link key={rotulo} href={href}>{rotulo}</Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* O CTA nunca some no celular — só encolhe. Antes ele era escondido
                por CSS e as páginas internas ficavam sem nenhuma ação visível. */}
            <Link href="/contato" className="btn btn-cta sh-cta">
              <span className="sh-cta-full">Solicitar orçamento</span>
              <span className="sh-cta-short">Orçamento</span>
            </Link>
            <button
              type="button"
              className="sh-burger"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              aria-controls="sh-drawer"
              onClick={() => setOpen((v) => !v)}
            >
              {/* SVG inline de propósito: com `<i data-lucide>` o lucide troca o nó
                  fora do React e o ícone ficava travado no hambúrguer ao abrir. */}
              {open ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              )}
            </button>
          </div>
        </div>

        {open && (
          <div className="sh-drawer" id="sh-drawer">
            <div className="wrap" style={{ paddingTop: 6, paddingBottom: 18, display: "flex", flexDirection: "column" }}>
              {links.map(([rotulo, href]) => (
                <Link key={rotulo} href={href} onClick={() => setOpen(false)}>{rotulo}</Link>
              ))}
            </div>
          </div>
        )}
      </header>
      {/* Empurra o conteúdo para baixo do header fixo. */}
      <div className="sh-spacer" aria-hidden />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

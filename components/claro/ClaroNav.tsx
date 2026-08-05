"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, ChevronDown, Menu, Palette, ShoppingCart, TrendingUp, X, type LucideIcon } from "lucide-react";
import { PILLARS, type PillarKey, type ServiceCardData } from "@/lib/pillars";
import { ClaroLogo } from "./ClaroUI";
import { ClaroServiceIcon } from "./ClaroServiceIcon";
import { CLARO_PILLAR_ACCENT } from "./claroPillarAccent";

/* ─────────────────────────────────────────────────────────────────────────────
   NAV da rota /claro — header fixo com progresso de leitura, mega-menu em
   cascata por pilar (hover/foco/clique) e drawer mobile com acordeão.

   Ícone de PILAR: `ClaroServiceIcon` só resolve os 22 ícones de SERVIÇO — os
   4 ícones de pilar ("shopping-cart", "trending-up", "palette", "bot") não
   estão nesse mapa. Em vez de recorrer a um lookup dinâmico por string aqui
   também, os 4 ficam num Record fechado (chave = PillarKey, só 4 valores
   possíveis) com import nomeado direto do lucide — mesmo espírito da regra
   "nunca Icons[nome]", só que fixado a um conjunto fechado de 4 em vez de 22.
   ──────────────────────────────────────────────────────────────────────────── */

const PILLAR_ICON: Record<PillarKey, LucideIcon> = {
  vender: ShoppingCart,
  atrair: TrendingUp,
  marca: Palette,
  ia: Bot,
};

/** Links diretos (fora do mega-menu). O primeiro ("Início") é renderizado
 *  separado no desktop (antes do gatilho "Soluções"); no drawer mobile a
 *  lista inteira entra depois dos acordeões, como pedido. */
const DIRECT_LINKS: [string, string][] = [
  ["Início", "#top"],
  ["Portfólio", "#portfolio"],
  ["Resultados", "#resultados"],
  ["Diagnóstico", "#diagnostico"],
  ["Clientes", "#depoimentos"],
  ["Dúvidas", "#faq"],
];

/* `services` chega do server (app/claro/page.tsx), já enxuto — 4 campos
   (slug/icon/title/desc) em vez do array completo com body/faq/outcomes
   (~63.000 bytes de texto que a home escura já mediu e evitou pelo mesmo
   motivo — não regredir essa otimização aqui). */
export default function ClaroNav({ services }: { services: ServiceCardData[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePillar, setActivePillar] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openAcc, setOpenAcc] = useState<PillarKey | null>(null);
  const niRef = useRef<HTMLDivElement>(null);

  // Header sólido + barra de progresso de leitura.
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      setScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Esc fecha o que estiver aberto — quem abre por teclado precisa sair por teclado.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Clique fora do mega-menu fecha (cobre o caso de ter sido aberto por clique/toque).
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (niRef.current && !niRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen]);

  // Redimensionar para desktop fecha o drawer; para mobile fecha o mega-menu hover.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1180) setDrawerOpen(false);
      else setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Trava o scroll do body enquanto o drawer mobile está aberto.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const solid = scrolled || menuOpen || drawerOpen;
  const pillar = PILLARS[activePillar];
  const panServices = services.filter((s) => pillar.slugs.includes(s.slug));

  return (
    <>
      <div className="prog" style={{ width: `${progress}%` }} aria-hidden="true" />

      <header className={"hd" + (solid ? " on" : "")}>
        <div className="wrap hd-in">
          <a href="#top" aria-label="HyperGrow — início">
            <ClaroLogo height={42} light={!solid} />
          </a>

          <nav className="nl" aria-label="Navegação principal">
            <a href={DIRECT_LINKS[0][1]}>{DIRECT_LINKS[0][0]}</a>

            <div
              className="ni"
              ref={niRef}
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                type="button"
                className="nt"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                Soluções <ChevronDown size={15} className="chev" aria-hidden />
              </button>

              <div className="pop">
                <div className="casc">
                  <div className="rail">
                    {PILLARS.map((p, i) => {
                      const Icon = PILLAR_ICON[p.key];
                      return (
                        <button
                          key={p.key}
                          type="button"
                          className={"dep" + (i === activePillar ? " on" : "")}
                          onMouseEnter={() => setActivePillar(i)}
                          onFocus={() => setActivePillar(i)}
                          onClick={() => setActivePillar(i)}
                        >
                          <Icon size={17} style={{ color: CLARO_PILLAR_ACCENT[p.key], flexShrink: 0 }} aria-hidden />
                          <span className="dep-t">{p.label}</span>
                          <span className="dep-n">{p.slugs.length}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pan" key={pillar.key}>
                    <div className="pan-h">
                      <b style={{ color: CLARO_PILLAR_ACCENT[pillar.key] }}>{pillar.label}</b>
                      <span>{pillar.desc}</span>
                    </div>
                    <div className="pan-g">
                      {panServices.map((s) => (
                        <Link
                          href={`/servicos/${s.slug}`}
                          className="pl"
                          key={s.slug}
                          onClick={() => setMenuOpen(false)}
                        >
                          <span
                            className="pl-ic"
                            style={{ color: CLARO_PILLAR_ACCENT[pillar.key], background: CLARO_PILLAR_ACCENT[pillar.key] + "14", borderColor: CLARO_PILLAR_ACCENT[pillar.key] + "30" }}
                          >
                            <ClaroServiceIcon name={s.icon} size={17} />
                          </span>
                          <div>
                            <b>{s.title}</b>
                            <span>{s.desc}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {DIRECT_LINKS.slice(1).map(([label, href]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="#contato" className="btn btn-p">Falar com especialista</a>
            <button
              type="button"
              className="burger"
              aria-label={drawerOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={drawerOpen}
              aria-controls="cl-drawer"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              {drawerOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      <div className={"dw" + (drawerOpen ? " open" : "")} id="cl-drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="dw-s" onClick={() => setDrawerOpen(false)} />
        <div className="dw-p">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <ClaroLogo height={30} />
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setDrawerOpen(false)}
              style={{
                width: 40, height: 40, borderRadius: 10, border: "1px solid var(--line)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                color: "var(--ink)", background: "#fff",
              }}
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          {PILLARS.map((p) => {
            const Icon = PILLAR_ICON[p.key];
            const items = services.filter((s) => p.slugs.includes(s.slug));
            const on = openAcc === p.key;
            return (
              <div className="acc" key={p.key}>
                <button type="button" className="acc-h" aria-expanded={on} onClick={() => setOpenAcc(on ? null : p.key)}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon size={17} style={{ color: CLARO_PILLAR_ACCENT[p.key], flexShrink: 0 }} aria-hidden />
                    {p.label}
                    <span style={{ font: "600 11px var(--font-mono)", color: "var(--ink-3)" }}>{p.slugs.length}</span>
                  </span>
                  <ChevronDown size={16} aria-hidden style={{ transform: on ? "rotate(180deg)" : "none", transition: "transform .3s var(--ease)" }} />
                </button>
                <div className="acc-b" style={{ maxHeight: on ? 560 : 0 }}>
                  {items.map((s) => (
                    <Link key={s.slug} href={`/servicos/${s.slug}`} onClick={() => setDrawerOpen(false)}>{s.title}</Link>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{ display: "flex", flexDirection: "column", marginTop: 6 }}>
            {DIRECT_LINKS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setDrawerOpen(false)}
                style={{ padding: "13px 2px", font: "500 15.5px var(--font-sans)", color: "var(--ink-2)", borderBottom: "1px solid var(--line-2)" }}
              >
                {label}
              </a>
            ))}
          </div>

          <a href="#contato" className="btn btn-p" onClick={() => setDrawerOpen(false)} style={{ marginTop: 20, width: "100%" }}>
            Falar com especialista
          </a>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

/* Ajustes finos que a folha compartilhada (claro-tokens.css) não cobre —
   ambos defensivos, nenhum novo azul/violeta, nenhum `<style>{...}` (sempre
   dangerouslySetInnerHTML, o que também deixa `>` e `"` livres de risco de
   hidratação). */
const CSS = `
  /* .pl-ic é um <span> (ícone do serviço). A regra genérica ".cl .pl span"
     em claro-tokens.css é mais específica (classe+classe+tipo vs. classe+
     classe) e sobrescreveria o display:inline-flex do ícone por display:
     block, perdendo a centralização. Reforça de volta sem tocar no token. */
  .cl .pl-ic { display: inline-flex !important; }
  /* :hover já abre o mega-menu (regra do tokens); :focus-within cobre quem
     navega só de teclado até o gatilho "Soluções". */
  .cl .ni:focus-within .pop { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
`;

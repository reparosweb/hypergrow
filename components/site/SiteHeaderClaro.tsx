"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Bot, ChevronDown, LayoutTemplate, Palette, ShoppingCart, TrendingUp, type LucideIcon } from "lucide-react";
import { ClaroLogo } from "@/components/claro/ClaroUI";
import { CLARO_PILLAR_ACCENT } from "@/components/claro/claroPillarAccent";
import { PILLARS, type PillarKey } from "@/lib/pillars";
import { siteServices } from "@/lib/site-services";
import ServiceGlyph from "./ServiceGlyphs";

/* 2026-08-16: dropdown "Soluções" adicionado — pedido direto do dono vendo
   /servicos/stories-instagram ao lado da home ("o menu não tem a seta com
   todas as opções, precisa ser igual em toda página"). Reusa as MESMAS
   classes de app/claro-tokens.css que o mega-menu da home já usa
   (.pop/.casc/.rail/.dep/.pan/.pl…) — são globais, não presas a ClaroNav —
   então o visual sai idêntico sem duplicar CSS nenhum. O que não foi
   reaproveitado, de propósito: o componente ClaroNav inteiro (decisão
   registrada acima permanece válida — ele carrega a barra de progresso de
   leitura e a lógica de esteira, que não fazem sentido aqui). Só a cascata
   pilar→serviços foi recriada, com dado real de siteServices/PILLARS. */
const PILLAR_ICON: Record<PillarKey, LucideIcon> = {
  site: LayoutTemplate,
  ecommerce: ShoppingCart,
  marketing: TrendingUp,
  midia: Palette,
  ia: Bot,
};

/* ─────────────────────────────────────────────────────────────────────────────
   HEADER ÚNICO DAS PÁGINAS INTERNAS — versão CLARA.

   POR QUE ESTE ARQUIVO EXISTE
   A home migrou para o tema claro (components/claro/*), mas as sete páginas
   internas continuavam com o header escuro de `SiteHeader.tsx`. O site "mudava
   de identidade" a cada clique — exatamente a reclamação que já tinha custado a
   unificação anterior, agora de volta por causa da troca de tema.

   POR QUE NÃO REUSAR `ClaroNav` DIRETO (decisão registrada, não reinvestigar):
   · os links dele são âncoras da home (#top, #portfolio, #resultados…) e não
     funcionam fora dela;
   · ele exige a prop `services: ServiceCardData[]`, que /sobre, /contato e
     /blog não têm;
   · ele carrega o mega-menu inteiro (~15 KB de JS por página) para um cabeçalho
     que aqui só precisa de links diretos.

   O QUE FOI REUSADO, para o cabeçalho ser o MESMO objeto visual da home:
   · `ClaroLogo` — o mark oficial da marca, mesmo componente da home;
   · as classes `nl` / `burger` / `dw` / `dw-s` / `dw-p` de `app/claro-tokens.css`
     (tipografia dos links, alvo de 46px do hambúrguer, gaveta lateral com
     animação e sobreposição). Assim, se o dono ajustar o padrão no token, o
     cabeçalho interno acompanha sozinho.
   · altura de 88px e logotipo de 42px — as mesmas medidas do `.hd-in` da home.

   DIFERENÇA DELIBERADA EM RELAÇÃO À HOME: aqui o cabeçalho é BRANCO SÓLIDO
   desde o topo, sem `backdrop-filter`. Dois motivos: (1) as páginas internas
   não têm hero escuro, então o estado "transparente com texto branco" da home
   deixaria os links invisíveis; (2) `backdrop-filter` em elemento grande e
   fixo trava o scroll no celular — regra que já custou bug real neste projeto.

   Regras de sobrevivência respeitadas:
   · o CTA NUNCA some no celular, só encolhe para "Orçamento";
   · hambúrguer em SVG inline (o lucide troca o nó fora do React e o ícone não
     virava "X" — bug medido no ar);
   · alvos de toque com 44px de altura mínima;
   · `<style dangerouslySetInnerHTML>` sempre — nunca `<style>{...}` — porque o
     React escapa `>` e aspas e isso quebra a hidratação (#418/#423/#425).
   ──────────────────────────────────────────────────────────────────────────── */

/* Só destinos que EXISTEM. O header escuro apontava para `/#ia`, âncora que a
   home clara não tem mais — o clique caía no topo da home sem rolar para lugar
   nenhum. Conferido contra os `id` reais de components/claro/*.
   "Serviços" saiu daqui: virou o gatilho do dropdown "Soluções" abaixo. */
const LINKS: [string, string][] = [
  ["Portfólio", "/#portfolio"],
  ["Processo", "/#processo"],
  ["Resultados", "/#resultados"],
  ["Sobre", "/sobre"],
  ["Blog", "/blog"],
  ["Contato", "/contato"],
];

const CSS = `
  .cl .shc { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: #fff;
    border-bottom: 1px solid var(--line); transition: box-shadow .35s var(--ease); }
  .cl .shc.lift { box-shadow: 0 10px 30px -26px rgba(11,18,32,.5); }
  .cl .shc-in { display: flex; align-items: center; justify-content: space-between; gap: 18px; height: 88px; }
  .cl .shc-logo { display: inline-flex; align-items: center; min-height: 44px; flex-shrink: 0; }
  .cl .shc-spacer { height: 88px; }

  .cl .shc-cta { padding: 12px 20px !important; font-size: 14.5px !important; white-space: nowrap; }
  .cl .shc-cta-short { display: none; }

  .cl .shc-dw-links { display: flex; flex-direction: column; margin-top: 2px; }
  .cl .shc-dw-links a { display: flex; align-items: center; min-height: 52px; padding: 0 2px;
    font: 600 16px var(--text); color: var(--ink); border-bottom: 1px solid var(--line-2); }
  .cl .shc-dw-links a:last-of-type { border-bottom: none; }
  .cl .shc-dw-links a:hover { color: var(--brand); }
  .cl .shc-dw-close { width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--line);
    display: inline-flex; align-items: center; justify-content: center; color: var(--ink); background: #fff; }

  @media (max-width: 1180px) {
    .cl .shc-cta { padding: 12px 16px !important; font-size: 13.5px !important; }
    .cl .shc-cta-full { display: none; }
    .cl .shc-cta-short { display: inline; }
  }

  /* Gatilho "Soluções" — mesma classe .nt/.chev do trigger da home (estilo já
     em claro-tokens.css); .ni só precisa existir como o container relativo
     que ancora o .pop (âncora real é o cabeçalho, ver claro-tokens.css). */
  .cl .shc-ni { position: relative; }

  /* 2026-08-16, correção: as regras ABAIXO existiam em claro-tokens.css só na
     estrutura (tamanho, borda, fonte) — a COR (var(--dc)/var(--pa)) morava
     dentro do <style> do próprio ClaroNav.tsx, que este arquivo não importa.
     Resultado: o dropdown novo saía preto-e-branco (bronca real do dono).
     Copiado 1:1 do bloco "MEGA-MENU" de ClaroNav.tsx — mesmas 4 cores do
     mapa CLARO_PILLAR_ACCENT, nada novo. */
  .cl .rail .dep-ic { flex-shrink: 0; color: var(--ink-3); transition: color .2s var(--ease); }
  .cl .rail .dep:hover .dep-ic { color: var(--dc); }
  .cl .rail .dep.on { background: var(--dc-soft); border-color: var(--dc-line); }
  .cl .rail .dep.on .dep-ic, .cl .rail .dep.on .dep-n { color: var(--dc); }
  .cl .pop .pan-h b { color: var(--pa); }
  .cl .pop .pl-ic { color: var(--pa); background: var(--pa-soft); border-color: var(--pa-line);
    transition: background .22s var(--ease), border-color .22s var(--ease), color .22s var(--ease), box-shadow .22s var(--ease); }
  .cl .pop .pl:hover .pl-ic, .cl .pop .pl:focus-visible .pl-ic { background: var(--pa); border-color: var(--pa); color: #fff;
    box-shadow: 0 8px 18px -10px var(--pa); }
  .cl .pop .pl:hover, .cl .pop .pl:focus-visible { background: var(--paper-2); transform: translateX(3px);
    box-shadow: inset 0 0 0 1px var(--pa-line); }
  .cl .pop .pl:hover .pl-t, .cl .pop .pl:focus-visible .pl-t { color: var(--pa); }
  .cl .shc-dw-sol { display: flex; align-items: center; justify-content: space-between; width: 100%;
    min-height: 52px; padding: 0 2px; font: 600 16px var(--text); color: var(--ink);
    border-bottom: 1px solid var(--line-2); background: none; border-left: none; border-right: none; border-top: none; text-align: left; }
  .cl .shc-dw-sol-body { display: none; flex-direction: column; gap: 2px; padding: 6px 0 14px; }
  .cl .shc-dw-sol-body.open { display: flex; }
  .cl .shc-dw-sol-item { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 8px;
    border-radius: 10px; font: 500 14.5px var(--text); color: var(--ink-2); }
  .cl .shc-dw-sol-item:hover { background: var(--paper-2); color: var(--ink); }
`;

export default function SiteHeaderClaro() {
  const [lift, setLift] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePillar, setActivePillar] = useState(0);
  const [dwSolOpen, setDwSolOpen] = useState(false);
  const niRef = useRef<HTMLDivElement>(null);
  const shutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = useCallback(() => {
    if (shutTimer.current) clearTimeout(shutTimer.current);
    setMenuOpen(true);
  }, []);
  const closeMenu = useCallback((delay = 0) => {
    if (shutTimer.current) clearTimeout(shutTimer.current);
    if (delay > 0) shutTimer.current = setTimeout(() => setMenuOpen(false), delay);
    else setMenuOpen(false);
  }, []);
  useEffect(() => () => {
    if (shutTimer.current) clearTimeout(shutTimer.current);
  }, []);

  // Clique fora do dropdown fecha (cobre o caso de ter sido aberto por toque).
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (niRef.current && !niRef.current.contains(e.target as Node)) closeMenu();
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen, closeMenu]);

  const pillar = PILLARS[activePillar] ?? PILLARS[0];
  const panServices = siteServices.filter((s) => pillar.slugs.includes(s.slug));
  const pillarAccent = CLARO_PILLAR_ACCENT[pillar.key];

  useEffect(() => {
    const onScroll = () => setLift(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Esc fecha a gaveta e o dropdown — quem abre pelo teclado precisa poder sair pelo teclado.
  useEffect(() => {
    if (!open && !menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        closeMenu();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, menuOpen, closeMenu]);

  // Voltar para desktop com a gaveta aberta deixava um painel preso na tela.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1180) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Trava a rolagem do corpo enquanto a gaveta está aberta (mesmo comportamento da home).
  useEffect(() => {
    if (!open) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [open]);

  return (
    <>
      <header className={lift ? "shc lift" : "shc"}>
        <div className="wrap shc-in">
          <Link href="/" className="shc-logo" aria-label="HyperGrow — início">
            <ClaroLogo height={42} />
          </Link>

          <nav className="nl" aria-label="Navegação principal">
            <div
              className="ni shc-ni"
              ref={niRef}
              onMouseEnter={openMenu}
              onMouseLeave={() => closeMenu(150)}
            >
              <button
                type="button"
                className="nt"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-controls="shc-mm"
                onClick={() => (menuOpen ? closeMenu() : openMenu())}
              >
                Soluções <ChevronDown size={15} className="chev" aria-hidden />
              </button>

              <div className={"pop" + (menuOpen ? " open" : "")} id="shc-mm">
                <div className="casc">
                  <div className="rail">
                    {PILLARS.map((p, i) => {
                      const Icon = PILLAR_ICON[p.key];
                      const accent = CLARO_PILLAR_ACCENT[p.key];
                      const on = i === activePillar;
                      const depVars = {
                        "--dc": accent,
                        "--dc-soft": accent + "12",
                        "--dc-line": accent + "30",
                      } as CSSProperties;
                      return (
                        <button
                          key={p.key}
                          type="button"
                          className={"dep" + (on ? " on" : "")}
                          aria-controls="shc-mm-pan"
                          onMouseEnter={() => setActivePillar(i)}
                          onFocus={() => setActivePillar(i)}
                          onClick={() => setActivePillar(i)}
                          style={depVars}
                        >
                          <Icon size={17} className="dep-ic" aria-hidden />
                          <span className="dep-t">{p.label}</span>
                          <span className="dep-n">{p.slugs.length}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pan" id="shc-mm-pan" key={pillar.key} style={{ "--pa": pillarAccent, "--pa-soft": pillarAccent + "12", "--pa-line": pillarAccent + "30" } as CSSProperties}>
                    <div className="pan-h">
                      <b>{pillar.label}</b>
                      <span>{pillar.desc}</span>
                    </div>
                    <div className="pan-g">
                      {panServices.map((s, i) => (
                        <Link
                          href={`/servicos/${s.slug}`}
                          className="pl"
                          key={s.slug}
                          style={{ "--i": String(i) } as CSSProperties}
                          onClick={() => closeMenu()}
                        >
                          <span className="pl-ic">
                            <ServiceGlyph slug={s.slug} height={17} />
                          </span>
                          <div className="pl-tx">
                            <b className="pl-t">{s.title}</b>
                            <span className="pl-d">{s.desc}</span>
                          </div>
                          <ArrowRight size={15} className="pl-go" aria-hidden />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {LINKS.map(([rotulo, href]) => (
              <Link key={rotulo} href={href}>
                {rotulo}
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Nunca escondido no celular: só troca o rótulo. */}
            <Link href="/contato" className="btn btn-p shc-cta">
              <span className="shc-cta-full">Solicitar orçamento</span>
              <span className="shc-cta-short">Orçamento</span>
            </Link>
            <button
              type="button"
              className="burger"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              aria-controls="shc-drawer"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Gaveta lateral — mesmas classes (.dw/.dw-s/.dw-p) da gaveta da home. */}
      <div
        className={open ? "dw open" : "dw"}
        id="shc-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="dw-s" onClick={() => setOpen(false)} />
        <div className="dw-p">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <ClaroLogo height={30} />
            <button type="button" className="shc-dw-close" aria-label="Fechar menu" onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="shc-dw-links" aria-label="Navegação principal (celular)">
            <button
              type="button"
              className="shc-dw-sol"
              aria-expanded={dwSolOpen}
              aria-controls="shc-dw-sol-body"
              onClick={() => setDwSolOpen((v) => !v)}
            >
              Soluções
              <ChevronDown size={16} aria-hidden style={{ transform: dwSolOpen ? "rotate(180deg)" : "none", transition: "transform .3s var(--ease)" }} />
            </button>
            <div className={"shc-dw-sol-body" + (dwSolOpen ? " open" : "")} id="shc-dw-sol-body">
              {PILLARS.map((p) => (
                <Link key={p.key} href={`/servicos#${p.key}`} className="shc-dw-sol-item" onClick={() => setOpen(false)}>
                  {p.label}
                </Link>
              ))}
              <Link href="/servicos" className="shc-dw-sol-item" onClick={() => setOpen(false)} style={{ color: "var(--acc)", fontWeight: 600 }}>
                Ver catálogo completo →
              </Link>
            </div>

            {LINKS.map(([rotulo, href]) => (
              <Link key={rotulo} href={href} onClick={() => setOpen(false)}>
                {rotulo}
              </Link>
            ))}
          </nav>

          <Link
            href="/contato"
            className="btn btn-p"
            onClick={() => setOpen(false)}
            style={{ marginTop: 20, width: "100%" }}
          >
            Solicitar orçamento
          </Link>
        </div>
      </div>

      {/* Empurra o conteúdo para baixo do cabeçalho fixo. */}
      <div className="shc-spacer" aria-hidden />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

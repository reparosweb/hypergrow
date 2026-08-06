"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClaroLogo } from "@/components/claro/ClaroUI";

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
   nenhum. Conferido contra os `id` reais de components/claro/*. */
const LINKS: [string, string][] = [
  ["Serviços", "/servicos"],
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
`;

export default function SiteHeaderClaro() {
  const [lift, setLift] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setLift(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Esc fecha a gaveta — quem abre pelo teclado precisa poder sair pelo teclado.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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

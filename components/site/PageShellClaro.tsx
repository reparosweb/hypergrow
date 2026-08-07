import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";
import { PILLARS } from "@/lib/pillars";
import SiteHeaderClaro from "./SiteHeaderClaro";

/* ─────────────────────────────────────────────────────────────────────────────
   SHELL CLARO DAS PÁGINAS INTERNAS
   (/servicos, /servicos/[slug], /sobre, /contato, /blog, /blog/[slug],
    /para/clinicas, /privacidade, /termos)

   Substitui `PageShell.tsx` (tema escuro) sem apagá-lo: a home migrou para o
   tema claro e as páginas internas tinham ficado para trás — o site trocava de
   identidade a cada clique.

   SERVER COMPONENT puro: nenhum hook, nenhum "use client". O único JS que
   chega ao navegador é o do cabeçalho (gaveta do celular). Por isso, aqui:
   · ícones em SVG inline — estas rotas não carregam o script do lucide;
   · nenhuma classe `.rv` (a home clara liga essa classe por
     IntersectionObserver dentro de `ClaroSite`; aqui ela ficaria em
     `opacity: 0` para sempre — bug já cometido neste projeto);
   · entrada por TEMPO (`.pg-in`), que sempre completa, e revelação de rolagem
     por `animation-timeline: view()`, cujo estado base é VISÍVEL.

   TOKENS: `app/claro-tokens.css` (importado por cada rota). Tudo aqui é
   escopado em `.cl` — a mesma classe que a home usa — o que também aciona
   `html:has(.cl){color-scheme:light}` de `app/globals.css` e conserta barra de
   rolagem, `<select>` e autopreenchimento dentro do tema claro.

   PALETA: azul #1550E8 · violeta #3B2FCC/#5B3CFF · rosa #E0165F.
   Nada de jade/cobre (#0FA968, #0B7A4C, #C4763C, #D99461) — eram as cores do
   tema escuro e não passam contraste sobre papel claro.

   Regras de layout que já custaram bug real e continuam valendo:
   · nenhuma largura fixa em px sem min(Xpx, 100%)
   · grids sempre repeat(auto-fit, minmax(min(100%, X), 1fr))
   · nenhum filter:blur()/backdrop-filter em elemento grande fixo
   · `<style>` sempre por dangerouslySetInnerHTML (o React escapa `>` e aspas
     e isso descarta o HTML do servidor na hidratação)
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

/* Rodapé com o MESMO desenho do rodapé da home (faixa escura `--ink`, quatro
   colunas, rótulos em mono), mas com links que funcionam de QUALQUER página.
   `ClaroFooter` não pôde ser reusado porque os oito links dele são âncoras
   (#sobre, #resultados, #portfolio…): fora da home, o clique não vai a lugar
   nenhum e ainda suja a URL. Aqui cada destino é caminho absoluto ou `/#ancora`. */
/* Os departamentos saem de PILLARS (lib/pillars.ts) em vez de digitados aqui:
   quando eles passaram de 4 para 5 em 2026-08-07, esta lista teria ficado
   desatualizada em silêncio — rótulo velho e âncora apontando para um id que
   não existe mais. Derivar da fonte única evita o rodapé mentir. */
const RODAPE: [string, [string, string][]][] = [
  ["Serviços", [
    ["Catálogo completo", "/servicos"],
    ...PILLARS.map((p) => [p.label, `/servicos#${p.key}`] as [string, string]),
  ]],
  ["Empresa", [
    ["Sobre a HyperGrow", "/sobre"],
    ["Portfólio", "/#portfolio"],
    ["Processo", "/#processo"],
    ["Resultados", "/#resultados"],
    ["Para clínicas", "/para/clinicas"],
  ]],
  ["Conteúdo & contato", [
    ["Blog", "/blog"],
    ["Falar com a HyperGrow", "/contato"],
    ["Privacidade", "/privacidade"],
    ["Termos de uso", "/termos"],
  ]],
];

export default function PageShellClaro({
  crumbs,
  accent = "#1550E8",
  children,
}: {
  crumbs: Crumb[];
  /** Cor da frente/pilar no tema claro. Ver components/claro/claroPillarAccent.ts. */
  accent?: string;
  children: ReactNode;
}) {
  /* Uma cor só entra como prop; as derivadas saem daqui, então nenhuma página
     precisa repetir opacidade em hex espalhada pelo JSX. */
  const cssVars = {
    "--acc": accent,
    "--acc-soft": `${accent}12`,
    "--acc-line": `${accent}38`,
    "--acc-glow": `${accent}1f`,
  } as unknown as CSSProperties;

  return (
    <div className="cl pgc" style={cssVars}>
      <div className="pgc-progress" aria-hidden />
      <SiteHeaderClaro />

      <main id="main">
        <div className="pgc-tint" aria-hidden />

        <nav className="wrap pgc-crumbs" aria-label="Você está aqui">
          {crumbs.map((c, i) => (
            <span key={c.label} style={{ display: "contents" }}>
              {i > 0 && <span aria-hidden>/</span>}
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span className="pgc-crumb-now">{c.label}</span>}
            </span>
          ))}
        </nav>

        {children}
      </main>

      <footer className="pgc-ft">
        <div className="wrap">
          <div className="pgc-ft-g">
            <div>
              <span className="pgc-ft-logo">
                Hyper<span className="pgc-ft-logo-g">Grow</span>
              </span>
              <p className="pgc-ft-p">
                Marketing, e-commerce e automação operados por gente — com método, transparência e
                responsabilidade de dono.
              </p>
            </div>
            {RODAPE.map(([titulo, itens]) => (
              <div key={titulo}>
                <div className="mono pgc-ft-h">{titulo}</div>
                <div className="pgc-ft-c">
                  {itens.map(([rotulo, destino]) => (
                    <Link key={rotulo} href={destino}>
                      <span>{rotulo}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pgc-ft-b">
            <span className="small">© 2026 HyperGrow. Todos os direitos reservados.</span>
            <Link href="/" className="pgc-ft-home">
              Voltar ao início
            </Link>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </div>
  );
}

/* `#5A6579` é o cinza de texto pequeno: `--ink-3` (#6B7688) mede 4,49:1 sobre o
   papel (#FBFBFD) e reprova por um fio no piso de 4,5:1 da WCAG. Este mede
   5,74:1 e é o mesmo tom que o token já usa em `.mq-i`. Texto corrido usa
   `--ink-2` (8,70:1) e título usa `--ink` (17,4:1). */
const CSS = `
  /* --beam: a cor da borda de luz viajante (.lit, definida em
     app/claro-tokens.css). Publicar aqui, no shell, e o que UNIFICA o efeito:
     antes so a home usava .lit e as paginas internas nao tinham borda animada
     nenhuma ("nenhuma borda animada", bronca do dono). Agora qualquer elemento
     .lit dentro de uma pagina interna acende na cor do pilar daquela pagina,
     sem precisar repetir style inline em cada card. Quem quiser outra cor
     (o blog usa a cor da categoria) declara --beam no proprio elemento. */
  .cl.pgc { --maxw-txt: 74ch; --beam: var(--acc); position: relative; min-height: 100vh;
    display: flex; flex-direction: column; }
  /* Re-resolve --beam NO PROPRIO elemento .lit: assim um card que declara o
     seu --acc (ex.: os cards por pilar em /servicos) acende na cor dele, e nao
     na cor herdada do shell. Style inline continua ganhando de tudo isso. */
  .cl.pgc .lit { --beam: var(--acc); }
  .cl.pgc > main { flex: 1; position: relative; }
  /* SEM overflow-x:hidden/clip aqui de proposito: isso ESCONDE o vazamento
     horizontal em vez de corrigir, e ainda faz a medicao
     (scrollWidth === clientWidth) passar sempre, mascarando o defeito. As
     larguras foram medidas de verdade (320 a 1440) e o que vazava foi
     corrigido na origem. */

  /* Tinta de marca no topo: gradiente puro, nunca filter/backdrop-filter. */
  .cl .pgc-tint { position: absolute; inset: 0 0 auto; height: min(560px, 62vh); pointer-events: none; z-index: 0;
    background: radial-gradient(70% 100% at 8% 0%, var(--acc-glow), transparent 66%),
                radial-gradient(56% 80% at 96% 4%, rgba(224,22,95,0.07), transparent 62%); }
  .cl.pgc > main > *:not(.pgc-tint) { position: relative; z-index: 1; }

  /* Barra de progresso de leitura — CSS puro, zero JS. Fora do @supports a div
     fica sem estilo nenhum (0x0, invisível) e degrada em silêncio. */
  @supports (animation-timeline: scroll()) {
    .cl .pgc-progress { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 1001; transform-origin: 0 50%;
      background: linear-gradient(90deg, var(--brand), #5B3CFF, var(--cta)); transform: scaleX(0);
      animation: pgc-fill linear both; animation-timeline: scroll(root); }
  }
  @keyframes pgc-fill { to { transform: scaleX(1); } }
  @media (prefers-reduced-motion: reduce) { .cl .pgc-progress { animation: none; opacity: 0; } }

  /* ── trilha ──
     Os links mediam 16px de altura — metade do alvo mínimo de toque (44px,
     WCAG 2.5.8) e a trilha é justamente o que mais se usa com o polegar para
     voltar. Viraram inline-flex de 44px e o padding do bloco caiu de 26 para
     10px, então o respiro na tela continua praticamente o mesmo: só a área
     clicável cresceu. */
  .cl .pgc-crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; padding-top: 10px;
    font: 500 12.5px var(--code); letter-spacing: .02em; color: #5A6579; }
  .cl .pgc-crumbs a, .cl .pgc-crumb-now { display: inline-flex; align-items: center; min-height: 44px; }
  .cl .pgc-crumbs a { color: #5A6579; text-decoration: none; transition: color .2s; }
  .cl .pgc-crumbs a:hover { color: var(--acc); }
  .cl .pgc-crumb-now { color: var(--acc); }

  /* ── tipografia de página ── */
  .cl .pg-kicker { display: inline-block; font: 600 11px var(--code); letter-spacing: .16em; text-transform: uppercase;
    color: var(--acc); margin-bottom: 14px; }
  .cl .pg-h1 { font: 700 clamp(34px, 5.4vw, 60px)/1.04 var(--disp); letter-spacing: -.038em; color: var(--ink);
    margin: 0; text-wrap: balance; }
  .cl .pg-lede { font: 400 clamp(16px, 1.6vw, 19px)/1.62 var(--text); color: var(--ink-2); margin: 22px 0 0;
    max-width: min(66ch, 100%); text-wrap: pretty; }
  .cl .pg-h2 { font: 700 clamp(23px, 2.7vw, 34px)/1.14 var(--disp); letter-spacing: -.03em; color: var(--ink);
    margin: 0 0 14px; text-wrap: balance; }
  .cl .pg-h3 { font: 600 17.5px/1.3 var(--disp); letter-spacing: -.02em; color: var(--ink); margin: 0 0 7px; }
  .cl .pg-p { font: 400 16px/1.72 var(--text); color: var(--ink-2); margin: 0 0 16px; max-width: min(72ch, 100%);
    text-wrap: pretty; }
  .cl .pg-p:last-child { margin-bottom: 0; }
  .cl .pg-p strong { color: var(--ink); font-weight: 600; }
  .cl .pg-small { font: 400 14px/1.6 var(--text); color: #5A6579; }

  /* filete: substitui o .hairline do tema escuro sem exigir troca de markup */
  .cl .hairline, .cl .pg-hr { border: 0; height: 1px; background: var(--line); margin: 0; }

  /* entrada por TEMPO (não depende de observer — sempre completa) */
  .cl .pg-in { animation: pg-rise .7s var(--ease) both; }
  @keyframes pg-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .cl .pg-in { animation: none; } }

  /* ── TABELA (formato que motor de busca e IA mais citam) ── */
  .cl .pg-tablewrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border: 1px solid var(--line);
    border-radius: 14px; background: var(--card); box-shadow: var(--sh-1); }
  .cl .pg-table { width: 100%; border-collapse: collapse; min-width: 560px; }
  .cl .pg-table caption { text-align: left; padding: 16px 18px 2px; font: 400 13px/1.5 var(--text);
    color: #5A6579; caption-side: top; max-width: min(660px, 84vw); }
  .cl .pg-table th, .cl .pg-table td { text-align: left; padding: 13px 18px; font: 400 14.5px/1.55 var(--text);
    color: var(--ink-2); border-bottom: 1px solid var(--line-2); vertical-align: top; }
  .cl .pg-table thead th { font: 600 11.5px var(--code); letter-spacing: .09em; text-transform: uppercase;
    color: #5A6579; background: var(--paper-2); border-bottom: 1px solid var(--line); white-space: nowrap; }
  .cl .pg-table tbody tr:last-child td, .cl .pg-table tbody tr:last-child th { border-bottom: none; }
  .cl .pg-table tbody th { font: 600 14.5px var(--text); color: var(--ink); }
  .cl .pg-table tbody tr { transition: background .25s var(--ease); }
  .cl .pg-table tbody tr:hover td, .cl .pg-table tbody tr:hover th { background: var(--paper-2); }
  /* Link dentro da célula: mediam 19px de altura. Regra única aqui em vez de
     ajuste solto em cada página — cobre o "Comece por" de /servicos e o
     "No ar" de /sobre de uma vez. A margem negativa devolve o espaço que os
     44px tomariam, então a tabela cresce ~5px por linha, não 25px. */
  .cl .pg-table td a, .cl .pg-table tbody th a { display: inline-flex; align-items: center;
    min-height: 44px; margin-block: -10px; }
  .cl .pg-tablehint { display: none; align-items: center; gap: 6px; font: 500 11.5px var(--code);
    letter-spacing: .1em; text-transform: uppercase; color: #5A6579; margin: 18px 0 8px; }
  @media (max-width: 860px) { .cl .pg-tablehint { display: flex; } }

  /* ── listas ── */
  .cl .pg-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 11px; }
  .cl .pg-list li { display: flex; gap: 11px; align-items: flex-start; font: 400 15.5px/1.62 var(--text);
    color: var(--ink-2); }
  .cl .pg-num { flex-shrink: 0; min-width: 26px; padding-top: 3px; color: var(--acc);
    font: 600 13px var(--code); }

  /* ── cards ── */
  .cl .pg-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 16px; }
  .cl .pg-card { display: block; border-radius: 18px; padding: 22px; text-decoration: none; color: inherit;
    background: var(--card); border: 1px solid var(--line); box-shadow: var(--sh-1);
    transition: transform .28s var(--ease), border-color .28s var(--ease), box-shadow .28s var(--ease); }
  .cl .pg-card-t { font: 600 17.5px/1.3 var(--disp); letter-spacing: -.02em; color: var(--ink); margin: 0 0 7px;
    transition: color .25s var(--ease); }
  .cl .pg-card-d { font: 400 14px/1.6 var(--text); color: #5A6579; margin: 0; }
  .cl .pg-card-go { display: inline-flex; align-items: center; gap: 7px; margin-top: 14px; font: 600 13.5px var(--text);
    color: var(--acc); transition: gap .2s var(--ease); }
  .cl a.pg-card:hover, .cl a.pg-card:focus-visible { transform: translateY(-3px); box-shadow: var(--sh-2);
    border-color: color-mix(in srgb, var(--acc) 34%, var(--line)); }
  .cl a.pg-card:hover .pg-card-go, .cl a.pg-card:focus-visible .pg-card-go { gap: 11px; }
  .cl a.pg-card:hover .pg-card-t, .cl a.pg-card:focus-visible .pg-card-t { color: var(--acc); }
  @media (prefers-reduced-motion: reduce) {
    .cl .pg-card { transition: border-color .2s ease; }
    .cl a.pg-card:hover { transform: none; }
  }

  /* ── etiqueta ── */
  .cl .pg-tag { display: inline-flex; align-items: center; gap: 7px; border: 1px solid var(--acc-line);
    background: var(--acc-soft); color: var(--acc); border-radius: 999px; padding: 6px 12px;
    font: 600 11px var(--code); letter-spacing: .12em; text-transform: uppercase; }

  /* ── faixa fotográfica ── */
  .cl .pg-media { position: relative; overflow: hidden; border-radius: 20px; aspect-ratio: 16 / 6;
    background: var(--paper-2); border: 1px solid var(--line); box-shadow: var(--sh-1); }
  .cl .pg-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .cl .pg-media-scrim { position: absolute; inset: 0;
    background: linear-gradient(100deg, rgba(11,18,32,.88) 0%, rgba(11,18,32,.6) 46%, rgba(11,18,32,.12) 100%); }
  .cl .pg-media-cap { position: absolute; left: clamp(20px, 4vw, 44px); right: clamp(20px, 4vw, 44px);
    bottom: clamp(18px, 3vw, 34px); margin: 0; max-width: min(46ch, 100%);
    font: 600 clamp(15px, 1.7vw, 20px)/1.45 var(--disp); letter-spacing: -.015em; color: #fff; text-wrap: pretty; }

  /* ── bloco de chamada ── */
  .cl .pg-cta { position: relative; overflow: hidden; text-align: center; border-radius: 24px;
    padding: clamp(32px, 5vw, 58px) clamp(20px, 4vw, 44px);
    background: linear-gradient(180deg, #fff, var(--paper-2)); border: 1px solid var(--line);
    box-shadow: var(--sh-2); }
  .cl .pg-cta::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--acc), #5B3CFF 55%, var(--cta)); }
  .cl .pg-cta .pg-h2 { margin-bottom: 12px; }
  .cl .pg-cta .pg-p { margin: 0 auto 26px; max-width: min(52ch, 100%); }
  .cl .pg-cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  /* ── revelação por rolagem, nativa (zero JS) ──────────────────────────────
     Mesmo mecanismo já usado em .svc-rise/.plat-rise: roda só onde há suporte
     a animation-timeline, e o estado FORA do @supports é opacidade 1. Nunca
     existe o risco de ficar invisível para sempre (ao contrário de .rv/.reveal,
     que dependem de um observer que estas rotas não carregam). */
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .cl .pg-card, .cl .pg-tablewrap, .cl .pg-rise {
        animation: pg-reveal-in linear both; animation-timeline: view(); animation-range: entry 2% entry 55%; }
    }
  }
  @keyframes pg-reveal-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }

  /* ── rodapé (mesmo desenho do rodapé da home) ── */
  .cl .pgc-ft { background: var(--ink); color: #fff; padding-top: 62px; margin-top: clamp(48px, 6vw, 84px); }
  .cl .pgc-ft-g { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 34px; }
  .cl .pgc-ft-logo { font: 700 26px var(--disp); letter-spacing: -.04em; color: #fff; }
  .cl .pgc-ft-logo-g { background: linear-gradient(96deg, #6E8DFF, #9E8CFF 55%, #FF6FA3);
    -webkit-background-clip: text; background-clip: text; color: transparent; }
  .cl .pgc-ft-p { font: 400 15px/1.6 var(--text); color: rgba(255,255,255,.68); margin-top: 16px; max-width: 300px; }
  .cl .pgc-ft-h { color: rgba(255,255,255,.5); }
  .cl .pgc-ft-c { display: flex; flex-direction: column; align-items: flex-start; margin-top: 12px; }
  .cl .pgc-ft-c a { display: inline-flex; align-items: center; min-height: 44px; font: 400 15px var(--text);
    color: rgba(255,255,255,.74); transition: color .25s var(--ease), transform .25s var(--ease); }
  .cl .pgc-ft-c a span { position: relative; }
  .cl .pgc-ft-c a span::after { content: ""; position: absolute; left: 0; right: 0; bottom: -3px; height: 1px;
    background: currentColor; transform: scaleX(0); transform-origin: left; transition: transform .28s var(--ease); }
  .cl .pgc-ft-c a:hover { color: #fff; transform: translateX(3px); }
  .cl .pgc-ft-c a:hover span::after { transform: scaleX(1); }
  .cl .pgc-ft-c a:focus-visible { outline: 2px solid #fff; outline-offset: 3px; color: #fff; }
  .cl .pgc-ft-b { border-top: 1px solid rgba(255,255,255,.14); margin-top: 44px; display: flex;
    justify-content: space-between; gap: 14px; flex-wrap: wrap; align-items: center;
    padding: 20px 0 calc(28px + env(safe-area-inset-bottom, 0px)); }
  .cl .pgc-ft-b .small { color: rgba(255,255,255,.55); }
  .cl .pgc-ft-home { display: inline-flex; align-items: center; min-height: 44px; font: 500 14px var(--text);
    color: rgba(255,255,255,.74); }
  .cl .pgc-ft-home:hover { color: #fff; }
  .cl .pgc-ft-home:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
  @media (max-width: 1180px) { .cl .pgc-ft-g { gap: 26px; } }
  @media (max-width: 900px) { .cl .pgc-ft-g { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 600px) { .cl .pgc-ft-g { grid-template-columns: 1fr; gap: 28px; } }
  @media (prefers-reduced-motion: reduce) {
    .cl .pgc-ft-c a:hover { transform: none; }
    .cl .pgc-ft-c a span::after { transition: none; }
  }
`;

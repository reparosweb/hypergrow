"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Clapperboard, GitMerge, Search, ShoppingBag, Sparkles, Target, type LucideIcon } from "lucide-react";
import { ClaroHead } from "./ClaroUI";
import { SCENE_CSS, SceneCRM, SceneChat, SceneEcom, SceneFunil, SceneSEO, SceneSocial } from "./ClaroScenes";

/* ─────────────────────────────────────────────────────────────────────────────
   "Veja o trabalho acontecendo" — SEIS palcos animados. Rail de botões à
   esquerda, cena correspondente à direita; troca sozinho a cada 5,6s, pausa no
   hover e no foco de teclado, clique dirige.

   ⚠️ CORREÇÃO 2026-08-06: esta seção tinha sido portada com QUATRO itens (um
   por pilar do catálogo) em vez dos SEIS do design. Foi decisão minha e estava
   errada — o dono apontou: "temos 6 cards que têm efeitos e você só incluiu 4".
   Os seis voltaram, com os títulos, as frases, as cores e as cenas exatas do
   projeto Claude Design (lit-show.jsx), lido ao vivo pelo MCP.

   Estes 6 recortes NÃO competem com os 4 pilares: o catálogo de serviços
   (ClaroSolucoes, logo abaixo) continua organizado por pilar, com os 22
   serviços reais. Aqui o recorte é por CENA — é o que rende as 6 animações.

   REVISÃO ANTERIOR (pedido do dono: "não tem efeito ao passar o mouse
   trocar de cor"):
   1. O hover REALMENTE não trocava a cor do título: `<b className="glow-t">`
      recebia `style={{color: ...}}` inline, e a regra `.cl .lit:hover .glow-t`
      (app/claro-tokens.css) NÃO tem `!important` — estilo inline vence
      qualquer folha de estilo. Toda a cor por pilar saiu do inline e agora
      passa por `--beam` + CSS, que é o mecanismo da casa e responde a
      :hover/:focus-visible/.on igual.
   2. A barra de progresso animava `width` (layout a cada frame) → virou
      `transform:scaleX()`; e no hover ela agora CONGELA
      (`animation-play-state:paused`) em vez de sumir do zero.
   3. O halo do palco transicionava `background` por .8s (repintura de uma
      área grande a cada frame) → virou fade de `opacity` na troca de cena.
   4. Padrão WAI-ARIA "tabs" completo: rail com `aria-orientation`, painel com
      role="tabpanel"/aria-labelledby, roving tabindex e setas do teclado.
   5. A descrição não abre/fecha mais em `max-height` (animação de layout que
      ainda fazia o bloco pular sozinho a cada 5,6s, com o cursor em cima) —
      todas ficam visíveis e a altura do rail é estável.
   Só `transform`/`opacity`/cor são animados (regra de performance da casa).
   ──────────────────────────────────────────────────────────────────────────── */

/* Os 6 itens, com título, frase, ícone e cor EXATOS do design (lit-show.jsx).
   As cores aqui são as do mockup (`--d-*` em app/claro-tokens.css) e não a
   paleta de pilar — cada palco tem a sua, é o que dá a variação visual da
   seção. Nenhuma delas é jade/cobre. */
type ShowItem = {
  key: string;
  titulo: string;
  frase: string;
  Icon: LucideIcon;
  hex: string;
  Scene: (props: { c: string }) => JSX.Element;
};

const ITEMS: ShowItem[] = [
  { key: "ecom", titulo: "E-commerce & operação", frase: "Produto entrando na loja e o estoque batendo com o ERP.", Icon: ShoppingBag,  hex: "#3B2FCC", Scene: SceneEcom },
  { key: "pres", titulo: "Presença & autoridade", frase: "Sua marca escalando até a primeira posição.",              Icon: Search,      hex: "#07835C", Scene: SceneSEO },
  { key: "aqui", titulo: "Aquisição paga",        frase: "Cliques entrando no funil e saindo como venda.",           Icon: Target,      hex: "#A8560B", Scene: SceneFunil },
  { key: "auto", titulo: "Automação & IA",        frase: "Uma conversa que se resolve sozinha às 22h47.",            Icon: Sparkles,    hex: "#0A6C9E", Scene: SceneChat },
  { key: "cont", titulo: "Conteúdo & mídia",      frase: "Publicação no ar e o engajamento subindo.",                Icon: Clapperboard,hex: "#B0155F", Scene: SceneSocial },
  { key: "estr", titulo: "Estrutura comercial",   frase: "O negócio andando de etapa em etapa, com previsão.",       Icon: GitMerge,    hex: "#1B3B8B", Scene: SceneCRM },
];

const AUTO_MS = 5600;

export default function ClaroShow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  /* Sobe 1 toda vez que o relógio recomeça (troca de item ou saída do hover).
     A barra de progresso usa isso como `key`: assim ela reinicia EXATAMENTE
     junto com o intervalo, em vez de terminar antes e ficar cheia esperando. */
  const [cycle, setCycle] = useState(0);
  const railRef = useRef<Array<HTMLButtonElement | null>>([]);

  /* Estado NEUTRO no servidor e na primeira renderização do cliente (false),
     ligado só depois da hidratação — mesma disciplina do useWhatsApp(). */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Auto-avança; reinicia a contagem a cada clique manual (mesmo padrão do
  // mockup). Não roda com o ponteiro/foco dentro nem com movimento reduzido.
  useEffect(() => {
    if (paused || reduced) return;
    setCycle((c) => c + 1); // `cycle` não é dependência: não realimenta o efeito
    const t = setInterval(() => setActive((i) => (i + 1) % ITEMS.length), AUTO_MS);
    return () => clearInterval(t);
  }, [paused, reduced, active]);

  const cur = ITEMS[active];
  const Scene = cur.Scene;
  const corAtual = cur.hex;

  /* Setas do teclado no rail vertical (WAI-ARIA tabs, ativação automática). */
  function onRailKey(e: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = ITEMS.length;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % n;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    railRef.current[next]?.focus();
  }

  return (
    <section id="mostra" className="sec alt">
      <div className="wrap">
        <ClaroHead
          center
          eyebrow="Soluções em ação"
          sub="Não listamos serviços: mostramos o que acontece quando cada um deles entra na sua operação."
        >
          Veja o trabalho <span className="grad">acontecendo</span>
        </ClaroHead>

        <div
          className="shw rv"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="shw-rail" role="tablist" aria-label="Soluções em ação" aria-orientation="vertical">
            {ITEMS.map((it, i) => {
              const Icon = it.Icon;
              const on = i === active;
              return (
                <button
                  key={it.key}
                  type="button"
                  role="tab"
                  id={`shw-tab-${it.key}`}
                  aria-selected={on}
                  aria-controls="shw-painel"
                  tabIndex={on ? 0 : -1}
                  ref={(el) => { railRef.current[i] = el; }}
                  className={"shw-btn lit" + (on ? " on" : "")}
                  style={{ ["--beam" as string]: it.hex }}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onRailKey(e, i)}
                >
                  <span className="shw-ic glow">
                    <Icon size={19} aria-hidden />
                  </span>
                  <span className="shw-tx">
                    <b className="glow-t">{it.titulo}</b>
                    <span className="shw-desc">{it.frase}</span>
                  </span>
                  {on && (
                    <span
                      key={cycle}
                      className="shw-prog"
                      aria-hidden
                      style={{
                        animationName: "shwfill",
                        animationDuration: `${AUTO_MS}ms`,
                        animationTimingFunction: "linear",
                        animationFillMode: "forwards",
                        animationPlayState: paused || reduced ? "paused" : "running",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div
            className="shw-stage"
            id="shw-painel"
            role="tabpanel"
            aria-labelledby={`shw-tab-${cur.key}`}
            style={{ ["--beam" as string]: corAtual }}
          >
            <div className="shw-halo" aria-hidden key={`halo-${cur.key}`} />
            <div className="shw-scene" key={cur.key}>
              <Scene c={corAtual} />
            </div>
            <div className="shw-foot">
              <span className="shw-foot-tx">
                <span className="mono shw-count">
                  {String(active + 1).padStart(2, "0")} / {String(ITEMS.length).padStart(2, "0")}
                </span>
                <b className="shw-foot-t">{cur.titulo}</b>
              </span>
              <a href="#contato" className="btn btn-s shw-cta">
                Quero isso <ArrowRight size={15} aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: SCENE_CSS + STAGE_CSS }} />
    </section>
  );
}

/* Toda cor por pilar vem de `--beam` (definido inline em cada botão e no
   palco, a partir de CLARO_PILLAR_ACCENT) — nenhuma cor de marca hardcoded
   aqui embaixo. */
const STAGE_CSS = `
  .shw { display: grid; grid-template-columns: .86fr 1.14fr; gap: 32px; margin-top: 44px; align-items: center; }
  .shw-rail { display: flex; flex-direction: column; gap: 10px; }
  .shw-btn { position: relative; overflow: hidden; display: flex; align-items: flex-start; gap: 13px; text-align: left; padding: 16px 17px; border-radius: 16px; border: 1px solid var(--line); background: #fff; box-shadow: var(--sh-1); transition: border-color .26s var(--ease), background .26s var(--ease), box-shadow .26s var(--ease), transform .26s var(--ease); }
  .shw-btn::before { content: ''; position: absolute; left: 0; top: 14px; bottom: 14px; width: 3px; border-radius: 0 3px 3px 0; background: var(--beam); opacity: 0; transform: scaleY(.25); transition: opacity .26s var(--ease), transform .26s var(--ease); }
  .shw-btn.on::before, .shw-btn:hover::before, .shw-btn:focus-visible::before { opacity: 1; transform: none; }
  .shw-btn:hover { border-color: color-mix(in srgb, var(--beam) 42%, var(--line)); transform: translateX(3px); box-shadow: var(--sh-2); }
  .shw-btn.on { background: color-mix(in srgb, var(--beam) 5%, white); border-color: color-mix(in srgb, var(--beam) 32%, var(--line)); box-shadow: var(--sh-2); }
  .shw-btn:focus-visible { outline: 2px solid var(--beam); outline-offset: 3px; }
  .shw-ic { flex-shrink: 0; width: 42px; height: 42px; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--beam) 20%, white); background: color-mix(in srgb, var(--beam) 8%, white); color: var(--beam); display: inline-flex; align-items: center; justify-content: center; transition: color .3s var(--ease), background .3s var(--ease), border-color .3s var(--ease), box-shadow .3s var(--ease); }
  .shw-btn.on .shw-ic, .shw-btn:hover .shw-ic, .shw-btn:focus-visible .shw-ic { color: #fff; background: var(--beam); border-color: var(--beam); box-shadow: 0 10px 24px -10px var(--beam); }
  .shw-tx { min-width: 0; flex: 1; }
  .shw-tx b { display: block; font: 600 15px/1.3 var(--text); color: var(--ink); transition: color .3s var(--ease); }
  .shw-btn.on .shw-tx b, .shw-btn:hover .shw-tx b, .shw-btn:focus-visible .shw-tx b { color: var(--beam); }
  .shw-desc { display: block; font: 400 13px/1.45 var(--text); color: var(--ink-2); margin-top: 4px; }
  .shw-prog { position: absolute; left: 0; bottom: 0; height: 2px; width: 100%; background: var(--beam); transform: scaleX(0); transform-origin: left center; }
  @keyframes shwfill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  /* BUG REAL, CORRIGIDO DE VERDADE AGORA (dono achou por print, 2026-08-06;
     minha primeira tentativa botou min-height em ".shw-stage" e nao resolveu
     -- o auditor mediu ao vivo e a sobreposicao continuava nas 6 cenas).
     Causa raiz: ".st" (a cena, em ClaroScenes.tsx) e position:absolute;inset:0.
     O containing block dela e o ANCESTRAL POSICIONADO MAIS PROXIMO, que e
     ".shw-scene" (position:relative), NAO ".shw-stage". Como o unico filho de
     ".shw-scene" fica fora do fluxo, ".shw-scene" colapsava pra 0 de altura
     -- e ".st" ficava presa exatamente no padding vertical dela (86px
     desktop, 66px mobile), nao nos 420/340/300px que eu tinha colocado no
     lugar errado. O min-height precisa estar em ".shw-scene", que e quem
     realmente contem ".st". Mantenho tambem em ".shw-stage" (nao atrapalha,
     e ajuda o overflow:hidden abaixo a conter o halo com folga). */
  .shw-stage { position: relative; min-height: 420px; overflow: hidden; }
  .shw-halo { position: absolute; inset: -36px; z-index: 0; pointer-events: none; border-radius: 34px; background: radial-gradient(70% 60% at 78% 12%, color-mix(in srgb, var(--beam) 11%, transparent), transparent 62%); animation: shw-halo .6s var(--ease); }
  @keyframes shw-halo { from { opacity: 0; } }
  .shw-halo::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(color-mix(in srgb, var(--ink) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--ink) 6%, transparent) 1px, transparent 1px); background-size: 34px 34px; -webkit-mask-image: radial-gradient(70% 70% at 50% 40%, #000 30%, transparent 78%); mask-image: radial-gradient(70% 70% at 50% 40%, #000 30%, transparent 78%); }
  .shw-scene { position: relative; z-index: 1; min-height: 420px; animation: shwin .55s var(--ease); }
  @keyframes shwin { from { opacity: 0; transform: scale(.985); } }
  .shw-foot { position: relative; z-index: 1; margin-top: 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .shw-count { color: var(--beam); transition: color .3s var(--ease); }
  /* rodapé do palco: contador na cor do item + nome do item, como no design */
  .shw-foot-tx { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .shw-foot-t { font: 600 18px var(--disp); letter-spacing: -.02em; color: var(--ink); }
  @media (max-width: 600px) { .shw-foot-t { font-size: 16px; } }
  .shw-cta { padding: 11px 17px; font-size: 14px; }
  .shw-cta svg { transition: transform .28s var(--ease); }
  .shw-cta:hover svg { transform: translateX(4px); }
  .shw-cta:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
  @media (max-width: 900px) { .shw { grid-template-columns: 1fr; gap: 26px; } .shw-btn { padding: 14px 15px; } .shw-desc { font-size: 12.5px; } .shw-stage, .shw-scene { min-height: 340px; } }
  @media (max-width: 600px) { .shw-stage, .shw-scene { min-height: 300px; } }
  @media (prefers-reduced-motion: reduce) {
    .shw-btn:hover, .shw-cta:hover svg { transform: none; }
    .shw-scene, .shw-halo { animation: none; }
    .shw-prog { animation: none !important; transform: scaleX(1); }
  }
`;

import { ArrowRight, Play } from "lucide-react";
import { platformsOf } from "@/lib/ecommerce-platforms";
import { ClaroHead } from "./ClaroUI";

/* ─────────────────────────────────────────────────────────────────────────────
   HERO da rota /claro — fundo 100% CSS (sem foto/vídeo) + faixa clara de
   compatibilidade.

   HISTÓRICO: esta seção usava `/media/launch.mp4` (lançamento real do foguete
   Starship da SpaceX) como vídeo de fundo. Removido em 2026-08-05 por dois
   motivos, não só um: (1) o dono descreveu o resultado como "efeito de fumaça
   branca" e rejeitou o visual; (2) é filmagem real de outra empresa, sem
   licença de uso comercial para este site (mesmo problema já documentado em
   HANDOFF.md linha 101 para o vídeo equivalente do site escuro). A troca é
   por um fundo inteiramente CSS — sem imagem nova, sem risco de direito de
   imagem de novo: 3 "orbs" de luz (radial-gradient, sem `filter: blur()`,
   só transparência suave — mais barato que blur e sem o risco de travar
   scroll no mobile do item 5 da skill hg-regras-de-bug) que se movem devagar
   via @keyframes, reforçando a metáfora da copy ("Sua operação em outra
   órbita"). Junto delas, uma textura de scanline sutil e um grão de filme
   (`.cl-hero-grain`) — a MESMA técnica (SVG feTurbulence, não fabricada por
   mim) do `.grain` em hypergrow-original/styles.css ("Film grain: the single
   biggest 'this was made by a human' tell"), aqui escopada só a este hero
   (`position:absolute` dentro da seção, não `position:fixed` na página
   inteira como no arquivo original — este componente não é dono do layout
   global).

   Sem vídeo, o gate de performance antigo (`vidOn`/`matchMedia`/`saveData`,
   que só existia pra decidir se baixava 9 MB) saiu inteiro — não há mais
   nada condicional para decidir, e o componente virou Server Component (sem
   "use client", sem hook nenhum).

   Riqueza restaurada comparando com hypergrow-original/lit-hero.jsx (`LHeroVideo`):
   - Gradiente de legibilidade agora em duas camadas (vertical + diagonal pela
     esquerda), igual ao `.hv-grade` original — o texto é alinhado à esquerda.
   - Botão secundário virou vidro fosco (`.cl-hero-ghost`, mesmo tratamento do
     `.hv-ghost` original) em vez do `.btn-s` branco sólido genérico do resto
     do site, que destoava do fundo escuro.
   - Ponto do eyebrow ganhou cor de destaque (`var(--cta)`, rosa da própria
     paleta aprovada) em vez do azul padrão — igual ao dot rosa do original.
   - Indicador de rolagem virou link real (`<a href="#compat">`) em vez de
     `<div aria-hidden>` decorativo — igual ao `<a href="#hero">` do original,
     restaura o afordance clicável/focável que a versão anterior tinha perdido.
   - No mobile, o hero volta a ser altura automática com padding (como o
     original em max-width:760px) em vez de ocupar 100svh — sem foto de fundo,
     um bloco cheio de viewport ficaria vazio demais numa tela pequena.

   Cores: só a paleta azul/violeta/rosa já nos tokens (`--brand`, #5B3CFF,
   `--cta`) — nada de jade/cobre aqui (essa paleta é só da logomarca, ver
   comentário em app/claro-tokens.css).

   Esteiras (marquees): dados REAIS de `lib/ecommerce-platforms.ts` (PLATFORMS
   já conferido nesta sessão) — nada da lista antiga do mockup (Shopware,
   TikTok Ads, RD Station... nunca verificados como algo que a HyperGrow
   opera). Nenhuma métrica de empresa ("5+ anos", "200+ lojas", "7,4x ROAS")
   entra aqui — números não verificados não entram (skill hg-regras-de-bug,
   item 8); prova social mora em outro arquivo, com placeholder explícito.
   ──────────────────────────────────────────────────────────────────────────── */

const LOJA_NOMES = platformsOf("loja").map((p) => p.name);
const ERP_NOMES = platformsOf("erp").map((p) => p.name);

export default function ClaroHero() {
  return (
    <>
      <section id="top" className="cl-hero">
        <div className="cl-hero-bg" aria-hidden="true">
          <span className="cl-hero-orb cl-hero-orb-a" />
          <span className="cl-hero-orb cl-hero-orb-b" />
          <span className="cl-hero-orb cl-hero-orb-c" />
          <span className="cl-hero-scan" />
          <span className="cl-hero-grain" />
        </div>

        <div className="cl-hero-read" aria-hidden="true" />

        <div className="wrap cl-hero-in">
          <div className="cl-hero-copy">
            <div className="eyebrow cl-hero-eyebrow" style={{ marginBottom: 24, color: "rgba(255,255,255,.78)" }}>
              <i /> E-commerce · Marketing · IA · Automação
            </div>
            <h1 className="cl-hero-h1">Sua operação em <span className="cl-hero-accent">outra órbita</span></h1>
            <p className="cl-hero-lead">
              Loja, anúncio, atendimento e time comercial funcionando como um sistema — não como seis fornecedores diferentes.
            </p>
            <div className="cl-hero-actions">
              <a href="#contato" className="btn btn-p" style={{ padding: "16px 28px", fontSize: 16 }}>
                Falar com especialista <ArrowRight size={18} aria-hidden />
              </a>
              <a href="#diagnostico" className="btn cl-hero-ghost" style={{ padding: "16px 26px", fontSize: 16 }}>
                <Play size={16} aria-hidden /> Fazer diagnóstico
              </a>
            </div>
          </div>
        </div>

        <a href="#compat" className="cl-hero-scroll" aria-label="Rolar para a próxima seção">
          <span className="cl-hero-scroll-track"><span className="cl-hero-scroll-dot" /></span>
        </a>
      </section>

      <section id="compat" className="sec cl-hero-plat">
        <div className="wrap">
          <ClaroHead
            center
            eyebrow="Compatibilidade"
            sub="Site, integração e automação pensados para o ecossistema que sua operação provavelmente já usa — sem trocar de plataforma pra trabalhar com a gente."
          >
            Não é mais um fornecedor.<br />É a <span className="grad">peça que já encaixa</span>
          </ClaroHead>

          <div className="cl-hero-mqs">
            <div className="mq" aria-hidden="true">
              <div className="mq-t">{LOJA_NOMES.map((n) => <span className="mq-i" key={n}>{n}</span>)}</div>
              <div className="mq-t">{LOJA_NOMES.map((n) => <span className="mq-i" key={n + "-b"}>{n}</span>)}</div>
            </div>
            <div className="mq rev" aria-hidden="true">
              <div className="mq-t">{ERP_NOMES.map((n) => <span className="mq-i" key={n}>{n}</span>)}</div>
              <div className="mq-t">{ERP_NOMES.map((n) => <span className="mq-i" key={n + "-b"}>{n}</span>)}</div>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

const CSS = `
  .cl-hero { position: relative; height: 100svh; min-height: 620px; overflow: hidden; background: #04060f; }

  /* fundo 100% CSS: base + 3 orbs de luz (sem filter:blur, só transparência) */
  .cl-hero-bg { position: absolute; inset: 0; overflow: hidden; background: radial-gradient(120% 90% at 50% 0%, #0B1230 0%, #04060f 58%); }
  .cl-hero-orb { position: absolute; border-radius: 50%; mix-blend-mode: screen; will-change: transform; }
  .cl-hero-orb-a { width: min(58vw,720px); height: min(58vw,720px); left: -12%; top: -16%; background: radial-gradient(circle at 42% 42%, rgba(91,60,255,.55), rgba(91,60,255,0) 70%); animation: cl-orb-a 22s ease-in-out infinite alternate; }
  .cl-hero-orb-b { width: min(46vw,560px); height: min(46vw,560px); right: -10%; top: 4%; background: radial-gradient(circle at 55% 45%, rgba(21,80,232,.5), rgba(21,80,232,0) 70%); animation: cl-orb-b 26s ease-in-out infinite alternate; }
  .cl-hero-orb-c { width: min(50vw,620px); height: min(50vw,620px); left: 16%; bottom: -26%; background: radial-gradient(circle at 50% 50%, rgba(224,22,95,.4), rgba(224,22,95,0) 72%); animation: cl-orb-c 30s ease-in-out infinite alternate; }
  @keyframes cl-orb-a { from { transform: translate(0,0) scale(1); } to { transform: translate(6%,4%) scale(1.08); } }
  @keyframes cl-orb-b { from { transform: translate(0,0) scale(1); } to { transform: translate(-5%,6%) scale(1.05); } }
  @keyframes cl-orb-c { from { transform: translate(0,0) scale(1); } to { transform: translate(4%,-5%) scale(1.1); } }

  /* scanline + grão de filme — textura cinematográfica, mesma técnica do .grain original, escopada ao hero */
  .cl-hero-scan { position: absolute; inset: 0; opacity: .22; mix-blend-mode: overlay; pointer-events: none; background: repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 1px, transparent 2px 4px); }
  .cl-hero-grain { position: absolute; inset: -20%; opacity: .05; mix-blend-mode: overlay; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); animation: cl-grain 7s steps(6) infinite; }
  @keyframes cl-grain { 0% { transform: translate(0,0); } 20% { transform: translate(-6%,4%); } 40% { transform: translate(4%,-6%); } 60% { transform: translate(-4%,6%); } 80% { transform: translate(6%,-4%); } 100% { transform: translate(0,0); } }

  /* legibilidade: vinheta vertical + escurecimento diagonal pela esquerda (texto é alinhado à esquerda) */
  /* Sem faixa clara no rodapé do hero de propósito: uma versão anterior tinha
     um gradiente escuro→var(--paper) de 170px aqui pra suavizar a transição
     pra próxima seção — contra o fundo #04060f isso desenhava uma mancha
     branca nublada bem no meio da tela, que o dono apontou e pediu pra tirar
     em 2026-08-05 (mesma queixa do vídeo do foguete: "efeito de fumaça").
     A vinheta escura de baixo já escurece o rodapé o bastante (rgba(4,6,15,.97)
     no último stop) pra a transição pra --paper funcionar sem precisar clarear
     antes — corte limpo, sem nuvem. */
  .cl-hero-read { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(4,6,15,.66) 0%, rgba(4,6,15,.28) 38%, rgba(4,6,15,.58) 72%, rgba(4,6,15,.97) 100%), linear-gradient(100deg, rgba(4,6,15,.7) 0%, transparent 56%); }
  .cl-hero-in { position: relative; z-index: 6; height: 100%; display: flex; flex-direction: column; justify-content: center; }
  .cl-hero-copy { max-width: min(760px, 100%); }
  .cl-hero-eyebrow i { background: var(--cta); box-shadow: 0 0 0 4px rgba(224,22,95,.18); }
  .cl-hero-h1 { margin: 0; font: 800 clamp(40px,7.4vw,84px)/1.03 var(--font-display); letter-spacing: -.045em; color: #fff; text-wrap: balance; text-shadow: 0 6px 44px rgba(0,0,0,.6); }
  .cl-hero-accent { background: linear-gradient(104deg, #5B3CFF 0%, #1550E8 46%, #E0165F 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  .cl-hero-lead { font: 400 clamp(16px,1.5vw,20px)/1.6 var(--font-sans); color: rgba(255,255,255,.86); max-width: min(600px, 100%); margin: 22px 0 0; text-wrap: pretty; text-shadow: 0 2px 16px rgba(0,0,0,.6); }
  .cl-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 34px; }

  /* botão secundário: vidro fosco sobre o fundo escuro (em vez do .btn-s branco sólido do resto do site) */
  .cl-hero-ghost { background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.32); backdrop-filter: blur(10px); }
  .cl-hero-ghost:hover { background: rgba(255,255,255,.2); color: #fff; transform: translateY(-2px); }

  .cl-hero-scroll { position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 6; display: inline-flex; }
  .cl-hero-scroll:focus-visible { outline: 2px solid #fff; outline-offset: 4px; border-radius: 999px; }
  .cl-hero-scroll-track { width: 22px; height: 36px; border: 1.5px solid rgba(255,255,255,.30); border-radius: 999px; display: flex; justify-content: center; padding-top: 6px; }
  .cl-hero-scroll-dot { width: 4px; height: 8px; border-radius: 999px; background: #6E8FFF; box-shadow: 0 0 8px #6E8FFF; animation: cl-hero-bob 1.6s ease-in-out infinite; }
  @keyframes cl-hero-bob { 0%,100% { transform: translateY(0); opacity: 1; } 60% { transform: translateY(12px); opacity: .2; } }

  .cl-hero-plat { padding-top: 78px; }
  .cl-hero-mqs { margin-top: 46px; display: flex; flex-direction: column; gap: 22px; }

  @media (max-width: 760px) {
    .cl-hero { height: auto; min-height: 0; padding: 136px 0 64px; }
    .cl-hero-in { height: auto; }
    .cl-hero-scroll { display: none; }
    .cl-hero-read { background: linear-gradient(180deg, rgba(4,6,15,.55) 0%, rgba(4,6,15,.42) 45%, rgba(4,6,15,.97) 100%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .cl-hero-orb-a, .cl-hero-orb-b, .cl-hero-orb-c, .cl-hero-grain { animation: none; }
    .cl-hero-scroll-dot { animation: none; }
    .cl-hero-mqs .mq-t { animation: none !important; }
  }
`;

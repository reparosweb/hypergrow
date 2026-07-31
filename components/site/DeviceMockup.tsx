/* ─────────────────────────────────────────────────────────────────────────────
   DEVICE MOCKUP — molduras realistas para as telas REAIS dos projetos.

   Por que existe: o site tinha 10 screenshots verdadeiros (800×500, em
   public/portfolio/) sendo desperdiçados como thumbnail de card. Dentro de uma
   moldura de navegador/celular convincente, a mesma imagem passa a "vender com
   os olhos" — sem banco de imagem, sem render 3D, usando ativo 100% nosso.

   COMO O REALISMO É FEITO (e por que não é neon):
     · sombra AMBIENTE  — larga, fraca, deslocada para baixo  → o objeto ocupa espaço
     · sombra de CONTATO — estreita, escura, colada na base    → o objeto pousa
     · anel de 1px       — rgba clara bem baixa                 → recorta do fundo
     · luz de topo       — inset 1px clara em cima              → a borda pega luz
     · sombra de base    — inset 1px escura embaixo             → a borda some na sombra
     · reflexo na tela   — gradiente diagonal ~8% opacidade     → o vidro existe
   Nenhum blur/backdrop-filter: em elemento grande isso trava o scroll no mobile.
   Tudo é box-shadow + gradiente, que a GPU resolve de graça.

   REGRAS DO PROJETO CUMPRIDAS AQUI:
     · Server component puro — sem "use client", sem hook, sem estado, zero JS no cliente.
     · Sem dependência nova. Sem lucide (páginas internas não carregam o script) — SVG inline.
     · Sem useId() em <defs> de SVG (quebra hidratação: React #418/#423/#425).
     · Sem a classe .reveal (as páginas internas não têm o IntersectionObserver que a liga).
       Estado base é VISÍVEL; a animação é só por tempo e desliga em prefers-reduced-motion.
     · Nenhuma largura fixa crua: sempre min(Xpx, 100%).
     · Paleta travada em grafite/bone/jade/cobre/champanhe. PROIBIDO azul e violeta.

   NOTA DE PESO: o <style> acompanha cada instância (server component não tem como
   deduplicar com segurança entre requisições). São ~4 KB idênticos, que o gzip
   colapsa para quase nada. Se um dia quiser hoistar, o bloco está exportado como
   <DeviceMockupStyles /> — mas ele NÃO é obrigatório: cada moldura já se basta.
   ──────────────────────────────────────────────────────────────────────────── */

import type { CSSProperties, ReactNode } from "react";

/* ── Tipos ─────────────────────────────────────────────────────────────────── */

type BaseProps = {
  /** Caminho da imagem, ex.: "/portfolio/agentop.webp" */
  src: string;
  /** Texto alternativo — descreva a TELA, não o arquivo. Obrigatório. */
  alt: string;
  /** true = imagem da primeira dobra (carrega eager). Padrão: false (lazy). */
  priority?: boolean;
  /** Classe extra no elemento externo, para o consumidor posicionar. */
  className?: string;
  /** Estilo extra no elemento externo (ex.: margin). */
  style?: CSSProperties;
};

export type BrowserFrameProps = BaseProps & {
  /** Domínio mostrado na barra de endereço, ex.: "agentop.com.br". Sem "https://". */
  title?: string;
  /** Largura INTRÍNSECA da imagem em px. Padrão 800 (todas as telas do portfólio). */
  width?: number;
  /** Altura INTRÍNSECA da imagem em px. Padrão 500. */
  height?: number;
  /** Teto de largura da moldura na tela. Padrão 880. Sempre aplicado como min(x, 100%). */
  maxWidth?: number;
};

export type PhoneFrameProps = BaseProps & {
  /** Teto de largura do aparelho. Padrão 280. */
  maxWidth?: number;
  /**
   * As telas do portfólio são paisagem (800×500) e o celular é retrato: a imagem
   * é recortada. "center top" mostra o topo do site (hero + menu), que é o que
   * um print de celular de verdade mostraria. Padrão: "center top".
   */
  objectPosition?: string;
};

export type StackedShowcaseProps = {
  browserSrc: string;
  browserAlt: string;
  phoneSrc: string;
  phoneAlt: string;
  /** Domínio na barra de endereço do navegador. */
  title?: string;
  /** Teto de largura da composição inteira. Padrão 980. */
  maxWidth?: number;
  /** true se a composição está na primeira dobra. */
  priority?: boolean;
  /** Recorte da imagem do celular. Padrão "center top". */
  phoneObjectPosition?: string;
  className?: string;
  style?: CSSProperties;
};

/* ── Cadeado do https (SVG inline — lucide não existe nas páginas internas) ── */

function LockGlyph() {
  return (
    <svg
      className="dv-omni__lock"
      viewBox="0 0 24 24"
      width="11"
      height="11"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4" y="10.5" width="16" height="11" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  );
}

/* ── Barra do navegador ────────────────────────────────────────────────────── */

function BrowserBar({ title }: { title?: string }) {
  return (
    <div className="dv-bar">
      <span className="dv-dots" aria-hidden="true">
        <i className="dv-dot dv-dot--a" />
        <i className="dv-dot dv-dot--b" />
        <i className="dv-dot dv-dot--c" />
      </span>

      <span className="dv-omni" aria-hidden="true">
        <LockGlyph />
        {title ? (
          <span className="dv-omni__url">
            <span className="dv-omni__scheme">https://</span>
            <span className="dv-omni__host">{title}</span>
          </span>
        ) : (
          <span className="dv-omni__ghost" />
        )}
      </span>

      <span className="dv-bar__aside" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

/* ── 1. BrowserFrame ───────────────────────────────────────────────────────── */

export function BrowserFrame({
  src,
  alt,
  title,
  width = 800,
  height = 500,
  maxWidth = 880,
  priority = false,
  className,
  style,
}: BrowserFrameProps) {
  return (
    <>
      <DeviceMockupStyles />
      <figure
        className={`dv-browser${className ? ` ${className}` : ""}`}
        style={{ maxWidth: `min(${maxWidth}px, 100%)`, ...style }}
      >
        <BrowserBar title={title} />
        <div className="dv-screen" style={{ aspectRatio: `${width} / ${height}` }}>
          <img
            className="dv-screen__img"
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
          />
          <span className="dv-glare" aria-hidden="true" />
        </div>
      </figure>
    </>
  );
}

/* ── 2. PhoneFrame ─────────────────────────────────────────────────────────── */

export function PhoneFrame({
  src,
  alt,
  maxWidth = 280,
  objectPosition = "center top",
  priority = false,
  className,
  style,
}: PhoneFrameProps) {
  return (
    <>
      <DeviceMockupStyles />
      <figure
        className={`dv-phone${className ? ` ${className}` : ""}`}
        style={{ maxWidth: `min(${maxWidth}px, 100%)`, ...style }}
      >
        <span className="dv-phone__notch" aria-hidden="true" />
        <div className="dv-phone__screen">
          <img
            className="dv-phone__img"
            src={src}
            alt={alt}
            width={800}
            height={500}
            style={{ objectPosition }}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
          />
          <span className="dv-glare dv-glare--phone" aria-hidden="true" />
        </div>
      </figure>
    </>
  );
}

/* ── 3. StackedShowcase ────────────────────────────────────────────────────── */

export function StackedShowcase({
  browserSrc,
  browserAlt,
  phoneSrc,
  phoneAlt,
  title,
  maxWidth = 980,
  priority = false,
  phoneObjectPosition = "center top",
  className,
  style,
}: StackedShowcaseProps) {
  return (
    <>
      <DeviceMockupStyles />
      <div
        className={`dv-stack${className ? ` ${className}` : ""}`}
        style={{ maxWidth: `min(${maxWidth}px, 100%)`, ...style }}
      >
        <div className="dv-stack__browser">
          <BrowserFrame
            src={browserSrc}
            alt={browserAlt}
            title={title}
            priority={priority}
            maxWidth={maxWidth}
          />
        </div>
        <div className="dv-stack__phone">
          <PhoneFrame
            src={phoneSrc}
            alt={phoneAlt}
            priority={priority}
            objectPosition={phoneObjectPosition}
            maxWidth={230}
          />
        </div>
      </div>
    </>
  );
}

/* ── Estilos ───────────────────────────────────────────────────────────────
   Tudo prefixado .dv- para não colidir com o CSS global do site.
   Cores literais de propósito: este arquivo não pode depender de token que
   outra pessoa esteja editando agora. São exatamente os valores da marca.
   ────────────────────────────────────────────────────────────────────────── */

export function DeviceMockupStyles(): ReactNode {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
/* ===== base compartilhada ================================================= */
.dv-browser, .dv-phone { margin: 0; }

/* ===== 1. NAVEGADOR ======================================================= */
.dv-browser{
  position: relative;
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(180deg, #1F252C 0%, #171B20 46%, #12151A 100%);
  /* anel · luz de topo · sombra de base · contato · ambiente larga */
  box-shadow:
    0 0 0 1px rgba(232,226,217,.075),
    inset 0 1px 0 rgba(232,226,217,.14),
    inset 0 -1px 0 rgba(0,0,0,.55),
    0 2px 4px rgba(0,0,0,.35),
    0 10px 20px -8px rgba(0,0,0,.55),
    0 40px 80px -28px rgba(0,0,0,.75);
  animation: dv-rise .7s cubic-bezier(.2,.65,.3,1) both;
}
/* fio de luz atravessando a borda superior — o detalhe que "acende" a moldura */
.dv-browser::before{
  content:""; position:absolute; inset:0 0 auto 0; height:1px; z-index:3;
  background: linear-gradient(90deg,
    transparent 0%, rgba(232,226,217,.32) 22%, rgba(232,226,217,.42) 50%,
    rgba(232,226,217,.32) 78%, transparent 100%);
  pointer-events:none;
}

/* barra de topo */
.dv-bar{
  position: relative; z-index: 2;
  display: flex; align-items: center; gap: 12px;
  padding: 0 14px;
  height: 38px;
  background: linear-gradient(180deg, #22282F 0%, #1A1F25 100%);
  border-bottom: 1px solid rgba(0,0,0,.6);
  box-shadow: 0 1px 0 rgba(232,226,217,.045);
}
.dv-dots{ display:flex; align-items:center; gap:7px; flex:0 0 auto; }
.dv-dot{
  width:10px; height:10px; border-radius:50%; display:block;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.22), inset 0 -1px 0 rgba(0,0,0,.28);
}
.dv-dot--a{ background:#C4763C; }   /* cobre  */
.dv-dot--b{ background:#D3B78E; }   /* champanhe */
.dv-dot--c{ background:#2DD4A0; }   /* jade   */

/* campo de endereço */
.dv-omni{
  flex: 1 1 auto; min-width: 0;
  display: flex; align-items: center; gap: 7px;
  height: 23px; padding: 0 11px;
  border-radius: 999px;
  background: #0F1216;
  box-shadow:
    inset 0 1px 2px rgba(0,0,0,.7),
    0 1px 0 rgba(232,226,217,.05);
  overflow: hidden;
}
.dv-omni__lock{ flex:0 0 auto; color:#2DD4A0; opacity:.9; }
.dv-omni__url{
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11.5px; line-height: 1; letter-spacing: .01em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
}
.dv-omni__scheme{ color: rgba(232,226,217,.38); }
.dv-omni__host{ color: #E8E2D9; }
.dv-omni__ghost{
  display:block; height:5px; width:min(180px,46%); border-radius:3px;
  background: rgba(232,226,217,.13);
}
.dv-bar__aside{ display:flex; flex-direction:column; gap:3px; flex:0 0 auto; }
.dv-bar__aside i{ display:block; width:13px; height:1.5px; border-radius:2px; background: rgba(232,226,217,.28); }

/* tela */
.dv-screen{
  position: relative;
  width: 100%;
  background: #0D1013;
  overflow: hidden;
}
.dv-screen__img{
  display:block; width:100%; height:100%; object-fit:cover; object-position:center top;
}
/* reflexo diagonal de vidro — discreto de propósito */
.dv-glare{
  position:absolute; inset:0; pointer-events:none; z-index:2;
  background:
    linear-gradient(104deg,
      rgba(232,226,217,.11) 0%,
      rgba(232,226,217,.045) 14%,
      rgba(232,226,217,0) 34%,
      rgba(232,226,217,0) 100%),
    linear-gradient(180deg, rgba(0,0,0,.10) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,.14) 100%);
}

/* ===== 2. CELULAR ========================================================= */
.dv-phone{
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 19;
  border-radius: 30px;
  padding: 8px;               /* bezel fino */
  background: linear-gradient(155deg, #2A3139 0%, #171B20 42%, #101317 100%);
  box-shadow:
    0 0 0 1px rgba(232,226,217,.09),
    inset 0 1px 0 rgba(232,226,217,.20),
    inset 0 -1px 0 rgba(0,0,0,.6),
    0 2px 4px rgba(0,0,0,.4),
    0 14px 24px -10px rgba(0,0,0,.6),
    0 44px 70px -30px rgba(0,0,0,.8);
  animation: dv-rise .7s cubic-bezier(.2,.65,.3,1) both;
}
.dv-phone__notch{
  position:absolute; z-index:3; top:8px; left:50%; transform:translateX(-50%);
  width:32%; max-width:96px; height:15px;
  border-radius:0 0 11px 11px;
  background:#0A0C0F;
  box-shadow: inset 0 -1px 0 rgba(232,226,217,.07);
}
.dv-phone__screen{
  position:relative; width:100%; height:100%;
  border-radius: 23px; overflow:hidden;
  background:#0D1013;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.85);
}
.dv-phone__img{ display:block; width:100%; height:100%; object-fit:cover; }
.dv-glare--phone{
  background:
    linear-gradient(112deg,
      rgba(232,226,217,.13) 0%,
      rgba(232,226,217,.05) 12%,
      rgba(232,226,217,0) 30%,
      rgba(232,226,217,0) 100%),
    linear-gradient(180deg, rgba(0,0,0,.14) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,.18) 100%);
}

/* ===== 3. COMPOSIÇÃO (navegador + celular na frente) ====================== */
.dv-stack{
  position: relative;
  width: 100%;
  /* respiro à direita e embaixo para o celular sobreposto e para as sombras */
  padding: 0 0 46px 0;
}
.dv-stack__browser{ width: 100%; }
.dv-stack__phone{
  position: absolute;
  right: 2%;
  bottom: 0;
  width: 21%;
  min-width: 132px;
  z-index: 4;
}
.dv-stack__phone .dv-phone{
  /* na frente de outro objeto, a sombra precisa ser mais funda para separar */
  box-shadow:
    0 0 0 1px rgba(232,226,217,.11),
    inset 0 1px 0 rgba(232,226,217,.22),
    inset 0 -1px 0 rgba(0,0,0,.6),
    0 3px 6px rgba(0,0,0,.5),
    0 18px 30px -12px rgba(0,0,0,.7),
    0 52px 80px -32px rgba(0,0,0,.85);
}

/* colapso no celular: sai a sobreposição, os dois viram uma coluna centrada */
@media (max-width: 640px){
  .dv-stack{ padding: 0; display: flex; flex-direction: column; align-items: center; gap: 22px; }
  .dv-stack__phone{
    position: static; width: min(178px, 52%); min-width: 0; right: auto; bottom: auto;
  }
  .dv-browser{ border-radius: 12px; }
  .dv-bar{ height: 34px; gap: 10px; padding: 0 11px; }
  .dv-dot{ width: 8px; height: 8px; }
  .dv-omni{ height: 21px; }
  .dv-omni__url{ font-size: 10.5px; }
}

/* ===== animação =========================================================== */
/* Estado base é VISÍVEL. A animação parte de opacidade .5 (nunca 0), então
   mesmo que algo dê errado o conteúdo nunca some. Sem delay, sem observer. */
@keyframes dv-rise{
  from{ opacity:.5; transform: translate3d(0, 10px, 0); }
  to  { opacity:1;  transform: translate3d(0, 0, 0); }
}
@media (prefers-reduced-motion: reduce){
  .dv-browser, .dv-phone{ animation: none !important; }
}
` }} />
  );
}

export default BrowserFrame;

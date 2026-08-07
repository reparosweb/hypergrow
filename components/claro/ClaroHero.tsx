"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { platformsOf } from "@/lib/ecommerce-platforms";
import { ClaroHead } from "./ClaroUI";
import ClaroVitrine from "./ClaroVitrine";

/* ─────────────────────────────────────────────────────────────────────────────
   HERO — vídeo de fundo + faixa de compatibilidade.

   POR QUE O VÍDEO APARECIA "EMBAÇADO E DISTORCIDO" (reclamação de 2026-08-06):
   eram três defeitos somados, todos meus, todos medidos antes de corrigir.

   1. O poster era `launch-poster.webp`: 720×405 em 11 KB. Isso é ~0,03 byte por
      pixel — compressão tão agressiva que a imagem já sai borrada; esticada
      para 1920 px de largura vira 2,7× de ampliação em cima de artefato. Era o
      que aparecia enquanto o vídeo não tocava (e o vídeo demorava, ver item 3).
      → Agora: `launch-hero-poster.webp`, 1080×1080 em 93 KB, extraído do FRAME
        t=0 do próprio vídeo com ffmpeg. Mesma proporção do vídeo, então não há
        salto de enquadramento quando ele entra, e sem upscale de origem.

   2. O vídeo tinha `opacity:.82` mais uma camada de grão animado (`feTurbulence`)
      por cima. As duas coisas juntas lavam e sujam a imagem — parece foco ruim.
      → Agora: vídeo em opacidade cheia; o grão saiu (ele existe no tema ESCURO
        do material original, `styles.css`, não no claro — eu tinha trazido por
        engano). Ficou só a vinheta de legibilidade e o scanline sutil, que são
        do design original.

   3. `launch.mp4` tem 11 MB, é 1080×1080 e o átomo `moov` fica NO FIM do arquivo
      (sem faststart) — o navegador precisa baixar quase tudo antes do primeiro
      quadro. O próprio autor do design registrou isso no projeto: "o arquivo
      launch.mp4 não está sendo servido em streaming nesse ambiente".
      → Agora: `launch-hero.mp4`, reencodado com `-movflags +faststart`, 3,9 MB.
        Começa a tocar quase imediatamente.

   Arquivo NOVO em vez de sobrescrever: `next.config.mjs` serve `/media` com
   `max-age=31536000, immutable` e o próprio comentário de lá manda TROCAR O NOME
   quando o conteúdo mudar — sobrescrever deixaria quem já visitou com o arquivo
   velho em cache por um ano.

   4. RESOLVIDO EM 2026-08-06: o `launch.mp4` era 1080×1080 — QUADRADO. Num hero
      widescreen o `object-fit:cover` ampliava ~1,8× e cortava ~44% da altura;
      por melhor que fosse o encode, sempre sobrava ampliação. Eu tinha
      registrado isso aqui como limite insolúvel sem um master 16:9 — e o dono
      então forneceu exatamente isso (`Starship_s_Fifth_Flight_Test.mp4`,
      1920×1080, 24fps). O hero passou a usar `hero-v2.mp4`: recorte de 22 s da
      decolagem, 1920×1080 NATIVO, 4,7 MB, faststart, sem áudio. Em tela de
      1920 px não há mais ampliação nenhuma. O `launch-hero.mp4` (passo
      intermediário, ainda do master quadrado) foi REMOVIDO do repositório no
      mesmo commit para não deixar 3,9 MB de peso morto — o `launch.mp4`
      original continua lá porque o tema escuro, que segue no repo, aponta
      para ele.

   Fallback sem vídeo (tela pequena / prefers-reduced-motion / saveData): os 3
   orbs de luz em CSS. O poster também fica como camada de fundo com zoom lento
   (igual ao `.hv-poster` do design) para o topo nunca ficar parado esperando o
   arquivo.

   CONTRASTE: o degradê do título usa tons CLAROS (#7DA8FF/#B9A8FF/#FF7AAA),
   como no design original — o azul #1550E8 da paleta é escuro demais para ler
   sobre vídeo escuro. Mesma razão do ponto do eyebrow em #FF5C93.
   ──────────────────────────────────────────────────────────────────────────── */

const LOJA_NOMES = platformsOf("loja").map((p) => p.name);
const ERP_NOMES = platformsOf("erp").map((p) => p.name);

export default function ClaroHero() {
  const vidRef = useRef<HTMLVideoElement>(null);
  const [vidOn, setVidOn] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const small = window.matchMedia("(max-width: 760px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const save = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!small && !reduce && !save) setVidOn(true);
  }, []);

  /* O vídeo só ganha opacidade quando o evento `playing` dispara de verdade —
     assim nunca se vê um quadro congelado/meio carregado por cima do poster. */
  useEffect(() => {
    if (!vidOn) return;
    const v = vidRef.current;
    if (!v) return;
    const kick = () => { v.play().catch(() => {}); };
    const onPlaying = () => setLive(true);
    v.addEventListener("loadeddata", kick);
    v.addEventListener("canplay", kick);
    v.addEventListener("playing", onPlaying);
    if (v.readyState >= 2) kick();
    return () => {
      v.removeEventListener("loadeddata", kick);
      v.removeEventListener("canplay", kick);
      v.removeEventListener("playing", onPlaying);
    };
  }, [vidOn]);

  return (
    <>
      <section id="top" className="cl-hero">
        <div className="cl-hero-bg" aria-hidden="true">
          <span className="cl-hero-poster" />
          {vidOn ? (
            <video
              ref={vidRef}
              className="cl-hero-vid"
              style={{ opacity: live ? 1 : 0 }}
              autoPlay
              muted
              loop
              playsInline
              disablePictureInPicture
              preload="auto"
              onLoadedMetadata={(e) => { e.currentTarget.muted = true; e.currentTarget.volume = 0; }}
            >
              <source src="/media/hero-v2.mp4" type="video/mp4" />
            </video>
          ) : (
            <>
              <span className="cl-hero-orb cl-hero-orb-a" />
              <span className="cl-hero-orb cl-hero-orb-b" />
              <span className="cl-hero-orb cl-hero-orb-c" />
            </>
          )}
          <span className="cl-hero-scan" />
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
              <a href="#contato" className="btn btn-p cl-hero-cta">
                Falar com especialista <ArrowRight size={18} aria-hidden />
              </a>
              <a href="#diagnostico" className="btn cl-hero-ghost">
                Fazer o diagnóstico gratuito
              </a>
            </div>
          </div>
        </div>

        <a href="#compat" className="cl-hero-cue" aria-label="Rolar para a próxima seção">
          <span className="cl-hero-cue-line" aria-hidden />
          <ChevronDown size={18} aria-hidden />
        </a>
      </section>

      {/* Seção de vitrine (foto + cartões flutuantes + números). Vem do design
          original (`LHero` em lit-hero.jsx) e estava faltando — o dono apontou
          "logo abaixo do vídeo temos uma imagem e sumiu". A ordem aqui é a
          mesma do design: vídeo → vitrine → esteiras de compatibilidade. */}
      <ClaroVitrine />

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
            <div>
              <div className="mono cl-mq-label">Plataformas de e-commerce em que somos especialistas</div>
              <div className="mq" aria-hidden="true">
                <div className="mq-t">{LOJA_NOMES.map((n) => <span className="mq-i" key={n}>{n}</span>)}</div>
                <div className="mq-t">{LOJA_NOMES.map((n) => <span className="mq-i" key={n + "-b"}>{n}</span>)}</div>
              </div>
            </div>
            <div>
              <div className="mono cl-mq-label">Canais, ERPs e ferramentas que operamos</div>
              <div className="mq rev" aria-hidden="true">
                <div className="mq-t">{ERP_NOMES.map((n) => <span className="mq-i" key={n}>{n}</span>)}</div>
                <div className="mq-t">{ERP_NOMES.map((n) => <span className="mq-i" key={n + "-b"}>{n}</span>)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

const CSS = `
  .cl-hero { position: relative; height: 100svh; min-height: 620px; overflow: hidden; background: #050B18; display: flex; align-items: center; }
  .cl-hero-bg { position: absolute; inset: 0; overflow: hidden; }

  /* poster como camada de fundo com zoom lento: o topo nunca fica estático
     esperando o vídeo baixar (mesmo mecanismo do .hv-poster do design) */
  .cl-hero-poster { position: absolute; inset: 0; background: url('/media/hero-v2-poster.webp') center 45% / cover no-repeat; animation: cl-hero-zoom 26s var(--ease) infinite alternate; }
  @keyframes cl-hero-zoom { from { transform: scale(1.02); } to { transform: scale(1.12); } }

  /* opacidade CHEIA — o .82 de antes lavava a imagem e lia como desfoque */
  .cl-hero-vid { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 45%; transition: opacity 1s ease; }

  /* fallback CSS quando o vídeo não carrega (mobile / reduced-motion / saveData) */
  .cl-hero-orb { position: absolute; border-radius: 50%; mix-blend-mode: screen; will-change: transform; }
  .cl-hero-orb-a { width: min(58vw,720px); height: min(58vw,720px); left: -12%; top: -16%; background: radial-gradient(circle at 42% 42%, rgba(91,60,255,.55), rgba(91,60,255,0) 70%); animation: cl-orb-a 22s ease-in-out infinite alternate; }
  .cl-hero-orb-b { width: min(46vw,560px); height: min(46vw,560px); right: -10%; top: 4%; background: radial-gradient(circle at 55% 45%, rgba(21,80,232,.5), rgba(21,80,232,0) 70%); animation: cl-orb-b 26s ease-in-out infinite alternate; }
  .cl-hero-orb-c { width: min(50vw,620px); height: min(50vw,620px); left: 16%; bottom: -26%; background: radial-gradient(circle at 50% 50%, rgba(224,22,95,.4), rgba(224,22,95,0) 72%); animation: cl-orb-c 30s ease-in-out infinite alternate; }
  @keyframes cl-orb-a { from { transform: translate(0,0) scale(1); } to { transform: translate(6%,4%) scale(1.08); } }
  @keyframes cl-orb-b { from { transform: translate(0,0) scale(1); } to { transform: translate(-5%,6%) scale(1.05); } }
  @keyframes cl-orb-c { from { transform: translate(0,0) scale(1); } to { transform: translate(4%,-5%) scale(1.1); } }

  /* scanline do design (.hv-scan). O grão animado NÃO voltou: ele pertence ao
     tema escuro do material original e, somado ao vídeo, lia como sujeira. */
  .cl-hero-scan { position: absolute; inset: 0; opacity: .2; mix-blend-mode: overlay; pointer-events: none; background: repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 1px, transparent 2px 4px); }

  .cl-hero-read { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(5,11,24,.86) 0%, rgba(5,11,24,.34) 26%, rgba(5,11,24,.2) 52%, rgba(5,11,24,.9) 100%), linear-gradient(96deg, rgba(5,11,24,.8), transparent 62%); }
  .cl-hero-in { position: relative; z-index: 6; width: 100%; }
  .cl-hero-copy { max-width: min(760px, 100%); }
  .cl-hero-eyebrow i { background: #FF5C93; box-shadow: 0 0 0 4px rgba(255,92,147,.18); }
  .cl-hero-h1 { margin: 0; font: 800 clamp(40px,7.4vw,84px)/1.03 var(--font-display); letter-spacing: -.045em; color: #fff; text-wrap: balance; text-shadow: 0 6px 44px rgba(0,0,0,.55); }
  /* tons CLAROS: o azul/rosa saturado da paleta some sobre vídeo escuro */
  .cl-hero-accent { background: linear-gradient(96deg, #7DA8FF, #B9A8FF 45%, #FF7AAA); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  .cl-hero-lead { font: 400 clamp(16px,1.5vw,20px)/1.6 var(--font-sans); color: rgba(255,255,255,.86); max-width: min(560px, 100%); margin: 20px 0 0; text-wrap: pretty; text-shadow: 0 2px 20px rgba(0,0,0,.5); }
  .cl-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 34px; }
  .cl-hero-cta { padding: 16px 28px; font-size: 16px; }
  /* BUG REAL (dono achou por print, 2026-08-07): texto quase ilegivel, azul
     em cima do video escuro em vez de branco. Causa: app/claro-tokens.css
     tem uma regra generica ".cl a" que pinta todo link de azul -- como
     seletor de tipo ("a") conta ponto de especificidade, ".cl a" (0,1,1)
     VENCE ".cl-hero-ghost" sozinho (0,1,0), mesmo este vindo depois no CSS.
     Os outros botoes (.btn-p, .btn-s...) ja nascem prefixados ".cl .btn-p"
     em claro-tokens.css exatamente por isso (0,2,0, vence de qualquer jeito)
     -- so este botao local do hero tinha ficado de fora do padrao. Mesmo
     prefixo aqui resolve. Sem crase neste comentario de proposito: ele mora
     dentro de um template literal e uma crase aqui FECHA a string. */
  .cl .cl-hero-ghost { padding: 16px 26px; font-size: 16px; background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.32); backdrop-filter: blur(10px); }
  .cl .cl-hero-ghost:hover { background: rgba(255,255,255,.2); color: #fff; transform: translateY(-2px); }
  .cl .cl-hero-ghost:focus-visible, .cl .cl-hero-cta:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

  .cl-hero-cue { position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 6; display: flex; flex-direction: column; align-items: center; gap: 8px; color: rgba(255,255,255,.7); transition: color .25s var(--ease); }
  .cl-hero-cue:hover { color: #fff; }
  .cl-hero-cue:focus-visible { outline: 2px solid #fff; outline-offset: 4px; border-radius: 8px; }
  .cl-hero-cue-line { width: 1px; height: 34px; background: linear-gradient(180deg, transparent, rgba(255,255,255,.6)); }

  .cl-hero-plat { padding-top: 78px; }
  .cl-hero-mqs { margin-top: 46px; display: flex; flex-direction: column; gap: 26px; }
  .cl-mq-label { color: var(--ink-3); text-align: center; margin-bottom: 16px; }

  @media (max-width: 760px) {
    .cl-hero { height: auto; min-height: 0; padding: 132px 0 72px; }
    .cl-hero-cue { display: none; }
    .cl-hero-read { background: linear-gradient(180deg, rgba(5,11,24,.6) 0%, rgba(5,11,24,.45) 45%, rgba(5,11,24,.95) 100%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .cl-hero-poster, .cl-hero-orb-a, .cl-hero-orb-b, .cl-hero-orb-c { animation: none; }
    .cl-hero-mqs .mq-t { animation: none !important; }
  }
`;

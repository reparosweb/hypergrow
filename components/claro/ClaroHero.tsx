"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { platformsOf } from "@/lib/ecommerce-platforms";
import { ClaroHead } from "./ClaroUI";

/* ─────────────────────────────────────────────────────────────────────────────
   HERO da rota /claro — vídeo fullscreen + faixa clara de compatibilidade.

   Vídeo: reaproveita `/media/launch.mp4` + `/media/launch-poster.webp` (poster
   em webp, não .png — o .png é 28× mais pesado, já trocado no site escuro por
   esse motivo) e o MESMO gate de performance do Hero de `HypergrowSite.tsx`:
   só baixa o vídeo (9 MB) em tela grande, sem `prefers-reduced-motion` e sem
   `navigator.connection.saveData`. Abaixo de 760px, ou com qualquer uma dessas
   duas preferências ligadas, mostra só o poster estático.

   Marquees: dados REAIS de `lib/ecommerce-platforms.ts` (PLATFORMS já
   conferido nesta sessão) — nada da lista antiga do mockup (Shopware, TikTok
   Ads, RD Station... nunca verificados como algo que a HyperGrow opera).
   Nenhuma métrica de empresa ("5+ anos", "200+ lojas", "7,4x ROAS") entra
   aqui — são números que não foram verificados, e essa seção não é o lugar
   responsável por prova social (isso é de outro arquivo, com placeholder
   explícito).
   ──────────────────────────────────────────────────────────────────────────── */

const LOJA_NOMES = platformsOf("loja").map((p) => p.name);
const ERP_NOMES = platformsOf("erp").map((p) => p.name);

export default function ClaroHero() {
  const vidRef = useRef<HTMLVideoElement>(null);
  const [vidOn, setVidOn] = useState(false);

  // Performance: vídeo só em telas grandes, sem economia de dados, sem reduced-motion.
  useEffect(() => {
    const small = window.matchMedia("(max-width: 760px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const save = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!small && !reduce && !save) setVidOn(true);
  }, []);

  // Loop nativo (atributo `loop`) — sem seek manual, que já causou stall/flicker no site escuro.
  useEffect(() => {
    if (!vidOn) return;
    const v = vidRef.current;
    if (!v) return;
    const play = () => { v.play().catch(() => {}); };
    v.addEventListener("loadedmetadata", play);
    v.addEventListener("canplay", play);
    if (v.readyState >= 2) play();
    return () => {
      v.removeEventListener("loadedmetadata", play);
      v.removeEventListener("canplay", play);
    };
  }, [vidOn]);

  return (
    <>
      <section id="top" className="cl-hero">
        <div className="cl-hero-media" aria-hidden="true">
          {vidOn ? (
            <video
              ref={vidRef}
              className="cl-hero-vid"
              poster="/media/launch-poster.webp"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src="/media/launch.mp4" type="video/mp4" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="cl-hero-vid"
              src="/media/launch-poster.webp"
              width={720}
              height={405}
              alt="Foguete em lançamento — HyperGrow, tecnologia e IA para crescimento de e-commerce"
              fetchPriority="high"
            />
          )}
        </div>

        <div className="cl-hero-read" aria-hidden="true" />
        <div className="cl-hero-brand" aria-hidden="true" />
        <div className="cl-hero-foot" aria-hidden="true" />

        <div className="wrap cl-hero-in">
          <div className="cl-hero-copy">
            <div className="eyebrow" style={{ marginBottom: 24, color: "rgba(255,255,255,.78)" }}>
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
              <a href="#diagnostico" className="btn btn-s" style={{ padding: "16px 26px", fontSize: 16 }}>
                <Play size={16} aria-hidden /> Fazer diagnóstico
              </a>
            </div>
          </div>
        </div>

        <div className="cl-hero-scroll" aria-hidden="true">
          <span className="cl-hero-scroll-track"><span className="cl-hero-scroll-dot" /></span>
        </div>
      </section>

      <section className="sec cl-hero-plat">
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
  .cl-hero-media { position: absolute; inset: 0; overflow: hidden; }
  .cl-hero-vid { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 45%; opacity: .85; }
  .cl-hero-read { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(5,11,26,.62) 0%, rgba(5,11,26,.30) 38%, rgba(5,11,26,.55) 72%, rgba(5,11,26,.96) 100%); }
  .cl-hero-brand { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen; background: radial-gradient(900px 620px at 6% 28%, rgba(15,169,104,.34), transparent 60%), radial-gradient(880px 600px at 96% 78%, rgba(196,118,60,.26), transparent 62%); }
  .cl-hero-foot { position: absolute; left: 0; right: 0; bottom: 0; height: 170px; pointer-events: none; background: linear-gradient(180deg, transparent, var(--paper)); }
  .cl-hero-in { position: relative; z-index: 6; height: 100%; display: flex; flex-direction: column; justify-content: center; }
  .cl-hero-copy { max-width: min(760px, 100%); }
  .cl-hero-h1 { margin: 0; font: 800 clamp(40px,7.4vw,84px)/1.03 var(--font-display); letter-spacing: -.045em; color: #fff; text-wrap: balance; text-shadow: 0 6px 44px rgba(0,0,0,.6); }
  .cl-hero-accent { background: linear-gradient(104deg, #6FE3B4 0%, #0B7A4C 46%, #D99461 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  .cl-hero-lead { font: 400 clamp(16px,1.5vw,20px)/1.6 var(--font-sans); color: rgba(255,255,255,.86); max-width: min(600px, 100%); margin: 22px 0 0; text-wrap: pretty; text-shadow: 0 2px 16px rgba(0,0,0,.6); }
  .cl-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 34px; }
  .cl-hero-scroll { position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 6; }
  .cl-hero-scroll-track { width: 22px; height: 36px; border: 1.5px solid rgba(255,255,255,.30); border-radius: 999px; display: flex; justify-content: center; padding-top: 6px; }
  .cl-hero-scroll-dot { width: 4px; height: 8px; border-radius: 999px; background: #6FBF9A; box-shadow: 0 0 8px #6FBF9A; animation: cl-hero-bob 1.6s ease-in-out infinite; }
  @keyframes cl-hero-bob { 0%,100% { transform: translateY(0); opacity: 1; } 60% { transform: translateY(12px); opacity: .2; } }

  .cl-hero-plat { padding-top: 78px; }
  .cl-hero-mqs { margin-top: 46px; display: flex; flex-direction: column; gap: 22px; }

  @media (max-width: 760px) {
    .cl-hero-vid { object-position: 50% 40%; }
    .cl-hero-read { background: linear-gradient(180deg, rgba(5,11,26,.5) 0%, rgba(5,11,26,.42) 45%, rgba(5,11,26,.97) 100%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .cl-hero-scroll-dot { animation: none; }
    .cl-hero-mqs .mq-t { animation: none !important; }
  }
`;

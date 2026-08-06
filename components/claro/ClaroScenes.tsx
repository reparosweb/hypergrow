import { Check, Eye, Heart, MessageCircle } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   CENAS — 4 demonstrações CSS ilustrativas, uma por pilar (reduzido de 6 no
   mockup original para os 4 pilares reais do site — SEO e CRM não têm cena
   própria porque já são serviços DENTRO do pilar "Vender", não pilares).

   Nenhuma cena afirma número real de resultado da empresa: os rótulos foram
   generalizados ("Estoque sincronizado", "Visualizações") em vez de
   estatística específica ("1.284 SKUs", "312 mil", "38s") — ajuste de
   honestidade pedido no briefing, para não parecer prova social real dentro
   de uma animação decorativa. Restaurado 2026-08-05: camadas visuais e
   microinterações do mockup original (cartão de produto em 3 camadas, wire
   Loja↔ERP, gotas ambiente no funil, pílulas de métrica com ícone, conversa
   completa com indicador de digitação) — mantendo essa mesma regra de nunca
   inventar número. Tamanhos fixos (não `aspect-ratio` esticado em grid full-
   width) de propósito: o card `.scn` tem altura travada
   (`min(420px,68vw)`) e `overflow:hidden` — um grid quadrado esticado
   estourava esse teto e era cortado em silêncio.

   Sem hooks aqui (puro CSS + markup) — por isso sem "use client"; quem
   monta/desmonta via `key` é o componente-pai (ClaroShow), que já é client.

   Cor: cada cena recebe `c` (hex do pilar) via prop e usa só `var(--c)` — sem
   nenhuma cor hardcoded aqui, então quem decide a cor é sempre quem chama
   (ClaroShow.tsx, hoje via components/claro/claroPillarAccent.ts).

   REVISÃO 2026-08-06: (a) duas animações mexiam em `top`/`left`, que
   recalculam layout a cada frame — viraram `translateY`/`translateX` com o
   MESMO percurso; (b) o quadro ganhou resposta ao mouse (levanta 3px e o
   brilho da cor do pilar cresce), já que o palco inteiro é hover-sensível;
   (c) abaixo de 560px o conteúdo do quadro estava sendo cortado em silêncio
   pelo `overflow:hidden` — corrigido com altura relativa maior e passo
   menor. Tudo desligado em `prefers-reduced-motion`.
   ──────────────────────────────────────────────────────────────────────────── */

type SceneProps = { c: string };

function cVar(c: string): React.CSSProperties {
  return { "--c": c } as React.CSSProperties;
}

export function SceneEcom({ c }: SceneProps) {
  return (
    <div className="scn scn-ecom" style={cVar(c)}>
      <div className="scn-hd"><span /><span /><span /><b>Loja virtual</b></div>
      <div className="scn-bd">
        <div className="scn-ecom-grid">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div className="scn-ecom-card" key={i} style={{ animationDelay: `${i * 0.14}s` }}>
              <span className="scn-ecom-card-img" />
              <span className="scn-ecom-card-line" />
              <span className="scn-ecom-card-bar" />
            </div>
          ))}
        </div>
        <div className="scn-ecom-sync">
          <span className="scn-ecom-pill">Loja</span>
          <span className="scn-ecom-wire"><i /></span>
          <span className="scn-ecom-pill">ERP</span>
        </div>
        <div className="scn-ecom-erp">
          <span className="scn-ecom-dot" />
          <span>Estoque sincronizado com o ERP</span>
        </div>
      </div>
    </div>
  );
}

export function SceneFunil({ c }: SceneProps) {
  return (
    <div className="scn scn-funil" style={cVar(c)}>
      <div className="scn-hd"><span /><span /><span /><b>Funil de vendas</b></div>
      <div className="scn-bd scn-funil-bd">
        <div className="scn-funil-drops" aria-hidden>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span key={i} style={{ left: `${8 + i * 13}%`, animationDelay: `${i * 0.34}s` }} />
          ))}
        </div>
        <div className="scn-funil-shape">
          <span className="scn-funil-ball" />
          <div className="scn-funil-stage" style={{ width: "100%", animationDelay: "0s" }} />
          <div className="scn-funil-stage" style={{ width: "82%", animationDelay: ".16s" }} />
          <div className="scn-funil-stage" style={{ width: "64%", animationDelay: ".32s" }} />
          <div className="scn-funil-stage" style={{ width: "46%", animationDelay: ".48s" }} />
        </div>
        <div className="scn-funil-out">
          <Check size={14} aria-hidden />
          <span>Venda concluída</span>
        </div>
      </div>
    </div>
  );
}

export function SceneSocial({ c }: SceneProps) {
  return (
    <div className="scn scn-social" style={cVar(c)}>
      <div className="scn-hd"><span /><span /><span /><b>Grade de conteúdo</b></div>
      <div className="scn-bd scn-social-bd">
        <div className="scn-social-grid">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div className="scn-social-cell" key={i}>
              <span className="scn-social-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
            </div>
          ))}
        </div>
        <div className="scn-social-metrics">
          <span className="scn-social-met" style={{ animationDelay: "1s" }}>
            <Eye size={14} aria-hidden /><span>Visualizações</span>
          </span>
          <span className="scn-social-met" style={{ animationDelay: "1.2s" }}>
            <Heart size={14} aria-hidden /><span>Curtidas</span>
          </span>
          <span className="scn-social-met" style={{ animationDelay: "1.4s" }}>
            <MessageCircle size={14} aria-hidden /><span>Comentários</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function SceneChat({ c }: SceneProps) {
  return (
    <div className="scn scn-chat" style={cVar(c)}>
      <div className="scn-hd"><span /><span /><span /><b>Atendimento</b></div>
      <div className="scn-bd scn-chat-bd">
        <div className="scn-chat-msg scn-chat-in" style={{ animationDelay: ".2s" }}>
          <span>Oi, ainda tem esse produto disponível?</span>
        </div>
        <div className="scn-chat-msg scn-chat-out" style={{ animationDelay: "1s" }}>
          <span>Temos sim! Posso já deixar reservado pra você?</span>
        </div>
        <div className="scn-chat-msg scn-chat-typing" style={{ animationDelay: "1.9s" }}>
          <span className="scn-chat-dot" /><span className="scn-chat-dot" /><span className="scn-chat-dot" />
        </div>
        <div className="scn-chat-msg scn-chat-out" style={{ animationDelay: "2.6s" }}>
          <Check size={14} aria-hidden /><span>Reservado. Link de pagamento enviado.</span>
        </div>
      </div>
    </div>
  );
}

/* CSS compartilhado das 4 cenas + o frame comum (`.scn`). Exportado como
   string para o componente-pai injetar UMA vez via
   `<style dangerouslySetInnerHTML>` (evita repetir o bloco no DOM a cada
   troca de cena, já que só uma fica montada por vez). `color-mix(in srgb,
   var(--c) X%, white)` é sempre relativo à cor recebida por prop — nunca há
   azul/violeta hardcoded em nenhuma regra abaixo. */
export const SCENE_CSS = `
  .scn { position: relative; border-radius: 22px; border: 1px solid var(--line); background: #fff; box-shadow: 0 30px 70px -34px color-mix(in srgb, var(--c) 45%, transparent), var(--sh-3); overflow: hidden; height: min(420px, 68vw); transition: transform .4s var(--ease), box-shadow .4s var(--ease); }
  .scn:hover { transform: translateY(-3px); box-shadow: 0 38px 80px -34px color-mix(in srgb, var(--c) 52%, transparent), var(--sh-3); }
  .scn-hd { display: flex; align-items: center; gap: 7px; padding: 14px 16px; border-bottom: 1px solid var(--line-2); }
  .scn-hd span { width: 9px; height: 9px; border-radius: 99px; background: var(--line); transition: background .3s var(--ease); }
  .scn:hover .scn-hd span:first-child { background: color-mix(in srgb, var(--c) 55%, white); }
  .scn-hd b { margin-left: 8px; font: 600 12.5px var(--text); color: var(--ink-3); }
  .scn-bd { position: relative; height: calc(100% - 47px); padding: 22px; }

  .scn-ecom-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .scn-ecom-card { border-radius: 11px; border: 1px solid var(--line-2); padding: 7px; opacity: 0; transform: translateY(14px); animation: scn-in .6s cubic-bezier(.2,.6,.2,1) forwards; }
  @keyframes scn-in { to { opacity: 1; transform: none; } }
  .scn-ecom-card-img { display: block; height: 34px; border-radius: 7px; background: linear-gradient(120deg, color-mix(in srgb, var(--c) 16%, white), var(--paper-2)); }
  .scn-ecom-card-line { display: block; height: 6px; border-radius: 99px; background: var(--line-2); margin-top: 8px; }
  .scn-ecom-card-bar { display: block; height: 6px; width: 55%; border-radius: 99px; background: color-mix(in srgb, var(--c) 45%, white); margin-top: 5px; }
  .scn-ecom-sync { margin-top: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .scn-ecom-pill { font: 600 12px var(--text); color: var(--ink); background: #fff; border: 1px solid var(--line); border-radius: 99px; padding: 5px 12px; box-shadow: var(--sh-1); }
  .scn-ecom-wire { position: relative; width: 76px; height: 2px; background: var(--line); border-radius: 99px; overflow: hidden; }
  /* translateX (não \`left\`): \`left\` recalcula layout a cada frame — regra de
     performance da casa é animar só transform/opacity. O elemento tem 30% da
     largura do fio, então 466% dele = os mesmos 140% de percurso de antes. */
  .scn-ecom-wire i { position: absolute; top: 0; left: -30%; width: 30%; height: 100%; background: var(--c); animation: scn-wire 1.5s linear infinite; }
  @keyframes scn-wire { from { transform: translateX(0); } to { transform: translateX(466%); } }
  .scn-ecom-erp { margin-top: 10px; display: flex; align-items: center; gap: 10px; padding: 10px 13px; border-radius: 12px; background: var(--paper-2); border: 1px solid var(--line-2); }
  .scn-ecom-dot { width: 8px; height: 8px; border-radius: 99px; background: var(--c); flex-shrink: 0; animation: scn-pulse 1.8s ease-in-out infinite; }
  @keyframes scn-pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
  .scn-ecom-erp span:last-child { font: 500 13px var(--text); color: var(--ink-2); }

  .scn-funil-bd { display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .scn-funil-drops { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .scn-funil-drops span { position: absolute; top: 4%; width: 6px; height: 6px; border-radius: 99px; background: var(--c); opacity: .5; animation: scn-drop 2.6s linear infinite; }
  @keyframes scn-drop { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: .55; } 100% { transform: translateY(230px); opacity: 0; } }
  .scn-funil-shape { position: relative; width: min(260px, 80%); display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .scn-funil-stage { width: 100%; height: 34px; border-radius: 8px; background: linear-gradient(90deg, color-mix(in srgb, var(--c) 22%, white), color-mix(in srgb, var(--c) 8%, white)); border: 1px solid color-mix(in srgb, var(--c) 30%, white); opacity: 0; transform: translateY(-8px) scaleX(.94); animation: scn-flin .6s cubic-bezier(.2,.6,.2,1) forwards; }
  @keyframes scn-flin { to { opacity: 1; transform: none; } }
  /* idem: era \`top: -4px → 154px\` (layout por frame); agora o mesmo percurso
     de 158px em translateY, que o compositor resolve sozinho. */
  .scn-funil-ball { position: absolute; top: -4px; left: 50%; width: 14px; height: 14px; margin-left: -7px; border-radius: 99px; background: var(--c); box-shadow: 0 0 0 5px color-mix(in srgb, var(--c) 22%, transparent); animation: scn-fall 2.8s ease-in-out infinite; z-index: 2; }
  @keyframes scn-fall { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } 88% { transform: translateY(158px); opacity: 1; } 100% { transform: translateY(158px); opacity: 0; } }
  .scn-funil-out { margin-top: 22px; display: flex; align-items: center; gap: 9px; padding: 10px 16px; border-radius: 99px; background: color-mix(in srgb, var(--c) 12%, white); border: 1px solid color-mix(in srgb, var(--c) 30%, white); color: var(--ink); font: 500 13.5px var(--text); }
  .scn-funil-out svg { color: var(--c); flex-shrink: 0; }

  .scn-social-grid { display: grid; grid-template-columns: repeat(3, 60px); gap: 8px; justify-content: center; }
  .scn-social-cell { position: relative; aspect-ratio: 1; border-radius: 11px; background: var(--paper-2); border: 1px solid var(--line-2); overflow: hidden; }
  .scn-social-pulse { position: absolute; inset: 0; background: linear-gradient(140deg, color-mix(in srgb, var(--c) 30%, white), color-mix(in srgb, var(--c) 6%, white)); opacity: 0; animation: scn-post 4.2s ease-in-out infinite; }
  @keyframes scn-post { 0%, 88%, 100% { opacity: 0; } 92%, 96% { opacity: 1; } }
  .scn-social-metrics { margin-top: 18px; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
  .scn-social-met { display: inline-flex; align-items: center; gap: 7px; background: #fff; border: 1px solid var(--line); border-radius: 99px; padding: 7px 12px; font: 600 12.5px var(--text); color: var(--ink); box-shadow: var(--sh-1); opacity: 0; animation: scn-pop .5s cubic-bezier(.2,.6,.2,1) forwards; }
  .scn-social-met svg { color: var(--c); flex-shrink: 0; }

  .scn-chat-bd { display: flex; flex-direction: column; justify-content: center; gap: 12px; }
  .scn-chat-msg { max-width: 82%; padding: 11px 14px; border-radius: 16px; font: 500 13.5px/1.4 var(--text); display: flex; align-items: center; gap: 8px; opacity: 0; animation: scn-pop .45s cubic-bezier(.2,.6,.2,1) forwards; }
  .scn-chat-in { align-self: flex-start; background: var(--paper-2); border: 1px solid var(--line-2); color: var(--ink); border-bottom-left-radius: 5px; }
  .scn-chat-out { align-self: flex-end; background: var(--c); color: #fff; border-bottom-right-radius: 5px; }
  .scn-chat-out svg { flex-shrink: 0; }
  .scn-chat-typing { align-self: flex-end; display: inline-flex; gap: 4px; background: #fff; border: 1px solid var(--line); border-radius: 99px; padding: 10px 13px; max-width: none; }
  .scn-chat-typing .scn-chat-dot { width: 5px; height: 5px; border-radius: 99px; background: var(--ink-3); display: inline-block; animation: scn-typing 1s ease-in-out infinite; }
  .scn-chat-typing .scn-chat-dot:nth-child(2) { animation-delay: .15s; }
  .scn-chat-typing .scn-chat-dot:nth-child(3) { animation-delay: .3s; }
  @keyframes scn-typing { 0%,60%,100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
  @keyframes scn-pop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

  /* No celular o quadro encolhe (68vw ≈ 265px a 390px de largura) mas o
     conteúdo não encolhia junto: a última mensagem do chat e a 3ª linha da
     grade de conteúdo caíam fora do \`overflow:hidden\` e sumiam sem aviso.
     Aqui o quadro ganha altura relativa maior e o conteúdo aperta o passo. */
  @media (max-width: 560px) {
    .scn { height: min(420px, 86vw); }
    .scn-bd { padding: 16px; }
    .scn-ecom-grid { gap: 8px; }
    .scn-ecom-card-img { height: 30px; }
    .scn-chat-bd { gap: 9px; }
    .scn-chat-msg { font-size: 12.5px; padding: 9px 12px; max-width: 88%; }
    .scn-social-grid { grid-template-columns: repeat(3, 52px); gap: 7px; }
    .scn-social-metrics { margin-top: 12px; gap: 6px; }
    .scn-social-met { padding: 6px 10px; font-size: 12px; }
    .scn-funil-out { margin-top: 16px; padding: 9px 14px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .scn, .scn * { animation: none !important; opacity: 1 !important; transform: none !important; }
  }
`;

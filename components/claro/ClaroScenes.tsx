import { Check } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   CENAS — 4 demonstrações CSS ilustrativas, uma por pilar (reduzido de 6 no
   mockup original para os 4 pilares reais do site — SEO e CRM não têm cena
   própria porque já são serviços DENTRO do pilar "Vender", não pilares).

   Nenhuma cena afirma número real de resultado da empresa: os rótulos foram
   generalizados ("Estoque sincronizado", "Resolvido automaticamente") em vez
   de estatística específica ("1.284 SKUs", "38s") — ajuste de honestidade
   pedido no briefing, para não parecer prova social real dentro de uma
   animação decorativa.

   Sem hooks aqui (puro CSS + markup) — por isso sem "use client"; quem
   monta/desmonta via `key` é o componente-pai (ClaroShow), que já é client.

   Cor: cada cena recebe `c` (hex do pilar) via prop e usa só `var(--c)` — sem
   nenhuma cor hardcoded, então nunca pode reintroduzir azul/violeta aqui.
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
            <div className="scn-ecom-card" key={i} style={{ animationDelay: `${i * 0.14}s` }} />
          ))}
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
        <div className="scn-funil-shape">
          <span className="scn-funil-ball" />
          <div className="scn-funil-stage" style={{ width: "100%" }} />
          <div className="scn-funil-stage" style={{ width: "72%" }} />
          <div className="scn-funil-stage" style={{ width: "44%" }} />
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
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div className="scn-social-cell" key={i}>
              <span className="scn-social-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
            </div>
          ))}
        </div>
        <div className="scn-social-bar">
          <span>Alcance</span>
          <div className="scn-social-track"><div className="scn-social-fill" /></div>
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
        <div className="scn-chat-msg scn-chat-in">
          <span className="scn-chat-dot" /><span className="scn-chat-dot" /><span className="scn-chat-dot" />
        </div>
        <div className="scn-chat-msg scn-chat-out">
          <Check size={14} aria-hidden /><span>Resolvido automaticamente</span>
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
  .scn { position: relative; border-radius: 22px; border: 1px solid var(--line); background: #fff; box-shadow: var(--sh-3); overflow: hidden; height: min(420px, 68vw); }
  .scn-hd { display: flex; align-items: center; gap: 7px; padding: 14px 16px; border-bottom: 1px solid var(--line-2); }
  .scn-hd span { width: 9px; height: 9px; border-radius: 99px; background: var(--line); }
  .scn-hd b { margin-left: 8px; font: 600 12.5px var(--text); color: var(--ink-3); }
  .scn-bd { position: relative; height: calc(100% - 47px); padding: 22px; }

  .scn-ecom-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .scn-ecom-card { aspect-ratio: 1; border-radius: 12px; background: linear-gradient(140deg, color-mix(in srgb, var(--c) 16%, white), color-mix(in srgb, var(--c) 4%, white)); border: 1px solid color-mix(in srgb, var(--c) 30%, white); opacity: 0; transform: translateY(14px); animation: scn-in .6s cubic-bezier(.2,.6,.2,1) forwards; }
  @keyframes scn-in { to { opacity: 1; transform: none; } }
  .scn-ecom-erp { margin-top: 20px; display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 12px; background: var(--paper-2); border: 1px solid var(--line-2); }
  .scn-ecom-dot { width: 8px; height: 8px; border-radius: 99px; background: var(--c); flex-shrink: 0; animation: scn-pulse 1.8s ease-in-out infinite; }
  @keyframes scn-pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
  .scn-ecom-erp span:last-child { font: 500 13px var(--text); color: var(--ink-2); }

  .scn-funil-bd { display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .scn-funil-shape { position: relative; width: min(260px, 80%); display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .scn-funil-stage { width: 100%; height: 34px; border-radius: 8px; background: linear-gradient(90deg, color-mix(in srgb, var(--c) 22%, white), color-mix(in srgb, var(--c) 8%, white)); border: 1px solid color-mix(in srgb, var(--c) 30%, white); }
  .scn-funil-ball { position: absolute; top: -4px; left: 50%; width: 14px; height: 14px; margin-left: -7px; border-radius: 99px; background: var(--c); box-shadow: 0 0 0 5px color-mix(in srgb, var(--c) 22%, transparent); animation: scn-fall 2.6s ease-in-out infinite; z-index: 2; }
  @keyframes scn-fall { 0% { top: -4px; opacity: 0; } 10% { opacity: 1; } 88% { top: 116px; opacity: 1; } 100% { top: 116px; opacity: 0; } }
  .scn-funil-out { margin-top: 26px; display: flex; align-items: center; gap: 9px; padding: 10px 16px; border-radius: 99px; background: color-mix(in srgb, var(--c) 12%, white); border: 1px solid color-mix(in srgb, var(--c) 30%, white); color: var(--ink); font: 500 13.5px var(--text); }
  .scn-funil-out svg { color: var(--c); flex-shrink: 0; }

  .scn-social-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .scn-social-cell { position: relative; aspect-ratio: 1; border-radius: 12px; background: var(--paper-2); border: 1px solid var(--line-2); overflow: hidden; }
  .scn-social-pulse { position: absolute; inset: 0; background: linear-gradient(140deg, color-mix(in srgb, var(--c) 30%, white), color-mix(in srgb, var(--c) 6%, white)); opacity: 0; animation: scn-post 4.2s ease-in-out infinite; }
  @keyframes scn-post { 0%, 88%, 100% { opacity: 0; } 92%, 96% { opacity: 1; } }
  .scn-social-bar { margin-top: 22px; display: flex; align-items: center; gap: 12px; }
  .scn-social-bar span { font: 500 12.5px var(--text); color: var(--ink-3); flex-shrink: 0; }
  .scn-social-track { flex: 1; height: 8px; border-radius: 99px; background: var(--paper-2); overflow: hidden; }
  .scn-social-fill { height: 100%; width: 30%; border-radius: 99px; background: linear-gradient(90deg, var(--c), color-mix(in srgb, var(--c) 60%, white)); animation: scn-grow 3.6s ease-in-out infinite alternate; }
  @keyframes scn-grow { to { width: 78%; } }

  .scn-chat-bd { display: flex; flex-direction: column; justify-content: center; gap: 14px; }
  .scn-chat-msg { max-width: 78%; padding: 12px 15px; border-radius: 16px; font: 500 13.5px var(--text); display: flex; align-items: center; gap: 8px; opacity: 0; animation: scn-pop .5s cubic-bezier(.2,.6,.2,1) forwards; }
  .scn-chat-in { align-self: flex-start; background: var(--paper-2); border: 1px solid var(--line-2); border-bottom-left-radius: 5px; animation-delay: .2s; }
  .scn-chat-in .scn-chat-dot { width: 6px; height: 6px; border-radius: 99px; background: var(--ink-3); display: inline-block; animation: scn-typing 1.1s ease-in-out infinite; }
  .scn-chat-in .scn-chat-dot:nth-child(2) { animation-delay: .15s; }
  .scn-chat-in .scn-chat-dot:nth-child(3) { animation-delay: .3s; }
  @keyframes scn-typing { 0%,60%,100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
  .scn-chat-out { align-self: flex-end; background: var(--c); color: #12151A; border-bottom-right-radius: 5px; animation-delay: 1.3s; }
  @keyframes scn-pop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

  @media (prefers-reduced-motion: reduce) {
    .scn * { animation: none !important; opacity: 1 !important; transform: none !important; }
  }
`;

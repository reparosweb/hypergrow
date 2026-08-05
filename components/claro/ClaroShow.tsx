"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Bot, Palette, ShoppingCart, TrendingUp, type LucideIcon } from "lucide-react";
import { PILLARS, type PillarKey } from "@/lib/pillars";
import { ClaroHead } from "./ClaroUI";
import { SCENE_CSS, SceneChat, SceneEcom, SceneFunil, SceneSocial } from "./ClaroScenes";
import { CLARO_PILLAR_ACCENT } from "./claroPillarAccent";

/* ─────────────────────────────────────────────────────────────────────────────
   "Soluções em ação" — carrossel de 4 itens (um por pilar real, reduzido dos
   6 "departamentos" fictícios do mockup). Rail de botões à esquerda, palco
   com a cena correspondente à direita; troca sozinho a cada ~5,6s, pausa no
   hover, clique troca na hora.

   Título/descrição de cada item = `pillar.label`/`pillar.desc`, JÁ escritos e
   aprovados em `lib/pillars.ts` — reaproveitados literalmente, sem reescrever.

   Ícone de pilar: mesmo motivo do ClaroNav — `ClaroServiceIcon` não cobre
   "shopping-cart"/"trending-up" (só ícone de SERVIÇO), então os 4 ficam num
   Record fechado com import nomeado direto do lucide.
   ──────────────────────────────────────────────────────────────────────────── */

const PILLAR_ICON: Record<PillarKey, LucideIcon> = {
  vender: ShoppingCart,
  atrair: TrendingUp,
  marca: Palette,
  ia: Bot,
};

const SCENE_BY_KEY: Record<PillarKey, (props: { c: string }) => JSX.Element> = {
  vender: SceneEcom,
  atrair: SceneFunil,
  marca: SceneSocial,
  ia: SceneChat,
};

const ITEMS = (["vender", "atrair", "marca", "ia"] as PillarKey[]).map((key) => {
  const pillar = PILLARS.find((p) => p.key === key)!;
  return { pillar, Scene: SCENE_BY_KEY[key] };
});

const AUTO_MS = 5600;

export default function ClaroShow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-avança; reinicia a contagem a cada clique manual (mesmo padrão do mockup).
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((i) => (i + 1) % ITEMS.length), AUTO_MS);
    return () => clearInterval(t);
  }, [paused, active]);

  const cur = ITEMS[active];
  const Scene = cur.Scene;

  return (
    <section id="mostra" className="sec alt">
      <div className="wrap">
        <ClaroHead
          center
          eyebrow="Soluções em ação"
          sub="Quatro frentes reais, cada uma resolvendo uma parte diferente da operação — veja o que cada uma faz."
        >
          Um sistema, <span className="grad">não seis fornecedores</span>
        </ClaroHead>

        <div className="shw rv" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="shw-rail" role="tablist" aria-label="Soluções por frente">
            {ITEMS.map((it, i) => {
              const Icon = PILLAR_ICON[it.pillar.key];
              const cor = CLARO_PILLAR_ACCENT[it.pillar.key];
              const on = i === active;
              return (
                <button
                  key={it.pillar.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className={"shw-btn lit" + (on ? " on" : "")}
                  style={{
                    ["--beam" as string]: cor,
                    borderColor: on ? cor + "55" : "var(--line)",
                    background: on ? cor + "0d" : "#fff",
                  }}
                  onClick={() => setActive(i)}
                >
                  <span
                    className="shw-ic glow"
                    style={
                      on
                        ? { color: "#fff", background: cor, borderColor: cor, boxShadow: `0 10px 24px -10px ${cor}` }
                        : { color: cor, background: cor + "14", borderColor: cor + "30" }
                    }
                  >
                    <Icon size={18} aria-hidden />
                  </span>
                  <span className="shw-tx">
                    <b className="glow-t" style={{ color: on ? cor : "var(--ink)" }}>{it.pillar.label}</b>
                    <span className={"shw-desc" + (on ? " on" : "")}>{it.pillar.desc}</span>
                  </span>
                  {on && (
                    <span
                      className="shw-prog"
                      style={{ background: cor, animation: paused ? "none" : `shwfill ${AUTO_MS}ms linear` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="shw-stage">
            <div
              className="shw-halo"
              aria-hidden
              style={{ background: `radial-gradient(70% 60% at 78% 12%, ${CLARO_PILLAR_ACCENT[cur.pillar.key]}1c, transparent 62%)` }}
            />
            <div className="shw-scene" key={cur.pillar.key}>
              <Scene c={CLARO_PILLAR_ACCENT[cur.pillar.key]} />
            </div>
            <div className="shw-foot">
              <span className="mono" style={{ color: CLARO_PILLAR_ACCENT[cur.pillar.key] }}>
                {String(active + 1).padStart(2, "0")} / {String(ITEMS.length).padStart(2, "0")}
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

const STAGE_CSS = `
  .shw { display: grid; grid-template-columns: .86fr 1.14fr; gap: 30px; margin-top: 40px; align-items: center; }
  .shw-rail { display: flex; flex-direction: column; gap: 10px; }
  .shw-btn { position: relative; overflow: hidden; display: flex; align-items: center; gap: 13px; text-align: left; padding: 15px 16px; border-radius: 16px; border: 1px solid var(--line); background: #fff; box-shadow: var(--sh-1); transition: border-color .26s var(--ease), background .26s var(--ease), box-shadow .26s var(--ease), transform .26s var(--ease); }
  .shw-btn:hover { border-color: #C9CFC5; transform: translateX(3px); box-shadow: var(--sh-2); }
  .shw-btn.on { box-shadow: var(--sh-2); }
  .shw-ic { flex-shrink: 0; width: 42px; height: 42px; border-radius: 12px; border: 1px solid; display: inline-flex; align-items: center; justify-content: center; }
  .shw-tx { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 0; }
  .shw-tx b { display: block; font: 600 15px var(--text); color: var(--ink); transition: color .3s var(--ease); }
  .shw-tx span.shw-desc { display: block; font: 400 13px/1.4 var(--text); color: var(--ink-3); max-height: 0; opacity: 0; margin-top: 0; overflow: hidden; transition: max-height .38s var(--ease), opacity .38s var(--ease), margin-top .38s var(--ease); }
  .shw-tx span.shw-desc.on { max-height: 44px; opacity: 1; margin-top: 4px; }
  .shw-prog { position: absolute; left: 0; bottom: 0; height: 2px; width: 0; }
  @keyframes shwfill { from { width: 0; } to { width: 100%; } }
  .shw-stage { position: relative; }
  .shw-halo { position: absolute; inset: -36px; z-index: 0; pointer-events: none; border-radius: 34px; transition: background .8s ease; }
  .shw-halo::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(color-mix(in srgb, var(--ink) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--ink) 6%, transparent) 1px, transparent 1px); background-size: 34px 34px; -webkit-mask-image: radial-gradient(70% 70% at 50% 40%, #000 30%, transparent 78%); mask-image: radial-gradient(70% 70% at 50% 40%, #000 30%, transparent 78%); }
  .shw-scene { position: relative; z-index: 1; animation: shwin .55s var(--ease); }
  @keyframes shwin { from { opacity: 0; transform: scale(.985); } }
  .shw-foot { position: relative; z-index: 1; margin-top: 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .shw-cta { padding: 11px 17px; font-size: 14px; }
  @media (max-width: 900px) { .shw { grid-template-columns: 1fr; } .shw-tx span.shw-desc { max-height: 44px !important; opacity: 1 !important; margin-top: 4px !important; } }
`;

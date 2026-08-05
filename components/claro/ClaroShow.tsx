"use client";

import { useEffect, useState } from "react";
import { Bot, Palette, ShoppingCart, TrendingUp, type LucideIcon } from "lucide-react";
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
                  className={"shw-btn" + (on ? " on" : "")}
                  style={on ? { borderColor: cor, background: cor + "0F" } : {}}
                  onClick={() => setActive(i)}
                >
                  <span
                    className="shw-ic"
                    style={{ color: cor, background: cor + "14", borderColor: cor + "30" }}
                  >
                    <Icon size={18} aria-hidden />
                  </span>
                  <span className="shw-tx">
                    <b>{it.pillar.label}</b>
                    <span>{it.pillar.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="shw-stage">
            <Scene c={CLARO_PILLAR_ACCENT[cur.pillar.key]} key={cur.pillar.key} />
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
  .shw-btn { display: flex; align-items: center; gap: 13px; text-align: left; padding: 15px 16px; border-radius: 16px; border: 1px solid var(--line); background: #fff; transition: border-color .26s var(--ease), background .26s var(--ease), box-shadow .26s var(--ease), transform .26s var(--ease); }
  .shw-btn:hover { border-color: #C9CFC5; transform: translateX(3px); }
  .shw-btn.on { box-shadow: var(--sh-2); }
  .shw-ic { flex-shrink: 0; width: 42px; height: 42px; border-radius: 12px; border: 1px solid; display: inline-flex; align-items: center; justify-content: center; }
  .shw-tx { display: flex; flex-direction: column; gap: 3px; }
  .shw-tx b { font: 600 15px var(--text); color: var(--ink); }
  .shw-tx span { font: 400 13px/1.4 var(--text); color: var(--ink-3); }
  .shw-stage { position: relative; }
  @media (max-width: 900px) { .shw { grid-template-columns: 1fr; } }
`;

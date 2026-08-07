import { Eye, Heart, MessageCircle } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   NÚMEROS DESTAS CENAS = ILUSTRAÇÃO DE INTERFACE, NÃO DADO DE CLIENTE.

   Todo número aqui veio do mockup (projeto Claude Design "Hypergrow",
   lit-scenes.jsx) e nunca foi medido numa operação real. Em 2026-08-06, ao
   remover os números inventados do resto da home, estas cenas foram
   reavaliadas e a decisão foi DIFERENTE das outras seções, de propósito:

   · Nas outras seções o número aparecia como AFIRMAÇÃO da HyperGrow
     ("7,4x ROAS médio alcançado") — isso era mentira e saiu.
   · Aqui o número é parte do DESENHO de uma tela: são miniaturas animadas de
     painel, chat e kanban, e uma tela de painel sem nenhum número dentro não
     lê como painel, lê como caixa vazia. Esvaziar mataria a seção, que é
     justamente a que dá vida à página.

   As duas salvaguardas que tornam isso honesto, e que NÃO podem sair:
   1. `ClaroShow.tsx` exibe uma legenda visível dizendo que são ilustrações de
      interface, não resultado de cliente — mesmo padrão da legenda que
      `ClaroCaptura.tsx` já usa para o vídeo da SpaceX.
   2. Nenhum número daqui pode se repetir como AFIRMAÇÃO em outra seção. Foi o
      que acontecia com "ROAS 7,4": aparecia na cena E como estatística da
      empresa, e um reforçava o outro como se fosse dado real. A estatística
      saiu; a cena trocou para uma métrica de interface neutra.
   ──────────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────────
   CENAS — as SEIS demonstrações CSS do palco "Veja o trabalho acontecendo".

   HISTÓRICO: uma revisão anterior portou só QUATRO (uma por pilar) e cortou
   SceneSEO e SceneCRM por conta própria. Foi erro meu, apontado pelo dono:
   "temos 6 cards que têm efeitos e você só incluiu 4". As seis estão de volta,
   com a mesma marcação e o mesmo CSS do design.

   As 6 não são "departamentos fictícios": cada uma corresponde a serviços que
   já existem em lib/pillars.ts —
     ecom → loja-virtual / consultoria-ecommerce   (pilar Vender)
     pres → seo                                     (pilar Vender)
     aqui → marketing-trafego                       (pilar Atrair)
     auto → automacoes-ia                           (pilar IA)
     cont → redes-sociais / producao-de-video       (pilar Marca)
     estr → crm-com-ia / sdr-com-ia                 (pilar IA)
   O agrupamento por PILAR continua sendo o da seção seguinte (ClaroSolucoes);
   aqui o recorte é por CENA — é o que dá as 6 animações.

   Sem hooks (puro CSS + markup) — por isso sem "use client"; quem monta e
   desmonta via `key` é o pai (ClaroShow), que já é client component.

   Cor: cada cena recebe `c` (hex do item) por prop e só usa `var(--c)`. Nenhum
   hex de marca é escrito aqui — quem decide a cor é sempre quem chama.

   PERFORMANCE (regra da casa, mantida do que já havia sido ganho): animação só
   de `transform`/`opacity`. O fio Loja↔ERP do design animava `left`, que
   recalcula layout a cada quadro — aqui virou `translateX` com o MESMO
   percurso. Nada de `filter: blur()`. Tudo desligado em
   `prefers-reduced-motion`.
   ──────────────────────────────────────────────────────────────────────────── */

type SceneProps = { c: string };

function cVar(c: string): React.CSSProperties {
  return { "--c": c } as React.CSSProperties;
}

/* 1 · E-COMMERCE & OPERAÇÃO — produto entrando na loja e o estoque batendo. */
export function SceneEcom({ c }: SceneProps) {
  return (
    <div className="st" style={cVar(c)}>
      <div className="st-win" aria-hidden>
        <div className="st-bar"><i /><i /><i /></div>
        <div className="st-prods">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div className="st-prod" key={i} style={{ animationDelay: `${i * 0.22}s` }}>
              <b /><em /><u />
            </div>
          ))}
        </div>
      </div>
      <div className="st-sync">
        <span className="st-pill">Loja</span>
        <span className="st-wire" aria-hidden><i /></span>
        <span className="st-pill">ERP</span>
      </div>
      <div className="st-tag st-tag-ok">Estoque sincronizado · 1.284 SKUs</div>
    </div>
  );
}

/* 2 · PRESENÇA & AUTORIDADE — a marca escalando até a primeira posição. */
export function SceneSEO({ c }: SceneProps) {
  const linhas = ["Sua marca", "Concorrente A", "Concorrente B", "Concorrente C"];
  return (
    <div className="st" style={cVar(c)}>
      <div className="st-rank">
        {linhas.map((nome, i) => (
          <div
            className={"st-row" + (i === 0 ? " me" : "")}
            key={nome}
            style={{ animationDelay: `${i * 0.18}s` }}
          >
            <b aria-hidden>{i + 1}</b>
            <span>{nome}</span>
            {i === 0 && <em>+21 posições</em>}
          </div>
        ))}
      </div>
      <div className="st-bars" aria-hidden>
        {[38, 62, 84, 100].map((h, i) => (
          <span
            key={h}
            style={{ ["--h" as string]: `${h}%`, animationDelay: `${i * 0.16}s` } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="st-tag st-tag-ok">Tráfego orgânico +186%</div>
    </div>
  );
}

/* 3 · AQUISIÇÃO PAGA — cliques entrando no funil e saindo como venda. */
const FUNIL: [string, string][] = [
  ["Impressões", "184.320"],
  ["Cliques", "9.412"],
  ["Leads", "1.106"],
  ["Vendas", "287"],
];

export function SceneFunil({ c }: SceneProps) {
  return (
    <div className="st" style={cVar(c)}>
      <div className="st-drops" aria-hidden>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <span key={i} style={{ left: `${8 + i * 13}%`, animationDelay: `${i * 0.34}s` }} />
        ))}
      </div>
      <div className="st-funnel">
        {FUNIL.map(([etapa, valor], i) => (
          <div
            className="st-fl"
            key={etapa}
            /* larguras 100 / 83 / 66 / 49% — o afunilamento do design */
            style={{ width: `${100 - i * 17}%`, animationDelay: `${i * 0.16}s` }}
          >
            <b>{etapa}</b>
            <em>{valor}</em>
          </div>
        ))}
      </div>
      {/* NÃO reintroduzir "ROAS 7,4" aqui: era o mesmo número que a home
          afirmava como estatística da empresa (removida em 2026-08-06 por ser
          inventada). Repetir o número nos dois lugares fazia um validar o
          outro. Rótulo de painel, sem valor de resultado. */}
      <div className="st-tag st-tag-ok">Campanha ativa · otimizando</div>
    </div>
  );
}

/* 4 · AUTOMAÇÃO & IA — uma conversa que se resolve sozinha às 22h47. */
export function SceneChat({ c }: SceneProps) {
  return (
    <div className="st" style={cVar(c)}>
      <div className="st-chat">
        <div className="st-b in" style={{ animationDelay: ".2s" }}>Oi, ainda tem o kit em estoque?</div>
        <div className="st-b out" style={{ animationDelay: "1s" }}>Temos sim, 6 unidades. Quer que eu já reserve no seu nome?</div>
        <div className="st-b in" style={{ animationDelay: "1.9s" }}>Quero!</div>
        <div className="st-typing" style={{ animationDelay: "2.5s" }} aria-hidden><i /><i /><i /></div>
        <div className="st-b out" style={{ animationDelay: "3.2s" }}>Reservado. Link de pagamento enviado.</div>
      </div>
      <div className="st-tag st-tag-ok">Respondido em 38 s · 22h47</div>
    </div>
  );
}

/* 5 · CONTEÚDO & MÍDIA — publicação no ar e o engajamento subindo. */
export function SceneSocial({ c }: SceneProps) {
  return (
    <div className="st" style={cVar(c)}>
      <div className="st-grid9" aria-hidden>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <div className="st-metrics">
        <span className="st-met" style={{ animationDelay: "1s" }}>
          <Eye size={14} aria-hidden /><span>312 mil</span>
        </span>
        <span className="st-met" style={{ animationDelay: "1.2s" }}>
          <Heart size={14} aria-hidden /><span>18,4 mil</span>
        </span>
        <span className="st-met" style={{ animationDelay: "1.4s" }}>
          <MessageCircle size={14} aria-hidden /><span>1.207</span>
        </span>
      </div>
      <div className="st-tag st-tag-ok">1 vídeo · 4 dias no ar</div>
    </div>
  );
}

/* 6 · ESTRUTURA COMERCIAL — o negócio andando de etapa em etapa. */
export function SceneCRM({ c }: SceneProps) {
  const colunas = ["Novo", "Contato", "Proposta", "Fechado"];
  return (
    <div className="st" style={cVar(c)}>
      <div className="st-kanban">
        {colunas.map((nome, i) => (
          <div className="st-col" key={nome}>
            <b>{nome}</b>
            <u aria-hidden style={{ animationDelay: `${i * 0.5}s` }} />
            {i < 3 && <u className="ghost" aria-hidden />}
          </div>
        ))}
        {/* o card que percorre as 4 colunas em laço */}
        <span className="st-card-move" aria-hidden />
      </div>
      <div className="st-tag st-tag-ok">Previsão do mês: R$ 214 mil</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CSS das 6 cenas. Exportado como string para o pai injetar UMA vez via
   `<style dangerouslySetInnerHTML>` (regra 1 da skill hg-regras-de-bug: `>` e
   `"` dentro de `<style>{...}` quebram hidratação) — e uma vez só porque só uma
   cena fica montada por vez, não faz sentido repetir o bloco a cada troca.

   Cinzas literais (#D3DAE7, #E6EAF2) são os do mockup e são NEUTROS de
   propósito: não há cor de marca escrita aqui, só `var(--c)`, que vem por prop.
   ──────────────────────────────────────────────────────────────────────────── */
export const SCENE_CSS = `
  .st { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 30px 30px 56px; }
  /* o padding de baixo (56px, não 30) reserva a faixa da .st-tag: sem ele, a
     cena mais alta (ranking + barras) encostava na etiqueta em telas curtas. */

  .st-tag { position: absolute; left: 20px; bottom: 18px; display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--line); border-radius: 99px; padding: 8px 14px; font: 600 13px var(--text); color: var(--ink); box-shadow: var(--sh-2); animation: stfade .5s var(--ease) 1.4s both; }
  .st-tag-ok::before { content: ''; width: 7px; height: 7px; border-radius: 99px; background: var(--c); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 22%, transparent); }
  @keyframes stfade { from { opacity: 0; transform: translateY(8px); } }

  .st-win { width: min(420px, 100%); background: #fff; border: 1px solid var(--line); border-radius: 14px; box-shadow: var(--sh-2); overflow: hidden; }
  .st-bar { display: flex; gap: 6px; padding: 11px 13px; border-bottom: 1px solid var(--line-2); background: var(--paper-2); }
  .st-bar i { width: 8px; height: 8px; border-radius: 99px; background: #D3DAE7; }
  .st-prods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 14px; }
  .st-prod { border: 1px solid var(--line-2); border-radius: 10px; padding: 9px; animation: stpop .5s var(--ease) both; }
  .st-prod b { display: block; height: 34px; border-radius: 7px; background: linear-gradient(120deg, color-mix(in srgb, var(--c) 16%, #fff), var(--paper-2)); }
  .st-prod em { display: block; height: 6px; border-radius: 99px; background: #E6EAF2; margin-top: 8px; }
  .st-prod u { display: block; height: 6px; width: 55%; border-radius: 99px; background: color-mix(in srgb, var(--c) 45%, #fff); margin-top: 5px; }
  @keyframes stpop { from { opacity: 0; transform: translateY(10px) scale(.96); } }

  .st-sync { display: flex; align-items: center; gap: 12px; }
  .st-pill { font: 600 12.5px var(--text); color: var(--ink); background: #fff; border: 1px solid var(--line); border-radius: 99px; padding: 7px 14px; box-shadow: var(--sh-1); }
  .st-wire { position: relative; width: 110px; height: 2px; background: var(--line); border-radius: 99px; overflow: hidden; }
  /* translateX no lugar do 'left' do design: 'left' recalcula layout a cada
     quadro. O ponto tem 30% da largura do fio, então 466% dele percorre
     exatamente os mesmos 140% de antes. */
  .st-wire i { position: absolute; top: 0; left: -30%; width: 30%; height: 100%; background: var(--c); animation: stwire 1.5s linear infinite; }
  @keyframes stwire { from { transform: translateX(0); } to { transform: translateX(466%); } }

  .st-rank { width: min(400px, 100%); display: flex; flex-direction: column; gap: 7px; }
  .st-row { display: flex; align-items: center; gap: 11px; background: #fff; border: 1px solid var(--line); border-radius: 11px; padding: 11px 13px; font: 500 14px var(--text); color: var(--ink-2); box-shadow: var(--sh-1); animation: strow .55s var(--ease) both; }
  .st-row b { width: 24px; height: 24px; flex-shrink: 0; border-radius: 7px; background: var(--paper-2); color: var(--ink-3); display: inline-flex; align-items: center; justify-content: center; font: 700 12px var(--code); }
  .st-row.me { border-color: var(--c); color: var(--ink); font-weight: 600; box-shadow: 0 10px 26px -14px var(--c); }
  .st-row.me b { background: var(--c); color: #fff; }
  .st-row em { margin-left: auto; font: 600 12px var(--text); font-style: normal; color: var(--c); }
  @keyframes strow { from { opacity: 0; transform: translateX(-14px); } }

  .st-bars { display: flex; align-items: flex-end; gap: 9px; height: 74px; }
  .st-bars span { width: 26px; border-radius: 7px 7px 3px 3px; background: linear-gradient(180deg, var(--c), color-mix(in srgb, var(--c) 35%, #fff)); height: var(--h); animation: stbar .8s var(--ease) both; transform-origin: bottom; }
  @keyframes stbar { from { transform: scaleY(.05); } }

  .st-funnel { width: min(400px, 100%); display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .st-fl { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff; border: 1px solid var(--line); border-radius: 11px; padding: 11px 15px; box-shadow: var(--sh-1); animation: stfl .6s var(--ease) both; }
  .st-fl b { font: 500 13.5px var(--text); color: var(--ink-2); }
  .st-fl em { font: 700 14px var(--code); font-style: normal; color: var(--c); }
  @keyframes stfl { from { opacity: 0; transform: translateY(-8px) scaleX(.9); } }

  .st-drops { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .st-drops span { position: absolute; top: 6%; width: 7px; height: 7px; border-radius: 99px; background: var(--c); opacity: .55; animation: stdrop 2.6s linear infinite; }
  @keyframes stdrop { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: .6; } 100% { transform: translateY(190px); opacity: 0; } }

  .st-chat { width: min(400px, 100%); display: flex; flex-direction: column; gap: 9px; }
  .st-b { max-width: 80%; padding: 11px 14px; border-radius: 14px; font: 400 14.5px/1.45 var(--text); animation: stb .45s var(--ease) both; box-shadow: var(--sh-1); }
  .st-b.in { align-self: flex-start; background: #fff; border: 1px solid var(--line); color: var(--ink); border-bottom-left-radius: 5px; }
  .st-b.out { align-self: flex-end; background: var(--c); color: #fff; border-bottom-right-radius: 5px; }
  .st-typing { align-self: flex-end; display: inline-flex; gap: 4px; background: #fff; border: 1px solid var(--line); border-radius: 99px; padding: 9px 12px; animation: stb .4s var(--ease) both; }
  .st-typing i { width: 5px; height: 5px; border-radius: 99px; background: var(--ink-3); animation: sttyp 1s infinite; }
  .st-typing i:nth-child(2) { animation-delay: .15s; }
  .st-typing i:nth-child(3) { animation-delay: .3s; }
  @keyframes sttyp { 50% { transform: translateY(-3px); opacity: .4; } }
  @keyframes stb { from { opacity: 0; transform: translateY(8px); } }

  .st-grid9 { display: grid; grid-template-columns: repeat(3, 64px); gap: 8px; }
  .st-grid9 span { aspect-ratio: 1; border-radius: 9px; background: linear-gradient(140deg, color-mix(in srgb, var(--c) 22%, #fff), var(--paper-2)); border: 1px solid var(--line-2); animation: stpop .5s var(--ease) both; }
  .st-metrics { display: flex; gap: 9px; flex-wrap: wrap; justify-content: center; }
  .st-met { display: inline-flex; align-items: center; gap: 7px; background: #fff; border: 1px solid var(--line); border-radius: 99px; padding: 7px 13px; font: 600 13px var(--text); color: var(--ink); box-shadow: var(--sh-1); animation: stfade .5s var(--ease) both; }
  /* o design usava <i data-lucide>; aqui o ícone é SVG de import nomeado */
  .st-met i, .st-met svg { color: var(--c); flex-shrink: 0; }

  .st-kanban { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; width: min(440px, 100%); }
  .st-col { background: var(--paper-2); border: 1px solid var(--line); border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 8px; min-height: 130px; }
  .st-col b { font: 600 11.5px var(--text); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); }
  .st-col u { display: block; height: 30px; border-radius: 8px; background: #fff; border: 1px solid var(--line); box-shadow: var(--sh-1); animation: stpop .5s var(--ease) both; }
  .st-col u.ghost { background: transparent; border-style: dashed; box-shadow: none; opacity: .7; }
  .st-card-move { position: absolute; top: 34px; left: 10px; width: calc(25% - 14px); height: 30px; border-radius: 8px; background: var(--c); box-shadow: 0 10px 22px -10px var(--c); animation: stmove 4.2s var(--ease) infinite; }
  @keyframes stmove { 0%, 8% { transform: translateX(0); } 25%, 33% { transform: translateX(calc(100% + 10px)); } 50%, 58% { transform: translateX(calc(200% + 20px)); } 75%, 100% { transform: translateX(calc(300% + 30px)); } }

  /* SM da escala oficial de breakpoints (ver app/claro-tokens.css). Era 560px
     neste arquivo — 560 estava na lista de legado a migrar. Aqui o palco tem
     400px de altura e a cena precisa caber inteira: nada pode ser cortado em
     silêncio pelo overflow:hidden do palco. */
  @media (max-width: 600px) {
    .st { padding: 18px 18px 48px; gap: 12px; }
    .st-tag { left: 14px; bottom: 12px; padding: 7px 11px; font-size: 12px; }
    .st-prods { padding: 10px; gap: 8px; }
    .st-prod { padding: 7px; }
    .st-prod b { height: 28px; }
    .st-pill { padding: 6px 11px; font-size: 12px; }
    .st-wire { width: 76px; }
    .st-row { padding: 9px 11px; font-size: 13px; gap: 9px; }
    .st-row em { font-size: 11.5px; }
    .st-bars { height: 58px; gap: 7px; }
    .st-bars span { width: 20px; }
    .st-fl { padding: 9px 12px; }
    .st-fl b { font-size: 12.5px; }
    .st-chat { gap: 7px; }
    .st-b { font-size: 13px; padding: 9px 12px; max-width: 88%; }
    .st-grid9 { grid-template-columns: repeat(3, 52px); gap: 7px; }
    .st-metrics { gap: 7px; }
    .st-met { padding: 6px 10px; font-size: 12px; }
    .st-kanban { gap: 7px; }
    .st-col { min-height: 104px; padding: 8px; gap: 6px; }
    .st-col b { font-size: 10px; letter-spacing: .04em; }
    .st-col u { height: 26px; }
    .st-card-move { top: 30px; left: 8px; width: calc(25% - 11px); height: 26px; }
    @keyframes stmove { 0%, 8% { transform: translateX(0); } 25%, 33% { transform: translateX(calc(100% + 7px)); } 50%, 58% { transform: translateX(calc(200% + 14px)); } 75%, 100% { transform: translateX(calc(300% + 21px)); } }
  }

  @media (prefers-reduced-motion: reduce) {
    .st, .st * { animation: none !important; opacity: 1 !important; transform: none !important; }
  }
`;

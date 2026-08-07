"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PILLARS, type ServiceCardData } from "@/lib/pillars";
import { ClaroHead } from "./ClaroUI";
import { ClaroServiceIcon } from "./ClaroServiceIcon";
import { CLARO_PILLAR_ACCENT } from "./claroPillarAccent";

/* ─────────────────────────────────────────────────────────────────────────────
   SOLUÇÕES — abas por pilar (4, não os 6 "departamentos" fictícios do mockup
   original) + grade dos serviços REAIS daquele pilar, cada card linkando pra
   página de verdade em /servicos/[slug]. No mockup os cards não linkavam pra
   lugar nenhum (`href="#solucoes"`); aqui cada um leva ao conteúdo completo
   já publicado — estrito upgrade, zero custo extra.

   Foto por pilar: fotos do Pexels (helper `PX(id)`) — Pexels License, uso
   comercial livre, sem precisar baixar/hospedar nada. O mockup original tinha
   uma legenda tipo "Loja de decoração · Sul / +38% de faturamento em 90 dias"
   atribuída a um cliente FICTÍCIO — isso não foi portado: a legenda aqui usa a
   descrição real do pilar, sem inventar nome de cliente nem número.

   TROCA 2026-08-06: as 4 fotos herdadas do mockup (4473496/8475204/6720592/
   3932728) mostravam donos de loja física/mercearia de avental — contexto de
   varejo físico, sem relação com uma agência de marketing digital, e-commerce
   e automação (bronca real do dono, com print apontando exatamente a foto do
   pilar "Vender"). Substituídas por fotos de escritório/tecnologia mais
   próximas de cada pilar; `object-position: 50% 30%` (na folha abaixo) já foi
   conferido contra as 4 fotos novas — nenhuma corta a cabeça da pessoa.

   REVISÃO 2026-08-06 (pedido do dono: "não tem efeito ao passar o mouse",
   "as bordas não têm efeito"):
   1. BUG REAL corrigido — a <figure> tinha `key={pil.key}` E `className="rv"`.
      O revelador de rolagem (ClaroSite.tsx) observa `.cl .rv` UMA vez, na
      montagem, e dá `unobserve` depois de revelar. Ao trocar de aba, o `key`
      remonta a figure: nasce um nó novo, com `.rv` (opacity:0) e sem `.in`,
      que ninguém mais observa → a foto SUMIA a partir do primeiro clique em
      outra aba. A entrada agora é a animação própria `sol-figin`, que roda a
      cada montagem, e a classe `.rv` saiu do elemento com `key`.
   2. Cada card de serviço agora é `.card.lit` com `--beam` na cor do pilar —
      é o mecanismo de borda de luz viajante que já existe em
      app/claro-tokens.css e que estes cards não estavam usando (por isso "as
      bordas não têm efeito"). Ícone (`glow`), título e seta acendem juntos.
   3. As abas viraram um tablist de verdade (role/aria-selected/aria-controls,
      setas do teclado, roving tabindex) e todo elemento interativo ganhou
      `:focus-visible` — antes só havia hover, nada por teclado.
   Só `transform`/`opacity`/cor são animados (regra de performance da casa). */
const PX = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`;
const FOTO_POR_PILAR: Record<string, { src: string; alt: string }> = {
  vender: { src: PX(7289739), alt: "Gestora sorrindo organizando os pedidos da loja virtual" },
  atrair: { src: PX(7693686), alt: "Time acompanhando gráficos de tráfego e captação de clientes" },
  marca: { src: PX(9040531), alt: "Profissional de conteúdo produzindo fotos e vídeos para redes sociais" },
  ia: { src: PX(8867220), alt: "Atendimento com apoio de automação, sorrindo em ambiente moderno" },
};

/* `services` chega do server (app/claro/page.tsx), já enxuto — mesma razão
   documentada em ClaroNav.tsx: não regredir a otimização que já existe no
   site escuro (lib/pillars.ts existe exatamente pra isso). */
export default function ClaroSolucoes({ services }: { services: ServiceCardData[] }) {
  const [d, setD] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const pil = PILLARS[d];
  const cor = CLARO_PILLAR_ACCENT[pil.key];
  const foto = FOTO_POR_PILAR[pil.key];
  const items = services.filter((s) => pil.slugs.includes(s.slug));

  /* Navegação por teclado do padrão WAI-ARIA "tabs" (ativação automática):
     setas trocam de aba E movem o foco; Home/End vão pras pontas. Sem isso a
     lista de abas era operável só com mouse. */
  function onTabKey(e: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = PILLARS.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setD(next);
    tabsRef.current[next]?.focus();
  }

  return (
    // Ordem final da página: ...Show(alt) → Solucoes(plain) → Fluxo(alt)... —
    // sem "alt" aqui de propósito, pra alternar com a seção "Soluções em ação"
    // (ClaroShow.tsx) que vem logo antes e também usa fundo --paper-2.
    <section id="solucoes" className="sec">
      <div className="wrap">
        <ClaroHead center eyebrow="Soluções" sub="Quatro frentes, um time só. Escolha a área e veja exatamente o que entregamos dentro dela.">
          Tudo que sua operação precisa,<br /><span className="grad">organizado por frente</span>
        </ClaroHead>

        <div className="sol-tabs rv" role="tablist" aria-label="Frentes de solução">
          {PILLARS.map((p, i) => {
            const on = i === d;
            /* `lit` só na aba INATIVA: a ativa já é um pill sólido na cor do
               pilar e a borda de luz por cima dela sumiria no fundo. */
            return (
              <button
                key={p.key}
                type="button"
                role="tab"
                id={`sol-tab-${p.key}`}
                aria-selected={on}
                aria-controls="sol-painel"
                tabIndex={on ? 0 : -1}
                ref={(el) => { tabsRef.current[i] = el; }}
                onClick={() => setD(i)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={"sol-tab" + (on ? " on" : " lit")}
                style={{ ["--beam" as string]: CLARO_PILLAR_ACCENT[p.key] }}
              >
                {/* `p.icon` já é nome lucide válido ("shopping-cart",
                    "trending-up", "palette", "bot") e os 4 estão no mapa de
                    ClaroServiceIcon — import nomeado, nunca lookup dinâmico. */}
                <span className="sol-tab-ic"><ClaroServiceIcon name={p.icon} size={16} /></span>
                {p.label}
                <span className="sol-tab-n">{p.slugs.length}</span>
              </button>
            );
          })}
        </div>

        {/* `rv` mora no painel (que NÃO tem `key`) e não mais na figure — assim a
            seção inteira revela junto na rolagem e nada volta pra opacity:0 ao
            trocar de aba. */}
        <div className="sol-body rv" id="sol-painel" role="tabpanel" aria-labelledby={`sol-tab-${pil.key}`} style={{ ["--beam" as string]: cor }}>
          {/* sem `rv` aqui: elemento com `key` remonta a cada troca de aba e o
              revelador não o observa mais (ver nota 1 no topo do arquivo). */}
          <figure className="sol-fig" key={pil.key}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto.src} alt={foto.alt} width={960} height={640} loading="lazy" decoding="async" />
            <figcaption>
              <span className="sol-cap-dot" />
              <span><b>{pil.label}</b><em>{pil.desc}</em></span>
            </figcaption>
          </figure>

          <div className="sol-col">
            <div className="sol-head">
              <span className="mono sol-kicker">{String(d + 1).padStart(2, "0")} · Frente</span>
              <h3 className="h3">{pil.label}</h3>
              <p className="body">{pil.desc}</p>
            </div>
            <div className="sol-grid" key={pil.key}>
              {items.map((s, i) => (
                <Link
                  href={`/servicos/${s.slug}`}
                  className="card sol-card lit"
                  key={s.slug}
                  style={{ animationDelay: `${i * 34}ms` }}
                >
                  <span className="sol-ic glow">
                    <ClaroServiceIcon name={s.icon} size={18} />
                  </span>
                  <span className="sol-tx">
                    <b className="glow-t">{s.title}</b>
                    <span>{s.desc}</span>
                  </span>
                  <ArrowRight className="sol-go" size={16} aria-hidden />
                </Link>
              ))}
            </div>
            <Link href="/servicos" className="btn btn-d sol-cta">
              Ver o catálogo completo <ArrowRight size={17} aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* ── abas ───────────────────────────────────────────────────────── */
        #solucoes .sol-tabs{display:flex;gap:10px;flex-wrap:wrap;margin-top:40px}
        #solucoes .sol-tab{position:relative;display:inline-flex;align-items:center;gap:9px;padding:11px 17px;border-radius:99px;border:1px solid var(--line);background:#fff;font:500 14.5px var(--text);color:var(--ink-2);box-shadow:var(--sh-1);transition:color .26s var(--ease),background .26s var(--ease),border-color .26s var(--ease),box-shadow .26s var(--ease),transform .26s var(--ease)}
        #solucoes .sol-tab-ic{display:inline-flex;align-items:center;color:var(--ink-3);transition:color .26s var(--ease)}
        #solucoes .sol-tab-n{font:600 11px var(--code);background:var(--paper-2);color:var(--ink-3);border-radius:99px;padding:2px 7px;transition:color .26s var(--ease),background .26s var(--ease)}
        #solucoes .sol-tab:not(.on):hover{color:var(--ink);border-color:color-mix(in srgb,var(--beam) 40%,var(--line));transform:translateY(-2px);box-shadow:var(--sh-2)}
        #solucoes .sol-tab:not(.on):hover .sol-tab-ic{color:var(--beam)}
        #solucoes .sol-tab:not(.on):hover .sol-tab-n{background:color-mix(in srgb,var(--beam) 12%,white);color:var(--beam)}
        #solucoes .sol-tab.on{font-weight:600;color:#fff;background:var(--beam);border-color:var(--beam);box-shadow:0 12px 26px -14px var(--beam)}
        #solucoes .sol-tab.on .sol-tab-ic{color:#fff}
        #solucoes .sol-tab.on .sol-tab-n{background:rgba(255,255,255,.24);color:#fff}
        #solucoes .sol-tab.on:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px var(--beam)}
        #solucoes .sol-tab:focus-visible{outline:2px solid var(--beam);outline-offset:3px}

        /* ── corpo ──────────────────────────────────────────────────────── */
        #solucoes .sol-body{display:grid;grid-template-columns:.72fr 1.28fr;gap:36px;margin-top:32px;align-items:start}
        #solucoes .sol-fig{margin:0;position:relative;border-radius:20px;overflow:hidden;box-shadow:var(--sh-3);min-height:min(520px,60vh);background:var(--paper-2);animation:sol-figin .5s var(--ease)}
        @keyframes sol-figin{from{opacity:0;transform:translateY(10px)}}
        #solucoes .sol-fig img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 30%;filter:contrast(1.04) saturate(.95);transition:transform .65s var(--ease)}
        #solucoes .sol-fig:hover img{transform:scale(1.045)}
        #solucoes .sol-fig figcaption{position:absolute;left:14px;right:14px;bottom:14px;display:flex;align-items:center;gap:11px;background:rgba(255,255,255,.95);border-radius:14px;padding:13px 15px;box-shadow:var(--sh-2);transition:transform .35s var(--ease),box-shadow .35s var(--ease)}
        #solucoes .sol-fig:hover figcaption{transform:translateY(-3px);box-shadow:var(--sh-3)}
        #solucoes .sol-cap-dot{width:8px;height:8px;border-radius:99px;flex-shrink:0;background:var(--beam)}
        #solucoes .sol-fig b{display:block;font:600 14px/1.3 var(--text);color:var(--ink)}
        #solucoes .sol-fig em{display:block;font:400 13px/1.45 var(--text);font-style:normal;color:var(--ink-2);margin-top:3px}

        /* ── cabeçalho da frente ────────────────────────────────────────── */
        #solucoes .sol-col{min-width:0}
        #solucoes .sol-kicker{display:block;color:var(--beam);transition:color .3s var(--ease)}
        #solucoes .sol-head h3{margin-top:10px}
        #solucoes .sol-head p{margin-top:8px;max-width:52ch}

        /* ── grade de serviços ──────────────────────────────────────────── */
        #solucoes .sol-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,232px),1fr));gap:14px;margin-top:26px}
        /* fill-mode backwards (e não forwards): a animação segura o estado
           inicial durante o delay e SOLTA o elemento quando termina — com
           forwards ela travaria o transform e mataria o levantar do hover. */
        #solucoes .sol-card{display:flex;align-items:flex-start;gap:13px;padding:18px;text-decoration:none;color:inherit;animation:sol-cardin .42s var(--ease) backwards}
        @keyframes sol-cardin{from{opacity:0;transform:translateY(9px)}}
        #solucoes .sol-card:hover{border-color:color-mix(in srgb,var(--beam) 26%,var(--line));box-shadow:0 16px 36px -20px var(--beam),var(--sh-2)}
        #solucoes .sol-card:focus-visible{outline:2px solid var(--beam);outline-offset:3px;transform:translateY(-3px);border-color:color-mix(in srgb,var(--beam) 26%,var(--line));box-shadow:0 16px 36px -20px var(--beam),var(--sh-2)}
        /* mesmo brilho de borda do :hover (regra .lit em app/claro-tokens.css),
           agora também para quem navega por teclado. */
        #solucoes .sol-card:focus-visible::after{opacity:1;animation:cl-ba 2.4s linear infinite}
        #solucoes .sol-ic{flex-shrink:0;width:40px;height:40px;border-radius:11px;border:1px solid color-mix(in srgb,var(--beam) 15%,white);background:color-mix(in srgb,var(--beam) 7%,white);color:var(--beam);display:inline-flex;align-items:center;justify-content:center;transition:color .3s var(--ease),background .3s var(--ease),border-color .3s var(--ease),box-shadow .3s var(--ease)}
        #solucoes .sol-card:hover .sol-ic,#solucoes .sol-card:focus-visible .sol-ic{color:#fff!important;background:var(--beam)!important;border-color:var(--beam);box-shadow:0 10px 24px -10px var(--beam)}
        /* textos escopados em .sol-tx (e não em ".sol-card span"): a regra
           genérica antiga vencia por especificidade e virava display:block no
           span do ícone, quebrando a centralização — mesmo bug que ClaroNav
           teve com .pl-ic. Escopar resolve sem precisar de !important. */
        #solucoes .sol-tx{min-width:0;flex:1}
        #solucoes .sol-tx b{display:block;font:600 15.5px/1.35 var(--text);color:var(--ink);transition:color .3s var(--ease)}
        #solucoes .sol-tx span{display:block;font:400 13.5px/1.5 var(--text);color:var(--ink-2);margin-top:5px}
        #solucoes .sol-card:hover .sol-tx b,#solucoes .sol-card:focus-visible .sol-tx b{color:var(--beam)}
        #solucoes .sol-go{flex-shrink:0;align-self:center;margin-left:auto;color:var(--beam);opacity:0;transform:translateX(-5px);transition:opacity .3s var(--ease),transform .3s var(--ease)}
        #solucoes .sol-card:hover .sol-go,#solucoes .sol-card:focus-visible .sol-go{opacity:1;transform:none}

        /* ── CTA ────────────────────────────────────────────────────────── */
        #solucoes .sol-cta{margin-top:24px}
        #solucoes .sol-cta svg{transition:transform .28s var(--ease)}
        #solucoes .sol-cta:hover svg{transform:translateX(4px)}
        #solucoes .sol-cta:focus-visible{outline:2px solid var(--ink);outline-offset:3px}

        @media(max-width:1000px){#solucoes .sol-body{grid-template-columns:1fr;gap:28px}#solucoes .sol-fig{min-height:280px}}
        @media(max-width:560px){#solucoes .sol-tabs{gap:8px}#solucoes .sol-tab{padding:10px 14px;font-size:14px}#solucoes .sol-grid{gap:12px}#solucoes .sol-card{padding:16px}}
        @media(prefers-reduced-motion:reduce){
          #solucoes .sol-fig,#solucoes .sol-card{animation:none}
          #solucoes .sol-tab:hover,#solucoes .sol-tab:focus-visible,#solucoes .sol-card:focus-visible,#solucoes .sol-fig:hover figcaption{transform:none}
          #solucoes .sol-fig:hover img,#solucoes .sol-cta:hover svg{transform:none}
          #solucoes .sol-go{opacity:1;transform:none}
        }
      `}} />
    </section>
  );
}

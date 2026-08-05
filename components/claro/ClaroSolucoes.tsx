"use client";

import { useState } from "react";
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

   Foto por pilar: as 4 fotos abaixo já existem em public/fotos (StockSnap,
   CC0 1.0, uso comercial liberado — mesmas já usadas na home/hub de serviços).
   O mockup original tinha uma legenda tipo "Loja de decoração · Sul / +38% de
   faturamento em 90 dias" atribuída a um cliente FICTÍCIO — isso não foi
   portado: a legenda aqui usa a descrição real do pilar, sem inventar nome de
   cliente nem número. */
const FOTO_POR_PILAR: Record<string, { src: string; alt: string }> = {
  vender: { src: "/fotos/checkout-loja-virtual.webp", alt: "Cliente com o cartão na mão diante de uma loja virtual aberta no notebook" },
  atrair: { src: "/fotos/painel-resultados.webp", alt: "Painel de métricas e gráficos de campanha aberto no notebook" },
  marca: { src: "/fotos/reuniao-projeto.webp", alt: "Duas pessoas planejando um calendário de conteúdo sobre a mesa" },
  ia: { src: "/fotos/operacao-diaria.webp", alt: "Profissional atendendo pelo notebook em uma mesa de trabalho" },
};

/* `services` chega do server (app/claro/page.tsx), já enxuto — mesma razão
   documentada em ClaroNav.tsx: não regredir a otimização que já existe no
   site escuro (lib/pillars.ts existe exatamente pra isso). */
export default function ClaroSolucoes({ services }: { services: ServiceCardData[] }) {
  const [d, setD] = useState(0);
  const pil = PILLARS[d];
  const cor = CLARO_PILLAR_ACCENT[pil.key];
  const foto = FOTO_POR_PILAR[pil.key];
  const items = services.filter((s) => pil.slugs.includes(s.slug));

  return (
    // Ordem final da página: ...Show(alt) → Solucoes(plain) → Fluxo(alt)... —
    // sem "alt" aqui de propósito, pra alternar com a seção "Soluções em ação"
    // (ClaroShow.tsx) que vem logo antes e também usa fundo --paper-2.
    <section id="solucoes" className="sec">
      <div className="wrap">
        <ClaroHead center eyebrow="Soluções" sub="Quatro frentes, um time só. Escolha a área e veja exatamente o que entregamos dentro dela.">
          Tudo que sua operação precisa,<br /><span className="grad">organizado por frente</span>
        </ClaroHead>

        <div className="sol-tabs rv">
          {PILLARS.map((p, i) => {
            const on = i === d;
            return (
              <button key={p.key} onClick={() => setD(i)} className={"sol-tab" + (on ? " on" : "")}
                style={on ? { background: CLARO_PILLAR_ACCENT[p.key], borderColor: CLARO_PILLAR_ACCENT[p.key], color: "#fff" } : {}}>
                <ClaroServiceIcon name={pillarIcon(p.icon)} size={16} />
                {p.label}
                <span className="sol-tab-n" style={on ? { background: "rgba(255,255,255,.24)", color: "#fff" } : {}}>{p.slugs.length}</span>
              </button>
            );
          })}
        </div>

        <div className="sol-body">
          <figure className="sol-fig rv" key={pil.key}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto.src} alt={foto.alt} width={960} height={640} loading="lazy" decoding="async" />
            <figcaption>
              <span className="sol-cap-dot" style={{ background: cor }} />
              <span><b>{pil.label}</b><em>{pil.desc}</em></span>
            </figcaption>
          </figure>

          <div className="rv">
            <div className="sol-head">
              <span className="mono" style={{ color: cor }}>{String(d + 1).padStart(2, "0")} · Frente</span>
              <h3 className="h3" style={{ marginTop: 8 }}>{pil.label}</h3>
              <p className="body" style={{ marginTop: 6 }}>{pil.desc}</p>
            </div>
            <div className="sol-grid">
              {items.map((s) => (
                <Link href={`/servicos/${s.slug}`} className="card sol-card" key={s.slug}>
                  <span className="sol-ic" style={{ color: cor, background: cor + "10", borderColor: cor + "26" }}>
                    <ClaroServiceIcon name={s.icon} size={18} />
                  </span>
                  <div>
                    <b>{s.title}</b>
                    <span>{s.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/servicos" className="btn btn-d" style={{ marginTop: 22 }}>
              Ver o catálogo completo <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        #solucoes .sol-tabs{display:flex;gap:9px;flex-wrap:wrap;margin-top:38px}
        #solucoes .sol-tab{display:inline-flex;align-items:center;gap:8px;padding:11px 16px;border-radius:99px;border:1px solid var(--line);background:#fff;font:500 14.5px var(--text);color:var(--ink-2);transition:all .26s var(--ease)}
        #solucoes .sol-tab:hover{color:var(--ink);border-color:#C9CFC5;transform:translateY(-2px)}
        #solucoes .sol-tab.on{font-weight:600;box-shadow:var(--sh-2)}
        #solucoes .sol-tab-n{font:600 11px var(--code);background:var(--paper-2);color:var(--ink-3);border-radius:99px;padding:2px 7px}
        #solucoes .sol-body{display:grid;grid-template-columns:.72fr 1.28fr;gap:34px;margin-top:28px;align-items:start}
        #solucoes .sol-fig{margin:0;position:relative;border-radius:20px;overflow:hidden;box-shadow:var(--sh-3);min-height:min(520px,60vh);background:var(--paper-2)}
        #solucoes .sol-fig img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 30%;filter:contrast(1.04) saturate(.95)}
        #solucoes .sol-fig figcaption{position:absolute;left:14px;right:14px;bottom:14px;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.94);backdrop-filter:blur(6px);border-radius:14px;padding:13px 15px;box-shadow:var(--sh-2)}
        #solucoes .sol-cap-dot{width:8px;height:8px;border-radius:99px;flex-shrink:0}
        #solucoes .sol-fig b{display:block;font:600 14px var(--text);color:var(--ink)}
        #solucoes .sol-fig em{display:block;font:400 13px var(--text);font-style:normal;color:var(--ink-3);margin-top:2px}
        #solucoes .sol-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:12px;margin-top:22px}
        #solucoes .sol-card{display:flex;gap:13px;padding:17px;text-decoration:none;color:inherit}
        #solucoes .sol-ic{flex-shrink:0;width:40px;height:40px;border-radius:11px;border:1px solid;display:inline-flex;align-items:center;justify-content:center}
        #solucoes .sol-card b{display:block;font:600 15.5px/1.3 var(--text);color:var(--ink)}
        #solucoes .sol-card span{display:block;font:400 13.5px/1.45 var(--text);color:var(--ink-3);margin-top:4px}
        /* .sol-ic é um <span> (ícone) dentro de .sol-card: a regra genérica acima
           ("#solucoes .sol-card span") tem mais especificidade e sobrescreveria
           o display:inline-flex do ícone por display:block, perdendo a
           centralização — mesmo bug que o ClaroNav.tsx teve com .pl-ic/.pl span,
           corrigido aqui do mesmo jeito. */
        #solucoes .sol-ic{display:inline-flex!important}
        @media(max-width:1000px){#solucoes .sol-body{grid-template-columns:1fr}#solucoes .sol-fig{min-height:280px}}
      `}} />
    </section>
  );
}

/* PILLARS.icon já é um nome lucide válido ("shopping-cart", "trending-up",
   "palette", "bot"), mas não está na lista de 22 ícones de SERVIÇO que
   ClaroServiceIcon resolve — os 4 ícones de pilar são resolvidos aqui. */
function pillarIcon(name: string): string {
  return name;
}

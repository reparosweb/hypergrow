"use client";

import { useEffect } from "react";
import type { ServiceCardData } from "@/lib/pillars";
import ClaroNav from "./ClaroNav";
import ClaroHero from "./ClaroHero";
import ClaroShow from "./ClaroShow";
import ClaroSolucoes from "./ClaroSolucoes";
import ClaroDiag from "./ClaroDiag";
/* `ClaroBanner` existe em ClaroExtra.tsx mas NÃO é montado aqui — ver nota
   sobre o banner na ordem das seções, logo abaixo. O componente ficou no
   arquivo (não apaguei código) caso o dono queira trazer de volta. */
import {
  ClaroFluxo, ClaroPortfolio, ClaroClientes, ClaroSobre, ClaroBlog,
} from "./ClaroExtra";
import {
  ClaroResultados, ClaroDepoimentos, ClaroFaq, ClaroContato, ClaroFooter, ClaroWa,
} from "./ClaroClose";

/* ─────────────────────────────────────────────────────────────────────────────
   RAIZ da rota /claro — orquestra as seções e liga o revelador de rolagem.

   `.cl` envolve tudo: TODA regra de `app/claro-tokens.css` está escopada sob
   essa classe de propósito (defesa contra colisão de nome de classe genérico
   como .wrap/.sec/.card com o tema escuro — os dois nunca carregam na mesma
   rota, mas o prefixo custa zero e evita depender só disso).

   `.rv`/`.rv.in` — mesmo mecanismo do `.reveal` da home escura: observer único
   no componente raiz, `unobserve` depois que revela (não fica escutando pra
   sempre). Parâmetros exatos herdados do mockup original (threshold .1,
   rootMargin -6%), ajustados para a altura real destas seções.

   BANNER REMOVIDO DA COMPOSIÇÃO (2026-08-06) — dois motivos objetivos:
   (1) a página composta do projeto Claude Design (`Hypergrow Claro.html`, lida
   ao vivo) NÃO monta o banner: a ordem lá é hero → show → soluções → fluxo →
   portfólio → resultados → diagnóstico → clientes → depoimentos → sobre →
   blog → faq → contato. O componente `LBanner` existe no arquivo-fonte mas
   ficou fora da montagem — era código sobrando. (2) desde que o vídeo voltou
   ao topo, o banner exibia O MESMO vídeo do foguete uma segunda vez na mesma
   página. Alternância de fundo continua correta sem ele: compat(plain) →
   Show(alt).

   ORDEM DAS SEÇÕES — cada uma alterna --paper/--paper-2 com a vizinha; se
   mudar a ordem, confira o className "sec"/"sec alt" de cada arquivo (comentado
   em cada um onde depende da vizinha):
   Hero(vídeo) → Hero/compat(plain) → Show(alt) →
   Solucoes(plain) → Fluxo(alt) → Portfolio(plain) → Resultados(alt) →
   Diag(plain) → Clientes(alt) → Depoimentos(plain) → Sobre(alt) →
   Blog(plain) → Faq(alt) → Contato(plain) → Footer. */
export default function ClaroSite({ services }: { services: ServiceCardData[] }) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll(".cl .rv").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="cl">
      <ClaroNav services={services} />
      <main>
        <ClaroHero />
        <ClaroShow />
        <ClaroSolucoes services={services} />
        <ClaroFluxo />
        <ClaroPortfolio />
        <ClaroResultados />
        <ClaroDiag />
        <ClaroClientes />
        <ClaroDepoimentos />
        <ClaroSobre />
        <ClaroBlog />
        <ClaroFaq />
        <ClaroContato />
      </main>
      <ClaroFooter />
      <ClaroWa />
    </div>
  );
}

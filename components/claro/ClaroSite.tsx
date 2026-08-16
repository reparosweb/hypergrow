"use client";

import { useEffect } from "react";
import type { ServiceCardData } from "@/lib/pillars";
import ClaroNav from "./ClaroNav";
import ClaroHero from "./ClaroHero";
import ClaroShow from "./ClaroShow";
import ClaroSolucoes from "./ClaroSolucoes";
import ClaroServicos from "./ClaroServicos";
import ClaroDiag from "./ClaroDiag";
import ClaroCaptura from "./ClaroCaptura";
/* `ClaroBanner` não existe mais: foi APAGADO de ClaroExtra.tsx em 2026-08-15.
   Ficou um ano sem ser montado por rota nenhuma, e era o último consumidor de
   `public/media/launch.mp4` (10,73 MB, o maior arquivo do repositório) no tema
   claro — o vídeo saiu junto. Motivo completo no lugar onde ele estava, em
   ClaroExtra.tsx; para trazer de volta, `git log` daquele arquivo. */
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
   Captura(vídeo full-bleed) → Servicos(alt) → Diag(plain) → Clientes(alt) →
   Depoimentos(plain) → Sobre(alt) → Blog(plain) → Faq(alt) →
   Contato(plain) → Footer.

   `Servicos` (2026-08-06, grade maior de serviços — ver ClaroServicos.tsx)
   entra logo depois de `Captura` de propósito: como `Captura` é a faixa
   full-bleed em vídeo (não usa `.sec`, não participa da alternância), inserir
   a seção nova ali não obriga a recolorir nenhuma das seções seguintes —
   `Diag` já era "plain" e continua correto sem tocar no seu className.

   `Captura` entra entre Resultados e Diagnóstico de propósito: é onde nasce a
   objeção "bonito, mas vocês entregam e somem?" — depois da prova, antes de
   pedir a ação. Como é uma faixa escura full-bleed (não usa `.sec`), ela não
   participa da alternância --paper/--paper-2: Resultados(alt) e Diag(plain)
   continuam corretos sem tocar em nenhum className. */
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
      {/* id="main" é o alvo do skip link renderizado em app/layout.tsx — sem
          ele o atalho de teclado apontava para um âncora inexistente. */}
      <main id="main">
        <ClaroHero />
        <ClaroShow />
        <ClaroSolucoes services={services} />
        <ClaroFluxo />
        <ClaroPortfolio />
        <ClaroResultados />
        <ClaroCaptura />
        <ClaroServicos services={services} />
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

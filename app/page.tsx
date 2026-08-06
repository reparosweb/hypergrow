import "./claro-tokens.css";
import type { Metadata } from "next";
import ClaroSite from "@/components/claro/ClaroSite";
import ChatWidget from "@/components/ChatWidgetLazy";
import { siteServices } from "@/lib/site-services";
import type { ServiceCardData } from "@/lib/pillars";
import { HOME_FAQ, faqPageSchema } from "@/lib/home-faq";
import { SITE_URL } from "@/lib/seo";

/* HOME OFICIAL — trocada em 2026-08-05 do tema escuro (HypergrowSite.tsx)
   pra versão clara (ClaroSite.tsx), por pedido explícito do dono: "subir o
   arquivo na íntegra" na URL raiz, não numa rota separada. O tema escuro
   NÃO foi apagado — components/site/HypergrowSite.tsx, app/hg-tokens.css e
   app/hg-styles.css continuam no repositório, só não são mais importados
   aqui. Reverter é trocar de volta este arquivo pro que estava antes deste
   commit (git log/git revert).

   ⚠️ RISCO HERDADO, não resolvido por esta troca: as seções "Resultados" e
   "Depoimentos" (ver components/claro/ClaroClose.tsx) têm case e falas de
   cliente que são PLACEHOLDER do mockup original, não dado real — antes
   ficavam numa rota com noindex; agora estão na home pública e indexável.
   Continua sendo decisão do dono trocar por dado real ou remover; não
   decidi por conta própria, só sinalizando que o risco mudou de tamanho. */
export const metadata: Metadata = { alternates: { canonical: "/" } };

/* As 7 perguntas da home já eram VISÍVEIS, mas não existiam como dado
   estruturado — o Google e as IAs não tinham como reconhecê-las. Marcadas a
   partir do mesmo array que a tela renderiza (lib/home-faq.ts), então schema e
   conteúdo não podem divergir. */
const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [faqPageSchema(HOME_FAQ, `${SITE_URL}/#faq`)],
};

/* PERFORMANCE: este é um SERVER component, então `siteServices` (com o conteúdo
   completo das 19 páginas de serviço) fica no servidor. Só estes 7 campos por
   serviço atravessam para o cliente — a auditoria mediu 62.992 bytes (41% do JS
   da home) sendo enviados à toa com `body`, `faq`, `outcomes` etc., que só a
   rota /servicos/[slug] usa.
   Derivado da fonte única, então não existe risco de a home ficar desatualizada
   quando um serviço for adicionado ou alterado. */
const servicesForCards: ServiceCardData[] = siteServices.map((s) => ({
  slug: s.slug,
  icon: s.icon,
  title: s.title,
  desc: s.desc,
  tags: s.tags.slice(0, 2), // o card só mostra 2
  accent: s.accent,
  glow: s.glow,
}));

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <ClaroSite services={servicesForCards} />
      <ChatWidget />
    </>
  );
}

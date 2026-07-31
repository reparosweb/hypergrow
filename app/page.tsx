import "./hg-tokens.css";
import "./hg-styles.css";
import type { Metadata } from "next";
import HypergrowSite from "@/components/site/HypergrowSite";
import ChatWidget from "@/components/ChatWidgetLazy";
import { siteServices } from "@/lib/site-services";
import type { ServiceCardData } from "@/lib/pillars";

export const metadata: Metadata = { alternates: { canonical: "/" } };

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
      <HypergrowSite services={servicesForCards} />
      <ChatWidget />
    </>
  );
}

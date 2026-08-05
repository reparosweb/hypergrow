import "../claro-tokens.css";
import type { Metadata } from "next";
import ClaroSite from "@/components/claro/ClaroSite";
import { siteServices } from "@/lib/site-services";
import type { ServiceCardData } from "@/lib/pillars";
import { SITE_URL } from "@/lib/seo";

/* Prévia de layout — mesmo padrão de import do app/page.tsx: server component,
   converte `siteServices` (pesado, com body/faq/outcomes) para o formato
   ENXUTO que os componentes cliente desta rota realmente usam, ANTES de
   qualquer coisa chegar ao navegador. */
const servicesForCards: ServiceCardData[] = siteServices.map((s) => ({
  slug: s.slug,
  icon: s.icon,
  title: s.title,
  desc: s.desc,
  tags: s.tags.slice(0, 2),
  accent: s.accent,
  glow: s.glow,
}));

/* noindex de propósito: esta rota tem duas seções com conteúdo PLACEHOLDER
   explícito (Resultados e Depoimentos — ver comentário no topo de
   components/claro/ClaroClose.tsx), e a página inteira ainda não foi
   promovida a versão oficial do site. Tirar o noindex é uma DECISÃO do dono,
   não algo pra acontecer sozinho quando o placeholder virar dado real. */
export const metadata: Metadata = {
  title: "HyperGrow (prévia clara) — Marketing, e-commerce e automação",
  description: "Prévia de layout claro do site da HyperGrow — em revisão, ainda não é a versão oficial.",
  alternates: { canonical: `${SITE_URL}/claro` },
  robots: { index: false, follow: false },
};

export default function ClaroPage() {
  return <ClaroSite services={servicesForCards} />;
}

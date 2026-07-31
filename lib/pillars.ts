/* ─────────────────────────────────────────────────────────────────────────────
   PILARES — módulo LEVE, seguro para o bundle do cliente.

   Por que vive separado de `lib/site-services.ts`: aquele arquivo carrega o
   conteúdo completo das 19 páginas de serviço (body de 300-500 palavras, FAQ,
   outcomes...). Como a home é um client component, importar de lá arrastava
   62.992 bytes de texto — 41% do JS da home — para o navegador, sendo que a
   home só usa 7 campos por serviço. Auditoria de performance mediu isso.

   Aqui só mora o que é pequeno e compartilhado. `site-services.ts` re-exporta
   tudo isto, então quem já importava de lá continua funcionando.

   SISTEMA VISUAL: 4 sinais distinguíveis usando as 2 famílias da marca (jade +
   cobre) — sem virar arco-íris nem reintroduzir azul/violeta (a assinatura de
   "site feito por IA"). Matiz resolve 2 pilares, SATURAÇÃO resolve o 3º
   (champanhe .33 vs cobre .56) e o 4º usa teal claro.

   `accent` = traço/ícone/grafismo (precisa contraste alto sobre o card).
   `rail`   = trilho de 2px no topo do card (pode ser mais saturado).
   Contrastes medidos contra o fundo real do card (#191D23): piso 7,2:1 — antes
   havia cards a 3,14:1, com o ícone quase invisível.
   ──────────────────────────────────────────────────────────────────────────── */
export type PillarKey = "vender" | "atrair" | "marca" | "ia";

export type Pillar = {
  key: PillarKey;
  label: string;
  short: string;
  icon: string;
  desc: string;
  accent: string;
  rail: string;
  glow: string;
  slugs: string[];
};

export const PILLARS: Pillar[] = [
  {
    key: "vender", label: "Vender online", short: "Vender", icon: "shopping-cart",
    desc: "Site, loja e presença que convertem visita em cliente.",
    accent: "#2DD4A0", rail: "#0FA968", glow: "rgba(45,212,160,0.42)", // 8,89:1
    slugs: ["criacao-de-site", "loja-virtual", "consultoria-ecommerce", "seo", "hospedagem", "cartao-interativo"],
  },
  {
    key: "atrair", label: "Atrair demanda", short: "Atrair", icon: "trending-up",
    desc: "Tráfego e réguas que trazem gente pronta pra comprar.",
    accent: "#E09A63", rail: "#C4763C", glow: "rgba(224,154,99,0.42)", // 7,23:1
    slugs: ["marketing-trafego", "email-marketing", "web-stories"],
  },
  {
    key: "marca", label: "Marca & conteúdo", short: "Marca", icon: "palette",
    desc: "Identidade, foto, vídeo e redes com o padrão da sua marca.",
    accent: "#D3B78E", rail: "#D3B78E", glow: "rgba(211,183,142,0.42)", // 8,81:1 — champanhe dessaturado
    slugs: ["redes-sociais", "posts-redes-sociais", "posts-video", "stories-instagram", "producao-de-video", "producao-fotografica", "fotos-produtos", "design-identidade", "criacao-logo"],
  },
  {
    key: "ia", label: "Operar com IA", short: "IA", icon: "bot",
    desc: "Agentes e automações que atendem e vendem sozinhos.",
    accent: "#5FD3C6", rail: "#3BA8A0", glow: "rgba(95,211,198,0.42)", // 9,4:1
    slugs: ["automacoes-ia"],
  },
];

export function pillarOf(slug: string): Pillar {
  return PILLARS.find((p) => p.slugs.includes(slug)) || PILLARS[0];
}

/** Serviços "carro-chefe" — ganham célula maior no bento grid da home. */
export const FLAGSHIP_SLUGS = ["criacao-de-site", "loja-virtual", "marketing-trafego", "automacoes-ia"];

/** O subconjunto de campos que a home realmente usa (7 de 13). O resto do
 *  serviço só é necessário em /servicos/[slug], que é server component. */
export type ServiceCardData = {
  slug: string;
  icon: string;
  title: string;
  desc: string;
  tags: string[];
  accent: string;
  glow: string;
};

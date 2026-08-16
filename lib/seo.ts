// Fonte única do domínio e da marca.
// Quando hypergrow.com.br estiver no ar e apontado na Vercel, troque SITE_URL para "https://hypergrow.com.br".
export const SITE_URL = "https://hypergrow-lovat.vercel.app";
export const BRAND = "HyperGrow";

/* ─────────────────────────────────────────────────────────────────────────────
   IMAGEM SOCIAL (Open Graph) — fonte única.

   POR QUE ESTE ARQUIVO EXISTE: até 2026-08-15 todas as páginas repetiam
   `/media/launch-poster.png`, um PNG de 720×405 (abaixo do mínimo de 1200×630
   que WhatsApp, LinkedIn e Facebook pedem) e de 298 KB. Ele foi removido na
   limpeza de peso, mas 17 arquivos continuaram apontando para o caminho —
   resultado: link compartilhado ficava SEM imagem de prévia, e o build não
   acusa nada porque metadado é apenas texto.

   Agora existe uma imagem própria por área, todas 1200×630, geradas em
   `public/og/`. Chamar `ogImage()` em vez de digitar o caminho garante que
   uma remoção futura quebre o TypeScript em vez de quebrar silenciosamente o
   compartilhamento.
   ──────────────────────────────────────────────────────────────────────────── */

/** Áreas com arte própria. O nome bate 1:1 com o arquivo em `public/og/`. */
export type AreaOg =
  | "home"
  | "servicos"
  | "servicos-site"
  | "servicos-ecommerce"
  | "servicos-marketing"
  | "servicos-midia"
  | "servicos-ia"
  | "ferramentas"
  | "blog"
  | "sobre"
  | "contato"
  | "clinicas"
  | "institucional";

/** Caminho absoluto da imagem social. Absoluto de propósito: Facebook e
 *  WhatsApp não resolvem caminho relativo ao raspar a página. */
export function ogImage(area: AreaOg = "home"): string {
  return `${SITE_URL}/og/${area}.png`;
}

/** Bloco pronto para `metadata.openGraph.images` — já com dimensão declarada,
 *  que é o que faz o WhatsApp mostrar o card grande em vez do miniatura. */
export function ogImagens(area: AreaOg = "home", alt = "HyperGrow — agência de e-commerce, marketing e tecnologia") {
  return [{ url: ogImage(area), width: 1200, height: 630, alt }];
}

/** Mapa departamento → arte. Usado pelas 22 páginas de serviço: cada
 *  departamento tem a sua, em vez de as 22 dividirem a mesma imagem. */
export const OG_POR_PILAR: Record<string, AreaOg> = {
  site: "servicos-site",
  ecommerce: "servicos-ecommerce",
  marketing: "servicos-marketing",
  midia: "servicos-midia",
  ia: "servicos-ia",
};

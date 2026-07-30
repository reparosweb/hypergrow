// Aplica a cor do PILAR em cada serviço de lib/site-services.ts.
// Antes: 19 acentos em tons de jade quase idênticos → cards indistinguíveis.
// Depois: cada serviço herda accent/glow do seu pilar (4 matizes distinguíveis).
import fs from "node:fs";

const FILE = "lib/site-services.ts";
const PILLARS = {
  vender: { accent: "#0FA968", glow: "rgba(15,169,104,0.45)", slugs: ["criacao-de-site", "loja-virtual", "consultoria-ecommerce", "seo", "hospedagem", "cartao-interativo"] },
  atrair: { accent: "#D9843F", glow: "rgba(217,132,63,0.45)", slugs: ["marketing-trafego", "email-marketing", "web-stories"] },
  marca: { accent: "#D4A62A", glow: "rgba(212,166,42,0.45)", slugs: ["redes-sociais", "posts-redes-sociais", "posts-video", "stories-instagram", "producao-de-video", "producao-fotografica", "fotos-produtos", "design-identidade", "criacao-logo"] },
  ia: { accent: "#3BA8A0", glow: "rgba(59,168,160,0.45)", slugs: ["automacoes-ia"] },
};

const slugToPillar = {};
for (const [key, p] of Object.entries(PILLARS)) for (const s of p.slugs) slugToPillar[s] = p;

let src = fs.readFileSync(FILE, "utf8");
// Só mexe DEPOIS do array de serviços (evita tocar no bloco PILLARS no topo).
const startIdx = src.indexOf("export const siteServices");
const head = src.slice(0, startIdx);
let body = src.slice(startIdx);

let count = 0;
// Cada serviço: captura do slug até a linha glow/accent daquele bloco.
body = body.replace(
  /slug: "([a-z-]+)",([\s\S]*?)glow: "[^"]*", accent: "[^"]*",/g,
  (match, slug, between) => {
    const p = slugToPillar[slug];
    if (!p) { console.log("  ! sem pilar:", slug); return match; }
    count++;
    return `slug: "${slug}",${between}glow: "${p.glow}", accent: "${p.accent}",`;
  }
);

fs.writeFileSync(FILE, head + body);
console.log(`${count} serviços recoloridos pela cor do pilar.`);

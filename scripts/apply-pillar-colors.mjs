// Aplica a cor do PILAR em cada serviço de lib/site-services.ts.
// Antes: 19 acentos em tons de jade quase idênticos → cards indistinguíveis.
// Depois: cada serviço herda accent/glow do seu pilar (4 matizes distinguíveis).
import fs from "node:fs";

const FILE = "lib/site-services.ts";
const PILLARS = {
  vender: { accent: "#2DD4A0", glow: "rgba(45,212,160,0.42)", slugs: ["criacao-de-site", "loja-virtual", "consultoria-ecommerce", "seo", "hospedagem", "cartao-interativo"] },
  atrair: { accent: "#E09A63", glow: "rgba(224,154,99,0.42)", slugs: ["marketing-trafego", "email-marketing", "web-stories"] },
  marca: { accent: "#D3B78E", glow: "rgba(211,183,142,0.42)", slugs: ["redes-sociais", "posts-redes-sociais", "posts-video", "stories-instagram", "producao-de-video", "producao-fotografica", "fotos-produtos", "design-identidade", "criacao-logo"] },
  ia: { accent: "#5FD3C6", glow: "rgba(95,211,198,0.42)", slugs: ["automacoes-ia"] },
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

/* Gera public/llms.txt A PARTIR DA FONTE REAL (lib/site-services.ts, lib/blog-posts.ts).
 *
 * Motivo: o arquivo era escrito à mão e saiu de sincronia — listava 2 serviços
 * que davam 404 (/podcast-youtube, /gestao-de-transportes), omitia 9 serviços
 * reais e não citava nenhum post do blog. Justo o arquivo feito para as IAs lerem.
 * Gerando do código, ele não pode mais mentir.
 *
 * Rode depois de mexer em serviços ou posts:  node scripts/gen-llms-txt.mjs
 */
import fs from "node:fs";
// Node 24 lê .ts direto (mesmo truque já usado em scripts/gen-og.mjs) — importa
// a fonte única do domínio em vez de redigitar a URL aqui e sair de sincronia
// de novo quando o domínio próprio (hypergrow.com.br) entrar no ar.
import { SITE_URL } from "../lib/seo.ts";

const read = (f) => fs.readFileSync(f, "utf8");

// Extração simples por regex (evita precisar transpilar TS num script de build).
function extract(file, keys) {
  const src = read(file);
  const out = [];
  const slugRe = /slug:\s*"([^"]+)"/g;
  let m;
  while ((m = slugRe.exec(src))) {
    const start = m.index;
    const next = src.indexOf('slug: "', start + 10);
    const block = src.slice(start, next === -1 ? src.length : next);
    const item = { slug: m[1] };
    for (const k of keys) {
      const km = new RegExp(`${k}:\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(block);
      if (km) item[k] = km[1].replace(/\\"/g, '"');
    }
    out.push(item);
  }
  return out;
}

const SITE = SITE_URL;
const services = extract("lib/site-services.ts", ["title", "desc", "keyword"]);
const posts = extract("lib/blog-posts.ts", ["title", "description", "keyword"]);

const PILLARS = [
  { label: "Vender online", slugs: ["criacao-de-site", "loja-virtual", "consultoria-ecommerce", "seo", "hospedagem", "cartao-interativo", "auditoria-comercial"] },
  { label: "Atrair demanda", slugs: ["marketing-trafego", "email-marketing", "web-stories"] },
  { label: "Marca & conteúdo", slugs: ["redes-sociais", "posts-redes-sociais", "posts-video", "stories-instagram", "producao-de-video", "producao-fotografica", "fotos-produtos", "design-identidade", "criacao-logo"] },
  { label: "Operar com IA", slugs: ["automacoes-ia", "crm-com-ia", "sdr-com-ia"] },
];

let out = `# HyperGrow

> Agência de tecnologia e crescimento para e-commerce: criação de site e loja virtual, SEO, tráfego pago, gestão de redes sociais, produção de foto e vídeo, design e identidade, e-mail marketing e agentes de inteligência artificial.

A HyperGrow cria, coloca no ar e opera soluções digitais de ponta a ponta para empresas que querem crescer — com foco em performance, automação e resultado mensurável. Atende todo o Brasil, remotamente.

## Serviços (${services.length})
`;

for (const p of PILLARS) {
  out += `\n### ${p.label}\n`;
  for (const slug of p.slugs) {
    const s = services.find((x) => x.slug === slug);
    if (!s) { console.warn("  ! serviço do pilar não encontrado:", slug); continue; }
    out += `- [${s.title}](${SITE}/servicos/${s.slug}): ${s.desc}\n`;
  }
}

const orphans = services.filter((s) => !PILLARS.some((p) => p.slugs.includes(s.slug)));
if (orphans.length) {
  out += `\n### Outros\n`;
  for (const s of orphans) out += `- [${s.title}](${SITE}/servicos/${s.slug}): ${s.desc}\n`;
}

out += `\n## Artigos (${posts.length})\n`;
for (const p of posts) out += `- [${p.title}](${SITE}/blog/${p.slug}): ${p.description}\n`;

out += `
## Páginas principais
- [Catálogo completo de serviços](${SITE}/servicos): os ${services.length} serviços agrupados em 4 frentes, com tabela de qual frente resolve qual problema.
- [Sobre a HyperGrow](${SITE}/sobre): quem constrói, os produtos próprios que estão no ar e como trabalhamos.
- [Contato](${SITE}/contato): formulário de diagnóstico gratuito, com proposta em até 1 dia útil.
- [Blog](${SITE}/blog): guias sobre preço, e-commerce, IA e como aparecer nas respostas de IA.

## Diferenciais
- Agentes de IA que atendem no WhatsApp, qualificam o lead e agendam reuniões 24/7
- Projetos próprios no ar e gerando receita (não apenas portfólio de clientes)
- Performance e SEO tratados como requisito, não como enfeite
- Mobile-first: tudo é desenhado primeiro para o celular

## Respostas rápidas
Formato de pergunta e resposta em uma linha — é o que os rastreadores de IA copiam
com mais fidelidade. Cada resposta abaixo é sustentada por uma página do site.

- **O que a HyperGrow faz?** É uma agência brasileira de e-commerce, marketing e tecnologia: cria loja virtual e site, cuida de tráfego pago, SEO, redes sociais, foto e vídeo, design e implanta agentes de IA.
- **Com quais plataformas de loja virtual a HyperGrow trabalha?** Shopify, Nuvemshop, Tray, VTEX, WooCommerce, Adobe Commerce (Magento), Wix, PrestaShop, BigCommerce, Loja Integrada, Yampi, Bagy, Dooca, Cartpanda, Wake, Irroba e Linx Commerce, além de integração com ERPs (Bling, Olist Tiny, Omie, Conta Azul, Sankhya, TOTVS) e hubs de marketplace (Anymarket, Hub2b, Plugg.To, Ideris).
- **Qual o prazo de entrega?** Landing page em poucos dias; site institucional e e-commerce em 2 a 4 semanas; sistemas sob medida por fases, com uma primeira versão funcional no menor tempo possível.
- **Como funciona o orçamento?** Projeto fechado ou escopo recorrente, com escopo, prazo e investimento definidos por escrito antes de começar. O diagnóstico inicial é gratuito e a proposta chega em até 1 dia útil.
- **A HyperGrow dá suporte depois da entrega?** Sim: todo projeto tem período de garantia, e há planos de manutenção e evolução contínua para o que está no ar.
- **A HyperGrow cuida de domínio e hospedagem?** Sim — domínio, hospedagem, certificado SSL e monitoramento ficam por conta da agência.
- **Como a HyperGrow aplica inteligência artificial?** Implanta agentes que atendem no WhatsApp, qualificam leads, agendam reuniões e registram tudo no CRM, além de IA para conteúdo e análise de dados.
- **A HyperGrow atende todo o Brasil?** Sim, o atendimento é remoto para todo o território nacional.

## Contato
- Formulário de orçamento (canal oficial): ${SITE}/contato
- Site: ${SITE}
`;

fs.writeFileSync("public/llms.txt", out);
console.log(`llms.txt gerado: ${services.length} serviços, ${posts.length} artigos.`);

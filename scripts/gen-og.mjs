/* ═════════════════════════════════════════════════════════════════════════════
   GERADOR DAS IMAGENS DE COMPARTILHAMENTO (Open Graph / Twitter Card)

   Rodar:  node scripts/gen-og.mjs
   Saída:  public/og/*.png  —  1200×630, o tamanho que WhatsApp, LinkedIn,
           Facebook, X e Telegram esperam para o card GRANDE.

   ── POR QUE ISTO EXISTE ────────────────────────────────────────────────────
   Até 2026-08-15 as 18+ páginas do site compartilhavam UMA imagem só:
   `/media/launch-poster.png`. Dois defeitos medidos:

     1. O arquivo era 720×405. O metadata declarava `width: 1200, height: 630`
        (mentira herdada). Abaixo de 600×315 o WhatsApp e o LinkedIn degradam
        para a miniatura QUADRADA pequena — o link ficava com cara de spam.
     2. Todas as páginas mostravam a MESMA foto de foguete, sem uma palavra.
        Quem recebia "/servicos/loja-virtual" no WhatsApp não tinha como saber
        do que era o link.

   ── POR QUE ESTÁTICO (sharp) E NÃO `opengraph-image.tsx` DO NEXT ───────────
   O caminho "oficial" do App Router seria `opengraph-image.tsx` com
   `ImageResponse`. Foi DESCARTADO por risco de teto de funções, não por gosto:
   este projeto está em Vercel Hobby, cujo limite é 12 Serverless Functions, e
   já usa 9 (as 9 rotas `route.ts` dentro de app/api). Uma rota de imagem que vire
   função por página estoura o teto e o deploy INTEIRO falha — e a única forma
   de confirmar em qual dos dois modos o Next colocaria cada rota é rodando o
   build, que nesta sessão era proibido (dois builds simultâneos na mesma pasta
   já corromperam o .next hoje). Entre "provavelmente estático" e "com certeza
   zero função", a escolha certa num site em produção é a segunda.

   Efeito colateral bom: PNG pronto no disco é servido pela CDN sem nenhuma
   execução, então o crawler do WhatsApp (que desiste rápido) nunca espera
   cold start.

   ── FONTE ÚNICA ────────────────────────────────────────────────────────────
   Os 5 departamentos vêm de `lib/pillars.ts` e a cor de cada um de
   `components/claro/claroPillarAccent.ts` — importados de verdade (Node 24 lê
   .ts direto), NUNCA redigitados aqui. Se um departamento for renomeado, basta
   rodar este script de novo.

   ── PALETA ─────────────────────────────────────────────────────────────────
   Tema CLARO (`app/claro-tokens.css`), que é o que está no ar: papel #FBFBFD,
   tinta #0B1220, azul #1550E8, violeta #3B2FCC/#5B3CFF, rosa #E0165F.
   A LOGOMARCA continua jade+cobre — é o mark oficial da marca em qualquer
   tema, mesma geometria de `ClaroLogo` em components/claro/ClaroUI.tsx.
   ═══════════════════════════════════════════════════════════════════════════ */

import sharp from "sharp";
import { mkdirSync, existsSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { PILLARS } from "../lib/pillars.ts";
import { CLARO_PILLAR_ACCENT } from "../components/claro/claroPillarAccent.ts";

const W = 1200, H = 630;
const OUT = "public/og";
const FONT_DIR = "scripts/.og-fonts";

/* Fontes da marca (as MESMAS que o site carrega por next/font). Ficam fora do
   repositório de propósito — são 1,1 MB que só o gerador precisa, e o que o
   site publica é o PNG pronto. Baixadas na primeira execução. */
const FONTS = {
  disp: { file: `${FONT_DIR}/Archivo.ttf`, url: "https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf", name: "Archivo" },
  text: { file: `${FONT_DIR}/IBMPlexSans.ttf`, url: "https://github.com/google/fonts/raw/main/ofl/ibmplexsans/IBMPlexSans%5Bwdth,wght%5D.ttf", name: "IBM Plex Sans" },
};

async function garantirFontes() {
  mkdirSync(FONT_DIR, { recursive: true });
  for (const f of Object.values(FONTS)) {
    if (existsSync(f.file)) continue;
    process.stdout.write(`baixando ${f.name}... `);
    const r = await fetch(f.url);
    if (!r.ok) throw new Error(`falha ao baixar ${f.name}: HTTP ${r.status}`);
    writeFileSync(f.file, Buffer.from(await r.arrayBuffer()));
    console.log("ok");
  }
}

/* Escapa o que vai virar markup do Pango (o `rgba:true` do sharp liga o
   parser de markup, então & e < em texto cru quebrariam a renderização). */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Um bloco de texto renderizado com a fonte da marca. Devolve o buffer PNG
   com transparência mais a altura real ocupada, para empilhar os blocos sem
   chutar espaçamento. */
async function texto({ txt, fonte, tamanho, peso = "", cor, largura, entrelinha = 1.18, align = "low" }) {
  const f = FONTS[fonte];
  const markup = `<span foreground="${cor}" letter_spacing="${Math.round(tamanho * -18)}">${esc(txt)}</span>`;
  const img = sharp({
    text: {
      text: markup,
      font: `${f.name} ${peso} ${tamanho}px`.replace(/\s+/g, " "),
      fontfile: f.file,
      rgba: true,
      width: largura,
      wrap: "word",
      align,
      spacing: Math.round(tamanho * (entrelinha - 1)),
      dpi: 72,
    },
  });
  const buf = await img.png().toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, w: meta.width, h: meta.height };
}

/* ── Quebra de linha BALANCEADA ──────────────────────────────────────────────
   O wrap do Pango enche a primeira linha até o limite e joga o resto na
   seguinte. Em português isso produz o "órfão": a home saía com
   "Crescimento exponencial através da" / "tecnologia" — uma palavra sozinha
   embaixo de uma linha cheia. Fica com cara de texto quebrado, ainda mais no
   card pequeno do WhatsApp.

   Aqui, quando o texto ocupa exatamente DUAS linhas, testamos cada fronteira
   de palavra e escolhemos a que deixa as duas linhas mais parecidas em
   largura, gravando um "\n" explícito. Com três linhas ou mais, deixa o wrap
   normal: balancear texto longo costuma piorar a leitura. */
async function larguraDe(txt, fonte, tamanho, peso) {
  const r = await texto({ txt, fonte, tamanho, peso, cor: "#000000", largura: 4000, entrelinha: 1 });
  return r.w;
}

async function balancear(txt, { fonte, tamanho, peso, largura }) {
  const total = await larguraDe(txt, fonte, tamanho, peso);
  /* A folga de 8px não é decoração. O subtítulo da home mede EXATAMENTE 980px
     de linha única e a caixa também é 980 — com `<=` o teste dizia "cabe" e o
     Pango quebrava assim mesmo, deixando "só." órfão embaixo. Medido, não
     suposto: largura 4000 devolvia w=980 h=27 (uma linha) e largura 980
     devolvia h=69 (duas). */
  const FOLGA = 8;
  if (total <= largura - FOLGA) return txt;  // cabe em uma linha
  if (total > (largura - FOLGA) * 2) return txt; // precisa de 3+ linhas
  const palavras = txt.split(/\s+/);
  if (palavras.length < 3) return txt;
  let melhor = null;
  for (let i = 1; i < palavras.length; i++) {
    const a = palavras.slice(0, i).join(" ");
    const b = palavras.slice(i).join(" ");
    const [la, lb] = [await larguraDe(a, fonte, tamanho, peso), await larguraDe(b, fonte, tamanho, peso)];
    if (la > largura - FOLGA || lb > largura - FOLGA) continue;
    const dif = Math.abs(la - lb);
    if (!melhor || dif < melhor.dif) melhor = { dif, txt: `${a}\n${b}` };
  }
  return melhor ? melhor.txt : txt;
}

/* ── Fundo: papel + trilho de marca no topo + brilho do acento ───────────────
   Sem <text> no SVG de propósito: o librsvg dentro do libvips depende do
   fontconfig do sistema para achar fonte por nome, e a máquina que roda este
   script não tem Archivo instalada. Todo texto entra depois, por composite,
   apontando o arquivo .ttf direto (`fontfile`) — determinístico em qualquer
   máquina. */
function svgFundo(acento) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="trilho" x1="0" y1="0" x2="${W}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1550E8"/><stop offset="0.42" stop-color="#3B2FCC"/>
      <stop offset="0.72" stop-color="#5B3CFF"/><stop offset="1" stop-color="#E0165F"/>
    </linearGradient>
    <radialGradient id="brilho" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${acento}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${acento}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="brilho2" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#5B3CFF" stop-opacity="0.13"/>
      <stop offset="1" stop-color="#5B3CFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="mA" x1="6" y1="58" x2="20" y2="8" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0FA968"/><stop offset="1" stop-color="#2DD4A0"/>
    </linearGradient>
    <linearGradient id="mB" x1="44" y1="58" x2="58" y2="8" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0B7A4C"/><stop offset="1" stop-color="#6FE3B4"/>
    </linearGradient>
    <linearGradient id="mC" x1="10" y1="50" x2="56" y2="10" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#C4763C"/><stop offset="1" stop-color="#D99461"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#FBFBFD"/>
  <ellipse cx="${W - 90}" cy="${H - 40}" rx="520" ry="380" fill="url(#brilho)"/>
  <ellipse cx="${W - 40}" cy="70" rx="360" ry="260" fill="url(#brilho2)"/>
  <rect y="0" width="${W}" height="9" fill="url(#trilho)"/>
  <!-- mark oficial da marca: MESMA geometria de ClaroLogo (viewBox 0 0 64 64),
       jade + cobre, que valem em qualquer tema por serem a identidade -->
  <g transform="translate(72,56)">
    <rect x="8" y="8" width="9" height="48" rx="4.5" fill="url(#mA)"/>
    <rect x="47" y="8" width="9" height="48" rx="4.5" fill="url(#mB)"/>
    <path d="M14 42 L28 34 L36 38 L52 22" stroke="url(#mC)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M44 20 L54 18 L52 28 Z" fill="#D99461"/>
  </g>
  <rect x="72" y="${H - 96}" width="86" height="5" rx="2.5" fill="${acento}"/>
</svg>`;
}

/* Pílula do departamento/seção: retângulo arredondado na cor do acento, com
   8% de opacidade de fundo — mesmo tratamento dos chips do site. */
function svgPilula(largura, altura, acento) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}">
  <rect width="${largura}" height="${altura}" rx="${altura / 2}" fill="${acento}" fill-opacity="0.10" stroke="${acento}" stroke-opacity="0.30"/>
</svg>`;
}

/* Corta a linha excedente em vez de deixar o texto vazar para fora da arte:
   o card do WhatsApp corta a imagem, não o texto, então um título longo demais
   viraria uma frase decapitada no meio. */
function limitar(txt, max) {
  const t = String(txt).trim();
  return t.length <= max ? t : t.slice(0, max - 1).replace(/[\s,;:—-]+$/, "") + "…";
}

/* Faixa vertical em que o bloco de conteúdo pode viver: abaixo da assinatura
   da marca e acima do traço de acento. O bloco é CENTRALIZADO nela — página de
   título curto (um departamento) e de título longo (a home) ficam com o mesmo
   equilíbrio, em vez de a curta deixar 250 px de vazio embaixo. */
const AREA_TOPO = 186, AREA_BASE = 506;

async function gerar({ nome, chapeu, titulo, sub, acento }) {
  const camadas = [];

  // marca-nominativa ao lado do mark
  const marca = await texto({ txt: "HyperGrow", fonte: "disp", tamanho: 34, peso: "Bold", cor: "#0B1220", largura: 400 });
  camadas.push({ input: marca.buf, left: 72 + 64 + 18, top: 56 + Math.round((64 - marca.h) / 2) });

  const chap = await texto({ txt: chapeu.toUpperCase(), fonte: "text", tamanho: 21, peso: "SemiBold", cor: acento, largura: 900 });
  const subTxt = sub ? await balancear(limitar(sub, 128), { fonte: "text", tamanho: 27, peso: "", largura: 980 }) : null;
  const s = subTxt ? await texto({ txt: subTxt, fonte: "text", tamanho: 27, peso: "", cor: "#3E4A61", largura: 980, entrelinha: 1.42 }) : null;

  /* AUTOAJUSTE do corpo do título. O primeiro rascunho usava 62px fixo e o
     título da home (duas linhas) empurrava o subtítulo POR CIMA do traço de
     acento — defeito que só apareceu ao olhar o PNG, não no código. Em vez de
     encurtar a frase à mão (que quebraria de novo no próximo título longo), o
     corpo desce até o bloco caber na faixa. Se nem 44px couber, o `limitar()`
     já garantiu que o texto não é infinito e o pior caso é encostar. */
  const pilH = 50;
  const ALTURA_UTIL = AREA_BASE - AREA_TOPO;
  let tit = null;
  for (const corpo of [62, 56, 50, 44]) {
    const txt = await balancear(limitar(titulo, 86), { fonte: "disp", tamanho: corpo, peso: "Bold", largura: 1040 });
    tit = await texto({ txt, fonte: "disp", tamanho: corpo, peso: "Bold", cor: "#0B1220", largura: 1040, entrelinha: 1.16 });
    if (pilH + 26 + tit.h + (s ? 32 + s.h : 0) <= ALTURA_UTIL) break;
  }

  const alturaBloco = pilH + 26 + tit.h + (s ? 32 + s.h : 0);
  let y = AREA_TOPO + Math.max(0, Math.round((ALTURA_UTIL - alturaBloco) / 2));

  // chapéu (departamento / seção) dentro da pílula
  const pilW = chap.w + 44;
  camadas.push({ input: Buffer.from(svgPilula(pilW, pilH, acento)), left: 72, top: y });
  camadas.push({ input: chap.buf, left: 72 + 22, top: y + Math.round((pilH - chap.h) / 2) });
  y += pilH + 26;

  camadas.push({ input: tit.buf, left: 72, top: y });
  y += tit.h + 32;

  if (s) camadas.push({ input: s.buf, left: 72, top: y });

  /* `palette: false` de propósito. Com paleta de 256 cores os dois brilhos
     radiais do fundo saíam com anéis concêntricos visíveis (banding) — fica
     barato em bytes e caro em acabamento, justo no arquivo que representa a
     marca em toda mensagem compartilhada. Cor cheia custa ~30 KB a mais por
     imagem e a diferença é invisível para o visitante: a OG só é baixada pelo
     robô do WhatsApp/LinkedIn, nunca por quem navega no site. */
  const png = await sharp(Buffer.from(svgFundo(acento)))
    .composite(camadas)
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  const destino = `${OUT}/${nome}.png`;
  writeFileSync(destino, png);
  const m = await sharp(png).metadata();
  return { destino, bytes: png.length, dim: `${m.width}x${m.height}` };
}

/* ── O catálogo de imagens ───────────────────────────────────────────────────
   Uma por SEÇÃO do site, não uma por URL. As 22 páginas de /servicos/[slug]
   compartilham a imagem do DEPARTAMENTO a que pertencem (5 imagens), que é o
   que o dono pediu: card específico o suficiente para o leitor saber do que é
   o link, sem 22 arquivos para manter sincronizados a cada serviço novo. */
const PAGINAS = [
  { nome: "home", chapeu: "Agência de tecnologia", acento: "#1550E8",
    titulo: "Crescimento exponencial através da tecnologia",
    sub: "Site, loja virtual, marketing, conteúdo e agentes de IA operando como um sistema só." },
  { nome: "servicos", chapeu: "Serviços", acento: "#1550E8",
    titulo: "22 serviços, 5 departamentos, um time só",
    sub: "Do site que abre rápido ao agente de IA que atende sozinho." },
  { nome: "sobre", chapeu: "Quem constrói", acento: "#3B2FCC",
    titulo: "Quem constrói e o que já está no ar",
    sub: "Produtos próprios e projetos de cliente que você abre e confere agora." },
  { nome: "contato", chapeu: "Contato", acento: "#E0165F",
    titulo: "Fale com a HyperGrow",
    sub: "Conte o gargalo da sua operação. Resposta em até 1 dia útil." },
  { nome: "blog", chapeu: "Blog", acento: "#3B2FCC",
    titulo: "Estratégia e operação explicadas sem enrolação",
    sub: "Guias práticos sobre site, e-commerce, marketing e inteligência artificial." },
  { nome: "ferramentas", chapeu: "Ferramentas grátis", acento: "#0A6C9E",
    titulo: "Ferramentas grátis para vender mais online",
    sub: "Calculadora de ROAS, preço de marketplace, link de WhatsApp e prévia do Google." },
  { nome: "clinicas", chapeu: "Plano Clínicas", acento: "#B0155F",
    titulo: "Pacote de crescimento para clínicas e consultórios",
    sub: "Presença, agenda cheia e atendimento automatizado para médicos, dentistas e estética." },
  { nome: "institucional", chapeu: "HyperGrow", acento: "#1550E8",
    titulo: "Tecnologia que faz a sua empresa crescer",
    sub: "Agência de tecnologia e crescimento para e-commerce e serviços." },
];

/* As 5 do catálogo de departamentos saem da FONTE ÚNICA — rótulo e descrição
   nunca digitados aqui. */
for (const p of PILLARS) {
  PAGINAS.push({
    nome: `servicos-${p.key}`,
    // "Serviços" no chapéu e o departamento no título: repetir o mesmo texto
    // nos dois lugares (era o primeiro rascunho) desperdiça a única linha que
    // o leitor lê de verdade no card do WhatsApp.
    chapeu: "Serviços",
    acento: CLARO_PILLAR_ACCENT[p.key],
    titulo: p.label,
    sub: p.desc,
  });
}

await garantirFontes();
mkdirSync(OUT, { recursive: true });
let total = 0;
for (const p of PAGINAS) {
  const r = await gerar(p);
  total += r.bytes;
  console.log(String(r.bytes).padStart(7), r.dim, r.destino);
}
console.log("---");
console.log(`${PAGINAS.length} imagens · ${total} bytes · ${(total / 1024).toFixed(1)} KB`);

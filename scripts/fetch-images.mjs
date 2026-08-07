#!/usr/bin/env node
/**
 * fetch-images.mjs — baixa e otimiza as fotos reais do site HyperGrow.
 *
 * Fonte: StockSnap.io (https://stocksnap.io)
 * Licenca: Creative Commons CC0 1.0 (dominio publico).
 *   "every single image on StockSnap are governed exclusively by the generous
 *    terms of the Creative Commons CC0 license" — https://stocksnap.io/license
 *   Uso comercial permitido. Atribuicao NAO obrigatoria.
 *
 * ATENCAO (risco residual, ler antes de usar em anuncio pago):
 *   CC0 cobre o DIREITO AUTORAL da foto, mas NAO garante direito de imagem
 *   das pessoas retratadas (model release) nem marcas/logos que aparecam.
 *   Para site institucional o risco e baixo; para anuncio pago com rosto em
 *   destaque, prefira foto propria.
 *
 * Uso:  node scripts/fetch-images.mjs
 * Saida: public/fotos/*.webp  +  public/fotos/CREDITOS.json
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUT_DIR = path.join(process.cwd(), 'public', 'fotos');
const MAX_WIDTH = 1600; // teto; nunca faz upscale (fonte StockSnap = 960px)
const QUALITY = 82;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

/** Fotos escolhidas a dedo (fotografia real, sem cara de IA, sem marca d'agua). */
const PHOTOS = [
  {
    slug: 'checkout-loja-virtual',
    id: 'RZWM4T2UAD',
    titulo: 'Ecommerce Shopping',
    alt: 'Mao segurando cartao de credito em frente a um notebook com uma loja virtual aberta',
  },
  {
    slug: 'embalando-pedido',
    id: 'WP1KHDXGOY',
    titulo: 'Box Boxes',
    alt: 'Pessoa embalando um pedido em caixa de papelao sobre a bancada de trabalho',
  },
  {
    slug: 'painel-resultados',
    id: 'RCFX768X06',
    titulo: 'Analytics Charts',
    alt: 'Maos digitando em notebook com painel de metricas e graficos na tela',
  },
  {
    slug: 'escritorio-equipe',
    id: '0E0M5W9O3V',
    titulo: 'Working Typing',
    alt: 'Profissional trabalhando em notebook em escritorio real com parede de tijolos',
  },
  {
    slug: 'reuniao-projeto',
    id: 'Y01VDYAX63',
    titulo: 'Writing Papers',
    alt: 'Duas pessoas revisando anotacoes e notebook durante reuniao de projeto',
  },
  {
    slug: 'operacao-diaria',
    id: 'Q2V5YXHWBP',
    titulo: 'Laptop Code',
    alt: 'Profissional concentrado no notebook ao lado da janela em escritorio claro',
  },

  /* ── Lote 2026-08-06: uma foto POR SERVICO ────────────────────────────────
     Antes so 6 dos 22 servicos tinham foto e as outras 16 paginas nao tinham
     imagem nenhuma ("site morto", bronca do dono comparando com concorrente).
     Cada foto abaixo foi ABERTA e olhada antes de entrar (contato em folha de
     miniaturas) — nada escolhido pelo nome do arquivo. Contexto sempre de
     tecnologia / marketing / operacao de empresa; nunca varejo fisico
     generico (a foto de mercearia ja foi bronca real neste projeto).
     O alt descreve a CENA, nunca "nossa equipe" — e foto de banco. */
  {
    slug: 'posicao-google',
    id: '959IURDRGJ',
    titulo: 'SEO Computer',
    alt: 'Monitor sobre uma mesa clara exibindo um grafico de trafego em curva de crescimento',
  },
  {
    slug: 'servidores-datacenter',
    id: 'ZYGIOUX4QU',
    titulo: 'Servers Woman',
    alt: 'Duas profissionais com notebooks no corredor de um data center entre racks de servidores',
  },
  {
    slug: 'cartao-no-celular',
    id: 'QDJDQOP3R0',
    titulo: 'Man Smartphone',
    alt: 'Homem sentado em um cafe consultando o celular com as duas maos',
  },
  {
    slug: 'treinamento-comercial',
    id: 'GDRASWWKFQ',
    titulo: 'Woman Business',
    alt: 'Profissional apresentando a um grupo diante de um quadro coberto de post-its',
  },
  {
    slug: 'feed-instagram',
    id: '3M1WKORDOL',
    titulo: 'Instagram Social Media',
    alt: 'Celular com um feed de rede social aberto sobre um caderno pautado e uma caneta',
  },
  {
    slug: 'esboco-layout',
    id: '20VFXOOUWG',
    titulo: 'Design Wireframe',
    alt: 'Caderno com o rascunho a mao do layout de uma pagina ao lado de um celular',
  },
  {
    slug: 'gravando-video',
    id: 'HP3LHTW28Z',
    titulo: 'Woman Video',
    alt: 'Mulher segurando uma filmadora apontada para a camera diante de uma parede de tijolos',
  },
  {
    slug: 'celular-sofa',
    id: 'XEAGPIPKRN',
    titulo: 'Browsing Smartphone',
    alt: 'Mulher sentada no sofa junto a janela deslizando o feed do celular',
  },
  {
    slug: 'escrevendo-conteudo',
    id: 'QBMFQAYA0W',
    titulo: 'Blogging Typing',
    alt: 'Maos digitando em um notebook com o editor de um artigo aberto na tela',
  },
  {
    slug: 'escrevendo-email',
    id: 'YBKJ1G35EX',
    titulo: 'Laptop Typing',
    alt: 'Vista de cima de uma pessoa escrevendo no notebook ao lado de uma xicara de cafe',
  },
  {
    slug: 'camera-estudio',
    id: 'PDNKBKWJFI',
    titulo: 'Camera Studio',
    alt: 'Camera profissional montada em tripe apontada para o cenario de um estudio',
  },
  {
    slug: 'fotografa-camera',
    id: 'JMV8OP7OGI',
    titulo: 'Female Photographer',
    alt: 'Fotografa segurando uma camera DSLR pronta para o proximo clique',
  },
  {
    slug: 'still-produtos',
    id: 'I8SLDUOMYC',
    titulo: 'Makeup Products',
    alt: 'Produtos de maquiagem organizados sobre fundo branco em um still de catalogo',
  },
  {
    slug: 'flatlay-marca',
    id: 'XJN5SPL3IM',
    titulo: 'Top Workspace',
    alt: 'Caderno preto, caneta, relogio e notebook alinhados em uma composicao vista de cima',
  },
  {
    slug: 'letra-desenho',
    id: 'Y2P39NGLLO',
    titulo: 'Writing Drawing',
    alt: 'Mao desenhando letras a lapis em uma folha grande sobre a mesa',
  },
  {
    slug: 'atendimento-crm',
    id: 'C5EGG3XLRH',
    titulo: 'Woman Working',
    alt: 'Profissional de oculos atendendo pelo celular com o notebook aberto na mesa',
  },
  {
    slug: 'videochamada-comercial',
    id: 'ZDSQP4E3UL',
    titulo: 'Video Meeting',
    alt: 'Homem sorrindo ao olhar para a tela do celular durante uma reuniao, com colegas ao fundo',
  },
];

const srcUrl = (id) => `https://cdn.stocksnap.io/img-thumbs/960w/${id}.jpg`;
const pageUrl = (id) => `https://stocksnap.io/photo/${id}`;

async function download(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Referer: 'https://stocksnap.io/' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const creditos = [];

  for (const photo of PHOTOS) {
    const url = srcUrl(photo.id);
    const raw = await download(url);

    const meta = await sharp(raw).metadata();
    const width = Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH);

    const file = `${photo.slug}.webp`;
    const outPath = path.join(OUT_DIR, file);
    const info = await sharp(raw)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outPath);

    const kb = (info.size / 1024).toFixed(1);
    console.log(`ok  ${file}  ${info.width}x${info.height}  ${kb} KB`);

    creditos.push({
      arquivo: `/fotos/${file}`,
      alt: photo.alt,
      titulo: photo.titulo,
      fonte: 'StockSnap.io',
      pagina: pageUrl(photo.id),
      licenca: 'CC0 1.0 (dominio publico)',
      licencaUrl: 'https://stocksnap.io/license',
      usoComercial: true,
      atribuicaoObrigatoria: false,
      largura: info.width,
      altura: info.height,
      bytes: info.size,
    });
  }

  await writeFile(
    path.join(OUT_DIR, 'CREDITOS.json'),
    JSON.stringify(
      {
        gerado: new Date().toISOString(),
        observacao:
          'CC0 cobre o direito autoral da foto. Nao cobre direito de imagem das pessoas retratadas nem marcas visiveis. Uso institucional no site: risco baixo. Anuncio pago com rosto em destaque: prefira foto propria.',
        fotos: creditos,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  console.log(`\n${creditos.length} fotos em public/fotos/ + CREDITOS.json`);
}

main().catch((err) => {
  console.error('falhou:', err.message);
  process.exit(1);
});

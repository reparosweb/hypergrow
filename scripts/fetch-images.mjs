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

---
name: hg-servico-novo
description: Checklist exato para adicionar um novo serviço ao site HyperGrow sem ele desaparecer silenciosamente do hub. Use sempre que for criar um serviço novo em lib/site-services.ts.
---

# Como adicionar um serviço novo — checklist obrigatório

Pular o passo 2 faz o serviço sumir do hub `/servicos` **silenciosamente** (sem erro de build) — é o bug mais fácil de cometer aqui.

## 1. `lib/site-services.ts` — novo objeto no array `siteServices`

O tipo `SiteService` tem **13 campos, todos obrigatórios**:

```ts
{
  slug: string;              // vira a URL /servicos/<slug>
  icon: string;               // nome de ícone lucide
  title: string;
  desc: string;                // curta, usada no card da home
  long: string;                 // abertura da página (2-3 frases)
  body: { h: string; p: string }[]; // 3 blocos, 300-500 palavras cada
  glow: string;                 // rgba — deve bater com a cor do pilar
  accent: string;               // hex — deve bater com a cor do pilar
  tags: string[];
  outcomes: string[];           // bullets de resultado
  faq: { q: string; a: string }[]; // vira FAQPage schema
  keyword: string;              // palavra-chave primária
  metaDescription: string;      // ≤ 155 caracteres — MEDIR, não estimar
}
```

## 2. `lib/pillars.ts` — acrescentar o slug ao pilar certo

Adicionar o `slug` ao array `slugs` de UM dos 4 pilares (`vender`, `atrair`, `marca`, `ia`). **Sem isso, `pillarOf()` cai no fallback `PILLARS[0]` calado e o serviço não aparece em `/servicos` nem tem cor de pilar correta.**

Usar as MESMAS cores (`glow`/`accent`) do pilar escolhido no passo 1 — não inventar uma cor nova.

## 3. `lib/pillars.ts` — `FLAGSHIP_SLUGS` (opcional)

Só se o serviço for um "carro-chefe" com célula maior no bento da home.

## 4. `scripts/gen-llms-txt.mjs` — atualizar o array `PILLARS` duplicado

Os pilares estão hardcoded de novo neste arquivo (não importam de `lib/pillars.ts`). Adicionar o slug lá também, ou o serviço cai na seção "### Outros" do `llms.txt`.

Depois: `node scripts/gen-llms-txt.mjs` — reescreve `public/llms.txt`.

## 5. `components/site/ServiceGlyphs.tsx` — grafismo SVG (recomendado, não obrigatório)

Cada serviço tem um desenho de linha próprio que diz "o que é" sem precisar ler. Sem ele, o card usa o ícone lucide genérico do passo 1 — funciona, mas é menos forte visualmente. Hoje 2 dos 19 (`seo`, `hospedagem`) ainda não têm.

## 6. `lib/content.ts` — se o agente de chat (`/api/chat`) precisar conhecer o serviço

Esse array é o que alimenta o system prompt do bot. Não é o mesmo array de `site-services.ts`.

## O que é AUTOMÁTICO — não precisa tocar

- Sitemap (`app/sitemap.ts`)
- SSG da página (`app/servicos/[slug]/page.tsx` → `generateStaticParams`)
- Schema (Service + BreadcrumbList + FAQPage)
- ItemList schema e contagem no hub `/servicos`
- Cards da home

## Antes de commitar

- `npm run build` limpo
- `node scripts/fix-style-hydration.mjs --check` sem achado
- Nenhum número ou prova de terceiro copiado (ver skill `hg-regras-de-bug`, item 8)
- `metaDescription` medida (≤155) e `title` do card ≤60

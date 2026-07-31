# HyperGrow — prompt para iniciar nova conversa

> Copie TUDO abaixo da linha e cole como primeira mensagem numa conversa nova.

---

# PROJETO: site da agência HyperGrow — continuar

Você é o Claude Code trabalhando em `C:\Users\user\Downloads\nexlab` (a marca é **HyperGrow**; o nome da pasta, `nexlab`, é interno e antigo).

**ANTES DE QUALQUER COISA, leia:**
1. `C:\Users\user\.claude\projects\C--Users-user-Downloads\memory\nexlab_project.md` — infra, histórico, decisões e armadilhas.
2. `C:\Users\user\.claude\plans\ajuste-a-capa-de-tingly-kernighan.md` — o plano de redesign aprovado (fases 0-4).
3. Este arquivo inteiro.

## Quem é o dono (Adriano)

Não é desenvolvedor. Não vai ler o seu diff nem perceber um erro de lógica — vai confiar no que você disser. Portanto:

- **Verifique de verdade antes de dizer "pronto".** Build limpo + deploy + conferido no ar. Ele já foi prejudicado por afirmação não verificada.
- **Nunca invente.** Não sabe? Diga "não sei" e vá checar.
- **Passo a passo numerado**, onde clicar, botão exato, SQL completo pronto para colar.
- Responda **em português do Brasil**. Primeiro a resposta, depois o raciocínio, por fim o risco.
- Ele quer nível mundial e **odeia "cara de IA"** (gradiente azul/roxo genérico, emoji como ícone, tudo arredondado igual). Já rejeitou isso duas vezes.
- Quando pedir várias coisas, ele quer **em lote**, não uma por mensagem.

## Infra (existe, NÃO recriar)

| Item | Valor |
|---|---|
| Produção | **https://hypergrow-lovat.vercel.app** |
| GitHub | `reparosweb/hypergrow` (auto-deploy no push p/ `main`) |
| Vercel | projeto `hypergrow`, time `reparosweb-2430s-projects` |
| Supabase | `htaxogmtaxebfbyetxel` (MCP do Supabase NÃO acessa — usar navegador) |
| Stack | Next.js 14 App Router + TypeScript |
| Admin | `/admin` (senha na memória) — CRM Kanban + cobranças Asaas |

⚠️ **Git push trava**: o Credential Manager do Windows abre janela de login. Se der `403`, é conta errada (já aconteceu com `clicouenviou-maker` e `adrianrosa1`; o repo é da `reparosweb`). Rode o push em background e peça para ele concluir o login.

## Arquitetura do site público

```
app/page.tsx                      → server component; passa lista ENXUTA de serviços via props
components/site/HypergrowSite.tsx → a home inteira (client, // @ts-nocheck, ~950 linhas)
components/site/ServiceGlyphs.tsx → 19 grafismos SVG (um por serviço)
components/site/TrustMarquee.tsx  → prova social
lib/pillars.ts                    → PILARES (módulo LEVE — importar daqui no cliente!)
lib/site-services.ts              → 19 serviços com conteúdo completo (PESADO — só server)
lib/blog-posts.ts                 → 4 posts
app/servicos/[slug]/page.tsx      → 19 páginas (SSG)
app/blog/, app/blog/[slug]/       → blog (SSG)
app/hg-tokens.css, hg-styles.css  → design system
```

## Sistema visual (NÃO quebrar)

**Paleta** — saiu azul/violeta/magenta (assinatura de site gerado por IA). Hoje: grafite `#12151A`/`#0D1013`, texto bone `#E8E2D9`, e **4 cores por pilar**:

| Pilar | accent (traço) | rail (trilho) | Serviços |
|---|---|---|---|
| Vender online | `#2DD4A0` | `#0FA968` | 6 |
| Atrair demanda | `#E09A63` | `#C4763C` | 3 |
| Marca & conteúdo | `#D3B78E` | `#D3B78E` | 9 |
| Operar com IA | `#5FD3C6` | `#3BA8A0` | 1 |

Contrastes calculados contra o fundo real do card (`#191D23`), piso 7,2:1. **Proibido azul e violeta.**

**Tipografia**: Archivo (display) + IBM Plex Sans (corpo) + IBM Plex Mono (dados), via `next/font`.

**Regras aprendidas (custaram bug real):**
- Elemento decorativo com largura fixa em px → **sempre** `min(Xpx, 100%)`. Senão vaza no mobile e o pinch-zoom revela faixa morta.
- Em SVG com `<defs>`, **nunca** usar `useId()` para IDs — gera IDs diferentes no servidor e no cliente, dispara erro de hidratação React #418/#423/#425 e faz o React **descartar o HTML do servidor** (custo enorme de performance).
- Grids: `repeat(auto-fit, minmax(min(100%, Xpx), 1fr))`.
- Sem `filter: blur()` / `backdrop-filter` em elemento grande fixo (trava o scroll no mobile).
- Campos de formulário precisam de `id` + `name` + `htmlFor` + `autoComplete`.

## O QUE JÁ ESTÁ FEITO (não refazer)

- ✅ Mobile corrigido (sem overflow, sem sobreposição, pinch-zoom ok)
- ✅ Paleta jade/cobre + tipografia nova + poda do "kit IA"
- ✅ 19 páginas de serviço com conteúdo próprio + FAQ + schema
- ✅ Blog com 4 posts (schema Article/FAQPage/Breadcrumb)
- ✅ **19 grafismos SVG** — cada card diz o que é sem leitura
- ✅ Home: 4 pilares, blocos por pilar, seção "dores que resolvemos", prova verificável (substituiu depoimentos inventados), card de IA invertido, card horizontal no mobile
- ✅ 10 capas de portfólio corretas (6 prints reais + 4 cards de marca)
- ✅ Erro de hidratação corrigido · emojis removidos · `llms.txt` gerado da fonte real
- ✅ Bundle da home: 59,5 kB → **23,1 kB** (First Load 149 → 113 kB); −100 kB de fontes

## ⚠️ AÇÕES QUE SÓ O ADRIANO PODE FAZER (cobrar, estão bloqueando)

1. **Registrar `hypergrow.com.br`** no registro.br (**verificado disponível**, ~R$40/ano). É pré-requisito de quase tudo. Depois apontar na Vercel e avisar → trocar `SITE_URL` em `lib/seo.ts` (1 linha) + redirect 308.
2. **Criar `contato@hypergrow.com.br`** — o domínio **não existe** (DNS NXDOMAIN confirmado), então **todo e-mail enviado para lá volta com erro**. Foi removido do schema JSON-LD, mas **CONTINUA VISÍVEL em 4 lugares** e precisa de decisão do dono:
   - `components/site/HypergrowSite.tsx` linha ~794 (seção Contato) e ~870 (rodapé)
   - `app/privacidade/page.tsx` linha ~37 e `app/termos/page.tsx` linha ~33 (canal de contato exigido pela LGPD — não remover sem pôr outro no lugar)

   Hoje o **único canal que funciona** é o formulário (`/api/lead` → Supabase, testado). O WhatsApp não funciona (falta `NEXT_PUBLIC_WHATSAPP`). Ou seja: se um lead não usar o formulário, **não há como ele falar com a agência**. Resolver o domínio conserta os dois de uma vez; enquanto isso, avaliar trocar o e-mail por link para o formulário.
3. **Definir `NEXT_PUBLIC_WHATSAPP`** na Vercel — hoje **nenhum** botão de WhatsApp funciona (caem em `#contato`).
4. **GA4 + GTM + Search Console + Bing Webmaster** — hoje não há **nenhuma** medição; é impossível saber se o site é achado.
5. **Registrar o webhook do Asaas** (Integrações → Webhooks → `https://hypergrow-lovat.vercel.app/api/webhook/asaas`, token em `ASAAS_WEBHOOK_TOKEN`). Sem ele, o PIX é gerado mas o status não confirma sozinho.
6. **Conferir o plano da Vercel** — Hobby não permite uso comercial.
7. **Vídeo do hero** (`public/media/launch.mp4`) é filmagem **Starship/SpaceX** de CDN deles — questão de licença para uso comercial.

## PRÓXIMOS PASSOS (priorizados por auditoria com medição real)

### Performance — meta do dono é 98%
Auditoria mediu: **TBT 3.071 ms** (vale 30% da nota → ~0 ponto). Estado estimado: 45-55 mobile. **O vídeo NÃO é o gargalo** (não é baixado no perfil mobile).

Causa raiz: a home é **um client component único com 1.499 nós, 95% deles fora da tela** no primeiro paint. Prova no próprio site: `/servicos/criacao-de-site` usa o mesmo CSS e faz **TBT 35 ms** com 171 nós.

| Prioridade | Ação | Ganho medido |
|---|---|---|
| ~~P1, P3, P4~~ | ~~fontes + bundle~~ | ✅ **feito** (−100 kB fonte, −63 kB bundle) |
| **P2** | Portfólio: só definir `src` quando a seção chegar perto da tela (`loading="lazy"` não segura — as 10 imagens baixam antes do FCP) | −194.742 B do caminho crítico |
| **P5** | lucide subsetado (~25 ícones em uso de 1.737) ou SVG inline | −78 kB rede, −70 ms TBT |
| **P6** | Vídeo: 8 s + 720p + AV1 + `requestIdleCallback` | **−9,9 MB no desktop** (11,23 MB → ~1,3 MB) |
| **P7** | **Quebrar a home em ilhas / server components** | **TBT 3.071 → 300-600 ms** — é o único caminho para 90+ |
| P9 | Trocar `box-shadow` animado (`.eyebrow .dot`, `.wa-float`) por `opacity`/`transform`; pausar marquee fora da tela | INP/bateria |
| — | ~~Grafismos SVG~~ | **não mexer** — só ~145 ms e custa a identidade visual |

Caminho realista: A (rede, feito+P2+P5+P6) → 65-75 · B (+P7 ilhas) → 88-94 · C (+framer-motion fora do boot) → 95-98.

⚠️ **Medir no PageSpeed oficial** (https://pagespeed.web.dev) — a cota da API estourou nas auditorias e o Lighthouse local desta máquina é **instável** (deu 47/58/49 na mesma versão). Não afirme número sem medir.

### SEO/AEO — nota 70/100 (base técnica boa, autoridade zero)
Aprovado: 19 serviços 200 OK, sitemap com 27 URLs, schema sem erro, H1 único, 100% das imagens com alt, todos os bots de IA liberados (GPTBot/Perplexity/Claude/Google-Extended).

Falta implementar (ordem de impacto ÷ esforço):
1. **Rodapé**: 13 links apontam para `#contato` — trocar por `/servicos/[slug]`, `/blog`, perfis reais.
2. **FAQPage schema na home** (as 7 perguntas já estão visíveis, só falta marcar).
3. Encurtar 4 meta descriptions >155 chars (`producao-fotografica`, `fotos-produtos`, `design-identidade`, `criacao-logo`) e 2 títulos de post >60 chars.
4. **Criar `/servicos`** (hub dos 19) — hoje dá 404 e o `BreadcrumbList` aponta para uma âncora da home. Criar `/sobre` e `/contato` também.
5. **OG image por página** (`next/og`) — hoje as 27 páginas usam a mesma.
6. **Listas e tabelas no conteúdo** — o modelo é só `{h, p}`; não há **uma única** tabela no site. É a maior lacuna de AEO (tabela é o que IA mais cita), e o próprio post "como aparecer no ChatGPT" recomenda isso.
7. Cache imutável para `/public` em `next.config.mjs` (hoje `lucide.min.js` e as imagens revalidam a cada visita).
8. `width`/`height` nas 11 `<img>` da home.

Conteúdo a produzir (alta intenção comercial): páginas por plataforma (`/servicos/loja-virtual-shopify`, `-nuvemshop`, `-vtex`), comparativos com tabela ("Shopify vs Nuvemshop vs Tray"), resto da família "quanto custa", "como escolher uma agência de e-commerce", e **estudos de caso com números reais** (depende de autorização dos clientes).

### Design (crítica com medição)
Já feito: cor por pilar, grafismos, badge, trilho, bento, blocos, card mobile horizontal, IA invertido.
Resta: segmented control no lugar dos 4 botões de filtro; e o dono ainda **não deu retorno visual** sobre os grafismos — pergunte se ficou bom antes de investir mais em visual.

## Como trabalhar aqui

- **Sempre**: ler antes de editar → editar → `npm run build` → commit → push → **conferir no ar** (a Vercel serve HTML em cache ~1 min; use `?cb=123` como cache-buster).
- Verificação visual: **Chrome DevTools MCP** (`mcp__chrome-devtools__*`) é o confiável. `Claude_in_Chrome` cai bastante. Ambos caíram no meio da sessão — se cair, verifique medindo o HTML com `curl` e diga que não viu com os olhos.
- Delegar a agentes funciona bem **se cada um for dono exclusivo de um arquivo** (a home é o mais disputado — não deixe dois agentes nela).
- Scripts utilitários: `scripts/gen-llms-txt.mjs`, `scripts/gen-brand-cards.mjs`, `scripts/apply-pillar-colors.mjs`.
- Não mexer sem pedido: CRM, `/api/*`, cobrança Asaas, banco.

# HyperGrow — site da agência

> **Projeto ISOLADO.** Não misturar com outros projetos da pasta Downloads
> (Agentop, Sorteio, Spotlog, Packslog, NutriSnap, Marido de Aluguel). Cada um
> tem sua própria infra. Marca = **HyperGrow**. Pasta local ainda se chama
> `nexlab` (nome interno antigo; não afeta o site).

## O que é

Site institucional de uma **agência de e-commerce, marketing digital e tecnologia**.
19 serviços em 4 pilares (Vender online / Atrair demanda / Marca & conteúdo /
Operar com IA), blog, portfólio de projetos próprios e de clientes, CRM próprio
em `/admin` e cobrança via Asaas. **Não** é mais vitrine de produtos — esse
posicionamento (Nexlab) foi trocado pelo de agência em 2026-06-07.

## Stack

- Next.js 14.2.35 (App Router) + TypeScript
- Tailwind CSS (só em `/admin`, `/privacidade`, `/termos`) + CSS próprio (`app/hg-tokens.css`, `app/hg-styles.css`) no resto do site
- `framer-motion` está instalado mas só é usado pelo `ChatWidget` (widget flutuante) — nenhuma outra rota o usa
- Supabase (tabela `leads` + admin) · Asaas (cobrança) · OpenAI (agente de chat)

## Infra

| Item | Valor |
|---|---|
| Pasta | `C:\Users\user\Downloads\nexlab` |
| GitHub | `reparosweb/hypergrow` (auto-deploy no push para `main`) |
| Supabase | `htaxogmtaxebfbyetxel` — conta reparosweb. ⚠️ Supabase MCP **não** tem acesso a este projeto (fica em outra conta); operar pelo navegador logado. |
| Vercel | projeto `hypergrow`, time `reparosweb-2430s-projects` (Hobby) |
| URL produção | https://hypergrow-lovat.vercel.app |
| Domínio | hypergrow.com.br — **não registrado** (DNS confirmado morto, verificar antes de assumir que existe) |

## Arquitetura

```
app/page.tsx                        → home (server, passa dados enxutos)
components/site/HypergrowSite.tsx   → a home inteira (client, ~1000 linhas)
components/site/SiteHeader.tsx      → header único, usado em TODAS as rotas
components/site/PageShell.tsx       → shell das páginas institucionais (/servicos, /sobre, /contato)
components/site/ContactForm.tsx     → formulário único (home + /contato)
components/site/DeviceMockup.tsx    → moldura de navegador/celular com screenshot real
components/site/PlatformShowcase.tsx→ grade+tabela de plataformas de e-commerce (só em /servicos/loja-virtual)
lib/pillars.ts                      → pilares (módulo LEVE, seguro pro cliente)
lib/site-services.ts                → 19 serviços com conteúdo completo (PESADO — só server)
lib/projects.ts                     → portfólio (fonte única, usado por home E /sobre)
app/servicos/[slug]/, app/servicos/page.tsx, app/sobre/, app/contato/, app/blog/
```

`lib/products.ts` e ~19 componentes soltos em `components/` (Hero.tsx, Nav.tsx, Footer.tsx etc.) são **código morto** da vitrine antiga — nenhuma rota os importa. Não construa em cima deles.

## Sistema visual (decisão fechada — não mudar sem pedido explícito)

Grafite `#12151A`/`#0D1013`, superfície `#171B20`, texto bone `#E8E2D9`. 4 cores
por pilar (ver `lib/pillars.ts`). **Proibido azul e violeta** — o dono já
rejeitou esse visual duas vezes. Tipografia: Archivo + IBM Plex Sans + IBM Plex
Mono via `next/font`.

## Harness deste projeto

`.claude/agents/` tem 3 agentes especialistas (`hg-frontend`, `hg-conteudo`,
`hg-auditor`). `.claude/skills/` documenta os bugs que já foram ao ar
(`hg-regras-de-bug`), o checklist para adicionar serviço (`hg-servico-novo`) e
o fluxo de deploy (`hg-publicar`). `/verificar` roda a bateria completa antes
de subir. **Consulte antes de editar** — evita repetir bugs já corrigidos.

## Regras herdadas (memória global)

- Nunca demos/simulações — só real, validado em produção
- Conferir antes de entregar: `npm run build` limpo + auditoria de hidratação + conferido no ar
- Nunca quebrar o que funciona
- Usuário não-dev: instruções passo a passo, onde clicar
- Nunca inventar prova social ou número de terceiro (ver `hg-regras-de-bug`)

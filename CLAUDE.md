# Hypergrow — site institucional do estúdio

> **Projeto ISOLADO.** Não acessar nem misturar com outros projetos da pasta Downloads
> (Agentop, Sorteio, Spotlog, Packslog, NutriSnap, reparosweb). Cada um tem sua própria infra.
> Marca = **Hypergrow**. Pasta local ainda se chama `nexlab` (nome interno; não afeta o site).

## O que é
Site institucional (vitrine) da **Hypergrow**, um estúdio que cria e opera SaaS.
Mostra todos os produtos do portfólio com logo, o que cada um resolve e link,
e captura leads (formulário → banco). Construído para ser muito vendedor,
responsivo, mobile-first, com gradientes e efeitos de hover (glow).

## Stack
- Next.js 14.2.35 (App Router) + TypeScript
- Tailwind CSS + framer-motion + lucide-react
- Supabase (tabela `leads`) — opcional na FASE 1, ativado por env vars

## Infra
| Item | Valor |
|---|---|
| Pasta | `C:\Users\user\Downloads\nexlab` |
| GitHub | `reparosweb/hypergrow` (https://github.com/reparosweb/hypergrow.git) |
| Supabase | `htaxogmtaxebfbyetxel` (https://htaxogmtaxebfbyetxel.supabase.co) — conta reparosweb |
| Vercel | projeto `hypergrow`, time `reparosweb-2430s-projects` (Hobby) — **LIVE** |
| URL produção | https://hypergrow-lovat.vercel.app |
| Domínio | hypergrow.com.br _(a registrar/confirmar)_ |

## Status FASE 1 — NO AR (2026-06-07)
- ✅ Deploy Vercel READY (auto-deploy do branch `main`).
- ✅ Env vars setadas: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.
- ✅ Tabela `leads` criada no Supabase + RLS.
- ✅ Testado end-to-end: POST /api/lead → 200 → row inserida no banco → confirmada e teste removido.
- ⏳ Falta: NEXT_PUBLIC_WHATSAPP (número), notificação por e-mail (Resend), domínio próprio.

> ⚠️ O Supabase MCP NÃO tem acesso a `htaxogmtaxebfbyetxel` (está em outra conta:
> só vê ConviteVip1 e Fácilbicas). Operar esse Supabase pelo NAVEGADOR do usuário (logado).

## Produtos na vitrine (fonte: `lib/products.ts`)
1. **Agentop** — agenda/gestão para clínicas (agentop.com.br)
2. **Marido de Aluguel** — sites + captação para reparos (reparosweb)
3. **Sorteio Bilionário IA** — palpites de loteria com IA (sorteiobilionario.com.br)
4. **NutriSnap** — calorias por foto (calorias.app.br)
5. **Unixx** — prospecção/CRM B2B (ex-Spotlog, renomeado para produto de mercado)
6. **Packslog** — fulfillment/logística

## Fases
- **FASE 1 (feita):** vitrine + captura de leads no banco + botão WhatsApp.
- **FASE 2 (em andamento):** painel admin (login) para leads/clientes/assinaturas.
- **FASE 3:** automações reais (WhatsApp API, e-mail Resend, webhooks de assinatura).

## Variáveis de ambiente
Ver `.env.example`. Sem elas o site funciona, mas o formulário retorna
fallback pedindo contato por WhatsApp (lead fica no log da Vercel, não some).

## Regras herdadas (memória global)
- NUNCA demos/simulações — só real, validado em produção.
- Conferir antes de entregar: `tsc` limpo + `build` OK + deploy READY.
- Nunca quebrar o que funciona. SELECT ok; UPDATE/DELETE precisa aprovação.
- Usuário não-dev: instruções passo a passo, onde clicar.

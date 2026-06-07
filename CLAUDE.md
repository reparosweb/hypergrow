# Nexlab — site institucional do estúdio

> **Projeto ISOLADO.** Não acessar nem misturar com outros projetos da pasta Downloads
> (Agentop, Sorteio, Spotlog, Packslog, NutriSnap, reparosweb). Cada um tem sua própria infra.

## O que é
Site institucional (vitrine) da **Nexlab**, um estúdio que cria e opera SaaS.
Mostra todos os produtos do portfólio com logo, o que cada um resolve e link,
e captura leads (formulário → banco). Construído para ser muito vendedor,
responsivo, mobile-first, com gradientes, imagens e efeitos de hover (glow).

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + framer-motion + lucide-react
- Supabase (tabela `leads`) — opcional na FASE 1, ativado por env vars

## Infra (PREENCHER quando criar)
| Item | Valor |
|---|---|
| Pasta | `C:\Users\user\Downloads\nexlab` |
| GitHub | _(a criar)_ |
| Supabase | _(a criar — projeto NOVO, exclusivo da Nexlab)_ |
| Vercel | _(a criar — confirmar a conta antes de deploy)_ |
| Domínio | nexlab.com.br _(a registrar/confirmar)_ |

## Produtos na vitrine (fonte: `lib/products.ts`)
1. **Agentop** — agenda/gestão para clínicas (agentop.com.br)
2. **Marido de Aluguel** — sites + captação para reparos (reparosweb)
3. **Sorteio Bilionário IA** — palpites de loteria com IA (sorteiobilionario.com.br)
4. **NutriSnap** — calorias por foto (calorias.app.br)
5. **Unixx** — prospecção/CRM B2B (ex-Spotlog, renomeado para produto de mercado)
6. **Packslog** — fulfillment/logística

## Fases
- **FASE 1 (feita):** vitrine + captura de leads no banco + botão WhatsApp.
- **FASE 2:** painel admin (login) para leads/clientes/assinaturas de todas as ferramentas.
- **FASE 3:** automações reais (WhatsApp API, e-mail Resend, webhooks de assinatura).

## Variáveis de ambiente
Ver `.env.example`. Sem elas o site funciona, mas o formulário retorna
fallback pedindo contato por WhatsApp (não perde o lead — fica no log da Vercel).

## Regras herdadas (memória global)
- NUNCA demos/simulações — só real, validado em produção.
- Conferir antes de entregar: `tsc` limpo + `build` OK + deploy READY.
- Nunca quebrar o que funciona. SELECT ok; UPDATE/DELETE precisa aprovação.
- Usuário não-dev: instruções passo a passo, onde clicar.

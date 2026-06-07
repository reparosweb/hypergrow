# 🚀 Como colocar o Nexlab no ar (passo a passo)

Você não precisa ser programador. Siga na ordem. Onde aparecer **[CLIQUE]**, é botão pra clicar.

O site **já funciona** sem nada disso (mostra a vitrine e o botão de WhatsApp).
Os passos abaixo são para: (1) publicar na internet e (2) salvar os leads num banco.

---

## PARTE 1 — Banco de leads (Supabase) — ~5 min

1. Acesse https://supabase.com e faça login (ou crie conta grátis).
2. **[CLIQUE]** em **New project**.
   - Name: `nexlab`
   - Database Password: crie uma senha forte e **guarde**.
   - Region: `South America (São Paulo)`.
   - **[CLIQUE]** em **Create new project** e espere ~2 min.
3. No menu da esquerda, **[CLIQUE]** em **SQL Editor** → **New query**.
4. Abra o arquivo `supabase/001_leads.sql` desta pasta, **copie tudo** e cole no editor.
   **[CLIQUE]** em **Run** (canto inferior direito). Deve aparecer "Success".
5. No menu, **[CLIQUE]** em **Project Settings** (engrenagem) → **API**. Anote 3 coisas:
   - **Project URL** (ex: `https://xxxx.supabase.co`)
   - **anon public** (uma chave longa)
   - **service_role** (outra chave longa — essa é SECRETA, nunca mostre a ninguém)

---

## PARTE 2 — Subir o código pro GitHub — ~5 min

> Se preferir, me peça e eu te guio comando a comando no terminal.

1. Acesse https://github.com e **[CLIQUE]** em **New repository**.
   - Repository name: `nexlab`
   - Deixe **Private** marcado.
   - **NÃO** marque "Add a README".
   - **[CLIQUE]** em **Create repository**.
2. O GitHub vai mostrar uns comandos. Você vai usar os da seção
   **"…or push an existing repository from the command line"**.
   (Eu já deixei o git iniciado e o primeiro commit feito — só falta conectar e enviar.)

---

## PARTE 3 — Publicar na Vercel — ~5 min

1. Acesse https://vercel.com e faça login **com a conta que você quer usar para a Nexlab**.
2. **[CLIQUE]** em **Add New… → Project**.
3. Escolha o repositório `nexlab` que você criou e **[CLIQUE]** em **Import**.
4. Antes de finalizar, abra **Environment Variables** e adicione (uma por uma):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | (o Project URL da Parte 1) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (a chave anon) |
   | `SUPABASE_SERVICE_ROLE_KEY` | (a chave service_role) |
   | `NEXT_PUBLIC_WHATSAPP` | seu número, só dígitos, ex: `5532999999999` |

5. **[CLIQUE]** em **Deploy** e espere ~2 min. Vai aparecer um link tipo
   `nexlab.vercel.app` — **esse já é seu site no ar.**

---

## PARTE 4 — Domínio próprio (opcional) — nexlab.com.br

1. Na Vercel, dentro do projeto: **Settings → Domains**.
2. Digite `nexlab.com.br` e **[CLIQUE]** em **Add**.
3. A Vercel mostra os registros DNS. Configure no seu registrador (Registro.br/GoDaddy).
4. Em alguns minutos o domínio fica ativo (com HTTPS automático).

---

## Como ver os leads que chegaram
No Supabase → **Table Editor** → tabela `leads`. Cada contato do site aparece aqui.
(Na FASE 2 eu construo um painel admin bonito pra isso, com login.)

## Importante
- Sem as variáveis da Vercel, o formulário avisa o visitante para chamar no WhatsApp
  (o lead **não se perde**: fica registrado no log da Vercel).
- A chave **service_role** é secreta. Ela só vai na Vercel (servidor), nunca no GitHub.

# O que só você pode fazer — passo a passo

Três coisas dependem de conta sua e eu não consigo fazer no seu lugar. Enquanto
elas não existirem, eu construo o código e deixo pronto esperando, mas a
ferramenta não funciona de ponta a ponta.

Faça na ordem abaixo. A **parte 1 é a mais urgente** porque leva horas para
propagar.

---

## PARTE 1 — Registrar o domínio hypergrow.com.br

**Por quê:** sem domínio próprio verificado, todo e-mail automático que a
ferramenta enviar cai na caixa de spam. Não é um detalhe: é a diferença entre o
cliente receber o link da reunião ou não receber.

1. Abra **https://registro.br**
2. No campo de busca do topo, digite `hypergrow.com.br` e clique em **Pesquisar**.
3. Se aparecer **"disponível"**, clique em **Registrar**.
4. Faça login (ou crie a conta) com **CPF ou CNPJ** — o Registro.br exige documento brasileiro.
5. Pague. Custa em torno de **R$ 40 por ano**. Aceita PIX e boleto.
6. Assim que o pagamento for confirmado, **me avise**. Eu te mando a parte 2 deste guia (verificação de e-mail com DKIM/SPF), que só faz sentido depois que o domínio existir.

> Se `hypergrow.com.br` estiver ocupado, me diga qual nome você prefere que eu
> confiro as alternativas disponíveis antes de você pagar.

---

## PARTE 2 — Rodar o banco de dados

**Por quê:** as telas de kanban, financeiro e agenda precisam das tabelas
existirem. O acesso automático ao seu Supabase não funciona por aqui (o projeto
está em outra conta), então os comandos vão na mão — uma vez só.

1. Abra **https://supabase.com/dashboard** e faça login com a conta **reparosweb**.
2. Clique no projeto **`htaxogmtaxebfbyetxel`** (é o do Hypergrow).
3. No menu da esquerda, clique em **SQL Editor**.
4. Clique no botão **+ New query** (canto superior direito).
5. Agora, **um arquivo de cada vez, nesta ordem exata**:

   **a)** Abra no seu computador o arquivo
   `C:\Users\user\Downloads\nexlab\supabase\004_crm.sql`,
   selecione tudo (**Ctrl + A**), copie (**Ctrl + C**),
   cole na janela do SQL Editor (**Ctrl + V**) e clique em **Run** (ou **Ctrl + Enter**).
   Deve aparecer **"Success. No rows returned"** em verde.

   **b)** Apague o que está na janela, e repita com
   `supabase\005_financeiro.sql`.

   **c)** Apague de novo, e repita com
   `supabase\006_agenda.sql`.

6. Se algum passo devolver erro **em vermelho**, **não tente consertar** — copie
   a mensagem inteira e me mande. Os arquivos foram escritos para poderem ser
   rodados mais de uma vez sem estragar nada, então não há risco em repetir.

---

## PARTE 3 — Criar as credenciais do Google (sala do Meet automática)

**Por quê:** para a ferramenta criar a sala do Google Meet sozinha a cada
agendamento, o Google exige uma autorização feita de dentro da sua conta.

1. Abra **https://console.cloud.google.com**
2. Faça login com a conta Google que você quer usar para criar as reuniões.
3. No topo da tela, ao lado do logo "Google Cloud", clique no **seletor de projeto** e depois em **Novo projeto**.
   - Nome: `HyperGrow`
   - Clique em **Criar** e aguarde alguns segundos.
4. Confirme que o projeto **HyperGrow** está selecionado no topo.

### 3.1 — Ligar a API do Calendar
5. Na busca do topo, digite **`Google Calendar API`** e clique no resultado.
6. Clique no botão azul **Ativar**.

### 3.2 — Tela de consentimento
7. No menu da esquerda, vá em **APIs e serviços → Tela de permissão OAuth**.
8. Escolha **Externo** e clique em **Criar**.
9. Preencha só o obrigatório:
   - Nome do app: `HyperGrow`
   - E-mail de suporte: seu e-mail
   - E-mail do desenvolvedor: seu e-mail
10. Clique em **Salvar e continuar** três vezes, até chegar no fim, e depois em **Voltar ao painel**.
11. Na tela que aparecer, procure **Usuários de teste** → **+ Add users** → coloque **o seu e-mail** → **Salvar**.

### 3.3 — Criar as chaves
12. No menu da esquerda, **APIs e serviços → Credenciais**.
13. No topo, **+ Criar credenciais → ID do cliente OAuth**.
14. Tipo de aplicativo: **Aplicativo da Web**. Nome: `HyperGrow Web`.
15. Em **URIs de redirecionamento autorizados**, clique em **+ Adicionar URI** e cole **exatamente** isto:
    ```
    https://hypergrow-lovat.vercel.app/api/oauth-callback
    ```
    > Se você já tiver ligado o domínio próprio ao site quando chegar aqui, me avise que eu te passo a URL atualizada.
16. Clique em **Criar**.
17. Vai aparecer uma janela com **ID do cliente** e **Chave secreta do cliente**. Clique em **Fazer download do JSON** para guardar.
18. **Me mande os dois valores** (ID do cliente e chave secreta) ou cole você mesmo na Vercel — eu te mostro onde quando o código estiver pronto.

> ⚠️ Enquanto o app estiver como "Externo" em modo de teste, só os e-mails que
> você colocou em **Usuários de teste** conseguem autorizar. Para uso normal da
> agência isso basta — você autoriza uma vez e a ferramenta usa essa autorização
> para todos os agendamentos.

---

## PARTE 4 — Decisão sobre o plano da Vercel

O site está hospedado no plano **Hobby**, que tem duas limitações que afetam
diretamente o que estamos construindo:

- **Proíbe uso comercial.** Um site institucional passa; uma ferramenta interna
  que a agência usa para trabalhar e cobrar cliente é uso comercial.
- **Limita a 12 funções de servidor.** Hoje o site usa 8. Kanban, financeiro,
  agenda, Google e e-mail passariam disso. Eu já estou construindo com um
  roteador único justamente para caber — mas é um contorno técnico, não resolve
  a questão do uso comercial.

O plano **Pro** custa **US$ 20 por mês**. A decisão é sua; não há solução
técnica que substitua.

---

## Resumo do que eu preciso de você

| # | O que | Quanto custa | Urgência |
|---|---|---|---|
| 1 | Registrar `hypergrow.com.br` | ~R$ 40/ano | **Alta** — leva horas para propagar |
| 2 | Rodar os 3 arquivos SQL | grátis | Alta — destrava as telas |
| 3 | Criar credenciais do Google | grátis | Média — só o Meet depende |
| 4 | Decidir sobre a Vercel Pro | US$ 20/mês | Média |

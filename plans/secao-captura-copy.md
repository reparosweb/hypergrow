# Seção "Captura" — conceito + copy final

Documento de conteúdo para uma seção NOVA da home clara (`components/claro/ClaroSite.tsx`).
Escrito para ser implementado por outro agente. **Nada de código foi alterado por este documento.**

Base do pedido do dono (palavras dele): *"o segundo vídeo vamos criar uma copy para dizer pegamos
na sua mão e entregamos resultado, quero simbolizar no final do vídeo o foguete sendo pego pelos
braços robóticos. quero tangibilizar isso em uma ação de marketing em uma outra parte da home"*.

---

## 1. Conceito

Toda agência vende decolagem — e é justamente aí que a promessa some, porque o cliente já viu site
entregue, campanha ligada e fornecedor desaparecendo na semana seguinte. O ângulo desta seção não é
subir: é **a volta**. No vídeo, o propulsor não pousa sozinho no chão — a mesma torre que o lançou
abre os braços e o pega no ar. A promessa emocional é o fim do medo de ser largado no meio
(*"você não vai ficar sozinho quando apertar"*); a racional é o que a HyperGrow de fato faz e pode
mostrar: quem planeja é quem implanta, a operação é tocada dentro das ferramentas do cliente
(loja, conta de anúncio, ERP, WhatsApp), existe uma pessoa com nome para chamar quando trava, e o
time do cliente sai sabendo mexer. Captura, não decolagem — e por isso a seção só funciona no lugar
em que o visitante já viu o que fazemos e está formulando a objeção *"e depois vocês somem?"*.

---

## 2. Copy final (pronta para colar)

### Eyebrow
```
Depois do lançamento
```

### Título (com destaque em degradê)
```
Pegamos na sua mão —
e não soltamos no meio
```
Marcação para o implementador (a quebra de linha é proposital):

```jsx
Pegamos na sua mão —<br />e <span className="grad">não soltamos no meio</span>
```

> ⚠️ Se a seção ficar sobre o vídeo (fundo escuro), o `.grad` padrão da marca (azul #1550E8) fica
> ilegível. Usar os mesmos tons claros já validados no hero (`ClaroHero.tsx`, `.cl-hero-accent`):
> `linear-gradient(96deg,#7DA8FF,#B9A8FF 45%,#FF7AAA)`.

### Subtítulo
```
Site no ar, campanha rodando e integração feita é o ponto em que a maioria dos fornecedores se
despede. É onde a gente começa a trabalhar de verdade: a mesma equipe que planejou fica operando,
medindo e corrigindo junto com você.
```

### Blocos (4) — o que "pegar na mão" significa na prática

| Título (2-4 palavras) | Frase |
|---|---|
| **Quem vende, implanta** | A pessoa que te apresentou a proposta é a mesma que senta com o seu time na implantação — não existe passagem de bastão depois que você assina. |
| **Mão na operação** | Trabalhamos dentro das suas ferramentas — loja, conta de anúncio, ERP e WhatsApp — em vez de mandar recomendação por e-mail para o seu time executar. |
| **Quando trava, é com a gente** | No dia em que a campanha para de entregar, o pedido não cai no ERP ou o site sai do ar, você tem uma pessoa para chamar — com nome, não um número de protocolo. |
| **Seu time sai sabendo** | Na entrega, treinamos quem vai usar aquilo todo dia: a sua empresa não pode ficar refém da gente para mexer no básico. |

### CTA (um só)
```
Texto do botão: Falar com quem vai operar
Destino: #contato
```
Alternativa neutra (usar se o dono não confirmar a premissa do bloco 1): `Falar com a gente` → `#contato`.

### Legenda obrigatória do vídeo (não é opcional)
Linha pequena, estilo `mono`/`small`, no rodapé da seção:
```
Imagens de arquivo do teste de voo do Starship, da SpaceX. Usamos como analogia — não temos
nenhuma relação com a empresa.
```
Sem essa linha a seção não pode ir ao ar. É o que separa metáfora de sugestão de parceria.

---

## 3. Aplicação de psicologia

- **Aversão à perda / medo do abandono:** *"não soltamos no meio"* nomeia a perda que o visitante já
  sofreu com outro fornecedor, em vez de prometer ganho abstrato.
- **Contraste com o padrão do mercado:** *"é o ponto em que a maioria se despede"* cria o inimigo
  comum sem citar concorrente e sem estatística.
- **Redução de risco percebido por antecipação do pior:** listar as três falhas reais (campanha para,
  pedido não cai no ERP, site fora do ar) sinaliza que já vivemos isso — quem descreve o problema em
  detalhe parece ter passado por ele.
- **Prova por especificidade no lugar de número:** citar ferramenta concreta (loja, conta de anúncio,
  ERP, WhatsApp) convence mais que percentual e é verificável — não há um dígito na seção inteira.
- **Objeção-espelho neutralizada:** *"não pode ficar refém da gente"* responde ao medo oposto (ficar
  dependente), que costuma nascer logo depois da promessa de acompanhamento.
- **Congruência imagem-texto:** a imagem carrega a emoção (a captura no ar) e o texto carrega o
  racional; sem essa divisão, a metáfora espacial vira enfeite.

---

## 4. Onde entra na home

**Entre `ClaroResultados` e `ClaroDiag`** — ou seja, depois de "Resultados" e antes de "Diagnóstico"
na ordem de `components/claro/ClaroSite.tsx`.

Justificativa: é exatamente ali que nasce a objeção *"bonito, mas vocês entregam e somem?"* — logo
depois da prova e logo antes de pedir uma ação. E a alternância de fundo continua correta sem tocar
em nenhum `className`: `Resultados` é `sec alt` (ClaroClose.tsx) e `Diag` é `sec` (ClaroDiag.tsx),
com a faixa escura full-bleed no meio dos dois.

---

## 5. Notas para quem for implementar

1. **O vídeo tem que ser OUTRO arquivo.** A `ClaroBanner` foi tirada da composição em 2026-08-06
   justamente porque repetia `launch.mp4` — o mesmo vídeo do hero — duas vezes na mesma página. Se o
   clipe da captura não for um arquivo diferente, esta seção reintroduz o problema que já foi
   corrigido. Não reaproveitar `launch-hero.mp4`.
2. **Nome novo de arquivo, sempre.** `next.config.mjs` serve `/media` com `max-age=31536000,
   immutable`. Sugestão: `/media/catch-hero.mp4` + `/media/catch-hero-poster.webp` (poster extraído
   do frame do próprio vídeo, mesma proporção, para não haver salto de enquadramento).
3. **Reencodar com `-movflags +faststart`.** `launch.mp4` tem 11 MB com o átomo `moov` no fim e
   demora a começar; `launch-hero.mp4` ficou em 3,9 MB depois do faststart. Repetir o mesmo
   tratamento.
4. **Nada de `backdrop-filter` sobre o vídeo.** Já custou travamento de rolagem no mobile neste
   projeto; usar fundo translúcido sólido nos botões, como em `ClaroBanner`.
5. **`prefers-reduced-motion`:** pausar de verdade (o `autoPlay` é atributo, não basta deixar de
   chamar `play()`) — o padrão já está escrito em `ClaroBanner`.
6. Vídeo com `aria-hidden="true"` e `tabIndex={-1}`; o conteúdo é o texto, não o vídeo.
7. `id` sugerido para a seção: `captura`. Se entrar no menu, conferir `ClaroNav`.
8. `ClaroBanner` (em `ClaroExtra.tsx`) serve de base ESTRUTURAL/CSS — a copy dela é outra e não deve
   ser reaproveitada nem misturada.

## 6. O que esta copy deliberadamente NÃO faz

- **Nenhum número.** Sem percentual, prazo, quantidade de clientes ou ROAS. A força vem da
  especificidade da cena, não de estatística — e nada aqui depende de um dado que a HyperGrow ainda
  não tem.
- **Nenhuma garantia.** Não aparece "garantimos", "asseguramos" nem promessa de resultado.
- **Nenhuma associação com a SpaceX.** A legenda do item 2 deixa a analogia explícita; nenhuma frase
  sugere que a filmagem, o feito ou a tecnologia sejam nossos.
- **Nenhuma repetição do que já está no site.** Conferido contra `ClaroSobre` (ClaroExtra.tsx) — que
  já usa "Gestor humano dedicado", "Relatório sem maquiagem", "Responsabilidade de dono" e o título
  "Um time que opera, não só planeja" — e contra `lib/site-services.ts`. Os 4 blocos aqui são
  ângulos novos (continuidade entre venda e entrega, mão dentro das ferramentas, o dia em que quebra,
  autonomia do time do cliente) e somam à seção Sobre em vez de duplicá-la.

## 7. Presunções que precisam do "sim" do dono antes de publicar

1. **Bloco "Quem vende, implanta"** e o CTA "Falar com quem vai operar" assumem que quem apresenta a
   proposta é quem acompanha a implantação. Se hoje não for assim, trocar o bloco por outro e usar o
   CTA alternativo — não publicar como está.
2. **Bloco "Mão na operação"** assume acesso operacional às ferramentas do cliente (loja, conta de
   anúncio, ERP, WhatsApp). É coerente com os serviços descritos em `lib/site-services.ts`, mas quem
   confirma o padrão de trabalho é o dono.
3. Havia um quarto ângulo forte e muito diferenciador — *"as contas e os acessos ficam no seu nome"*
   — que **não** entrou na copy porque não achei nada no repositório que comprove ser a política da
   casa. Se o dono confirmar que é verdade, vale substituir o bloco "Seu time sai sabendo" por ele:
   é a maior dor de quem já trabalhou com agência.

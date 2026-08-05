---
name: hg-regras-de-bug
description: As regras de layout, hidratação e conteúdo que já custaram bug real em produção no site HyperGrow. Consultar SEMPRE antes de escrever CSS, JSX com <style>, texto que dependa de env var, ou qualquer prova social/número no site.
---

# Regras que já custaram bug real no HyperGrow

Cada regra abaixo nasceu de um bug que foi ao ar. Não é preferência de estilo — é histórico verificado.

## 1. CSS dentro de `<style>{...}</style>` não pode ter `"` `'` `&` `<` `>`

**O bug:** o React escapa o texto que renderiza (`>` vira `&gt;`, `"` vira `&quot;`). `<style>` é elemento de texto CRU — o navegador não decodifica entidade ali dentro. O HTML do servidor e o do cliente ficam diferentes por construção → React #418/#423/#425 → o React DESCARTA o HTML do servidor e re-renderiza a página inteira. Invisível na tela, caríssimo no carregamento.

**A regra:** qualquer `<style>` com `.a > .b` (combinador filho) ou `content: ""` precisa virar `<style dangerouslySetInnerHTML={{ __html: \`...\` }} />`.

**Auditoria automática:** `node scripts/fix-style-hydration.mjs --check` — rodar antes de todo deploy. Sai com código 1 se achar bloco perigoso.

## 2. Nada que dependa de `process.env.NEXT_PUBLIC_*` pode mudar o que é RENDERIZADO na primeira passada

**O bug:** a variável pode valer coisas diferentes na renderização do servidor e no bundle do cliente (o minificador do cliente apaga o ramo morto). Se o TEXTO renderizado depender da env var, o cliente monta um texto diferente do que veio do servidor → mesma falha de hidratação do item 1.

**A regra:** use um hook que devolve o estado NEUTRO no servidor e na primeira renderização do cliente, e só "liga" depois da hidratação via `useEffect`. Ver `useWhatsApp()` em `components/site/HypergrowSite.tsx` como padrão de referência.

## 3. Elemento decorativo com largura fixa em px → sempre `min(Xpx, 100%)`

Senão vaza no mobile e o pinch-zoom revela faixa morta fora do conteúdo.

## 4. Nunca `useId()` para id de `<defs>` de SVG

Gera prefixo diferente no servidor e no cliente (`R1a6fsq` vs `r0`) → mesma falha de hidratação. Use uma chave determinística derivada das props.

## 5. Nunca `filter: blur()` ou `backdrop-filter` em elemento grande fixo

Trava o scroll no mobile (Safari especialmente).

## 6. Grids sempre `repeat(auto-fit, minmax(min(100%, Xpx), 1fr))`

Nunca coluna fixa — quebra em telas estreitas.

## 7. `<i data-lucide>` não funciona fora de onde o script do lucide é carregado

O script só é injetado dentro de `HypergrowSite.tsx` (a home), e só DEPOIS da hidratação (ver item 2 — o próprio carregamento do lucide já causou uma falsa pista de bug de hidratação nesta sessão, embora não fosse a causa real). Páginas internas (`/servicos`, `/sobre`, `/contato`, `/blog`) usam SVG inline.

## 8. Nunca inventar prova social, número ou depoimento

Os 3 depoimentos originais eram inventados e foram removidos. A faixa "Empresas que crescem com a HyperGrow" listava 6 produtos PRÓPRIOS como se fossem clientes — corrigido. Toda prova no site precisa ser verificável clicando. Copiar SERVIÇO de concorrente é normal; copiar NÚMERO de concorrente (ex.: "600+ empresas", "R$3B+ em receita") nunca.

## 9. Nunca publicar link externo sem verificar por `<title>` da página, não só status HTTP

A Vercel devolve 200 em páginas genéricas/vazias. `calorias.app.br` (NutriSnap) ficou meses linkado no site com DNS morto porque ninguém tinha conferido de novo. Antes de publicar qualquer URL de projeto: abrir de verdade e conferir se o `<title>` bate com o nome do projeto.

## 10. Contraste mínimo 4,5:1 em texto normal, piso da marca é 7,2:1 nos cards

O botão de conversão principal (`.btn-cta`) já foi ao ar com 2,12:1 (branco sobre o degradê cobre) — corrigido para texto escuro `#12151A` (8,64:1). Sempre medir, não estimar visualmente.

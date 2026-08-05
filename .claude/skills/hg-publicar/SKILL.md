---
name: hg-publicar
description: Fluxo obrigatório para publicar qualquer mudança no site HyperGrow — build, auditoria, commit, push e conferência no ar. Use antes de dizer "pronto" para qualquer edição no projeto.
---

# Como publicar no HyperGrow

Nunca dizer "pronto" sem ter passado pelos 6 passos. O site já foi ao ar quebrado (capas erradas, botão roxo, falha de hidratação) por pular a conferência final.

## 1. Build local

```bash
cd C:\Users\user\Downloads\nexlab
npm run build
```
Precisa terminar com `✓ Compiled successfully` e `✓ Generating static pages (42/42)` (o número de páginas sobe conforme o site cresce — conferir que bate com o esperado).

## 2. Auditoria de hidratação

```bash
node scripts/fix-style-hydration.mjs --check
```
Sai com código 1 se achar `<style>` com caractere perigoso (ver skill `hg-regras-de-bug`).

## 3. Commit e push

Mensagem explicando O QUE mudou e POR QUE (não "atualiza site"). Se o push travar pedindo login do Windows (Credential Manager), rodar em background e avisar o dono para concluir a janela.

```bash
git add -A ':!.claude'    # .claude fica local, não sobe no primeiro commit de harness
git commit -m "..."
git push origin main
```

## 4. Aguardar o deploy da Vercel

O HTML fica em cache ~1 min. Confirmar que o deploy novo chegou antes de testar — comparar o hash do chunk JS servido (`/_next/static/chunks/app/page-*.js`) com o hash gerado localmente, ou usar `?cb=<algo único>` como cache-buster e checar um marcador de texto que só existe na versão nova.

## 5. Conferir NO AR com Chrome DevTools MCP

Não confiar só no build local. Sempre:

- `navigate_page` para a URL de produção com cache-buster
- `list_console_messages` tipos `["error","warn"]` — **precisa vir vazio**
- Medir `document.documentElement.scrollWidth > clientWidth` — precisa ser `false` (sem vazamento horizontal)
- `emulate` viewport `390x844x3,mobile,touch` E `1280x900x1` — os dois, não só um
- Se mexeu em imagem/portfólio: `take_screenshot` e OLHAR — não presumir que carregou certo

## 6. Se o site tiver link externo (portfólio, referência)

Rodar a checagem de `<title>` — ver skill `hg-regras-de-bug`, item 9. Status 200 não é suficiente.

## Registro

Depois de publicar, se algo foi corrigido por causa de um bug real (não só uma melhoria), considerar acrescentar a lição na skill `hg-regras-de-bug` — é assim que ela foi construída.

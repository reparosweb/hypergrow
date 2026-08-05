---
description: Roda a bateria completa de verificação do HyperGrow antes de dizer "pronto" — build, auditoria de hidratação, links do portfólio, e confere no ar.
---

Rode, nesta ordem, no diretório `C:\Users\user\Downloads\nexlab`:

1. `npm run build` — precisa terminar em `✓ Compiled successfully` e `✓ Generating static pages (N/N)`. Se falhar, pare e reporte o erro; não continue.

2. `node scripts/fix-style-hydration.mjs --check` — precisa sair "ok". Se achar bloco perigoso, liste os arquivos e pare — não corrija automaticamente sem confirmar com o usuário se o CSS ali tem função visual que mudaria.

3. Verifique cada URL externa em `lib/projects.ts` com `curl -s -o /dev/null -w "%{http_code}"` E confira que o `<title>` da página bate com o nome do projeto (não confie só no status HTTP — Vercel devolve 200 em página genérica). Reporte qualquer divergência antes de prosseguir.

4. Se houver deploy pendente (branch à frente do `origin/main`), avise e pergunte se deve fazer push — não empurre sem confirmação a menos que o usuário já tenha pedido "suba" nesta conversa.

5. Depois do deploy estar no ar (confirmado por hash de chunk ou marcador de texto novo), abra com Chrome DevTools MCP:
   - `/` , `/servicos`, `/servicos/loja-virtual`, `/sobre`, `/contato` — em 390×844×3 mobile e 1280×900 desktop
   - Console (`list_console_messages`, tipos error+warn) precisa vir vazio nas 5 páginas × 2 larguras
   - `scrollWidth > clientWidth` precisa ser `false` em todas
   - Confirme que o header (`header.sh`) existe em todas as rotas, não só na home

6. Reporte um resumo curto: o que passou, o que falhou, e se algo falhou, qual é o próximo passo — não diga "tudo certo" se algum item não foi checado.

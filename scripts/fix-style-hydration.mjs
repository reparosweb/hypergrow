/* ─────────────────────────────────────────────────────────────────────────────
   CONVERTE <style>{`...`}</style> → <style dangerouslySetInnerHTML={{__html:`...`}} />

   POR QUE ISTO EXISTE (bug real, medido em produção neste projeto):

   O React escapa o TEXTO que renderiza — `"` vira `&quot;`, `>` vira `&gt;`,
   `&` vira `&amp;`. Só que <style> é um elemento de TEXTO CRU: o navegador NÃO
   decodifica entidades lá dentro. Então, para qualquer CSS que contenha aspas
   ou o combinador filho (`.a > .b`), o texto que veio do servidor e o texto que
   o cliente monta são DIFERENTES por construção:

       servidor .... .svc-body &gt; span { ... }
       cliente ..... .svc-body > span { ... }

   O React acusa divergência (#425), aborta a hidratação (#418/#423) e DESCARTA
   o HTML do servidor, re-renderizando a página inteira no navegador. É um custo
   de performance enorme e completamente invisível na tela — o site "parece"
   funcionando.

   `dangerouslySetInnerHTML` injeta o CSS cru, sem escapar nada, e servidor e
   cliente passam a ser idênticos.

   Uso: node scripts/fix-style-hydration.mjs [--check]
   Com --check ele não escreve nada: só lista o que está errado e sai com
   código 1 (serve para rodar antes de um deploy).
   ──────────────────────────────────────────────────────────────────────────── */
import fs from "node:fs";
import path from "node:path";

const SO_CONFERIR = process.argv.includes("--check");
const IGNORAR = new Set(["node_modules", ".next", ".git", "out", "dist"]);
const PERIGOSOS = /["'&<>]/;

function listar(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORAR.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listar(p, acc);
    else if (/\.(tsx|jsx)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

let convertidos = 0;
const pendentes = [];

for (const arquivo of listar(".")) {
  const original = fs.readFileSync(arquivo, "utf8");
  let mudou = 0;
  const novo = original.replace(/<style>\{`([\s\S]*?)`\}<\/style>/g, (bloco, css) => {
    if (!PERIGOSOS.test(css)) return bloco; // CSS inofensivo: deixa como está
    mudou++;
    return "<style dangerouslySetInnerHTML={{ __html: `" + css + "` }} />";
  });
  if (!mudou) continue;
  const rel = arquivo.replace(/\\/g, "/");
  if (SO_CONFERIR) {
    pendentes.push(`${rel} — ${mudou} bloco(s)`);
  } else {
    fs.writeFileSync(arquivo, novo);
    console.log(`convertido: ${rel} — ${mudou} bloco(s)`);
    convertidos += mudou;
  }
}

if (SO_CONFERIR) {
  if (pendentes.length) {
    console.error("BLOCOS <style> QUE VÃO QUEBRAR A HIDRATAÇÃO:");
    pendentes.forEach((p) => console.error("  " + p));
    process.exit(1);
  }
  console.log("ok: nenhum <style> com caractere que o React escapa.");
} else {
  console.log(`total convertido: ${convertidos}`);
}

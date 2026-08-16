/* Mede o peso TRANSFERIDO de uma pagina: baixa o HTML e todos os
   subrecursos que ele referencia (js, css, fonte com preload, img, video,
   poster), com Accept-Encoding igual ao de um navegador. Nao executa JS,
   entao nao captura chunk carregado dinamicamente depois da hidratacao. */
const base = process.argv[2];
if (!base) { console.error("uso: node scripts/_measure-page.mjs <url>"); process.exit(1); }
const H = { "accept-encoding": "br, gzip, deflate", "user-agent": "Mozilla/5.0 Chrome/120 Safari/537.36" };
async function get(u) {
  const r = await fetch(u, { headers: H, redirect: "follow" });
  const b = Buffer.from(await r.arrayBuffer());
  return { status: r.status, bytes: b.length, enc: r.headers.get("content-encoding") || "-", type: (r.headers.get("content-type") || "").split(";")[0], body: b };
}
const html = await get(base);
console.log("URL:", base, "status", html.status);
const text = html.body.toString("utf8");
const urls = new Set();
const push = (u) => { if (!u || u.startsWith("data:")) return; try { const h = new URL(u, base).href; if (h === base || h === base.replace(/\/$/, "")) return; urls.add(h); } catch {} };
for (const m of text.matchAll(/<script[^>]+src="([^"]+)"/g)) push(m[1]);
for (const m of text.matchAll(/<link[^>]+href="([^"]+)"/g)) push(m[1]);
for (const m of text.matchAll(/<img[^>]+src="([^"]+)"/g)) push(m[1]);
for (const m of text.matchAll(/<source[^>]+src="([^"]+)"/g)) push(m[1]);
for (const m of text.matchAll(/poster="([^"]+)"/g)) push(m[1]);
for (const m of text.matchAll(/<video[^>]+src="([^"]+)"/g)) push(m[1]);
const rows = [{ url: base, ...html }];
for (const u of urls) {
  if (u.endsWith(".ico") || u.includes("manifest")) { /* ainda conta */ }
  try { rows.push({ url: u, ...(await get(u)) }); } catch (e) { console.log("ERRO", u, e.message); }
}
rows.sort((a, b) => b.bytes - a.bytes);
let total = 0;
for (const r of rows) { total += r.bytes; console.log(String(r.bytes).padStart(9), r.enc.padEnd(4), String(r.status).padEnd(4), r.url.replace(base, "").slice(0, 90)); }
console.log("---");
console.log("REQUISICOES:", rows.length);
console.log("TOTAL TRANSFERIDO:", total, "bytes =", (total / 1024).toFixed(1), "KB");

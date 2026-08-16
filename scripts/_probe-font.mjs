import sharp from "sharp";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
mkdirSync("scripts/.og-fonts", { recursive: true });
const urls = {
  "Archivo-Bold.ttf": "https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf",
  "IBMPlexSans-Regular.ttf": "https://github.com/google/fonts/raw/main/ofl/ibmplexsans/IBMPlexSans%5Bwdth,wght%5D.ttf",
};
for (const [name, url] of Object.entries(urls)) {
  const p = "scripts/.og-fonts/" + name;
  if (existsSync(p)) { console.log("ja existe", name); continue; }
  try {
    const r = await fetch(url);
    console.log(name, "status", r.status);
    if (r.ok) { writeFileSync(p, Buffer.from(await r.arrayBuffer())); console.log("  baixado"); }
  } catch (e) { console.log(name, "ERRO REDE:", e.message); }
}

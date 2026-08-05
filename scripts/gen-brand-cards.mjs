import sharp from "sharp";

function card({ initials, name, tagline, c1, c2 }) {
  return `
<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="800" y2="500" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="72%" cy="18%" r="60%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.45" stop-color="#0D1013" stop-opacity="0"/>
      <stop offset="1" stop-color="#0D1013" stop-opacity="0.55"/>
    </linearGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#ffffff" stroke-opacity="0.055" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <rect width="800" height="500" fill="url(#grid)"/>
  <rect width="800" height="500" fill="url(#glow)"/>
  <rect width="800" height="500" fill="url(#fade)"/>
  <circle cx="118" cy="200" r="52" fill="#ffffff" fill-opacity="0.12"/>
  <circle cx="118" cy="200" r="52" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.5"/>
  <text x="118" y="215" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle">${initials}</text>
  <text x="70" y="300" font-family="Arial, sans-serif" font-size="40" font-weight="800" fill="#ffffff" letter-spacing="-0.5">${name}</text>
  <text x="70" y="336" font-family="Arial, sans-serif" font-size="17" font-weight="500" fill="#ffffff" fill-opacity="0.86">${tagline}</text>
  <text x="70" y="452" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="#ffffff" fill-opacity="0.55" letter-spacing="1.5">PROJETO HYPERGROW</text>
</svg>`;
}

// marido, nutri e packslog SAÍRAM desta lista: os três têm URL pública real e
// confirmada (verificada por <title>, não só por status HTTP) e ganharam
// screenshot de verdade em public/portfolio/*.webp. Rodar este script de novo
// SOBRESCREVERIA a capa real pelo card de marca — não rode sem tirar o id da
// lista abaixo primeiro.
//
// Só falta unixx: o endereço candidato (spotlog-nine.vercel.app) abre um site
// cujo <title> é "Spotlog", não "Unixx" — publicar aquilo faria o site anunciar
// um nome e abrir outro. Fica de card de marca até o dono confirmar a URL certa.
const cards = [
  { id: "unixx", initials: "UX", name: "Unixx", tagline: "CRM e automação para equipe comercial", c1: "#0A7048", c2: "#0FA968" },
];

for (const c of cards) {
  const svg = card(c);
  const info = await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(`public/portfolio/${c.id}.webp`);
  console.log(`${c.id}.webp -> ${Math.round(info.size / 1024)}KB ${info.width}x${info.height}`);
}

import sharp from "sharp";
const F = { name: "IBM Plex Sans", file: "scripts/.og-fonts/IBMPlexSans.ttf" };
const t = "Site, loja virtual, marketing, conteúdo e agentes de IA operando como um sistema só.";
async function med(txt, largura) {
  const b = await sharp({ text: { text: `<span foreground="#000000" letter_spacing="${27*-18}">${txt}</span>`, font: `${F.name} 27px`, fontfile: F.file, rgba: true, width: largura, wrap: "word", align: "low", spacing: 11, dpi: 72 } }).png().toBuffer();
  const m = await sharp(b).metadata();
  return { w: m.width, h: m.height };
}
console.log("largura 4000 (linha unica):", await med(t, 4000));
console.log("largura 980 (com wrap):", await med(t, 980));

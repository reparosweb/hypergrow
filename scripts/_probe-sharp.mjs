import sharp from "sharp";
console.log("sharp", sharp.versions.sharp, "vips", sharp.versions.vips);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120"><rect width="400" height="120" fill="#1550E8"/><text x="20" y="70" font-family="Arial, Helvetica, sans-serif" font-size="48" fill="#ffffff">HyperGrow</text></svg>`;
try {
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  let white = 0;
  for (let i = 0; i < data.length; i += info.channels) if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) white++;
  console.log("SVG <text> -> pixels claros:", white, "(0 = fonte nao renderizou)");
} catch (e) { console.log("SVG text ERRO:", e.message); }
try {
  const t = await sharp({ text: { text: "HyperGrow", font: "sans 48px", rgba: true, width: 400 } }).png().toBuffer();
  const m = await sharp(t).metadata();
  console.log("sharp.text OK:", m.width + "x" + m.height);
} catch (e) { console.log("sharp.text ERRO:", e.message); }

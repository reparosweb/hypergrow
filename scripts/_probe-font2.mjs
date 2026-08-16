import sharp from "sharp";
const tests = [
  ["Archivo Bold 64px", "scripts/.og-fonts/Archivo-Bold.ttf"],
  ["Archivo 64px", "scripts/.og-fonts/Archivo-Bold.ttf"],
  ["IBM Plex Sans 32px", "scripts/.og-fonts/IBMPlexSans-Regular.ttf"],
];
for (const [font, fontfile] of tests) {
  try {
    const buf = await sharp({ text: { text: "HyperGrow — crescimento", font, fontfile, rgba: true, width: 900, dpi: 72 } }).png().toBuffer();
    const m = await sharp(buf).metadata();
    console.log(font, "->", m.width + "x" + m.height);
    await sharp(buf).flatten({ background: "#ffffff" }).toFile("scripts/_probe-" + font.split(" ")[0] + "-" + m.width + ".png");
  } catch (e) { console.log(font, "ERRO:", e.message); }
}

import type { PillarKey } from "@/lib/pillars";

/* ─────────────────────────────────────────────────────────────────────────────
   Cor de UI por pilar — SÓ para a rota /claro (paleta original do mockup:
   azul/violeta/rosa). NÃO edita `lib/pillars.ts`: aquele arquivo é
   compartilhado com o site escuro em produção, cujo banimento de azul/violeta
   continua valendo. Aqui os 6 "departamentos" do mockup foram remapeados para
   os 4 pilares reais do site.
   ──────────────────────────────────────────────────────────────────────────── */
export const CLARO_PILLAR_ACCENT: Record<PillarKey, string> = {
  vender: "#3B2FCC", // violeta — era o departamento "e-commerce" no mockup
  atrair: "#A8560B", // laranja — era "aquisição/tráfego"
  marca: "#B0155F", // rosa — era "conteúdo"
  ia: "#0A6C9E", // azul — era "automação"
};

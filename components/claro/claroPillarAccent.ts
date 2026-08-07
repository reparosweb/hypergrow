import type { PillarKey } from "@/lib/pillars";

/* ─────────────────────────────────────────────────────────────────────────────
   Cor de UI por pilar — SÓ para a rota /claro (paleta original do mockup:
   azul/violeta/rosa). NÃO edita `lib/pillars.ts`: aquele arquivo é
   compartilhado com o site escuro, cujo banimento de azul/violeta continua
   valendo.

   2026-08-07: os pilares passaram de 4 para 5 departamentos (ver nota em
   lib/pillars.ts). As 4 cores que já existiam foram MANTIDAS nos assuntos
   equivalentes — quem já reconhecia o rosa como "conteúdo" continua
   reconhecendo. A cor nova é só a do departamento novo (E-commerce).
   Todas saem da paleta desta rota (azul #1550E8 → violeta #3B2FCC/#5B3CFF →
   rosa #E0165F, mais os tons de apoio do mockup): nenhuma cor inventada.
   ──────────────────────────────────────────────────────────────────────────── */
export const CLARO_PILLAR_ACCENT: Record<PillarKey, string> = {
  site: "#1550E8", // azul de marca — o site é a base de tudo
  ecommerce: "#3B2FCC", // violeta — herdou a cor que era do "vender online"
  marketing: "#A8560B", // laranja — mesma de antes ("atrair demanda")
  midia: "#B0155F", // rosa — mesma de antes ("marca & conteúdo")
  ia: "#0A6C9E", // azul petróleo — mesma de antes ("operar com IA")
};

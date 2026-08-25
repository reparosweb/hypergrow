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
/* 2026-08-16: tema virou ESCURO tom-Agentop. As cores acima eram calibradas
   para passar contraste sobre PAPEL BRANCO; sobre o navy escuro (--card #151C33)
   elas ficavam fracas (violeta e petróleo escuros quase sumiam). Aqui estão as
   MESMAS famílias, clareadas para acender sobre o escuro — é a cor que tinge a
   página inteira do serviço (via PageShellClaro), então precisa de brilho. */
export const CLARO_PILLAR_ACCENT: Record<PillarKey, string> = {
  site: "#5B84FF", // azul de marca, mais vivo pro escuro
  ecommerce: "#7C6BFF", // violeta clareado
  marketing: "#E0913E", // laranja/âmbar clareado
  midia: "#FF5C93", // rosa clareado
  ia: "#38A9E0", // azul petróleo clareado
};

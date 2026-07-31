/** @type {import('next').NextConfig} */

/* CACHE DE ESTÁTICOS (/public)
   O Next já serve /_next/static com hash + immutable, mas TUDO que está em
   /public sai sem Cache-Control — o navegador revalida a cada visita
   (lucide.min.js, as 10 capas do portfólio, o poster do hero, o vídeo).
   É a auditoria "serve static assets with an efficient cache policy".

   ⚠️ CONTRAPARTIDA: arquivo com cache longo e nome fixo NÃO atualiza sozinho no
   navegador de quem já visitou. Por isso a política é escalonada:
   · /media, /lucide.min.js, /icon.svg → 1 ano immutable (não mudam; se um dia
     precisarem mudar, TROQUE O NOME DO ARQUIVO, não só o conteúdo).
   · /portfolio → 30 dias (as capas podem ser regeradas por
     scripts/gen-brand-cards.mjs; 30 dias já passa na auditoria). */
const YEAR = "public, max-age=31536000, immutable";
const MONTH = "public, max-age=2592000, must-revalidate";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: YEAR }] },
      { source: "/lucide.min.js", headers: [{ key: "Cache-Control", value: YEAR }] },
      { source: "/icon.svg", headers: [{ key: "Cache-Control", value: YEAR }] },
      { source: "/portfolio/:path*", headers: [{ key: "Cache-Control", value: MONTH }] },
      // /fotos tinha ficado de fora: eram 232 KB revalidados a cada visita.
      { source: "/fotos/:path*", headers: [{ key: "Cache-Control", value: MONTH }] },
    ];
  },
};

export default nextConfig;

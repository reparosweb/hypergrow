/** @type {import('next').NextConfig} */

/* CACHE DE ESTÁTICOS (/public)
   O Next já serve /_next/static com hash + immutable, mas TUDO que está em
   /public sai sem Cache-Control — o navegador revalida a cada visita
   (as 10 capas do portfólio, o poster do hero, o vídeo).
   É a auditoria "serve static assets with an efficient cache policy".

   ⚠️ CONTRAPARTIDA: arquivo com cache longo e nome fixo NÃO atualiza sozinho no
   navegador de quem já visitou. Por isso a política é escalonada:
   · /media, /icon.svg → 1 ano immutable (não mudam; se um dia
     precisarem mudar, TROQUE O NOME DO ARQUIVO, não só o conteúdo).
   · /portfolio → 30 dias (as capas podem ser regeradas por
     scripts/gen-brand-cards.mjs; 30 dias já passa na auditoria).
   · /og → 30 dias. São as imagens de compartilhamento (WhatsApp, LinkedIn,
     Facebook, X), geradas por scripts/gen-og.mjs. Cache curto de propósito:
     quando um título de página mudar e a imagem for regerada com o MESMO nome,
     o crawler precisa poder pegar a nova sem depender de troca de nome.

   A entrada de `/lucide.min.js` saiu em 2026-08-15 junto com o arquivo (355.975
   bytes de runtime de ícone que rota nenhuma carregava — ver o comentário longo
   em components/site/HypergrowSite.tsx). Regra `headers` apontando para arquivo
   inexistente não quebra o build, mas engana quem lê. */
const YEAR = "public, max-age=31536000, immutable";
const MONTH = "public, max-age=2592000, must-revalidate";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // /claro virou a home oficial em 2026-08-05 (era prévia separada) —
  // redireciona quem tinha o link antigo em vez de devolver 404.
  async redirects() {
    return [{ source: "/claro", destination: "/", permanent: true }];
  },
  async headers() {
    return [
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: YEAR }] },
      { source: "/icon.svg", headers: [{ key: "Cache-Control", value: YEAR }] },
      { source: "/portfolio/:path*", headers: [{ key: "Cache-Control", value: MONTH }] },
      { source: "/og/:path*", headers: [{ key: "Cache-Control", value: MONTH }] },
      // /fotos tinha ficado de fora: eram 232 KB revalidados a cada visita.
      { source: "/fotos/:path*", headers: [{ key: "Cache-Control", value: MONTH }] },
    ];
  },
};

export default nextConfig;

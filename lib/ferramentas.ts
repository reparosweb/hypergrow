/* ─────────────────────────────────────────────────────────────────────────────
   FONTE ÚNICA DAS FERRAMENTAS GRÁTIS.

   Quem consome: a página-hub /ferramentas, cada página de ferramenta (título,
   descrição, cor, serviço relacionado) e o `app/sitemap.ts`. Ferramenta nova
   entra AQUI e já nasce listada no hub e no sitemap — foi assim que os 19
   serviços evitaram ficar fora do mapa do site.

   Módulo LEVE de propósito: só texto e cor, nada de componente. Ele é
   importado por página estática; não pode arrastar peso para o cliente.
   ──────────────────────────────────────────────────────────────────────────── */

export type IconeFerramenta = "whatsapp" | "etiqueta" | "alvo" | "busca";

export type Ferramenta = {
  slug: string;
  /** Nome curto: card do hub, trilha e menu. */
  nome: string;
  /** <title> completo da página. */
  titulo: string;
  /** meta description. */
  descricao: string;
  /** Frase do card: o problema que ela resolve, na língua do cliente. */
  resolve: string;
  /** Promessa objetiva mostrada abaixo do H1. */
  chamada: string;
  /** Serviço da HyperGrow para onde a ferramenta leva no fim da página. */
  servico: { slug: string; rotulo: string };
  /** Cor de destaque da página (todas já pertencem à paleta clara do site). */
  accent: string;
  icone: IconeFerramenta;
};

export const FERRAMENTAS: Ferramenta[] = [
  {
    slug: "gerador-link-whatsapp",
    nome: "Gerador de link e QR Code do WhatsApp",
    titulo: "Gerador de link do WhatsApp com QR Code grátis — HyperGrow",
    descricao:
      "Crie seu link wa.me com mensagem já escrita e baixe o QR Code em PNG ou SVG. Grátis, sem cadastro, e o número não sai do seu navegador.",
    resolve:
      "Transforma seu número num link que abre a conversa já com a mensagem escrita — e gera o QR Code para imprimir no balcão, na embalagem ou no cartão.",
    chamada:
      "Um link e um QR Code prontos em segundos, sem instalar nada e sem deixar seu número em servidor nenhum.",
    servico: { slug: "automacoes-ia", rotulo: "Automações e atendimento com IA" },
    accent: "#0A6C9E",
    icone: "whatsapp",
  },
  {
    slug: "calculadora-preco-marketplace",
    nome: "Calculadora de preço para marketplace",
    titulo: "Calculadora de preço para marketplace — HyperGrow",
    descricao:
      "Descubra o preço de venda mínimo e o lucro real por venda no Mercado Livre, Shopee, Amazon e loja própria, com comissão, imposto e frete na conta aberta.",
    resolve:
      "Mostra o preço mínimo para você não vender no prejuízo e quanto sobra de verdade em cada venda, com a conta aberta linha por linha.",
    chamada:
      "Comissão, imposto, frete e margem entram na conta certa — e você vê para onde vai cada real do seu preço.",
    servico: { slug: "consultoria-ecommerce", rotulo: "Consultoria de e-commerce e marketplaces" },
    accent: "#3B2FCC",
    icone: "etiqueta",
  },
  {
    slug: "calculadora-roas",
    nome: "Calculadora de ROAS e teto de anúncio",
    titulo: "Calculadora de ROAS e CPA máximo para anúncios — HyperGrow",
    descricao:
      "Calcule o CPA máximo, o ROAS mínimo de equilíbrio e o CPC máximo do seu anúncio a partir do ticket médio e da margem. Com as fórmulas explicadas.",
    resolve:
      "Responde quanto você pode pagar por venda sem perder dinheiro, qual ROAS empata a conta e até quanto vale pagar por clique.",
    chamada:
      "O teto que a sua margem aguenta, com a fórmula de cada número escrita na tela — para você conferir, não só confiar.",
    servico: { slug: "marketing-trafego", rotulo: "Marketing e tráfego pago" },
    accent: "#A8560B",
    icone: "alvo",
  },
  {
    slug: "simulador-google",
    nome: "Simulador de resultado no Google",
    titulo: "Simulador de resultado no Google (SERP) — HyperGrow",
    descricao:
      "Veja como sua página aparece no resultado do Google no computador e no celular, com contagem de caracteres e a largura real do título em pixels.",
    resolve:
      "Mostra como seu título e sua descrição aparecem na busca, onde o texto vai ser cortado e o que dá para melhorar antes de publicar.",
    chamada:
      "A prévia no computador e no celular, com contagem de caracteres e a medida real em pixels do título.",
    servico: { slug: "seo", rotulo: "SEO: site no topo dos buscadores" },
    accent: "#1550E8",
    icone: "busca",
  },
];

export function getFerramenta(slug: string): Ferramenta | null {
  return FERRAMENTAS.find((f) => f.slug === slug) || null;
}

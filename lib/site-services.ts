// Serviços da HyperGrow (agência e-commerce/marketing) — fonte única.
// Usado na home (cards) e nas páginas /servicos/[slug].

export type SiteService = {
  slug: string;
  icon: string; // lucide
  title: string;
  desc: string; // curta (card)
  long: string; // descrição da página
  glow: string;
  accent: string;
  tags: string[];
  outcomes: string[]; // bullets de resultado na página
};

export const siteServices: SiteService[] = [
  {
    slug: "criacao-de-site",
    icon: "layout-template",
    title: "Criação de Site & Landing Pages",
    desc: "Sites e páginas de alta conversão, rápidos e impecáveis.",
    long: "Criamos sites institucionais e landing pages de altíssima performance, pensados para converter visitantes em clientes. Design premium, carregamento instantâneo, SEO e responsividade total.",
    glow: "rgba(21,101,255,0.45)", accent: "#4d8bff",
    tags: ["Institucional", "Landing Pages", "SEO", "Alta conversão"],
    outcomes: ["Carregamento em um piscar de olhos", "Otimizado para Google e redes sociais", "Responsivo e mobile-first", "Páginas que vendem, não só bonitas"],
  },
  {
    slug: "loja-virtual",
    icon: "store",
    title: "Criação de Loja Virtual",
    desc: "E-commerce completo, pronto para vender e escalar.",
    long: "Montamos sua loja virtual do zero ou migramos a atual: catálogo, checkout otimizado, meios de pagamento, frete e integrações. Tudo pronto para vender 24 horas por dia.",
    glow: "rgba(91,60,255,0.45)", accent: "#7da8ff",
    tags: ["Shopify", "WooCommerce", "Nuvemshop", "Checkout"],
    outcomes: ["Checkout sem fricção", "Integrações de pagamento e frete", "Pronta para escalar vendas", "Painel para gerir tudo"],
  },
  {
    slug: "consultoria-ecommerce",
    icon: "compass",
    title: "Consultoria E-commerce & Marketplaces",
    desc: "Estratégia de vendas online e marketplaces.",
    long: "Estratégia de crescimento para o seu e-commerce: posicionamento, precificação, marketplaces (Mercado Livre, Amazon, Shopee), operação e métricas. Um plano claro para vender mais.",
    glow: "rgba(0,200,150,0.40)", accent: "#3ee6b5",
    tags: ["Estratégia", "Marketplaces", "Precificação", "KPIs"],
    outcomes: ["Diagnóstico completo da operação", "Plano de crescimento sob medida", "Presença em marketplaces", "Decisão baseada em dados"],
  },
  {
    slug: "marketing-trafego",
    icon: "megaphone",
    title: "Marketing Digital & Tráfego Pago",
    desc: "Campanhas que vendem todos os dias.",
    long: "Estratégia de marketing e campanhas de tráfego pago no Meta (Instagram/Facebook) e Google. Criativos, segmentação, otimização e relatórios — foco total em retorno sobre o investimento.",
    glow: "rgba(255,45,122,0.42)", accent: "#FF4D94",
    tags: ["Meta Ads", "Google Ads", "Performance", "Funil"],
    outcomes: ["Mais vendas com previsibilidade", "Otimização contínua de ROI", "Criativos que convertem", "Relatórios claros"],
  },
  {
    slug: "redes-sociais",
    icon: "instagram",
    title: "Gestão de Redes Sociais",
    desc: "Conteúdo, calendário e engajamento que constroem marca.",
    long: "Cuidamos das suas redes de ponta a ponta: planejamento de conteúdo, criação de posts e stories para Instagram e Facebook, calendário, publicação e engajamento com a comunidade.",
    glow: "rgba(91,60,255,0.42)", accent: "#5b3cff",
    tags: ["Instagram", "Facebook", "Conteúdo", "Community"],
    outcomes: ["Presença constante e profissional", "Conteúdo estratégico", "Mais alcance e engajamento", "Marca forte e lembrada"],
  },
  {
    slug: "design-identidade",
    icon: "palette",
    title: "Design & Identidade Visual",
    desc: "Marca, peças e banners de altíssimo nível.",
    long: "Construímos marcas memoráveis: logotipo, identidade visual completa, peças para redes sociais, banners e materiais. Um visual que transmite tecnologia, autoridade e confiança.",
    glow: "rgba(245,158,11,0.40)", accent: "#fbbf24",
    tags: ["Logotipo", "Identidade", "Banners", "Peças"],
    outcomes: ["Identidade visual premium", "Peças prontas para campanhas", "Padrão visual consistente", "Marca que impressiona"],
  },
  {
    slug: "producao-de-video",
    icon: "video",
    title: "Produção de Vídeo",
    desc: "Vídeos para web e redes que prendem a atenção.",
    long: "Roteiro, produção e edição de vídeos para web, social e anúncios. Conteúdo dinâmico e profissional que comunica sua mensagem e aumenta conversão.",
    glow: "rgba(52,225,255,0.42)", accent: "#34e1ff",
    tags: ["Reels", "Anúncios", "Institucional", "Edição"],
    outcomes: ["Vídeos que param o scroll", "Conteúdo para anúncios e social", "Edição profissional", "Mais conversão em vídeo"],
  },
  {
    slug: "producao-fotografica",
    icon: "camera",
    title: "Produção Fotográfica",
    desc: "Fotos de produto e marca que vendem.",
    long: "Produção fotográfica profissional de produtos e marca: fotos que valorizam o que você vende e elevam a percepção de qualidade no e-commerce e nas redes.",
    glow: "rgba(21,101,255,0.40)", accent: "#4d8bff",
    tags: ["Produto", "Lifestyle", "E-commerce", "Social"],
    outcomes: ["Fotos que valorizam o produto", "Padrão visual para a loja", "Mais desejo de compra", "Conteúdo para campanhas"],
  },
  {
    slug: "podcast-youtube",
    icon: "mic",
    title: "Podcast & YouTube",
    desc: "Criação e gestão de canal e episódios.",
    long: "Estruturamos e produzimos seu podcast e canal no YouTube: roteiro, gravação, edição, miniaturas e publicação. Autoridade e audiência construídas com consistência.",
    glow: "rgba(255,45,122,0.40)", accent: "#FF4D94",
    tags: ["YouTube", "Podcast", "Edição", "Roteiro"],
    outcomes: ["Canal profissional do zero", "Episódios com constância", "Autoridade no seu nicho", "Audiência que cresce"],
  },
  {
    slug: "email-marketing",
    icon: "mail",
    title: "E-mail Marketing",
    desc: "Réguas e automações que recuperam e fidelizam.",
    long: "Fluxos e automações de e-mail que recuperam carrinhos, nutrem leads e fidelizam clientes. Réguas inteligentes, segmentação e relatórios de performance.",
    glow: "rgba(0,200,150,0.40)", accent: "#3ee6b5",
    tags: ["Fluxos", "Recuperação", "Réguas", "Newsletter"],
    outcomes: ["Carrinhos recuperados", "Clientes que voltam a comprar", "Automação que trabalha sozinha", "Mais receita por cliente"],
  },
  {
    slug: "automacoes-ia",
    icon: "bot",
    title: "Automações & IA",
    desc: "Agentes de IA e fluxos que trabalham 24/7.",
    long: "Agentes de IA que atendem, qualificam e vendem, além de automações que conectam suas ferramentas e eliminam o trabalho repetitivo. Sua operação rodando sozinha, 24 horas por dia.",
    glow: "rgba(52,225,255,0.42)", accent: "#34e1ff",
    tags: ["Agentes IA", "n8n", "Atendimento", "Fluxos"],
    outcomes: ["Atendimento 24/7 com IA", "Menos custo e menos erro", "Leads qualificados sozinhos", "Integração entre sistemas"],
  },
  {
    slug: "gestao-de-transportes",
    icon: "truck",
    title: "Gestão de Transportes",
    desc: "Logística e fretes para e-commerce.",
    long: "Logística completa para o seu e-commerce: cotação e gestão de fretes, etiquetas, rastreio e operação do pedido à entrega — reduzindo custo e melhorando a experiência do cliente.",
    glow: "rgba(91,60,255,0.40)", accent: "#7da8ff",
    tags: ["Fretes", "Rastreio", "Etiquetas", "Fulfillment"],
    outcomes: ["Frete otimizado e mais barato", "Rastreio para o cliente", "Operação organizada", "Entregas no prazo"],
  },
];

export function getService(slug: string) {
  return siteServices.find((s) => s.slug === slug) || null;
}

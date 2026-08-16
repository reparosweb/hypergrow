/* ─────────────────────────────────────────────────────────────────────────────
   FONTE ÚNICA DAS FERRAMENTAS GRÁTIS.

   Quem consome: a página-hub /ferramentas, cada página de ferramenta (título,
   descrição, cor, serviço relacionado) e o `app/sitemap.ts`. Ferramenta nova
   entra AQUI e já nasce listada no hub e no sitemap — foi assim que o catálogo
   de serviços evitou ficar fora do mapa do site.

   Módulo LEVE de propósito: só texto e cor, nada de componente. Ele é
   importado por página estática; não pode arrastar peso para o cliente.
   ──────────────────────────────────────────────────────────────────────────── */

export type IconeFerramenta =
  | "whatsapp"
  | "etiqueta"
  | "alvo"
  | "busca"
  | "escudo"
  | "elo"
  | "qr"
  | "relogio";

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
  {
    slug: "gerador-politica-privacidade",
    nome: "Gerador de política de privacidade (LGPD)",
    titulo: "Gerador de política de privacidade LGPD grátis — HyperGrow",
    descricao:
      "Gere a política de privacidade do seu site conforme a Lei 13.709/2018 (LGPD): responda seis perguntas, copie o texto pronto e baixe em .txt ou .html. Grátis, sem cadastro.",
    resolve:
      "Monta o texto da política de privacidade do seu site a partir do que você realmente coleta, já citando os artigos da LGPD — pronto para copiar, baixar e publicar.",
    chamada:
      "Um modelo-base honesto, montado com os seus dados e com a lei citada onde ela se aplica. Não substitui advogado — e a página diz isso em letra grande.",
    servico: { slug: "criacao-de-site", rotulo: "Criação de site e landing pages" },
    accent: "#5B3CFF",
    icone: "escudo",
  },
  {
    slug: "gerador-utm",
    nome: "Gerador de link UTM",
    titulo: "Gerador de link UTM para GA4 e anúncios — HyperGrow",
    descricao:
      "Monte links com utm_source, utm_medium e utm_campaign sem quebrar o relatório: a ferramenta avisa sobre espaço, maiúscula, acento e URL que já tem query string.",
    resolve:
      "Monta o link rastreável e avisa antes dos erros que sujam o relatório: espaço, letra maiúscula, acento e URL que já tinha parâmetro.",
    chamada:
      "O link pronto para colar no anúncio, no e-mail ou na bio — com os erros clássicos apontados enquanto você digita, não três meses depois no relatório.",
    servico: { slug: "marketing-trafego", rotulo: "Marketing e tráfego pago" },
    accent: "#B31356",
    icone: "elo",
  },
  {
    slug: "gerador-qr-code",
    nome: "Gerador de QR Code",
    titulo: "Gerador de QR Code grátis em PNG e SVG — HyperGrow",
    descricao:
      "Crie QR Code de link, PIX copia e cola, rede Wi-Fi ou texto e baixe em PNG ou SVG. Sem marca d'água, sem cadastro e sem prazo de validade — o QR é desenhado no seu navegador.",
    resolve:
      "Transforma link, código PIX, senha do Wi-Fi ou qualquer texto em um QR Code que você baixa em PNG ou SVG e usa para sempre.",
    chamada:
      "Sem marca d'água, sem cadastro e sem link intermediário que pode sair do ar: o desenho sai pronto do seu próprio navegador.",
    servico: { slug: "cartao-interativo", rotulo: "Cartão de visita interativo" },
    accent: "#0B6B5B",
    icone: "qr",
  },
  {
    slug: "calculadora-preco-hora",
    nome: "Calculadora de preço por hora",
    titulo: "Calculadora de preço por hora e de projeto — HyperGrow",
    descricao:
      "Descubra quanto cobrar por hora a partir dos seus custos fixos, do pró-labore, das horas produtivas, da margem e dos impostos — e o preço do projeto pelas horas estimadas.",
    resolve:
      "Responde quanto a sua hora precisa custar para pagar as contas, o seu salário, o imposto e ainda sobrar lucro — com a conta aberta linha por linha.",
    chamada:
      "O piso da sua hora, calculado a partir do que a sua operação realmente custa — e o preço do projeto a partir dele.",
    servico: { slug: "auditoria-comercial", rotulo: "Auditoria comercial" },
    accent: "#7A2E8E",
    icone: "relogio",
  },
];

export function getFerramenta(slug: string): Ferramenta | null {
  return FERRAMENTAS.find((f) => f.slug === slug) || null;
}

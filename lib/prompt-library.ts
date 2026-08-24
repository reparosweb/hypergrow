/* ─────────────────────────────────────────────────────────────────────────────
   BIBLIOTECA DE PROMPTS PARA GERADOR DE IMAGEM (ChatGPT/GPT Image, Gemini etc.).

   Fonte única dos prompts da ferramenta grátis "Biblioteca de prompts para
   imagens com IA". Cada item é um prompt PRONTO para copiar e colar num
   gerador de imagem — escrito do zero para este site, sem citar marca de
   terceiro, pessoa real ou número/resultado de negócio (é uma ferramenta de
   imagem, não de resultado).

   Quem consome: o Client Component da ferramenta
   (`components/ferramentas/BibliotecaPrompts.tsx`) e sua página em
   `app/ferramentas/biblioteca-prompts-imagens-ia/page.tsx`.

   Módulo LEVE de propósito: só texto e categoria, nada de componente.
   ──────────────────────────────────────────────────────────────────────────── */

export type PromptCategoriaKey =
  | "produto"
  | "redes-sociais"
  | "anuncios"
  | "marca"
  | "apresentacao"
  | "ambiente";

export type PromptCategoria = {
  key: PromptCategoriaKey;
  label: string;
  desc: string;
};

export type PromptItem = {
  /** kebab-case, único. */
  slug: string;
  categoria: PromptCategoriaKey;
  /** Curto, tipo "Foto de produto em fundo estúdio". */
  titulo: string;
  /** 1 frase: o que a imagem gerada vai parecer. */
  resultado: string;
  /** O texto real a copiar — em português, pronto pra colar no gerador de imagem. */
  prompt: string;
};

export const CATEGORIAS: PromptCategoria[] = [
  {
    key: "produto",
    label: "Fotos de produto",
    desc: "Fotos de estúdio, embalagem, still e hero de produto para loja virtual.",
  },
  {
    key: "redes-sociais",
    label: "Posts e redes sociais",
    desc: "Capa de post, story, thumbnail e carrossel prontos para publicar.",
  },
  {
    key: "anuncios",
    label: "Criativos de anúncio",
    desc: "Peça para Meta Ads e Google Ads, banner de oferta e antes-e-depois.",
  },
  {
    key: "marca",
    label: "Marca e identidade",
    desc: "Conceito de logo, mockup de cartão e embalagem, paleta aplicada.",
  },
  {
    key: "apresentacao",
    label: "Apresentação e dados",
    desc: "Infográfico, linha do tempo e comparativo visual para proposta comercial.",
  },
  {
    key: "ambiente",
    label: "Ambiente e contexto",
    desc: "Produto em uso, fachada de loja, workspace e mockup de app.",
  },
];

export const PROMPTS: PromptItem[] = [
  // ── Fotos de produto ────────────────────────────────────────────────────
  {
    slug: "foto-estudio-fundo-branco",
    categoria: "produto",
    titulo: "Foto de produto em fundo branco de estúdio",
    resultado: "Produto centralizado em fundo branco puro, sem sombra dura, pronto para marketplace.",
    prompt:
      "Fotografia de produto em estúdio, fundo branco puro (sem textura), produto centralizado ocupando cerca de 70% do quadro, luz difusa e uniforme vinda de cima e dos dois lados, sombra de contato bem sutil e curta embaixo do produto, foco nítido em toda a superfície, sem reflexo de logotipo ou marca de terceiros, proporção quadrada 1:1, estilo still fotográfico limpo de catálogo.",
  },
  {
    slug: "still-produto-superficie-marmore",
    categoria: "produto",
    titulo: "Still de produto sobre superfície de mármore",
    resultado: "Still elegante do produto apoiado sobre mármore claro, com reflexo sutil.",
    prompt:
      "Still fotográfico de produto apoiado sobre uma bancada de mármore branco com veios cinza-claros, câmera levemente inclinada em ângulo de três quartos, luz natural suave vinda de uma janela lateral, reflexo discreto do produto na superfície polida, fundo desfocado em tom neutro, paleta de cores clara e sofisticada, proporção 4:5, estilo still de revista de decoração.",
  },
  {
    slug: "produto-flutuante-sombra-projetada",
    categoria: "produto",
    titulo: "Produto flutuante com sombra projetada",
    resultado: "Produto sem apoio visível, flutuando sobre fundo colorido liso, com sombra desenhada abaixo.",
    prompt:
      "Fotografia de produto flutuando no ar, sem suporte ou fio visível, fundo liso em cor sólida pastel, sombra projetada nítida e alongada no chão simulando luz de uma única fonte vinda do canto superior esquerdo, alto contraste entre produto e fundo, composição centralizada com margem generosa ao redor, proporção 1:1, estilo publicitário minimalista.",
  },
  {
    slug: "produto-macro-textura-detalhe",
    categoria: "produto",
    titulo: "Macro de detalhe e textura do produto",
    resultado: "Close extremo mostrando a textura, o acabamento e o material do produto.",
    prompt:
      "Fotografia macro extrema de um detalhe do produto (costura, textura do tecido, gravação ou acabamento metálico), profundidade de campo rasa com apenas uma fina faixa em foco perfeito e o restante suavemente desfocado, luz lateral rasante que realça relevo e textura, fundo neutro fora de foco, cores fiéis ao material real, proporção 4:5, estilo still de catálogo premium.",
  },

  // ── Posts e redes sociais ───────────────────────────────────────────────
  {
    slug: "capa-post-quote-tipografia",
    categoria: "redes-sociais",
    titulo: "Capa de post com espaço para frase em destaque",
    resultado: "Post quadrado com fundo ilustrado e espaço reservado para inserir uma frase curta depois.",
    prompt:
      "Ilustração digital plana para capa de post de Instagram, fundo em gradiente suave de duas cores complementares, composição com bastante espaço negativo no terço superior reservado para inserir um texto curto depois, elemento gráfico simples (formas geométricas ou ícone de linha) no canto inferior, sem nenhum texto renderizado pela IA, estilo flat design moderno, proporção quadrada 1:1.",
  },
  {
    slug: "story-vertical-produto-destaque",
    categoria: "redes-sociais",
    titulo: "Story vertical com produto em destaque",
    resultado: "Imagem vertical de tela cheia com o produto em primeiro plano e fundo desfocado.",
    prompt:
      "Fotografia vertical em formato de story de celular, produto em primeiro plano ocupando o terço inferior do quadro, fundo em ambiente desfocado com luz quente de fim de tarde, muito espaço vazio no terço superior para inserir texto depois, cores saturadas mas naturais, iluminação cinematográfica suave, proporção 9:16.",
  },
  {
    slug: "thumbnail-video-alto-contraste",
    categoria: "redes-sociais",
    titulo: "Thumbnail de vídeo com alto contraste",
    resultado: "Capa de vídeo chamativa, com contraste forte entre sujeito e fundo, legível em miniatura.",
    prompt:
      "Imagem de capa para vídeo (thumbnail), composição com o assunto principal deslocado para o lado direito do quadro e fundo desfocado em cor contrastante, iluminação direcionada que separa claramente o sujeito do fundo, cores vibrantes e saturadas para chamar atenção mesmo em tamanho pequeno, sem nenhum texto renderizado pela IA, proporção 16:9.",
  },
  {
    slug: "carrossel-capa-slide-1",
    categoria: "redes-sociais",
    titulo: "Capa de carrossel (slide 1 de uma sequência)",
    resultado: "Primeira imagem de um carrossel, com identidade visual consistente para repetir nos próximos slides.",
    prompt:
      "Arte de abertura de carrossel para Instagram, fundo em cor sólida com uma faixa diagonal sutil de tom mais claro, ícone de linha simples centralizado representando o tema do conteúdo, moldura fina ao redor do quadro para reforçar a sensação de série, paleta de no máximo três cores, estilo gráfico limpo e consistente, proporção quadrada 1:1, sem texto renderizado.",
  },

  // ── Criativos de anúncio ────────────────────────────────────────────────
  {
    slug: "criativo-oferta-selo-desconto",
    categoria: "anuncios",
    titulo: "Criativo de oferta com selo de desconto",
    resultado: "Peça de anúncio com produto em destaque e área reservada para um selo de promoção.",
    prompt:
      "Criativo publicitário para anúncio de mídia social, produto centralizado em fundo colorido vibrante e liso, forma de selo circular vazio no canto superior direito reservado para inserir um percentual de desconto depois, iluminação frontal forte sem sombras duras, composição limpa com bastante contraste, estilo anúncio de e-commerce, proporção quadrada 1:1, sem nenhum texto ou número renderizado pela IA.",
  },
  {
    slug: "banner-antes-depois-dividido",
    categoria: "anuncios",
    titulo: "Banner antes-e-depois dividido ao meio",
    resultado: "Imagem dividida verticalmente ao meio, um lado em tom neutro e outro em tom vibrante, para comparação.",
    prompt:
      "Composição de banner publicitário dividida por uma linha vertical reta ao centro, lado esquerdo em paleta de cores neutras e dessaturadas, lado direito em paleta vibrante e saturada, o mesmo objeto ou cenário se repetindo dos dois lados em versões visualmente diferentes, transição limpa e reta na divisão, proporção 16:9, estilo criativo de antes-e-depois para anúncio.",
  },
  {
    slug: "anuncio-produto-mao-segurando",
    categoria: "anuncios",
    titulo: "Anúncio com produto sendo segurado na mão",
    resultado: "Foto em ponto de vista de primeira pessoa da mão segurando o produto, sensação de proximidade.",
    prompt:
      "Fotografia em ponto de vista de primeira pessoa, mão segurando o produto próximo à câmera, fundo desfocado em ambiente real e claro, luz natural suave vinda de frente, foco nítido no produto e na mão, composição levemente inclinada para transmitir naturalidade, cores quentes e convidativas, proporção 4:5, estilo anúncio autêntico de rede social.",
  },
  {
    slug: "banner-fundo-gradiente-produto-flutuante",
    categoria: "anuncios",
    titulo: "Banner com fundo em gradiente e produto flutuante",
    resultado: "Banner horizontal com produto flutuando sobre gradiente de cor e espaço lateral livre para texto.",
    prompt:
      "Banner publicitário horizontal, fundo em gradiente diagonal entre duas cores, produto flutuando no terço direito do quadro com sombra suave projetada, metade esquerda do quadro deixada limpa e vazia para inserir texto e botão depois, iluminação de estúdio simulada, proporção 16:9, estilo criativo para anúncio em display.",
  },

  // ── Marca e identidade ──────────────────────────────────────────────────
  {
    slug: "conceito-logo-simbolo-geometrico",
    categoria: "marca",
    titulo: "Conceito visual de símbolo geométrico para logo",
    resultado: "Exploração visual de um símbolo abstrato geométrico — referência inicial de conceito, não um logo final vetorizado.",
    prompt:
      "Ilustração de um símbolo abstrato minimalista formado por formas geométricas simples (círculos, linhas e triângulos) que se combinam em uma composição equilibrada, traço uniforme em uma única cor sobre fundo branco, sem nenhuma letra ou texto, estilo flat vetorial limpo, centralizado no quadro, proporção quadrada 1:1, útil como referência inicial de conceito para um logotipo (não é a arte final vetorizada).",
  },
  {
    slug: "mockup-cartao-visita-mesa",
    categoria: "marca",
    titulo: "Mockup de cartão de visita sobre mesa de madeira",
    resultado: "Cartão de visita em branco apoiado sobre mesa, em ângulo editorial, pronto para composição de identidade.",
    prompt:
      "Fotografia still de um cartão de visita retangular em branco liso apoiado sobre uma mesa de madeira clara, câmera em ângulo de quarenta e cinco graus vista de cima, luz natural suave vinda de uma janela lateral, sombra suave e curta ao lado do cartão, elementos discretos de escritório desfocados ao fundo (caneta, planta), proporção 4:5, estilo still editorial para apresentação de identidade visual, sem texto ou logotipo renderizado pela IA.",
  },
  {
    slug: "paleta-cores-aplicada-objetos",
    categoria: "marca",
    titulo: "Paleta de cores aplicada em conjunto de objetos",
    resultado: "Composição vista de cima (flat lay) de objetos simples nas cores de uma paleta de marca, para visualizar a combinação.",
    prompt:
      "Fotografia flat lay vista de cima, três a quatro objetos simples do dia a dia (caneca, caderno, clipe, cartão) organizados lado a lado, cada objeto em uma cor sólida diferente representando uma paleta de marca, fundo neutro liso, luz uniforme sem sombras duras, espaçamento regular entre os objetos, composição organizada em grade, proporção quadrada 1:1, estilo still minimalista.",
  },
  {
    slug: "mockup-embalagem-caixa-neutra",
    categoria: "marca",
    titulo: "Mockup de embalagem em caixa neutra",
    resultado: "Caixa de embalagem lisa sem marca aplicada, em still de estúdio, pronta para composição de identidade visual.",
    prompt:
      "Fotografia still de uma caixa de embalagem retangular em papel kraft ou papel liso sem nenhuma estampa, centralizada sobre fundo cinza-claro, luz de estúdio suave e uniforme vinda de cima, sombra de contato curta e sutil, ângulo levemente elevado mostrando a tampa e uma lateral da caixa, foco nítido nas bordas e dobras do papel, proporção 1:1, estilo still de mockup de embalagem.",
  },

  // ── Apresentação e dados ────────────────────────────────────────────────
  {
    slug: "infografico-comparativo-duas-colunas",
    categoria: "apresentacao",
    titulo: "Infográfico comparativo com duas colunas",
    resultado: "Estrutura visual de infográfico com duas colunas lado a lado, pronta para preencher com dados ou texto depois.",
    prompt:
      "Infográfico plano com duas colunas verticais separadas por uma linha fina central, cada coluna com um ícone de linha simples no topo e blocos retangulares vazios abaixo para inserir texto e números depois, paleta de duas cores complementares sobre fundo branco, estilo flat design corporativo, bastante espaço em branco entre os elementos, proporção 4:5, sem nenhum número ou texto renderizado pela IA.",
  },
  {
    slug: "linha-tempo-horizontal-marcos",
    categoria: "apresentacao",
    titulo: "Linha do tempo horizontal com marcos",
    resultado: "Estrutura visual de linha do tempo com marcadores ao longo de uma trilha horizontal, para preencher etapas depois.",
    prompt:
      "Ilustração de linha do tempo horizontal, uma trilha reta atravessando o quadro da esquerda para a direita com quatro círculos marcadores igualmente espaçados sobre ela, cada círculo conectado a uma caixa retangular vazia acima ou abaixo (alternando), paleta em tons de uma só cor, fundo branco, estilo flat minimalista, proporção 16:9, sem nenhum texto ou data renderizados pela IA.",
  },
  {
    slug: "grafico-pizza-estilizado-flat",
    categoria: "apresentacao",
    titulo: "Gráfico de pizza estilizado em flat design",
    resultado: "Ilustração de gráfico de pizza com fatias em cores diferentes, sem valores reais — apenas o estilo visual.",
    prompt:
      "Ilustração plana de um gráfico de pizza dividido em quatro fatias de tamanhos visivelmente diferentes, cada fatia em uma cor sólida distinta dentro da mesma paleta harmônica, leve sombra sutil sob o círculo para dar profundidade, fundo branco liso, legenda representada apenas por pequenos quadrados coloridos ao lado (sem texto), estilo flat design editorial, proporção quadrada 1:1.",
  },
  {
    slug: "mockup-slide-apresentacao-notebook",
    categoria: "apresentacao",
    titulo: "Mockup de slide de apresentação em notebook",
    resultado: "Tela de notebook mostrando um slide genérico em branco, em cena de escritório, para compor capa de proposta.",
    prompt:
      "Fotografia still de um notebook aberto sobre uma mesa de escritório clara, tela exibindo um slide em branco com apenas um retângulo de destaque genérico no centro (sem texto real), ângulo de três quartos, luz natural suave vinda de uma janela lateral, elementos discretos ao redor (caderno, caneca de café) fora de foco, proporção 16:9, estilo still corporativo para capa de proposta comercial.",
  },

  // ── Ambiente e contexto ─────────────────────────────────────────────────
  {
    slug: "produto-em-uso-cotidiano",
    categoria: "ambiente",
    titulo: "Produto em uso no dia a dia",
    resultado: "Cena cotidiana e natural mostrando o produto sendo usado em contexto real, sem parecer still de estúdio.",
    prompt:
      "Fotografia lifestyle mostrando o produto sendo usado em uma cena cotidiana real (cozinha, mesa de trabalho ou sala, conforme o produto), luz natural de janela, composição levemente assimétrica que parece um flagrante e não uma pose, cores naturais e levemente quentes, profundidade de campo rasa com o produto em foco e o ambiente suavemente desfocado, proporção 4:5, estilo fotografia lifestyle editorial.",
  },
  {
    slug: "fachada-loja-fisica-vitrine",
    categoria: "ambiente",
    titulo: "Fachada de loja física com vitrine",
    resultado: "Fachada genérica de loja de rua com vitrine iluminada, representando um ambiente comercial — não uma loja real específica.",
    prompt:
      "Fotografia de fachada de loja de rua genérica, vitrine de vidro iluminada por dentro mostrando prateleiras desfocadas, letreiro acima da porta deixado em branco (sem nome ou texto), calçada e entrada visíveis, luz de fim de tarde com tom quente, ângulo levantado a partir da calçada olhando para a fachada, proporção 4:5, estilo fotografia urbana editorial, sem nenhuma marca ou nome real renderizado.",
  },
  {
    slug: "workspace-flat-lay-ferramentas",
    categoria: "ambiente",
    titulo: "Workspace em flat lay com ferramentas de trabalho",
    resultado: "Composição vista de cima de uma mesa de trabalho organizada, com objetos relacionados ao produto ou serviço.",
    prompt:
      "Fotografia flat lay vista diretamente de cima de uma mesa de trabalho clara, com notebook, caderno aberto, caneca, planta pequena e o produto posicionado em destaque no centro, objetos organizados em composição equilibrada com espaçamento generoso, luz natural suave e uniforme, paleta de cores neutras e claras, proporção quadrada 1:1, estilo still editorial de workspace.",
  },
  {
    slug: "mockup-app-celular-mao-uso",
    categoria: "ambiente",
    titulo: "Mockup de aplicativo em celular sendo usado",
    resultado: "Mão segurando um celular com uma tela de aplicativo genérica, em cenário real e desfocado ao fundo.",
    prompt:
      "Fotografia em ponto de vista de primeira pessoa, mão segurando um celular na vertical, tela do celular exibindo uma interface de aplicativo genérica com blocos e botões simples (sem texto real, sem logotipo), fundo do ambiente desfocado em tom neutro e claro, luz natural suave vinda de lado, foco nítido na tela do celular, proporção 9:16, estilo mockup realista de produto digital.",
  },
];

export function getPrompt(slug: string): PromptItem | null {
  return PROMPTS.find((p) => p.slug === slug) || null;
}

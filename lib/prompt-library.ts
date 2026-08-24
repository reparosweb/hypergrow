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

  {
    slug: "produto-molhado-gotas-agua",
    categoria: "produto",
    titulo: "Produto molhado com respingos e gotas de água",
    resultado: "Produto coberto por gotas e respingos de água suspensos, passando sensação de frescor e limpeza.",
    prompt:
      "Fotografia de produto com a superfície coberta por gotas de água nítidas e alguns respingos suspensos no ar ao redor, capturados em altíssima velocidade, fundo em cor sólida fria (azul ou verde-água) levemente esfumaçado, luz de estúdio direcional vinda de trás para iluminar as gotas em contraluz, reflexos brilhantes nas gotículas, foco nítido no produto e nas gotas próximas, proporção quadrada 1:1, estilo publicitário de frescor, sem marca de terceiros.",
  },
  {
    slug: "produto-contraluz-fumaca-dramatico",
    categoria: "produto",
    titulo: "Produto em contraluz dramático com fumaça",
    resultado: "Produto recortado por uma luz de fundo forte, com leve fumaça, silhueta marcante sobre fundo escuro.",
    prompt:
      "Fotografia de produto em iluminação low key sobre fundo preto profundo, uma única luz de recorte (rim light) atrás do produto desenhando um contorno luminoso em suas bordas, fina fumaça ou vapor cruzando o quadro por trás, o corpo do produto em penumbra com apenas um leve preenchimento frontal, atmosfera dramática e sofisticada, ângulo levemente baixo para dar imponência, proporção 4:5, estilo still cinematográfico premium.",
  },
  {
    slug: "produto-fundo-tecido-texturizado",
    categoria: "produto",
    titulo: "Produto sobre fundo de tecido texturizado",
    resultado: "Produto apoiado sobre tecido amassado (linho ou veludo), com sombras suaves e clima aconchegante.",
    prompt:
      "Still fotográfico de produto apoiado sobre um tecido de linho amassado (ou veludo) em tom neutro quente, dobras e vincos do tecido criando textura e sombras suaves ao redor, luz lateral macia vinda de uma janela fora do quadro, câmera em ângulo de três quartos próximo ao nível da mesa, profundidade de campo média com o produto em foco e o fundo do tecido levemente desfocado, paleta terrosa e aconchegante, proporção 4:5, estilo still editorial de decoração.",
  },
  {
    slug: "produto-knolling-vista-cima",
    categoria: "produto",
    titulo: "Produto e acessórios em knolling visto de cima",
    resultado: "Produto e seus componentes organizados em ângulos retos, alinhados e espaçados, vistos diretamente de cima.",
    prompt:
      "Fotografia knolling vista diretamente de cima (90 graus), o produto e seus acessórios ou componentes dispostos lado a lado perfeitamente alinhados em ângulos retos, espaçamento regular entre cada item, fundo liso em cor neutra clara, luz uniforme e difusa sem sombras duras, foco nítido em todos os objetos, composição organizada em grade simétrica, proporção quadrada 1:1, estilo still de organização minimalista.",
  },
  {
    slug: "produto-hero-cyclorama-infinito",
    categoria: "produto",
    titulo: "Hero de produto em fundo infinito colorido",
    resultado: "Produto herói centralizado sobre fundo curvo infinito de uma cor só, com transição suave entre chão e parede.",
    prompt:
      "Fotografia hero de produto em um estúdio de fundo infinito (cyclorama) de uma única cor saturada, transição suave e sem emenda entre o piso e a parede ao fundo, produto centralizado e em ângulo levemente baixo para transmitir destaque, luz de estúdio ampla e suave com um leve gradiente do claro ao escuro no fundo, sombra de contato curta abaixo, foco nítido, muita margem ao redor, proporção 4:5, estilo publicitário de lançamento.",
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

  {
    slug: "reels-capa-vertical-movimento",
    categoria: "redes-sociais",
    titulo: "Capa de Reels vertical com sensação de movimento",
    resultado: "Imagem vertical com o assunto em meio a um movimento, leve borrão de velocidade e espaço para título.",
    prompt:
      "Imagem vertical de capa para Reels, assunto principal em plena ação com um leve motion blur nas extremidades sugerindo movimento, fundo dinâmico com desfoque de velocidade, luz vibrante e contrastada, composição com o assunto no terço central e espaço livre no topo e na base para inserir título depois, cores saturadas e energéticas, proporção 9:16, sem nenhum texto renderizado pela IA.",
  },
  {
    slug: "post-flat-lay-sazonal",
    categoria: "redes-sociais",
    titulo: "Post flat lay com tema sazonal",
    resultado: "Composição vista de cima com elementos de uma estação ou data comemorativa ao redor de um espaço central livre.",
    prompt:
      "Fotografia flat lay vista de cima para post de Instagram, moldura decorativa formada por elementos sazonais (folhas de outono, ramos de pinheiro, flores da primavera ou frutas de verão, conforme o tema) nas bordas do quadro, centro deixado limpo e vazio para inserir texto ou produto depois, fundo liso em tom que combina com a estação, luz natural suave e uniforme, composição simétrica e equilibrada, proporção quadrada 1:1, estilo still decorativo, sem texto renderizado.",
  },
  {
    slug: "story-enquete-espaco-sticker",
    categoria: "redes-sociais",
    titulo: "Story com espaço para sticker de enquete",
    resultado: "Fundo vertical de story com uma faixa central limpa reservada para colar um adesivo de enquete ou pergunta depois.",
    prompt:
      "Fundo vertical para story de Instagram, imagem de ambiente desfocado com luz suave, faixa horizontal central deixada limpa e levemente escurecida por um overlay sutil, reservada para colar um adesivo de enquete ou caixa de pergunta depois, elementos gráficos discretos nos cantos, muito espaço negativo, proporção 9:16, estilo clean e moderno, sem nenhum texto renderizado pela IA.",
  },
  {
    slug: "capa-perfil-banner-horizontal",
    categoria: "redes-sociais",
    titulo: "Banner horizontal de capa de perfil",
    resultado: "Faixa larga e horizontal com composição centralizada e margens seguras, para capa de perfil de rede social.",
    prompt:
      "Banner horizontal largo para capa de perfil de rede social, fundo em gradiente suave de duas cores com um padrão geométrico discreto de um dos lados, elemento gráfico simples centralizado, amplas margens de segurança nas laterais e no centro para que nada importante seja cortado pela foto de perfil, paleta de no máximo três cores, proporção 16:9 em formato de faixa, estilo clean corporativo, sem texto renderizado.",
  },
  {
    slug: "carrossel-slide-interno-conteudo",
    categoria: "redes-sociais",
    titulo: "Slide interno de carrossel para conteúdo",
    resultado: "Um slide do meio de um carrossel, com área de título no topo e bloco de conteúdo abaixo, mantendo a identidade da série.",
    prompt:
      "Arte de slide interno de carrossel para Instagram (não a capa), fundo em cor sólida clara com uma faixa fina colorida no topo, área retangular vazia no terço superior reservada para um título curto e um bloco maior vazio abaixo para o texto do conteúdo, ícone de linha simples no rodapé, moldura fina consistente com a série, paleta de até três cores, proporção quadrada 1:1, estilo gráfico limpo, sem texto renderizado pela IA.",
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

  {
    slug: "anuncio-lancamento-spotlight",
    categoria: "anuncios",
    titulo: "Anúncio de lançamento com produto sob spotlight",
    resultado: "Produto iluminado por um facho de luz sobre palco escuro, clima de estreia e destaque.",
    prompt:
      "Criativo publicitário de lançamento, produto centralizado sobre um palco escuro iluminado por um único facho de spotlight vindo de cima, fundo preto ou azul-escuro com leve névoa para dar volume ao facho de luz, reflexo suave do produto no piso, clima de estreia e expectativa, muito espaço escuro ao redor para inserir texto depois, proporção quadrada 1:1, estilo anúncio dramático de novidade, sem texto ou número renderizado pela IA.",
  },
  {
    slug: "banner-beneficios-icones",
    categoria: "anuncios",
    titulo: "Banner de benefícios com fileira de ícones",
    resultado: "Banner horizontal com uma linha de ícones simples espaçados, cada um com espaço abaixo para descrever um benefício.",
    prompt:
      "Banner publicitário horizontal, fundo em cor sólida clara, fileira de três a quatro ícones de linha simples igualmente espaçados na faixa central (representando entrega, garantia, qualidade e suporte de forma genérica), abaixo de cada ícone um pequeno espaço vazio reservado para inserir um texto curto depois, paleta de duas cores, muito espaço em branco, proporção 16:9, estilo flat design de e-commerce, sem nenhum texto renderizado pela IA.",
  },
  {
    slug: "anuncio-grid-variacoes-produto",
    categoria: "anuncios",
    titulo: "Anúncio em grade com variações do produto",
    resultado: "Grade organizada mostrando o mesmo produto em cores ou versões diferentes, lado a lado.",
    prompt:
      "Criativo publicitário em grade simétrica de quatro quadrantes, o mesmo tipo de produto repetido em cada quadrante em uma cor ou variação diferente, cada um sobre fundo de cor sólida distinta dentro de uma paleta harmônica, iluminação idêntica e uniforme em todos, linhas finas separando os quadrantes, composição perfeitamente alinhada, proporção quadrada 1:1, estilo catálogo de variações, sem texto ou preço renderizado pela IA.",
  },
  {
    slug: "criativo-fundo-neon-escuro",
    categoria: "anuncios",
    titulo: "Criativo promocional com fundo escuro e neon",
    resultado: "Produto sobre fundo escuro com luzes neon coloridas ao redor, clima de promoção noturna.",
    prompt:
      "Criativo publicitário de promoção, produto centralizado sobre fundo escuro com traços de luz neon colorida (rosa e ciano) formando linhas e brilhos ao redor, reflexos neon sutis na superfície do produto, atmosfera noturna e vibrante, espaço escuro reservado no topo e na base para inserir texto e selo depois, proporção 4:5, estilo criativo de promoção noturna, sem nenhum texto ou número renderizado pela IA.",
  },
  {
    slug: "anuncio-editorial-cor-bold",
    categoria: "anuncios",
    titulo: "Anúncio editorial com bloco de cor forte",
    resultado: "Produto sobre composição de blocos de cor sólida e marcante, com metade do quadro reservada para texto.",
    prompt:
      "Criativo publicitário estilo editorial de revista, composição dividida em blocos de cor sólida e vibrante em contraste (por exemplo um bloco grande e um bloco menor), produto posicionado sobre o encontro dos blocos no lado direito do quadro, metade esquerda deixada como um bloco de cor limpo para inserir texto grande depois, iluminação de estúdio nítida, sombras geométricas definidas, proporção 4:5, estilo bold editorial, sem texto renderizado pela IA.",
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

  {
    slug: "mockup-sacola-papel-neutra",
    categoria: "marca",
    titulo: "Mockup de sacola de papel em branco",
    resultado: "Sacola de papel lisa sem estampa, em still de estúdio, pronta para aplicar uma identidade visual.",
    prompt:
      "Fotografia still de uma sacola de compras de papel liso sem nenhuma estampa, com alças, apoiada em pé sobre fundo neutro claro, luz de estúdio suave e uniforme vinda de cima e de um lado, sombra de contato curta e sutil, ângulo levemente frontal mostrando a face maior e uma lateral da sacola, foco nítido nas dobras do papel, proporção 4:5, estilo still de mockup de identidade visual, sem logotipo ou texto renderizado pela IA.",
  },
  {
    slug: "mockup-camiseta-uniforme-neutra",
    categoria: "marca",
    titulo: "Mockup de camiseta lisa para uniforme",
    resultado: "Camiseta lisa sem estampa, apresentada de frente, pronta para aplicar logo ou arte da marca.",
    prompt:
      "Fotografia still de uma camiseta básica lisa sem nenhuma estampa, em cor sólida neutra, apresentada de frente esticada de forma limpa em efeito ghost mannequin (sem pessoa), fundo cinza-claro uniforme, luz de estúdio suave e simétrica, leve sombra atrás para dar profundidade, foco nítido na textura do tecido e nas costuras, proporção 4:5, estilo mockup de vestuário para identidade visual, sem logotipo ou texto renderizado pela IA.",
  },
  {
    slug: "padrao-repetivel-marca",
    categoria: "marca",
    titulo: "Padrão repetível para identidade de marca",
    resultado: "Estampa contínua de formas simples que se repetem, útil como padrão de fundo de uma marca.",
    prompt:
      "Ilustração de um padrão contínuo e repetível (seamless pattern) formado por formas geométricas simples e ícones de linha distribuídos de maneira uniforme e espaçada, duas ou três cores de uma paleta de marca sobre fundo de cor sólida clara, traço uniforme, sem nenhuma letra ou texto, composição que se repete sem emendas visíveis, proporção quadrada 1:1, estilo flat vetorial minimalista para papelaria e embalagem.",
  },
  {
    slug: "mockup-papelaria-flat-lay",
    categoria: "marca",
    titulo: "Mockup de papelaria em flat lay",
    resultado: "Conjunto de papelaria em branco (papel timbrado, envelope, cartão) visto de cima, pronto para aplicar a marca.",
    prompt:
      "Fotografia flat lay vista de cima de um conjunto de papelaria em branco liso sem estampa — uma folha de papel timbrado, um envelope e um cartão — organizados lado a lado com leve sobreposição, fundo neutro claro, luz suave e uniforme sem sombras duras, sombras de contato curtas e realistas, composição alinhada e equilibrada, proporção quadrada 1:1, estilo still de mockup de identidade visual, sem logotipo ou texto renderizado pela IA.",
  },
  {
    slug: "conceito-emblema-selo-marca",
    categoria: "marca",
    titulo: "Conceito de emblema circular para marca",
    resultado: "Exploração visual de um emblema circular abstrato — referência de conceito, não a arte final vetorizada.",
    prompt:
      "Ilustração de um emblema circular minimalista (estilo selo ou brasão simplificado), composto por um anel externo e um símbolo abstrato central formado por formas geométricas simples, sem nenhuma letra ou texto, traço uniforme em uma ou duas cores sobre fundo claro, centralizado e simétrico no quadro, estilo flat vetorial limpo, proporção quadrada 1:1, útil como referência inicial de conceito para uma marca (não é a arte final vetorizada).",
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

  {
    slug: "grafico-barras-estilizado-flat",
    categoria: "apresentacao",
    titulo: "Gráfico de barras estilizado em flat design",
    resultado: "Ilustração de gráfico de barras com colunas de alturas diferentes, sem valores reais — só o estilo visual.",
    prompt:
      "Ilustração plana de um gráfico de barras com cinco colunas verticais de alturas visivelmente diferentes, cada coluna em uma cor sólida da mesma paleta harmônica, eixo horizontal representado por uma linha fina na base, fundo branco liso, leve sombra sutil sob as colunas, sem nenhum número ou rótulo, estilo flat design editorial, bastante espaço em branco, proporção quadrada 1:1, sem texto renderizado pela IA.",
  },
  {
    slug: "funil-etapas-conversao-visual",
    categoria: "apresentacao",
    titulo: "Funil visual de etapas",
    resultado: "Ilustração de um funil dividido em faixas horizontais decrescentes, para representar etapas — sem valores.",
    prompt:
      "Ilustração plana de um funil visto de frente dividido em quatro faixas horizontais que estreitam de cima para baixo, cada faixa em um tom diferente de uma mesma cor (do mais claro no topo ao mais escuro na base), pequeno espaço vazio ao lado de cada faixa reservado para inserir um rótulo depois, fundo branco, estilo flat minimalista, proporção 4:5, sem nenhum número ou texto renderizado pela IA.",
  },
  {
    slug: "fluxograma-processo-setas",
    categoria: "apresentacao",
    titulo: "Fluxograma de processo com caixas e setas",
    resultado: "Estrutura de fluxograma com caixas conectadas por setas, pronta para preencher as etapas depois.",
    prompt:
      "Ilustração de fluxograma horizontal, quatro caixas retangulares vazias conectadas em sequência por setas finas apontando para a direita, uma das caixas com um losango de decisão logo abaixo também vazio, paleta de duas cores sobre fundo branco, cantos levemente arredondados, estilo flat design corporativo, espaçamento generoso, proporção 16:9, sem nenhum texto renderizado pela IA.",
  },
  {
    slug: "mapa-mental-hub-central",
    categoria: "apresentacao",
    titulo: "Mapa mental com hub central e ramificações",
    resultado: "Círculo central conectado por linhas a vários nós ao redor, estrutura de mapa mental para preencher depois.",
    prompt:
      "Ilustração de mapa mental, um círculo central maior conectado por linhas curvas finas a seis círculos menores distribuídos ao redor de forma equilibrada, cada círculo com um ícone de linha simples dentro, paleta harmônica de três cores sobre fundo branco, estilo flat minimalista, composição radial simétrica, proporção quadrada 1:1, sem nenhum texto renderizado pela IA.",
  },
  {
    slug: "mockup-dashboard-cards-kpi",
    categoria: "apresentacao",
    titulo: "Mockup de dashboard com cards e gráficos",
    resultado: "Tela de painel genérica com cards e gráficos em branco, para compor slide de proposta — sem números reais.",
    prompt:
      "Ilustração de um mockup de painel (dashboard) genérico visto de frente, uma fileira de cards retangulares no topo com pequenos ícones e espaços vazios para números, abaixo dois blocos maiores representando um gráfico de linha e um gráfico de barras sem valores, paleta de duas cores sobre fundo claro, cantos arredondados e leve sombra nos cards, estilo flat de interface limpa, proporção 16:9, sem nenhum número ou texto renderizado pela IA.",
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
  {
    slug: "produto-ambiente-externo-natureza",
    categoria: "ambiente",
    titulo: "Produto em ambiente externo na natureza",
    resultado: "Produto apoiado em cenário natural ao ar livre, com luz do dia e fundo de vegetação desfocado.",
    prompt:
      "Fotografia lifestyle do produto apoiado sobre uma pedra ou tronco em um cenário natural ao ar livre (mata, campo ou praia, conforme o produto), luz do dia natural e suave em horário de manhã, fundo de vegetação ou paisagem suavemente desfocado, profundidade de campo rasa com o produto em foco nítido, cores naturais e frescas, ângulo próximo ao nível do produto, proporção 4:5, estilo fotografia lifestyle ao ar livre.",
  },
  {
    slug: "interior-loja-prateleiras-organizadas",
    categoria: "ambiente",
    titulo: "Interior de loja com prateleiras organizadas",
    resultado: "Ambiente interno genérico de loja com prateleiras bem organizadas e iluminação agradável — não uma loja real.",
    prompt:
      "Fotografia de interior de loja genérica, prateleiras organizadas com produtos desfocados dispostos de forma alinhada, corredor central levando o olhar para o fundo, iluminação interna quente e uniforme, piso limpo refletindo levemente a luz, nenhuma marca, nome ou cartaz legível, ângulo na altura dos olhos olhando pelo corredor, proporção 16:9, estilo fotografia de varejo editorial, sem texto renderizado.",
  },
  {
    slug: "mockup-outdoor-billboard-rua",
    categoria: "ambiente",
    titulo: "Mockup de outdoor em branco na rua",
    resultado: "Painel de outdoor liso e vazio em cenário urbano, pronto para aplicar uma peça de campanha.",
    prompt:
      "Fotografia de um painel de outdoor (billboard) grande e liso completamente em branco, montado em um cenário urbano genérico com céu ao fundo e prédios desfocados, visto de baixo em ângulo levemente inclinado, luz de dia clara e uniforme sobre a superfície do painel, moldura do outdoor visível, nenhum outro anúncio ou marca legível ao redor, proporção 16:9, estilo mockup de mídia exterior, sem nenhum texto renderizado pela IA.",
  },
  {
    slug: "produto-mesa-cafeteria-contexto",
    categoria: "ambiente",
    titulo: "Produto na mesa de uma cafeteria",
    resultado: "Produto sobre a mesa de uma cafeteria aconchegante, com ambiente desfocado e luz quente ao fundo.",
    prompt:
      "Fotografia lifestyle do produto sobre uma mesa de madeira de cafeteria, uma xícara e elementos discretos de café desfocados ao lado, ambiente interno aconchegante e desfocado ao fundo com luz quente vinda de uma janela, profundidade de campo rasa com o produto em foco nítido, câmera em ângulo de três quartos próximo ao tampo da mesa, cores quentes e convidativas, proporção 4:5, estilo fotografia lifestyle de rotina.",
  },
  {
    slug: "mockup-site-tela-monitor-desktop",
    categoria: "ambiente",
    titulo: "Mockup de site em monitor de desktop",
    resultado: "Monitor de mesa exibindo uma interface de site genérica em branco, em cena de escritório para compor apresentação.",
    prompt:
      "Fotografia still de um monitor de desktop sobre uma mesa de escritório clara, tela exibindo uma interface de site genérica com blocos, um menu no topo e um banner central (sem texto real, sem logotipo), teclado e um objeto discreto desfocados em primeiro plano, luz natural suave vinda de uma janela lateral, ângulo levemente frontal para a tela, proporção 16:9, estilo mockup realista de produto digital, sem texto renderizado pela IA.",
  },
];

export function getPrompt(slug: string): PromptItem | null {
  return PROMPTS.find((p) => p.slug === slug) || null;
}

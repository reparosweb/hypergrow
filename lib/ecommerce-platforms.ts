/* ─────────────────────────────────────────────────────────────────────────────
   PLATAFORMAS DE E-COMMERCE — módulo de DADOS puro.

   POR QUE ESTE ARQUIVO EXISTE
   O pedido do dono foi explícito: a página de Loja Virtual precisa mostrar as
   plataformas reais do mercado (Tray, Nuvemshop, VTEX...), os ERPs e os hubs de
   marketplace — porque é isso que o cliente pesquisa antes de contratar, e é
   isso que faz o site ser citado por IA (ChatGPT, Perplexity, AI Overviews).
   Ele vive separado do componente por três motivos:
     1. dado é dado — o mesmo array alimenta o grid de wordmarks E a tabela;
     2. é leve e sem import nenhum, então é seguro para o bundle do cliente
        (mesma disciplina de `lib/pillars.ts`, que nasceu de auditoria de perf);
     3. quando uma plataforma mudar de dono ou de nome, mexe-se AQUI, num lugar
        só, sem tocar em layout.

   REGRA DE CONTEÚDO — SÓ FATO VERIFICADO
   Nenhuma linha deste arquivo pode conter fato inventado. `note` e `bestFor`
   descrevem o que a plataforma É e para quem serve — não prometem preço, número
   de clientes, ranking nem "melhor do mercado". Se um fato não foi conferido na
   fonte oficial ou em imprensa, ele simplesmente NÃO entra: é preferível uma
   frase mais genérica e verdadeira a uma frase específica e errada.

   Conferido em 2026-07-30 (fontes oficiais + imprensa):
     · Tray, Bagy, Bling, Dooca, Ideris e Fbits (hoje Wake Commerce) constam na
       lista pública de aquisições da Locaweb Company / LWSA; o rodapé do site da
       Ideris se identifica como "uma empresa LWSA".
     · Loja Integrada foi adquirida pela VTEX em 2013 e opera como a frente de
       pequenos lojistas do grupo.
     · Nuvemshop nasceu na Argentina em 2011 (Tiendanube nos países de língua
       espanhola); o Brasil se tornou seu principal mercado.
     · Tiny ERP foi comprado pela Olist em 2021 e hoje é a marca Olist Tiny.
     · Cartpanda é uma startup brasileira com checkout e gateway próprios e
       venda declarada em mais de 150 países.
     · Linx (software de varejo, fundada em 1985) foi adquirida pela Stone.
   Ownership NÃO confirmado — por isso não afirmado aqui: Plugg.To e Anymarket
   aparecem apenas pela função que exercem.
   ──────────────────────────────────────────────────────────────────────────── */

export type PlatformCategory = "loja" | "erp" | "hub" | "marketplace";

/** Origem declarada. "LatAm" existe porque forçar Nuvemshop e Mercado Livre em
 *  "BR" ou "Global" seria impreciso — as duas nasceram na Argentina e têm o
 *  Brasil como mercado central. */
export type PlatformOrigin = "BR" | "LatAm" | "Global";

export type Platform = {
  /** Nome oficial exato, do jeito que a marca se escreve. */
  name: string;
  category: PlatformCategory;
  /** O diferencial REAL, 6-12 palavras. Aparece no tile do grid. */
  note: string;
  /** Para quem serve melhor. Aparece na coluna "Melhor para" da tabela. */
  bestFor: string;
  origin: PlatformOrigin;
};

export const PLATFORMS: Platform[] = [
  /* ── Plataformas de loja virtual ────────────────────────────────────────── */
  {
    name: "Shopify",
    category: "loja",
    origin: "Global",
    note: "SaaS global com ecossistema enorme de apps e temas",
    bestFor: "Escalar rápido com apps prontos e time enxuto",
  },
  {
    name: "Nuvemshop",
    category: "loja",
    origin: "LatAm",
    note: "Nasceu na Argentina como Tiendanube; Brasil virou o maior mercado",
    bestFor: "PME que quer loja no ar sem depender de código",
  },
  {
    name: "Tray",
    category: "loja",
    origin: "BR",
    note: "Plataforma brasileira do grupo Locaweb, forte em marketplaces",
    bestFor: "Quem vende no site e em marketplaces ao mesmo tempo",
  },
  {
    name: "VTEX",
    category: "loja",
    origin: "BR",
    note: "Multinacional brasileira, arquitetura headless e multiloja",
    bestFor: "Varejo grande, operação omnichannel e várias marcas",
  },
  {
    name: "WooCommerce",
    category: "loja",
    origin: "Global",
    note: "Plugin open source do WordPress: você é dono do código",
    bestFor: "Quem já tem WordPress e quer controle total do site",
  },
  {
    name: "Adobe Commerce (Magento)",
    category: "loja",
    origin: "Global",
    note: "Linha enterprise da Adobe; o Magento Open Source segue livre",
    bestFor: "Catálogo complexo, B2B e regras de preço avançadas",
  },
  {
    name: "Wix",
    category: "loja",
    origin: "Global",
    note: "Construtor visual de site com loja embutida",
    bestFor: "Site institucional com uma loja pequena acoplada",
  },
  {
    name: "PrestaShop",
    category: "loja",
    origin: "Global",
    note: "Open source de origem francesa, com biblioteca grande de módulos",
    bestFor: "Loja auto-hospedada, sem custo de licença de plataforma",
  },
  {
    name: "BigCommerce",
    category: "loja",
    origin: "Global",
    note: "SaaS americano com API aberta e uso headless nativo",
    bestFor: "Marca que quer SaaS sem abrir mão da API",
  },
  {
    name: "Loja Integrada",
    category: "loja",
    origin: "BR",
    note: "Frente de pequenos lojistas da VTEX, porta de entrada acessível",
    bestFor: "Primeira loja, orçamento curto, sem equipe técnica",
  },
  {
    name: "Yampi",
    category: "loja",
    origin: "BR",
    note: "Plataforma brasileira cujo checkout também roda sobre outras",
    bestFor: "Quem quer checkout otimizado, mesmo já tendo plataforma",
  },
  {
    name: "Bagy",
    category: "loja",
    origin: "BR",
    note: "Plataforma do grupo Locaweb, montagem rápida e enxuta",
    bestFor: "Quem sai do Instagram para uma loja própria",
  },
  {
    name: "Dooca Commerce",
    category: "loja",
    origin: "BR",
    note: "Plataforma brasileira do grupo Locaweb, painel direto ao ponto",
    bestFor: "PME que toca o dia a dia da loja sozinha",
  },
  {
    name: "Cartpanda",
    category: "loja",
    origin: "BR",
    note: "Startup brasileira com checkout e gateway próprios, venda global",
    bestFor: "Produto físico ou digital com operação fora do Brasil",
  },
  {
    name: "Wake Commerce",
    category: "loja",
    origin: "BR",
    note: "Linha enterprise do grupo Locaweb, herdeira da Fbits",
    bestFor: "Varejo de médio e grande porte com loja física junto",
  },
  {
    name: "Irroba",
    category: "loja",
    origin: "BR",
    note: "Plataforma brasileira com integração nativa a marketplaces",
    bestFor: "Lojista de marketplace que quer também o site próprio",
  },
  {
    name: "Linx Commerce",
    category: "loja",
    origin: "BR",
    note: "Plataforma omnichannel da Linx, hoje no grupo Stone",
    bestFor: "Rede com loja física e retaguarda Linx já rodando",
  },

  /* ── ERPs e sistemas de gestão ──────────────────────────────────────────── */
  {
    name: "Bling",
    category: "erp",
    origin: "BR",
    note: "ERP do grupo Locaweb, junta pedido, estoque e nota fiscal",
    bestFor: "PME que precisa de estoque, pedido e NF-e no mesmo lugar",
  },
  {
    name: "Olist Tiny",
    category: "erp",
    origin: "BR",
    note: "O antigo Tiny ERP, hoje dentro do ecossistema Olist",
    bestFor: "Seller de marketplace que quer ERP simples de operar",
  },
  {
    name: "Omie",
    category: "erp",
    origin: "BR",
    note: "ERP em nuvem cobrindo financeiro, estoque e fiscal",
    bestFor: "Empresa que quer trocar planilha por gestão integrada",
  },
  {
    name: "Conta Azul",
    category: "erp",
    origin: "BR",
    note: "Gestão financeira e de notas, com laço forte com o contador",
    bestFor: "Negócio pequeno que quer financeiro e contabilidade alinhados",
  },
  {
    name: "Sankhya",
    category: "erp",
    origin: "BR",
    note: "ERP brasileiro parametrizável, de médio e grande porte",
    bestFor: "Indústria e distribuição com processo próprio pesado",
  },
  {
    name: "TOTVS",
    category: "erp",
    origin: "BR",
    note: "ERP corporativo brasileiro, com linhas por segmento de mercado",
    bestFor: "Operação grande que já roda no ERP da casa",
  },

  /* ── Hubs de integração com marketplaces ────────────────────────────────── */
  {
    name: "Anymarket",
    category: "hub",
    origin: "BR",
    note: "Hub voltado a operações de alto volume e vários centros de distribuição",
    bestFor: "Quem vende muito e opera mais de um CD",
  },
  {
    name: "Hub2b",
    category: "hub",
    origin: "BR",
    note: "Hub que traz a integração com ERP dentro da própria plataforma",
    bestFor: "Média e grande operação centralizando canais e ERP",
  },
  {
    name: "Plugg.To",
    category: "hub",
    origin: "BR",
    note: "Hub conectado a dezenas de marketplaces em um painel só",
    bestFor: "Abrir novos canais sem cadastrar produto de novo",
  },
  {
    name: "Ideris",
    category: "hub",
    origin: "BR",
    note: "Integrador multicanal do grupo Locaweb (LWSA)",
    bestFor: "Seller pequeno e médio gerenciando anúncios num lugar",
  },

  /* ── Marketplaces ───────────────────────────────────────────────────────── */
  {
    name: "Mercado Livre",
    category: "marketplace",
    origin: "LatAm",
    note: "Audiência enorme na América Latina e logística própria",
    bestFor: "Girar volume e testar demanda de um produto rápido",
  },
  {
    name: "Amazon",
    category: "marketplace",
    origin: "Global",
    note: "Alcance global e logística terceirizada pelo próprio canal",
    bestFor: "Marca que quer alcance internacional sem montar logística",
  },
  {
    name: "Shopee",
    category: "marketplace",
    origin: "Global",
    note: "Tráfego mobile intenso, cupom e ticket de entrada",
    bestFor: "Produto de entrada, preço agressivo e giro alto",
  },
  {
    name: "Magalu",
    category: "marketplace",
    origin: "BR",
    note: "Marketplace do Magazine Luiza, com rede de lojas físicas atrás",
    bestFor: "Bens duráveis e categorias clássicas de varejo",
  },
  {
    name: "Americanas",
    category: "marketplace",
    origin: "BR",
    note: "Marketplace de varejo generalista, catálogo amplo",
    bestFor: "Ampliar canal em categorias tradicionais de varejo",
  },
];

/** Ordem de apresentação e texto de cada bloco. A ordem daqui manda no grid e
 *  na tabela — mexeu aqui, mexeu na página. */
export const PLATFORM_GROUPS: {
  key: PlatformCategory;
  label: string;
  /** Uma frase que explica o PAPEL da categoria na operação, não o que é óbvio. */
  blurb: string;
  /** Rótulo curto para a coluna "Categoria" da tabela. */
  short: string;
}[] = [
  {
    key: "loja",
    label: "Plataformas de loja virtual",
    short: "Loja virtual",
    blurb:
      "Onde a loja mora: vitrine, carrinho, checkout e pagamento. É a escolha que define custo mensal, limite de crescimento e o que dá para personalizar depois.",
  },
  {
    key: "erp",
    label: "ERPs e sistemas de gestão",
    short: "ERP",
    blurb:
      "Onde o negócio é controlado: estoque, pedido, financeiro e nota fiscal. Sem ERP ligado à loja, cada venda vira digitação manual — e erro de estoque.",
  },
  {
    key: "hub",
    label: "Hubs de integração",
    short: "Hub",
    blurb:
      "A ponte entre a sua loja e os marketplaces. Cadastra o produto uma vez, publica em vários canais e recebe todos os pedidos num painel só.",
  },
  {
    key: "marketplace",
    label: "Marketplaces",
    short: "Marketplace",
    blurb:
      "Vitrines de terceiros com audiência pronta. São canal de venda, nunca substituto do site próprio — no marketplace o cliente é da plataforma, não seu.",
  },
];

/** Plataformas de uma categoria, na ordem em que foram declaradas. */
export function platformsOf(category: PlatformCategory): Platform[] {
  return PLATFORMS.filter((p) => p.category === category);
}

/** Quantas plataformas existem por categoria — usado nos contadores da seção. */
export function countOf(category: PlatformCategory): number {
  return platformsOf(category).length;
}

/** Rótulo curto por categoria (coluna "Categoria" da tabela). */
export const CATEGORY_SHORT: Record<PlatformCategory, string> = {
  loja: "Loja virtual",
  erp: "ERP",
  hub: "Hub",
  marketplace: "Marketplace",
};

/** Cor de sinal por categoria. Só jade / cobre / champanhe / sage — a paleta da
 *  marca. Azul e violeta são proibidos no projeto inteiro. */
export const CATEGORY_TONE: Record<PlatformCategory, string> = {
  loja: "#2DD4A0",
  erp: "#D3B78E",
  hub: "#6FBF9A",
  marketplace: "#D99461",
};

/** Legenda das origens, para o rodapé da tabela. */
export const ORIGIN_LABEL: Record<PlatformOrigin, string> = {
  BR: "Brasil",
  LatAm: "América Latina",
  Global: "Global",
};

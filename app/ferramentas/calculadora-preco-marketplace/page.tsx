import "../../claro-tokens.css";
import type { Metadata } from "next";
import PageShellClaro from "@/components/site/PageShellClaro";
import EstilosFerramentas from "@/components/ferramentas/EstilosFerramentas";
import { ConviteFerramenta, OutrasFerramentas, SeloGratis } from "@/components/ferramentas/PecasFerramenta";
import CalculadoraMarketplace from "@/components/ferramentas/CalculadoraMarketplace";
import { getFerramenta } from "@/lib/ferramentas";
import { SITE_URL, ogImagens } from "@/lib/seo";

/* PÁGINA ESTÁTICA por construção (ver comentário em /ferramentas/page.tsx). */

const F = getFerramenta("calculadora-preco-marketplace")!;
const URL_PAGINA = `${SITE_URL}/ferramentas/${F.slug}`;

export const metadata: Metadata = {
  title: F.titulo,
  description: F.descricao,
  alternates: { canonical: URL_PAGINA },
  openGraph: { title: F.titulo, description: F.descricao, url: URL_PAGINA, type: "website", images: ogImagens("ferramentas") },
  twitter: { card: "summary_large_image", title: F.titulo, description: F.descricao },
};

const FAQ: [string, string][] = [
  [
    "Por que não posso simplesmente somar 20% ao custo?",
    "Porque comissão, imposto e margem incidem sobre o preço de venda, não sobre o custo. Um produto de R$ 50 vendido a R$ 60 (custo mais 20%) num canal que cobra 12% de comissão e 4% de imposto deixa R$ 0,40 — não R$ 10. A conta certa divide o custo pelo que sobra do preço depois de todos os percentuais.",
  ],
  [
    "Os percentuais de comissão da ferramenta são oficiais?",
    "Não. São valores de referência para dar um ponto de partida, e estão marcados como tal. Comissão de marketplace muda por categoria, por tipo de anúncio, por programa de frete e por acordo comercial. Confira a sua no painel do canal e edite o campo — todos são editáveis.",
  ],
  [
    "Qual imposto devo colocar?",
    "O percentual que incide sobre a sua venda. No Simples Nacional, o comércio começa em 4% na primeira faixa e sobe conforme o faturamento dos últimos 12 meses. Se você tem outro regime ou vende com substituição tributária, o número é outro — confirme com o seu contador.",
  ],
  [
    "Devo colocar o frete se o cliente é quem paga?",
    "Só coloque o que sai do seu bolso. Se o comprador paga o frete inteiro, deixe zero. Se você banca uma parte (frete grátis acima de um valor, por exemplo), coloque a média do que você subsidia por pedido — é esse valor que reduz a sua margem.",
  ],
  [
    "Margem sobre a venda ou sobre o custo: qual eu uso?",
    "Marketplace, contador e relatório financeiro falam de margem sobre a venda: de cada R$ 100 vendidos, quanto sobra. Markup sobre o custo é a conta de quem compra e revende no varejo físico. A ferramenta faz as duas e sempre mostra o resultado nas duas medidas, para você não confundir uma com a outra.",
  ],
  [
    "O preço mínimo já é o preço que eu devo praticar?",
    "É o piso, não a meta. Abaixo dele você entrega margem menor que a pedida. Acima dele começa a disputa real: percepção de valor, concorrência na vitrine do canal e posição no anúncio. A ferramenta te dá o chão firme para negociar; o teto quem decide é o seu mercado.",
  ],
];

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["SoftwareApplication", "WebApplication"],
        "@id": `${URL_PAGINA}#app`,
        name: F.nome,
        description: F.descricao,
        url: URL_PAGINA,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web (qualquer navegador)",
        browserRequirements: "Requer JavaScript ativado",
        inLanguage: "pt-BR",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        featureList: [
          "Calcula o preço de venda mínimo com comissão, imposto, frete e tarifa fixa",
          "Mostra o lucro real por venda com a conta aberta",
          "Alterna entre margem sobre a venda e markup sobre o custo",
          "Confere a margem do preço que você já pratica",
          "Percentuais de referência de Mercado Livre, Shopee, Amazon e Magalu",
        ],
        publisher: { "@id": `${SITE_URL}/#organization` },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Ferramentas grátis", item: `${SITE_URL}/ferramentas` },
          { "@type": "ListItem", position: 3, name: F.nome, item: URL_PAGINA },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${URL_PAGINA}#faq`,
        mainEntity: FAQ.map(([q, a]) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  return (
    <PageShellClaro
      crumbs={[{ label: "Início", href: "/" }, { label: "Ferramentas", href: "/ferramentas" }, { label: "Preço para marketplace" }]}
      accent={F.accent}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EstilosFerramentas />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Ferramenta grátis</span>
          <h1 className="pg-h1">Calculadora de preço<br />para marketplace</h1>
          <p className="pg-lede">{F.chamada}</p>
          <div style={{ marginTop: 20 }}>
            <SeloGratis />
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: "clamp(26px, 3.2vw, 40px)", paddingBottom: "clamp(30px, 4vw, 48px)" }}>
        <div className="wrap">
          <CalculadoraMarketplace />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="pg-h2">O erro de R$ 9,60 que quase todo vendedor comete</h2>
          <p className="pg-p">
            Produto que custa R$ 50, vendido a R$ 60 porque &ldquo;20% de margem está bom&rdquo;.
            O canal cobra 12% de comissão (R$ 7,20) e o imposto leva 4% (R$ 2,40). Sobram
            <strong> R$ 0,40</strong> por venda — não os R$ 10 imaginados. Para realmente sobrarem
            20% do preço, o produto precisa sair por <strong>R$ 78,13</strong>, e aí a sobra é de
            R$ 15,63.
          </p>
          <p className="pg-p">
            A diferença não é de conta de padaria: é a diferença entre uma operação que cresce e
            uma que vende muito, fatura bem e não sobra nada no fim do mês. Quanto mais você vende
            no preço errado, mais rápido o caixa aperta — e o volume esconde o problema por meses.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 44 }}>A fórmula que a ferramenta usa</h2>
          <dl className="ft-form" style={{ marginTop: 18 }}>
            <div>
              <dt>Margem sobre o preço de venda (o padrão)</dt>
              <dd>
                <code>preço = (custo + frete + tarifa fixa) ÷ (1 − comissão% − imposto% − margem%)</code>
                <br />
                Todos os percentuais saem do preço, então eles são descontados do 1 — não somados
                ao custo.
              </dd>
            </div>
            <div>
              <dt>Margem sobre o custo (markup)</dt>
              <dd>
                <code>preço = (custo × (1 + margem%) + frete + tarifa fixa) ÷ (1 − comissão% − imposto%)</code>
                <br />
                Aqui a margem vira um valor fixo em reais somado ao custo, e só comissão e imposto
                saem do preço.
              </dd>
            </div>
            <div>
              <dt>Lucro real por venda</dt>
              <dd>
                <code>preço − comissão − imposto − frete − tarifa fixa − custo</code>
                <br />
                Calculado a partir do preço já arredondado para cima no centavo — por isso ele
                pode ficar alguns centavos acima da margem pedida, nunca abaixo.
              </dd>
            </div>
          </dl>

          <h2 className="pg-h2" style={{ marginTop: 44 }}>Perguntas frequentes</h2>
          <div className="ft-form" style={{ marginTop: 18 }}>
            {FAQ.map(([q, a]) => (
              <div key={q}>
                <p className="pg-h3">{q}</p>
                <p className="pg-p" style={{ marginBottom: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ConviteFerramenta
        servico={F.servico}
        titulo="Preço certo é o começo. Operação lucrativa é o trabalho."
        texto="Depois do preço vêm as perguntas que a calculadora não responde: qual canal vale a pena, quais anúncios sobem, como sair da guerra de preço e o que fazer com o produto que só dá giro. A HyperGrow faz esse diagnóstico olhando a sua operação de verdade."
      />

      <OutrasFerramentas atual={F.slug} />
    </PageShellClaro>
  );
}

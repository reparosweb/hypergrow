import "../../claro-tokens.css";
import type { Metadata } from "next";
import PageShellClaro from "@/components/site/PageShellClaro";
import EstilosFerramentas from "@/components/ferramentas/EstilosFerramentas";
import { ConviteFerramenta, OutrasFerramentas, SeloGratis } from "@/components/ferramentas/PecasFerramenta";
import CalculadoraRoas from "@/components/ferramentas/CalculadoraRoas";
import { getFerramenta } from "@/lib/ferramentas";
import { SITE_URL, ogImagens } from "@/lib/seo";

/* PÁGINA ESTÁTICA por construção (ver comentário em /ferramentas/page.tsx). */

const F = getFerramenta("calculadora-roas")!;
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
    "O que é ROAS, em uma frase?",
    "É quantos reais de receita voltam para cada real investido em anúncio. ROAS 4 significa R$ 4 de venda para cada R$ 1 gasto. Sozinho, esse número não diz se você lucrou: quem decide isso é a sua margem.",
  ],
  [
    "Por que ROAS 4 pode dar prejuízo?",
    "Porque o ROAS olha receita, e você não vive de receita — vive do que sobra dela. Com margem de 20%, cada R$ 1 investido a ROAS 4 traz R$ 4 de venda que deixam R$ 0,80 de margem: você gastou R$ 1 para ganhar R$ 0,80. O equilíbrio nessa margem só chega em ROAS 5.",
  ],
  [
    "Qual margem eu devo informar?",
    "A margem de contribuição: o que sobra do ticket depois dos custos que variam com a venda — produto, embalagem, comissão do canal, taxa de pagamento, imposto e frete que você banca. Custo fixo (aluguel, salário, ferramenta) fica de fora, porque não muda se você vender uma unidade a mais.",
  ],
  [
    "Então o CPA máximo é a minha meta de custo por venda?",
    "Não: é o teto, o ponto em que você empata. Se toda venda custar exatamente o CPA máximo, sobra zero para pagar o custo fixo e não existe lucro. Por isso a ferramenta calcula também o alvo com folga, que é a meta prática.",
  ],
  [
    "De onde sai o CPC máximo?",
    "Do CPA máximo dividido pelo número de cliques que você precisa para fazer uma venda. Se são 50 cliques por venda e o teto por venda é R$ 60, cada clique não pode passar de R$ 1,20. É esse número que você compara com o lance da campanha.",
  ],
  [
    "Minha taxa de conversão muda toda semana. Isso invalida a conta?",
    "Não, mas exige revisão. Use a média de um período com volume relevante e refaça a conta quando ela mudar de patamar. A conta é uma régua, não uma profecia: o valor dela é mostrar rápido quando o CPC subiu além do que a margem aguenta.",
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
          "Calcula o CPA máximo a partir do ticket médio e da margem",
          "Calcula o ROAS mínimo de equilíbrio",
          "Calcula o CPC máximo e os cliques necessários por venda",
          "Compara com o CPC que você paga hoje e mostra o lucro por venda",
          "Mostra a fórmula de cada resultado com os seus números",
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
      crumbs={[{ label: "Início", href: "/" }, { label: "Ferramentas", href: "/ferramentas" }, { label: "ROAS e teto de anúncio" }]}
      accent={F.accent}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EstilosFerramentas />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Ferramenta grátis</span>
          <h1 className="pg-h1">Calculadora de ROAS<br />e teto de anúncio</h1>
          <p className="pg-lede">{F.chamada}</p>
          <div style={{ marginTop: 20 }}>
            <SeloGratis />
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: "clamp(26px, 3.2vw, 40px)", paddingBottom: "clamp(30px, 4vw, 48px)" }}>
        <div className="wrap">
          <CalculadoraRoas />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="pg-h2">ROAS alto não é sinal de lucro</h2>
          <p className="pg-p">
            Duas lojas com o mesmo ROAS 4 podem estar em situações opostas. A primeira tem 60% de
            margem: cada R$ 1 investido traz R$ 4 de venda, que deixam R$ 2,40 — lucro de R$ 1,40
            por real investido. A segunda tem 20% de margem: os mesmos R$ 4 de venda deixam
            R$ 0,80 — prejuízo de R$ 0,20 por real investido. Mesmo painel, mesma métrica, destinos
            diferentes.
          </p>
          <p className="pg-p">
            É por isso que a pergunta certa nunca é &ldquo;qual ROAS é bom?&rdquo;, e sim
            <strong> qual ROAS a minha margem exige</strong>. A resposta é uma divisão: 1 dividido
            pela margem. Margem 20% pede ROAS 5. Margem 40% pede 2,5. Margem 60% pede 1,67.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 44 }}>As quatro contas, em texto simples</h2>
          <dl className="ft-form" style={{ marginTop: 18 }}>
            <div>
              <dt>CPA máximo — o teto por venda</dt>
              <dd>
                <code>ticket médio × margem de contribuição%</code>
                <br />
                É todo o dinheiro que a venda deixa. Gastar exatamente isso em anúncio significa
                empatar; gastar mais, perder.
              </dd>
            </div>
            <div>
              <dt>ROAS mínimo de equilíbrio</dt>
              <dd>
                <code>1 ÷ margem de contribuição%</code>
                <br />
                O mesmo resultado de dividir o ticket pelo CPA máximo. Abaixo desse número, a
                campanha consome mais do que a venda produz.
              </dd>
            </div>
            <div>
              <dt>CPC máximo — o teto por clique</dt>
              <dd>
                <code>CPA máximo × taxa de conversão%</code>
                <br />
                Equivale a dividir o teto por venda pelos cliques necessários para fazer uma. É o
                número que conversa com o lance da campanha.
              </dd>
            </div>
            <div>
              <dt>Alvo com folga</dt>
              <dd>
                <code>CPA máximo × (1 − margem de segurança%)</code>
                <br />
                O teto paga o anúncio e nada mais. A folga é o que sobra para custo fixo e lucro —
                é ela que transforma &ldquo;não estou perdendo&rdquo; em &ldquo;estou ganhando&rdquo;.
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
        titulo="Você já sabe o teto. Falta o anúncio caber nele."
        texto="Saber o CPC máximo é metade do trabalho; a outra metade é fazer a campanha entregar dentro dele — criativo, público, página de destino e medição funcionando juntos. É exatamente o que a HyperGrow opera em tráfego pago."
      />

      <OutrasFerramentas atual={F.slug} />
    </PageShellClaro>
  );
}

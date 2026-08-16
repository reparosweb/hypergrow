import "../../claro-tokens.css";
import type { Metadata } from "next";
import PageShellClaro from "@/components/site/PageShellClaro";
import EstilosFerramentas from "@/components/ferramentas/EstilosFerramentas";
import { ConviteFerramenta, OutrasFerramentas, SeloGratis } from "@/components/ferramentas/PecasFerramenta";
import CalculadoraPrecoHora from "@/components/ferramentas/CalculadoraPrecoHora";
import { getFerramenta } from "@/lib/ferramentas";
import { SITE_URL, ogImagens } from "@/lib/seo";

/* PÁGINA ESTÁTICA por construção (ver comentário em /ferramentas/page.tsx). */

const F = getFerramenta("calculadora-preco-hora")!;
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
    "Por que a calculadora separa “renda desejada” de “despesas fixas”?",
    "Porque são duas contas diferentes que muita gente mistura numa só. Renda desejada é o seu pró-labore — o que você quer que sobre para viver. Despesas fixas são o custo do negócio existir: ferramenta, internet, contador, sala. Juntas, elas formam o total que precisa ser faturado; separadas, ficam mais fáceis de revisar quando alguma delas muda.",
  ],
  [
    "Que percentual de tempo não-faturável eu devo usar?",
    "Não existe um número universal — a faixa comum fica entre 20% e 40% do tempo disponível, mas depende de quanto você gasta com prospecção, reunião, orçamento e tarefa administrativa. Quem começa costuma subestimar essa fatia; vale medir a própria semana por um mês antes de fechar o número.",
  ],
  [
    "Por que o preço de segurança é +15% e não outro número?",
    "Porque 15% é uma folga sugerida para absorver imprevisto — mês fraco, cliente que atrasa o pagamento, imposto que sobe — não uma média de mercado nem uma regra oficial. A calculadora deixa isso explícito de propósito: use o número como ponto de partida, não como verdade fechada.",
  ],
  [
    "Qual percentual de imposto eu devo informar?",
    "O que incide sobre o seu faturamento no seu regime tributário. No Simples Nacional, serviço costuma começar entre 6% e 15,5% dependendo do anexo e do faturamento acumulado nos últimos 12 meses. Se você é MEI ou tem outro regime, o número muda — confirme com o seu contador antes de fechar o preço.",
  ],
  [
    "O preço do projeto muda se eu alterar as horas por semana ou as férias?",
    "Muda, sim, porque o preço por hora nasce de todo o cálculo — horas faturáveis, faturamento necessário e imposto entram todos na mesma fórmula. Qualquer campo que você editar recalcula o preço por hora na hora, e o preço do projeto (horas do projeto vezes preço por hora) segue junto automaticamente.",
  ],
  [
    "Esse é o preço que eu devo cobrar do cliente?",
    "É o piso: o mínimo para as contas fecharem, não o teto do que o mercado paga. Cliente que reconhece o valor do seu trabalho paga acima disso; cliente que só compara preço tenta empurrar para baixo. A calculadora garante que você nunca feche um contrato que cobre menos do que a operação custa — quanto cobrar acima do piso é decisão de posicionamento, não de matemática.",
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
          "Calcula o preço por hora faturável a partir de renda, despesas, horas e imposto",
          "Mostra a conta aberta: horas faturáveis reais, faturamento bruto necessário e preço final",
          "Sugere um preço de segurança com folga para imprevisto",
          "Calcula também o preço de um projeto a partir das horas estimadas",
          "100% no navegador, sem cadastro e sem envio de dado a servidor",
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
      crumbs={[{ label: "Início", href: "/" }, { label: "Ferramentas", href: "/ferramentas" }, { label: "Preço por hora" }]}
      accent={F.accent}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EstilosFerramentas />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Ferramenta grátis</span>
          <h1 className="pg-h1">Calculadora de<br />preço por hora</h1>
          <p className="pg-lede">{F.chamada}</p>
          <div style={{ marginTop: 20 }}>
            <SeloGratis />
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: "clamp(26px, 3.2vw, 40px)", paddingBottom: "clamp(30px, 4vw, 48px)" }}>
        <div className="wrap">
          <CalculadoraPrecoHora />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="pg-h2">“Chuto um valor e vejo se o cliente topa” não é preço, é sorte</h2>
          <p className="pg-p">
            Quem presta serviço sozinho ou numa equipe pequena costuma chegar no preço por hora do
            jeito mais frágil possível: olhando o que o concorrente cobra, ou lembrando de um valor
            que já funcionou uma vez. Nenhum dos dois caminhos passa pela pergunta que realmente
            importa — quanto o seu negócio, com as suas horas, as suas despesas e o seu imposto,
            precisa faturar por hora vendida para as contas fecharem no fim do mês.
          </p>
          <p className="pg-p">
            A armadilha mais comum é contar hora trabalhada como se fosse toda ela vendável. Não é:
            reunião, orçamento, prospecção e tarefa administrativa consomem tempo real e não geram
            cobrança direta. Um preço calculado sobre 40 horas semanais de venda, quando só 24 são
            de fato faturáveis, está errado antes mesmo do primeiro cliente fechar contrato.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 44 }}>Como usar em três passos</h2>
          <ol className="pg-list" style={{ marginTop: 18 }}>
            {[
              "Informe a renda mensal que você quer que sobre e as despesas fixas do negócio.",
              "Ajuste horas por semana, férias e o percentual de tempo não-faturável — isso define quantas horas de fato podem ser vendidas por ano.",
              "Confira o preço por hora de equilíbrio e o preço com folga de segurança. Se tiver um projeto em mãos, informe as horas estimadas para ver o valor total.",
            ].map((t, i) => (
              <li key={t} style={{ alignItems: "flex-start" }}>
                <span aria-hidden className="pg-num">{String(i + 1).padStart(2, "0")}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>

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
        titulo="O preço certo é o piso. O que enche a agenda é outra etapa."
        texto="Saber o preço mínimo evita vender no prejuízo — mas não traz cliente sozinho. Depois do preço vêm o posicionamento, a proposta que fecha e o processo comercial que faz a agenda ficar cheia no preço certo, não no preço de desespero. A HyperGrow faz esse diagnóstico comercial olhando a sua operação de verdade."
      />

      <OutrasFerramentas atual={F.slug} />
    </PageShellClaro>
  );
}

import "../../claro-tokens.css";
import type { Metadata } from "next";
import PageShellClaro from "@/components/site/PageShellClaro";
import EstilosFerramentas from "@/components/ferramentas/EstilosFerramentas";
import { ConviteFerramenta, OutrasFerramentas, SeloGratis } from "@/components/ferramentas/PecasFerramenta";
import SimuladorGoogle from "@/components/ferramentas/SimuladorGoogle";
import { getFerramenta } from "@/lib/ferramentas";
import { SITE_URL, ogImagens } from "@/lib/seo";

/* PÁGINA ESTÁTICA por construção (ver comentário em /ferramentas/page.tsx). */

const F = getFerramenta("simulador-google")!;
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
    "Qual o tamanho ideal do título?",
    "Em caracteres, algo entre 50 e 60 costuma caber. Mas o corte real é por largura em pixels: o Google exibe por volta de 580 a 600 px no computador. Um título só de maiúsculas estoura antes dos 60 caracteres; um cheio de letras finas passa de 65 sem cortar. Por isso a ferramenta mostra os dois números.",
  ],
  [
    "E a descrição?",
    "Entre 120 e 158 caracteres é a faixa que costuma aparecer inteira. No celular o espaço muda e a descrição pode ganhar uma linha a mais. Escreva o argumento principal no começo: o que estiver no fim é o que some primeiro.",
  ],
  [
    "A descrição melhora minha posição no Google?",
    "Não diretamente — ela não é fator de classificação. O que ela faz é decidir se a pessoa clica em você ou no resultado de cima. Um título bem posicionado com descrição fraca perde cliques para quem está abaixo e escreveu melhor.",
  ],
  [
    "Escrevi o título e o Google mostrou outro. Por quê?",
    "O Google reescreve título e descrição quando julga que outro texto responde melhor à busca da pessoa — é comportamento conhecido dele e acontece com qualquer site. Um título claro, específico e coerente com o conteúdo da página aumenta muito a chance de ser mantido, mas nenhuma ferramenta pode garantir o resultado exato.",
  ],
  [
    "A prévia é igual ao Google de verdade?",
    "É uma aproximação fiel do espaço, não uma cópia oficial. Ela usa a mesma família de fonte, os mesmos tamanhos aproximados e o mesmo número de linhas antes do corte. O Google muda o layout da página de resultados com frequência e mostra formatos diferentes conforme o tipo de busca e o aparelho.",
  ],
  [
    "Preciso escrever um título diferente para cada página?",
    "Sim. Título repetido em várias páginas faz o Google escolher sozinho qual mostrar e dilui as duas. Cada página deveria responder a uma intenção de busca e dizer isso no título — começando pelo termo mais importante, que é a parte que sobrevive ao corte.",
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
          "Prévia do resultado de busca no computador e no celular",
          "Contagem de caracteres do título e da descrição",
          "Medida real da largura do título em pixels",
          "Aviso de corte antes de publicar",
          "Mostra o caminho da URL como o Google exibe",
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
      crumbs={[{ label: "Início", href: "/" }, { label: "Ferramentas", href: "/ferramentas" }, { label: "Simulador do Google" }]}
      accent={F.accent}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EstilosFerramentas />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Ferramenta grátis</span>
          <h1 className="pg-h1">Simulador de resultado<br />no Google</h1>
          <p className="pg-lede">{F.chamada}</p>
          <div style={{ marginTop: 20 }}>
            <SeloGratis />
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: "clamp(26px, 3.2vw, 40px)", paddingBottom: "clamp(30px, 4vw, 48px)" }}>
        <div className="wrap">
          <SimuladorGoogle />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="pg-h2">Seu título é o anúncio que você não paga</h2>
          <p className="pg-p">
            Estar na primeira página não serve de nada se ninguém clicar. Entre dez resultados
            parecidos, a pessoa lê os títulos em poucos segundos e escolhe o que parece responder
            à pergunta dela. Esse é o único momento em que você compete com os concorrentes lado a
            lado, com o mesmo espaço e sem investimento em mídia.
          </p>
          <p className="pg-p">
            É também o lugar onde erros passam despercebidos por meses: título cortado no meio de
            uma palavra, nome da empresa ocupando o começo do espaço nobre, descrição que termina
            em reticências antes de dizer o preço ou o diferencial. Nada disso aparece quando você
            olha a sua própria página — só aparece na busca.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 44 }}>Três regras que valem mais que qualquer contador</h2>
          <ol className="pg-list" style={{ marginTop: 18 }}>
            {[
              "O termo mais importante vem primeiro. O fim do título é a parte que some — nome da marca fica para o fim, não para o começo.",
              "Prometa uma coisa específica. “Camiseta de algodão pima masculina” ganha de “Camisetas | Loja” em qualquer busca de quem já sabe o que quer.",
              "Descrição é convite, não resumo. Diga o que a pessoa ganha ao clicar: frete, prazo, garantia, preço, condição. Repetir o título desperdiça as duas linhas.",
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
        titulo="Ajustar o título é o passo mais barato. E o menor."
        texto="Aparecer bem no resultado só importa se você aparecer. Antes do texto vêm a estrutura do site, a velocidade, o conteúdo que responde a busca e os links que sustentam a autoridade. A HyperGrow trabalha essa base inteira — e mede o resultado em tráfego, não em promessa."
      />

      <OutrasFerramentas atual={F.slug} />
    </PageShellClaro>
  );
}

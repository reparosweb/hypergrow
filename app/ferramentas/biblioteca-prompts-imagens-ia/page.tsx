import "../../claro-tokens.css";
import type { Metadata } from "next";
import PageShellClaro from "@/components/site/PageShellClaro";
import EstilosFerramentas from "@/components/ferramentas/EstilosFerramentas";
import { ConviteFerramenta, OutrasFerramentas, SeloGratis } from "@/components/ferramentas/PecasFerramenta";
import BibliotecaPrompts from "@/components/ferramentas/BibliotecaPrompts";
import { getFerramenta } from "@/lib/ferramentas";
import { SITE_URL, ogImagens } from "@/lib/seo";

/* PÁGINA ESTÁTICA: sem route.ts, sem `export const dynamic`, sem cookies(),
   headers() ou searchParams, sem server action. O estado (busca, filtro,
   copiar) vive no componente "use client" — a página que o importa continua
   saindo pronta do build. */

const F = getFerramenta("biblioteca-prompts-imagens-ia")!;
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
    "Preciso pagar para usar esses prompts?",
    "Não. A biblioteca é grátis, sem cadastro, sem e-mail e sem limite de uso — os mesmos prompts ficam disponíveis para copiar quantas vezes você precisar.",
  ],
  [
    "Funciona em qual gerador de imagem?",
    "Os prompts foram escritos para geradores de imagem por texto em geral — ChatGPT/GPT Image, Gemini e ferramentas parecidas. Como cada modelo interpreta o texto à sua maneira, o mesmo prompt pode sair um pouco diferente de um gerador para outro; isso é normal, não é defeito do prompt.",
  ],
  [
    "Posso usar as imagens geradas comercialmente?",
    "Depende dos termos de uso da ferramenta de IA que você escolher para gerar a imagem — cada uma tem sua própria regra sobre uso comercial, direitos e limites. Isso não é algo que a HyperGrow define ou controla: confira a política da ferramenta antes de usar a imagem em algo pago.",
  ],
  [
    "Como eu uso um prompt daqui?",
    "Encontre o prompt pela busca ou pelas categorias, toque em \"Copiar prompt\" e cole no gerador de imagem que você já usa. Gere, veja o resultado e ajuste o texto se precisar de algo diferente.",
  ],
  [
    "Dá para editar o prompt antes de usar?",
    "Sim, e vale a pena. Cada prompt é um ponto de partida testado — troque o produto, a cor, o cenário ou o texto do anúncio pelo que é seu antes de gerar, para o resultado sair no seu contexto, não genérico.",
  ],
  [
    "Por que a mesma busca não encontra nada às vezes?",
    "A busca olha o título, o resultado prometido e o texto do prompt ao mesmo tempo, mas só dentro da categoria selecionada. Se você tiver uma categoria específica marcada, toque em \"Todos\" para buscar na biblioteca inteira.",
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
        applicationCategory: "DesignApplication",
        operatingSystem: "Web (qualquer navegador)",
        browserRequirements: "Requer JavaScript ativado",
        inLanguage: "pt-BR",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        featureList: [
          "Prompts prontos para gerar imagens com IA, organizados por categoria",
          "Busca por palavra dentro do título, do resultado e do texto do prompt",
          "Filtro por categoria com contagem de itens",
          "Botão de copiar o prompt em um toque",
          "Funciona 100% no navegador, sem enviar dados e sem cadastro",
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
      crumbs={[{ label: "Início", href: "/" }, { label: "Ferramentas", href: "/ferramentas" }, { label: "Biblioteca de prompts" }]}
      accent={F.accent}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EstilosFerramentas />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Ferramenta grátis</span>
          <h1 className="pg-h1">Biblioteca de prompts prontos<br />para imagens com IA</h1>
          <p className="pg-lede">{F.chamada}</p>
          <div style={{ marginTop: 20 }}>
            <SeloGratis />
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: "clamp(26px, 3.2vw, 40px)", paddingBottom: "clamp(30px, 4vw, 48px)" }}>
        <div className="wrap">
          <BibliotecaPrompts />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="pg-h2">Por que um prompt bem escrito muda o resultado</h2>
          <p className="pg-p">
            Pedir &ldquo;uma foto do meu produto&rdquo; para um gerador de imagem devolve algo
            genérico, porque o modelo precisa adivinhar tudo: enquadramento, luz, fundo, ângulo,
            estilo. Um prompt estruturado — que descreve composição, iluminação, fundo e o efeito
            que você quer — tira essas decisões do acaso e deixa o resultado muito mais previsível
            e parecido com o que você tinha em mente.
          </p>
          <p className="pg-p">
            É também o que separa quem gera uma imagem só e desiste de quem consegue repetir o
            mesmo padrão em várias peças. Uma biblioteca organizada por categoria poupa o tempo de
            tentativa e erro: em vez de escrever do zero toda vez, você parte de um texto já testado
            e ajusta só o que muda no seu caso.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 44 }}>Como usar em três passos</h2>
          <ol className="pg-list" style={{ marginTop: 18 }}>
            {[
              "Toque numa categoria ou busque pela palavra que descreve o que você precisa — produto, post, anúncio, marca, apresentação, ambiente.",
              "Leia o resultado prometido pelo prompt e toque em \"Copiar prompt\".",
              "Cole no gerador de imagem que você já usa (ChatGPT, Gemini ou outro) e ajuste os detalhes — cor, produto, cenário — antes de gerar.",
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
        titulo="O prompt resolve a ideia. Escalar criativo é outra conversa."
        texto="Gerar uma imagem pontual com IA resolve um post ou um teste. O que trava depois é o volume: dezenas de peças por mês, identidade visual consistente entre elas e alguém revisando cada resultado antes de publicar. A HyperGrow monta esse fluxo — do prompt ao conteúdo pronto, dentro da identidade da sua marca."
      />

      <OutrasFerramentas atual={F.slug} />
    </PageShellClaro>
  );
}

import "../../claro-tokens.css";
import type { Metadata } from "next";
import PageShellClaro from "@/components/site/PageShellClaro";
import EstilosFerramentas from "@/components/ferramentas/EstilosFerramentas";
import { ConviteFerramenta, OutrasFerramentas, SeloGratis } from "@/components/ferramentas/PecasFerramenta";
import GeradorPoliticaPrivacidade from "@/components/ferramentas/GeradorPoliticaPrivacidade";
import { getFerramenta } from "@/lib/ferramentas";
import { SITE_URL, ogImagens } from "@/lib/seo";

/* PÁGINA ESTÁTICA por construção (ver comentário em /ferramentas/page.tsx). */

const F = getFerramenta("gerador-politica-privacidade")!;
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
    "Esse texto pode ser colado direto no meu site, sem mais nada?",
    "Ele foi escrito para funcionar como um modelo completo, na estrutura que qualquer política séria segue. Mesmo assim, a ferramenta e a própria página não escondem o principal: é um modelo de referência, não uma peça jurídica revisada. Se o seu negócio lida com dado sensível, público infantil ou opera fora do Brasil, vale a revisão de um advogado antes de publicar.",
  ],
  [
    "Preciso de política de privacidade mesmo sendo um MEI ou um site pequeno?",
    "Sim. A LGPD (Lei nº 13.709/2018) não tem exceção por porte de empresa: ela se aplica sempre que houver tratamento de dado pessoal, mesmo que seja só o e-mail de quem preenche um formulário de contato. O tamanho do negócio muda o risco de fiscalização, não a obrigação legal.",
  ],
  [
    "O texto muda se eu não usar Google Analytics nem Meta Pixel?",
    "Muda, sim. A seção sobre cookies e ferramentas de terceiros só aparece no texto gerado se você marcar Google Analytics, Meta Pixel, ou a opção “dados de navegação e cookies”. Se nenhuma das três estiver marcada, essa seção inteira é omitida — o texto não menciona uma ferramenta que você não usa.",
  ],
  [
    "Que artigos da LGPD o texto cita?",
    "Principalmente o art. 7º (as bases legais que autorizam o tratamento de dado, como consentimento e execução de contrato) e o art. 18 (os direitos do titular: acesso, correção, exclusão, portabilidade e mais). Também cita o art. 15 da Lei nº 12.965/2014 (Marco Civil da Internet), que obriga a manutenção de registros de acesso.",
  ],
  [
    "Os dados que eu digito aqui — nome da empresa, e-mail — ficam salvos em algum lugar?",
    "Não. O texto é montado no seu próprio navegador a partir do que você digita; nada é enviado para nenhum servidor. Se você fechar a aba sem copiar ou baixar, tudo se perde — não existe rascunho salvo automaticamente.",
  ],
  [
    "Isso substitui os Termos de Uso do meu site?",
    "Não. Política de privacidade e Termos de Uso são documentos diferentes: a política explica como você trata dado pessoal (o foco da LGPD); os termos regulam o uso do site ou serviço em si (regras de conduta, propriedade intelectual, limitação de responsabilidade). Esta ferramenta gera só a política de privacidade.",
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
          "Gera política de privacidade alinhada à LGPD (Lei nº 13.709/2018)",
          "Seções condicionais: cookies e terceiros só aparecem se você usa essas ferramentas",
          "Cita bases legais (art. 7º) e direitos do titular (art. 18) automaticamente",
          "Copia o texto ou baixa em .txt e .html",
          "100% no navegador — nenhum dado digitado é enviado a servidor",
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
      crumbs={[{ label: "Início", href: "/" }, { label: "Ferramentas", href: "/ferramentas" }, { label: "Política de privacidade" }]}
      accent={F.accent}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EstilosFerramentas />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Ferramenta grátis</span>
          <h1 className="pg-h1">Gerador de política<br />de privacidade</h1>
          <p className="pg-lede">{F.chamada}</p>
          <div style={{ marginTop: 20 }}>
            <SeloGratis />
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: "clamp(26px, 3.2vw, 40px)", paddingBottom: "clamp(30px, 4vw, 48px)" }}>
        <div className="wrap">
          <GeradorPoliticaPrivacidade />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="pg-h2">“Depois eu cuido disso” é como todo site fica sem política</h2>
          <p className="pg-p">
            Um site que pede nome e e-mail num formulário, usa cookie de sessão ou simplesmente
            registra o acesso de quem visita já está tratando dado pessoal — e a LGPD não pergunta
            o tamanho da empresa antes de exigir transparência sobre isso. O problema não é a
            multa (que existe e pode ser pesada); é o mais simples: cliente e fornecedor
            profissional, hoje, esperam encontrar uma política de privacidade no rodapé, e a
            ausência dela já é um sinal de alerta antes mesmo de qualquer venda.
          </p>
          <p className="pg-p">
            Esta ferramenta não substitui um advogado — nenhuma ferramenta de seis perguntas
            substitui, e a página não finge o contrário. O que ela faz é tirar você do zero
            absoluto: monta a estrutura certa, cita a lei certa e adapta o texto ao que você
            realmente coleta, para você (ou o seu advogado) revisar em cima de algo pronto, não de
            uma página em branco.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 44 }}>Como usar em três passos</h2>
          <ol className="pg-list" style={{ marginTop: 18 }}>
            {[
              "Preencha nome da empresa, site e e-mail de contato — é o cabeçalho da política, quem é o controlador dos dados.",
              "Marque só o que você realmente coleta e usa: tipos de dado, Google Analytics, Meta Pixel, e-mail marketing. Pode deixar tudo sem marcar se não usa nada disso.",
              "Copie o texto ou baixe em .txt ou .html, revise se reflete a sua operação de verdade e publique no rodapé do site.",
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
        titulo="O texto está pronto. O site que ele protege, você já tem?"
        texto="Uma política de privacidade honesta só faz sentido junto de um site que também é honesto no resto: rápido, sem link quebrado, com formulário que realmente funciona. A HyperGrow cria sites e landing pages que sustentam essa confiança do primeiro clique ao rodapé."
      />

      <OutrasFerramentas atual={F.slug} />
    </PageShellClaro>
  );
}

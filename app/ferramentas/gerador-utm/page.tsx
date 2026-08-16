import "../../claro-tokens.css";
import type { Metadata } from "next";
import PageShellClaro from "@/components/site/PageShellClaro";
import EstilosFerramentas from "@/components/ferramentas/EstilosFerramentas";
import { ConviteFerramenta, OutrasFerramentas, SeloGratis } from "@/components/ferramentas/PecasFerramenta";
import GeradorUtm from "@/components/ferramentas/GeradorUtm";
import { getFerramenta } from "@/lib/ferramentas";
import { SITE_URL, ogImagens } from "@/lib/seo";

/* PÁGINA ESTÁTICA por construção (ver comentário em /ferramentas/page.tsx). */

const F = getFerramenta("gerador-utm")!;
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
    "Preciso preencher os cinco parâmetros?",
    "Não. utm_source (de onde vem a visita) e utm_medium (que tipo de canal é) já bastam para o GA4 classificar a origem — são os dois marcados como obrigatórios. utm_campaign, utm_term e utm_content são opcionais e servem para refinar: qual campanha, qual palavra-chave, qual peça foi clicada.",
  ],
  [
    "Por que a ferramenta insiste em minúscula, sem acento e sem espaço?",
    "Porque o Google Analytics trata o valor do parâmetro como texto puro e diferencia maiúscula de minúscula: “Instagram”, “instagram” e “INSTAGRAM” viram três linhas separadas no relatório, cada uma com um pedaço do resultado. Espaço vira %20 no link e acento vira código (“promoção” vira “promo%C3%A7%C3%A3o”). O botão “Arrumar tudo” resolve os quatro problemas de uma vez.",
  ],
  [
    "Posso usar utm_source e utm_medium num anúncio do Google Ads?",
    "Só se você não usa a marcação automática do Google Ads (gclid) vinculada ao GA4. Se usa, não adicione UTM manual: os dois sistemas de rastreamento brigam pela mesma visita e o relatório de aquisição sai duplicado ou inconsistente. Para Google Ads vinculado, deixe o gclid fazer o trabalho sozinho.",
  ],
  [
    "Colei uma URL que já tinha UTM. O que a ferramenta faz?",
    "Ela avisa e não deixa você duplicar: um segundo conjunto de utm_source/utm_medium na mesma URL faz o Analytics considerar só o primeiro e o resto vira parâmetro morto na URL, sem função nenhuma. Apague o UTM antigo do endereço colado e monte o novo só aqui.",
  ],
  [
    "Preciso gerar um link novo para cada campanha?",
    "Sim, e é exatamente o que evita relatório sujo: use um utm_campaign diferente para cada ação (bio, stories, campanha de Black Friday, disparo de e-mail) para poder comparar o resultado de cada uma separadamente. Misturar duas campanhas no mesmo link é o motivo mais comum de “não dá pra saber o que trouxe mais gente”.",
  ],
  [
    "O link com UTM abre um site diferente?",
    "Não. Ele abre exatamente a mesma página do link original — os parâmetros UTM só viajam junto no endereço para o Google Analytics (ou qualquer ferramenta que leia parâmetros de URL) identificar de onde veio o clique. Para quem visita, a experiência é idêntica a abrir o link sem UTM nenhum.",
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
          "Monta o link com utm_source, utm_medium, utm_campaign, utm_term e utm_content",
          "Avisa sobre espaço, letra maiúscula, acento e símbolo antes de sujar o relatório",
          "Detecta URL que já tem UTM ou query string e encaixa os parâmetros no lugar certo",
          "Modelos prontos para bio, stories, e-mail, anúncio e QR impresso",
          "Botão que normaliza todos os campos de uma vez",
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
      crumbs={[{ label: "Início", href: "/" }, { label: "Ferramentas", href: "/ferramentas" }, { label: "Link UTM" }]}
      accent={F.accent}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EstilosFerramentas />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Ferramenta grátis</span>
          <h1 className="pg-h1">Gerador de link<br />com UTM</h1>
          <p className="pg-lede">{F.chamada}</p>
          <div style={{ marginTop: 20 }}>
            <SeloGratis />
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: "clamp(26px, 3.2vw, 40px)", paddingBottom: "clamp(30px, 4vw, 48px)" }}>
        <div className="wrap">
          <GeradorUtm />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="pg-h2">O relatório não mente. Ele só repete o que você digitou.</h2>
          <p className="pg-p">
            O Google Analytics não corrige maiúscula, não junta acento com a versão sem acento e
            não entende que “insta” e “instagram” são a mesma origem. Cada variação de texto vira
            uma linha própria no relatório de aquisição, e o resultado de uma campanha fica
            espalhado em três ou quatro linhas diferentes — nenhuma delas mostrando o número certo
            sozinha. O problema nunca aparece na hora de gerar o link: aparece três meses depois,
            quando alguém tenta somar o resultado e as contas não fecham.
          </p>
          <p className="pg-p">
            É por isso que esta ferramenta não faz só a concatenação (que qualquer um faz em texto
            solto). Ela aponta os quatro erros clássicos antes de você copiar o link — espaço,
            maiúscula, acento e URL que já tinha parâmetro — e oferece um botão que arruma tudo de
            uma vez, sempre no mesmo padrão.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 44 }}>Como usar em três passos</h2>
          <ol className="pg-list" style={{ marginTop: 18 }}>
            {[
              "Cole o endereço da página de destino. Se ela já tiver parâmetro ou âncora, a ferramenta encaixa o UTM no lugar certo.",
              "Preencha origem e mídia — os dois obrigatórios — ou toque num modelo pronto (bio, stories, e-mail, anúncio, QR impresso) e ajuste o nome da campanha.",
              "Copie o link ou toque em “Testar agora” para abrir e conferir antes de divulgar em anúncio, e-mail ou bio.",
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
        titulo="O link rastreia. A campanha por trás dele é outra conversa."
        texto="Gerar o link certo garante que o relatório fique limpo — mas ele só mostra o que já está acontecendo. Para decidir onde investir, ajustar lance e escalar o que funciona, a HyperGrow cuida do tráfego pago de ponta a ponta, com o relatório mostrando exatamente o que cada real trouxe."
      />

      <OutrasFerramentas atual={F.slug} />
    </PageShellClaro>
  );
}

import "../claro-tokens.css";
import type { Metadata } from "next";
import PageShellClaro from "@/components/site/PageShellClaro";
import { SITE_URL } from "@/lib/seo";

/* /privacidade — era a página mais destoante do site: Tailwind escuro
   (`text-slate-300` sobre o fundo do body), SEM cabeçalho nenhum e sem rodapé.
   Quem chegava aqui pelo rodapé ficava sem menu e sem saída, e a página não
   parecia do mesmo site. Agora usa o mesmo shell claro das outras rotas.
   O conteúdo jurídico é o mesmo — só a moldura mudou. */

const TITLE = "Política de Privacidade — HyperGrow";
const DESC = "Como a HyperGrow coleta, usa e protege os seus dados.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/privacidade` },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/privacidade`, type: "website", images: ["/media/launch-poster.png"] },
};

export default function PrivacidadePage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/privacidade`,
        name: TITLE,
        description: DESC,
        url: `${SITE_URL}/privacidade`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Privacidade", item: `${SITE_URL}/privacidade` },
        ],
      },
    ],
  };

  return (
    <PageShellClaro crumbs={[{ label: "Início", href: "/" }, { label: "Privacidade" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in" style={{ maxWidth: 860 }}>
          <span className="pg-kicker">Documentos</span>
          <h1 className="pg-h1">Política de Privacidade</h1>
          <p className="pg-lede">
            A HyperGrow respeita a sua privacidade. Esta política explica, de forma resumida, como
            tratamos os dados que você nos fornece.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: "clamp(30px, 4vw, 46px)" }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <h2 className="pg-h2">Dados que coletamos</h2>
          <p className="pg-p">
            Coletamos os dados que você informa voluntariamente em nossos formulários (nome, e-mail,
            telefone e mensagem) com o objetivo de responder à sua solicitação e enviar uma proposta.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 40 }}>Uso dos dados</h2>
          <p className="pg-p">
            Utilizamos seus dados apenas para contato comercial e atendimento. Não vendemos nem
            compartilhamos seus dados com terceiros para fins de marketing.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 40 }}>Seus direitos</h2>
          <p className="pg-p">
            Você pode solicitar a qualquer momento a correção ou a exclusão dos seus dados. Use o
            formulário da página de contato — é o canal que cai direto no nosso painel e o único que
            garantimos responder em até 1 dia útil.
          </p>

          <p className="pg-small" style={{ marginTop: 34 }}>Última atualização: 2026.</p>
        </div>
      </section>
    </PageShellClaro>
  );
}

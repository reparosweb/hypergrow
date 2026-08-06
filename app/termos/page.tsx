import "../claro-tokens.css";
import type { Metadata } from "next";
import PageShellClaro from "@/components/site/PageShellClaro";
import { SITE_URL } from "@/lib/seo";

/* /termos — mesma situação de /privacidade: Tailwind escuro, sem cabeçalho e
   sem rodapé. Migrada para o shell claro; texto preservado. */

const TITLE = "Termos de Uso — HyperGrow";
const DESC = "Termos e condições de uso do site e dos serviços da HyperGrow.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/termos` },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/termos`, type: "website", images: ["/media/launch-poster.png"] },
};

export default function TermosPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/termos`,
        name: TITLE,
        description: DESC,
        url: `${SITE_URL}/termos`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Termos", item: `${SITE_URL}/termos` },
        ],
      },
    ],
  };

  return (
    <PageShellClaro crumbs={[{ label: "Início", href: "/" }, { label: "Termos" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in" style={{ maxWidth: 860 }}>
          <span className="pg-kicker">Documentos</span>
          <h1 className="pg-h1">Termos de Uso</h1>
          <p className="pg-lede">Ao utilizar o site da HyperGrow, você concorda com os termos abaixo.</p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: "clamp(30px, 4vw, 46px)" }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <h2 className="pg-h2">Uso do site</h2>
          <p className="pg-p">
            O conteúdo deste site é informativo. As propostas e condições comerciais são definidas
            individualmente em contrato para cada projeto.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 40 }}>Propriedade intelectual</h2>
          <p className="pg-p">
            Marca, textos e identidade visual da HyperGrow são protegidos. Os projetos do portfólio
            pertencem aos seus respectivos titulares.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 40 }}>Contato</h2>
          <p className="pg-p">
            Dúvidas sobre estes termos: use o formulário da página de contato. É o canal oficial de
            atendimento e cai direto no nosso painel.
          </p>

          <p className="pg-small" style={{ marginTop: 34 }}>Última atualização: 2026.</p>
        </div>
      </section>
    </PageShellClaro>
  );
}

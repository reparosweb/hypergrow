import "../claro-tokens.css";
import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import PageShellClaro from "@/components/site/PageShellClaro";
import EstilosFerramentas from "@/components/ferramentas/EstilosFerramentas";
import { IconeDaFerramenta, SeloGratis } from "@/components/ferramentas/PecasFerramenta";
import { FERRAMENTAS } from "@/lib/ferramentas";
import { SITE_URL } from "@/lib/seo";

/* /ferramentas — a porta de entrada das ferramentas grátis.

   PÁGINA ESTÁTICA por construção: nenhum route.ts, nenhum `export const
   dynamic`, nenhuma leitura de cookies/headers/searchParams e nenhuma server
   action. Quem tem estado é o componente "use client" de cada ferramenta — a
   página que o importa continua sendo gerada no build. Isso importa aqui:
   a Vercel no plano Hobby aceita 12 funções serverless e o site já usa 9.

   POR QUE ISTO EXISTE: quem procura "calculadora de ROAS" ainda não está
   procurando uma agência. A ferramenta resolve o problema dele de graça hoje e
   apresenta quem resolveu. Sem popup, sem parede de e-mail, sem limite de uso —
   pedágio em ferramenta grátis é a forma mais rápida de queimar a confiança que
   ela deveria construir. */

const TITLE = "4 ferramentas grátis para vender mais online — HyperGrow";
const DESC =
  "Gerador de link e QR Code do WhatsApp, calculadora de preço para marketplace, calculadora de ROAS e simulador de resultado do Google. Grátis, sem cadastro.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/ferramentas` },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/ferramentas`, type: "website", images: ["/media/launch-poster.png"] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

export default function FerramentasPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/ferramentas`,
        name: TITLE,
        description: DESC,
        url: `${SITE_URL}/ferramentas`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "ItemList",
        name: "Ferramentas grátis da HyperGrow",
        numberOfItems: FERRAMENTAS.length,
        itemListElement: FERRAMENTAS.map((f, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: f.nome,
          description: f.resolve,
          url: `${SITE_URL}/ferramentas/${f.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Ferramentas grátis", item: `${SITE_URL}/ferramentas` },
        ],
      },
    ],
  };

  return (
    <PageShellClaro crumbs={[{ label: "Início", href: "/" }, { label: "Ferramentas grátis" }]} accent="#1550E8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EstilosFerramentas />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Ferramentas grátis</span>
          <h1 className="pg-h1">Quatro contas que<br />todo negócio online erra.</h1>
          <p className="pg-lede">
            Preço que não fecha, anúncio que gasta mais do que traz, link de WhatsApp que não abre
            e título que o Google corta no meio. Resolvemos as quatro aqui, de graça, sem você
            precisar falar com ninguém.
          </p>
          <div style={{ marginTop: 20 }}>
            <SeloGratis />
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: "clamp(28px, 3.4vw, 44px)", paddingBottom: "clamp(36px, 4.5vw, 56px)" }}>
        <div className="wrap">
          <div className="ft-hub">
            {FERRAMENTAS.map((f) => (
              <Link
                key={f.slug}
                href={`/ferramentas/${f.slug}`}
                className="ft-hub-c"
                style={{ "--beam": f.accent } as unknown as CSSProperties}
              >
                <span className="ft-hub-ic" style={{ background: f.accent + "14", color: f.accent }}>
                  <IconeDaFerramenta nome={f.icone} tamanho={26} />
                </span>
                <h2 className="ft-hub-t">{f.nome}</h2>
                <p className="ft-hub-d">{f.resolve}</p>
                <span className="ft-hub-go">
                  Abrir ferramenta
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="pg-h2">Por que de graça, e sem pedir seu e-mail</h2>
          <p className="pg-p">
            Porque ferramenta que cobra um e-mail para mostrar o resultado não é ferramenta: é
            formulário disfarçado. Estas quatro rodam inteiras dentro do seu navegador — o número
            de telefone, o custo do seu produto e a sua margem não são enviados para servidor
            nenhum, nem para o nosso.
          </p>
          <p className="pg-p">
            O que ganhamos com isso: se a conta te ajudar hoje, você vai lembrar de quem fez a
            conta quando precisar de quem execute. É a mesma lógica do resto do site — mostrar
            trabalho antes de pedir contrato.
          </p>
          <p className="pg-p">
            Achou um número estranho ou quer uma ferramenta que ainda não existe aqui?{" "}
            <Link href="/contato">Escreva para a gente</Link> — a lista cresce conforme os pedidos
            que chegam.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="pg-cta">
            <h2 className="pg-h2">A conta fechou. Falta executar?</h2>
            <p className="pg-p">
              Conte a situação em uma frase. Em até 1 dia útil você recebe um diagnóstico e a
              proposta do que resolve.
            </p>
            <div className="pg-cta-actions">
              <Link href="/contato" className="btn btn-p">Falar com a HyperGrow</Link>
              <Link href="/servicos" className="btn btn-s">Ver todos os serviços</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShellClaro>
  );
}

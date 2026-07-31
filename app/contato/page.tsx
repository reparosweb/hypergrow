import "../hg-tokens.css";
import "../hg-styles.css";
import type { Metadata } from "next";
import PageShell, { Check } from "@/components/site/PageShell";
import ContactForm from "@/components/site/ContactForm";
import { SITE_URL } from "@/lib/seo";

/* /contato — a página que faltava.
   "Contato" era só uma âncora da home (#contato). Uma âncora não tem título
   próprio, não tem URL para citar e não pode ser o destino de um anúncio ou de
   uma resposta de IA. Agora existe página real, com o MESMO formulário da home
   (components/site/ContactForm.tsx → POST /api/lead → Supabase).

   ⚠️ HONESTIDADE DE CANAL: o formulário é hoje o ÚNICO caminho que funciona de
   verdade. O e-mail contato@hypergrow.com.br não existe (o domínio ainda não foi
   registrado) e o botão de WhatsApp só funciona quando NEXT_PUBLIC_WHATSAPP for
   definido na Vercel. Por isso esta página não anuncia canal que não responde. */

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "";
const TITLE = "Contato — fale com a HyperGrow";
const DESC =
  "Conte o que a sua empresa precisa e receba um diagnóstico com proposta em até 1 dia útil. Sem compromisso.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/contato` },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/contato`, type: "website", images: ["/media/launch-poster.png"] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const ETAPAS = [
  ["Você envia", "Uma frase já basta. Quanto mais contexto, mais precisa vem a proposta."],
  ["A gente lê e pesquisa", "Olhamos o seu site, o seu mercado e o que os concorrentes estão fazendo."],
  ["Você recebe o diagnóstico", "Em até 1 dia útil: o que está travando, o que resolve e quanto custa."],
  ["Você decide", "Sem cobrança pelo diagnóstico e sem insistência se não fizer sentido agora."],
];

export default function ContatoPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${SITE_URL}/contato`,
        name: TITLE,
        description: DESC,
        url: `${SITE_URL}/contato`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Contato", item: `${SITE_URL}/contato` },
        ],
      },
    ],
  };

  return (
    <PageShell crumbs={[{ label: "Início", href: "/" }, { label: "Contato" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="sec">
        <div className="wrap ct-grid">
          <div className="pg-in">
            <span className="pg-kicker">Contato</span>
            <h1 className="pg-h1">Diagnóstico gratuito,<br />proposta em 1 dia útil.</h1>
            <p className="pg-lede">
              Conte a situação em uma frase — o que está travando hoje. A gente olha o seu
              caso de verdade antes de responder, e devolve o que resolve com prazo e preço.
            </p>

            <h2 className="pg-h2" style={{ marginTop: 42, fontSize: "clamp(19px, 2.2vw, 24px)" }}>Como funciona</h2>
            <ol className="pg-list" style={{ marginTop: 16 }}>
              {ETAPAS.map(([t, d], i) => (
                <li key={t} style={{ alignItems: "flex-start" }}>
                  <span aria-hidden className="mono" style={{ flexShrink: 0, minWidth: 26, color: "var(--acc)", font: "600 13px var(--font-mono)", paddingTop: 3 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span><strong style={{ color: "#fff", fontWeight: 600 }}>{t}.</strong> {d}</span>
                </li>
              ))}
            </ol>

            <h2 className="pg-h2" style={{ marginTop: 42, fontSize: "clamp(19px, 2.2vw, 24px)" }}>O que já está incluso</h2>
            <ul className="pg-list" style={{ marginTop: 16 }}>
              {[
                "Análise do que existe hoje (site, loja, redes) antes de qualquer proposta.",
                "Escopo, prazo e investimento por escrito — nada de valor \"a combinar\".",
                "Domínio, hospedagem, certificado e monitoramento por nossa conta.",
              ].map((t) => (<li key={t}><Check />{t}</li>))}
            </ul>

            {/* Só canal que responde de verdade. */}
            <p className="pg-p" style={{ marginTop: 34, fontSize: 14, color: "rgba(232,226,217,0.5)" }}>
              {WHATSAPP
                ? "Prefere falar por WhatsApp? Use o botão flutuante na home — respondemos em horário comercial."
                : "O formulário ao lado é o canal oficial de atendimento e cai direto no nosso painel. Respondemos em até 1 dia útil."}
            </p>
          </div>

          <div className="ct-form pg-in" style={{ animationDelay: "0.08s" }}>
            <ContactForm />
          </div>
        </div>
      </section>

      <style>{`
        .ct-grid { display: grid; grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr); gap: clamp(28px, 4vw, 52px); align-items: start; }
        .ct-form { position: sticky; top: 28px; }
        @media (max-width: 900px) {
          .ct-grid { grid-template-columns: 1fr !important; }
          .ct-form { position: static; }
        }
      `}</style>
    </PageShell>
  );
}

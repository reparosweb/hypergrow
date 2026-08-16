import "../claro-tokens.css";
import Link from "next/link";
import type { Metadata } from "next";
import PageShellClaro, { Check } from "@/components/site/PageShellClaro";
import { SITE_URL, ogImagens } from "@/lib/seo";

/* /afiliados — página 100% institucional/informativa.

   O QUE ESTA PÁGINA É: uma explicação honesta do programa de afiliados da
   HyperGrow. Comissão única (percentual a combinar caso a caso — ainda NÃO
   decidido publicamente, por isso nenhum número aparece aqui) sobre o valor
   do projeto fechado, paga uma vez quando o indicado vira cliente pagante.

   O QUE ESTA PÁGINA NÃO É: um cadastro de afiliados. O sistema técnico
   (banco de dados, portal logado, link de rastreio `?ref=`) está sendo
   construído em paralelo por outro agente e ainda não está no ar. Por isso
   o único CTA daqui é "fale com a gente" (/contato) — nunca um formulário
   de cadastro instantâneo que ainda não existe. Quando o portal for ao ar,
   esta página é o lugar certo para trocar o CTA por um link de cadastro real.

   Mesma regra do resto do site: nenhum número inventado. Nada de "600+
   afiliados" ou "R$X em comissões pagas" — hoje é zero, e zero não vira
   estatística de marketing. */

const TITLE = "Programa de Afiliados HyperGrow — indique e ganhe comissão";
const DESC =
  "Indique um contato que vire cliente pagante da HyperGrow e receba uma comissão sobre o projeto fechado, paga uma única vez. Veja como funciona.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/afiliados` },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/afiliados`, type: "website", images: ogImagens("institucional") },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const PASSOS = [
  ["Você indica", "Conta para a gente sobre um contato seu que precisa de site, loja virtual, marketing ou automação com IA."],
  ["A gente atende", "Fazemos o diagnóstico e conduzimos a conversa comercial com essa indicação até o fim."],
  ["O projeto fecha e é pago", "Quando o indicado assina e paga o projeto, a indicação virou uma venda de verdade."],
  ["Você recebe a comissão", "Uma comissão sobre o valor do projeto, combinada com você caso a caso, paga uma única vez."],
];

const PARA_QUEM = [
  "Consultores e freelancers de design, marketing ou tecnologia que atendem empresas mas não fazem esse tipo de serviço.",
  "Clientes satisfeitos da HyperGrow que conhecem outro dono de negócio precisando do mesmo tipo de trabalho.",
  "Quem tem uma audiência (redes sociais, comunidade, newsletter) com público que precisa de site, loja ou marketing digital.",
  "Qualquer pessoa que conhece alguém com um problema real que a HyperGrow resolve — não precisa entender de tecnologia.",
];

const FAQ = [
  {
    q: "Como eu recebo a comissão?",
    a: "Depois que o projeto indicado por você é fechado e pago pelo cliente, combinamos e acertamos o valor da comissão diretamente com você. Hoje esse pagamento é combinado caso a caso, manualmente.",
  },
  {
    q: "Qual é o percentual da comissão?",
    a: "Varia de acordo com o tipo e o valor do projeto fechado — ainda não temos um percentual único fixo para divulgar publicamente. O valor é combinado com você antes de contarmos a indicação como fechada.",
  },
  {
    q: "Existe um valor mínimo de indicação?",
    a: "Não. Qualquer indicação sua que vire um projeto pago com a HyperGrow gera comissão, independente do tamanho do projeto.",
  },
  {
    q: "Posso indicar mais de um contato?",
    a: "Sim. Pode indicar quantos contatos quiser — cada projeto fechado a partir de uma indicação sua gera a comissão correspondente a ele.",
  },
  {
    q: "Como acompanho se minha indicação virou cliente?",
    a: "Por enquanto o acompanhamento é direto com a gente, pelo WhatsApp ou pelo formulário de contato. Um painel próprio para afiliados, com link de rastreio e status de cada indicação, está em construção.",
  },
  {
    q: "Como eu entro no programa?",
    a: "Ainda não existe cadastro automático. Fale com a gente pelo formulário de contato contando que quer participar, e combinamos os próximos passos diretamente com você.",
  },
];

export default function AfiliadosPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/afiliados`,
        name: TITLE,
        description: DESC,
        url: `${SITE_URL}/afiliados`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Afiliados", item: `${SITE_URL}/afiliados` },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/afiliados#faq`,
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <PageShellClaro crumbs={[{ label: "Início", href: "/" }, { label: "Afiliados" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Afiliados</span>
          <h1 className="pg-h1">Programa de Afiliados<br />da HyperGrow.</h1>
          <p className="pg-lede">
            Indicou um contato que virou cliente pagante da HyperGrow? Você recebe uma
            comissão sobre o valor do projeto — paga uma única vez, quando o projeto é
            fechado e pago.
          </p>
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────────────────────────────────── */}
      <section className="sec">
        <div className="wrap">
          <h2 className="pg-h2">Como funciona</h2>
          <ol className="pg-list" style={{ marginTop: 18, counterReset: "step" }}>
            {PASSOS.map(([t, d], i) => (
              <li key={t} style={{ alignItems: "flex-start" }}>
                <span aria-hidden className="pg-num">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{t}.</strong>{" "}
                  {d}
                </span>
              </li>
            ))}
          </ol>
          <p className="pg-p" style={{ marginTop: 22 }}>
            O percentual da comissão é combinado caso a caso, de acordo com o tipo e o
            valor do projeto — hoje não temos um número único fixo para divulgar. Isso é
            definido com você antes de contarmos qualquer indicação como fechada.
          </p>
        </div>
      </section>

      {/* ── PARA QUEM É ───────────────────────────────────────────────────── */}
      <section className="sec">
        <div className="wrap">
          <h2 className="pg-h2">Para quem é este programa</h2>
          <p className="pg-p">
            Não existe um perfil obrigatório. Na prática, quem indica bem costuma se
            encaixar em um destes casos:
          </p>
          <ul className="pg-list" style={{ marginTop: 18 }}>
            {PARA_QUEM.map((t) => (
              <li key={t}><Check />{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="sec">
        <div className="wrap">
          <span className="pg-kicker">Dúvidas</span>
          <h2 className="pg-h2">Perguntas frequentes</h2>
          <div style={{ marginTop: 18, display: "grid", gap: 22, maxWidth: "min(74ch, 100%)" }}>
            {FAQ.map((f, i) => (
              <div key={f.q}>
                <h3 className="pg-h3">{f.q}</h3>
                <p className="pg-p" style={{ marginTop: 6 }}>{f.a}</p>
                {i < FAQ.length - 1 && <hr className="pg-hr" style={{ marginTop: 22 }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
      <section className="sec">
        <div className="wrap">
          <div className="pg-cta">
            <h2 className="pg-h2">Quer participar?</h2>
            <p className="pg-p">
              Ainda não existe cadastro automático — fale com a gente pelo formulário de
              contato ou pelo WhatsApp e combinamos os próximos passos com você.
            </p>
            <div className="pg-cta-actions">
              <Link href="/contato" className="btn btn-p">Falar com a HyperGrow</Link>
              <Link href="/servicos" className="btn btn-s">Ver o que indicar</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShellClaro>
  );
}

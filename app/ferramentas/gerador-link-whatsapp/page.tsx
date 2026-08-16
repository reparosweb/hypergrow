import "../../claro-tokens.css";
import type { Metadata } from "next";
import PageShellClaro from "@/components/site/PageShellClaro";
import EstilosFerramentas from "@/components/ferramentas/EstilosFerramentas";
import { ConviteFerramenta, OutrasFerramentas, SeloGratis } from "@/components/ferramentas/PecasFerramenta";
import GeradorWhatsApp from "@/components/ferramentas/GeradorWhatsApp";
import { getFerramenta } from "@/lib/ferramentas";
import { SITE_URL, ogImagens } from "@/lib/seo";

/* PÁGINA ESTÁTICA: sem route.ts, sem `export const dynamic`, sem cookies(),
   headers() ou searchParams, sem server action. O estado vive no componente
   "use client" — a página que o importa continua saindo pronta do build. */

const F = getFerramenta("gerador-link-whatsapp")!;
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
    "O meu número de telefone fica guardado em algum lugar?",
    "Não. A ferramenta é um arquivo que o seu navegador baixa e executa no seu aparelho. O número e a mensagem são digitados, transformados em link e desenhados em QR Code ali mesmo — não existe envio para servidor, nem o nosso, nem de terceiros.",
  ],
  [
    "Funciona com WhatsApp comum e com o Business?",
    "Funciona com os dois. O link não depende do tipo de conta: ele só abre uma conversa com o número informado, desde que esse número tenha WhatsApp ativo.",
  ],
  [
    "Por que o link precisa do 55 na frente?",
    "Porque o formato de link do WhatsApp usa o número no padrão internacional: código do país, DDD e número, tudo junto e só com dígitos. O 55 é o código do Brasil. Sem ele, o WhatsApp não sabe de que país é o número e a conversa não abre.",
  ],
  [
    "Meu link não abre a conversa. O que costuma ser?",
    "Quase sempre é uma destas quatro coisas: o DDD está errado; falta o 9 na frente do celular; o número não tem WhatsApp ativo; ou o número foi digitado com o 0 da operadora na frente, que não entra no link. A ferramenta avisa nos três primeiros casos enquanto você digita.",
  ],
  [
    "Posso imprimir o QR Code em banner ou adesivo grande?",
    "Pode, e nesse caso baixe o SVG. Ele é vetor: amplia para qualquer tamanho sem serrilhar. O PNG sai com cerca de 1 000 pixels, o que resolve post, cartão e impressão pequena.",
  ],
  [
    "Dá para trocar a mensagem depois sem trocar o QR Code?",
    "Não: a mensagem faz parte do link, e o QR Code é o desenho desse link. Se mudar o texto, gere um QR novo. Por isso vale escolher uma mensagem que envelheça bem — evite datas e promoções em material impresso.",
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
          "Gera link wa.me com mensagem pré-preenchida",
          "Gera QR Code do mesmo link",
          "Baixa o QR Code em PNG e em SVG",
          "Valida DDD e formato do celular brasileiro",
          "Funciona 100% no navegador, sem enviar dados",
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
      crumbs={[{ label: "Início", href: "/" }, { label: "Ferramentas", href: "/ferramentas" }, { label: "Link do WhatsApp" }]}
      accent={F.accent}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EstilosFerramentas />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Ferramenta grátis</span>
          <h1 className="pg-h1">Gerador de link e<br />QR Code do WhatsApp</h1>
          <p className="pg-lede">{F.chamada}</p>
          <div style={{ marginTop: 20 }}>
            <SeloGratis />
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: "clamp(26px, 3.2vw, 40px)", paddingBottom: "clamp(30px, 4vw, 48px)" }}>
        <div className="wrap">
          <GeradorWhatsApp />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="pg-h2">Por que um link com mensagem pronta muda o resultado</h2>
          <p className="pg-p">
            A conversa que começa em branco quase sempre começa com &ldquo;oi&rdquo; — e aí você
            gasta duas mensagens só para descobrir o que a pessoa quer. Com o texto já escrito,
            a primeira mensagem já diz de onde ela veio e do que precisa. Atendimento mais curto,
            resposta mais rápida e um dado que você não tinha: qual anúncio, qual página ou qual
            cartaz trouxe aquela conversa, porque cada um pode ter a sua mensagem.
          </p>
          <p className="pg-p">
            É também o que permite medir. Um link por origem (bio do Instagram, botão do site,
            QR do balcão) transforma &ldquo;acho que veio do Instagram&rdquo; em algo que você lê
            na própria conversa.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 44 }}>Como usar em três passos</h2>
          <ol className="pg-list" style={{ marginTop: 18 }}>
            {[
              "Digite o telefone com DDD. A ferramenta confere na hora se o DDD existe e se o celular tem o 9 na frente.",
              "Escreva a mensagem que deve vir pronta — ou toque em um dos modelos e ajuste o texto.",
              "Copie o link para usar no site e nas redes, ou baixe o QR Code para imprimir. Antes de divulgar, toque em “Testar agora” e confira se a conversa abre certa.",
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
        titulo="O link é o começo. Quem responde é o gargalo."
        texto="Gerar o link resolve a entrada da conversa. O que trava depois é o volume: mensagem repetida, cliente esperando resposta e ninguém para atender fora do horário. A HyperGrow monta o atendimento automatizado que qualifica, responde e só passa para você o que precisa de gente."
      />

      <OutrasFerramentas atual={F.slug} />
    </PageShellClaro>
  );
}

import "../../claro-tokens.css";
import type { Metadata } from "next";
import PageShellClaro from "@/components/site/PageShellClaro";
import EstilosFerramentas from "@/components/ferramentas/EstilosFerramentas";
import { ConviteFerramenta, OutrasFerramentas, SeloGratis } from "@/components/ferramentas/PecasFerramenta";
import GeradorQrCode from "@/components/ferramentas/GeradorQrCode";
import { getFerramenta } from "@/lib/ferramentas";
import { SITE_URL, ogImagens } from "@/lib/seo";

/* PÁGINA ESTÁTICA por construção (ver comentário em /ferramentas/page.tsx). */

const F = getFerramenta("gerador-qr-code")!;
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
    "Esse QR Code expira ou depende de algum serviço para funcionar?",
    "Não. O desenho é gerado no seu próprio navegador e aponta direto para o conteúdo que você informou — link, PIX, Wi-Fi ou texto. Não existe encurtador nem servidor no meio: se o nosso site sair do ar amanhã, o QR Code que você já baixou continua funcionando normalmente, para sempre.",
  ],
  [
    "Qual é a diferença entre baixar em PNG e em SVG?",
    "PNG sai com cerca de 1.000 pixels — resolve post de rede social, cartão de visita e impressão pequena. SVG é vetor: amplia para banner, fachada ou adesivo grande sem serrilhar, porque não é feito de pixels fixos, é feito de instruções de desenho.",
  ],
  [
    "O que muda entre os níveis de correção de erro (L, M, Q, H)?",
    "É quanto do desenho pode estar sujo, riscado ou parcialmente coberto e o código ainda ser lido: L recupera 7%, M recupera 15%, Q recupera 25% e H recupera 30%. Mais correção deixa o desenho mais denso (pede impressão um pouco maior); menos correção dá um QR mais “limpo” para ambientes controlados, como uma tela.",
  ],
  [
    "O QR de PIX é seguro? A ferramenta altera o código copiado do banco?",
    "A ferramenta nunca altera o código PIX — ela desenha exatamente o texto que você colou. O que ela faz é conferir o dígito verificador (CRC) que todo código PIX carrega no final, para pegar o erro mais comum: copiar o código pela metade. Mesmo com a conferência dando certo, teste o QR com o seu próprio celular antes de divulgar.",
  ],
  [
    "O QR de Wi-Fi funciona em qualquer celular?",
    "Funciona nativamente em Android e iPhone atualizados: a câmera reconhece o formato e oferece “Entrar na rede” sem precisar digitar a senha. Redes com caractere especial no nome ou na senha são tratadas corretamente pela ferramenta, que escapa os símbolos que o formato exige.",
  ],
  [
    "Posso reimprimir o mesmo QR Code depois, se eu perder o arquivo?",
    "Sim — como nada fica salvo em nenhum servidor, basta preencher os mesmos dados aqui de novo (o mesmo link, o mesmo código PIX, os mesmos dados de Wi-Fi) e o desenho gerado será idêntico ao original, porque o QR Code é determinado inteiramente pelo conteúdo, não por um cadastro em algum lugar.",
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
          "Gera QR Code de link, texto, PIX copia e cola ou rede Wi-Fi",
          "Confere o dígito verificador do código PIX antes de gerar o desenho",
          "Quatro níveis de correção de erro (L, M, Q, H)",
          "Baixa em PNG (post, cartão) ou SVG (banner, fachada, adesivo grande)",
          "Desenhado 100% no navegador, sem link intermediário e sem prazo de validade",
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
      crumbs={[{ label: "Início", href: "/" }, { label: "Ferramentas", href: "/ferramentas" }, { label: "QR Code" }]}
      accent={F.accent}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EstilosFerramentas />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Ferramenta grátis</span>
          <h1 className="pg-h1">Gerador de<br />QR Code</h1>
          <p className="pg-lede">{F.chamada}</p>
          <div style={{ marginTop: 20 }}>
            <SeloGratis />
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: "clamp(26px, 3.2vw, 40px)", paddingBottom: "clamp(30px, 4vw, 48px)" }}>
        <div className="wrap">
          <GeradorQrCode />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="pg-h2">O QR bonito que morre junto com o site que o desenhou</h2>
          <p className="pg-p">
            A maioria dos geradores gratuitos de QR Code na internet não grava o seu conteúdo
            diretamente no desenho: eles criam um link curto próprio (algo como
            qrcode-xyz.com/abc123) e o QR aponta para esse encurtador, não para o seu site, o seu
            PIX ou a sua rede. Funciona enquanto aquele site existe — e para de funcionar no dia em
            que ele sai do ar, muda de plano ou decide cobrar para manter os links antigos vivos.
            Um adesivo já colado na embalagem, nesse dia, vira um QR morto.
          </p>
          <p className="pg-p">
            Aqui o desenho é gerado no seu navegador e grava o conteúdo real, direto: o link
            completo, o código PIX exato, os dados da rede Wi-Fi. Não há intermediário para
            quebrar, porque não há intermediário nenhum.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 44 }}>Como usar em três passos</h2>
          <ol className="pg-list" style={{ marginTop: 18 }}>
            {[
              "Escolha o tipo — link, texto, PIX ou Wi-Fi — e preencha o campo correspondente.",
              "Ajuste o nível de correção de erro se o QR for para impressão exposta a sujeira, dobra ou logo sobreposto no centro.",
              "Baixe em PNG ou SVG e teste com o seu próprio celular antes de imprimir ou publicar em qualquer lugar.",
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
        titulo="O QR abre a porta. O que tem atrás dela é o que decide."
        texto="Um QR Code bem-feito leva a pessoa até você em um toque — mas se ele abrir um cartão sem graça ou uma página que não carrega, a visita se perde ali mesmo. A HyperGrow monta o cartão de visita interativo e a página de destino que fazem esse primeiro toque valer a pena."
      />

      <OutrasFerramentas atual={F.slug} />
    </PageShellClaro>
  );
}

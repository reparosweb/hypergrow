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
            Coletamos os dados que você informa voluntariamente em nossos formulários: nome, e-mail,
            telefone e a mensagem que você escrever. Se você usar o diagnóstico da página inicial e
            optar por receber o plano, guardamos também o e-mail informado e o resultado do
            questionário. Registramos ainda o navegador utilizado no envio, para identificar
            preenchimentos automatizados.
          </p>
          <p className="pg-p">
            As ferramentas gratuitas do site (calculadoras e geradores) funcionam inteiramente no seu
            navegador: os valores digitados nelas não são enviados nem armazenados por nós.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 40 }}>Por que tratamos (base legal)</h2>
          <p className="pg-p">
            O tratamento segue a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados). Os dados de
            contato são tratados com base no seu <b>consentimento</b> e para <b>procedimentos
            preliminares de contrato</b> a seu pedido (art. 7º, incisos I e V). Cookies de medição
            dependem de consentimento, solicitado no aviso exibido na primeira visita.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 40 }}>Cookies e medição</h2>
          <p className="pg-p">
            Usamos Google Analytics e Google Tag Manager para entender como o site é utilizado. Eles
            só passam a gravar cookies e a receber dados identificáveis <b>depois que você aceita</b>
            {" "}no aviso de cookies — se você recusar, o site continua funcionando normalmente e
            apenas medições agregadas, sem cookie, são realizadas. Você pode mudar de ideia limpando
            os dados do site no seu navegador, o que faz o aviso aparecer novamente.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 40 }}>Com quem compartilhamos</h2>
          <p className="pg-p">
            Não vendemos seus dados e não os compartilhamos para marketing de terceiros. Utilizamos
            os seguintes operadores para prestar o serviço: <b>Supabase</b> (armazenamento dos
            contatos), <b>Vercel</b> (hospedagem do site), <b>Google</b> (medição de audiência),
            <b> OpenAI</b> (assistente de conversação do site — o conteúdo que você escreve no chat é
            processado por ele) e <b>Resend</b> (envio de e-mails). Parte desses serviços processa
            dados fora do Brasil; a transferência ocorre com base nas hipóteses previstas na LGPD
            para execução de contrato e cumprimento de finalidade legítima.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 40 }}>Por quanto tempo guardamos</h2>
          <p className="pg-p">
            Dados de contato comercial ficam armazenados enquanto durar o relacionamento e por até
            5 anos após o último contato, prazo compatível com a prescrição de pretensões comerciais.
            Você pode pedir a exclusão antes disso a qualquer momento.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 40 }}>Seus direitos</h2>
          <p className="pg-p">
            A LGPD garante a você: confirmação de que tratamos seus dados, acesso, correção,
            anonimização ou exclusão, portabilidade, informação sobre compartilhamentos e revogação
            do consentimento. Para exercer qualquer um deles, use o formulário da página de contato —
            é o canal que cai direto no nosso painel e o único que garantimos responder em até 1 dia
            útil. Responderemos no prazo legal.
          </p>

          <h2 className="pg-h2" style={{ marginTop: 40 }}>Encarregado (DPO)</h2>
          <p className="pg-p">
            O responsável pelo tratamento de dados na HyperGrow atende pelo mesmo canal de contato
            indicado acima. Assim que nosso endereço de e-mail institucional estiver ativo, ele será
            publicado aqui.
          </p>

          <p className="pg-small" style={{ marginTop: 34 }}>Última atualização: 8 de agosto de 2026.</p>
        </div>
      </section>
    </PageShellClaro>
  );
}

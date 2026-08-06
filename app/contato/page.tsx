import "../claro-tokens.css";
import type { Metadata } from "next";
import PageShellClaro, { Check } from "@/components/site/PageShellClaro";
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
    <PageShellClaro crumbs={[{ label: "Início", href: "/" }, { label: "Contato" }]}>
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
                  <span aria-hidden className="pg-num">{String(i + 1).padStart(2, "0")}</span>
                  <span><strong style={{ color: "var(--ink)", fontWeight: 600 }}>{t}.</strong> {d}</span>
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
            <p className="pg-small" style={{ marginTop: 34 }}>
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

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </PageShellClaro>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ⚠️ SOBRESCRITA DO FORMULÁRIO — dívida declarada, não solução definitiva.

   `components/site/ContactForm.tsx` (dono: outro agente nesta rodada) tem TODAS
   as cores em estilo INLINE e foi escrito para o tema escuro: texto `#fff`,
   fundo `rgba(255,255,255,0.04)`, rótulos `rgba(255,255,255,0.7)`. Dentro do
   tema claro isso vira BRANCO SOBRE BRANCO — o formulário sumia por completo,
   e ele é o único canal de conversão que realmente funciona no site.

   Como estilo inline só perde para `!important`, as regras abaixo usam
   `!important` de propósito, escopadas em `.ct-form` para não vazar para
   nenhum outro lugar. Isso resolve o problema HOJE, mas o certo é o dono do
   ContactForm trocar os estilos inline por classes (ou por variáveis de tema).
   Está reportado.
   ──────────────────────────────────────────────────────────────────────────── */
const CSS = `
  .cl .ct-grid { display: grid; grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    gap: clamp(28px, 4vw, 52px); align-items: start; }
  .cl .ct-form { position: sticky; top: 108px; }
  @media (max-width: 900px) {
    .cl .ct-grid { grid-template-columns: 1fr !important; }
    .cl .ct-form { position: static; }
  }

  /* cartão */
  .cl .ct-form > div { background: var(--card) !important; border: 1px solid var(--line) !important;
    box-shadow: var(--sh-2) !important; }
  /* rótulos e textos */
  .cl .ct-form label { color: var(--ink-2) !important; }
  .cl .ct-form h3 { color: var(--ink) !important; }
  .cl .ct-form p { color: var(--ink-2) !important; }
  /* o vermelho de erro do tema escuro (#E0736A) mede 2,9:1 sobre branco */
  .cl .ct-form p[role="alert"] { color: #B3261E !important; }
  /* campos */
  .cl .ct-form input, .cl .ct-form select, .cl .ct-form textarea {
    color: var(--ink) !important; background: #fff !important; border-color: var(--line) !important; }
  .cl .ct-form input::placeholder, .cl .ct-form textarea::placeholder { color: #7C8698 !important; }
  .cl .ct-form input:focus, .cl .ct-form select:focus, .cl .ct-form textarea:focus {
    border-color: var(--brand) !important; box-shadow: 0 0 0 3px rgba(21,80,232,.16) !important; }
  /* o marcador de sucesso vinha em jade (tema escuro) */
  .cl .ct-form [role="status"] > span { background: linear-gradient(135deg, var(--brand), #5B3CFF) !important;
    box-shadow: 0 14px 34px -14px rgba(21,80,232,.7) !important; }
  /* botão de envio: a classe btn-cta não existe no tema claro — vira o rosa primário.
     (sem crases neste comentário: ele vive dentro de um template literal, e uma
     crase aqui fecharia a string no meio — foi o que quebrou o build antes) */
  .cl .ct-form .btn-cta { background: var(--cta) !important; color: #fff !important;
    border-color: transparent !important; box-shadow: 0 12px 28px -14px rgba(224,22,95,.7) !important; }
  .cl .ct-form .btn-cta:hover { background: var(--cta-d) !important; }
`;

import "../../claro-tokens.css";
import Link from "next/link";
import type { Metadata } from "next";
import PageShellClaro, { Arrow } from "@/components/site/PageShellClaro";
import { CLARO_PILLAR_ACCENT } from "@/components/claro/claroPillarAccent";
import ServiceGlyph from "@/components/site/ServiceGlyphs";
import { getService } from "@/lib/site-services";
import { pillarOf } from "@/lib/pillars";
import { SITE_URL } from "@/lib/seo";

/* /para/clinicas — página de VERTICAL, não de serviço.
   Diferença deliberada: um serviço mora em lib/site-services.ts e vira uma
   disciplina de marketing (SEO, tráfego, redes...). "Plano Clínicas" não é
   uma disciplina — é um PACOTE de serviços que já existem no catálogo,
   escolhido pra um público-alvo específico (saúde). Forçar isso dentro dos
   4 pilares (Vender/Atrair/Marca/IA) quebraria a lógica da taxonomia:
   decisão do dono, registrada aqui.

   Por isso esta página NÃO entra em lib/site-services.ts nem em
   lib/pillars.ts — ela cita e linka os serviços reais que a compõem, e usa a
   cor do pilar "Vender online" (o mesmo de criacao-de-site) só como tema
   visual, sem virar um 20º serviço na lista.

   Prova real, não promessa: o Agentop (agentop.com.br) é produto próprio da
   HyperGrow que já atende médico, dentista e clínica de estética hoje — é
   citado porque dá pra conferir clicando, não porque "deveria funcionar". */

const TITLE = "Plano Clínicas — pacote de crescimento para médicos, dentistas e estética";
const DESC =
  "Pacote de crescimento pra clínicas, consultórios e estética: site com agenda, tráfego pago e redes sociais, com o Agentop como prova real.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/para/clinicas` },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/para/clinicas`, type: "website", images: ["/media/launch-poster.png"] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const COMPOSTO = [
  { slug: "criacao-de-site", papel: "Site institucional com agendamento, prova social e formulário de contato — a base pra quem chega pesquisando." },
  { slug: "marketing-trafego", papel: "Tráfego pago segmentado pra sua região e pro seu horário de menor procura, não pro Brasil inteiro." },
  { slug: "redes-sociais", papel: "Presença constante no Instagram, com o tipo de conteúdo que gera confiança antes da primeira consulta." },
] as const;

const DORES: { dor: string; resolve: string }[] = [
  { dor: "Agenda vazia em horários específicos (fim de tarde, início de semana)", resolve: "Tráfego pago segmentado pra região e pro horário certo, não anúncio genérico pro Brasil inteiro." },
  { dor: "Paciente novo pesquisa e não encontra (ou encontra um site fraco)", resolve: "Site profissional com agendamento, prova real e SEO local — a primeira impressão antes da consulta." },
  { dor: "Instagram parado ou só com foto de bastidor, sem gerar agendamento", resolve: "Calendário editorial e conteúdo com CTA direto pra marcar consulta, não só engajamento por engajamento." },
  { dor: "Recepção perde ligação e ninguém retorna o paciente depois", resolve: "Agenda e CRM do Agentop registrando cada contato, sem depender de alguém lembrar de ligar de volta." },
  { dor: "Paciente marca e falta sem avisar, furando a agenda do dia", resolve: "Confirmação e lembrete automático de consulta, também pelo Agentop." },
  { dor: "Não dá pra saber quanto cada paciente novo custou pra chegar", resolve: "Financeiro integrado do Agentop cruzando atendimento com o que foi investido em tráfego." },
];

export default function ClinicasPage() {
  // tema visual: mesma cor de "Vender online" no tema claro
  const cor = CLARO_PILLAR_ACCENT[pillarOf("criacao-de-site").key];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/para/clinicas`,
        name: TITLE,
        description: DESC,
        url: `${SITE_URL}/para/clinicas`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Para clínicas", item: `${SITE_URL}/para/clinicas` },
        ],
      },
    ],
  };

  return (
    <PageShellClaro crumbs={[{ label: "Início", href: "/" }, { label: "Para clínicas" }]} accent={cor}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Para médicos, dentistas e clínicas de estética</span>
          <h1 className="pg-h1">Um pacote de crescimento<br />pra quem cuida de gente.</h1>
          <p className="pg-lede">
            Consultório e clínica pequena costumam viver de indicação e sorte: agenda cheia num
            mês, vazia no outro, sem controle sobre por que isso acontece. O Plano Clínicas
            existe pra dar previsibilidade a isso — mais gente encontrando você quando pesquisa,
            mais confiança antes da primeira consulta e menos horário vago na agenda.
          </p>
        </div>
      </section>

      {/* ── O QUE É (combinação, não serviço novo) ──────────────────────────── */}
      <section className="sec">
        <div className="wrap">
          <h2 className="pg-h2">Não é um serviço novo — é a combinação certa</h2>
          <p className="pg-p">
            O Plano Clínicas não é uma disciplina nova no nosso catálogo. É uma combinação de
            três serviços que já existem, aplicados especificamente ao contexto de quem atende
            paciente — onde confiança pesa mais do que em quase qualquer outro segmento, e onde
            um horário vago às terças de manhã custa caro de verdade.
          </p>

          <div className="pg-grid" style={{ marginTop: 24 }}>
            {COMPOSTO.map((c) => {
              const cp = CLARO_PILLAR_ACCENT[pillarOf(c.slug).key];
              const svc = getService(c.slug);
              return (
                <Link key={c.slug} href={`/servicos/${c.slug}`} className="pg-card" style={{ ["--acc" as string]: cp }}>
                  <span aria-hidden style={{ display: "block", color: cp, marginBottom: 12 }}>
                    <ServiceGlyph slug={c.slug} height={48} />
                  </span>
                  <h3 className="pg-card-t">{svc?.title ?? c.slug}</h3>
                  <p className="pg-card-d">{c.papel}</p>
                  <span className="pg-card-go">Ver serviço <Arrow /></span>
                </Link>
              );
            })}
          </div>

          <p className="pg-p" style={{ marginTop: 28 }}>
            E tem uma prova por trás disso que dá pra conferir clicando, não só uma promessa: o{" "}
            <a href="https://agentop.com.br" target="_blank" rel="noopener noreferrer" style={{ color: "var(--acc)", textDecoration: "none", fontWeight: 600 }}>
              Agentop
            </a>{" "}
            — agenda, CRM e financeiro num sistema só — é produto próprio da HyperGrow e já
            atende médicos, dentistas e clínicas de estética hoje. Não estamos dizendo que
            tecnologia para saúde "deveria funcionar" para o seu consultório; é um sistema que já
            opera dentro de clínicas de verdade, e é a peça que fecha o pacote depois que o site,
            o tráfego e as redes trazem o paciente até você.
          </p>
        </div>
      </section>

      {/* ── TABELA: dor → o que resolve ─────────────────────────────────── */}
      <section className="sec">
        <div className="wrap">
          <h2 className="pg-h2">Dor comum de clínica pequena — e o que resolve</h2>
          <div className="pg-tablewrap" style={{ marginTop: 20 }}>
            <table className="pg-table">
              <caption>Baseado em problemas reais de agenda e captação de clínicas pequenas, não em lista genérica.</caption>
              <thead>
                <tr>
                  <th scope="col">Dor comum da clínica</th>
                  <th scope="col">O que resolve</th>
                </tr>
              </thead>
              <tbody>
                {DORES.map((d) => (
                  <tr key={d.dor}>
                    <th scope="row">{d.dor}</th>
                    <td>{d.resolve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
      <section className="sec">
        <div className="wrap">
          <div className="pg-cta">
            <h2 className="pg-h2">Quer ver isso aplicado na sua clínica?</h2>
            <p className="pg-p">
              Conte o tipo de atendimento e a região em uma frase. Em até 1 dia útil você recebe
              um diagnóstico e a proposta do que resolve primeiro.
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

import "../hg-tokens.css";
import "../hg-styles.css";
import Link from "next/link";
import type { Metadata } from "next";
import PageShell, { Check } from "@/components/site/PageShell";
import { StackedShowcase } from "@/components/site/DeviceMockup";
import { PROJECTS } from "@/lib/projects";
import { SITE_URL } from "@/lib/seo";

/* /sobre — a página que faltava.
   Antes, "Sobre" era só uma âncora dentro da home (#sobre). Uma âncora não é uma
   página: não tem título próprio, não tem URL para citar, e nenhuma IA consegue
   responder "quem é a HyperGrow?" apontando para ela.

   Tudo aqui é verificável — a tabela lista produtos que estão NO AR, com link.
   Nada de número inventado: a auditoria já tinha removido depoimentos falsos do
   site e o mesmo critério vale aqui. */

const TITLE = "Sobre a HyperGrow — quem constrói, o que já está no ar";
const DESC =
  "A HyperGrow constrói, publica e opera produtos digitais. Conheça os projetos que estão no ar, como trabalhamos e por que operamos o que entregamos.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/sobre` },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/sobre`, type: "website", images: ["/media/launch-poster.png"] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const PROCESSO = [
  ["Diagnóstico", "Entendemos a operação, as metas e os gargalos antes de propor qualquer solução."],
  ["Planejamento", "Desenhamos a estratégia, o escopo e o roadmap — você aprova antes de começar."],
  ["Desenvolvimento", "Construímos com tecnologia atual, IA e automação por padrão."],
  ["Implantação", "Colocamos no ar, integramos e treinamos a equipe para usar."],
  ["Crescimento", "Monitoramos, otimizamos e escalamos o que já está rodando."],
];

export default function SobrePage() {
  const proprios = PROJECTS.filter((p) => p.own);
  const clientes = PROJECTS.filter((p) => !p.own);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/sobre`,
        name: TITLE,
        description: DESC,
        url: `${SITE_URL}/sobre`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Sobre", item: `${SITE_URL}/sobre` },
        ],
      },
    ],
  };

  return (
    <PageShell crumbs={[{ label: "Início", href: "/" }, { label: "Sobre" }]} accent="#D3B78E" rail="#C4763C" glow="rgba(196,118,60,0.22)">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Sobre</span>
          <h1 className="pg-h1">Um estúdio que opera,<br />não só desenha.</h1>
          <p className="pg-lede">
            A maior parte das agências entrega um arquivo e vai embora. A HyperGrow constrói,
            publica e continua operando — inclusive produtos próprios, que sustentamos com o
            nosso próprio dinheiro e a nossa própria reputação.
          </p>
        </div>
      </section>

      {/* Produto real dentro de moldura real: as telas abaixo são screenshots dos
          nossos produtos NO AR, não mockup ilustrativo. É a prova antes do texto. */}
      <section className="sec" style={{ paddingTop: "clamp(34px, 4vw, 52px)", paddingBottom: 0 }}>
        <div className="wrap">
          <StackedShowcase
            browserSrc="/portfolio/agentop.webp"
            browserAlt="Painel do Agentop: agenda, CRM e financeiro num sistema só"
            phoneSrc="/portfolio/nutri.webp"
            phoneAlt="NutriSnap estimando calorias a partir da foto do prato"
            title="agentop.com.br"
            priority
          />
        </div>
      </section>

      <section className="sec" style={{ paddingBottom: "clamp(36px, 4.5vw, 56px)" }}>
        <div className="wrap">
          <h2 className="pg-h2">Por que isso muda o resultado</h2>
          <p className="pg-p">
            Quem só entrega projeto nunca descobre o que quebra no mês três: o checkout que
            recusa cartão, o formulário que para de enviar, a automação que duplica mensagem.
            Quem <strong>opera</strong> descobre — e já chega no seu projeto sabendo.
          </p>
          <p className="pg-p">
            Os produtos listados abaixo são nossos. Cada um passou por pagamento real,
            usuário real e erro real em produção. É desse repertório que sai o que aplicamos
            no projeto de um cliente, e é por isso que não vendemos mockup: vendemos coisa
            que já teve que funcionar.
          </p>
          <p className="pg-p">
            Trabalhamos com uma régua só, do produto próprio ao projeto de cliente: nível
            premium, mobile antes de desktop, velocidade medida (não estimada) e automação
            onde a tarefa é repetitiva.
          </p>
        </div>
      </section>

      {/* ── TABELA: produtos próprios ─────────────────────────────────────── */}
      <section className="sec" style={{ paddingTop: 0, paddingBottom: "clamp(36px, 4.5vw, 56px)" }}>
        <div className="wrap">
          <h2 className="pg-h2">Produtos próprios da HyperGrow</h2>
          <div className="pg-tablewrap">
            <table className="pg-table">
              <caption>Produtos construídos e operados pela HyperGrow. Os que têm link estão no ar agora — pode conferir.</caption>
              <thead>
                <tr>
                  <th scope="col">Produto</th>
                  <th scope="col">O que resolve</th>
                  <th scope="col">Situação</th>
                </tr>
              </thead>
              <tbody>
                {proprios.map((p) => (
                  <tr key={p.id}>
                    <th scope="row" style={{ whiteSpace: "nowrap" }}>{p.name}</th>
                    <td>{p.desc}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--acc)", textDecoration: "none", fontWeight: 600 }}>
                          No ar ↗
                        </a>
                      ) : (
                        <span style={{ color: "rgba(232,226,217,0.45)" }}>Uso interno</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CLIENTES ──────────────────────────────────────────────────────── */}
      <section className="sec" style={{ paddingTop: 0, paddingBottom: "clamp(36px, 4.5vw, 56px)" }}>
        <div className="wrap">
          <h2 className="pg-h2">Projetos de clientes no ar</h2>
          <p className="pg-p">
            Todos publicados e acessíveis — abra e confira antes de falar com a gente.
          </p>
          <div className="pg-grid" style={{ marginTop: 20 }}>
            {clientes.map((p) => (
              <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="pg-card">
                <h3 className="pg-h3">{p.name}</h3>
                <p style={{ font: "400 13.5px/1.55 var(--font-sans)", color: "rgba(232,226,217,0.6)", margin: 0 }}>{p.desc}</p>
                <span className="pg-card-go">Ver no ar ↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO TRABALHAMOS ──────────────────────────────────────────────── */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          {/* Fotografia real (StockSnap, CC0 1.0 — créditos em public/fotos/CREDITOS.json).
              Ilustra o método, NÃO é uma foto do time da HyperGrow: apresentar gente de
              banco de imagem como sendo o nosso time seria mentir para o visitante. */}
          <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", aspectRatio: "16/6", background: "#171B20", border: "1px solid rgba(232,226,217,0.09)", marginBottom: 34 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fotos/reuniao-projeto.webp" alt="Planejamento de projeto sobre a mesa, com anotações e notebooks abertos" width={960} height={640} loading="lazy" decoding="async"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
            <span aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(13,16,19,0.30), rgba(13,16,19,0.72))" }}></span>
          </div>

          <h2 className="pg-h2">Como trabalhamos</h2>
          <ol className="pg-list" style={{ marginTop: 18, counterReset: "step" }}>
            {PROCESSO.map(([t, d], i) => (
              <li key={t} style={{ alignItems: "flex-start" }}>
                <span aria-hidden className="mono" style={{ flexShrink: 0, minWidth: 26, color: "var(--acc)", font: "600 13px var(--font-mono)", paddingTop: 3 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <strong style={{ color: "#fff", fontWeight: 600 }}>{t}.</strong>{" "}
                  {d}
                </span>
              </li>
            ))}
          </ol>

          <h2 className="pg-h2" style={{ marginTop: 48 }}>O que você pode cobrar da gente</h2>
          <ul className="pg-list" style={{ marginTop: 18 }}>
            {[
              "Proposta clara antes de começar: escopo, prazo e investimento por escrito.",
              "Primeira versão funcional no menor tempo possível — não seis meses de silêncio.",
              "Domínio, hospedagem, certificado e monitoramento por nossa conta.",
              "Garantia após a entrega e plano de evolução contínua para o que está no ar.",
            ].map((t) => (
              <li key={t}><Check />{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="glass-top" style={{ borderRadius: 24, padding: "clamp(32px, 5vw, 56px)", textAlign: "center", background: "radial-gradient(120% 120% at 50% -20%, rgba(196,118,60,0.26), rgba(23,27,32,0.6) 55%, rgba(13,16,19,0.7))", border: "1px solid rgba(196,118,60,0.3)" }}>
            <h2 className="pg-h2" style={{ marginBottom: 12 }}>Quer ver isso aplicado no seu negócio?</h2>
            <p className="pg-p" style={{ margin: "0 auto 26px", maxWidth: "min(52ch, 100%)" }}>
              Conte a situação em uma frase. Em até 1 dia útil você recebe um diagnóstico e a
              proposta do que resolve.
            </p>
            <Link href="/contato" className="btn btn-cta">Falar com a HyperGrow</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

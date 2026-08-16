import "../claro-tokens.css";
import Link from "next/link";
import type { Metadata } from "next";
import PageShellClaro, { Check } from "@/components/site/PageShellClaro";
import { CLARO_PILLAR_ACCENT } from "@/components/claro/claroPillarAccent";
import { StackedShowcase } from "@/components/site/DeviceMockup";
import { PROJECTS } from "@/lib/projects";
import { SITE_URL, ogImagens } from "@/lib/seo";

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
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/sobre`, type: "website", images: ogImagens("sobre") },
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
    // `midia` era `marca` até 2026-08-07 (pilares viraram departamentos, ver
    // lib/pillars.ts). Mesma cor rosa de antes — só a chave mudou de nome.
    <PageShellClaro crumbs={[{ label: "Início", href: "/" }, { label: "Sobre" }]} accent={CLARO_PILLAR_ACCENT.midia}>
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
            /* 2026-08-07: trocado sorteio.webp (print DESKTOP, 800x500 paisagem)
               por sorteio-mobile.webp — o dono reportou "está cortando". Causa:
               PhoneFrame recorta com object-fit:cover numa caixa 9/19 retrato;
               cortar uma imagem PAISAGEM até 9/19 sobra só a faixa central
               estreita, cortando o título ("PARE DE APOSTAR no palpite.") ao
               meio. sorteio-mobile.webp já É um print de celular de verdade
               (emulação mobile real, não a versão desktop encolhida), então o
               mesmo corte 9/19 agora tira só uma margem fina dos dois lados —
               o título inteiro continua visível. Print REAL, não o card de
               marca: nutri.webp é um card desenhado (o app renderiza em branco
               para capturador) e dentro da moldura de celular virava uma tela
               verde chapada — parecia defeito. */
            phoneSrc="/portfolio/sorteio-mobile.webp"
            phoneAlt="Sorteio Bilionário IA aberto no celular, tela de gerar combinação"
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
                        <span style={{ color: "#5A6579" }}>Uso interno</span>
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
              <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="pg-card lit">
                <h3 className="pg-card-t">{p.name}</h3>
                <p className="pg-card-d">{p.desc}</p>
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
          {/* Sem véu escuro aqui: não há texto sobre esta foto, e um degradê
              preto de 72% no meio de uma página clara lia como mancha. */}
          <div className="pg-media" style={{ marginBottom: 34 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fotos/reuniao-projeto.webp" alt="Planejamento de projeto sobre a mesa, com anotações e notebooks abertos" width={960} height={640} loading="lazy" decoding="async"
              style={{ objectPosition: "center 40%" }} />
          </div>

          <h2 className="pg-h2">Como trabalhamos</h2>
          <ol className="pg-list" style={{ marginTop: 18, counterReset: "step" }}>
            {PROCESSO.map(([t, d], i) => (
              <li key={t} style={{ alignItems: "flex-start" }}>
                <span aria-hidden className="pg-num">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{t}.</strong>{" "}
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
          <div className="pg-cta">
            <h2 className="pg-h2">Quer ver isso aplicado no seu negócio?</h2>
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

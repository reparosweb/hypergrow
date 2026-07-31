import "../hg-tokens.css";
import "../hg-styles.css";
import Link from "next/link";
import type { Metadata } from "next";
import { siteServices, PILLARS, pillarOf } from "@/lib/site-services";
import ServiceGlyph from "@/components/site/ServiceGlyphs";
import PageShell, { Arrow } from "@/components/site/PageShell";
import { SITE_URL } from "@/lib/seo";

/* HUB DE SERVIÇOS — /servicos
   Esta rota NÃO existia: dava 404. Duas consequências reais, medidas na
   auditoria de SEO:
   · o BreadcrumbList das 19 páginas de serviço apontava para "/#servicos", uma
     ÂNCORA da home — o Google trata isso como a própria home, então as 19
     páginas não tinham página-pai de verdade;
   · não havia nenhuma página que reunisse as 19 num só lugar, que é o formato
     que mais concentra autoridade e o que uma IA lê para responder "o que a
     HyperGrow faz?".

   Também é onde entra a PRIMEIRA TABELA do site (a auditoria apontou zero
   tabelas como a maior lacuna de AEO — tabela é o formato que IA mais cita). */

const TITLE = "Serviços — HyperGrow";
const DESC =
  "Os 19 serviços da HyperGrow em 4 frentes: vender online, atrair demanda, marca e conteúdo, e operar com IA. Veja qual resolve o seu problema.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/servicos` },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/servicos`, type: "website", images: ["/media/launch-poster.png"] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

/* Quando escolher cada frente — escrito a partir do que os serviços de cada
   pilar realmente entregam (nada inventado; é a mesma promessa das 19 páginas). */
const WHEN: Record<string, string> = {
  vender: "Você já tem (ou quer ter) um canal de venda próprio e ele não converte, é lento ou ainda não existe.",
  atrair: "O canal existe e funciona, mas não chega gente suficiente — ou chega gente que não compra.",
  marca: "Sua comunicação não parece do tamanho do que você entrega: foto, vídeo, marca e redes fora do padrão.",
  ia: "A equipe perde tempo com tarefa repetitiva e cliente fica sem resposta fora do horário comercial.",
};

export default function ServicosHub() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/servicos`,
        name: "Serviços da HyperGrow",
        description: DESC,
        url: `${SITE_URL}/servicos`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Serviços", item: `${SITE_URL}/servicos` },
        ],
      },
      {
        "@type": "ItemList",
        name: "Serviços da HyperGrow",
        numberOfItems: siteServices.length,
        itemListElement: siteServices.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: s.title,
          url: `${SITE_URL}/servicos/${s.slug}`,
        })),
      },
    ],
  };

  return (
    <PageShell crumbs={[{ label: "Início", href: "/" }, { label: "Serviços" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="sec" style={{ paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Catálogo completo</span>
          <h1 className="pg-h1">
            {siteServices.length} serviços,<br />
            4 frentes, uma operação só
          </h1>
          <p className="pg-lede">
            A HyperGrow não vende peça solta. Cada serviço abaixo existe para resolver um
            problema específico de quem vende — e todos conversam entre si na mesma operação.
            Comece pela frente que descreve a sua situação hoje.
          </p>
        </div>
      </section>

      {/* Faixa fotográfica: fotografia real (StockSnap, CC0 1.0 — uso comercial
          liberado, créditos em public/fotos/CREDITOS.json). Contexto do cliente,
          não "nosso escritório" — o que seria falso. */}
      <section className="sec" style={{ paddingTop: "clamp(30px, 4vw, 46px)", paddingBottom: 0 }}>
        <div className="wrap">
          <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "16/6", background: "#171B20", border: "1px solid rgba(232,226,217,0.09)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fotos/embalando-pedido.webp" alt="Pedido sendo embalado sobre a bancada de uma operação de e-commerce" width={960} height={641} loading="lazy" decoding="async"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 45%" }} />
            <span aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg, rgba(13,16,19,0.92) 0%, rgba(13,16,19,0.62) 46%, rgba(13,16,19,0.18) 100%)" }}></span>
            <p style={{ position: "absolute", left: "clamp(20px, 4vw, 44px)", bottom: "clamp(18px, 3vw, 34px)", right: "clamp(20px, 4vw, 44px)", margin: 0, maxWidth: "min(46ch, 100%)", font: "500 clamp(15px, 1.7vw, 20px)/1.45 var(--font-display)", letterSpacing: "-0.015em", color: "#fff", textWrap: "pretty" }}>
              Todo serviço aqui termina no mesmo lugar: mais pedido saindo pela porta.
            </p>
          </div>
        </div>
      </section>

      {/* ── TABELA: qual frente resolve o quê ─────────────────────────────── */}
      <section className="sec" style={{ paddingBottom: "clamp(40px, 5vw, 60px)" }}>
        <div className="wrap">
          <h2 className="pg-h2">Qual frente resolve o seu problema</h2>
          <div className="pg-tablewrap">
            <table className="pg-table">
              <caption>As 4 frentes da HyperGrow, o que cada uma resolve e por onde começar.</caption>
              <thead>
                <tr>
                  <th scope="col">Frente</th>
                  <th scope="col">Escolha esta quando…</th>
                  <th scope="col">Serviços</th>
                  <th scope="col">Comece por</th>
                </tr>
              </thead>
              <tbody>
                {PILLARS.map((p) => {
                  const first = siteServices.find((s) => s.slug === p.slugs[0]);
                  return (
                    <tr key={p.key}>
                      <th scope="row" style={{ whiteSpace: "nowrap" }}>
                        <span aria-hidden style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: p.rail, marginRight: 9 }} />
                        {p.label}
                      </th>
                      <td>{WHEN[p.key]}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{p.slugs.length}</td>
                      <td>
                        {first && (
                          <Link href={`/servicos/${first.slug}`} style={{ color: p.accent, textDecoration: "none", fontWeight: 600 }}>
                            {first.title}
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── UM BLOCO POR PILAR ────────────────────────────────────────────── */}
      {PILLARS.map((p) => {
        const list = siteServices.filter((s) => p.slugs.includes(s.slug));
        return (
          <section key={p.key} className="sec" style={{ paddingTop: 0, paddingBottom: "clamp(40px, 5vw, 62px)" }}>
            <div className="wrap">
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                <span aria-hidden style={{ width: 3, height: 30, borderRadius: 2, background: p.rail, flexShrink: 0 }} />
                <h2 className="pg-h2" style={{ margin: 0 }} id={p.key}>{p.label}</h2>
              </div>
              <p className="pg-p" style={{ marginLeft: 17 }}>{p.desc}</p>
              <div className="pg-grid" style={{ marginTop: 20 }}>
                {list.map((s) => (
                  <Link key={s.slug} href={`/servicos/${s.slug}`} className="pg-card" style={{ ["--acc" as string]: pillarOf(s.slug).accent }}>
                    <span aria-hidden style={{ display: "block", color: p.accent, marginBottom: 12 }}>
                      <ServiceGlyph slug={s.slug} height={52} />
                    </span>
                    <h3 className="pg-h3">{s.title}</h3>
                    <p style={{ font: "400 13.5px/1.55 var(--font-sans)", color: "rgba(232,226,217,0.6)", margin: 0 }}>{s.desc}</p>
                    <span className="pg-card-go" style={{ color: p.accent }}>Ver serviço <Arrow /></span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="glass-top" style={{ borderRadius: 24, padding: "clamp(32px, 5vw, 56px)", textAlign: "center", background: "radial-gradient(120% 120% at 50% -20%, rgba(11,122,76,0.30), rgba(23,27,32,0.6) 55%, rgba(13,16,19,0.7))", border: "1px solid rgba(11,122,76,0.32)" }}>
            <h2 className="pg-h2" style={{ marginBottom: 12 }}>Não sabe por onde começar?</h2>
            <p className="pg-p" style={{ margin: "0 auto 26px", maxWidth: "min(52ch, 100%)" }}>
              Descreva a situação em uma frase. Em até 1 dia útil você recebe um diagnóstico
              e a proposta do que resolve — sem compromisso.
            </p>
            <Link href="/contato" className="btn btn-cta">Solicitar diagnóstico</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

import "../claro-tokens.css";
import Link from "next/link";
import type { Metadata } from "next";
import { siteServices, PILLARS, type PillarKey } from "@/lib/site-services";
import ServiceGlyph from "@/components/site/ServiceGlyphs";
import PageShellClaro, { Arrow } from "@/components/site/PageShellClaro";
import { CLARO_PILLAR_ACCENT } from "@/components/claro/claroPillarAccent";
import { SITE_URL, ogImagens } from "@/lib/seo";

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
/* O número sai de `siteServices.length`, nunca escrito à mão: o texto dizia
   "Os 19 serviços" depois de o catálogo já ter 22 — número errado na descrição
   que aparece no Google. Contado, não estimado. */
/* A lista de departamentos sai de PILLARS, não digitada: quando eles passaram
   de 4 para 5 (2026-08-07), esta descrição continuaria anunciando ao Google
   "4 frentes: vender online, atrair demanda…" — nomes que não existem mais. */
const DESC =
  `Os ${siteServices.length} serviços da HyperGrow em ${PILLARS.length} departamentos: ${PILLARS.map((p) => p.label.toLowerCase()).join(", ")}. Veja qual resolve o seu problema.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/servicos` },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/servicos`, type: "website", images: ogImagens("servicos") },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

/* Quando escolher cada departamento — escrito a partir do que os serviços de
   cada um realmente entregam (nada inventado; é a mesma promessa das páginas).
   Tipado por `PillarKey`: se alguém mexer nos departamentos e esquecer daqui,
   o TypeScript acusa antes do build em vez de o site exibir texto vazio. */
const WHEN: Record<PillarKey, string> = {
  site: "Sua empresa não tem endereço próprio na internet — ou tem um que é lento, feio ou ninguém acha no Google.",
  ecommerce: "Você vende (ou quer vender) online e o processo trava: loja que não converte, marketplace sem margem, venda que não fecha.",
  marketing: "O canal existe e funciona, mas não chega gente suficiente — ou chega gente que não compra.",
  midia: "Sua comunicação não parece do tamanho do que você entrega: foto, vídeo, marca e redes fora do padrão.",
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
    <PageShellClaro crumbs={[{ label: "Início", href: "/" }, { label: "Serviços" }]}>
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
          <div className="pg-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fotos/embalando-pedido.webp" alt="Pedido sendo embalado sobre a bancada de uma operação de e-commerce" width={960} height={641} loading="lazy" decoding="async"
              style={{ objectPosition: "center 45%" }} />
            {/* O véu escuro fica: é o que dá contraste ao texto SOBRE a foto
                (branco sobre a foto crua não passa 4,5:1 em nenhum recorte). */}
            <span aria-hidden className="pg-media-scrim"></span>
            <p className="pg-media-cap">
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
                  /* Cor da frente no tema CLARO. `p.accent`/`p.rail` de
                     lib/pillars.ts são jade/cobre, calibrados contra o canvas
                     escuro: sobre papel branco medem menos de 2:1. */
                  const cor = CLARO_PILLAR_ACCENT[p.key];
                  return (
                    <tr key={p.key}>
                      <th scope="row" style={{ whiteSpace: "nowrap" }}>
                        <span aria-hidden style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: cor, marginRight: 9 }} />
                        {p.label}
                      </th>
                      <td>{WHEN[p.key]}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{p.slugs.length}</td>
                      <td>
                        {first && (
                          <Link href={`/servicos/${first.slug}`} style={{ color: cor, textDecoration: "none", fontWeight: 600 }}>
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
        const cor = CLARO_PILLAR_ACCENT[p.key];
        return (
          <section key={p.key} className="sec" style={{ paddingTop: 0, paddingBottom: "clamp(40px, 5vw, 62px)" }}>
            <div className="wrap">
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                <span aria-hidden style={{ width: 3, height: 30, borderRadius: 2, background: cor, flexShrink: 0 }} />
                <h2 className="pg-h2" style={{ margin: 0 }} id={p.key}>{p.label}</h2>
              </div>
              <p className="pg-p" style={{ marginLeft: 17 }}>{p.desc}</p>
              <div className="pg-grid" style={{ marginTop: 20 }}>
                {list.map((s) => (
                  <Link key={s.slug} href={`/servicos/${s.slug}`} className="pg-card lit" style={{ ["--acc" as string]: cor }}>
                    <span aria-hidden style={{ display: "block", color: cor, marginBottom: 12 }}>
                      <ServiceGlyph slug={s.slug} height={52} />
                    </span>
                    <h3 className="pg-card-t">{s.title}</h3>
                    <p className="pg-card-d">{s.desc}</p>
                    <span className="pg-card-go">Ver serviço <Arrow /></span>
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
          <div className="pg-cta">
            <h2 className="pg-h2">Não sabe por onde começar?</h2>
            <p className="pg-p">
              Descreva a situação em uma frase. Em até 1 dia útil você recebe um diagnóstico
              e a proposta do que resolve — sem compromisso.
            </p>
            <div className="pg-cta-actions">
              <Link href="/contato" className="btn btn-p">Solicitar diagnóstico</Link>
              <Link href="/sobre" className="btn btn-s">Ver projetos no ar</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShellClaro>
  );
}

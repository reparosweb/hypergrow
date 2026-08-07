import "../../claro-tokens.css";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts, getPost, type BlogPost } from "@/lib/blog-posts";
import { getService, pillarOf } from "@/lib/site-services";
import { CLARO_PILLAR_ACCENT } from "@/components/claro/claroPillarAccent";
import PageShellClaro from "@/components/site/PageShellClaro";
import { SITE_URL } from "@/lib/seo";

/* /blog/[slug] — migrado do tema escuro para o shell claro.

   O artigo perdeu o próprio <main>, o próprio fundo, a própria barra de
   progresso e o próprio rodapé: tudo isso agora vem de `PageShellClaro`, igual
   às outras rotas. O que continua daqui é o que é específico de artigo — a
   medida de leitura, o índice lateral fixo e o acordeão de FAQ.

   SEO preservado integralmente: generateStaticParams, generateMetadata,
   Article + BreadcrumbList + FAQPage. */

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPost(params.slug);
  if (!p) return { title: "Artigo — HyperGrow" };
  const title = `${p.title} — HyperGrow`;
  return {
    title,
    description: p.description,
    alternates: { canonical: `${SITE_URL}/blog/${p.slug}` },
    openGraph: {
      title,
      description: p.description,
      url: `${SITE_URL}/blog/${p.slug}`,
      type: "article",
      publishedTime: p.date,
      images: ["/media/launch-poster.png"],
    },
    twitter: { card: "summary_large_image", title, description: p.description },
  };
}

function fmtDate(iso: string) {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

/** Tempo de leitura estimado a partir do corpo real do post (200 palavras/min). */
function readingTime(p: BlogPost) {
  const text = [p.intro, ...p.body.flatMap((b) => [b.h, b.p])].join(" ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Âncora estável a partir do título da seção (sem acento, sem símbolo). */
function anchor(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* Cor da frente no tema CLARO — a do tema escuro (jade/cobre) mede menos de
   2:1 sobre papel branco. Mesmo mapa que a home usa no mega-menu. */
function tone(p: BlogPost) {
  const pil = pillarOf(p.related[0] ?? "");
  return { label: pil.label, cor: CLARO_PILLAR_ACCENT[pil.key] };
}

const CSS = `
  .cl .hgb-meta { font: 400 11.5px var(--code); letter-spacing: .07em; color: #5A6579; text-transform: uppercase; }
  .cl .hgb-tag { display: inline-flex; align-items: center; gap: 7px; font: 600 10.5px var(--code);
    letter-spacing: .14em; text-transform: uppercase; padding: 6px 12px; border-radius: 999px;
    color: var(--acc); background: var(--acc-soft); border: 1px solid var(--acc-line); }

  /* ── resumo / resposta direta ── */
  .cl .hgb-lead { position: relative; overflow: hidden; margin-top: 30px; max-width: 760px; border-radius: 18px;
    padding: 24px 26px 26px; background: var(--card); border: 1px solid var(--line); box-shadow: var(--sh-1); }
  .cl .hgb-lead-bar { position: absolute; top: 0; bottom: 0; left: 0; width: 3px;
    background: linear-gradient(180deg, var(--acc), transparent); }
  .cl .hgb-lead p { font: 400 clamp(17px,1.3vw,19px)/1.68 var(--text); color: var(--ink); margin: 12px 0 0;
    max-width: 62ch; text-wrap: pretty; }

  /* ── medida de leitura ── */
  .cl .hgb-shell { display: grid; gap: 34px; }
  .cl .hgb-body { min-width: 0; max-width: 640px; }
  .cl .hgb-block + .hgb-block { margin-top: 36px; padding-top: 36px; border-top: 1px solid var(--line-2); }
  .cl .hgb-h2 { display: flex; gap: 13px; align-items: baseline; text-wrap: balance;
    font: 700 clamp(20px,2.4vw,27px)/1.22 var(--disp); letter-spacing: -.025em; color: var(--ink);
    margin: 0 0 14px; scroll-margin-top: 112px; }
  .cl .hgb-idx { flex: none; font: 600 12px var(--code); letter-spacing: .08em; color: var(--acc); }
  .cl .hgb-p { font: 400 clamp(16.5px,1.25vw,17.5px)/1.78 var(--text); color: var(--ink-2); margin: 0;
    max-width: 66ch; text-wrap: pretty; }

  /* ── índice lateral (fixo só no desktop largo) ── */
  .cl .hgb-toc { align-self: start; border-radius: 16px; padding: 20px 20px 18px; background: var(--paper-2);
    border: 1px solid var(--line); }
  .cl .hgb-toc ol { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column;
    gap: 6px; counter-reset: toc; }
  .cl .hgb-toc li { counter-increment: toc; }
  /* min-height 44px (era 32px): o sumário é uma LISTA de links, não link
     inline dentro de um parágrafo — então vale o alvo mínimo de toque da
     WCAG 2.5.8. O padding vertical mantém o texto centrado quando ele cabe em
     uma linha só e ainda respira quando quebra em duas. */
  .cl .hgb-toc a { display: flex; gap: 10px; min-height: 44px; align-items: center; padding: 5px 0;
    font: 400 13.5px/1.45 var(--text); color: var(--ink-2); transition: color .25s var(--ease); }
  .cl .hgb-toc a::before { content: counter(toc, decimal-leading-zero); flex: none; font: 600 11px var(--code);
    color: #7C8698; padding-top: 2px; }
  .cl .hgb-toc a:hover { color: var(--acc); }
  .cl .hgb-toc a:hover::before { color: var(--acc); }
  @media (min-width: 1180px) {
    .cl .hgb-shell { grid-template-columns: minmax(0,1fr) 236px; gap: 54px; align-items: start; }
    .cl .hgb-body { grid-column: 1; grid-row: 1; }
    .cl .hgb-toc { grid-column: 2; grid-row: 1; position: sticky; top: 112px; }
  }

  /* ── FAQ ── */
  .cl .hgb-faq { border-radius: 16px; background: var(--card); border: 1px solid var(--line); padding: 0 22px;
    box-shadow: var(--sh-1); transition: border-color .3s var(--ease); }
  .cl .hgb-faq[open] { border-color: var(--acc-line); }
  .cl .hgb-faq summary { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
    cursor: pointer; list-style: none; min-height: 56px; padding: 18px 0;
    font: 600 15.5px/1.45 var(--text); color: var(--ink); }
  .cl .hgb-faq summary::-webkit-details-marker { display: none; }
  .cl .hgb-faq summary::after { content: ""; flex: none; width: 11px; height: 11px; margin-top: 6px;
    border-right: 2px solid var(--acc); border-bottom: 2px solid var(--acc); transform: rotate(45deg);
    transition: transform .3s var(--ease); }
  .cl .hgb-faq[open] summary::after { transform: rotate(-135deg); }
  .cl .hgb-faq p { font: 400 15.5px/1.7 var(--text); color: var(--ink-2); margin: 0; padding: 0 0 20px;
    max-width: 66ch; text-wrap: pretty; }

  /* ── navegação entre posts ── */
  .cl .hgb-next { display: grid; gap: 14px;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); }
  .cl .hgb-nextcard { position: relative; overflow: hidden; border-radius: 18px; padding: 22px; color: inherit;
    text-decoration: none; display: flex; flex-direction: column; gap: 10px; background: var(--card);
    border: 1px solid var(--line); box-shadow: var(--sh-1);
    transition: transform .3s var(--ease), box-shadow .3s var(--ease), border-color .3s var(--ease); }
  .cl .hgb-nextcard:hover, .cl .hgb-nextcard:focus-visible { transform: translateY(-3px); box-shadow: var(--sh-2);
    border-color: color-mix(in srgb, var(--beam, var(--brand)) 34%, var(--line)); }
  .cl .hgb-nextcard strong { font: 700 16.5px/1.32 var(--disp); letter-spacing: -.018em; color: var(--ink);
    text-wrap: balance; }
  .cl .hgb-arrow { transition: transform .35s var(--ease); }
  .cl a:hover .hgb-arrow { transform: translateX(4px); }

  /* ── etiqueta de serviço relacionado ── */
  .cl .hgb-rel { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 8px 14px;
    border-radius: 999px; border: 1px solid var(--line); background: var(--card); box-shadow: var(--sh-1);
    font: 500 14px var(--text); color: var(--ink-2); text-decoration: none;
    transition: border-color .25s var(--ease), color .25s var(--ease), transform .25s var(--ease); }
  .cl .hgb-rel:hover, .cl .hgb-rel:focus-visible { color: var(--ink); transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--beam, var(--brand)) 42%, var(--line)); }
  .cl .hgb-rel-dot { width: 7px; height: 7px; border-radius: 999px; background: var(--beam, var(--brand)); flex: none; }

  @media (prefers-reduced-motion: reduce) {
    .cl .hgb-arrow, .cl .hgb-faq summary::after { transition: none; }
    .cl .hgb-nextcard:hover, .cl .hgb-rel:hover { transform: none; }
  }
`;

function Arrow() {
  return (
    <svg className="hgb-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const p = getPost(params.slug);
  if (!p) notFound();

  const t = tone(p);
  const mins = readingTime(p);
  const related = p.related.map((slug) => getService(slug)).filter(Boolean) as NonNullable<ReturnType<typeof getService>>[];
  const others = blogPosts.filter((o) => o.slug !== p.slug).slice(0, 2);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: p.title,
        description: p.description,
        datePublished: p.date,
        dateModified: p.date,
        inLanguage: "pt-BR",
        keywords: p.keyword,
        author: { "@type": "Organization", name: "HyperGrow", url: SITE_URL },
        publisher: { "@type": "Organization", name: "HyperGrow", url: SITE_URL },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${p.slug}` },
        image: `${SITE_URL}/media/launch-poster.png`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: p.title, item: `${SITE_URL}/blog/${p.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: p.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <PageShellClaro
      crumbs={[{ label: "Início", href: "/" }, { label: "Blog", href: "/blog" }, { label: p.title }]}
      accent={t.cor}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <article>
        {/* ── abertura ─────────────────────────────────────────────────────── */}
        <section className="sec" style={{ paddingTop: 34, paddingBottom: 0 }}>
          <div className="wrap pg-in" style={{ maxWidth: 1010 }}>
            <h1 className="pg-h1" style={{ maxWidth: "20ch" }}>{p.title}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
              <span className="hgb-tag">{p.category}</span>
              <span className="hgb-meta">{fmtDate(p.date)}</span>
              <span aria-hidden className="hgb-meta">·</span>
              <span className="hgb-meta">{mins} min de leitura</span>
              <span aria-hidden className="hgb-meta">·</span>
              <span className="hgb-meta">{t.label}</span>
            </div>

            {/* resumo / resposta direta */}
            <div className="hgb-lead">
              <span aria-hidden className="hgb-lead-bar" />
              <span className="hgb-meta" style={{ letterSpacing: "0.16em", color: "var(--acc)" }}>Resumo</span>
              <p>{p.intro}</p>
            </div>
          </div>
        </section>

        {/* ── corpo + índice ───────────────────────────────────────────────── */}
        <section className="sec" style={{ paddingTop: 44, paddingBottom: 0 }}>
          <div className="wrap hgb-shell" style={{ maxWidth: 1010 }}>
            <aside className="hgb-toc">
              <span className="hgb-meta" style={{ letterSpacing: "0.16em" }}>Neste artigo</span>
              <ol>
                {p.body.map((b) => (
                  <li key={b.h}><a href={`#${anchor(b.h)}`}>{b.h}</a></li>
                ))}
              </ol>
            </aside>

            <div className="hgb-body">
              {p.body.map((b, i) => (
                <div className="hgb-block" key={b.h}>
                  <h2 className="hgb-h2" id={anchor(b.h)}>
                    <span className="hgb-idx" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                    <span>{b.h}</span>
                  </h2>
                  <p className="hgb-p">{b.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </article>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="sec" style={{ paddingTop: 56, paddingBottom: 0 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <hr className="hairline" />
          <h2 className="pg-h2" style={{ margin: "40px 0 22px" }}>Perguntas frequentes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {p.faq.map((f) => (
              <details key={f.q} className="hgb-faq lit">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + serviços relacionados ────────────────────────────────────── */}
      <section className="sec" style={{ paddingTop: 48, paddingBottom: 0 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="pg-cta">
            <h2 className="pg-h2">Quer isso feito por especialistas?</h2>
            <p className="pg-p">
              A HyperGrow coloca no ar e opera. Receba uma proposta sob medida em até 1 dia útil.
            </p>
            <div className="pg-cta-actions">
              <Link href="/contato" className="btn btn-p">Solicitar orçamento</Link>
              <Link href="/servicos" className="btn btn-s">Ver todos os serviços</Link>
            </div>
          </div>

          {related.length > 0 && (
            <div style={{ marginTop: 44 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
                <span className="hgb-meta" style={{ letterSpacing: "0.16em", flex: "none" }}>Serviços relacionados</span>
                <hr className="hairline" style={{ flex: 1 }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {related.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/servicos/${s.slug}`}
                    className="hgb-rel"
                    style={{ "--beam": CLARO_PILLAR_ACCENT[pillarOf(s.slug).key] } as CSSProperties}
                  >
                    <span aria-hidden className="hgb-rel-dot" />
                    {s.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── continue lendo ─────────────────────────────────────────────────── */}
      {others.length > 0 && (
        <section className="sec" style={{ paddingTop: 48 }}>
          <div className="wrap" style={{ maxWidth: 820 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
              <span className="hgb-meta" style={{ letterSpacing: "0.16em", flex: "none" }}>Continue lendo</span>
              <hr className="hairline" style={{ flex: 1 }} />
            </div>
            <div className="hgb-next">
              {others.map((o) => {
                const ot = tone(o);
                return (
                  <Link key={o.slug} href={`/blog/${o.slug}`} className="hgb-nextcard lit" style={{ "--beam": ot.cor } as CSSProperties}>
                    <span className="hgb-meta" style={{ color: ot.cor }}>{o.category}</span>
                    <strong>{o.title}</strong>
                    <span className="hgb-meta" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 2 }}>
                      {readingTime(o)} min <Arrow />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </PageShellClaro>
  );
}

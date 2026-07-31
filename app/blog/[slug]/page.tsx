import "../../hg-tokens.css";
import "../../hg-styles.css";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts, getPost, type BlogPost } from "@/lib/blog-posts";
import { getService, pillarOf } from "@/lib/site-services";
import { SITE_URL } from "@/lib/seo";

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

/* O `accent` bruto de alguns posts (ex.: #0B7A4C) não alcança contraste de texto
   sobre o canvas ink. O pilar do 1º serviço relacionado já é uma cor validada
   (piso 7:1) e amarra o artigo ao mesmo código de cores dos serviços. */
function tone(p: BlogPost) {
  return pillarOf(p.related[0] ?? "");
}

const CSS = `
.hgb-topbar { position: sticky; top: 0; z-index: 30; background: rgba(13,16,19,0.94); border-bottom: 1px solid rgba(232,226,217,0.07); }
.hgb-accent { background: linear-gradient(108deg,#4FCB9B 0%,#0B7A4C 42%,#D99461 100%); -webkit-background-clip: text; background-clip: text; color: transparent; text-shadow: 0 0 38px rgba(11,122,76,0.18); }
.hgb-meta { font: 400 11.5px var(--font-mono); letter-spacing: 0.07em; color: rgba(232,226,217,0.45); text-transform: uppercase; }
.hgb-tag { display: inline-flex; align-items: center; gap: 7px; font: 600 10.5px var(--font-mono); letter-spacing: 0.14em; text-transform: uppercase; padding: 6px 12px; border-radius: 999px; }

/* ── medida de leitura ───────────────────────────────────────────────────── */
.hgb-shell { display: grid; gap: 34px; }
.hgb-body { min-width: 0; max-width: 600px; }
.hgb-block + .hgb-block { margin-top: 36px; padding-top: 36px; border-top: 1px solid rgba(232,226,217,0.07); }
.hgb-h2 {
  display: flex; gap: 13px; align-items: baseline; text-wrap: balance;
  font: 700 clamp(20px,2.4vw,27px)/1.22 var(--font-display); letter-spacing: -0.025em;
  color: #fff; margin: 0 0 14px; scroll-margin-top: 92px;
}
.hgb-idx { flex: none; font: 500 12px var(--font-mono); letter-spacing: 0.08em; color: var(--acc); }
.hgb-p { font: 400 clamp(17px,1.25vw,18px)/1.78 var(--font-sans); color: rgba(232,226,217,0.76); margin: 0; max-width: 66ch; text-wrap: pretty; letter-spacing: 0.004em; }

/* ── índice lateral (sticky só no desktop largo) ─────────────────────────── */
.hgb-toc { align-self: start; border-radius: 16px; padding: 20px 20px 18px; background: linear-gradient(180deg, rgba(232,226,217,0.045), rgba(232,226,217,0.012)); border: 1px solid rgba(232,226,217,0.08); }
.hgb-toc ol { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 11px; counter-reset: toc; }
.hgb-toc li { counter-increment: toc; }
.hgb-toc a { display: flex; gap: 10px; font: 400 13.5px/1.45 var(--font-sans); color: rgba(232,226,217,0.62); transition: color .25s ease; }
.hgb-toc a::before { content: counter(toc,decimal-leading-zero); flex: none; font: 500 11px var(--font-mono); color: rgba(232,226,217,0.3); padding-top: 2px; }
.hgb-toc a:hover { color: #fff; }
.hgb-toc a:hover::before { color: var(--acc); }
@media (min-width: 1180px) {
  .hgb-shell { grid-template-columns: minmax(0,1fr) 236px; gap: 54px; align-items: start; }
  .hgb-body { grid-column: 1; grid-row: 1; }
  .hgb-toc { grid-column: 2; grid-row: 1; position: sticky; top: 96px; }
}

/* ── FAQ ─────────────────────────────────────────────────────────────────── */
.hgb-faq { border-radius: 16px; background: rgba(232,226,217,0.028); border: 1px solid rgba(232,226,217,0.08); padding: 0 22px; transition: border-color .3s ease, background .3s ease; }
.hgb-faq[open] { background: rgba(232,226,217,0.045); border-color: rgba(232,226,217,0.14); }
.hgb-faq summary { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; cursor: pointer; list-style: none; padding: 18px 0; font: 600 15.5px/1.45 var(--font-sans); color: #fff; }
.hgb-faq summary::-webkit-details-marker { display: none; }
.hgb-faq summary::after { content: ''; flex: none; width: 11px; height: 11px; margin-top: 6px; border-right: 2px solid var(--acc); border-bottom: 2px solid var(--acc); transform: rotate(45deg); transition: transform .3s cubic-bezier(0.16,1,0.3,1); }
.hgb-faq[open] summary::after { transform: rotate(-135deg); }
.hgb-faq p { font: 400 15px/1.7 var(--font-sans); color: rgba(232,226,217,0.72); margin: 0; padding: 0 0 20px; max-width: 66ch; text-wrap: pretty; }

/* ── navegação entre posts ───────────────────────────────────────────────── */
.hgb-next { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); }
.hgb-nextcard { position: relative; overflow: hidden; border-radius: 18px; padding: 22px; color: inherit; display: flex; flex-direction: column; gap: 10px; }
.hgb-nextcard strong { font: 700 16.5px/1.32 var(--font-display); letter-spacing: -0.018em; color: #fff; text-wrap: balance; }
.hgb-arrow { transition: transform .35s cubic-bezier(0.34,1.32,0.42,1); }
a:hover > .hgb-arrow, a:hover .hgb-arrow { transform: translateX(4px); }
a.pill { cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .hgb-arrow, .hgb-faq summary::after { transition: none; } }
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
    <main style={{ minHeight: "100vh", position: "relative", "--acc": t.accent } as CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", background: `radial-gradient(68% 46% at 14% -8%, ${t.accent}1f, transparent 62%), radial-gradient(62% 42% at 94% 4%, rgba(196,118,60,0.1), transparent 62%), #0D1013` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <header className="hgb-topbar">
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, height: 68 }}>
          <Link href="/" style={{ font: "700 18px var(--font-display)", letterSpacing: "-0.04em", color: "#fff" }}>
            Hyper<span className="hgb-accent">Grow</span>
          </Link>
          <Link href="/#contato" className="btn btn-cta" style={{ padding: "10px 18px", fontSize: 14, borderRadius: 12 }}>Solicitar orçamento</Link>
        </div>
      </header>

      <article>
        {/* ── abertura ─────────────────────────────────────────────────────── */}
        <section className="sec" style={{ paddingTop: 40, paddingBottom: 0 }}>
          <div className="wrap" style={{ maxWidth: 1010 }}>
            <nav style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Link href="/blog" className="hgb-meta" style={{ color: "rgba(232,226,217,0.58)" }}>Blog</Link>
              <span aria-hidden className="hgb-meta" style={{ color: "rgba(232,226,217,0.25)" }}>/</span>
              <span className="hgb-meta" style={{ color: t.accent }}>{p.category}</span>
            </nav>

            <h1 style={{ font: "800 clamp(29px,4.4vw,50px)/1.08 var(--font-display)", letterSpacing: "-0.035em", color: "#fff", margin: "20px 0 0", textWrap: "balance", maxWidth: "20ch" }}>{p.title}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
              <span className="hgb-tag" style={{ color: t.accent, background: `${t.accent}18`, border: `1px solid ${t.accent}3d` }}>{t.label}</span>
              <span className="hgb-meta">{fmtDate(p.date)}</span>
              <span aria-hidden className="hgb-meta" style={{ color: "rgba(232,226,217,0.25)" }}>·</span>
              <span className="hgb-meta">{mins} min de leitura</span>
            </div>

            {/* lead / resposta direta */}
            <div style={{ position: "relative", marginTop: 30, maxWidth: 760, borderRadius: 18, padding: "24px 26px 26px", overflow: "hidden", background: `linear-gradient(180deg, ${t.accent}0f, rgba(232,226,217,0.02))`, border: "1px solid rgba(232,226,217,0.09)" }}>
              <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 3, background: `linear-gradient(180deg, ${t.accent}, ${t.rail} 60%, transparent)` }} />
              <span className="hgb-meta" style={{ letterSpacing: "0.16em", color: t.accent }}>Resumo</span>
              <p style={{ font: "400 clamp(17px,1.3vw,19px)/1.68 var(--font-sans)", color: "rgba(232,226,217,0.88)", margin: "12px 0 0", maxWidth: "62ch", textWrap: "pretty" }}>{p.intro}</p>
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
          <h2 style={{ font: "700 clamp(22px,3vw,31px) var(--font-display)", color: "#fff", margin: "40px 0 22px", letterSpacing: "-0.028em", textWrap: "balance" }}>Perguntas frequentes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {p.faq.map((f) => (
              <details key={f.q} className="hgb-faq">
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
          <div className="neon-card glass-top" style={{ position: "relative", borderRadius: 26, padding: "clamp(36px,5vw,52px) clamp(24px,4vw,40px)", textAlign: "center", overflow: "hidden", background: `radial-gradient(120% 130% at 50% -25%, ${t.accent}2e, rgba(23,27,32,0.72) 52%, rgba(13,16,19,0.85))`, border: "1px solid rgba(232,226,217,0.1)" }}>
            <h2 style={{ font: "800 clamp(23px,3.3vw,35px)/1.12 var(--font-display)", letterSpacing: "-0.03em", color: "#fff", margin: 0, maxWidth: 560, marginInline: "auto", textWrap: "balance" }}>Quer isso feito por especialistas?</h2>
            <p style={{ font: "400 clamp(15px,1.2vw,16.5px)/1.62 var(--font-sans)", color: "rgba(232,226,217,0.7)", margin: "14px auto 0", maxWidth: "46ch", textWrap: "pretty" }}>A HyperGrow coloca no ar e opera. Receba uma proposta sob medida em até 1 dia útil.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
              <Link href="/#contato" className="btn btn-cta">Solicitar orçamento</Link>
              <Link href="/#servicos" className="btn btn-ghost">Ver todos os serviços</Link>
            </div>
          </div>

          {related.length > 0 && (
            <div style={{ marginTop: 44 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
                <span className="hgb-meta" style={{ letterSpacing: "0.16em", flex: "none" }}>Serviços relacionados</span>
                <hr className="hairline" style={{ flex: 1 }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {related.map((s) => {
                  const sp = pillarOf(s.slug);
                  return (
                    <Link key={s.slug} href={`/servicos/${s.slug}`} className="pill" style={{ borderColor: `${sp.accent}3d`, color: "rgba(232,226,217,0.86)" }}>
                      <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: sp.accent, boxShadow: `0 0 8px ${sp.accent}` }} />
                      {s.title}
                    </Link>
                  );
                })}
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
                  <Link key={o.slug} href={`/blog/${o.slug}`} className="glowcard hgb-nextcard" style={{ "--cardglow": ot.glow } as CSSProperties}>
                    <span className="hgb-meta" style={{ color: ot.accent }}>{o.category}</span>
                    <strong>{o.title}</strong>
                    <span className="hgb-meta" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 2 }}>{readingTime(o)} min <Arrow /></span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <footer style={{ borderTop: "1px solid rgba(232,226,217,0.08)" }}>
        <div className="wrap" style={{ paddingTop: 24, paddingBottom: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, font: "400 13px var(--font-sans)", color: "rgba(232,226,217,0.45)" }}>
          <span>© 2026 HyperGrow</span>
          <Link href="/blog" style={{ color: "rgba(232,226,217,0.62)" }}>← Todos os artigos</Link>
        </div>
      </footer>
    </main>
  );
}

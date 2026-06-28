import "../../hg-tokens.css";
import "../../hg-styles.css";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts, getPost } from "@/lib/blog-posts";
import { getService } from "@/lib/site-services";
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

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const p = getPost(params.slug);
  if (!p) notFound();

  const related = p.related.map((slug) => getService(slug)).filter(Boolean) as NonNullable<ReturnType<typeof getService>>[];

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
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", background: `radial-gradient(70% 50% at 15% -5%, ${p.accent}22, transparent 60%), radial-gradient(70% 45% at 92% 8%, rgba(255,45,122,0.12), transparent 60%), #050b1a` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
        <Link href="/" style={{ font: "700 18px var(--font-display)", letterSpacing: "-0.04em", color: "#fff" }}>
          Hyper<span style={{ background: "linear-gradient(120deg,#4d8bff,#5b3cff 55%,#FF2D7A)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Grow</span>
        </Link>
        <Link href="/#contato" className="btn btn-cta" style={{ padding: "10px 18px", fontSize: 14, borderRadius: 12 }}>Solicitar orçamento</Link>
      </div>

      {/* hero */}
      <article>
        <section className="sec" style={{ paddingTop: 40, paddingBottom: 0 }}>
          <div className="wrap" style={{ maxWidth: 800 }}>
            <Link href="/blog" style={{ font: "500 13px var(--font-sans)", color: "rgba(255,255,255,0.6)" }}>← Blog</Link>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <span style={{ font: "600 11px var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase", color: p.accent, padding: "5px 11px", borderRadius: 999, background: `${p.accent}1a`, border: `1px solid ${p.accent}40` }}>{p.category}</span>
              <span style={{ font: "400 13px var(--font-sans)", color: "rgba(255,255,255,0.45)" }}>{fmtDate(p.date)}</span>
            </div>
            <h1 style={{ font: "800 clamp(30px,4.6vw,52px)/1.07 var(--font-display)", letterSpacing: "-0.035em", color: "#fff", margin: "18px 0 0", textWrap: "balance" }}>{p.title}</h1>
            <p style={{ font: "500 19px/1.65 var(--font-sans)", color: "rgba(255,255,255,0.82)", margin: "22px 0 0", textWrap: "pretty", borderLeft: `3px solid ${p.accent}`, paddingLeft: 18 }}>{p.intro}</p>
          </div>
        </section>

        {/* corpo */}
        <section className="sec" style={{ paddingTop: 36 }}>
          <div className="wrap" style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 30 }}>
            {p.body.map((b) => (
              <div key={b.h}>
                <h2 style={{ font: "700 clamp(20px,2.6vw,27px) var(--font-display)", color: "#fff", margin: "0 0 12px", letterSpacing: "-0.02em" }}>{b.h}</h2>
                <p style={{ font: "400 16.5px/1.75 var(--font-sans)", color: "rgba(255,255,255,0.76)", margin: 0, textWrap: "pretty" }}>{b.p}</p>
              </div>
            ))}
          </div>
        </section>
      </article>

      {/* FAQ */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 800 }}>
          <h2 style={{ font: "700 clamp(22px,3vw,32px) var(--font-display)", color: "#fff", margin: "0 0 22px", letterSpacing: "-0.025em" }}>Perguntas frequentes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {p.faq.map((f) => (
              <details key={f.q} className="neon-card" style={{ borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "0 22px" }}>
                <summary style={{ cursor: "pointer", listStyle: "none", padding: "18px 0", font: "600 16px var(--font-sans)", color: "#fff" }}>{f.q}</summary>
                <p style={{ font: "400 14.5px/1.65 var(--font-sans)", color: "rgba(255,255,255,0.72)", margin: 0, padding: "0 0 18px" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + serviços relacionados */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 800 }}>
          <div className="neon-card" style={{ position: "relative", borderRadius: 28, padding: "48px 36px", textAlign: "center", overflow: "hidden", background: `radial-gradient(120% 120% at 50% -20%, ${p.accent}3a, rgba(13,33,71,0.6) 55%, rgba(8,16,36,0.7))`, border: "1px solid rgba(91,60,255,0.35)" }}>
            <h2 style={{ font: "800 clamp(24px,3.4vw,36px)/1.1 var(--font-display)", letterSpacing: "-0.03em", color: "#fff", margin: 0, maxWidth: 560, marginInline: "auto", textWrap: "balance" }}>Quer isso feito por especialistas?</h2>
            <p style={{ font: "400 16px/1.6 var(--font-sans)", color: "rgba(255,255,255,0.72)", margin: "14px auto 0", maxWidth: 460 }}>A HyperGrow coloca no ar e opera. Receba uma proposta sob medida em até 1 dia útil.</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
              <Link href="/#contato" className="btn btn-cta">Solicitar orçamento</Link>
            </div>
          </div>

          {related.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <h3 style={{ font: "600 14px var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Serviços relacionados</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {related.map((s) => (
                  <Link key={s.slug} href={`/servicos/${s.slug}`} className="pill" style={{ textDecoration: "none" }}>{s.title}</Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="wrap" style={{ padding: "24px 32px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, font: "400 13px var(--font-sans)", color: "rgba(255,255,255,0.45)" }}>
          <span>© 2026 HyperGrow</span>
          <Link href="/blog" style={{ color: "rgba(255,255,255,0.6)" }}>← Todos os artigos</Link>
        </div>
      </footer>
    </main>
  );
}

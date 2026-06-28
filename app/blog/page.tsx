import "../hg-tokens.css";
import "../hg-styles.css";
import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog — HyperGrow",
  description:
    "Guias práticos sobre criação de site, e-commerce, tráfego, SEO, IA e automação para fazer o seu negócio crescer. Conteúdo da HyperGrow.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "Blog — HyperGrow", description: "Guias práticos sobre tecnologia, e-commerce, marketing e IA.", url: `${SITE_URL}/blog`, type: "website" },
};

function fmtDate(iso: string) {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function BlogPage() {
  const posts = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", background: "radial-gradient(70% 50% at 15% -5%, rgba(21,101,255,0.18), transparent 60%), radial-gradient(70% 45% at 92% 8%, rgba(255,45,122,0.14), transparent 60%), #050b1a" }} />

      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
        <Link href="/" style={{ font: "700 18px var(--font-display)", letterSpacing: "-0.04em", color: "#fff" }}>
          Hyper<span style={{ background: "linear-gradient(120deg,#4d8bff,#5b3cff 55%,#FF2D7A)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Grow</span>
        </Link>
        <Link href="/#contato" className="btn btn-cta" style={{ padding: "10px 18px", fontSize: 14, borderRadius: 12 }}>Solicitar orçamento</Link>
      </div>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="eyebrow"><span className="dot" style={{ background: "#34e1ff", boxShadow: "0 0 10px #34e1ff" }} />Blog</div>
          <h1 style={{ font: "800 clamp(34px,5vw,58px)/1.04 var(--font-display)", letterSpacing: "-0.04em", color: "#fff", margin: "16px 0 0", textWrap: "balance", maxWidth: 820 }}>
            Guias para o seu negócio <span className="accent">crescer</span> no digital
          </h1>
          <p style={{ font: "400 18px/1.6 var(--font-sans)", color: "rgba(255,255,255,0.72)", margin: "18px 0 0", maxWidth: 620 }}>
            Conteúdo prático sobre criação de site, e-commerce, tráfego, SEO, redes e inteligência artificial — direto ao ponto, com dados reais.
          </p>

          <div style={{ marginTop: 44, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 20 }}>
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="glowcard neon-card" style={{ borderRadius: 20, padding: 26, display: "flex", flexDirection: "column", color: "inherit", minHeight: 230, position: "relative", overflow: "hidden" }}>
                <div aria-hidden style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: `radial-gradient(circle, ${p.accent}33, transparent 68%)`, pointerEvents: "none" }} />
                <span style={{ alignSelf: "flex-start", font: "600 11px var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase", color: p.accent, padding: "5px 11px", borderRadius: 999, background: `${p.accent}1a`, border: `1px solid ${p.accent}40` }}>{p.category}</span>
                <h2 style={{ font: "700 21px/1.25 var(--font-display)", letterSpacing: "-0.02em", color: "#fff", margin: "16px 0 10px" }}>{p.title}</h2>
                <p style={{ font: "400 14.5px/1.6 var(--font-sans)", color: "rgba(255,255,255,0.6)", margin: 0, flex: 1 }}>{p.description}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18 }}>
                  <span style={{ font: "400 12.5px var(--font-sans)", color: "rgba(255,255,255,0.45)" }}>{fmtDate(p.date)}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "600 13px var(--font-sans)", color: p.accent }}>Ler artigo →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="wrap" style={{ padding: "24px 32px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, font: "400 13px var(--font-sans)", color: "rgba(255,255,255,0.45)" }}>
          <span>© 2026 HyperGrow</span>
          <Link href="/" style={{ color: "rgba(255,255,255,0.6)" }}>Voltar ao site →</Link>
        </div>
      </footer>
    </main>
  );
}

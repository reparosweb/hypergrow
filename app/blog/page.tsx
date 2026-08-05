import "../hg-tokens.css";
import "../hg-styles.css";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { blogPosts, type BlogPost } from "@/lib/blog-posts";
import { pillarOf } from "@/lib/site-services";
import { SITE_URL } from "@/lib/seo";
import SiteHeader from "@/components/site/SiteHeader";

export const metadata: Metadata = {
  title: "Blog — HyperGrow",
  description:
    "Guias práticos sobre criação de site, e-commerce, tráfego, SEO, IA e automação para fazer o seu negócio crescer. Conteúdo da HyperGrow.",
  alternates: { canonical: "/blog" },
  // `images` é obrigatório aqui: no App Router o objeto `openGraph` do filho
  // SUBSTITUI o do pai inteiro (não faz merge campo a campo), então sem esta
  // linha /blog era a única página do site sem og:image — link compartilhado
  // saía sem imagem nenhuma.
  openGraph: { title: "Blog — HyperGrow", description: "Guias práticos sobre tecnologia, e-commerce, marketing e IA.", url: `${SITE_URL}/blog`, type: "website", images: ["/media/launch-poster.png"] },
};

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

/* O `accent` bruto de alguns posts (ex.: #0B7A4C) não alcança contraste de texto
   sobre o canvas ink. O pilar do 1º serviço relacionado já é uma cor validada
   (piso 7:1) e amarra o blog ao mesmo código de cores dos serviços. */
function tone(p: BlogPost) {
  return pillarOf(p.related[0] ?? "");
}

const CSS = `
.hgb-topbar { position: sticky; top: 0; z-index: 30; background: rgba(13,16,19,0.94); border-bottom: 1px solid rgba(232,226,217,0.07); }
.hgb-accent { background: linear-gradient(108deg,#4FCB9B 0%,#0B7A4C 42%,#D99461 100%); -webkit-background-clip: text; background-clip: text; color: transparent; text-shadow: 0 0 38px rgba(11,122,76,0.18); }
.hgb-rail { position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 20px 20px 0 0; pointer-events: none; z-index: 4; }
.hgb-tag { display: inline-flex; align-items: center; gap: 7px; align-self: flex-start; font: 600 10.5px var(--font-mono); letter-spacing: 0.14em; text-transform: uppercase; padding: 6px 12px; border-radius: 999px; }
.hgb-meta { font: 400 11.5px var(--font-mono); letter-spacing: 0.06em; color: rgba(232,226,217,0.42); text-transform: uppercase; }
.hgb-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); }
.hgb-card { position: relative; overflow: hidden; display: flex; flex-direction: column; border-radius: 20px; padding: 28px 26px 24px; min-height: 250px; color: inherit; }
.hgb-card h2 { font: 700 clamp(19px,1.6vw,21.5px)/1.28 var(--font-display); letter-spacing: -0.022em; color: #fff; margin: 16px 0 10px; text-wrap: balance; }
.hgb-card p { font: 400 14.5px/1.62 var(--font-sans); color: rgba(232,226,217,0.6); margin: 0; flex: 1; text-wrap: pretty; }
.hgb-feat { position: relative; overflow: hidden; display: grid; border-radius: 26px; color: inherit; }
.hgb-feat-visual { display: none; }
@media (min-width: 900px) {
  .hgb-feat { grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr); }
  .hgb-feat-visual { display: flex; flex-direction: column; justify-content: flex-end; gap: 14px; padding: 34px; border-left: 1px solid rgba(232,226,217,0.07); }
}
.hgb-go { display: inline-flex; align-items: center; gap: 7px; font: 600 13px var(--font-sans); }
.hgb-go svg { transition: transform .35s cubic-bezier(0.34,1.32,0.42,1); }
.hgb-card:hover .hgb-go svg, .hgb-feat:hover .hgb-go svg { transform: translateX(4px); }
`;

function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function BlogPage() {
  const posts = [...blogPosts].sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));
  const [featured, ...rest] = posts;
  const fp = tone(featured);

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", background: "radial-gradient(70% 50% at 12% -8%, rgba(15,169,104,0.16), transparent 62%), radial-gradient(64% 44% at 94% 6%, rgba(196,118,60,0.11), transparent 62%), #0D1013" }} />

      {/* Header ÚNICO do site — ver nota em app/blog/[slug]/page.tsx. */}
      <SiteHeader />

      <section className="sec" style={{ paddingTop: 46, paddingBottom: 0 }}>
        <div className="wrap">
          <div className="eyebrow"><span className="dot" />Blog</div>
          <h1 style={{ font: "800 clamp(33px,5vw,56px)/1.05 var(--font-display)", letterSpacing: "-0.04em", color: "#fff", margin: "18px 0 0", textWrap: "balance", maxWidth: 860 }}>
            Guias para o seu negócio <span className="hgb-accent">crescer</span> no digital
          </h1>
          <p style={{ font: "400 clamp(16px,1.3vw,18px)/1.62 var(--font-sans)", color: "rgba(232,226,217,0.62)", margin: "20px 0 0", maxWidth: "62ch", textWrap: "pretty" }}>
            Conteúdo prático sobre criação de site, e-commerce, tráfego, SEO, redes e inteligência artificial — direto ao ponto, com dados reais.
          </p>
          <div className="hgb-meta" style={{ marginTop: 22 }}>
            {posts.length} {posts.length === 1 ? "artigo publicado" : "artigos publicados"}
          </div>
        </div>
      </section>

      {/* Destaque — o post mais recente ganha peso próprio */}
      <section className="sec" style={{ paddingTop: 34, paddingBottom: 0 }}>
        <div className="wrap">
          <Link href={`/blog/${featured.slug}`} className="glowcard neon-card hgb-feat" style={{ "--cardglow": fp.glow } as CSSProperties}>
            <span aria-hidden className="hgb-rail" style={{ background: `linear-gradient(90deg, ${fp.rail}, ${fp.accent} 40%, transparent 92%)`, borderRadius: "26px 26px 0 0" }} />
            <div aria-hidden style={{ position: "absolute", top: -70, right: -50, width: "min(280px,70%)", height: 280, background: `radial-gradient(circle, ${fp.accent}26, transparent 68%)`, pointerEvents: "none" }} />

            <div style={{ padding: "clamp(28px,3.4vw,40px)", display: "flex", flexDirection: "column", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span className="hgb-tag" style={{ color: fp.accent, background: `${fp.accent}18`, border: `1px solid ${fp.accent}3d` }}>{featured.category}</span>
                <span className="hgb-meta">Em destaque</span>
              </div>
              <h2 style={{ font: "800 clamp(25px,3.1vw,38px)/1.13 var(--font-display)", letterSpacing: "-0.032em", color: "#fff", margin: "18px 0 0", textWrap: "balance" }}>{featured.title}</h2>
              <p style={{ font: "400 clamp(15px,1.15vw,16.5px)/1.68 var(--font-sans)", color: "rgba(232,226,217,0.66)", margin: "16px 0 0", maxWidth: "58ch", textWrap: "pretty" }}>{featured.description}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 26 }}>
                <span className="hgb-go" style={{ color: fp.accent }}>Ler o artigo <Arrow /></span>
                <span className="hgb-meta">{fmtDate(featured.date)} · {readingTime(featured)} min</span>
              </div>
            </div>

            <div className="hgb-feat-visual" aria-hidden>
              <span className="stat-num" style={{ fontSize: 56, lineHeight: 1 }}>{readingTime(featured)}</span>
              <span className="hgb-meta" style={{ letterSpacing: "0.16em" }}>min de leitura</span>
              <hr className="hairline" style={{ margin: "6px 0" }} />
              <span className="hgb-meta" style={{ color: "rgba(232,226,217,0.34)" }}>{fp.label}</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Demais artigos */}
      <section className="sec" style={{ paddingTop: 44 }}>
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}>
            <span className="hgb-meta" style={{ letterSpacing: "0.16em", color: "rgba(232,226,217,0.5)", flex: "none" }}>Todos os artigos</span>
            <hr className="hairline" style={{ flex: 1 }} />
          </div>

          <div className="hgb-grid">
            {rest.map((p) => {
              const t = tone(p);
              return (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="glowcard neon-card hgb-card" style={{ "--cardglow": t.glow } as CSSProperties}>
                  <span aria-hidden className="hgb-rail" style={{ background: `linear-gradient(90deg, ${t.rail}, ${t.accent} 45%, transparent 95%)` }} />
                  <div aria-hidden style={{ position: "absolute", top: -60, right: -50, width: "min(180px,70%)", height: 180, background: `radial-gradient(circle, ${t.accent}22, transparent 68%)`, pointerEvents: "none" }} />
                  <span className="hgb-tag" style={{ color: t.accent, background: `${t.accent}18`, border: `1px solid ${t.accent}3d` }}>{p.category}</span>
                  <h2>{p.title}</h2>
                  <p>{p.description}</p>
                  <hr className="hairline" style={{ margin: "18px 0 14px" }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <span className="hgb-meta">{fmtDate(p.date)} · {readingTime(p)} min</span>
                    <span className="hgb-go" style={{ color: t.accent }}>Ler <Arrow /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(232,226,217,0.08)" }}>
        <div className="wrap" style={{ paddingTop: 24, paddingBottom: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, font: "400 13px var(--font-sans)", color: "rgba(232,226,217,0.45)" }}>
          <span>© 2026 HyperGrow</span>
          <Link href="/" style={{ color: "rgba(232,226,217,0.62)" }}>Voltar ao site →</Link>
        </div>
      </footer>
    </main>
  );
}

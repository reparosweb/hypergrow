import "../claro-tokens.css";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { blogPosts, type BlogPost } from "@/lib/blog-posts";
import { pillarOf } from "@/lib/site-services";
import { CLARO_PILLAR_ACCENT } from "@/components/claro/claroPillarAccent";
import PageShellClaro from "@/components/site/PageShellClaro";
import { SITE_URL } from "@/lib/seo";

/* /blog — migrado do tema escuro para o shell claro.

   Antes esta rota montava o próprio <main>, o próprio fundo `#0D1013` e o
   próprio rodapé de um link só. Agora usa `PageShellClaro`, o mesmo cabeçalho,
   trilha e rodapé das outras rotas — que era exatamente a queixa do dono
   ("cada página parece de um site diferente"). O conteúdo e o SEO são os
   mesmos; só a moldura e as cores mudaram. */

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

/* O `accent` bruto de cada post é a cor do tema ESCURO (jade/cobre) e mede
   menos de 2:1 sobre papel branco. A cor da frente no tema claro vem do mesmo
   mapa que a home usa no mega-menu — assim o blog fica no mesmo código de
   cores dos serviços, agora do lado certo do contraste. */
function tone(p: BlogPost) {
  const pil = pillarOf(p.related[0] ?? "");
  return { label: pil.label, cor: CLARO_PILLAR_ACCENT[pil.key] };
}

const CSS = `
  .cl .hgb-accent { background: linear-gradient(96deg, var(--brand), #5B3CFF 55%, var(--cta));
    -webkit-background-clip: text; background-clip: text; color: transparent; }
  .cl .hgb-meta { font: 400 11.5px var(--code); letter-spacing: .07em; color: #5A6579; text-transform: uppercase; }
  .cl .hgb-tag { display: inline-flex; align-items: center; gap: 7px; align-self: flex-start;
    font: 600 10.5px var(--code); letter-spacing: .14em; text-transform: uppercase; padding: 6px 12px;
    border-radius: 999px; }

  .cl .hgb-grid { display: grid; gap: 18px;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); }

  /* cartões: mesmo corpo do .pg-card, com a barra da frente no topo */
  .cl .hgb-card, .cl .hgb-feat { position: relative; overflow: hidden; color: inherit; text-decoration: none;
    background: var(--card); border: 1px solid var(--line); box-shadow: var(--sh-1);
    transition: transform .3s var(--ease), box-shadow .3s var(--ease), border-color .3s var(--ease); }
  .cl .hgb-card { display: flex; flex-direction: column; border-radius: 20px; padding: 28px 26px 24px;
    min-height: 250px; }
  .cl .hgb-feat { display: grid; border-radius: 26px; }
  .cl .hgb-card:hover, .cl .hgb-feat:hover, .cl .hgb-card:focus-visible, .cl .hgb-feat:focus-visible {
    transform: translateY(-3px); box-shadow: var(--sh-2);
    border-color: color-mix(in srgb, var(--beam, var(--brand)) 34%, var(--line)); }
  .cl .hgb-rail { position: absolute; top: 0; left: 0; right: 0; height: 3px; pointer-events: none; z-index: 4;
    background: linear-gradient(90deg, var(--beam, var(--brand)), transparent 82%); }

  .cl .hgb-card h2 { font: 700 clamp(19px, 1.6vw, 21.5px)/1.28 var(--disp); letter-spacing: -.022em;
    color: var(--ink); margin: 16px 0 10px; text-wrap: balance; transition: color .25s var(--ease); }
  .cl .hgb-card p { font: 400 14.5px/1.62 var(--text); color: var(--ink-2); margin: 0; flex: 1; text-wrap: pretty; }
  .cl .hgb-card:hover h2, .cl .hgb-card:focus-visible h2 { color: var(--beam, var(--brand)); }

  .cl .hgb-feat-visual { display: none; }
  @media (min-width: 900px) {
    .cl .hgb-feat { grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr); }
    .cl .hgb-feat-visual { display: flex; flex-direction: column; justify-content: flex-end; gap: 12px;
      padding: 34px; border-left: 1px solid var(--line-2); background: var(--paper-2); }
  }
  .cl .hgb-feat-n { font: 600 clamp(40px, 5vw, 58px)/1 var(--disp); letter-spacing: -.04em;
    color: var(--beam, var(--brand)); }

  .cl .hgb-go { display: inline-flex; align-items: center; gap: 7px; font: 600 13px var(--text);
    color: var(--beam, var(--brand)); }
  .cl .hgb-go svg { transition: transform .35s var(--ease); }
  .cl .hgb-card:hover .hgb-go svg, .cl .hgb-feat:hover .hgb-go svg { transform: translateX(4px); }

  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .cl .hgb-card { animation: pg-reveal-in linear both; animation-timeline: view();
        animation-range: entry 2% entry 55%; }
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cl .hgb-card:hover, .cl .hgb-feat:hover { transform: none; }
    .cl .hgb-go svg { transition: none; }
  }
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
    <PageShellClaro crumbs={[{ label: "Início", href: "/" }, { label: "Blog" }]}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="sec" style={{ paddingTop: 46, paddingBottom: 0 }}>
        <div className="wrap pg-in">
          <span className="pg-kicker">Blog</span>
          <h1 className="pg-h1" style={{ maxWidth: 860 }}>
            Guias para o seu negócio <span className="hgb-accent">crescer</span> no digital
          </h1>
          <p className="pg-lede">
            Conteúdo prático sobre criação de site, e-commerce, tráfego, SEO, redes e inteligência
            artificial — direto ao ponto, com dados reais.
          </p>
          <div className="hgb-meta" style={{ marginTop: 22 }}>
            {posts.length} {posts.length === 1 ? "artigo publicado" : "artigos publicados"}
          </div>
        </div>
      </section>

      {/* Destaque — o post mais recente ganha peso próprio */}
      <section className="sec" style={{ paddingTop: 34, paddingBottom: 0 }}>
        <div className="wrap">
          <Link href={`/blog/${featured.slug}`} className="hgb-feat" style={{ "--beam": fp.cor } as CSSProperties}>
            <span aria-hidden className="hgb-rail" />

            <div style={{ padding: "clamp(28px,3.4vw,40px)", display: "flex", flexDirection: "column", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span className="hgb-tag" style={{ color: fp.cor, background: `${fp.cor}14`, border: `1px solid ${fp.cor}38` }}>{featured.category}</span>
                <span className="hgb-meta">Em destaque</span>
              </div>
              <h2 style={{ font: "700 clamp(25px,3.1vw,38px)/1.13 var(--disp)", letterSpacing: "-0.032em", color: "var(--ink)", margin: "18px 0 0", textWrap: "balance" }}>{featured.title}</h2>
              <p style={{ font: "400 clamp(15px,1.15vw,16.5px)/1.68 var(--text)", color: "var(--ink-2)", margin: "16px 0 0", maxWidth: "58ch", textWrap: "pretty" }}>{featured.description}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 26 }}>
                <span className="hgb-go">Ler o artigo <Arrow /></span>
                <span className="hgb-meta">{fmtDate(featured.date)} · {readingTime(featured)} min</span>
              </div>
            </div>

            <div className="hgb-feat-visual" aria-hidden>
              <span className="hgb-feat-n">{readingTime(featured)}</span>
              <span className="hgb-meta" style={{ letterSpacing: "0.16em" }}>min de leitura</span>
              <hr className="hairline" style={{ margin: "6px 0" }} />
              <span className="hgb-meta">{fp.label}</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Demais artigos */}
      <section className="sec" style={{ paddingTop: 44 }}>
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}>
            <span className="hgb-meta" style={{ letterSpacing: "0.16em", flex: "none" }}>Todos os artigos</span>
            <hr className="hairline" style={{ flex: 1 }} />
          </div>

          <div className="hgb-grid">
            {rest.map((p) => {
              const t = tone(p);
              return (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="hgb-card" style={{ "--beam": t.cor } as CSSProperties}>
                  <span aria-hidden className="hgb-rail" />
                  <span className="hgb-tag" style={{ color: t.cor, background: `${t.cor}14`, border: `1px solid ${t.cor}38` }}>{p.category}</span>
                  <h2>{p.title}</h2>
                  <p>{p.description}</p>
                  <hr className="hairline" style={{ margin: "18px 0 14px" }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <span className="hgb-meta">{fmtDate(p.date)} · {readingTime(p)} min</span>
                    <span className="hgb-go">Ler <Arrow /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </PageShellClaro>
  );
}

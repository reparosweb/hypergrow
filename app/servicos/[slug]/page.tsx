import "../../hg-tokens.css";
import "../../hg-styles.css";
import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { siteServices, getService, pillarOf } from "@/lib/site-services";
import ServiceGlyph from "@/components/site/ServiceGlyphs";
import PlatformShowcase from "@/components/site/PlatformShowcase";
import { SITE_URL } from "@/lib/seo";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "";

export function generateStaticParams() {
  return siteServices.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = getService(params.slug);
  if (!s) return { title: "Serviço — HyperGrow" };
  const title = `${s.title} — HyperGrow`;
  const description = s.metaDescription;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/servicos/${s.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/servicos/${s.slug}`, type: "website", images: ["/media/launch-poster.png"] },
    twitter: { card: "summary_large_image", title, description },
  };
}

/* Ícones inline: esta rota NÃO carrega o script do lucide (ele vive dentro do
   HypergrowSite, só na home), então <i data-lucide> renderizaria vazio aqui. */
function Check() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, marginTop: 3 }}>
      <path d="M20 6 9 17l-5-5" stroke="var(--acc)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
/* Fotografia real (StockSnap, CC0 1.0 — uso comercial liberado; créditos e link
   da licença em public/fotos/CREDITOS.json). Só nas páginas em que a foto DIZ
   alguma coisa: foto genérica em todas as 19 vira ruído e volta a parecer
   template. Mostra o contexto do cliente, nunca "a nossa equipe". */
const SERVICE_PHOTO: Record<string, { src: string; alt: string; w: number; h: number }> = {
  "loja-virtual": { src: "/fotos/checkout-loja-virtual.webp", alt: "Cliente com o cartão na mão diante de uma loja virtual aberta no notebook", w: 960, h: 640 },
  "consultoria-ecommerce": { src: "/fotos/embalando-pedido.webp", alt: "Pedido sendo embalado sobre a bancada de uma operação de e-commerce", w: 960, h: 641 },
  "marketing-trafego": { src: "/fotos/painel-resultados.webp", alt: "Painel de métricas e gráficos de campanha aberto no notebook", w: 960, h: 640 },
  seo: { src: "/fotos/painel-resultados.webp", alt: "Relatório de tráfego e gráficos de desempenho na tela do notebook", w: 960, h: 640 },
  "automacoes-ia": { src: "/fotos/operacao-diaria.webp", alt: "Profissional atendendo pelo notebook em uma mesa de trabalho", w: 960, h: 640 },
  "criacao-de-site": { src: "/fotos/escritorio-equipe.webp", alt: "Profissional trabalhando em notebook em um escritório real", w: 960, h: 641 },
};

function PhotoBand({ slug }: { slug: string }) {
  const p = SERVICE_PHOTO[slug];
  if (!p) return null;
  return (
    <section className="sec svc-sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "16/6", background: "#171B20", border: "1px solid rgba(232,226,217,0.09)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 45%" }} />
          <span aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(13,16,19,0.22), rgba(13,16,19,0.66))" }}></span>
        </div>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg className="svc-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const s = getService(params.slug);
  if (!s) notFound();

  const pil = pillarOf(s.slug);
  const wa = WHATSAPP
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Quero falar sobre ${s.title}.`)}`
    : "/#contato";

  // Cross-link com critério: primeiro os irmãos do MESMO pilar (o pilar "IA" tem
  // um serviço só, então essa lista pode vir vazia — o bloco some nesse caso).
  const samePillar = siteServices.filter((o) => o.slug !== s.slug && pil.slugs.includes(o.slug));
  const others = siteServices.filter((o) => o.slug !== s.slug);

  // Cor do pilar distribuída por toda a página via custom properties.
  const cssVars = {
    "--acc": pil.accent,
    "--rail": pil.rail,
    "--glow": pil.glow,
  } as unknown as CSSProperties;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: s.title,
        description: s.long,
        provider: { "@type": "Organization", name: "HyperGrow", url: SITE_URL },
        areaServed: "BR",
        url: `${SITE_URL}/servicos/${s.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          // Página-pai REAL (/servicos existe agora). Antes apontava para a
          // âncora /#servicos, que o Google resolve como sendo a própria home —
          // as 19 páginas ficavam sem nível intermediário na hierarquia.
          { "@type": "ListItem", position: 2, name: "Serviços", item: `${SITE_URL}/servicos` },
          { "@type": "ListItem", position: 3, name: s.title, item: `${SITE_URL}/servicos/${s.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: s.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main className="svc-page" style={{ minHeight: "100vh", position: "relative", ...cssVars }}>
      {/* Ambiente: só degradês (nenhum filter:blur em position:fixed — trava o scroll no mobile). */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          background: `radial-gradient(65% 45% at 12% -8%, ${pil.glow}, transparent 62%), radial-gradient(60% 40% at 95% 4%, rgba(196,118,60,0.11), transparent 60%), #0D1013`,
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* trilho do pilar: a primeira coisa que a página diz, antes de qualquer texto */}
      <div className="svc-rail" aria-hidden />

      {/* top bar */}
      <div className="wrap svc-top">
        <Link href="/" className="svc-logo">
          Hyper<span style={{ background: "linear-gradient(120deg,#2DD4A0,#0B7A4C 55%,#C4763C)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Grow</span>
        </Link>
        <Link href="/#contato" className="btn btn-cta svc-top-cta">Solicitar orçamento</Link>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="sec svc-sec-hero">
        <nav className="wrap svc-crumbs" aria-label="Você está aqui">
          <Link href="/">Início</Link>
          <span aria-hidden>/</span>
          <Link href="/servicos">Serviços</Link>
          <span aria-hidden>/</span>
          <span className="svc-crumb-now">{pil.label}</span>
        </nav>

        <div className="wrap svc-hero">
          <div className="svc-hero-copy">
            <div className="svc-badge svc-in" style={{ animationDelay: "0.02s" }}>
              <span className="svc-badge-dot" aria-hidden />
              {pil.short}
              <span className="svc-badge-sep" aria-hidden />
              <span className="svc-badge-label">{pil.label}</span>
            </div>

            <h1 className="svc-h1 svc-in" style={{ animationDelay: "0.08s" }}>{s.title}</h1>

            <p className="svc-lede svc-in" style={{ animationDelay: "0.14s" }}>{s.long}</p>

            <div className="svc-actions svc-in" style={{ animationDelay: "0.2s" }}>
              <Link href="/#contato" className="btn btn-cta">Solicitar orçamento</Link>
              <a href={wa} target={WHATSAPP ? "_blank" : undefined} rel="noopener noreferrer" className="btn btn-ghost">Falar no WhatsApp</a>
            </div>
          </div>

          {/* O grafismo do serviço como protagonista — cada página abre com o
              seu próprio desenho, não com um efeito genérico repetido 19 vezes. */}
          <div className="svc-plate svc-in" style={{ animationDelay: "0.12s" }}>
            <span className="svc-plate-grid" aria-hidden />
            <span className="svc-plate-glow" aria-hidden />
            <span className="svc-tick tl" aria-hidden />
            <span className="svc-tick tr" aria-hidden />
            <span className="svc-tick bl" aria-hidden />
            <span className="svc-tick br" aria-hidden />
            <div className="svc-glyph">
              <ServiceGlyph slug={s.slug} height={240} />
            </div>
            <div className="svc-plate-foot" aria-hidden>
              <span className="mono">{pil.label}</span>
              <span className="mono svc-plate-foot-r">{s.tags[0]}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap"><hr className="hairline" /></div>

      {/* ── CORPO ────────────────────────────────────────────────────────── */}
      <section className="sec svc-sec">
        <div className="wrap svc-body">
          {s.body.map((b, i) => (
            <article key={b.h} className="svc-block">
              <div className="svc-idx" aria-hidden>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="svc-idx-line" />
              </div>
              <div className="svc-block-text">
                <h2 className="svc-h2">{b.h}</h2>
                <p className="svc-p">{b.p}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Faixa fotográfica — só nos 6 slugs em que a foto diz alguma coisa. */}
      <PhotoBand slug={s.slug} />

      {/* ── PLATAFORMAS (só onde faz sentido) ────────────────────────────────
          Pedido direto do dono: a página de loja virtual precisa mostrar que
          trabalhamos com as plataformas de verdade do mercado — não é detalhe
          técnico, é o que tira a dúvida "vocês mexem com a MINHA plataforma?".
          Também entra em consultoria-ecommerce, onde ERP, hub e marketplace são
          exatamente o assunto. Fonte dos dados: lib/ecommerce-platforms.ts. */}
      {(s.slug === "loja-virtual" || s.slug === "consultoria-ecommerce") && <PlatformShowcase />}

      {/* ── INCLUÍDO + GANHA ─────────────────────────────────────────────── */}
      <section className="sec svc-sec">
        <div className="wrap svc-duo">
          <div className="glowcard svc-card svc-rise">
            <h2 className="svc-card-h">O que está incluído</h2>
            <div className="svc-tags">
              {s.tags.map((t) => <span key={t} className="pill">{t}</span>)}
            </div>
          </div>
          <div className="glowcard svc-card svc-card-acc svc-rise">
            <h2 className="svc-card-h">O que você ganha</h2>
            <ul className="svc-outcomes">
              {s.outcomes.map((o) => (
                <li key={o}><Check />{o}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="sec svc-sec">
        <div className="wrap svc-faq-wrap">
          <span className="svc-kicker">Dúvidas</span>
          <h2 className="svc-h-sec">Perguntas frequentes</h2>
          <div className="svc-faq-list">
            {s.faq.map((f) => (
              <details key={f.q} className="svc-faq">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
      <section className="sec svc-sec">
        <div className="wrap">
          <div className="glass-top svc-cta svc-rise">
            <h2 className="svc-cta-h">Pronto para {s.title.toLowerCase()}?</h2>
            <p className="svc-cta-p">Fale com a HyperGrow e receba uma proposta sob medida em até 1 dia útil.</p>
            <div className="svc-actions svc-actions-c">
              <Link href="/#contato" className="btn btn-cta">Solicitar proposta</Link>
              <a href={wa} target={WHATSAPP ? "_blank" : undefined} rel="noopener noreferrer" className="btn btn-ghost">Conversar no WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUTROS SERVIÇOS ──────────────────────────────────────────────── */}
      <section className="sec svc-sec svc-sec-last">
        <div className="wrap">
          {samePillar.length > 0 && (
            <>
              <span className="svc-kicker">Mesmo pilar</span>
              <h2 className="svc-h-sec">Outros serviços de {pil.label}</h2>
              <p className="svc-rel-sub">{pil.desc}</p>
              <div className="svc-rel">
                {samePillar.map((o) => (
                  <Link key={o.slug} href={`/servicos/${o.slug}`} className="glowcard svc-rel-card svc-rise">
                    <span className="svc-rel-glyph" aria-hidden>
                      <ServiceGlyph slug={o.slug} height={46} />
                    </span>
                    <span className="svc-rel-title">{o.title}</span>
                    <span className="svc-rel-desc">{o.desc}</span>
                    <span className="svc-rel-go">Ver serviço <Arrow /></span>
                  </Link>
                ))}
              </div>
            </>
          )}

          <div className="svc-all">
            <div className="svc-all-head">
              <h3 className="svc-all-h">Todos os serviços</h3>
              <Link href="/servicos" className="svc-all-link">Ver o catálogo completo <Arrow /></Link>
            </div>
            <div className="svc-all-pills">
              {others.map((o) => (
                <Link key={o.slug} href={`/servicos/${o.slug}`} className="pill svc-all-pill">{o.title}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="svc-footer">
        <div className="wrap svc-footer-in">
          <span>© 2026 HyperGrow</span>
          <Link href="/">Voltar ao site →</Link>
        </div>
      </footer>

      <style>{`
        /* ═══ Página de serviço — sistema visual por pilar ═══════════════════
           Regras de sobrevivência aplicadas aqui:
           · nenhuma largura fixa em px sem min(Xpx, 100%)
           · grids sempre repeat(auto-fit, minmax(min(100%, X), 1fr))
           · nenhum filter:blur() e nenhum backdrop-filter em elemento grande
           · nenhuma classe .reveal/.stagger: o IntersectionObserver que as liga
             vive no HypergrowSite (home). Aqui elas ficariam em opacity:0 pra
             sempre. Entrada do hero = animação de tempo (sempre completa);
             reveal de scroll = progressive enhancement com estado base VISÍVEL.
           ══════════════════════════════════════════════════════════════════ */

        .svc-page { --edge: rgba(232,226,217,0.10); }

        .svc-rail {
          height: 3px; width: 100%;
          background: linear-gradient(90deg, var(--rail), var(--acc) 34%, rgba(232,226,217,0.07) 72%, transparent);
        }

        /* ── topo ─────────────────────────────────────────────────────────── */
        .svc-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 74px; }
        /* alvos de toque: piso de 44px em tudo que é clicável */
        .svc-logo {
          display: inline-flex; align-items: center; min-height: 44px;
          font: 800 19px var(--font-display); letter-spacing: -0.045em; color: #fff;
          text-decoration: none; flex-shrink: 0;
        }
        .svc-top-cta { min-height: 44px; padding: 11px 18px; font-size: 14px; border-radius: 12px; }
        @media (max-width: 420px) { .svc-top-cta { padding: 11px 14px; font-size: 13px; } }

        .svc-sec-hero { padding-top: clamp(26px, 3.5vw, 44px); padding-bottom: clamp(48px, 6vw, 84px); }
        .svc-sec { padding-top: clamp(52px, 6.5vw, 92px); padding-bottom: 0; }
        .svc-sec-last { padding-bottom: clamp(56px, 7vw, 96px); }

        /* ── breadcrumb ───────────────────────────────────────────────────── */
        .svc-crumbs {
          display: flex; align-items: center; flex-wrap: wrap; gap: 9px;
          font: 500 12.5px var(--font-sans); color: rgba(232,226,217,0.42);
          margin-bottom: clamp(20px, 2.6vw, 30px);
        }
        .svc-crumbs a {
          display: inline-flex; align-items: center; min-height: 44px;
          color: rgba(232,226,217,0.62); text-decoration: none;
          transition: color .3s var(--ease-silk);
        }
        .svc-crumbs a:hover { color: #fff; }
        .svc-crumb-now { color: var(--acc); }

        /* ── hero ─────────────────────────────────────────────────────────── */
        .svc-hero {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
          gap: clamp(30px, 4vw, 60px);
          align-items: center;
        }
        .svc-hero-copy { min-width: 0; }

        .svc-badge {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 8px 15px; border-radius: 999px;
          font: 700 11px var(--font-sans); letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--acc);
          background: linear-gradient(180deg, rgba(232,226,217,0.06), rgba(232,226,217,0.015));
          border: 1px solid var(--edge);
          box-shadow: 0 1px 0 rgba(232,226,217,0.05) inset;
          max-width: 100%;
        }
        .svc-badge-dot { width: 7px; height: 7px; border-radius: 999px; background: var(--acc); box-shadow: 0 0 10px var(--glow); flex-shrink: 0; }
        .svc-badge-sep { width: 1px; height: 11px; background: rgba(232,226,217,0.18); flex-shrink: 0; }
        .svc-badge-label { color: rgba(232,226,217,0.58); letter-spacing: 0.1em; font-weight: 500; }
        @media (max-width: 380px) { .svc-badge-sep, .svc-badge-label { display: none; } }

        .svc-h1 {
          font: 800 clamp(31px, 5.1vw, 58px)/1.03 var(--font-display);
          letter-spacing: -0.042em; color: #fff; margin: 20px 0 0;
          text-wrap: balance; overflow-wrap: break-word;
        }
        .svc-lede {
          font: 400 clamp(16px, 1.5vw, 18.5px)/1.62 var(--font-sans);
          color: rgba(232,226,217,0.72); margin: 20px 0 0; max-width: 60ch; text-wrap: pretty;
        }
        .svc-actions { display: flex; gap: 13px; flex-wrap: wrap; margin-top: clamp(26px, 3vw, 34px); }
        .svc-actions-c { justify-content: center; }

        /* ── placa do grafismo (o protagonista) ───────────────────────────── */
        .svc-plate {
          position: relative; overflow: hidden; min-width: 0;
          /* teto de largura: impede que a placa vire um bloco gigante quando o
             hero cai para uma coluna só (tablet). Centralizada nos dois casos. */
          width: 100%; max-width: min(100%, 560px); margin-inline: auto;
          aspect-ratio: 4 / 3;
          display: flex; align-items: center; justify-content: center;
          border-radius: clamp(18px, 2vw, 28px);
          border: 1px solid var(--edge);
          background:
            radial-gradient(120% 90% at 50% -12%, rgba(232,226,217,0.06), transparent 58%),
            linear-gradient(180deg, rgba(232,226,217,0.045), rgba(232,226,217,0.012)),
            #12151A;
          box-shadow: 0 1px 0 rgba(232,226,217,0.06) inset, 0 46px 100px -60px rgba(0,0,0,0.95);
        }
        /* grade técnica, esmaecida nas bordas por máscara (sem blur) */
        .svc-plate-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(232,226,217,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,226,217,0.045) 1px, transparent 1px);
          background-size: 38px 38px; background-position: center;
          -webkit-mask-image: radial-gradient(72% 72% at 50% 50%, #000, transparent 82%);
          mask-image: radial-gradient(72% 72% at 50% 50%, #000, transparent 82%);
        }
        /* halo do pilar: gradiente puro, jamais filter:blur */
        .svc-plate-glow {
          position: absolute; left: 50%; top: 48%; width: 118%; aspect-ratio: 1 / 1;
          transform: translate(-50%, -50%); pointer-events: none;
          background: radial-gradient(circle, var(--glow), transparent 62%);
          opacity: 0.5;
        }
        .svc-tick { position: absolute; width: 13px; height: 13px; pointer-events: none; opacity: 0.6; }
        .svc-tick.tl { top: 14px; left: 14px; border-top: 1.5px solid var(--acc); border-left: 1.5px solid var(--acc); }
        .svc-tick.tr { top: 14px; right: 14px; border-top: 1.5px solid var(--acc); border-right: 1.5px solid var(--acc); }
        .svc-tick.bl { bottom: 14px; left: 14px; border-bottom: 1.5px solid var(--acc); border-left: 1.5px solid var(--acc); }
        .svc-tick.br { bottom: 14px; right: 14px; border-bottom: 1.5px solid var(--acc); border-right: 1.5px solid var(--acc); }

        .svc-glyph { position: relative; z-index: 2; width: min(70%, 430px); color: var(--acc); }
        /* vence os atributos width/height do <svg> — nada de largura fixa em px */
        .svc-glyph svg { width: 100%; height: auto; display: block; }

        .svc-plate-foot {
          position: absolute; left: 0; right: 0; bottom: 0; z-index: 2;
          display: flex; align-items: center; justify-content: space-between; gap: 14px;
          padding: 0 clamp(16px, 2.4vw, 24px) clamp(14px, 2vw, 20px);
          font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(232,226,217,0.34);
        }
        .svc-plate-foot span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .svc-plate-foot-r { color: var(--acc); opacity: 0.75; text-align: right; }

        /* ── corpo: índice numerado dá hierarquia e ritmo de leitura ──────── */
        .svc-body { display: flex; flex-direction: column; gap: clamp(30px, 4vw, 46px); max-width: 900px; }
        .svc-block { display: grid; grid-template-columns: auto 1fr; gap: clamp(14px, 2vw, 26px); align-items: start; }
        .svc-idx { display: flex; flex-direction: column; align-items: center; gap: 10px; padding-top: 4px; }
        .svc-idx .mono { font-size: 11.5px; font-weight: 600; letter-spacing: 0.1em; color: var(--acc); }
        .svc-idx-line { width: 1px; flex: 1; min-height: 26px; background: linear-gradient(180deg, var(--acc), transparent); opacity: 0.4; }
        .svc-block-text { min-width: 0; }
        .svc-h2 {
          font: 700 clamp(20px, 2.5vw, 27px)/1.2 var(--font-display);
          letter-spacing: -0.025em; color: #fff; margin: 0 0 12px; text-wrap: balance;
        }
        .svc-p { font: 400 clamp(15.5px, 1.3vw, 16.5px)/1.72 var(--font-sans); color: rgba(232,226,217,0.72); margin: 0; text-wrap: pretty; }

        /* ── kicker + título de seção ─────────────────────────────────────── */
        .svc-kicker {
          display: inline-block; font: 600 10.5px var(--font-mono);
          letter-spacing: 0.22em; text-transform: uppercase; color: var(--acc);
        }
        .svc-h-sec {
          font: 700 clamp(25px, 3.3vw, 38px)/1.08 var(--font-display);
          letter-spacing: -0.032em; color: #fff; margin: 12px 0 0; text-wrap: balance;
        }

        /* ── cards incluído / ganha ───────────────────────────────────────── */
        .svc-duo { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 18px; }
        .svc-card { border-radius: 22px; padding: clamp(24px, 3vw, 34px); }
        .svc-card-acc { border-color: color-mix(in srgb, var(--acc) 26%, transparent); }
        .svc-card-h { font: 700 clamp(18px, 1.8vw, 21px) var(--font-display); color: #fff; margin: 0; letter-spacing: -0.02em; }
        .svc-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
        .svc-outcomes { list-style: none; padding: 0; margin: 18px 0 0; display: flex; flex-direction: column; gap: 13px; }
        .svc-outcomes li { display: flex; gap: 11px; font: 400 15px/1.55 var(--font-sans); color: rgba(232,226,217,0.84); }

        /* ── FAQ ──────────────────────────────────────────────────────────── */
        .svc-faq-wrap { max-width: 900px; }
        .svc-faq-list { display: flex; flex-direction: column; gap: 10px; margin-top: clamp(22px, 2.6vw, 30px); }
        .svc-faq {
          border-radius: 16px; padding: 0 clamp(16px, 2.2vw, 24px);
          background: linear-gradient(180deg, rgba(232,226,217,0.045), rgba(232,226,217,0.012));
          border: 1px solid rgba(232,226,217,0.08);
          transition: border-color .35s var(--ease-silk), background .35s var(--ease-silk);
        }
        .svc-faq:hover { border-color: color-mix(in srgb, var(--acc) 34%, transparent); }
        .svc-faq[open] { border-color: color-mix(in srgb, var(--acc) 30%, transparent); }
        .svc-faq summary {
          cursor: pointer; list-style: none; display: flex; align-items: center;
          justify-content: space-between; gap: 16px; min-height: 56px; padding: 15px 0;
          font: 600 clamp(15px, 1.4vw, 16.5px)/1.4 var(--font-sans); color: #fff;
        }
        .svc-faq summary::-webkit-details-marker { display: none; }
        /* sinal +/− construído com gradientes: sem dependência de ícone externo */
        .svc-faq summary::after {
          content: ''; flex: none; width: 14px; height: 14px; color: var(--acc);
          background:
            linear-gradient(currentColor, currentColor) center / 100% 1.7px no-repeat,
            linear-gradient(currentColor, currentColor) center / 1.7px 100% no-repeat;
          transition: transform .35s var(--ease-spring);
        }
        .svc-faq[open] summary::after {
          background: linear-gradient(currentColor, currentColor) center / 100% 1.7px no-repeat;
          transform: rotate(180deg);
        }
        .svc-faq p { font: 400 15px/1.7 var(--font-sans); color: rgba(232,226,217,0.7); margin: 0; padding: 0 0 20px; max-width: 68ch; text-wrap: pretty; }

        /* ── CTA final ────────────────────────────────────────────────────── */
        .svc-cta {
          position: relative; overflow: hidden; text-align: center;
          border-radius: clamp(20px, 2.2vw, 28px);
          padding: clamp(34px, 5vw, 60px) clamp(20px, 4vw, 44px);
          border: 1px solid color-mix(in srgb, var(--acc) 28%, transparent);
          background:
            radial-gradient(110% 130% at 50% -25%, var(--glow), transparent 58%),
            linear-gradient(180deg, rgba(232,226,217,0.05), rgba(232,226,217,0.015)),
            #12151A;
          box-shadow: 0 1px 0 rgba(232,226,217,0.06) inset, 0 40px 90px -56px rgba(0,0,0,0.9);
        }
        .svc-cta-h {
          font: 800 clamp(24px, 3.5vw, 40px)/1.08 var(--font-display);
          letter-spacing: -0.035em; color: #fff; margin: 0 auto; max-width: 18ch; text-wrap: balance;
        }
        .svc-cta-p { font: 400 16px/1.6 var(--font-sans); color: rgba(232,226,217,0.7); margin: 16px auto 0; max-width: 46ch; }

        /* ── outros serviços do mesmo pilar ───────────────────────────────── */
        .svc-rel-sub { font: 400 15.5px/1.6 var(--font-sans); color: rgba(232,226,217,0.55); margin: 12px 0 0; max-width: 56ch; }
        .svc-rel {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
          gap: 16px; margin-top: clamp(24px, 3vw, 32px);
        }
        .svc-rel-card {
          display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
          border-radius: 20px; padding: clamp(20px, 2.4vw, 26px);
          text-decoration: none; min-width: 0;
        }
        .svc-rel-glyph { color: var(--acc); display: block; width: min(68px, 100%); margin-bottom: 4px; }
        .svc-rel-glyph svg { width: 100%; height: auto; display: block; }
        .svc-rel-title { font: 700 16.5px/1.3 var(--font-display); letter-spacing: -0.02em; color: #fff; }
        .svc-rel-desc { font: 400 14px/1.55 var(--font-sans); color: rgba(232,226,217,0.6); }
        .svc-rel-go {
          margin-top: auto; padding-top: 10px; display: inline-flex; align-items: center; gap: 7px;
          font: 600 13px var(--font-sans); color: var(--acc);
        }
        .svc-rel-card:hover .svc-arrow { transform: translateX(3px); }
        .svc-arrow { transition: transform .35s var(--ease-spring); }

        /* ── todos os serviços (mantém a malha de links internos) ─────────── */
        .svc-all { margin-top: clamp(40px, 5vw, 64px); padding-top: clamp(26px, 3vw, 34px); border-top: 1px solid rgba(232,226,217,0.08); }
        .svc-all-head { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .svc-all-h { font: 600 12px var(--font-sans); text-transform: uppercase; letter-spacing: 0.16em; color: rgba(232,226,217,0.48); margin: 0; }
        .svc-all-link { display: inline-flex; align-items: center; min-height: 44px; gap: 7px; font: 600 13.5px var(--font-sans); color: var(--acc); text-decoration: none; }
        .svc-all-link:hover .svc-arrow { transform: translateX(3px); }
        .svc-all-pills { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 14px; }
        .svc-all-pill { min-height: 44px; text-decoration: none; cursor: pointer; max-width: 100%; }

        /* ── footer ───────────────────────────────────────────────────────── */
        .svc-footer { border-top: 1px solid rgba(232,226,217,0.08); margin-top: clamp(20px, 3vw, 36px); }
        .svc-footer-in {
          padding-top: 22px; padding-bottom: max(22px, env(safe-area-inset-bottom));
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px;
          font: 400 13px var(--font-sans); color: rgba(232,226,217,0.45);
        }
        .svc-footer-in a { display: inline-flex; align-items: center; min-height: 44px; color: rgba(232,226,217,0.62); text-decoration: none; }
        .svc-footer-in > span { display: inline-flex; align-items: center; min-height: 44px; }
        .svc-footer-in a:hover { color: #fff; }

        /* ── movimento ────────────────────────────────────────────────────── */
        /* Entrada do hero: animação de TEMPO — sempre completa, nunca deixa
           conteúdo preso invisível (ao contrário de reveal dependente de JS). */
        .svc-in { animation: svc-in-kf .75s var(--ease-silk) both; }
        @keyframes svc-in-kf { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }

        /* Reveal de scroll: progressive enhancement. Estado base = VISÍVEL;
           só navegadores com scroll-driven animations aplicam o efeito, e a
           faixa termina cedo (ainda durante a entrada) para nunca "travar". */
        @supports (animation-timeline: view()) {
          @media (prefers-reduced-motion: no-preference) {
            .svc-rise {
              animation: svc-in-kf linear both;
              animation-timeline: view();
              animation-range: entry 2% entry 58%;
            }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .svc-in { animation: none; opacity: 1; transform: none; }
          .svc-rise { animation: none; opacity: 1; transform: none; }
          .svc-arrow, .svc-faq summary::after { transition: none; }
        }
      `}</style>
    </main>
  );
}

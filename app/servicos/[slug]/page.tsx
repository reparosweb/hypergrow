import "../../hg-tokens.css";
import "../../hg-styles.css";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteServices, getService } from "@/lib/site-services";
import { SITE_URL } from "@/lib/seo";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "";

export function generateStaticParams() {
  return siteServices.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = getService(params.slug);
  if (!s) return { title: "Serviço — HyperGrow" };
  const title = `${s.title} — HyperGrow`;
  const description = s.long;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/servicos/${s.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/servicos/${s.slug}`, type: "website", images: ["/media/launch-poster.png"] },
    twitter: { card: "summary_large_image", title, description },
  };
}

function Check({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M20 6 9 17l-5-5" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const s = getService(params.slug);
  if (!s) notFound();

  const wa = WHATSAPP
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Quero falar sobre ${s.title}.`)}`
    : "/#contato";
  const others = siteServices.filter((o) => o.slug !== s.slug).slice(0, 6);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.long,
    provider: { "@type": "Organization", name: "HyperGrow", url: SITE_URL },
    areaServed: "BR",
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", background: `radial-gradient(70% 50% at 15% -5%, ${s.accent}22, transparent 60%), radial-gradient(70% 45% at 92% 8%, rgba(255,45,122,0.14), transparent 60%), #050b1a` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* top bar */}
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
        <Link href="/" style={{ font: "700 18px var(--font-display)", letterSpacing: "-0.04em", color: "#fff" }}>
          Hyper<span style={{ background: "linear-gradient(120deg,#4d8bff,#5b3cff 55%,#FF2D7A)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Grow</span>
        </Link>
        <Link href="/#contato" className="btn btn-cta" style={{ padding: "10px 18px", fontSize: 14, borderRadius: 12 }}>Solicitar orçamento</Link>
      </div>

      {/* hero */}
      <section className="sec" style={{ paddingTop: 48 }}>
        <div className="wrap svc-hero" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 44, alignItems: "center" }}>
          <div>
            <Link href="/#servicos" style={{ font: "500 13px var(--font-sans)", color: "rgba(255,255,255,0.6)" }}>← Todos os serviços</Link>
            <div className="eyebrow" style={{ marginTop: 18 }}><span className="dot" style={{ background: s.accent, boxShadow: `0 0 10px ${s.accent}` }} />Serviço</div>
            <h1 style={{ font: "800 clamp(34px,5vw,60px)/1.04 var(--font-display)", letterSpacing: "-0.04em", color: "#fff", margin: "16px 0 0", textWrap: "balance" }}>
              {s.title}
            </h1>
            <p style={{ font: "400 18px/1.6 var(--font-sans)", color: "rgba(255,255,255,0.72)", margin: "20px 0 0", maxWidth: 560, textWrap: "pretty" }}>{s.long}</p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 32 }}>
              <Link href="/#contato" className="btn btn-cta">Solicitar orçamento</Link>
              <a href={wa} target={WHATSAPP ? "_blank" : undefined} rel="noopener noreferrer" className="btn btn-ghost">Falar no WhatsApp</a>
            </div>
          </div>

          {/* visual futurista animado */}
          <div className="svc-visual" style={{ position: "relative", aspectRatio: "1/1", borderRadius: 28, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", background: `radial-gradient(120% 100% at 28% 18%, ${s.accent}33, rgba(8,16,36,0.85) 60%)`, boxShadow: `0 40px 100px -40px ${s.accent}66` }}>
            <span className="svc-grid" aria-hidden />
            <span className="svc-ring" aria-hidden style={{ borderColor: `${s.accent}55` }} />
            <span className="svc-ring svc-ring2" aria-hidden style={{ borderColor: "rgba(255,255,255,0.12)" }} />
            <span className="svc-orb" aria-hidden style={{ background: `radial-gradient(circle, ${s.accent}, ${s.accent}00 70%)` }} />
            <span className="svc-core" aria-hidden style={{ background: `linear-gradient(135deg, #fff, ${s.accent})`, boxShadow: `0 0 60px 6px ${s.accent}` }} />
            <span className="svc-chip a" style={{ borderColor: `${s.accent}66` }}>{s.tags[0]}</span>
            <span className="svc-chip b" style={{ borderColor: "rgba(255,255,255,0.18)" }}>{s.tags[1] || s.tags[0]}</span>
            <span className="svc-chip c" style={{ borderColor: `${s.accent}66` }}>{s.outcomes[0]?.split(" ").slice(0, 3).join(" ")}</span>
          </div>
        </div>

        <style>{`
          .svc-grid { position:absolute; inset:0; background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 36px 36px; -webkit-mask-image: radial-gradient(70% 70% at 50% 50%, #000, transparent 80%); mask-image: radial-gradient(70% 70% at 50% 50%, #000, transparent 80%); }
          .svc-orb { position:absolute; width:75%; height:75%; left:50%; top:50%; transform:translate(-50%,-50%); filter: blur(24px); opacity:0.8; animation: svc-pulse 4.5s ease-in-out infinite; }
          .svc-core { position:absolute; width:60px; height:60px; left:50%; top:50%; transform:translate(-50%,-50%); border-radius:999px; animation: svc-float 5s ease-in-out infinite; }
          .svc-ring { position:absolute; width:62%; height:62%; left:50%; top:50%; transform:translate(-50%,-50%); border:1.5px solid; border-radius:999px; border-right-color:transparent !important; border-bottom-color:transparent !important; animation: svc-spin 9s linear infinite; }
          .svc-ring2 { width:84%; height:84%; border-left-color:transparent !important; border-top-color:transparent !important; animation-duration:14s; animation-direction:reverse; }
          .svc-chip { position:absolute; padding:8px 13px; border-radius:999px; font:600 12px var(--font-sans); color:#fff; background:rgba(8,16,36,0.7); border:1px solid; backdrop-filter:blur(8px); white-space:nowrap; animation: svc-float 6s ease-in-out infinite; }
          .svc-chip.a { left:8%; top:16%; }
          .svc-chip.b { right:8%; top:42%; animation-delay:1.2s; }
          .svc-chip.c { left:14%; bottom:14%; animation-delay:2.1s; }
          @keyframes svc-spin { to { transform: translate(-50%,-50%) rotate(360deg); } }
          @keyframes svc-float { 0%,100% { transform: translate(-50%,-50%) translateY(0); } 50% { transform: translate(-50%,-50%) translateY(-8px); } }
          @keyframes svc-pulse { 0%,100% { opacity:0.6; } 50% { opacity:0.95; } }
          .svc-chip { transform: none; } .svc-chip { animation-name: svc-chipfloat; } @keyframes svc-chipfloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
          @media (max-width: 860px) { .svc-hero { grid-template-columns: 1fr !important; } .svc-visual { display:none; } }
          @media (prefers-reduced-motion: reduce) { .svc-orb,.svc-core,.svc-ring,.svc-chip { animation: none !important; } }
        `}</style>
      </section>

      {/* incluído + resultados */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 20 }}>
          <div className="neon-card" style={{ borderRadius: 22, padding: 30, background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 style={{ font: "700 20px var(--font-display)", color: "#fff", margin: 0 }}>O que está incluído</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
              {s.tags.map((t) => <span key={t} className="pill">{t}</span>)}
            </div>
          </div>
          <div className="neon-card" style={{ borderRadius: 22, padding: 30, background: `linear-gradient(180deg, ${s.accent}14, rgba(255,255,255,0.02))`, border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 style={{ font: "700 20px var(--font-display)", color: "#fff", margin: 0 }}>O que você ganha</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 12 }}>
              {s.outcomes.map((o) => (
                <li key={o} style={{ display: "flex", gap: 10, font: "400 15px/1.5 var(--font-sans)", color: "rgba(255,255,255,0.82)" }}>
                  <Check color={s.accent} />{o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* final CTA */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="neon-card" style={{ position: "relative", borderRadius: 28, padding: "56px 40px", textAlign: "center", overflow: "hidden", background: `radial-gradient(120% 120% at 50% -20%, ${s.accent}40, rgba(13,33,71,0.6) 55%, rgba(8,16,36,0.7))`, border: "1px solid rgba(91,60,255,0.35)" }}>
            <h2 style={{ font: "800 clamp(26px,3.6vw,40px)/1.08 var(--font-display)", letterSpacing: "-0.03em", color: "#fff", margin: 0, maxWidth: 640, marginInline: "auto", textWrap: "balance" }}>
              Pronto para {s.title.toLowerCase()}?
            </h2>
            <p style={{ font: "400 16px/1.6 var(--font-sans)", color: "rgba(255,255,255,0.72)", margin: "16px auto 0", maxWidth: 460 }}>Fale com a HyperGrow e receba uma proposta sob medida em até 1 dia útil.</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
              <Link href="/#contato" className="btn btn-cta">Solicitar proposta</Link>
              <a href={wa} target={WHATSAPP ? "_blank" : undefined} rel="noopener noreferrer" className="btn btn-ghost">Conversar no WhatsApp</a>
            </div>
          </div>

          {/* outros serviços */}
          <div style={{ marginTop: 44 }}>
            <h3 style={{ font: "600 14px var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Outros serviços</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {others.map((o) => (
                <Link key={o.slug} href={`/servicos/${o.slug}`} className="pill" style={{ textDecoration: "none" }}>{o.title}</Link>
              ))}
            </div>
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

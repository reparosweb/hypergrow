import "../../hg-tokens.css";
import "../../hg-styles.css";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteServices, getService } from "@/lib/site-services";

const SITE = "https://hypergrow-lovat.vercel.app";
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
    alternates: { canonical: `${SITE}/servicos/${s.slug}` },
    openGraph: { title, description, url: `${SITE}/servicos/${s.slug}`, type: "website", images: ["/media/launch-poster.png"] },
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
    provider: { "@type": "Organization", name: "HyperGrow", url: SITE },
    areaServed: "BR",
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", background: `radial-gradient(70% 50% at 15% -5%, ${s.accent}22, transparent 60%), radial-gradient(70% 45% at 92% 8%, rgba(255,45,122,0.14), transparent 60%), #050b1a` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* top bar */}
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
        <Link href="/" style={{ font: "700 18px var(--font-display)", letterSpacing: "-0.04em", color: "#fff" }}>
          Hyper<span style={{ background: "linear-gradient(120deg,#4d8bff,#5b3cff 55%,#FF2D7A)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>grow</span>
        </Link>
        <Link href="/#contato" className="btn btn-cta" style={{ padding: "10px 18px", fontSize: 14, borderRadius: 12 }}>Solicitar orçamento</Link>
      </div>

      {/* hero */}
      <section className="sec" style={{ paddingTop: 48 }}>
        <div className="wrap">
          <Link href="/#servicos" style={{ font: "500 13px var(--font-sans)", color: "rgba(255,255,255,0.6)" }}>← Todos os serviços</Link>
          <div className="eyebrow" style={{ marginTop: 18 }}><span className="dot" style={{ background: s.accent, boxShadow: `0 0 10px ${s.accent}` }} />Serviço</div>
          <h1 style={{ font: "800 clamp(34px,5vw,64px)/1.04 var(--font-display)", letterSpacing: "-0.04em", color: "#fff", margin: "16px 0 0", maxWidth: 820, textWrap: "balance" }}>
            {s.title}
          </h1>
          <p style={{ font: "400 18px/1.6 var(--font-sans)", color: "rgba(255,255,255,0.72)", margin: "20px 0 0", maxWidth: 640, textWrap: "pretty" }}>{s.long}</p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 32 }}>
            <Link href="/#contato" className="btn btn-cta">Solicitar orçamento</Link>
            <a href={wa} target={WHATSAPP ? "_blank" : undefined} rel="noopener noreferrer" className="btn btn-ghost">Falar no WhatsApp</a>
          </div>
        </div>
      </section>

      {/* incluído + resultados */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
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
          <span>© 2026 Hypergrow</span>
          <Link href="/" style={{ color: "rgba(255,255,255,0.6)" }}>Voltar ao site →</Link>
        </div>
      </footer>
    </main>
  );
}

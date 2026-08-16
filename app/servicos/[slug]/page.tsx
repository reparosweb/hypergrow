import "../../claro-tokens.css";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteServices, getService, pillarOf } from "@/lib/site-services";
import ServiceGlyph from "@/components/site/ServiceGlyphs";
import PlatformShowcase from "@/components/site/PlatformShowcase";
import PageShellClaro from "@/components/site/PageShellClaro";
import { CLARO_PILLAR_ACCENT } from "@/components/claro/claroPillarAccent";
import { SITE_URL, ogImagens, OG_POR_PILAR } from "@/lib/seo";

/* /servicos/[slug] — as 19 páginas de serviço, migradas para o tema claro.

   O QUE SAIU DAQUI: o <main>, o fundo fixo escuro, o trilho do topo, o header
   próprio, a trilha própria e o rodapé próprio. Tudo isso passou a vir de
   `PageShellClaro`, o mesmo shell das outras rotas — era isso que fazia o site
   "mudar de identidade" a cada clique.

   O QUE FICOU: a placa do grafismo (cada serviço abre com o próprio desenho),
   o corpo numerado, o FAQ em <details> e a malha de links internos. Só as
   cores mudaram de lado.

   SEO intocado: generateStaticParams, generateMetadata, Service +
   BreadcrumbList + FAQPage. */

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
    // Arte por DEPARTAMENTO, não uma só para as 22 páginas: quem compartilha
    // "Criação de site" e quem compartilha "Produção de vídeo" vê cards
    // diferentes. `OG_POR_PILAR` cai em "servicos" se um departamento novo
    // aparecer sem arte própria — degrada, não quebra.
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/servicos/${s.slug}`,
      type: "website",
      images: ogImagens(OG_POR_PILAR[pillarOf(s.slug).key] ?? "servicos", title),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/* Ícones inline: `<i data-lucide>` renderizaria vazio aqui. Desde 2026-08-15
   isso vale para o site inteiro — `public/lucide.min.js` foi apagado (348 KB
   que rota nenhuma baixava), então não existe mais runtime de lucide em página
   nenhuma. Ícone novo: SVG inline ou import nomeado de `lucide-react`. */
function Check() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, marginTop: 3 }}>
      <path d="M20 6 9 17l-5-5" stroke="var(--acc)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Fotografia real (StockSnap, CC0 1.0 — uso comercial liberado; créditos e link
   da licença em public/fotos/CREDITOS.json; download por scripts/fetch-images.mjs).

   MUDANÇA 2026-08-06: antes só 6 dos 22 serviços tinham foto — as outras 16
   páginas não tinham imagem nenhuma ("site morto", bronca do dono comparando
   com o concorrente). Agora TODOS os 22 têm, e a foto entrou DENTRO do primeiro
   bloco do corpo em vez de virar uma faixa solta no meio da página.

   Regras que valem para cada linha desta tabela:
   · contexto de tecnologia / marketing / operação de empresa — nunca varejo
     físico genérico (a foto de mercearia já foi bronca real neste projeto);
   · cada foto foi ABERTA e olhada antes de entrar, nunca escolhida pelo nome
     do arquivo;
   · o `alt` descreve a CENA. Nunca "nossa equipe": é foto de banco, dizer que
     é a nossa gente seria mentira.
   `pos` é o object-position do recorte 4:3 — o enquadramento foi conferido
   foto a foto (a de vídeo, por exemplo, é vertical e precisa subir o corte). */
const SERVICE_PHOTO: Record<string, { src: string; alt: string; w: number; h: number; pos: string }> = {
  "criacao-de-site": { src: "/fotos/escritorio-equipe.webp", alt: "Profissional trabalhando em um notebook em um escritório de parede de tijolos", w: 960, h: 641, pos: "center 45%" },
  "loja-virtual": { src: "/fotos/checkout-loja-virtual.webp", alt: "Mão segurando um cartão de crédito diante de um notebook com uma loja virtual aberta", w: 960, h: 640, pos: "center 45%" },
  "consultoria-ecommerce": { src: "/fotos/embalando-pedido.webp", alt: "Pedido sendo embalado em caixa de papelão sobre a bancada de uma operação de e-commerce", w: 960, h: 641, pos: "center 45%" },
  seo: { src: "/fotos/posicao-google.webp", alt: "Monitor sobre uma mesa clara exibindo um gráfico de tráfego em curva de crescimento", w: 960, h: 640, pos: "center 50%" },
  hospedagem: { src: "/fotos/servidores-datacenter.webp", alt: "Duas profissionais com notebooks no corredor de um data center, entre racks de servidores", w: 960, h: 641, pos: "center 45%" },
  "cartao-interativo": { src: "/fotos/cartao-no-celular.webp", alt: "Homem sentado em um café consultando o celular com as duas mãos", w: 960, h: 635, pos: "center 40%" },
  "auditoria-comercial": { src: "/fotos/treinamento-comercial.webp", alt: "Profissional apresentando a um grupo diante de um quadro coberto de post-its", w: 960, h: 640, pos: "center 40%" },
  "marketing-trafego": { src: "/fotos/painel-resultados.webp", alt: "Painel de métricas e gráficos de campanha aberto na tela do notebook", w: 960, h: 640, pos: "center 45%" },
  "redes-sociais": { src: "/fotos/feed-instagram.webp", alt: "Celular com um feed de rede social aberto sobre um caderno pautado e uma caneta", w: 960, h: 640, pos: "center 50%" },
  "posts-redes-sociais": { src: "/fotos/esboco-layout.webp", alt: "Caderno com o rascunho à mão do layout de uma peça, ao lado de um celular", w: 960, h: 720, pos: "center 50%" },
  "posts-video": { src: "/fotos/gravando-video.webp", alt: "Mulher segurando uma filmadora apontada para a câmera diante de uma parede de tijolos", w: 960, h: 1709, pos: "center 30%" },
  "stories-instagram": { src: "/fotos/celular-sofa.webp", alt: "Mulher sentada no sofá junto à janela deslizando o feed do celular", w: 960, h: 640, pos: "center 45%" },
  "web-stories": { src: "/fotos/escrevendo-conteudo.webp", alt: "Mãos digitando em um notebook com o editor de um artigo aberto na tela", w: 960, h: 640, pos: "center 50%" },
  "email-marketing": { src: "/fotos/escrevendo-email.webp", alt: "Vista de cima de uma pessoa escrevendo no notebook ao lado de uma xícara de café", w: 960, h: 640, pos: "center 45%" },
  "producao-de-video": { src: "/fotos/camera-estudio.webp", alt: "Câmera profissional montada em tripé apontada para o cenário de um estúdio", w: 960, h: 640, pos: "center 50%" },
  "producao-fotografica": { src: "/fotos/fotografa-camera.webp", alt: "Fotógrafa segurando uma câmera DSLR pronta para o próximo clique", w: 960, h: 640, pos: "center 40%" },
  "fotos-produtos": { src: "/fotos/still-produtos.webp", alt: "Produtos de maquiagem organizados sobre fundo branco em um still de catálogo", w: 960, h: 640, pos: "center 50%" },
  "design-identidade": { src: "/fotos/flatlay-marca.webp", alt: "Caderno preto, caneta, relógio e notebook alinhados em uma composição vista de cima", w: 960, h: 641, pos: "center 50%" },
  "criacao-logo": { src: "/fotos/letra-desenho.webp", alt: "Mão desenhando letras a lápis em uma folha grande sobre a mesa", w: 960, h: 640, pos: "center 50%" },
  "automacoes-ia": { src: "/fotos/operacao-diaria.webp", alt: "Profissional atendendo pelo notebook em uma mesa de trabalho", w: 960, h: 640, pos: "center 45%" },
  "crm-com-ia": { src: "/fotos/atendimento-crm.webp", alt: "Profissional de óculos atendendo pelo celular com o notebook aberto na mesa", w: 960, h: 640, pos: "center 40%" },
  "sdr-com-ia": { src: "/fotos/videochamada-comercial.webp", alt: "Homem sorrindo ao olhar para a tela do celular durante uma reunião, com colegas ao fundo", w: 960, h: 640, pos: "center 35%" },
};

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
  const cor = CLARO_PILLAR_ACCENT[pil.key];
  const wa = WHATSAPP
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Quero falar sobre ${s.title}.`)}`
    : "/contato";

  // Cross-link com critério: primeiro os irmãos do MESMO pilar (o pilar "IA" tem
  // um serviço só, então essa lista pode vir vazia — o bloco some nesse caso).
  const samePillar = siteServices.filter((o) => o.slug !== s.slug && pil.slugs.includes(o.slug));
  const others = siteServices.filter((o) => o.slug !== s.slug);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        // `provider` referencia a Organization pelo @id publicado no layout.tsx.
        // Antes declarava uma Organization NOVA e sem @id: o Google via duas
        // empresas homônimas na mesma página em vez de uma entidade só, e o
        // grafo das 19 páginas ficava fragmentado.
        "@type": "Service",
        "@id": `${SITE_URL}/servicos/${s.slug}#service`,
        name: s.title,
        serviceType: s.title,
        description: s.long,
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "Brasil" },
        url: `${SITE_URL}/servicos/${s.slug}`,
        isPartOf: { "@id": `${SITE_URL}/servicos` },
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
        "@id": `${SITE_URL}/servicos/${s.slug}#faq`,
        mainEntity: s.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <PageShellClaro
      crumbs={[{ label: "Início", href: "/" }, { label: "Serviços", href: "/servicos" }, { label: s.title }]}
      accent={cor}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="sec svc-sec-hero">
        <div className="wrap svc-hero">
          <div className="svc-hero-copy">
            <div className="svc-badge pg-in" style={{ animationDelay: "0.02s" }}>
              <span className="svc-badge-dot" aria-hidden />
              {pil.short}
              <span className="svc-badge-sep" aria-hidden />
              <span className="svc-badge-label">{pil.label}</span>
            </div>

            <h1 className="pg-h1 svc-h1 pg-in" style={{ animationDelay: "0.08s" }}>{s.title}</h1>

            <p className="pg-lede pg-in" style={{ animationDelay: "0.14s" }}>{s.long}</p>

            <div className="svc-actions pg-in" style={{ animationDelay: "0.2s" }}>
              <Link href="/contato" className="btn btn-p">Solicitar orçamento</Link>
              {WHATSAPP ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-s">Falar no WhatsApp</a>
              ) : (
                <Link href="/sobre" className="btn btn-s">Ver projetos no ar</Link>
              )}
            </div>
          </div>

          {/* O grafismo do serviço como protagonista — cada página abre com o
              seu próprio desenho, não com um efeito genérico repetido 19 vezes. */}
          <div className="svc-plate pg-in" style={{ animationDelay: "0.12s" }}>
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
              {/* Era s.tags[0] — mostrava o primeiro item da lista de tags do
                  serviço isolado no canto, e em "loja-virtual" isso calhava
                  de ser "Shopify": parecia selo de parceria oficial com UMA
                  plataforma concorrente, o que não é verdade (o serviço é
                  agnóstico de plataforma). Trocado por uma marca fixa e
                  sempre correta. */}
              <span className="mono svc-plate-foot-r">HyperGrow</span>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap"><hr className="hairline" /></div>

      {/* ── CORPO: um bloco grande por etapa, alternando de lado ───────────
          Era uma lista vertical com um "01" de 11px em mono — o mesmo texto,
          apresentado como documento. Agora cada item de `s.body` é um bloco
          com número grande na cor do pilar, título ao lado, o texto num painel
          com borda que acende no hover (.lit, o mesmo mecanismo da home) e um
          elemento gráfico. O conteúdo NÃO mudou: continua vindo inteiro de
          lib/site-services.ts.

          Um elemento gráfico por bloco, nunca dois — o pedido do dono foi
          "com efeitos, mas não poluído". O primeiro bloco recebe a fotografia
          do serviço; os seguintes recebem a placa com o grafismo do próprio
          serviço, que é desenho de marca e não foto de banco repetida. */}
      <section className="sec svc-sec">
        <div className="wrap svc-steps">
          {s.body.map((b, i) => {
            const n = String(i + 1).padStart(2, "0");
            const foto = i === 0 ? SERVICE_PHOTO[s.slug] : undefined;
            // Dado real do próprio serviço no rótulo da placa, nunca número
            // inventado (regra 8 da hg-regras-de-bug): cicla pelas tags reais
            // já cadastradas em lib/site-services.ts.
            const stepTag = s.tags.length ? s.tags[i % s.tags.length] : pil.label;
            return (
              <article key={b.h} className={"svc-step" + (i % 2 === 1 ? " svc-step-flip" : "")}>
                <div className="svc-step-txt">
                  <div className="svc-step-head">
                    <span className="svc-step-n" aria-hidden>{n}</span>
                    <h2 className="svc-step-h">{b.h}</h2>
                  </div>
                  <div className="svc-step-panel lit">
                    {b.p
                      .split(/\n\s*\n/)
                      .map((para) => para.trim())
                      .filter(Boolean)
                      .map((para, pi) => (
                        <p className="svc-step-p" key={pi}>{para}</p>
                      ))}
                  </div>
                </div>

                <figure className="svc-step-fig lit">
                  {foto ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      className="svc-step-img"
                      src={foto.src}
                      alt={foto.alt}
                      width={foto.w}
                      height={foto.h}
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: foto.pos }}
                    />
                  ) : (
                    <span className="svc-step-plate" aria-hidden>
                      <span className="svc-step-grid" />
                      <span className="svc-step-glow" />
                      <span className="svc-tick tl" />
                      <span className="svc-tick tr" />
                      <span className="svc-tick bl" />
                      <span className="svc-tick br" />
                      <span className="svc-step-glyph">
                        <ServiceGlyph slug={s.slug} height={200} />
                      </span>
                      <span className="svc-step-badge">
                        <span className="mono svc-step-badge-n">{n}</span>
                        <span className="mono svc-step-badge-t">{stepTag}</span>
                      </span>
                    </span>
                  )}
                </figure>
              </article>
            );
          })}
        </div>
      </section>

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
          <div className="svc-card lit">
            <h2 className="svc-card-h">O que está incluído</h2>
            <div className="svc-tags">
              {s.tags.map((t) => <span key={t} className="chip">{t}</span>)}
            </div>
          </div>
          <div className="svc-card svc-card-acc lit">
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
          <span className="pg-kicker">Dúvidas</span>
          <h2 className="pg-h2">Perguntas frequentes</h2>
          <div className="svc-faq-list">
            {s.faq.map((f) => (
              <details key={f.q} className="svc-faq lit">
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
          <div className="pg-cta">
            <h2 className="pg-h2">Pronto para {s.title.toLowerCase()}?</h2>
            <p className="pg-p">Fale com a HyperGrow e receba uma proposta sob medida em até 1 dia útil.</p>
            <div className="pg-cta-actions">
              <Link href="/contato" className="btn btn-p">Solicitar proposta</Link>
              {WHATSAPP ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-s">Conversar no WhatsApp</a>
              ) : (
                <Link href="/servicos" className="btn btn-s">Ver todos os serviços</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── OUTROS SERVIÇOS ──────────────────────────────────────────────── */}
      <section className="sec svc-sec svc-sec-last">
        <div className="wrap">
          {samePillar.length > 0 && (
            <>
              <span className="pg-kicker">Mesmo pilar</span>
              <h2 className="pg-h2">Outros serviços de {pil.label}</h2>
              <p className="svc-rel-sub">{pil.desc}</p>
              <div className="svc-rel">
                {samePillar.map((o) => (
                  <Link key={o.slug} href={`/servicos/${o.slug}`} className="svc-rel-card lit">
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
                <Link key={o.slug} href={`/servicos/${o.slug}`} className="chip svc-all-pill">{o.title}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </PageShellClaro>
  );
}

/* ═══ Página de serviço — sistema visual por pilar, tema CLARO ══════════════
   Regras de sobrevivência aplicadas aqui:
   · nenhuma largura fixa em px sem min(Xpx, 100%)
   · grids sempre repeat(auto-fit, minmax(min(100%, X), 1fr))
   · nenhum filter:blur() e nenhum backdrop-filter
   · nenhuma classe .reveal/.stagger/.rv: o observer que as liga vive na home.
     Aqui elas ficariam em opacity:0 para sempre. Entrada do hero = animação de
     tempo (.pg-in, sempre completa); reveal de rolagem = progressive
     enhancement com estado base VISÍVEL.
   ═══════════════════════════════════════════════════════════════════════════ */
const CSS = `
  .cl .svc-sec-hero { padding-top: clamp(20px, 3vw, 34px); padding-bottom: clamp(44px, 6vw, 76px); }
  .cl .svc-sec { padding-top: clamp(48px, 6vw, 84px); padding-bottom: 0; }
  .cl .svc-sec-last { padding-bottom: clamp(52px, 7vw, 88px); }

  /* ── hero ─────────────────────────────────────────────────────────────── */
  .cl .svc-hero { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
    gap: clamp(30px, 4vw, 60px); align-items: center; }
  .cl .svc-hero-copy { min-width: 0; }
  .cl .svc-h1 { margin-top: 20px; }

  .cl .svc-badge { display: inline-flex; align-items: center; gap: 9px; padding: 8px 15px; border-radius: 999px;
    font: 700 11px var(--text); letter-spacing: .16em; text-transform: uppercase; color: var(--acc);
    background: var(--acc-soft); border: 1px solid var(--acc-line); max-width: 100%; }
  .cl .svc-badge-dot { width: 7px; height: 7px; border-radius: 999px; background: var(--acc); flex-shrink: 0; }
  .cl .svc-badge-sep { width: 1px; height: 11px; background: var(--acc-line); flex-shrink: 0; }
  .cl .svc-badge-label { color: var(--ink-2); letter-spacing: .1em; font-weight: 500; }
  @media (max-width: 380px) { .cl .svc-badge-sep, .cl .svc-badge-label { display: none; } }

  .cl .svc-actions { display: flex; gap: 13px; flex-wrap: wrap; margin-top: clamp(26px, 3vw, 34px); }

  /* ── placa do grafismo (o protagonista) ───────────────────────────────── */
  .cl .svc-plate { position: relative; overflow: hidden; min-width: 0;
    /* teto de largura: impede que a placa vire um bloco gigante quando o hero
       cai para uma coluna só (tablet). Centralizada nos dois casos. */
    width: 100%; max-width: min(100%, 560px); margin-inline: auto; aspect-ratio: 4 / 3;
    display: flex; align-items: center; justify-content: center;
    border-radius: clamp(18px, 2vw, 28px); border: 1px solid var(--line);
    background: radial-gradient(120% 90% at 50% -12%, var(--acc-soft), transparent 60%),
                linear-gradient(180deg, #fff, var(--paper-2));
    box-shadow: var(--sh-3); }
  /* grade técnica, esmaecida nas bordas por máscara (sem blur) */
  .cl .svc-plate-grid { position: absolute; inset: 0; pointer-events: none;
    background-image: linear-gradient(rgba(11,18,32,.055) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(11,18,32,.055) 1px, transparent 1px);
    background-size: 38px 38px; background-position: center;
    -webkit-mask-image: radial-gradient(72% 72% at 50% 50%, #000, transparent 82%);
    mask-image: radial-gradient(72% 72% at 50% 50%, #000, transparent 82%); }
  /* halo do pilar: gradiente puro, jamais filter:blur */
  .cl .svc-plate-glow { position: absolute; left: 50%; top: 48%; width: 118%; aspect-ratio: 1 / 1;
    transform: translate(-50%, -50%); pointer-events: none;
    background: radial-gradient(circle, var(--acc-glow), transparent 62%); opacity: .8; }
  .cl .svc-tick { position: absolute; width: 13px; height: 13px; pointer-events: none; opacity: .7; }
  .cl .svc-tick.tl { top: 14px; left: 14px; border-top: 1.5px solid var(--acc); border-left: 1.5px solid var(--acc); }
  .cl .svc-tick.tr { top: 14px; right: 14px; border-top: 1.5px solid var(--acc); border-right: 1.5px solid var(--acc); }
  .cl .svc-tick.bl { bottom: 14px; left: 14px; border-bottom: 1.5px solid var(--acc); border-left: 1.5px solid var(--acc); }
  .cl .svc-tick.br { bottom: 14px; right: 14px; border-bottom: 1.5px solid var(--acc); border-right: 1.5px solid var(--acc); }

  .cl .svc-glyph { position: relative; z-index: 2; width: min(70%, 430px); color: var(--acc); }
  /* vence os atributos width/height do <svg> — nada de largura fixa em px */
  .cl .svc-glyph svg { width: 100%; height: auto; display: block; }

  .cl .svc-plate-foot { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; display: flex;
    align-items: center; justify-content: space-between; gap: 14px;
    padding: 0 clamp(16px, 2.4vw, 24px) clamp(14px, 2vw, 20px);
    font-size: 9.5px; letter-spacing: .18em; text-transform: uppercase; color: #5A6579; }
  .cl .svc-plate-foot span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cl .svc-plate-foot-r { color: var(--acc); text-align: right; }

  /* ── corpo: blocos grandes alternando de lado ──────────────────────────
     Cada etapa vira um bloco de duas colunas; o bloco par inverte os lados
     (a ordem no HTML nao muda, so a coluna visual). Em MD (900px) da escala
     oficial vira uma coluna, e o texto SEMPRE vem antes da imagem.
     minmax(0,...) nas duas colunas: sem isso o conteudo define o minimo da
     coluna e um paragrafo longo empurra a grade para fora da tela. */
  .cl .svc-steps { display: flex; flex-direction: column; gap: clamp(44px, 6vw, 92px); }
  .cl .svc-step { display: grid; grid-template-columns: minmax(0, 1.06fr) minmax(0, .94fr);
    gap: clamp(20px, 3.4vw, 54px); align-items: start; }
  .cl .svc-step-flip .svc-step-txt { order: 2; }
  .cl .svc-step-txt { min-width: 0; }

  /* numero: protagonista visual, nao mais um detalhe de 11px em mono */
  .cl .svc-step-head { display: flex; align-items: baseline; gap: clamp(12px, 1.8vw, 22px);
    flex-wrap: wrap; margin-bottom: clamp(14px, 1.8vw, 22px); }
  .cl .svc-step-n { flex: none; font: 800 clamp(46px, 7.4vw, 88px)/.82 var(--disp);
    letter-spacing: -.05em; color: var(--acc); font-variant-numeric: tabular-nums; }
  .cl .svc-step-h { min-width: 0; flex: 1 1 min(100%, 240px);
    font: 700 clamp(21px, 2.6vw, 30px)/1.16 var(--disp); letter-spacing: -.03em; color: var(--ink);
    margin: 0; text-wrap: balance; }

  /* painel do texto: fundo levissimo na cor do pilar (~4%), borda que responde */
  .cl .svc-step-panel { border-radius: clamp(16px, 1.8vw, 22px); padding: clamp(18px, 2.4vw, 30px);
    background: color-mix(in srgb, var(--acc) 4%, var(--card)); border: 1px solid var(--line);
    box-shadow: var(--sh-1); transition: border-color .3s var(--ease), box-shadow .3s var(--ease); }
  .cl .svc-step-panel:hover { border-color: var(--acc-line); box-shadow: var(--sh-2); }
  .cl .svc-step-p { font: 400 clamp(15.5px, 1.25vw, 17px)/1.75 var(--text); color: var(--ink-2);
    margin: 0; text-wrap: pretty; }
  /* Respiro entre paragrafos irmaos: lib/site-services.ts agora separa o corpo
     em 2-3 paragrafos curtos por linha em branco, renderizados como um p por
     trecho. Sem esta regra os paragrafos novos colam um no outro, porque a
     regra acima zera a margem pensando num p unico por bloco. */
  .cl .svc-step-p + .svc-step-p { margin-top: 14px; }

  /* elemento grafico: foto no 1o bloco, placa do grafismo nos demais */
  .cl .svc-step-fig { position: relative; margin: 0; overflow: hidden; width: 100%;
    aspect-ratio: 4 / 3; border-radius: clamp(18px, 2vw, 26px); border: 1px solid var(--line);
    background: var(--paper-2); box-shadow: var(--sh-2), inset 0 0 0 1px rgba(255,255,255,.6);
    transition: box-shadow .35s var(--ease), border-color .35s var(--ease); }
  /* moldura dupla (borda + friso interno claro) e resposta propria no hover,
     mesmo nivel de "vivo" que .svc-step-panel:hover ja tem -- antes esta
     caixa era a unica do bloco sem NENHUMA reacao ao passar o mouse. */
  .cl .svc-step-fig:hover { border-color: var(--acc-line);
    box-shadow: var(--sh-3), inset 0 0 0 1px rgba(255,255,255,.6); }
  .cl .svc-step-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .cl .svc-step-plate { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(120% 92% at 50% -10%, var(--acc-soft), transparent 62%),
                linear-gradient(180deg, #fff, var(--paper-2)); }
  .cl .svc-step-grid { position: absolute; inset: 0; pointer-events: none;
    background-image: linear-gradient(rgba(11,18,32,.075) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(11,18,32,.075) 1px, transparent 1px);
    background-size: 30px 30px; background-position: center;
    -webkit-mask-image: radial-gradient(80% 78% at 50% 50%, #000, transparent 92%);
    mask-image: radial-gradient(80% 78% at 50% 50%, #000, transparent 92%); }
  /* halo do pilar dentro da placa -- mesmo mecanismo do .svc-plate-glow do
     hero, gradiente puro, nunca filter:blur. Reforca a leitura de cor viva
     na caixa que antes era so cinza quase branco com um icone no meio. */
  .cl .svc-step-glow { position: absolute; left: 50%; top: 46%; width: 130%; aspect-ratio: 1 / 1;
    transform: translate(-50%, -50%); pointer-events: none;
    background: radial-gradient(circle, var(--acc-glow), transparent 60%); opacity: .85; }
  .cl .svc-step-glyph { position: relative; z-index: 2; width: min(76%, 420px); color: var(--acc); }
  .cl .svc-step-glyph svg { width: 100%; height: auto; display: block; }
  /* rotulo no rodape da placa, mesmo desenho do .svc-plate-foot do hero:
     numero do passo + uma tag REAL do proprio servico (lib/site-services.ts,
     nunca estatistica inventada -- regra 8 da hg-regras-de-bug). E o que muda
     a caixa de "vazia" para "com dado". */
  .cl .svc-step-badge { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; display: flex;
    align-items: center; justify-content: space-between; gap: 12px;
    padding: 0 clamp(14px, 2vw, 20px) clamp(12px, 1.8vw, 17px);
    font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase; }
  .cl .svc-step-badge-n { color: var(--acc); font-weight: 700; flex-shrink: 0; }
  .cl .svc-step-badge-t { color: #5A6579; min-width: 0; overflow: hidden; text-overflow: ellipsis;
    white-space: nowrap; text-align: right; }
  /* variacao discreta entre as placas para os blocos nao ficarem iguais */
  .cl .svc-step:nth-of-type(3) .svc-step-plate { background:
      radial-gradient(110% 88% at 12% 108%, var(--acc-soft), transparent 60%),
      linear-gradient(180deg, #fff, var(--paper-2)); }
  .cl .svc-step:nth-of-type(3) .svc-step-glyph { width: min(84%, 440px); }
  /* 4a placa: recorte macro do mesmo desenho (o grafismo estoura a moldura e a
     placa corta). E o que evita tres placas iguais numa pagina de 4 blocos sem
     precisar de mais uma foto de banco. */
  .cl .svc-step:nth-of-type(4) .svc-step-plate { background:
      radial-gradient(100% 84% at 92% 6%, var(--acc-soft), transparent 58%),
      linear-gradient(180deg, #fff, var(--paper-2)); }
  .cl .svc-step:nth-of-type(4) .svc-step-glyph { width: min(118%, 620px); transform: translateX(-13%); }
  @media (max-width: 600px) {
    .cl .svc-step:nth-of-type(4) .svc-step-glyph { width: min(100%, 420px); transform: none; }
  }

  /* MD: uma coluna. Ordem visual = a do HTML (numero + titulo + texto, depois
     imagem) para nao inverter a leitura no celular. */
  @media (max-width: 900px) {
    .cl .svc-step { grid-template-columns: 1fr; gap: clamp(18px, 3vw, 26px); }
    .cl .svc-step-flip .svc-step-txt { order: 0; }
    .cl .svc-step-fig { aspect-ratio: 16 / 10; }
  }
  @media (max-width: 600px) {
    .cl .svc-step-head { gap: 10px; }
    .cl .svc-step-fig { aspect-ratio: 3 / 2; }
  }

  /* ── cards incluído / ganha ───────────────────────────────────────────── */
  .cl .svc-duo { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 18px; }
  /* Mesma reacao dos demais cartoes do site (borda assume a cor do pilar +
     sombra sobe). Sem translateY aqui: sao dois blocos lado a lado do mesmo
     tamanho, e levantar um so descasa a linha de base dos dois. */
  .cl .svc-card { border-radius: 22px; padding: clamp(24px, 3vw, 34px); background: var(--card);
    border: 1px solid var(--line); box-shadow: var(--sh-1);
    transition: border-color .3s var(--ease), box-shadow .3s var(--ease); }
  .cl .svc-card:hover { border-color: color-mix(in srgb, var(--acc) 34%, var(--line)); box-shadow: var(--sh-2); }
  .cl .svc-card-acc { border-color: var(--acc-line); }
  .cl .svc-card-h { font: 700 clamp(18px, 1.8vw, 21px) var(--disp); color: var(--ink); margin: 0;
    letter-spacing: -.02em; }
  .cl .svc-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
  .cl .svc-outcomes { list-style: none; padding: 0; margin: 18px 0 0; display: flex; flex-direction: column; gap: 13px; }
  .cl .svc-outcomes li { display: flex; gap: 11px; font: 400 15.5px/1.6 var(--text); color: var(--ink-2); }

  /* ── FAQ ──────────────────────────────────────────────────────────────── */
  .cl .svc-faq-wrap { max-width: 900px; }
  .cl .svc-faq-list { display: flex; flex-direction: column; gap: 10px; margin-top: clamp(22px, 2.6vw, 30px); }
  .cl .svc-faq { border-radius: 16px; padding: 0 clamp(16px, 2.2vw, 24px); background: var(--card);
    border: 1px solid var(--line); box-shadow: var(--sh-1);
    transition: border-color .35s var(--ease), box-shadow .35s var(--ease); }
  .cl .svc-faq:hover { border-color: var(--acc-line); box-shadow: var(--sh-2); }
  .cl .svc-faq[open] { border-color: var(--acc-line); }
  .cl .svc-faq summary { cursor: pointer; list-style: none; display: flex; align-items: center;
    justify-content: space-between; gap: 16px; min-height: 56px; padding: 15px 0;
    font: 600 clamp(15.5px, 1.4vw, 17px)/1.4 var(--text); color: var(--ink); }
  .cl .svc-faq summary::-webkit-details-marker { display: none; }
  /* sinal +/− construído com gradientes: sem dependência de ícone externo */
  .cl .svc-faq summary::after { content: ""; flex: none; width: 14px; height: 14px; color: var(--acc);
    background: linear-gradient(currentColor, currentColor) center / 100% 1.7px no-repeat,
                linear-gradient(currentColor, currentColor) center / 1.7px 100% no-repeat;
    transition: transform .35s var(--ease); }
  .cl .svc-faq[open] summary::after {
    background: linear-gradient(currentColor, currentColor) center / 100% 1.7px no-repeat;
    transform: rotate(180deg); }
  .cl .svc-faq p { font: 400 15.5px/1.7 var(--text); color: var(--ink-2); margin: 0; padding: 0 0 20px;
    max-width: 68ch; text-wrap: pretty; }

  /* ── outros serviços do mesmo pilar ───────────────────────────────────── */
  .cl .svc-rel-sub { font: 400 15.5px/1.6 var(--text); color: #5A6579; margin: 12px 0 0; max-width: 56ch; }
  .cl .svc-rel { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
    gap: 16px; margin-top: clamp(24px, 3vw, 32px); }
  .cl .svc-rel-card { display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
    border-radius: 20px; padding: clamp(20px, 2.4vw, 26px); text-decoration: none; min-width: 0;
    background: var(--card); border: 1px solid var(--line); box-shadow: var(--sh-1);
    transition: transform .3s var(--ease), box-shadow .3s var(--ease), border-color .3s var(--ease); }
  .cl .svc-rel-card:hover, .cl .svc-rel-card:focus-visible { transform: translateY(-3px); box-shadow: var(--sh-2);
    border-color: color-mix(in srgb, var(--acc) 34%, var(--line)); }
  .cl .svc-rel-glyph { color: var(--acc); display: block; width: min(68px, 100%); margin-bottom: 4px; }
  .cl .svc-rel-glyph svg { width: 100%; height: auto; display: block; }
  .cl .svc-rel-title { font: 700 16.5px/1.3 var(--disp); letter-spacing: -.02em; color: var(--ink);
    transition: color .25s var(--ease); }
  .cl .svc-rel-card:hover .svc-rel-title { color: var(--acc); }
  .cl .svc-rel-desc { font: 400 14px/1.55 var(--text); color: #5A6579; }
  .cl .svc-rel-go { margin-top: auto; padding-top: 10px; display: inline-flex; align-items: center; gap: 7px;
    font: 600 13px var(--text); color: var(--acc); }
  .cl .svc-rel-card:hover .svc-arrow { transform: translateX(3px); }
  .cl .svc-arrow { transition: transform .35s var(--ease); }

  /* ── todos os serviços (mantém a malha de links internos) ─────────────── */
  .cl .svc-all { margin-top: clamp(40px, 5vw, 64px); padding-top: clamp(26px, 3vw, 34px);
    border-top: 1px solid var(--line); }
  .cl .svc-all-head { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .cl .svc-all-h { font: 600 12px var(--text); text-transform: uppercase; letter-spacing: .16em;
    color: #5A6579; margin: 0; }
  .cl .svc-all-link { display: inline-flex; align-items: center; min-height: 44px; gap: 7px;
    font: 600 13.5px var(--text); color: var(--acc); text-decoration: none; }
  .cl .svc-all-link:hover .svc-arrow { transform: translateX(3px); }
  .cl .svc-all-pills { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 14px; }
  .cl .svc-all-pill { min-height: 44px; text-decoration: none; cursor: pointer; max-width: 100%;
    transition: border-color .25s var(--ease), color .25s var(--ease), box-shadow .25s var(--ease); }
  .cl .svc-all-pill:hover { color: var(--acc); border-color: var(--acc-line); box-shadow: var(--sh-1); }

  /* ── movimento ────────────────────────────────────────────────────────── */
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .cl .svc-card, .cl .svc-rel-card, .cl .svc-faq, .cl .svc-step {
        animation: pg-reveal-in linear both; animation-timeline: view(); animation-range: entry 2% entry 58%; }
      /* entrada do grafismo em separado do bloco: o glyph nasce um pouco menor
         e ganha opacidade/escala conforme a placa entra na tela -- mesmo
         padrao do .plat-rise em components/site/PlatformShowcase.tsx, so
         transform/opacity, sem custo de layout. */
      .cl .svc-step-glyph { animation: svc-glyph-in linear both; animation-timeline: view();
        animation-range: entry 8% entry 62%; }
    }
  }
  @keyframes svc-glyph-in { from { opacity: 0; transform: scale(.88); } to { opacity: 1; transform: scale(1); } }
  @media (prefers-reduced-motion: reduce) {
    .cl .svc-arrow, .cl .svc-faq summary::after { transition: none; }
    .cl .svc-rel-card:hover { transform: none; }
    .cl .svc-step-glyph { animation: none; }
    .cl .svc-step-fig { transition: none; }
  }
`;

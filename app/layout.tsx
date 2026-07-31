import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import { SITE_URL } from "@/lib/seo";

/* Sistema tipográfico: Archivo (display) + IBM Plex Sans (corpo) + IBM Plex Mono
   (dados/rótulos). Auto-hospedadas via next/font — não bloqueiam a renderização.

   PERFORMANCE: Inter e Space_Grotesk foram REMOVIDAS. Auditoria mediu que as duas
   eram baixadas em toda página (70.752 bytes) por causa do <link rel="preload"> que
   o next/font emite, mas o navegador reportava `status: "unloaded"` — nenhum texto
   as usava, porque hg-tokens.css redefine --font-sans/--font-display. O Tailwind
   (admin/privacidade/termos) foi apontado para as fontes de verdade em
   tailwind.config.ts, então nada perde tipografia.

   IBM Plex Mono: de 4 pesos para 2 (400/600) — economiza ~20 KB. Os usos de 700
   caem no 600, diferença imperceptível em rótulos de 10-13px. */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "HyperGrow — Crescimento Exponencial Através da Tecnologia",
  description:
    "Agência de transformação digital: websites, e-commerces, sistemas sob medida, automação de processos e inteligência artificial para acelerar o crescimento da sua empresa.",
  keywords: [
    "HyperGrow",
    "agência de tecnologia",
    "desenvolvimento de software",
    "criação de sites",
    "e-commerce",
    "sistemas sob medida",
    "automação de processos",
    "inteligência artificial",
    "agente de IA",
    "chatbot",
    "transformação digital",
  ],
  authors: [{ name: "HyperGrow" }],
  openGraph: {
    title: "HyperGrow — Crescimento Exponencial Através da Tecnologia",
    description:
      "Websites, sistemas, automação e inteligência artificial para acelerar os resultados da sua empresa.",
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "HyperGrow",
    // Dimensões REAIS do arquivo (auditoria pegou declarado 1200x630 num PNG de 720x405).
    images: [{ url: "/media/launch-poster.png", width: 720, height: 405, alt: "HyperGrow — agência de tecnologia e crescimento para e-commerce" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HyperGrow — Crescimento Exponencial Através da Tecnologia",
    description:
      "Websites, sistemas, automação e inteligência artificial para a sua empresa.",
    images: ["/media/launch-poster.png"],
  },
  // max-image-preview:large habilita miniatura grande na busca e elegibilidade no
  // Discover; max-snippet:-1 libera o tamanho do trecho. Sem isso o Google usa
  // miniatura pequena e corta o snippet — custa CTR de graça.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  metadataBase: new URL(SITE_URL),
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "HyperGrow" },
};

export const viewport: Viewport = {
  themeColor: "#0D1013",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* Grafo de entidade. Antes era uma Organization solta, sem `@id`, sem `logo` e
   com `sameAs` vazio — o Google e as IAs não tinham como reconciliar "HyperGrow"
   com uma entidade real. Agora:
   · `@id` estável amarra todas as páginas à MESMA organização
   · `logo` é o campo que o Google usa no painel de conhecimento
   · `WebSite` habilita o nome do site na busca
   · `ProfessionalService` descreve o que a empresa faz e para quem

   NOTA: `email` foi removido de propósito. O domínio hypergrow.com.br ainda não
   está registrado (DNS retorna NXDOMAIN), então publicar contato@hypergrow.com.br
   é publicar um endereço que devolve erro — pior que não publicar, e derruba a
   confiança na entidade. Volta assim que o domínio existir.
   `sameAs` fica vazio até haver perfis sociais reais para declarar. */
const ORG_ID = `${SITE_URL}/#organization`;

const graphSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": ORG_ID,
      name: "HyperGrow",
      url: SITE_URL,
      description:
        "Agência de tecnologia e crescimento para e-commerce: criação de site e loja virtual, SEO, tráfego pago, redes sociais, produção de foto e vídeo, design e agentes de inteligência artificial.",
      slogan: "Crescimento exponencial",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg`, contentUrl: `${SITE_URL}/icon.svg` },
      image: `${SITE_URL}/media/launch-poster.png`,
      areaServed: { "@type": "Country", name: "Brasil" },
      knowsAbout: [
        "criação de sites", "loja virtual", "e-commerce", "SEO",
        "tráfego pago", "Google Ads", "Meta Ads", "gestão de redes sociais",
        "produção de vídeo", "fotografia de produto", "identidade visual",
        "e-mail marketing", "automação", "agentes de inteligência artificial",
      ],
      sameAs: [] as string[],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "HyperGrow",
      inLanguage: "pt-BR",
      publisher: { "@id": ORG_ID },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <head>
        {/* substitui o apple-mobile-web-app-capable (deprecado) que o Next injeta via appleWebApp */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
        />
        {children}
      </body>
    </html>
  );
}

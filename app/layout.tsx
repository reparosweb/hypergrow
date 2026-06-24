import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Poppins } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import { SITE_URL } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});
// Poppins auto-hospedada (substitui o @import render-blocking que estava no hg-tokens.css).
// É a fonte do site público. Só os pesos/estilos realmente usados.
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
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
    images: [{ url: "/media/launch-poster.png", width: 1200, height: 630, alt: "HyperGrow" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HyperGrow — Crescimento Exponencial Através da Tecnologia",
    description:
      "Websites, sistemas, automação e inteligência artificial para a sua empresa.",
    images: ["/media/launch-poster.png"],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(SITE_URL),
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "HyperGrow" },
};

export const viewport: Viewport = {
  themeColor: "#050b1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HyperGrow",
  url: SITE_URL,
  description:
    "Agência de transformação digital: websites, e-commerces, sistemas, automação e inteligência artificial.",
  email: "contato@hypergrow.com.br",
  areaServed: "BR",
  sameAs: [] as string[],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${display.variable} ${poppins.variable}`}>
      <body>
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        {children}
      </body>
    </html>
  );
}

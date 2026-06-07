import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const SITE_URL = "https://hypergrow.com.br";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "HyperGrow — Crescimento Exponencial Através da Tecnologia",
    description:
      "Websites, sistemas, automação e inteligência artificial para a sua empresa.",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(SITE_URL),
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
    <html lang="pt-BR" className={`${inter.variable} ${display.variable}`}>
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

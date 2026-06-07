import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nexlab — Estúdio de produtos digitais que vendem",
  description:
    "Nexlab cria e opera SaaS de verdade: agendamento, captação para profissionais, sorteios com IA, nutrição por foto e logística. Produtos no ar, gerando receita.",
  keywords: [
    "Nexlab",
    "estúdio de software",
    "SaaS",
    "Agentop",
    "Marido de Aluguel",
    "Sorteio Bilionário",
    "NutriSnap",
    "Unixx",
    "Packslog",
  ],
  openGraph: {
    title: "Nexlab — Estúdio de produtos digitais que vendem",
    description:
      "Produtos SaaS reais, no ar e gerando receita. Conheça o portfólio da Nexlab.",
    type: "website",
  },
  metadataBase: new URL("https://nexlab.com.br"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}

"use client";

import {
  Bot, Camera, ChartNoAxesCombined, Clapperboard, Filter, GalleryVerticalEnd,
  Images, Instagram, LayoutDashboard, LayoutTemplate, Mail, Megaphone, Package,
  Palette, PenTool, QrCode, Search, Server, Smartphone, Store, Target, Video,
  ShoppingCart, TrendingUp,
  type LucideIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   Fonte única do mapa ícone-de-serviço → componente lucide-react, usada por
   ClaroNav (menu em cascata) E ClaroSolucoes (grade de serviços por pilar).

   Por que existe: o campo `icon` de cada serviço em lib/site-services.ts é uma
   STRING vinda de dado (ex.: "layout-template"), não um import estático — mas
   os NOMES são poucos e conhecidos (22, conferidos por script antes deste
   arquivo existir). Em vez de cada componente reinventar o mapa (ou usar um
   lookup dinâmico tipo `Icons[nome]`, que desativa o tree-shaking do webpack e
   baixaria a biblioteca inteira — o projeto já levou duas auditorias de
   performance por bundle inchado), os 22 ícones ficam importados aqui, uma vez
   só, como imports nomeados de verdade.

   Se um serviço novo usar ícone fora desta lista, o React caía sem crashar
   (fallback undefined → renderiza nada) — por isso o fallback abaixo é visível
   (ponto), não silencioso, para o bug aparecer na tela em vez de sumir. */
const MAP: Record<string, LucideIcon> = {
  // Os 2 abaixo são ícone de PILAR (lib/pillars.ts), não de serviço — "bot" e
  // "palette" já cobrem os outros 2 pilares por coincidência (mesmo nome usado
  // por um serviço daquela família). Ficam no mesmo mapa porque ClaroNav e
  // ClaroSolucoes precisam resolver ícone de pilar E de serviço com a mesma
  // função — dois mapas diferentes por dois componentes divergiria.
  "shopping-cart": ShoppingCart,
  "trending-up": TrendingUp,
  bot: Bot,
  camera: Camera,
  "chart-no-axes-combined": ChartNoAxesCombined,
  clapperboard: Clapperboard,
  filter: Filter,
  "gallery-vertical-end": GalleryVerticalEnd,
  images: Images,
  instagram: Instagram,
  "layout-dashboard": LayoutDashboard,
  "layout-template": LayoutTemplate,
  mail: Mail,
  megaphone: Megaphone,
  package: Package,
  palette: Palette,
  "pen-tool": PenTool,
  "qr-code": QrCode,
  search: Search,
  server: Server,
  smartphone: Smartphone,
  store: Store,
  target: Target,
  video: Video,
};

export function ClaroServiceIcon({ name, size = 18, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const Cmp = MAP[name];
  if (!Cmp) return <span aria-hidden style={{ width: size, height: size, display: "inline-block", borderRadius: 999, background: "currentColor", opacity: 0.3 }} />;
  return <Cmp size={size} style={{ flexShrink: 0, ...style }} aria-hidden />;
}

import AfiliadoPortal from "@/components/afiliado/AfiliadoPortal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Área do afiliado — HyperGrow", robots: { index: false } };

/* Sessão e papel já validados em app/afiliado/layout.tsx. Igual à tela de
   Usuários do admin, os dados vêm todos pelo cliente (chamarApi) — não há
   nada para buscar no servidor aqui. */
export default function AfiliadoPage() {
  return <AfiliadoPortal />;
}

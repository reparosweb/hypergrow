import Agenda from "@/components/admin/Agenda";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Agenda — HyperGrow", robots: { index: false } };

/* Sessão validada em (painel)/layout.tsx; módulo "agenda" checado no servidor
   pelo roteador (lib/permissions.ts). Componente já buscava tudo via
   chamarApi — faltava só esta página para deixar de dar 404. */
export default function AgendaPage() {
  return <Agenda />;
}

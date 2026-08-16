import Automacoes from "@/components/admin/Automacoes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Automações — HyperGrow", robots: { index: false } };

/* Sessão validada em `(painel)/layout.tsx`; o módulo "automacoes" é restrito
   a `super` em `lib/permissions.ts` e recusado no servidor pelo roteador —
   a barra lateral esconder o item é conveniência, não segurança.

   Client-side puro (mesmo padrão de Usuarios.tsx): a tela alterna entre
   réguas e histórico via `chamarApi`, sem dado inicial do servidor. */
export default function AutomacoesPage() {
  return <Automacoes />;
}

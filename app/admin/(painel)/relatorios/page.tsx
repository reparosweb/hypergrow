import Relatorios from "@/components/admin/Relatorios";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Relatórios — HyperGrow", robots: { index: false } };

/* Sessão validada em `(painel)/layout.tsx`; o módulo "relatorios" é liberado
   para `super` e `operador` em `lib/permissions.ts`.

   Igual a Usuarios.tsx: não busca nada no servidor. A tela soma cinco ações
   diferentes do módulo (kpis/funil/origem/perdas/receita-mensal) e ainda tem
   filtro de período que precisa recarregar em cliente de qualquer forma —
   buscar a primeira leva no servidor só duplicaria a lógica sem ganhar nada. */
export default function RelatoriosPage() {
  return <Relatorios />;
}

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase";
import { requireUser } from "@/lib/modules/_shared";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* ─────────────────────────────────────────────────────────────────────────────
   Layout do painel logado.

   O route group `(painel)` NÃO aparece na URL: `/admin`, `/admin/financeiro` e
   `/admin/cobrancas` continuam exatamente onde estavam. Ele existe só para dar
   um layout comum a quem já está logado — `login/` e `convite/` ficam de fora,
   porque quem chega nelas ainda não tem sessão.

   A validação da sessão vivia COPIADA no topo de cada page.tsx (três cópias das
   mesmas quatro linhas). Página nova é o caso clássico de esquecer a cópia e
   publicar uma tela aberta. Aqui é uma vez só, e vale para tudo que estiver
   dentro do grupo.
   ──────────────────────────────────────────────────────────────────────────── */
export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(getServerSupabase());
  if (!user) redirect("/admin/login");

  return <AdminShell user={user}>{children}</AdminShell>;
}

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase";
import { requireUser } from "@/lib/modules/_shared";
import AfiliadoShell from "@/components/afiliado/AfiliadoShell";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* ─────────────────────────────────────────────────────────────────────────────
   Layout do portal do afiliado — `/afiliado`.

   FICA FORA de `/admin` de propósito: é uma área leve, própria, sem a barra
   lateral cheia de módulos que o afiliado não usa. Por ficar fora de `/admin`,
   o `middleware.ts` (cujo matcher é só "/admin" e "/admin/:path*") NÃO cobre
   este caminho — por isso a checagem de sessão precisa acontecer AQUI, do
   mesmo jeito que `app/admin/(painel)/layout.tsx` faz para o painel principal.
   Mesma sessão, mesmo cookie (`requireUser`/`hg_admin`) — não é um login novo.

   Quem não está logado, ou está logado mas não é 'afiliado' nem 'super', volta
   para `/admin/login`. ('super' entra aqui também de propósito: é como o dono
   confere a própria tela do afiliado sem precisar de um segundo usuário.)
   ──────────────────────────────────────────────────────────────────────────── */
export default async function AfiliadoLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(getServerSupabase());
  if (!user) redirect("/admin/login");
  if (user.role !== "afiliado" && user.role !== "super") redirect("/admin/login");

  return <AfiliadoShell user={user}>{children}</AfiliadoShell>;
}

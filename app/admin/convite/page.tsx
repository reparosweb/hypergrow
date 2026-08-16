import ConviteForm from "@/components/admin/ConviteForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Criar acesso — HyperGrow", robots: { index: false } };

/* ─────────────────────────────────────────────────────────────────────────────
   Tela de aceite do convite.

   Fica FORA do route group `(painel)` de propósito: quem chega aqui ainda não
   tem sessão, então não pode passar pelo layout que exige login nem ver a barra
   lateral do painel. O `middleware.ts` também libera este caminho.

   É uma página de servidor que só lê o token da URL e passa para o formulário
   cliente. Ler a query com `useSearchParams` direto num componente cliente
   obrigaria a embrulhar tudo em <Suspense> para o build não falhar — assim é
   mais simples e o token nunca precisa de JavaScript para ser lido.
   ──────────────────────────────────────────────────────────────────────────── */
export default function ConvitePage({ searchParams }: { searchParams: { token?: string } }) {
  return <ConviteForm token={searchParams?.token ?? ""} />;
}

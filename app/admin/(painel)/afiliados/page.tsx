import Afiliados from "@/components/admin/Afiliados";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Afiliados — HyperGrow", robots: { index: false } };

/* Sessão validada em `(painel)/layout.tsx`; o acesso ao módulo "afiliado" é
   restrito a super e afiliado em `lib/permissions.ts`, mas as ações
   administrativas (listar-afiliados, criar-afiliado, aprovar-comissao) só
   respondem para `role === "super"` dentro de mod-afiliados.ts — a barra
   lateral esconder o item pra quem não é super é conveniência, não segurança. */
export default function AfiliadosPage() {
  return <Afiliados />;
}

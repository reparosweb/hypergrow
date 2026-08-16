import Usuarios from "@/components/admin/Usuarios";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Usuários — HyperGrow", robots: { index: false } };

/* Sessão validada em `(painel)/layout.tsx`; o acesso ao módulo "usuarios" é
   restrito a `super` em `lib/permissions.ts` e recusado no servidor pelo
   roteador — a barra lateral esconder o item é conveniência, não segurança.

   Diferente das outras telas do painel, esta NÃO busca dados no servidor: a
   lista vem por `usuarios:list` no cliente. Motivo: o convite devolve um link
   que só existe uma vez na resposta, então a tela já precisa conversar com a
   API de qualquer jeito — buscar metade no servidor e metade no cliente
   deixaria as duas fontes fora de sincronia depois do primeiro convite. */
export default function UsuariosPage() {
  return <Usuarios />;
}

"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import type { UsuarioSessao } from "@/lib/permissions";

/* ─────────────────────────────────────────────────────────────────────────────
   Casca leve do portal do afiliado. Diferente de AdminShell.tsx (barra
   lateral com vários módulos), aqui é só um cabeçalho — a área tem UMA tela
   (components/afiliado/AfiliadoPortal.tsx), então não há para onde navegar.

   Reaproveita o mesmo botão "Sair" do painel admin (mesmo cookie de sessão,
   mesma rota de logout) — não existe um logout separado para o afiliado.
   ──────────────────────────────────────────────────────────────────────────── */
export default function AfiliadoShell({
  user,
  children,
}: {
  user: UsuarioSessao;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function sair() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-ink-950 text-slate-200">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/10 bg-ink-950/90 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2 font-display text-base font-bold text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan text-white">
            H
          </span>
          Hyper<span className="gradient-text">grow</span>
          <span className="ml-1 text-xs font-normal text-slate-500">afiliado</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="truncate text-[13px] font-semibold text-white">{user.name || user.email}</p>
            <p className="truncate text-[11.5px] text-slate-500">Afiliado</p>
          </div>
          <button
            onClick={sair}
            aria-label="Sair"
            title="Sair"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

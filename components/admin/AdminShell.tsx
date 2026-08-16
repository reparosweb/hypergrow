"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, RefreshCw, ShieldAlert } from "lucide-react";
import { NAV, findNavItem, type ItemNav } from "@/lib/admin-nav";
import { userCanAccess, ROTULO_PAPEL, type UsuarioSessao } from "@/lib/permissions";
import { ENV_SUPER_ID } from "@/lib/auth-constants";

/* ─────────────────────────────────────────────────────────────────────────────
   Casca do painel: barra lateral por grupos + cabeçalho.

   Substitui os três cabeçalhos que cada tela desenhava por conta própria, cada
   um com um conjunto diferente de links digitados à mão. Agora o menu vem todo
   de `lib/admin-nav.ts` e é filtrado pelas permissões do usuário.

   ⚠️ Esconder um item aqui NÃO é segurança — é conforto. Quem forçar a URL
   ainda esbarra na checagem do servidor (`app/api/app/route.ts` e o layout do
   route group). Nunca dependa só desta filtragem.
   ──────────────────────────────────────────────────────────────────────────── */

export default function AdminShell({
  user,
  children,
}: {
  user: UsuarioSessao;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/admin";
  const [menuAberto, setMenuAberto] = useState(false);

  // Trocar de página fecha o menu do celular — senão ele fica por cima do
  // conteúdo que o usuário acabou de abrir.
  useEffect(() => setMenuAberto(false), [pathname]);

  const grupos = useMemo(
    () =>
      NAV.map((g) => ({ ...g, itens: g.itens.filter((i) => userCanAccess(user, i.modulo)) })).filter(
        (g) => g.itens.length > 0
      ),
    [user]
  );

  const atual = findNavItem(pathname);

  async function sair() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-ink-950 text-slate-200 lg:grid lg:grid-cols-[248px_1fr]">
      {/* ── Barra lateral ─────────────────────────────────────────────── */}
      <aside
        className={
          "fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-white/10 bg-ink-950 transition-transform lg:static lg:translate-x-0 " +
          (menuAberto ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 px-4 font-display text-base font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan text-white">
            H
          </span>
          Hyper<span className="gradient-text">grow</span>
          <button
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {grupos.map((g) => (
            <div key={g.id} className="mb-5">
              <p className="mb-1.5 px-2 font-mono text-[10.5px] font-semibold uppercase tracking-[.14em] text-slate-500">
                {g.titulo}
              </p>
              <ul className="space-y-0.5">
                {g.itens.map((item) => (
                  <li key={item.slug}>
                    <ItemLink item={item} ativo={atual?.slug === item.slug} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          {user.id === ENV_SUPER_ID && (
            <p className="mb-2 flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-[11.5px] leading-snug text-amber-200">
              <ShieldAlert size={13} className="mt-0.5 shrink-0" />
              Acesso de emergência (senha da Vercel). Crie o seu usuário em Usuários.
            </p>
          )}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{user.name || user.email}</p>
              <p className="truncate text-[11.5px] text-slate-500">{ROTULO_PAPEL[user.role]}</p>
            </div>
            <button
              onClick={sair}
              aria-label="Sair"
              title="Sair"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {menuAberto && (
        <button
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      {/* ── Conteúdo ──────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/10 bg-ink-950/90 px-4 backdrop-blur">
          <button
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 lg:hidden"
          >
            <Menu size={17} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-semibold text-white">{atual?.rotulo ?? "Painel"}</h1>
            {atual?.descricao && (
              <p className="truncate text-[11.5px] text-slate-500">{atual.descricao}</p>
            )}
          </div>

          <button
            onClick={() => router.refresh()}
            aria-label="Atualizar"
            title="Atualizar"
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
          >
            <RefreshCw size={16} />
          </button>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function ItemLink({ item, ativo }: { item: ItemNav; ativo: boolean }) {
  const Icone = item.icone;
  const base = "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition";

  if (item.disponivel === false) {
    return (
      <span
        title="Ainda não construído"
        aria-disabled="true"
        className={base + " cursor-not-allowed text-slate-600"}
      >
        <Icone size={16} /> {item.rotulo}
        <span className="ml-auto rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-600">
          em breve
        </span>
      </span>
    );
  }

  return (
    <a
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      className={base + (ativo ? " bg-brand-500/15 text-white" : " text-slate-400 hover:bg-white/5 hover:text-slate-100")}
    >
      <Icone size={16} /> {item.rotulo}
    </a>
  );
}

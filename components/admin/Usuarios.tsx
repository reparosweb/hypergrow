"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Copy, Check, RefreshCw, Ban, ShieldCheck, Trash2 } from "lucide-react";
import { chamarApi, fmtData, fmtDataHora } from "@/lib/admin-api";
import { PAPEIS, type Papel } from "@/lib/permissions";
import { Painel, Erro, Vazio, Carregando, Campo, Selecao, Modal, Nota } from "./ui";

/* ─────────────────────────────────────────────────────────────────────────────
   USUÁRIOS — quem entra no painel e o que cada um vê.

   É a tela que fecha o ciclo da autenticação multiusuário: sem ela, a tabela
   `admin_users` nasce vazia e o dono fica preso para sempre na senha de
   emergência (ADMIN_PASSWORD), que é justamente o que se quer aposentar.

   CONVITE SEM E-MAIL, DE PROPÓSITO: o servidor devolve o link do convite UMA
   única vez (depois só existe o hash no banco). Quem convidou copia e manda
   por WhatsApp. Isso evita fazer o cadastro de equipe depender de o domínio
   estar verificado no Resend — que hoje não está.
   ──────────────────────────────────────────────────────────────────────────── */

type Usuario = {
  id: string;
  email: string;
  name: string | null;
  role: Papel;
  status: "convidado" | "ativo" | "bloqueado";
  allowed_modules: string[] | null;
  invite_expires_at: string | null;
  last_login_at: string | null;
  created_at: string;
};

const ROTULO_PAPEL: Record<Papel, string> = {
  super: "Administrador",
  operador: "Operador",
  afiliado: "Afiliado",
  cliente: "Cliente",
};

const AJUDA_PAPEL: Record<Papel, string> = {
  super: "Vê tudo e gerencia usuários.",
  operador: "CRM, agenda e relatórios. Não vê financeiro nem usuários.",
  afiliado: "Só o portal de indicações (tela ainda não construída).",
  cliente: "Reservado para uso futuro.",
};

const COR_STATUS: Record<Usuario["status"], string> = {
  ativo: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  convidado: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  bloqueado: "text-slate-400 border-white/10 bg-white/5",
};

export default function Usuarios() {
  const [lista, setLista] = useState<Usuario[] | null>(null);
  const [erro, setErro] = useState("");
  const [novo, setNovo] = useState(false);
  /* Link de convite recém-gerado. Fica em memória porque o servidor NUNCA
     devolve de novo — recarregar a página perde o link e obriga a gerar outro. */
  const [convite, setConvite] = useState<{ nome: string; link: string; expira: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  const carregar = useCallback(async () => {
    setErro("");
    try {
      const r = await chamarApi<{ usuarios: Usuario[] }>("usuarios", "list");
      setLista(r.usuarios ?? []);
    } catch (e) {
      setErro((e as Error).message);
      setLista([]);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function convidar(form: HTMLFormElement) {
    const fd = new FormData(form);
    setErro("");
    try {
      const r = await chamarApi<{ link: string; expiraEm: string }>("usuarios", "invite", {
        name: fd.get("name"),
        email: fd.get("email"),
        role: fd.get("role"),
      });
      setNovo(false);
      setConvite({ nome: String(fd.get("name") || ""), link: r.link, expira: r.expiraEm });
      setCopiado(false);
      carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function acao(u: Usuario, tipo: "bloquear" | "reativar" | "novo-convite" | "excluir") {
    setErro("");
    try {
      if (tipo === "excluir") {
        if (!confirm(`Excluir o acesso de ${u.name || u.email}? Isso não pode ser desfeito.`)) return;
        await chamarApi("usuarios", "delete", { id: u.id });
      } else if (tipo === "novo-convite") {
        const r = await chamarApi<{ link: string; expiraEm: string }>("usuarios", "reset-invite", { id: u.id });
        setConvite({ nome: u.name || u.email, link: r.link, expira: r.expiraEm });
        setCopiado(false);
      } else {
        await chamarApi("usuarios", "update", {
          id: u.id,
          status: tipo === "bloquear" ? "bloqueado" : "ativo",
        });
      }
      carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function trocarPapel(u: Usuario, role: string) {
    setErro("");
    try {
      await chamarApi("usuarios", "update", { id: u.id, role });
      carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  function copiar(link: string) {
    const url = `${window.location.origin}${link}`;
    navigator.clipboard?.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
      <Painel
        titulo="Quem tem acesso ao painel"
        acao={
          <button
            onClick={() => setNovo(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-400"
          >
            <Plus size={16} /> Convidar pessoa
          </button>
        }
      >
        {erro && <Erro texto={erro} />}

        {convite && (
          <div className="mb-4 rounded-xl border border-brand-400/30 bg-brand-500/10 p-4">
            <p className="text-sm font-semibold text-white">
              Convite criado para {convite.nome}
            </p>
            <p className="mt-1 text-[13px] text-slate-300">
              Copie o link e mande por WhatsApp. Ele aparece <b>só agora</b> — depois disso nem eu
              consigo recuperar, só gerar outro. Vale até {fmtData(convite.expira)}.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="flex-1 min-w-[220px] overflow-x-auto rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-[12.5px] text-slate-200">
                {typeof window !== "undefined" ? `${window.location.origin}${convite.link}` : convite.link}
              </code>
              <button
                onClick={() => copiar(convite.link)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm text-white hover:bg-white/5"
              >
                {copiado ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Copiar</>}
              </button>
              <button
                onClick={() => setConvite(null)}
                className="h-10 rounded-xl px-3 text-sm text-slate-400 hover:text-white"
              >
                fechar
              </button>
            </div>
          </div>
        )}

        {lista === null && <Carregando />}
        {lista?.length === 0 && (
          <>
            <Vazio texto="Nenhum usuário cadastrado ainda." />
            <Nota>
              Você está entrando pela senha de emergência. Convide a si mesmo como Administrador,
              abra o link, crie sua senha — e a partir daí você tem uma conta de verdade, com nome e
              histórico de acesso.
            </Nota>
          </>
        )}

        {!!lista?.length && (
          <div className="overflow-hidden rounded-xl border border-white/10">
            {lista.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0"
              >
                <div className="min-w-[180px] flex-1">
                  <b className="block text-[13.5px] font-semibold text-white">{u.name || "(sem nome)"}</b>
                  <span className="block text-[12px] text-slate-500">{u.email}</span>
                </div>

                <span className={`rounded-full border px-2.5 py-1 text-[11.5px] font-semibold ${COR_STATUS[u.status]}`}>
                  {u.status === "convidado" ? "aguardando" : u.status}
                </span>

                <select
                  value={u.role}
                  onChange={(e) => trocarPapel(u, e.target.value)}
                  aria-label={`Papel de ${u.name || u.email}`}
                  className="h-9 rounded-lg border border-white/10 bg-ink-900/70 px-2 text-[13px] text-white"
                >
                  {PAPEIS.map((p) => (
                    <option key={p} value={p}>{ROTULO_PAPEL[p]}</option>
                  ))}
                </select>

                <span className="text-[12px] text-slate-500">
                  {u.last_login_at ? `entrou ${fmtDataHora(u.last_login_at)}` : "nunca entrou"}
                </span>

                <div className="flex gap-1.5">
                  {u.status === "convidado" && (
                    <button
                      onClick={() => acao(u, "novo-convite")}
                      title="Gerar novo link de convite"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
                    >
                      <RefreshCw size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => acao(u, u.status === "bloqueado" ? "reativar" : "bloquear")}
                    title={u.status === "bloqueado" ? "Reativar acesso" : "Bloquear acesso"}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
                  >
                    {u.status === "bloqueado" ? <ShieldCheck size={15} /> : <Ban size={15} />}
                  </button>
                  <button
                    onClick={() => acao(u, "excluir")}
                    title="Excluir acesso"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Painel>

      {novo && (
        <Modal titulo="Convidar pessoa" onFechar={() => setNovo(false)}>
          <form
            onSubmit={(e) => { e.preventDefault(); convidar(e.currentTarget); }}
            className="grid gap-3"
          >
            <Campo nome="name" rotulo="Nome" obrigatorio />
            <Campo nome="email" rotulo="E-mail" tipo="email" obrigatorio />
            <Selecao
              nome="role"
              rotulo="Papel"
              valor="operador"
              opcoes={PAPEIS.map((p) => ({ valor: p, rotulo: `${ROTULO_PAPEL[p]} — ${AJUDA_PAPEL[p]}` }))}
            />
            <button
              type="submit"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-400"
            >
              Gerar link de convite
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

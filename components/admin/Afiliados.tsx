"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Copy, Check, ShieldCheck } from "lucide-react";
import { chamarApi, fmtDataHora, BRL } from "@/lib/admin-api";
import { Painel, Erro, Vazio, Carregando, Campo, Selecao, Modal, Nota } from "./ui";

/* ─────────────────────────────────────────────────────────────────────────────
   AFILIADOS — visão do super: quem são os afiliados, o link de cada um, e as
   comissões apuradas aguardando aprovação.

   Segue o mesmo molde de Usuarios.tsx: lista + modal de criação. A diferença
   é que aqui não se "convida" ninguém — o afiliado já é um `admin_users` de
   papel "afiliado" (convidado em Sistema > Usuários); esta tela só gera o
   código de indicação dele e define a comissão.
   ──────────────────────────────────────────────────────────────────────────── */

type Usuario = { id: string; name: string | null; email: string; status: string };

type Afiliado = {
  id: string;
  user_id: string;
  code: string;
  commission_pct: number;
  pix_key: string | null;
  status: "ativo" | "inativo";
  created_at: string;
  usuario: { name: string | null; email: string } | null;
};

type Comissao = {
  id: string;
  affiliate_id: string;
  lead_id: string | null;
  value: number;
  status: "apurada" | "aprovada";
  payable_id: string | null;
  created_at: string;
  afiliado_code: string | null;
};

export default function Afiliados() {
  const [lista, setLista] = useState<Afiliado[] | null>(null);
  const [comissoes, setComissoes] = useState<Comissao[] | null>(null);
  const [candidatos, setCandidatos] = useState<Usuario[]>([]);
  const [erro, setErro] = useState("");
  const [novo, setNovo] = useState(false);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro("");
    try {
      const [a, c] = await Promise.all([
        chamarApi<{ afiliados: Afiliado[] }>("afiliado", "listar-afiliados"),
        chamarApi<{ comissoes: Comissao[] }>("afiliado", "listar-comissoes", { status: "apurada" }),
      ]);
      setLista(a.afiliados ?? []);
      setComissoes(c.comissoes ?? []);
    } catch (e) {
      setErro((e as Error).message);
      setLista([]);
      setComissoes([]);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function abrirNovo() {
    setErro("");
    try {
      const r = await chamarApi<{ usuarios: Usuario[] }>("afiliado", "usuarios-elegiveis");
      setCandidatos(r.usuarios ?? []);
      setNovo(true);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function criar(form: HTMLFormElement) {
    const fd = new FormData(form);
    setErro("");
    try {
      await chamarApi("afiliado", "criar-afiliado", {
        user_id: fd.get("user_id"),
        commission_pct: fd.get("commission_pct"),
        pix_key: fd.get("pix_key"),
      });
      setNovo(false);
      carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function aprovar(c: Comissao) {
    setErro("");
    try {
      const r = await chamarApi<{ aviso?: string }>("afiliado", "aprovar-comissao", { id: c.id });
      if (r.aviso) alert(r.aviso);
      carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  function copiarLink(a: Afiliado) {
    const url = `${window.location.origin}/?ref=${a.code}`;
    navigator.clipboard?.writeText(url);
    setCopiadoId(a.id);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
      <Painel
        titulo="Programa de afiliados"
        acao={
          <button
            onClick={abrirNovo}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-400"
          >
            <Plus size={16} /> Novo afiliado
          </button>
        }
      >
        {erro && <Erro texto={erro} />}

        {lista === null && <Carregando />}
        {lista?.length === 0 && (
          <>
            <Vazio texto="Nenhum afiliado cadastrado ainda." />
            <Nota>
              Primeiro convide a pessoa em Sistema {"›"} Usuários com o papel &quot;Afiliado&quot;. Depois
              volte aqui e clique em &quot;Novo afiliado&quot; para gerar o código de indicação dela.
            </Nota>
          </>
        )}

        {!!lista?.length && (
          <div className="overflow-hidden rounded-xl border border-white/10">
            {lista.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
                <div className="min-w-[180px] flex-1">
                  <b className="block text-[13.5px] font-semibold text-white">
                    {a.usuario?.name || a.usuario?.email || "(usuário removido)"}
                  </b>
                  <span className="block text-[12px] text-slate-500">{a.usuario?.email}</span>
                </div>

                <code className="rounded-lg border border-white/10 bg-ink-950 px-2.5 py-1 text-[12.5px] text-slate-200">
                  {a.code}
                </code>

                <span className="text-[13px] text-slate-300">{a.commission_pct}%</span>

                <span
                  className={
                    "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold " +
                    (a.status === "ativo"
                      ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
                      : "text-slate-400 border-white/10 bg-white/5")
                  }
                >
                  {a.status}
                </span>

                <button
                  onClick={() => copiarLink(a)}
                  title="Copiar link de indicação"
                  className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
                >
                  {copiadoId === a.id ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </Painel>

      <div className="mt-6">
        <Painel titulo="Comissões apuradas aguardando aprovação">
          {comissoes === null && <Carregando />}
          {comissoes?.length === 0 && <Vazio texto="Nenhuma comissão apurada no momento." />}
          {!!comissoes?.length && (
            <div className="overflow-hidden rounded-xl border border-white/10">
              {comissoes.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
                  <code className="text-[12.5px] text-slate-300">{c.afiliado_code ?? "—"}</code>
                  <span className="min-w-[100px] flex-1 text-[13.5px] font-semibold text-white">{BRL.format(c.value)}</span>
                  <span className="text-[12px] text-slate-500">apurada em {fmtDataHora(c.created_at)}</span>
                  <button
                    onClick={() => aprovar(c)}
                    className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-[13px] font-semibold text-emerald-200 hover:bg-emerald-500/20"
                  >
                    <ShieldCheck size={14} /> Aprovar
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="p-4 pt-0">
            <Nota>
              Aprovar cria automaticamente um lançamento em Financeiro {"›"} A pagar. Marcar como pago
              acontece lá, no fluxo financeiro que já existe — aqui só apura e aprova a comissão.
            </Nota>
          </div>
        </Painel>
      </div>

      {novo && (
        <Modal titulo="Novo afiliado" onFechar={() => setNovo(false)}>
          {candidatos.length === 0 ? (
            <Nota>
              Não há usuários com o papel &quot;Afiliado&quot; disponíveis para virar afiliado. Convide
              alguém em Usuários com esse papel primeiro (ou mude o papel de alguém já convidado) — cada
              usuário só pode ter um perfil de afiliado.
            </Nota>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); criar(e.currentTarget); }}
              className="grid gap-3"
            >
              <Selecao
                nome="user_id"
                rotulo="Usuário"
                opcoes={candidatos.map((u) => ({ valor: u.id, rotulo: `${u.name || u.email} — ${u.email}` }))}
              />
              <Campo nome="commission_pct" rotulo="Comissão (%)" tipo="number" placeholder="ex.: 10" obrigatorio />
              <Campo nome="pix_key" rotulo="Chave PIX (opcional)" placeholder="e-mail, telefone ou CPF" />
              <button
                type="submit"
                className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-400"
              >
                Criar afiliado
              </button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}

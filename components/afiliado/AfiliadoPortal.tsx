"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";
import { chamarApi, fmtData, fmtDataHora, BRL } from "@/lib/admin-api";
import { Painel, Erro, Vazio, Carregando, Nota, Metrica } from "@/components/admin/ui";

/* ─────────────────────────────────────────────────────────────────────────────
   Portal do afiliado — UMA tela com 4 seções (link, cliques, leads, comissões)
   em vez de 4 rotas. É uma área pequena de propósito: não há navegação a
   esconder nem estado de URL a sincronizar, então dividir em rotas separadas
   só adicionaria arquivos sem ganhar nada.

   Reaproveita os primitivos de components/admin/ui.tsx (Painel, Erro, Vazio,
   Carregando, Nota, Metrica) mesmo fora do AdminShell — são só classes
   Tailwind, não dependem do layout do painel.
   ──────────────────────────────────────────────────────────────────────────── */

type MeuLink = { code: string; url: string; statusAfiliado: "ativo" | "inativo" };
type Clique = { id: string; created_at: string };
type LeadAnonimo = { id: string; data: string; estagio: "em_andamento" | "fechado" | "perdido"; comissao_gerada: boolean };
type Comissao = { id: string; value: number; status: "apurada" | "aprovada" | "pago"; created_at: string };

const ROTULO_ESTAGIO: Record<LeadAnonimo["estagio"], string> = {
  em_andamento: "Em andamento",
  fechado: "Fechado",
  perdido: "Perdido",
};

const COR_ESTAGIO: Record<LeadAnonimo["estagio"], string> = {
  em_andamento: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  fechado: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  perdido: "text-slate-400 border-white/10 bg-white/5",
};

const ROTULO_STATUS_COMISSAO: Record<Comissao["status"], string> = {
  apurada: "apurada",
  aprovada: "aprovada — aguardando pagamento",
  pago: "pago",
};

const COR_STATUS_COMISSAO: Record<Comissao["status"], string> = {
  apurada: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  aprovada: "text-sky-300 border-sky-500/30 bg-sky-500/10",
  pago: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
};

export default function AfiliadoPortal() {
  const [link, setLink] = useState<MeuLink | null>(null);
  const [cliques, setCliques] = useState<Clique[] | null>(null);
  const [leads, setLeads] = useState<LeadAnonimo[] | null>(null);
  const [comissoes, setComissoes] = useState<Comissao[] | null>(null);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);

  const carregar = useCallback(async () => {
    setErro("");
    try {
      const [l, c, ld, cm] = await Promise.all([
        chamarApi<MeuLink>("afiliado", "meu-link"),
        chamarApi<{ cliques: Clique[] }>("afiliado", "meus-cliques"),
        chamarApi<{ leads: LeadAnonimo[] }>("afiliado", "meus-leads"),
        chamarApi<{ comissoes: Comissao[] }>("afiliado", "minhas-comissoes"),
      ]);
      setLink(l);
      setCliques(c.cliques ?? []);
      setLeads(ld.leads ?? []);
      setComissoes(cm.comissoes ?? []);
    } catch (e) {
      setErro((e as Error).message);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function copiarLink() {
    if (!link) return;
    navigator.clipboard?.writeText(link.url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const totalComissoes = (comissoes ?? []).reduce((s, c) => s + (c.value || 0), 0);
  const totalPago = (comissoes ?? []).filter((c) => c.status === "pago").reduce((s, c) => s + (c.value || 0), 0);
  const totalFechados = (leads ?? []).filter((l) => l.estagio === "fechado").length;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6">
      {erro && <Erro texto={erro} />}

      {link === null && !erro && <Carregando texto="Carregando seus dados…" />}

      {link && (
        <>
          {/* ── Link de indicação ────────────────────────────────────────── */}
          <Painel titulo="Seu link de indicação">
            {link.statusAfiliado === "inativo" && (
              <Nota>
                Seu perfil de afiliado está marcado como inativo — o link acima ainda funciona para
                rastrear cliques, mas fale com o administrador se algo parecer errado.
              </Nota>
            )}
            <div className="flex flex-wrap items-center gap-2 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-brand-300">
                <Link2 size={16} />
              </span>
              <code className="min-w-[220px] flex-1 overflow-x-auto rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-[12.5px] text-slate-200">
                {link.url}
              </code>
              <button
                onClick={copiarLink}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm text-white hover:bg-white/5"
              >
                {copiado ? (
                  <>
                    <Check size={15} /> Copiado
                  </>
                ) : (
                  <>
                    <Copy size={15} /> Copiar
                  </>
                )}
              </button>
            </div>
            <div className="px-4 pb-4">
              <Nota>
                Código <b>{link.code}</b>. Compartilhe este link — cada pessoa que clicar é contada, e
                se ela virar cliente, sua comissão é apurada automaticamente aqui.
              </Nota>
            </div>
          </Painel>

          {/* ── Resumo ───────────────────────────────────────────────────── */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metrica rotulo="Cliques" valor={String(cliques?.length ?? 0)} />
            <Metrica rotulo="Leads indicados" valor={String(leads?.length ?? 0)} />
            <Metrica rotulo="Fechados" valor={String(totalFechados)} cor="text-emerald-300" />
            <Metrica rotulo="Comissão total" valor={BRL.format(totalComissoes)} detalhe={`${BRL.format(totalPago)} já pago`} />
          </div>

          {/* ── Leads ────────────────────────────────────────────────────── */}
          <div className="mt-6">
            <Painel titulo="Seus leads">
              {leads === null && <Carregando />}
              {leads?.length === 0 && <Vazio texto="Nenhum lead indicado ainda." />}
              {!!leads?.length && (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  {leads.map((l) => (
                    <div key={l.id} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
                      <span className="text-[12.5px] text-slate-400">{fmtData(l.data)}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-[11.5px] font-semibold ${COR_ESTAGIO[l.estagio]}`}>
                        {ROTULO_ESTAGIO[l.estagio]}
                      </span>
                      {l.comissao_gerada && (
                        <span className="ml-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-300">
                          gerou comissão
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="p-4 pt-0">
                <Nota>
                  Por privacidade e sigilo comercial, os leads aparecem sem nome, e-mail ou valor — só a
                  data e o estágio.
                </Nota>
              </div>
            </Painel>
          </div>

          {/* ── Comissões ────────────────────────────────────────────────── */}
          <div className="mt-6">
            <Painel titulo="Suas comissões">
              {comissoes === null && <Carregando />}
              {comissoes?.length === 0 && <Vazio texto="Nenhuma comissão apurada ainda." />}
              {!!comissoes?.length && (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  {comissoes.map((c) => (
                    <div key={c.id} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
                      <span className="min-w-[100px] flex-1 text-[13.5px] font-semibold text-white">{BRL.format(c.value)}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-[11.5px] font-semibold ${COR_STATUS_COMISSAO[c.status]}`}>
                        {ROTULO_STATUS_COMISSAO[c.status]}
                      </span>
                      <span className="text-[12px] text-slate-500">apurada em {fmtData(c.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Painel>
          </div>

          {/* ── Cliques recentes ─────────────────────────────────────────── */}
          <div className="mt-6">
            <Painel titulo="Cliques recentes">
              {cliques === null && <Carregando />}
              {cliques?.length === 0 && <Vazio texto="Ainda não houve nenhum clique no seu link." />}
              {!!cliques?.length && (
                <div className="max-h-64 overflow-y-auto">
                  {cliques.map((c) => (
                    <div key={c.id} className="border-b border-white/5 px-4 py-2.5 text-[12.5px] text-slate-400 last:border-b-0">
                      {fmtDataHora(c.created_at)}
                    </div>
                  ))}
                </div>
              )}
            </Painel>
          </div>
        </>
      )}
    </div>
  );
}

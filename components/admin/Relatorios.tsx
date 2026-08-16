"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Filter, X as XIcon } from "lucide-react";
import { chamarApi, BRL } from "@/lib/admin-api";
import { Painel, Vazio, Erro, Carregando, Nota, Aviso, Metrica } from "./ui";

/* ─────────────────────────────────────────────────────────────────────────────
   Relatórios — funil, origem, perdas e receita mensal.

   Tudo client-side (mesmo padrão de Usuarios.tsx): a tela soma CINCO ações
   diferentes do módulo (`kpis`, `funil`, `origem`, `perdas`, `receita-mensal`),
   então não faz sentido buscar metade no servidor.

   HONESTIDADE DO DADO — não mexer sem reler `lib/modules/mod-relatorios.ts`:
   o banco não guarda histórico de mudança de estágio, então "idade do lead"
   (tempo desde a criação) é a única coisa exata. "Tempo NO estágio" não existe
   e nunca deve aparecer rotulado na tela. O ciclo de venda por cliente é uma
   APROXIMAÇÃO (updated_at pode ter sido empurrado por qualquer edição) e
   precisa continuar rotulado como tal.
   ──────────────────────────────────────────────────────────────────────────── */

type Kpis = {
  leads: { total: number; abertos: number; clientes: number; perdidos: number; taxaConversao: number };
  valores: { pipelineAberto: number; ganho: number; perdido: number };
  tempo: {
    idadeMediaDiasAbertos: number | null;
    idadeMaiorDiasAberto: number | null;
    cicloVendaAproxDias: number | null;
    cicloEhAproximacao: boolean;
  };
  financeiro: { aReceberPendente: number; aReceberVencido: number; recebidoTotal: number; cobrancasPagas: number };
  avisos: string[];
};

type EtapaFunil = { estagio: string; rotulo: string; quantidade: number; valor: number; idadeMediaDias: number | null };
type FunilResp = { etapas: EtapaFunil[]; total: number; nota: string };

type OrigemLinha = { origem: string; quantidade: number; valor: number; clientes: number; taxaConversao: number };
type OrigemResp = { origens: OrigemLinha[]; total: number };

type PerdaLinha = { motivo: string; quantidade: number; valor: number };
type PerdasResp = { motivos: PerdaLinha[]; totalPerdidos: number; valorPerdido: number };

type ReceitaLinha = { mes: string; receita: number; despesa: number; resultado: number };
type ReceitaResp = { linhas: ReceitaLinha[]; nota: string; avisos: string[] };

const NOMES_MES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function fmtMes(m: string): string {
  const [ano, mes] = m.split("-");
  const idx = Number(mes) - 1;
  return `${NOMES_MES[idx] ?? mes}/${ano.slice(2)}`;
}

function fmtDias(n: number | null): string {
  if (n == null) return "—";
  return n === 1 ? "1 dia" : `${n} dias`;
}

export default function Relatorios() {
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [meses, setMeses] = useState(6);

  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [funil, setFunil] = useState<FunilResp | null>(null);
  const [origem, setOrigem] = useState<OrigemResp | null>(null);
  const [perdas, setPerdas] = useState<PerdasResp | null>(null);
  const [receita, setReceita] = useState<ReceitaResp | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarPrincipais = useCallback(async (filtro: { de?: string; ate?: string }) => {
    const body: Record<string, unknown> = {};
    if (filtro.de) body.de = filtro.de;
    if (filtro.ate) body.ate = filtro.ate;
    const [k, f, o, p] = await Promise.all([
      chamarApi<Kpis>("relatorios", "kpis", body),
      chamarApi<FunilResp>("relatorios", "funil", body),
      chamarApi<OrigemResp>("relatorios", "origem", body),
      chamarApi<PerdasResp>("relatorios", "perdas", body),
    ]);
    setKpis(k);
    setFunil(f);
    setOrigem(o);
    setPerdas(p);
  }, []);

  const carregarReceita = useCallback(async (m: number) => {
    const r = await chamarApi<ReceitaResp>("relatorios", "receita-mensal", { meses: m });
    setReceita(r);
  }, []);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      setErro("");
      try {
        await Promise.all([carregarPrincipais({}), carregarReceita(meses)]);
      } catch (e) {
        setErro((e as Error).message);
      } finally {
        setCarregando(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();
  }, []);

  async function aplicarFiltro() {
    setCarregando(true);
    setErro("");
    try {
      await carregarPrincipais({ de: de || undefined, ate: ate || undefined });
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  async function limparFiltro() {
    setDe("");
    setAte("");
    setCarregando(true);
    setErro("");
    try {
      await carregarPrincipais({});
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  async function trocarMeses(m: number) {
    setMeses(m);
    setErro("");
    try {
      await carregarReceita(m);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const maxReceitaDespesa = receita
    ? Math.max(1, ...receita.linhas.flatMap((l) => [l.receita, l.despesa]))
    : 1;

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <h1 className="mr-auto text-lg font-semibold text-white">Relatórios</h1>
        <label className="text-[13px] font-semibold text-slate-300">
          De
          <input
            type="date"
            value={de}
            onChange={(e) => setDe(e.target.value)}
            className="mt-1.5 block h-10 rounded-xl border border-white/10 bg-ink-900/70 px-3 text-sm text-white outline-none focus:border-brand-400"
          />
        </label>
        <label className="text-[13px] font-semibold text-slate-300">
          Até
          <input
            type="date"
            value={ate}
            onChange={(e) => setAte(e.target.value)}
            className="mt-1.5 block h-10 rounded-xl border border-white/10 bg-ink-900/70 px-3 text-sm text-white outline-none focus:border-brand-400"
          />
        </label>
        <button
          onClick={aplicarFiltro}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-400"
        >
          <Filter size={14} /> Filtrar
        </button>
        {(de || ate) && (
          <button
            onClick={limparFiltro}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-sm text-slate-300 hover:bg-white/5"
          >
            <XIcon size={14} /> Limpar
          </button>
        )}
      </div>

      {erro && <Erro texto={erro} />}
      <p className="mb-4 text-[12px] text-slate-500">
        O filtro de período se aplica aos números de leads (KPIs, funil, origem e perdas) — a receita mensal
        é sempre pelos últimos meses escolhidos abaixo, independente do filtro de data acima.
      </p>

      {carregando && <Carregando texto="Carregando relatórios…" />}

      {!carregando && kpis && (
        <div className="mb-6">
          {kpis.avisos.length > 0 && kpis.avisos.map((a, i) => <Aviso key={i}>{a}</Aviso>)}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Metrica rotulo="Total de leads" valor={String(kpis.leads.total)} />
            <Metrica rotulo="Abertos" valor={String(kpis.leads.abertos)} />
            <Metrica rotulo="Clientes" valor={String(kpis.leads.clientes)} cor="text-emerald-300" />
            <Metrica rotulo="Taxa de conversão" valor={`${kpis.leads.taxaConversao}%`} detalhe="clientes / total de leads" />
            <Metrica rotulo="Pipeline aberto" valor={BRL.format(kpis.valores.pipelineAberto)} />
            <Metrica rotulo="Ganho" valor={BRL.format(kpis.valores.ganho)} cor="text-emerald-300" />
            <Metrica rotulo="Perdido" valor={BRL.format(kpis.valores.perdido)} cor="text-rose-300" />
            <Metrica rotulo="A receber pendente" valor={BRL.format(kpis.financeiro.aReceberPendente)} />
            <Metrica rotulo="A receber vencido" valor={BRL.format(kpis.financeiro.aReceberVencido)} cor="text-amber-300" />
            <Metrica rotulo="Recebido total" valor={BRL.format(kpis.financeiro.recebidoTotal)} cor="text-emerald-300" />
          </div>

          <div className="mt-3">
            <Nota>
              Idade média dos leads abertos: {fmtDias(kpis.tempo.idadeMediaDiasAbertos)} (o mais antigo tem{" "}
              {fmtDias(kpis.tempo.idadeMaiorDiasAberto)}). Isso é o tempo desde a criação do lead — o banco não
              guarda histórico de mudança de estágio, então não é possível medir tempo em cada etapa.
              {kpis.tempo.cicloEhAproximacao && kpis.tempo.cicloVendaAproxDias != null && (
                <>
                  {" "}
                  Ciclo médio de venda (criação até virar cliente): {fmtDias(kpis.tempo.cicloVendaAproxDias)} —{" "}
                  <b>aproximado</b>, porque qualquer edição no lead depois de fechar empurra esse número para cima.
                </>
              )}
            </Nota>
          </div>
        </div>
      )}

      {!carregando && funil && (
        <div className="mb-6">
          <Painel titulo="Funil por estágio">
            {funil.etapas.every((e) => e.quantidade === 0) ? (
              <Vazio texto="Nenhum lead no período." />
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <div className="hidden gap-3 border-b border-white/5 bg-white/[.02] px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[.08em] text-slate-500 sm:flex">
                  <span className="min-w-[160px] flex-1">Estágio</span>
                  <span className="w-24 text-right">Quantidade</span>
                  <span className="w-32 text-right">Valor</span>
                  <span className="w-36 text-right">Idade do lead</span>
                </div>
                {funil.etapas.map((e) => (
                  <div
                    key={e.estagio}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-white/5 px-4 py-3 last:border-b-0"
                  >
                    <span className="min-w-[160px] flex-1 text-[13.5px] font-semibold text-white">{e.rotulo}</span>
                    <span className="w-24 text-right text-[13px] text-slate-300 sm:text-right">{e.quantidade}</span>
                    <span className="w-32 text-right text-[13px] text-slate-300">{BRL.format(e.valor)}</span>
                    <span className="w-36 text-right text-[12px] text-slate-500">{fmtDias(e.idadeMediaDias)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="p-4 pt-3">
              <Nota>{funil.nota}</Nota>
            </div>
          </Painel>
        </div>
      )}

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {!carregando && origem && (
          <Painel titulo="Origem dos leads">
            {origem.origens.length === 0 ? (
              <Vazio texto="Nenhum lead com origem registrada no período." />
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/10">
                {origem.origens.map((o) => (
                  <div key={o.origem} className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
                    <span className="min-w-[100px] flex-1 truncate text-[13.5px] font-semibold text-white">{o.origem}</span>
                    <span className="whitespace-nowrap text-[12px] text-slate-500">{o.quantidade} leads</span>
                    <span className="whitespace-nowrap text-[13px] text-slate-300">{BRL.format(o.valor)}</span>
                    <span className="whitespace-nowrap text-[12px] font-semibold text-emerald-300">{o.taxaConversao}%</span>
                  </div>
                ))}
              </div>
            )}
          </Painel>
        )}

        {!carregando && perdas && (
          <Painel titulo="Motivos de perda">
            {perdas.motivos.length === 0 ? (
              <Vazio texto="Nenhum lead perdido no período." />
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  {perdas.motivos.map((m) => (
                    <div key={m.motivo} className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
                      <span className="min-w-[100px] flex-1 truncate text-[13.5px] font-semibold text-white">{m.motivo}</span>
                      <span className="whitespace-nowrap text-[12px] text-slate-500">{m.quantidade}x</span>
                      <span className="whitespace-nowrap text-[13px] text-rose-300">{BRL.format(m.valor)}</span>
                    </div>
                  ))}
                </div>
                <p className="p-4 pt-3 text-[12px] text-slate-500">
                  {perdas.totalPerdidos} lead(s) perdido(s) · {BRL.format(perdas.valorPerdido)} em valor perdido.
                </p>
              </>
            )}
          </Painel>
        )}
      </div>

      {!carregando && receita && (
        <Painel
          titulo="Receita mensal"
          acao={
            <select
              value={meses}
              onChange={(e) => trocarMeses(Number(e.target.value))}
              aria-label="Período da receita mensal"
              className="h-9 rounded-lg border border-white/10 bg-ink-900/70 px-2 text-[13px] text-white"
            >
              {[3, 6, 12, 24].map((n) => (
                <option key={n} value={n}>
                  Últimos {n} meses
                </option>
              ))}
            </select>
          }
        >
          {receita.avisos.length > 0 && (
            <div className="px-4 pt-3">
              {receita.avisos.map((a, i) => (
                <Aviso key={i}>{a}</Aviso>
              ))}
            </div>
          )}
          {receita.linhas.length === 0 ? (
            <Vazio texto="Sem dados de receita nesse período." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10">
              {receita.linhas.map((l) => {
                const pctReceita = Math.round((l.receita / maxReceitaDespesa) * 100);
                const pctDespesa = Math.round((l.despesa / maxReceitaDespesa) * 100);
                return (
                  <div key={l.mes} className="border-b border-white/5 px-4 py-3 last:border-b-0">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-white">{fmtMes(l.mes)}</span>
                      <span
                        className={
                          "text-[13px] font-semibold " + (l.resultado >= 0 ? "text-emerald-300" : "text-rose-300")
                        }
                      >
                        {BRL.format(l.resultado)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={12} className="shrink-0 text-emerald-400" />
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pctReceita}%` }} />
                        </div>
                        <span className="w-28 shrink-0 text-right text-[11.5px] text-slate-400">{BRL.format(l.receita)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingDown size={12} className="shrink-0 text-rose-400" />
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                          <div className="h-2 rounded-full bg-rose-500" style={{ width: `${pctDespesa}%` }} />
                        </div>
                        <span className="w-28 shrink-0 text-right text-[11.5px] text-slate-400">{BRL.format(l.despesa)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="p-4 pt-3">
            <Nota>{receita.nota}</Nota>
          </div>
        </Painel>
      )}

      {!carregando && !kpis && !erro && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
          <BarChart3 size={16} /> Nada para mostrar ainda.
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { brl, pct, numero, paraNumeroOuZero } from "./formato";
import { IconeAcao } from "./acoes";

/* ─────────────────────────────────────────────────────────────────────────────
   CALCULADORA DE PREÇO POR HORA (E DE PROJETO) — a conta aberta, no navegador.

   AS CONTAS, na ordem em que a tela mostra (todas com os números da pessoa):

     semanas trabalhadas/ano = 52 − semanas de férias/folga
     horas brutas/ano        = horas por semana x semanas trabalhadas
     horas faturáveis/ano    = horas brutas x (1 − % não-faturável)
     faturamento líquido necessário/ano = (renda desejada + despesas fixas) x 12
     faturamento bruto necessário/ano   = líquido necessário / (1 − % imposto)
     preço por hora faturável           = faturamento bruto / horas faturáveis
     preço de segurança                 = preço por hora x 1,15

   POR QUE "HORAS FATURÁVEIS" NUNCA É IGUAL A "HORAS TRABALHADAS": ninguém
   fatura 100% do tempo que passa trabalhando. Reunião, prospecção, orçamento,
   nota fiscal, e-mail administrativo — tudo isso consome hora e não gera
   cobrança direta. Cobrar como se toda hora trabalhada fosse vendável é o erro
   mais comum de quem começa a prestar serviço: o preço parece competitivo na
   planilha e não paga as contas na prática.

   POR QUE O IMPOSTO ENTRA DIVIDINDO, NÃO SOMANDO: se o imposto é 6% sobre o
   faturamento, então de cada R$ 100 faturados só R$ 94 ficam. Para sobrar
   R$ 100 líquidos, é preciso faturar R$ 100 / 0,94 ≈ R$ 106,38 — não R$ 106,00.
   A mesma lógica de "o percentual sai do total, não se soma ao total" que a
   calculadora de marketplace usa para comissão.

   PREÇO "DE SEGURANÇA": 15 pontos percentuais acima do preço de equilíbrio.
   Não é uma lei nem uma média de mercado — é uma folga sugerida para o mês
   fraco, o cliente que atrasa o pagamento ou o imposto que sobe, e a tela diz
   isso explicitamente (não é apresentada como um número "oficial").
   ──────────────────────────────────────────────────────────────────────────── */

const FATOR_SEGURANCA = 0.15;

export default function CalculadoraPrecoHora() {
  const [rendaMensal, setRendaMensal] = useState("6.000,00");
  const [despesasFixas, setDespesasFixas] = useState("800,00");
  const [horasPorSemana, setHorasPorSemana] = useState("30");
  const [semanasFeriasTxt, setSemanasFeriasTxt] = useState("4");
  const [percNaoFaturavel, setPercNaoFaturavel] = useState("30");
  const [percImposto, setPercImposto] = useState("6");
  const [horasProjeto, setHorasProjeto] = useState("");

  const r = useMemo(() => {
    const renda = paraNumeroOuZero(rendaMensal);
    const despesas = paraNumeroOuZero(despesasFixas);
    const horasSemana = paraNumeroOuZero(horasPorSemana);
    const semanasFerias = Math.min(Math.max(paraNumeroOuZero(semanasFeriasTxt), 0), 52);
    const naoFaturavelPct = Math.min(Math.max(paraNumeroOuZero(percNaoFaturavel), 0), 100);
    const impostoPct = Math.min(Math.max(paraNumeroOuZero(percImposto), 0), 100);
    const naoFaturavel = naoFaturavelPct / 100;
    const imposto = impostoPct / 100;

    const semanasTrabalhadas = Math.max(52 - semanasFerias, 0);
    const horasBrutasAno = horasSemana * semanasTrabalhadas;
    const horasFaturaveisAno = horasBrutasAno * (1 - naoFaturavel);
    const horasFaturaveisMes = horasFaturaveisAno / 12;

    const necessidadeLiquidaAno = (renda + despesas) * 12;
    const denomImposto = 1 - imposto;

    const possivel = horasFaturaveisAno > 0 && denomImposto > 0 && renda + despesas > 0;

    const faturamentoBrutoAno = possivel ? necessidadeLiquidaAno / denomImposto : NaN;
    const faturamentoBrutoMes = faturamentoBrutoAno / 12;
    const precoHora = possivel ? faturamentoBrutoAno / horasFaturaveisAno : NaN;
    const precoHoraSeguranca = possivel ? precoHora * (1 + FATOR_SEGURANCA) : NaN;

    const hProjeto = paraNumeroOuZero(horasProjeto);
    const temProjeto = horasProjeto.trim() !== "" && hProjeto > 0 && possivel;
    const precoProjeto = temProjeto ? precoHora * hProjeto : NaN;
    const precoProjetoSeguranca = temProjeto ? precoHoraSeguranca * hProjeto : NaN;

    return {
      possivel,
      renda, despesas, horasSemana, semanasFerias, naoFaturavelPct, impostoPct,
      semanasTrabalhadas, horasBrutasAno, horasFaturaveisAno, horasFaturaveisMes,
      necessidadeLiquidaAno, necessidadeLiquidaMes: necessidadeLiquidaAno / 12,
      faturamentoBrutoAno, faturamentoBrutoMes,
      precoHora, precoHoraSeguranca,
      hProjeto, temProjeto, precoProjeto, precoProjetoSeguranca,
      semTempoFaturavel: horasBrutasAno > 0 && horasFaturaveisAno <= 0,
      impostoInviavel: denomImposto <= 0,
    };
  }, [rendaMensal, despesasFixas, horasPorSemana, semanasFeriasTxt, percNaoFaturavel, percImposto, horasProjeto]);

  return (
    <div className="ft-lay">
      <div className="ft-live">
        <span className="ft-live-i">
          <span className="ft-live-k">Preço por hora faturável</span>
          <span className="ft-live-v">{r.possivel ? brl(r.precoHora) : "—"}</span>
        </span>
        <span className="ft-live-i" style={{ textAlign: "right" }}>
          <span className="ft-live-k">Com folga de segurança</span>
          <span className="ft-live-v">{r.possivel ? brl(r.precoHoraSeguranca) : "—"}</span>
        </span>
      </div>

      <div>
        <div className="ft-card">
          <p className="ft-h">Quanto você precisa que sobre</p>
          <p className="ft-sub">O que você quer pagar para si mesmo, mais o que o negócio gasta para existir.</p>
          <div className="ft-fields">
            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-ph-renda">Renda mensal desejada (líquida)</label>
              <div className="ft-inwrap">
                <span className="ft-pre" aria-hidden>R$</span>
                <input id="ft-ph-renda" className="ft-in pre" type="text" inputMode="decimal"
                  value={rendaMensal} onChange={(e) => setRendaMensal(e.target.value)} placeholder="6.000,00" />
              </div>
              <span className="ft-hint">O seu pró-labore: quanto você quer que sobre para você, todo mês.</span>
            </div>

            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-ph-despesas">Despesas fixas mensais do negócio</label>
              <div className="ft-inwrap">
                <span className="ft-pre" aria-hidden>R$</span>
                <input id="ft-ph-despesas" className="ft-in pre" type="text" inputMode="decimal"
                  value={despesasFixas} onChange={(e) => setDespesasFixas(e.target.value)} placeholder="800,00" />
              </div>
              <span className="ft-hint">Ferramenta, internet, contador, aluguel de sala, o que existe mesmo sem cliente nenhum.</span>
            </div>
          </div>
        </div>

        <div className="ft-card">
          <p className="ft-h">Quanto tempo você realmente tem para vender</p>
          <p className="ft-sub">Horas trabalháveis não são horas faturáveis — o que sobra depois de descontar folga e tempo administrativo é que conta.</p>
          <div className="ft-fields">
            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-ph-horas">Horas trabalháveis por semana</label>
              <input id="ft-ph-horas" className="ft-in" type="text" inputMode="decimal"
                value={horasPorSemana} onChange={(e) => setHorasPorSemana(e.target.value)} placeholder="30" />
              <span className="ft-hint">Quantas horas por semana você está disponível para trabalhar, no total.</span>
            </div>

            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-ph-ferias">Semanas de férias/folga por ano</label>
              <input id="ft-ph-ferias" className="ft-in" type="text" inputMode="decimal"
                value={semanasFeriasTxt} onChange={(e) => setSemanasFeriasTxt(e.target.value)} placeholder="4" />
              <span className="ft-hint">Inclua feriados que você não trabalha e qualquer parada prevista no ano.</span>
            </div>

            <div className="ft-f ft-full">
              <label className="ft-lbl" htmlFor="ft-ph-naofat">Tempo não-faturável</label>
              <div className="ft-inwrap">
                <input id="ft-ph-naofat" className="ft-in suf" type="text" inputMode="decimal"
                  value={percNaoFaturavel} onChange={(e) => setPercNaoFaturavel(e.target.value)} placeholder="30" />
                <span className="ft-suf" aria-hidden>%</span>
              </div>
              <span className="ft-hint">Reunião, prospecção, orçamento, nota fiscal, e-mail administrativo. Costuma ficar entre 20% e 40% do tempo disponível.</span>
            </div>
          </div>

          {r.semTempoFaturavel && (
            <div className="ft-alert bad" role="status">
              <IconeAcao nome="alerta" />
              <span>Com {pct(r.naoFaturavelPct, 0)} de tempo não-faturável, não sobra hora nenhuma para vender. Reduza o percentual — nenhum negócio funciona com 100% do tempo em tarefa administrativa.</span>
            </div>
          )}
        </div>

        <div className="ft-card">
          <p className="ft-h">O imposto que sai do faturamento</p>
          <div className="ft-fields">
            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-ph-imposto">Imposto/taxa sobre o faturamento</label>
              <div className="ft-inwrap">
                <input id="ft-ph-imposto" className="ft-in suf" type="text" inputMode="decimal"
                  value={percImposto} onChange={(e) => setPercImposto(e.target.value)} placeholder="6" />
                <span className="ft-suf" aria-hidden>%</span>
              </div>
              <span className="ft-hint">No Simples Nacional, serviço costuma começar entre 6% e 15,5% conforme o anexo e o faturamento dos últimos 12 meses. Confirme com o seu contador.</span>
            </div>
          </div>
        </div>

        <div className="ft-card">
          <p className="ft-h">Preço de um projeto específico <span style={{ fontWeight: 400, color: "#5A6579" }}>(opcional)</span></p>
          <p className="ft-sub">Informe as horas estimadas de um projeto para ver o valor total nesse preço por hora.</p>
          <div className="ft-fields">
            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-ph-projeto">Horas estimadas do projeto</label>
              <input id="ft-ph-projeto" className="ft-in" type="text" inputMode="decimal"
                value={horasProjeto} onChange={(e) => setHorasProjeto(e.target.value)} placeholder="40" />
            </div>
          </div>
          {r.temProjeto && (
            <div className="ft-alert info" role="status">
              <span>
                Em <b>{numero(r.hProjeto, 0)} horas</b>, o projeto vale <b>{brl(r.precoProjeto)}</b> no preço de
                equilíbrio, ou <b>{brl(r.precoProjetoSeguranca)}</b> já com a folga de segurança.
              </span>
            </div>
          )}
        </div>

        <div className="ft-card">
          <p className="ft-h">Como cada número foi calculado</p>
          <dl className="ft-form">
            <div>
              <dt>Semanas trabalhadas por ano</dt>
              <dd><code>52 − semanas de férias</code> = 52 − {numero(r.semanasFerias, 0)} = <strong>{numero(r.semanasTrabalhadas, 0)} semanas</strong>.</dd>
            </div>
            <div>
              <dt>Horas brutas por ano</dt>
              <dd><code>horas por semana x semanas trabalhadas</code> = {numero(r.horasSemana, 0)} x {numero(r.semanasTrabalhadas, 0)} = <strong>{numero(r.horasBrutasAno, 0)} horas</strong>.</dd>
            </div>
            <div>
              <dt>Horas faturáveis reais</dt>
              <dd>
                <code>horas brutas x (1 − % não-faturável)</code> = {numero(r.horasBrutasAno, 0)} x {pct(100 - r.naoFaturavelPct, 0)} = <strong>{numero(r.horasFaturaveisAno, 0)} horas/ano</strong>
                {" "}(≈ {numero(r.horasFaturaveisMes, 1)} horas/mês). É o tempo que realmente pode virar cobrança.
              </dd>
            </div>
            <div>
              <dt>Quanto o negócio precisa faturar líquido</dt>
              <dd><code>(renda desejada + despesas fixas) x 12</code> = ({brl(r.renda)} + {brl(r.despesas)}) x 12 = <strong>{brl(r.necessidadeLiquidaAno)}/ano</strong> (≈ {brl(r.necessidadeLiquidaMes)}/mês).</dd>
            </div>
            <div>
              <dt>Faturamento bruto necessário</dt>
              <dd>
                <code>líquido necessário ÷ (1 − % imposto)</code> = {brl(r.necessidadeLiquidaAno)} ÷ {pct(100 - r.impostoPct, 0)} = <strong>{r.possivel ? brl(r.faturamentoBrutoAno) : "—"}/ano</strong>
                {r.possivel && <> (≈ {brl(r.faturamentoBrutoMes)}/mês). O imposto sai do que você fatura, não se soma a ele.</>}
              </dd>
            </div>
            <div>
              <dt>Preço por hora faturável</dt>
              <dd><code>faturamento bruto ÷ horas faturáveis</code> = {r.possivel ? brl(r.faturamentoBrutoAno) : "—"} ÷ {numero(r.horasFaturaveisAno, 0)} = <strong>{r.possivel ? brl(r.precoHora) : "—"}</strong>. É o preço de equilíbrio: cobrando exatamente isso, o plano fecha.</dd>
            </div>
            <div>
              <dt>Preço de segurança</dt>
              <dd><code>preço por hora x 1,15</code> = {r.possivel ? brl(r.precoHora) : "—"} x 1,15 = <strong>{r.possivel ? brl(r.precoHoraSeguranca) : "—"}</strong>. Uma folga de 15% sugerida — não uma tabela de mercado — para absorver mês fraco, atraso de cliente ou imposto que sobe.</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="ft-sticky">
        <div className="ft-res">
          {r.possivel ? (
            <>
              <p className="ft-res-k">Preço por hora — equilíbrio</p>
              <p className="ft-res-v">{brl(r.precoHora)}</p>
              <p className="ft-res-sub">
                Cobrando isso por hora faturável, o seu pró-labore e as despesas fixas ficam
                pagos ao fim do ano.
              </p>

              <div className="ft-res-2">
                <p className="ft-res-k">Preço com folga de segurança (+15%)</p>
                <p className="ft-res-v">{brl(r.precoHoraSeguranca)}</p>
              </div>

              <div className="ft-rows">
                <div className="ft-row"><span>Horas faturáveis por mês</span><b>{numero(r.horasFaturaveisMes, 1)}</b></div>
                <div className="ft-row"><span>Faturamento bruto necessário/mês</span><b>{brl(r.faturamentoBrutoMes)}</b></div>
                <div className="ft-row tot"><span>Faturamento bruto necessário/ano</span><b>{brl(r.faturamentoBrutoAno)}</b></div>
              </div>

              {r.temProjeto && (
                <div className="ft-rows" style={{ marginTop: 14 }}>
                  <div className="ft-row"><span>Projeto de {numero(r.hProjeto, 0)}h — equilíbrio</span><b>{brl(r.precoProjeto)}</b></div>
                  <div className="ft-row tot"><span>Projeto de {numero(r.hProjeto, 0)}h — com segurança</span><b>{brl(r.precoProjetoSeguranca)}</b></div>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="ft-res-k">Conta impossível</p>
              <p className="ft-res-v" style={{ fontSize: "clamp(20px, 5.4vw, 26px)" }}>
                {r.semTempoFaturavel ? "Sem hora faturável" : r.impostoInviavel ? "Imposto de 100%" : "Faltam dados"}
              </p>
              <p className="ft-res-sub">
                {r.semTempoFaturavel
                  ? "Reduza o percentual de tempo não-faturável: com o valor atual, todo o seu tempo disponível vira tarefa administrativa e nenhuma hora sobra para vender."
                  : r.impostoInviavel
                    ? "Com 100% de imposto sobre o faturamento, nenhum preço cobre o líquido que sobraria — o faturamento inteiro seria consumido pelo imposto. Confira o percentual digitado."
                    : "Informe a renda desejada (ou as despesas) e as horas por semana para calcular o preço."}
              </p>
            </>
          )}
        </div>

        <div className="ft-card" style={{ marginTop: 16 }}>
          <p className="ft-h">Este é o piso, não o teto</p>
          <p className="ft-sub" style={{ marginBottom: 0 }}>
            É quanto a sua hora <b>precisa</b> custar para as contas fecharem — não quanto o mercado
            paga, nem o que a concorrência cobra. Cliente que reconhece valor paga acima do piso;
            cliente que só compara preço empurra você para baixo dele. A calculadora garante que
            você nunca assine um contrato que cobre menos do que a operação custa.
          </p>
        </div>
      </div>
    </div>
  );
}

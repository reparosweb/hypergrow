"use client";

import { useMemo, useState } from "react";
import { brl, pct, vezes, numero, paraNumeroOuZero } from "./formato";

/* ─────────────────────────────────────────────────────────────────────────────
   CALCULADORA DE ROAS E TETO DE ANÚNCIO — no navegador, sem servidor.

   AS CONTAS (todas aparecem escritas na tela, com os números da pessoa):

     margem por venda (R$) = ticket médio x margem de contribuição%
     CPA máximo            = margem por venda            (empate: gastou tudo que sobrava)
     ROAS de equilíbrio    = ticket / CPA máximo = 1 / margem%
     cliques por venda     = 1 / taxa de conversão%
     CPC máximo            = CPA máximo x taxa de conversão%
     CPA alvo              = CPA máximo x (1 - margem de segurança%)
     ROAS alvo             = ticket / CPA alvo

   POR QUE ROAS DE EQUILÍBRIO É 1/MARGEM: se a margem é 40%, cada R$ 1 de
   receita deixa R$ 0,40. Para o anúncio se pagar, R$ 1 investido precisa
   trazer R$ 2,50 de receita (2,50 x 0,40 = 1,00). ROAS 3 com margem 20% dá
   prejuízo; ROAS 2 com margem 60% dá lucro. Vender por ROAS "alto" sem olhar a
   margem é o erro mais caro do tráfego pago.

   IMPORTANTE (dito também na tela): esta conta considera a MARGEM DE
   CONTRIBUIÇÃO, ou seja, o que sobra depois dos custos que variam com a venda.
   Custo fixo (aluguel, salário, ferramenta) sai depois — por isso existe o
   campo de margem de segurança.
   ──────────────────────────────────────────────────────────────────────────── */

export default function CalculadoraRoas() {
  const [ticket, setTicket] = useState("150,00");
  const [margem, setMargem] = useState("40");
  const [conversao, setConversao] = useState("2");
  const [seguranca, setSeguranca] = useState("20");
  const [cpcAtual, setCpcAtual] = useState("");

  const r = useMemo(() => {
    const T = paraNumeroOuZero(ticket);
    const m = paraNumeroOuZero(margem) / 100;
    const cv = paraNumeroOuZero(conversao) / 100;
    const seg = Math.min(Math.max(paraNumeroOuZero(seguranca) / 100, 0), 0.95);

    const margemPorVenda = T * m;
    const possivel = T > 0 && m > 0;

    const cpaMax = margemPorVenda;
    const roasMin = m > 0 ? 1 / m : NaN;
    const cpaAlvo = cpaMax * (1 - seg);
    const roasAlvo = cpaAlvo > 0 ? T / cpaAlvo : NaN;

    const temConversao = cv > 0;
    const cliquesPorVenda = temConversao ? 1 / cv : NaN;
    const cpcMax = temConversao ? cpaMax * cv : NaN;
    const cpcAlvoV = temConversao ? cpaAlvo * cv : NaN;

    const cpc = paraNumeroOuZero(cpcAtual);
    const temCpc = cpcAtual.trim() !== "" && cpc > 0 && temConversao;
    const cpaReal = temCpc ? cpc / cv : NaN;
    const lucroPorVenda = temCpc ? margemPorVenda - cpaReal : NaN;
    const roasReal = temCpc && cpaReal > 0 ? T / cpaReal : NaN;

    return {
      possivel, T, m, cv, seg, margemPorVenda, cpaMax, roasMin, cpaAlvo, roasAlvo,
      temConversao, cliquesPorVenda, cpcMax, cpcAlvo: cpcAlvoV,
      temCpc, cpc, cpaReal, lucroPorVenda, roasReal,
      margemAcima100: m > 1,
    };
  }, [ticket, margem, conversao, seguranca, cpcAtual]);

  return (
    <div className="ft-lay">
      <div className="ft-live">
        <span className="ft-live-i">
          <span className="ft-live-k">CPA máximo</span>
          <span className="ft-live-v">{r.possivel ? brl(r.cpaMax) : "—"}</span>
        </span>
        <span className="ft-live-i" style={{ textAlign: "right" }}>
          <span className="ft-live-k">ROAS de equilíbrio</span>
          <span className="ft-live-v">{r.possivel ? vezes(r.roasMin) : "—"}</span>
        </span>
      </div>

      <div>
        <div className="ft-card">
          <p className="ft-h">Os números do seu negócio</p>
          <p className="ft-sub">
            Dois campos bastam para descobrir o teto. Os outros dois deixam a resposta mais fina.
          </p>

          <div className="ft-fields">
            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-ticket">Ticket médio</label>
              <div className="ft-inwrap">
                <span className="ft-pre" aria-hidden>R$</span>
                <input id="ft-ticket" className="ft-in pre" type="text" inputMode="decimal"
                  value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="150,00" />
              </div>
              <span className="ft-hint">Quanto entra, em média, por venda.</span>
            </div>

            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-margem">Margem de contribuição</label>
              <div className="ft-inwrap">
                <input id="ft-margem" className="ft-in suf" type="text" inputMode="decimal"
                  value={margem} onChange={(e) => setMargem(e.target.value)} placeholder="40" />
                <span className="ft-suf" aria-hidden>%</span>
              </div>
              <span className="ft-hint">O que sobra do ticket depois de produto, taxa, imposto e frete — antes de anúncio e custo fixo.</span>
            </div>

            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-conv">Taxa de conversão <span style={{ fontWeight: 400, color: "#5A6579" }}>(opcional)</span></label>
              <div className="ft-inwrap">
                <input id="ft-conv" className="ft-in suf" type="text" inputMode="decimal"
                  value={conversao} onChange={(e) => setConversao(e.target.value)} placeholder="2" />
                <span className="ft-suf" aria-hidden>%</span>
              </div>
              <span className="ft-hint">De cada 100 pessoas que clicam, quantas compram. Sem esse campo, o CPC máximo não tem como ser calculado.</span>
            </div>

            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-seg">Margem de segurança</label>
              <div className="ft-inwrap">
                <input id="ft-seg" className="ft-in suf" type="text" inputMode="decimal"
                  value={seguranca} onChange={(e) => setSeguranca(e.target.value)} placeholder="20" />
                <span className="ft-suf" aria-hidden>%</span>
              </div>
              <span className="ft-hint">Quanto do teto você quer preservar para pagar custo fixo e sobrar lucro de verdade.</span>
            </div>
          </div>

          {r.margemAcima100 && (
            <div className="ft-alert warn" role="status">
              <span>Margem acima de 100% não existe: a margem é uma fatia do ticket. Se você quis dizer markup sobre o custo, o número aqui é outro.</span>
            </div>
          )}
        </div>

        <div className="ft-card">
          <p className="ft-h">Compare com o que você paga hoje <span style={{ fontWeight: 400, color: "#5A6579" }}>(opcional)</span></p>
          <p className="ft-sub">Informe o CPC médio da sua campanha e veja, por venda, se está sobrando ou saindo dinheiro.</p>
          <div className="ft-fields">
            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-cpc">CPC que pago hoje</label>
              <div className="ft-inwrap">
                <span className="ft-pre" aria-hidden>R$</span>
                <input id="ft-cpc" className="ft-in pre" type="text" inputMode="decimal"
                  value={cpcAtual} onChange={(e) => setCpcAtual(e.target.value)} placeholder="2,10" />
              </div>
              <span className="ft-hint">Custo por clique médio no painel do Google Ads ou do Meta.</span>
            </div>
          </div>

          {r.temCpc && (
            <div className={"ft-alert " + (r.lucroPorVenda > 0 ? "ok" : "bad")} role="status">
              <span>
                Pagando <b>{brl(r.cpc)}</b> por clique e convertendo {pct(r.cv * 100, 2)}, cada venda
                custa <b>{brl(r.cpaReal)}</b> em anúncio.{" "}
                {r.lucroPorVenda > 0 ? (
                  <>Como sobram {brl(r.margemPorVenda)} de margem, você fica com <b>{brl(r.lucroPorVenda)}</b> por venda (ROAS atual {vezes(r.roasReal)}).</>
                ) : (
                  <>A margem é de {brl(r.margemPorVenda)}, então cada venda <b>perde {brl(Math.abs(r.lucroPorVenda))}</b> (ROAS atual {vezes(r.roasReal)}, e o equilíbrio exige {vezes(r.roasMin)}).</>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="ft-card">
          <p className="ft-h">Como cada número foi calculado</p>
          <dl className="ft-form">
            <div>
              <dt>Margem por venda</dt>
              <dd>
                <code>ticket x margem%</code> = {brl(r.T)} x {pct(r.m * 100, 2)} = <strong>{brl(r.margemPorVenda)}</strong>.
                É o dinheiro que a venda deixa antes de pagar o anúncio.
              </dd>
            </div>
            <div>
              <dt>CPA máximo</dt>
              <dd>
                É a própria margem por venda: <code>{brl(r.cpaMax)}</code>. Pagar exatamente isso
                por uma venda significa empatar — nem lucro, nem prejuízo.
              </dd>
            </div>
            <div>
              <dt>ROAS de equilíbrio</dt>
              <dd>
                <code>1 ÷ margem%</code> = 1 ÷ {pct(r.m * 100, 2)} = <strong>{vezes(r.roasMin)}</strong>.
                Abaixo disso o anúncio consome mais do que a venda deixa, por mais bonito que o
                número pareça no painel.
              </dd>
            </div>
            {r.temConversao && (
              <>
                <div>
                  <dt>Cliques por venda</dt>
                  <dd><code>1 ÷ conversão%</code> = 1 ÷ {pct(r.cv * 100, 2)} = <strong>{numero(r.cliquesPorVenda, 0)} cliques</strong>.</dd>
                </div>
                <div>
                  <dt>CPC máximo</dt>
                  <dd>
                    <code>CPA máximo x conversão%</code> = {brl(r.cpaMax)} x {pct(r.cv * 100, 2)} = <strong>{brl(r.cpcMax)}</strong>.
                    Acima disso, cada clique custa mais do que traz.
                  </dd>
                </div>
              </>
            )}
            <div>
              <dt>Alvo com folga</dt>
              <dd>
                <code>CPA máximo x (1 − segurança%)</code> = {brl(r.cpaMax)} x {pct((1 - r.seg) * 100, 0)} = <strong>{brl(r.cpaAlvo)}</strong>.
                É a meta que ainda paga o custo fixo e deixa lucro.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="ft-sticky">
        <div className="ft-res">
          {r.possivel ? (
            <>
              <p className="ft-res-k">CPA máximo — teto por venda</p>
              <p className="ft-res-v">{brl(r.cpaMax)}</p>
              <p className="ft-res-sub">
                É o máximo que você pode pagar em anúncio para conquistar uma venda sem perder
                dinheiro. Nesse valor exato, você empata.
              </p>

              <div className="ft-res-2">
                <p className="ft-res-k">ROAS mínimo de equilíbrio</p>
                <p className="ft-res-v">{vezes(r.roasMin)}</p>
                <p className="ft-res-sub">
                  Cada R$ 1 investido precisa devolver {brl(r.roasMin)} de receita só para empatar.
                </p>
              </div>

              <div className="ft-rows">
                <div className="ft-row"><span>Margem por venda</span><b>{brl(r.margemPorVenda)}</b></div>
                <div className="ft-row"><span>CPA alvo (com {pct(r.seg * 100, 0)} de folga)</span><b>{brl(r.cpaAlvo)}</b></div>
                <div className="ft-row"><span>ROAS alvo</span><b>{vezes(r.roasAlvo)}</b></div>
                {r.temConversao && (
                  <>
                    <div className="ft-row"><span>Cliques por venda</span><b>{numero(r.cliquesPorVenda, 0)}</b></div>
                    <div className="ft-row tot"><span>CPC máximo</span><b>{brl(r.cpcMax)}</b></div>
                    <div className="ft-row"><span>CPC alvo (com folga)</span><b>{brl(r.cpcAlvo)}</b></div>
                  </>
                )}
              </div>

              {!r.temConversao && (
                <p className="ft-res-sub" style={{ marginTop: 14 }}>
                  Informe a taxa de conversão ao lado para descobrir também o CPC máximo — o valor
                  que você configura no lance da campanha.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="ft-res-k">Faltam dados</p>
              <p className="ft-res-v" style={{ fontSize: "clamp(20px, 5.4vw, 26px)" }}>
                {r.T > 0 ? "Margem precisa ser maior que zero" : "Informe o ticket médio"}
              </p>
              <p className="ft-res-sub">
                Com margem zero ou negativa não existe teto de anúncio: qualquer centavo investido
                vira prejuízo. Antes de anunciar, o preço precisa deixar margem.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

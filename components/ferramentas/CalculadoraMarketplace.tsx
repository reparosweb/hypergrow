"use client";

import { useMemo, useState } from "react";
import { brl, pct, paraNumeroOuZero } from "./formato";

/* ─────────────────────────────────────────────────────────────────────────────
   CALCULADORA DE PREÇO PARA MARKETPLACE — a conta aberta, no navegador.

   A CONTA (margem sobre o PREÇO DE VENDA, que é como marketplace e contador
   falam de margem):

       preço = (custo + frete + taxa fixa) / (1 - comissão% - imposto% - margem%)

   Por quê: comissão, imposto e margem incidem sobre o preço, não sobre o custo.
   Se você somar 20% ao custo achando que terá 20% de margem, o resultado real
   fica em ~16% — é o erro que mais aparece em operação de marketplace.

   A CONTA ALTERNATIVA (margem sobre o CUSTO, o famoso markup):

       preço = (custo x (1 + margem%) + frete + taxa fixa) / (1 - comissão% - imposto%)

   As duas estão disponíveis porque as duas são usadas de verdade — o que não
   pode é a pessoa achar que está usando uma e estar usando a outra. O rótulo
   diz qual está ligada e o resultado mostra as DUAS medidas de margem no fim.

   O preço é arredondado para CIMA no centavo (arredondar para baixo entregaria
   uma margem um fio menor que a pedida) e o lucro exibido é recalculado a
   partir do preço já arredondado — é lucro real, não o lucro teórico.
   ──────────────────────────────────────────────────────────────────────────── */

/* Percentuais de REFERÊNCIA. Não é tabela oficial e não substitui o painel do
   canal: comissão muda por categoria, por plano de anúncio, por programa de
   frete e por campanha. Servem para dar um ponto de partida — todos editáveis. */
const CANAIS: { nome: string; comissao: number; nota: string }[] = [
  { nome: "Mercado Livre · Clássico", comissao: 12, nota: "No Mercado Livre a comissão muda por categoria e o anúncio Premium (com parcelamento sem juros) custa mais que o Clássico. Pedidos de valor baixo ainda têm tarifa fixa por unidade — informe no campo de tarifa." },
  { nome: "Mercado Livre · Premium", comissao: 17, nota: "Premium oferece parcelamento sem juros ao comprador e cobra comissão maior. Confira a sua categoria antes de fechar o preço." },
  { nome: "Shopee", comissao: 14, nota: "A Shopee soma comissão base e programas opcionais (frete grátis, por exemplo). Se você participa de algum, some o percentual dele aqui." },
  { nome: "Amazon", comissao: 15, nota: "Na Amazon a comissão varia bastante por categoria e existe plano de conta com mensalidade. Confira a sua no Seller Central." },
  { nome: "Magalu", comissao: 16, nota: "No Magalu a comissão é negociada por categoria e por acordo comercial — o valor do seu contrato manda." },
  { nome: "Loja própria (gateway)", comissao: 4.5, nota: "Em loja própria não há comissão de marketplace, mas há taxa de gateway/adquirente por transação, que sobe no parcelado. Use a taxa efetiva do seu contrato." },
];

type Base = "venda" | "custo";

export default function CalculadoraMarketplace() {
  const [custo, setCusto] = useState("50,00");
  const [comissao, setComissao] = useState("12");
  const [imposto, setImposto] = useState("4");
  const [frete, setFrete] = useState("0");
  const [taxaFixa, setTaxaFixa] = useState("0");
  const [margem, setMargem] = useState("20");
  const [base, setBase] = useState<Base>("venda");
  const [precoAtual, setPrecoAtual] = useState("");
  const [canal, setCanal] = useState<string | null>(null);

  const conta = useMemo(() => {
    const C = paraNumeroOuZero(custo);
    const F = paraNumeroOuZero(frete);
    const T = paraNumeroOuZero(taxaFixa);
    const c = paraNumeroOuZero(comissao) / 100;
    const t = paraNumeroOuZero(imposto) / 100;
    const m = paraNumeroOuZero(margem) / 100;

    const denominador = base === "venda" ? 1 - c - t - m : 1 - c - t;
    if (denominador <= 0) {
      return {
        possivel: false as const,
        somaPercentual: (base === "venda" ? c + t + m : c + t) * 100,
      };
    }

    const numerador = base === "venda" ? C + F + T : C * (1 + m) + F + T;
    const bruto = numerador / denominador;
    const preco = Math.ceil(bruto * 100) / 100; // para cima, no centavo

    const valorComissao = preco * c;
    const valorImposto = preco * t;
    const lucro = preco - valorComissao - valorImposto - F - T - C;

    return {
      possivel: true as const,
      preco,
      valorComissao,
      valorImposto,
      frete: F,
      taxaFixa: T,
      custo: C,
      lucro,
      margemSobreVenda: preco > 0 ? (lucro / preco) * 100 : 0,
      markupSobreCusto: C > 0 ? (lucro / C) * 100 : NaN,
      porCem: preco > 0 ? (lucro / preco) * 100 : 0,
    };
  }, [custo, frete, taxaFixa, comissao, imposto, margem, base]);

  /* Segundo cenário: o preço que a pessoa JÁ pratica hoje. Mesma conta, do
     avesso — em vez de perguntar a margem, ela responde qual é. */
  const hoje = useMemo(() => {
    const P = paraNumeroOuZero(precoAtual);
    if (!precoAtual.trim() || P <= 0) return null;
    const C = paraNumeroOuZero(custo);
    const F = paraNumeroOuZero(frete);
    const T = paraNumeroOuZero(taxaFixa);
    const c = paraNumeroOuZero(comissao) / 100;
    const t = paraNumeroOuZero(imposto) / 100;
    const lucro = P - P * c - P * t - F - T - C;
    return { preco: P, lucro, margem: (lucro / P) * 100 };
  }, [precoAtual, custo, frete, taxaFixa, comissao, imposto]);

  const notaCanal = canal ? CANAIS.find((x) => x.nome === canal)?.nota : null;

  return (
    <div className="ft-lay">
      {/* faixa que acompanha a rolagem no celular — o número principal nunca
          sai da tela enquanto a pessoa mexe nos campos */}
      <div className="ft-live">
        <span className="ft-live-i">
          <span className="ft-live-k">Preço de venda mínimo</span>
          <span className="ft-live-v">{conta.possivel ? brl(conta.preco) : "conta impossível"}</span>
        </span>
        {conta.possivel && (
          <span className="ft-live-i" style={{ textAlign: "right" }}>
            <span className="ft-live-k">Lucro</span>
            <span className="ft-live-v">{brl(conta.lucro)}</span>
          </span>
        )}
      </div>

      <div>
        <div className="ft-card">
          <p className="ft-h">Canal de venda</p>
          <p className="ft-sub">
            Toque para preencher a comissão. São valores de <strong>referência</strong>, não
            tabela oficial: comissão muda por categoria, plano e campanha. Confirme a sua no
            painel do canal e edite o campo à vontade.
          </p>
          <div className="ft-chips">
            {CANAIS.map((x) => (
              <button
                key={x.nome}
                type="button"
                className="ft-chip"
                aria-pressed={canal === x.nome}
                onClick={() => { setCanal(x.nome); setComissao(String(x.comissao).replace(".", ",")); }}
              >
                {x.nome} <small>≈{pct(x.comissao, 1)}</small>
              </button>
            ))}
          </div>
          {notaCanal && (
            <div className="ft-alert info" role="status">
              <span>{notaCanal}</span>
            </div>
          )}
        </div>

        <div className="ft-card">
          <p className="ft-h">Seus números</p>
          <div className="ft-fields">
            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-custo">Custo do produto</label>
              <div className="ft-inwrap">
                <span className="ft-pre" aria-hidden>R$</span>
                <input id="ft-custo" className="ft-in pre" type="text" inputMode="decimal"
                  value={custo} onChange={(e) => setCusto(e.target.value)} placeholder="50,00" />
              </div>
              <span className="ft-hint">Quanto o produto custa para você (com embalagem, se houver).</span>
            </div>

            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-comissao">Comissão do canal</label>
              <div className="ft-inwrap">
                <input id="ft-comissao" className="ft-in suf" type="text" inputMode="decimal"
                  value={comissao} onChange={(e) => { setComissao(e.target.value); setCanal(null); }} placeholder="12" />
                <span className="ft-suf" aria-hidden>%</span>
              </div>
              <span className="ft-hint">O percentual que o marketplace desconta da venda.</span>
            </div>

            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-imposto">Imposto sobre a venda</label>
              <div className="ft-inwrap">
                <input id="ft-imposto" className="ft-in suf" type="text" inputMode="decimal"
                  value={imposto} onChange={(e) => setImposto(e.target.value)} placeholder="4" />
                <span className="ft-suf" aria-hidden>%</span>
              </div>
              <span className="ft-hint">No Simples Nacional, comércio começa em 4% na primeira faixa. Confirme com seu contador.</span>
            </div>

            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-frete">Frete que você paga</label>
              <div className="ft-inwrap">
                <span className="ft-pre" aria-hidden>R$</span>
                <input id="ft-frete" className="ft-in pre" type="text" inputMode="decimal"
                  value={frete} onChange={(e) => setFrete(e.target.value)} placeholder="0,00" />
              </div>
              <span className="ft-hint">Só o que sai do seu bolso. Se o cliente paga o frete inteiro, deixe zero.</span>
            </div>

            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-taxa">Tarifa fixa por venda</label>
              <div className="ft-inwrap">
                <span className="ft-pre" aria-hidden>R$</span>
                <input id="ft-taxa" className="ft-in pre" type="text" inputMode="decimal"
                  value={taxaFixa} onChange={(e) => setTaxaFixa(e.target.value)} placeholder="0,00" />
              </div>
              <span className="ft-hint">Vários canais cobram um valor fixo por unidade em pedidos baratos. Confira o seu.</span>
            </div>

            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-margem">Margem desejada</label>
              <div className="ft-inwrap">
                <input id="ft-margem" className="ft-in suf" type="text" inputMode="decimal"
                  value={margem} onChange={(e) => setMargem(e.target.value)} placeholder="20" />
                <span className="ft-suf" aria-hidden>%</span>
              </div>
              <span className="ft-hint">Quanto você quer que sobre.</span>
            </div>

            <div className="ft-f ft-full">
              <span className="ft-lbl" id="ft-base-lbl">Essa margem é sobre o quê?</span>
              <div className="ft-chips" role="group" aria-labelledby="ft-base-lbl">
                <button type="button" className="ft-chip" aria-pressed={base === "venda"} onClick={() => setBase("venda")}>
                  Sobre o preço de venda
                </button>
                <button type="button" className="ft-chip" aria-pressed={base === "custo"} onClick={() => setBase("custo")}>
                  Sobre o custo (markup)
                </button>
              </div>
              <span className="ft-hint">
                {base === "venda"
                  ? "Escolhido: de cada R$ 100 vendidos, você quer que sobrem R$ " + margem.replace(".", ",") + ". É como marketplace e contador falam de margem."
                  : "Escolhido: você soma o percentual ao custo do produto. Atenção: markup de 20% NÃO dá 20% de margem sobre a venda — o resultado abaixo mostra as duas medidas."}
              </span>
            </div>
          </div>
        </div>

        <div className="ft-card">
          <p className="ft-h">Confira o preço que você já pratica <span style={{ fontWeight: 400, color: "#5A6579" }}>(opcional)</span></p>
          <p className="ft-sub">Descubra quanto sobra hoje, com os mesmos custos informados acima.</p>
          <div className="ft-fields">
            <div className="ft-f">
              <label className="ft-lbl" htmlFor="ft-atual">Meu preço de venda hoje</label>
              <div className="ft-inwrap">
                <span className="ft-pre" aria-hidden>R$</span>
                <input id="ft-atual" className="ft-in pre" type="text" inputMode="decimal"
                  value={precoAtual} onChange={(e) => setPrecoAtual(e.target.value)} placeholder="89,90" />
              </div>
            </div>
          </div>
          {hoje && (
            <div className={"ft-alert " + (hoje.lucro > 0 ? "ok" : "bad")} role="status">
              <span>
                Vendendo a <b>{brl(hoje.preco)}</b>, {hoje.lucro >= 0 ? "sobram" : "faltam"}{" "}
                <b>{brl(Math.abs(hoje.lucro))}</b> por venda
                {hoje.lucro >= 0 ? " — margem de " + pct(hoje.margem, 1) + " sobre a venda." : ". Cada venda nesse preço tira dinheiro do caixa."}
                {conta.possivel && hoje.preco < conta.preco && hoje.lucro >= 0
                  ? " Ainda está abaixo do preço mínimo para a margem que você pediu."
                  : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── resultado ───────────────────────────────────────────────────── */}
      <div className="ft-sticky">
        <div className="ft-res">
          {conta.possivel ? (
            <>
              <p className="ft-res-k">Preço de venda mínimo</p>
              <p className="ft-res-v">{brl(conta.preco)}</p>
              <p className="ft-res-sub">
                É o menor preço que entrega a margem pedida. Abaixo disso, você paga para vender.
              </p>

              <div className="ft-res-2">
                <p className="ft-res-k">Lucro real por venda</p>
                <p className="ft-res-v">{brl(conta.lucro)}</p>
              </div>

              <div className="ft-rows">
                <div className="ft-row"><span>Preço de venda</span><b>{brl(conta.preco)}</b></div>
                <div className="ft-row"><span>− Comissão do canal</span><b>−{brl(conta.valorComissao)}</b></div>
                <div className="ft-row"><span>− Imposto</span><b>−{brl(conta.valorImposto)}</b></div>
                {conta.frete > 0 && <div className="ft-row"><span>− Frete</span><b>−{brl(conta.frete)}</b></div>}
                {conta.taxaFixa > 0 && <div className="ft-row"><span>− Tarifa fixa</span><b>−{brl(conta.taxaFixa)}</b></div>}
                <div className="ft-row"><span>− Custo do produto</span><b>−{brl(conta.custo)}</b></div>
                <div className="ft-row tot"><span>= Sobra no seu bolso</span><b>{brl(conta.lucro)}</b></div>
              </div>

              <div className="ft-rows" style={{ marginTop: 14 }}>
                <div className="ft-row"><span>Margem sobre a venda</span><b>{pct(conta.margemSobreVenda, 1)}</b></div>
                <div className="ft-row">
                  <span>Markup sobre o custo</span>
                  <b>{Number.isFinite(conta.markupSobreCusto) ? pct(conta.markupSobreCusto, 1) : "—"}</b>
                </div>
                <div className="ft-row"><span>A cada R$ 100 vendidos, sobram</span><b>{brl(conta.porCem)}</b></div>
              </div>
            </>
          ) : (
            <>
              <p className="ft-res-k">Conta impossível</p>
              <p className="ft-res-v" style={{ fontSize: "clamp(20px, 5.4vw, 26px)" }}>Não fecha</p>
              <p className="ft-res-sub">
                Comissão, imposto e margem somam {pct(conta.somaPercentual, 1)} do preço. Como
                sobra {pct(100 - conta.somaPercentual, 1)} para pagar o produto, nenhum preço
                resolve — quanto mais você aumenta, mais o canal e o imposto levam junto.
                Reduza a margem pedida, renegocie a comissão ou baixe o custo.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import type { CSSProperties } from "react";
import {
  PLATFORMS,
  PLATFORM_GROUPS,
  CATEGORY_SHORT,
  CATEGORY_TONE,
  platformsOf,
  countOf,
} from "@/lib/ecommerce-platforms";

/* ─────────────────────────────────────────────────────────────────────────────
   PLATFORM SHOWCASE — seção de plataformas da página /servicos/loja-virtual.

   SERVER COMPONENT de propósito: nenhum "use client", nenhum hook, nenhum
   estado. Todo o conteúdo já vai no HTML — é o formato que a IA (ChatGPT,
   Perplexity, AI Overviews) consegue ler e citar, e é zero JavaScript no
   celular do cliente.

   DECISÕES QUE PARECEM DETALHE E NÃO SÃO
   · Wordmark tipográfico em vez de logo baixado. Misturar logos de qualidade,
     proporção e fundo diferentes é o que faz uma seção "parceiros" parecer
     amadora — fora a questão de marca registrada. Um grid tipográfico
     consistente é 100% nosso e vende melhor.
   · Tabela HTML de verdade (<table> com <th scope>). É o formato que motor de
     busca e IA mais citam, e o site inteiro não tinha nenhuma.
   · Nenhuma classe .reveal / .stagger: o IntersectionObserver que as liga vive
     no HypergrowSite (home). Aqui elas ficariam em opacity:0 para sempre.
     Estado base é VISÍVEL; a entrada é progressive enhancement por
     animation-timeline, que degrada para "sempre visível".
   · Nenhum filter:blur() e nenhum backdrop-filter — trava o scroll no celular.
   · Ícone é SVG inline: esta rota não carrega o script do lucide.
   · Toda largura fixa passa por min(Xpx, 100%) e todo grid é
     repeat(auto-fit, minmax(min(100%, X), 1fr)) — as duas regras que já
     causaram vazamento horizontal neste projeto.
   ──────────────────────────────────────────────────────────────────────────── */

const tone = (c: string) => ({ "--tone": c } as CSSProperties);

function StepMark({ n }: { n: number }) {
  return (
    <span className="plat-step mono" aria-hidden>
      {String(n).padStart(2, "0")}
    </span>
  );
}

export default function PlatformShowcase({ id = "plataformas" }: { id?: string }) {
  const total = PLATFORMS.length;

  return (
    <section className="sec plat" id={id} aria-labelledby="plat-title">
      <div className="wrap">
        {/* ── cabeçalho ─────────────────────────────────────────────────── */}
        <span className="plat-kicker">Ecossistema</span>
        <h2 className="plat-h" id="plat-title">
          As plataformas em que a sua loja pode nascer
        </h2>
        <p className="plat-lede">
          Não existe &ldquo;a melhor plataforma&rdquo;. Existe a que cabe no seu catálogo, no seu
          time e na sua conta. Estas são as {total} que a HyperGrow implanta, integra ou migra —
          de loja virtual a ERP, hub de marketplace e canal de venda.
        </p>

        <ul className="plat-stats" aria-label="Resumo por categoria">
          {PLATFORM_GROUPS.map((g) => (
            <li key={g.key} className="plat-stat" style={tone(CATEGORY_TONE[g.key])}>
              <span className="plat-stat-n mono">{countOf(g.key)}</span>
              <span className="plat-stat-l">{CATEGORY_SHORT[g.key]}</span>
            </li>
          ))}
        </ul>

        {/* ── grids de wordmark, um por categoria ───────────────────────── */}
        {PLATFORM_GROUPS.map((g, gi) => (
          <div className="plat-group" key={g.key} style={tone(CATEGORY_TONE[g.key])}>
            <div className="plat-group-head">
              <StepMark n={gi + 1} />
              <div className="plat-group-text">
                <h3 className="plat-group-h">
                  {g.label}
                  <span className="plat-group-c mono">{countOf(g.key)}</span>
                </h3>
                <p className="plat-group-p">{g.blurb}</p>
              </div>
            </div>

            <ul className="plat-grid plat-rise">
              {platformsOf(g.key).map((p) => (
                <li key={p.name} className="plat-tile">
                  <span className="plat-tile-top">
                    <span className="plat-mark" aria-hidden />
                    <span className="plat-origin mono">{p.origin}</span>
                  </span>
                  <span className="plat-name">{p.name}</span>
                  <span className="plat-rule" aria-hidden />
                  <span className="plat-note">{p.note}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* ── tabela comparativa ────────────────────────────────────────── */}
        <div className="plat-tablewrap-head">
          <StepMark n={5} />
          <div className="plat-group-text">
            <h3 className="plat-group-h">Comparativo rápido</h3>
            <p className="plat-group-p">
              Para quem cada uma serve melhor, em uma linha. Use como filtro inicial — a decisão
              final depende de catálogo, fiscal e integração.
            </p>
          </div>
        </div>

        <p className="plat-hint" aria-hidden>
          Arraste a tabela para o lado
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </p>

        <div
          className="plat-tablewrap"
          role="region"
          aria-label="Comparativo de plataformas, ERPs, hubs e marketplaces"
          tabIndex={0}
        >
          <table className="plat-table">
            <caption className="plat-caption">
              Plataformas de e-commerce, ERPs, hubs de integração e marketplaces atendidos pela
              HyperGrow — {total} no total, atualizado em julho de 2026.
            </caption>
            <thead>
              <tr>
                <th scope="col">Plataforma</th>
                <th scope="col">Melhor para</th>
                <th scope="col">Origem</th>
                <th scope="col">Categoria</th>
              </tr>
            </thead>
            <tbody>
              {PLATFORM_GROUPS.flatMap((g) =>
                platformsOf(g.key).map((p) => (
                  <tr key={p.name} style={tone(CATEGORY_TONE[p.category])}>
                    <th scope="row" className="plat-td-name">
                      {p.name}
                    </th>
                    <td>{p.bestFor}</td>
                    <td className="plat-td-origin mono">{p.origin}</td>
                    <td className="plat-td-cat">
                      <span className="plat-mark" aria-hidden />
                      {CATEGORY_SHORT[p.category]}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>

        <p className="plat-legend">
          <strong>BR</strong> nasceu no Brasil · <strong>LatAm</strong> nasceu na América Latina com
          o Brasil como mercado principal · <strong>Global</strong> plataforma internacional.
        </p>

        {/* ── o que realmente dá trabalho ───────────────────────────────── */}
        <div className="plat-ops">
          <h3 className="plat-ops-h">Escolher a plataforma é a parte fácil</h3>
          <p className="plat-ops-p">
            O que decide se a loja vende é o que vem depois: como o produto é cadastrado, como o
            estoque conversa com o financeiro e como os canais recebem o mesmo catálogo sem
            digitação em dobro.
          </p>

          <div className="plat-ops-grid plat-rise">
            <article className="plat-op" style={tone("#2DD4A0")}>
              <StepMark n={1} />
              <h4 className="plat-op-h">Cadastro de produto que aguenta escala</h4>
              <p className="plat-op-p">
                Ficha completa desde o primeiro item: título com o termo que o cliente busca,
                descrição própria (não a do fornecedor), foto no mesmo padrão, variação de cor e
                tamanho com SKU próprio, EAN/GTIN, NCM, peso e dimensões reais da caixa. Peso e
                medida errados fazem o frete calcular errado — e a margem vai embora sem ninguém
                perceber.
              </p>
            </article>

            <article className="plat-op" style={tone("#D3B78E")}>
              <StepMark n={2} />
              <h4 className="plat-op-h">ERP ligado à loja, não ao lado dela</h4>
              <p className="plat-op-p">
                Integrado, o pedido nasce na loja, baixa estoque, gera a nota fiscal e cai no
                financeiro sem ninguém redigitar. Separados, acontece o clássico: o mesmo item
                vendido duas vezes, a nota emitida com atraso e o fechamento do mês feito na
                planilha. Bling, Olist Tiny, Omie, Conta Azul, Sankhya e TOTVS resolvem isso em
                níveis diferentes de porte.
              </p>
            </article>

            <article className="plat-op" style={tone("#D99461")}>
              <StepMark n={3} />
              <h4 className="plat-op-h">Hub, a partir do segundo canal</h4>
              <p className="plat-op-p">
                Com um marketplace só, dá para tocar na mão. A partir do segundo, o cadastro manual
                vira o gargalo e o estoque desencontra. O hub publica o mesmo catálogo em vários
                canais, sincroniza preço e estoque e devolve todos os pedidos num painel só — é o
                que separa &ldquo;vender em marketplace&rdquo; de &ldquo;operar marketplace&rdquo;.
              </p>
            </article>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* ═══ Plataformas — grid de wordmarks + tabela comparativa ═════════
           Paleta: grafite + jade + cobre + champanhe. Zero azul, zero violeta.
           ═══════════════════════════════════════════════════════════════ */

        .plat { --edge: rgba(232,226,217,0.09); --tone: #2DD4A0; }

        .plat-kicker {
          display: inline-block; font: 600 10.5px var(--font-mono);
          letter-spacing: 0.22em; text-transform: uppercase; color: #2DD4A0;
        }
        .plat-h {
          font: 800 clamp(26px, 3.4vw, 40px)/1.06 var(--font-display);
          letter-spacing: -0.035em; color: #fff; margin: 12px 0 0;
          text-wrap: balance; max-width: 20ch;
        }
        .plat-lede {
          font: 400 clamp(15.5px, 1.4vw, 17px)/1.65 var(--font-sans);
          color: rgba(232,226,217,0.62); margin: 18px 0 0; max-width: 62ch; text-wrap: pretty;
        }

        /* ── contadores ───────────────────────────────────────────────── */
        .plat-stats {
          list-style: none; padding: 0;
          margin: clamp(26px, 3vw, 34px) 0 0;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 132px), 1fr));
          gap: 10px;
        }
        .plat-stat {
          display: flex; flex-direction: column; gap: 4px;
          padding: 14px 16px; border-radius: 4px;
          border: 1px solid var(--edge);
          border-left: 2px solid var(--tone);
          background: linear-gradient(180deg, rgba(232,226,217,0.045), rgba(232,226,217,0.012));
        }
        .plat-stat-n {
          font-size: 21px; font-weight: 600; letter-spacing: -0.02em; color: var(--tone);
          line-height: 1;
        }
        .plat-stat-l {
          font: 500 11px var(--font-sans); letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(232,226,217,0.5);
        }

        /* ── cabeçalho de cada grupo ──────────────────────────────────── */
        .plat-group { margin-top: clamp(40px, 5vw, 62px); }
        .plat-group-head,
        .plat-tablewrap-head {
          display: grid; grid-template-columns: auto 1fr; gap: clamp(12px, 2vw, 18px);
          align-items: start;
        }
        .plat-tablewrap-head { margin-top: clamp(46px, 6vw, 72px); }
        .plat-step {
          font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
          color: var(--tone); padding-top: 4px; opacity: 0.9;
        }
        .plat-group-text { min-width: 0; }
        .plat-group-h {
          display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
          font: 700 clamp(18px, 2vw, 23px)/1.2 var(--font-display);
          letter-spacing: -0.025em; color: #fff; margin: 0;
        }
        .plat-group-c {
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          color: rgba(232,226,217,0.4);
        }
        .plat-group-c::before { content: '· '; }
        .plat-group-p {
          font: 400 14.5px/1.6 var(--font-sans); color: rgba(232,226,217,0.58);
          margin: 8px 0 0; max-width: 68ch; text-wrap: pretty;
        }

        /* ── grid de wordmarks ────────────────────────────────────────── */
        .plat-grid {
          list-style: none; padding: 0;
          margin: clamp(18px, 2.4vw, 26px) 0 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 232px), 1fr));
          gap: 12px;
        }
        .plat-tile {
          position: relative; display: flex; flex-direction: column; min-width: 0;
          padding: 16px 17px 18px; border-radius: 12px;
          border: 1px solid var(--edge);
          background:
            linear-gradient(180deg, rgba(232,226,217,0.05), rgba(232,226,217,0.014)),
            #14181D;
          box-shadow: 0 1px 0 rgba(232,226,217,0.05) inset;
          transition: border-color .4s var(--ease-silk), transform .4s var(--ease-spring),
                      background .4s var(--ease-silk), box-shadow .4s var(--ease-silk);
        }
        .plat-tile-top {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          margin-bottom: 11px;
        }
        /* marca quadrada (não bolinha) — some do "tudo redondo igual" */
        .plat-mark {
          width: 6px; height: 6px; flex: none; border-radius: 1px;
          background: var(--tone); box-shadow: 0 0 10px -1px var(--tone);
        }
        .plat-origin {
          font-size: 9.5px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(232,226,217,0.46);
          padding: 3px 7px; border-radius: 3px;
          border: 1px solid rgba(232,226,217,0.11);
          background: rgba(232,226,217,0.03);
        }
        .plat-name {
          font: 700 clamp(16px, 1.55vw, 19px)/1.18 var(--font-display);
          letter-spacing: -0.028em; color: #F2EEE7; overflow-wrap: break-word; hyphens: none;
        }
        .plat-rule {
          display: block; width: 26px; height: 2px; margin: 11px 0 10px; border-radius: 1px;
          background: linear-gradient(90deg, var(--tone), transparent);
          opacity: 0.85; transition: width .4s var(--ease-silk);
        }
        .plat-note {
          font: 400 12.8px/1.5 var(--font-sans); color: rgba(232,226,217,0.56);
          margin-top: auto; text-wrap: pretty;
        }
        .plat-tile:hover {
          transform: translateY(-2px);
          border-color: color-mix(in srgb, var(--tone) 38%, transparent);
          background:
            linear-gradient(180deg, rgba(232,226,217,0.075), rgba(232,226,217,0.02)),
            #161B21;
          box-shadow: 0 1px 0 rgba(232,226,217,0.07) inset, 0 20px 44px -30px rgba(0,0,0,0.9);
        }
        .plat-tile:hover .plat-rule { width: 44px; }
        .plat-tile:hover .plat-name { color: #fff; }

        /* ── tabela comparativa ───────────────────────────────────────── */
        .plat-hint {
          display: none; align-items: center; gap: 6px;
          font: 500 11.5px var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(232,226,217,0.38); margin: 20px 0 8px;
        }
        @media (max-width: 860px) { .plat-hint { display: flex; } }

        .plat-tablewrap {
          margin-top: clamp(18px, 2.4vw, 26px);
          overflow-x: auto; -webkit-overflow-scrolling: touch;
          border: 1px solid var(--edge); border-radius: 14px;
          background: linear-gradient(180deg, rgba(232,226,217,0.04), rgba(232,226,217,0.01));
        }
        .plat-table {
          width: 100%; min-width: 720px;
          border-collapse: collapse; text-align: left;
        }
        /* max-width em vw: a tabela tem min-width 720px, então sem isto a
           legenda viraria um bloco de 720px que só se lê rolando de lado. */
        .plat-caption {
          caption-side: top; text-align: left;
          font: 400 12.5px/1.5 var(--font-sans); color: rgba(232,226,217,0.44);
          padding: 15px clamp(14px, 2vw, 20px) 14px;
          max-width: min(660px, 84vw);
        }
        /* a linha divisória vem do thead, não da legenda: como a legenda tem
           max-width, um border-bottom nela desenharia um traço cortado no meio
           da tabela. */
        .plat-table th, .plat-table td {
          padding: 13px clamp(12px, 1.6vw, 18px);
          border-bottom: 1px solid rgba(232,226,217,0.06);
          vertical-align: top;
        }
        .plat-table thead th {
          font: 600 10px var(--font-mono); letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(232,226,217,0.42); white-space: nowrap;
          background: rgba(232,226,217,0.025);
          border-top: 1px solid var(--edge);
          border-bottom: 1px solid rgba(232,226,217,0.12);
        }
        .plat-table tbody tr { transition: background .3s var(--ease-silk); }
        .plat-table tbody tr:nth-child(even) { background: rgba(232,226,217,0.018); }
        .plat-table tbody tr:hover { background: rgba(232,226,217,0.05); }
        .plat-table tbody tr:last-child th,
        .plat-table tbody tr:last-child td { border-bottom: none; }
        .plat-table th.plat-td-name {
          font: 700 14.5px/1.35 var(--font-display); letter-spacing: -0.02em; color: #F2EEE7;
          white-space: nowrap;
        }
        .plat-table td { font: 400 14px/1.5 var(--font-sans); color: rgba(232,226,217,0.68); }
        /* Mesma força do seletor .plat-table td acima: o shorthand "font" dele
           zeraria font-size/font-family de qualquer regra mais fraca. */
        .plat-table td.plat-td-origin {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(232,226,217,0.5); white-space: nowrap;
        }
        /* o ponto de categoria vai inline: um <td> com display:flex sai do
           layout de tabela e a coluna deixa de calcular largura direito. */
        .plat-table td.plat-td-cat {
          white-space: nowrap; font-size: 13px; color: rgba(232,226,217,0.6);
        }
        .plat-table td.plat-td-cat .plat-mark {
          display: inline-block; margin-right: 8px; vertical-align: middle;
        }

        .plat-legend {
          font: 400 12.5px/1.6 var(--font-sans); color: rgba(232,226,217,0.42);
          margin: 14px 0 0; max-width: 70ch;
        }
        .plat-legend strong {
          font-family: var(--font-mono); font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.08em; color: rgba(232,226,217,0.66);
        }

        /* ── bloco de operação ────────────────────────────────────────── */
        .plat-ops {
          margin-top: clamp(48px, 6vw, 76px);
          padding-top: clamp(30px, 3.6vw, 42px);
          border-top: 1px solid rgba(232,226,217,0.08);
        }
        .plat-ops-h {
          font: 700 clamp(21px, 2.6vw, 29px)/1.14 var(--font-display);
          letter-spacing: -0.03em; color: #fff; margin: 0; text-wrap: balance;
        }
        .plat-ops-p {
          font: 400 15.5px/1.65 var(--font-sans); color: rgba(232,226,217,0.6);
          margin: 14px 0 0; max-width: 66ch; text-wrap: pretty;
        }
        .plat-ops-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr));
          gap: 14px; margin-top: clamp(24px, 3vw, 32px);
        }
        .plat-op {
          min-width: 0; padding: clamp(20px, 2.4vw, 26px); border-radius: 14px;
          border: 1px solid var(--edge);
          border-top: 2px solid var(--tone);
          background: linear-gradient(180deg, rgba(232,226,217,0.045), rgba(232,226,217,0.012));
          box-shadow: 0 1px 0 rgba(232,226,217,0.05) inset;
        }
        .plat-op .plat-step { display: block; padding-top: 0; margin-bottom: 12px; }
        .plat-op-h {
          font: 700 16.5px/1.3 var(--font-display); letter-spacing: -0.022em; color: #fff;
          margin: 0 0 10px; text-wrap: balance;
        }
        .plat-op-p {
          font: 400 14.2px/1.62 var(--font-sans); color: rgba(232,226,217,0.62);
          margin: 0; text-wrap: pretty;
        }

        /* ── movimento: base VISÍVEL, entrada só como bônus ───────────── */
        @supports (animation-timeline: view()) {
          @media (prefers-reduced-motion: no-preference) {
            .plat-rise {
              animation: plat-rise-kf linear both;
              animation-timeline: view();
              animation-range: entry 2% entry 52%;
            }
          }
        }
        @keyframes plat-rise-kf {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .plat-rise { animation: none; opacity: 1; transform: none; }
          .plat-tile, .plat-rule, .plat-table tbody tr { transition: none; }
          .plat-tile:hover { transform: none; }
        }
      ` }} />
    </section>
  );
}

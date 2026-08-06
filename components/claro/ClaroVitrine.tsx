import { ArrowRight, Check, MessageCircle, TrendingUp } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   VITRINE — a seção logo abaixo do vídeo do topo.

   POR QUE ESTE ARQUIVO EXISTE: esta seção É parte do design original
   (`lit-hero.jsx`, função `LHero`) e eu simplesmente não a havia portado. O
   dono percebeu e reclamou com razão: "olhe logo abaixo do vídeo temos uma
   imagem e sumiu?". Restaurada aqui com o conteúdo exato do projeto do Claude
   Design, lido ao vivo pelo MCP — copy, foto, cartões flutuantes e números.

   ⚠️ PLACEHOLDER — OS NÚMEROS NÃO SÃO DADOS REAIS DA HYPERGROW.
   Os 4 indicadores ("5+ anos", "200+ lojas", "7,4x ROAS", "98% renovam") e as
   duas frases dos cartões flutuantes ("+38% em 90 dias", "respondido em 38
   segundos") vêm do mockup. São exatamente os mesmos do arquivo original —
   nada foi inventado aqui — e ficam por decisão explícita do dono ("manter
   como placeholder por ora"), na mesma linha de `ClaroClose.tsx`.
   Antes de qualquer campanha paga ou divulgação, isto vira dado real ou sai.

   Foto: Pexels (mesma do design, id 3932728), licença livre para uso
   comercial — igual às fotos já usadas em `ClaroSolucoes.tsx`.
   ──────────────────────────────────────────────────────────────────────────── */

const PX = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`;

const CHIPS = ["Sem contrato de fidelidade", "Relatório que você entende", "Time humano, não robô"];

/* ⚠️ PLACEHOLDER — ver aviso no topo do arquivo. */
const NUMEROS: [string, string][] = [
  ["5+", "anos de operação"],
  ["200+", "lojas e marcas atendidas"],
  ["7,4x", "ROAS médio alcançado"],
  ["98%", "clientes que renovam"],
];

export default function ClaroVitrine() {
  return (
    <section id="vitrine" className="sec vt">
      <div className="vt-glow" aria-hidden />
      <div className="wrap vt-in">
        <div className="vt-g">
          <div className="rv">
            <div className="eyebrow"><i />Agência de marketing, e-commerce e automação</div>
            <h2 className="h1 vt-h1">
              Sua empresa vendendo<br />
              <span className="grad">todos os dias</span>, com método.
            </h2>
            <p className="lead vt-lead">
              Cuidamos da loja, do anúncio, do conteúdo e do que acontece depois do clique —
              atendimento, CRM e ERP. Você olha o resultado, não a ferramenta.
            </p>
            <div className="vt-btns">
              <a href="#contato" className="btn btn-p">Falar com especialista <ArrowRight size={17} aria-hidden /></a>
              <a href="#solucoes" className="btn btn-s">Ver todas as soluções</a>
            </div>
            <ul className="vt-chips">
              {CHIPS.map((t) => (
                <li className="chip" key={t}><Check size={14} aria-hidden style={{ color: "var(--brand)" }} />{t}</li>
              ))}
            </ul>
          </div>

          <div className="rv vt-ph">
            <figure className="vt-fig">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PX(3932728)}
                alt="Empreendedora sorrindo ao atender um pedido pelo celular na sua loja"
                loading="lazy"
                decoding="async"
              />
            </figure>

            {/* ⚠️ PLACEHOLDER — frases do mockup, não são caso real. */}
            <div className="card vt-note">
              <span className="vt-note-ic" style={{ background: "rgba(15,157,88,.1)", color: "var(--wa)" }}>
                <MessageCircle size={18} aria-hidden />
              </span>
              <div>
                <b>Pedido novo pelo WhatsApp</b>
                <span>respondido em 38 segundos, sem ninguém no plantão</span>
              </div>
            </div>
            <div className="card vt-note vt-note--2">
              <span className="vt-note-ic" style={{ background: "rgba(21,80,232,.1)", color: "var(--brand)" }}>
                <TrendingUp size={18} aria-hidden />
              </span>
              <div>
                <b>Faturamento da loja</b>
                <span>+38% em 90 dias · ROAS 7,4</span>
              </div>
            </div>
          </div>
        </div>

        {/* ⚠️ PLACEHOLDER — ver aviso no topo do arquivo. */}
        <div className="rv vt-num">
          <div className="g g-220">
            {NUMEROS.map(([v, l]) => (
              <div key={l}>
                <div className="vt-num-v">{v}</div>
                <div className="small vt-num-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </section>
  );
}

const CSS = `
  .vt { position: relative; overflow: hidden; padding-top: 96px; padding-bottom: 0; }
  .vt-glow { position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(60% 50% at 88% 8%, rgba(21,80,232,.09), transparent 62%),
                radial-gradient(50% 40% at 4% 34%, rgba(224,22,95,.06), transparent 60%); }
  .vt-in { position: relative; }
  .vt-g { display: grid; grid-template-columns: 1.05fr .95fr; gap: var(--gap-split, 56px); align-items: center; }
  .vt-h1 { margin-top: 20px; }
  .vt-lead { margin-top: 22px; }
  .vt-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 30px; }
  .vt-chips { list-style: none; margin: 26px 0 0; padding: 0; display: flex; gap: 10px; flex-wrap: wrap; }

  .vt-ph { position: relative; }
  .vt-fig { margin: 0; border-radius: 24px; overflow: hidden; box-shadow: var(--sh-3);
            aspect-ratio: 4 / 4.6; background: var(--paper-2); }
  .vt-fig img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%;
                filter: contrast(1.04) saturate(.96); transition: transform .7s var(--ease); }
  .vt-ph:hover .vt-fig img { transform: scale(1.04); }

  /* Cartões flutuantes: saem para fora da foto de propósito (é o que dá a
     sensação de profundidade do design original). */
  .vt-note { position: absolute; display: flex; gap: 12px; align-items: flex-start;
             padding: 14px 16px; border-radius: 14px; box-shadow: var(--sh-3);
             max-width: 290px; left: -34px; bottom: 52px; }
  .vt-note--2 { left: auto; right: -26px; top: 36px; bottom: auto; }
  .vt-note-ic { flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px;
                display: inline-flex; align-items: center; justify-content: center; }
  .vt-note b { display: block; font: 600 14px var(--text); color: var(--ink); }
  .vt-note span { display: block; font: 400 13px/1.45 var(--text); color: var(--ink-3); margin-top: 2px; }

  .vt-num { margin-top: 72px; padding-top: 34px; border-top: 1px solid var(--line); }
  .vt-num-v { font: 700 40px/1 var(--disp); letter-spacing: -.04em; color: var(--ink); font-variant-numeric: tabular-nums; }
  .vt-num-l { margin-top: 8px; }

  /* LG da escala oficial (app/claro-tokens.css): a coluna da foto fica estreita
     demais para os cartões flutuantes negativos ainda caberem. */
  @media (max-width: 1180px) { .vt-note { left: -18px; } .vt-note--2 { right: -12px; } }
  /* MD: uma coluna. Os cartões entram para DENTRO da foto — para fora eles
     encostariam na borda da tela. */
  @media (max-width: 900px) {
    .vt { padding-top: var(--sec-y, 76px); }
    .vt-g { grid-template-columns: 1fr; }
    .vt-note { left: 10px; bottom: 14px; }
    .vt-note--2 { right: 10px; top: 14px; }
    .vt-num { margin-top: 48px; }
  }
  /* SM: o segundo cartão sai. Dois cartões sobre uma foto de 4/4 num celular
     cobrem o rosto da pessoa e viram ruído, não prova. */
  @media (max-width: 600px) {
    .vt-note--2 { display: none; }
    .vt-fig { aspect-ratio: 4 / 4; }
    .vt-note { max-width: calc(100% - 20px); }
    .vt-num-v { font-size: 34px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .vt-fig img { transition: none; }
    .vt-ph:hover .vt-fig img { transform: none; }
  }
`;

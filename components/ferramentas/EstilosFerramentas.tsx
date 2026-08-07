/* ─────────────────────────────────────────────────────────────────────────────
   CSS ÚNICO DAS FERRAMENTAS GRÁTIS.

   Server component puro (sem "use client", sem hook): as 5 rotas de ferramenta
   renderizam este bloco e nenhum JS extra vai para o navegador por causa dele.

   REGRAS QUE ESTE ARQUIVO OBEDECE (todas nasceram de bug real neste projeto,
   ver .claude/skills/hg-regras-de-bug):
   · injeção por dangerouslySetInnerHTML — o CSS tem aspas e o combinador ">",
     e o React escaparia esses caracteres dentro de <style>, o que quebra a
     hidratação da página inteira;
   · nenhum comentário com crase aqui dentro (fecharia o template literal);
   · nenhum filter/backdrop-filter em elemento fixo (trava a rolagem no iOS);
   · grade sempre com minmax(min(100%, X), 1fr) — nunca coluna fixa;
   · nada de largura em px sem min(Xpx, 100%).

   MOBILE PRIMEIRO, DE VERDADE: o desenho base é o do celular; o desktop entra
   só a partir de 901px. Campo com 50px de altura e fonte de 16px (abaixo disso
   o iOS dá zoom sozinho ao focar), alvo de toque de 44px em tudo que se clica,
   e NADA depende de :hover para funcionar ou revelar informação.
   ──────────────────────────────────────────────────────────────────────────── */

export default function EstilosFerramentas() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}

const CSS = `
  /* ══ estrutura ══════════════════════════════════════════════════════════ */
  .cl .ft-lay { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); align-items: start; }
  @media (min-width: 901px) {
    .cl .ft-lay { grid-template-columns: minmax(0, 1fr) minmax(0, 390px); gap: 24px; }
    .cl .ft-sticky { position: sticky; top: 104px; }
  }

  .cl .ft-card { background: var(--card); border: 1px solid var(--line); border-radius: 18px;
    box-shadow: var(--sh-1); padding: clamp(15px, 3.6vw, 26px); min-width: 0; }
  .cl .ft-card + .ft-card { margin-top: 16px; }
  .cl .ft-h { font: 600 15.5px/1.35 var(--text); color: var(--ink); margin: 0 0 4px; }
  .cl .ft-sub { font: 400 13.5px/1.55 var(--text); color: #5A6579; margin: 0 0 16px; }
  .cl .ft-sub:last-child { margin-bottom: 0; }

  /* ══ campos ═════════════════════════════════════════════════════════════ */
  .cl .ft-fields { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 185px), 1fr)); }
  .cl .ft-f { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
  .cl .ft-full { grid-column: 1 / -1; }
  .cl .ft-lbl { font: 600 13px/1.35 var(--text); color: var(--ink-2); }
  .cl .ft-hint { font: 400 12px/1.45 var(--text); color: #5A6579; }
  .cl .ft-inwrap { position: relative; display: flex; align-items: center; min-width: 0; }
  .cl .ft-pre, .cl .ft-suf { position: absolute; font: 600 14px var(--text); color: #5A6579; pointer-events: none; }
  .cl .ft-pre { left: 13px; }
  .cl .ft-suf { right: 13px; }
  .cl .ft-in { width: 100%; min-width: 0; min-height: 50px; border: 1px solid var(--line); border-radius: 12px;
    background: #fff; color: var(--ink); font: 500 16px var(--text); padding: 12px 14px;
    transition: border-color .2s var(--ease), box-shadow .2s var(--ease); }
  .cl .ft-in.pre { padding-left: 42px; }
  .cl .ft-in.suf { padding-right: 40px; }
  .cl .ft-in::placeholder { color: #9AA4B4; font-weight: 400; }
  /* Sem outline:none aqui: isso apagaria tambem o anel de :focus-visible e
     quem navega por teclado ficaria sem saber onde esta. */
  .cl .ft-in:focus { border-color: var(--acc); box-shadow: 0 0 0 3px var(--acc-soft); }
  .cl textarea.ft-in { min-height: 96px; resize: vertical; line-height: 1.5; font-family: var(--text); }

  /* ══ etiquetas clicaveis (presets) ══════════════════════════════════════ */
  .cl .ft-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .cl .ft-chip { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 8px 14px;
    border-radius: 99px; border: 1px solid var(--line); background: #fff; color: var(--ink-2);
    font: 600 13px var(--text); transition: border-color .2s var(--ease), color .2s var(--ease), background .2s var(--ease); }
  .cl .ft-chip:hover { border-color: #C7CFDE; }
  .cl .ft-chip[aria-pressed="true"] { border-color: var(--acc); color: var(--acc); background: var(--acc-soft); }
  .cl .ft-chip small { font: 500 12px var(--code); opacity: .72; }

  /* ══ resultado ══════════════════════════════════════════════════════════ */
  .cl .ft-res { border-radius: 18px; padding: clamp(16px, 3.8vw, 24px); min-width: 0;
    background: linear-gradient(152deg, var(--ink) 0%, #1A2439 100%); box-shadow: var(--sh-2); }
  .cl .ft-res-k { font: 600 10.5px var(--code); letter-spacing: .14em; text-transform: uppercase;
    color: rgba(255,255,255,.64); margin: 0 0 7px; }
  .cl .ft-res-v { font: 700 clamp(28px, 8.4vw, 40px)/1.04 var(--disp); letter-spacing: -.03em; color: #fff;
    margin: 0; overflow-wrap: anywhere; }
  .cl .ft-res-sub { font: 400 13.5px/1.5 var(--text); color: rgba(255,255,255,.7); margin: 8px 0 0; }
  .cl .ft-res-2 { margin-top: 18px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,.15); }
  .cl .ft-res-2 .ft-res-v { font-size: clamp(20px, 5.6vw, 26px); }

  .cl .ft-rows { display: grid; margin-top: 18px; border-top: 1px solid rgba(255,255,255,.15); }
  .cl .ft-row { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; flex-wrap: wrap;
    padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.1);
    font: 400 13.5px/1.45 var(--text); color: rgba(255,255,255,.74); }
  .cl .ft-row:last-child { border-bottom: none; }
  .cl .ft-row > span { min-width: 0; overflow-wrap: anywhere; }
  .cl .ft-row > b { font: 600 14.5px var(--text); color: #fff; margin-left: auto; overflow-wrap: anywhere; }
  .cl .ft-row.tot > b { font-size: 16px; }
  .cl .ft-row.tot { color: #fff; }

  /* faixa fina de resultado que acompanha a rolagem NO CELULAR.
     Fica logo abaixo do cabecalho fixo (88px) e some no desktop, onde o cartao
     de resultado ja mora na coluna da direita. Sem blur: so degrade. */
  .cl .ft-live { position: sticky; top: 88px; z-index: 6; display: flex; align-items: center; gap: 10px;
    flex-wrap: wrap; justify-content: space-between; margin: 0 0 14px; padding: 10px 15px; border-radius: 14px;
    background: linear-gradient(120deg, var(--ink), #1B2540); box-shadow: 0 16px 32px -20px rgba(11,18,32,.75); }
  .cl .ft-live-k { font: 600 10px var(--code); letter-spacing: .12em; text-transform: uppercase;
    color: rgba(255,255,255,.62); display: block; }
  .cl .ft-live-v { font: 700 19px/1.15 var(--disp); letter-spacing: -.02em; color: #fff; overflow-wrap: anywhere; }
  .cl .ft-live-i { min-width: 0; flex: 1 1 auto; }
  /* base 0 = encolhe o texto antes de empurrar o botao para a linha de baixo.
     So onde ha botao ao lado (gerador de link); nas calculadoras os dois
     numeros dividem a faixa e a base automatica e o que mantem os dois legiveis. */
  .cl .ft-live-grow { flex: 1 1 0; }
  /* Link na faixa: uma linha so, com reticencias. Sem isto o wa.me inteiro
     quebra em quatro linhas e a faixa come metade da tela do celular. */
  .cl .ft-live-link { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
    white-space: nowrap; font: 600 13px var(--code); color: #fff; }
  .cl .ft-live .ft-mini { flex: 0 0 auto; min-height: 44px; }
  @media (min-width: 901px) { .cl .ft-live { display: none; } }

  /* ══ avisos ═════════════════════════════════════════════════════════════ */
  .cl .ft-alert { display: flex; gap: 10px; align-items: flex-start; border-radius: 13px; padding: 12px 14px;
    font: 400 13.5px/1.5 var(--text); margin-top: 14px; }
  .cl .ft-alert svg { flex-shrink: 0; margin-top: 1px; }
  .cl .ft-alert.warn { background: #FFF7E8; border: 1px solid #F2DCAE; color: #6B4A05; }
  .cl .ft-alert.bad { background: #FDEDF2; border: 1px solid #F3C6D6; color: #8A0F3C; }
  .cl .ft-alert.ok { background: #EAF7F0; border: 1px solid #BFE5D2; color: #0B5637; }
  .cl .ft-alert.info { background: var(--paper-2); border: 1px solid var(--line); color: var(--ink-2); }
  .cl .ft-alert b { font-weight: 600; }

  /* ══ botoes de acao dentro da ferramenta ════════════════════════════════ */
  .cl .ft-acts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
  .cl .ft-acts .btn { flex: 1 1 auto; min-width: min(190px, 100%); min-height: 50px; }
  .cl .ft-mini { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 44px;
    padding: 10px 15px; border-radius: 11px; border: 1px solid var(--line); background: #fff; color: var(--ink-2);
    font: 600 13.5px var(--text); transition: border-color .2s var(--ease), color .2s var(--ease); }
  .cl .ft-mini:hover { border-color: #C7CFDE; color: var(--ink); }
  .cl .ft-mini.on { border-color: var(--acc); color: var(--acc); background: var(--acc-soft); }

  /* ══ saida de texto (link gerado) ═══════════════════════════════════════ */
  .cl .ft-out { display: block; width: 100%; min-width: 0; border-radius: 12px; border: 1px dashed var(--acc-line);
    background: var(--acc-soft); color: var(--ink); padding: 13px 15px; font: 500 13.5px/1.55 var(--code);
    overflow-wrap: anywhere; word-break: break-word; }

  /* ══ QR ═════════════════════════════════════════════════════════════════ */
  /* 300px de caixa - 20px de respiro = 280px de desenho. Num QR de versao 7
     (49 modulos com a zona de silencio) isso da ~5,7 px por modulo, folga
     confortavel para a camera de outro celular ler direto da tela. Abaixo de
     ~4 px por modulo a leitura comeca a falhar em aparelho de camera fraca. */
  .cl .ft-qr { display: block; width: min(300px, 100%); margin: 0 auto; background: #fff; border-radius: 14px;
    border: 1px solid var(--line); padding: 10px; box-shadow: var(--sh-1); }
  .cl .ft-qr svg { display: block; width: 100%; height: auto; }
  .cl .ft-qr-wrap { display: grid; gap: 12px; justify-items: center; }

  /* ══ contadores (simulador do Google) ═══════════════════════════════════ */
  .cl .ft-meter { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;
    font: 500 12.5px var(--text); color: #5A6579; }
  .cl .ft-meter b { font: 600 12.5px var(--code); color: var(--ink-2); }
  .cl .ft-meter.warn b { color: #8A5A00; }
  .cl .ft-meter.bad b { color: #B90E4C; }
  .cl .ft-track { height: 5px; border-radius: 99px; background: var(--line-2); overflow: hidden; margin-top: 7px; }
  .cl .ft-fill { height: 100%; border-radius: 99px; background: var(--acc); transition: width .25s var(--ease), background .25s; }
  .cl .ft-fill.warn { background: #E0A008; }
  .cl .ft-fill.bad { background: var(--cta); }

  /* ══ previa do resultado de busca ═══════════════════════════════════════ */
  .cl .ft-serp { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 18px;
    box-shadow: var(--sh-1); min-width: 0; overflow: hidden; }
  .cl .ft-serp.mob { max-width: min(420px, 100%); }
  .cl .ft-serp-head { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; min-width: 0; }
  .cl .ft-serp-fav { width: 28px; height: 28px; border-radius: 99px; border: 1px solid var(--line); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; background: var(--paper-2);
    font: 700 12px var(--disp); color: var(--ink-2); }
  .cl .ft-serp-site { min-width: 0; }
  .cl .ft-serp-name { font: 400 14px/1.3 arial, sans-serif; color: #202124; overflow-wrap: anywhere; }
  .cl .ft-serp-url { font: 400 12px/1.3 arial, sans-serif; color: #4d5156; overflow-wrap: anywhere; }
  .cl .ft-serp-t { font: 400 20px/1.3 arial, sans-serif; color: #1a0dab; margin: 0 0 3px; overflow-wrap: anywhere;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .cl .ft-serp.mob .ft-serp-t { font-size: 18px; }
  .cl .ft-serp-d { font: 400 14px/1.58 arial, sans-serif; color: #4d5156; margin: 0; overflow-wrap: anywhere;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .cl .ft-serp.mob .ft-serp-d { -webkit-line-clamp: 3; font-size: 13.5px; }
  .cl .ft-serp-empty { color: #9AA4B4; }
  .cl .ft-tabs { display: inline-flex; gap: 4px; padding: 4px; border-radius: 12px; background: var(--paper-2);
    border: 1px solid var(--line); margin-bottom: 14px; }
  .cl .ft-tab { min-height: 40px; padding: 8px 16px; border-radius: 9px; border: 0; background: transparent;
    font: 600 13.5px var(--text); color: var(--ink-2); transition: background .2s var(--ease), color .2s var(--ease); }
  .cl .ft-tab[aria-selected="true"] { background: #fff; color: var(--ink); box-shadow: var(--sh-1); }

  /* ══ conteudo de apoio (formulas, perguntas) ════════════════════════════ */
  .cl .ft-form { display: grid; gap: 12px; margin: 0; }
  .cl .ft-form > div { border-left: 3px solid var(--acc-line); padding-left: 14px; }
  .cl .ft-form dt { font: 600 14.5px/1.4 var(--text); color: var(--ink); margin-bottom: 3px; }
  .cl .ft-form dd { margin: 0; font: 400 14px/1.6 var(--text); color: var(--ink-2); overflow-wrap: anywhere; }
  .cl .ft-form code { font: 600 13.5px var(--code); color: var(--acc); background: var(--acc-soft);
    border-radius: 6px; padding: 2px 7px; display: inline-block; overflow-wrap: anywhere; }

  /* ══ cartoes do hub ═════════════════════════════════════════════════════ */
  .cl .ft-hub { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr)); }
  .cl .ft-hub-c { display: flex; flex-direction: column; gap: 10px; padding: clamp(18px, 3.4vw, 26px);
    border-radius: 18px; background: var(--card); border: 1px solid var(--line); box-shadow: var(--sh-1);
    color: inherit; min-width: 0; transition: transform .28s var(--ease), box-shadow .28s var(--ease), border-color .28s var(--ease); }
  .cl a.ft-hub-c:hover, .cl a.ft-hub-c:focus-visible { transform: translateY(-3px); box-shadow: var(--sh-2);
    border-color: color-mix(in srgb, var(--beam, var(--acc)) 34%, var(--line)); color: inherit; }
  .cl .ft-hub-ic { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center;
    justify-content: center; background: var(--acc-soft); color: var(--beam, var(--acc)); flex-shrink: 0; }
  .cl .ft-hub-t { font: 600 18px/1.3 var(--disp); letter-spacing: -.02em; color: var(--ink); margin: 0; }
  .cl .ft-hub-d { font: 400 14.5px/1.6 var(--text); color: var(--ink-2); margin: 0; }
  .cl .ft-hub-go { display: inline-flex; align-items: center; gap: 7px; margin-top: auto; padding-top: 6px;
    font: 600 13.5px var(--text); color: var(--beam, var(--acc)); }
  @media (prefers-reduced-motion: reduce) { .cl a.ft-hub-c:hover { transform: none; } }

  /* ══ selo de gratuito ═══════════════════════════════════════════════════ */
  .cl .ft-free { display: inline-flex; align-items: center; gap: 7px; border-radius: 99px; padding: 7px 13px;
    background: #EAF7F0; border: 1px solid #BFE5D2; color: #0B5637; font: 600 12px var(--text); }
`;

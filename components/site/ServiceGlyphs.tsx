// @ts-nocheck
/* ─────────────────────────────────────────────────────────────────────────────
   GRAFISMO POR SERVIÇO — a peça que faz "bater o olho e saber o que é".

   Problema: 19 cards de estrutura idêntica; a única pista era um ícone de 23px
   (0,45% da área do card). Cor e badge dizem em QUE FAMÍLIA o serviço está;
   este desenho diz O QUE ELE É, sem leitura.

   Coesão (o que mantém os 19 parecendo um sistema, não um clip-art):
     · mesmo viewBox 120×80, mesmo peso de traço (1.5), mesmas pontas arredondadas
     · escada de opacidade fixa: 1 = motivo principal · .45 = secundário · .16 = fantasma
     · tudo em currentColor → o card define a cor do pilar e o grafismo se recolore
   Variedade: só o desenho muda.

   Regra de qualidade: no máximo 3 motivos por grafismo. Se precisar de 4, o
   serviço está mal descrito, não mal desenhado.
   ──────────────────────────────────────────────────────────────────────────── */

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
const O2 = 0.45; // secundário
const O3 = 0.16; // fantasma / grade

const GLYPHS = {
  /* ── Vender online ───────────────────────────────────────────────────── */

  // Moldura de navegador: barra de topo + conteúdo + botão de CTA sólido.
  "criacao-de-site": (
    <>
      <rect x="12" y="10" width="96" height="60" rx="6" {...S} />
      <path d="M12 24h96" {...S} opacity={O2} />
      <circle cx="20" cy="17" r="1.8" fill="currentColor" opacity={O2} />
      <circle cx="27" cy="17" r="1.8" fill="currentColor" opacity={O2} />
      <circle cx="34" cy="17" r="1.8" fill="currentColor" opacity={O2} />
      <path d="M22 36h44" {...S} strokeWidth={3} />
      <path d="M22 46h58M22 54h34" {...S} opacity={O3} />
      <rect x="74" y="48" width="24" height="12" rx="3" fill="currentColor" />
    </>
  ),

  // Vitrine: toldo em arcos + produtos ao fundo + carrinho na frente.
  "loja-virtual": (
    <>
      <path d="M18 26q7-10 14 0 7-10 14 0 7-10 14 0 7-10 14 0" {...S} opacity={O2} />
      <path d="M18 26v42M74 26v42" {...S} opacity={O3} />
      <rect x="26" y="40" width="16" height="28" rx="2" {...S} opacity={O3} />
      <rect x="50" y="46" width="16" height="22" rx="2" {...S} opacity={O3} />
      <path d="M80 30h6l6 26h20" {...S} />
      <circle cx="96" cy="64" r="3" fill="currentColor" />
      <circle cx="108" cy="64" r="3" fill="currentColor" />
    </>
  ),

  // Bússola de estratégia sobre a grade dos marketplaces.
  "consultoria-ecommerce": (
    <>
      <g opacity={O3} {...S}>
        <rect x="12" y="14" width="14" height="14" rx="2" />
        <rect x="12" y="33" width="14" height="14" rx="2" />
        <rect x="12" y="52" width="14" height="14" rx="2" />
        <rect x="94" y="14" width="14" height="14" rx="2" />
        <rect x="94" y="33" width="14" height="14" rx="2" />
        <rect x="94" y="52" width="14" height="14" rx="2" />
      </g>
      <circle cx="60" cy="40" r="22" {...S} opacity={O2} />
      <path d="M69 31 55 37l-4 12 14-6z" {...S} />
      <circle cx="60" cy="40" r="2.4" fill="currentColor" />
    </>
  ),

  // Lupa sobre barras que sobem — busca + ranqueamento.
  seo: (
    <>
      <rect x="30" y="50" width="12" height="18" rx="2" {...S} opacity={O2} />
      <rect x="50" y="38" width="12" height="30" rx="2" {...S} opacity={O2} />
      <rect x="70" y="24" width="12" height="44" rx="2" {...S} />
      <path d="M76 18l6-6m0 0h-6m6 0v6" {...S} />
      <circle cx="46" cy="34" r="14" {...S} />
      <path d="M56 44l10 10" {...S} />
    </>
  ),

  // Rack de servidores com pulso de uptime atravessando.
  hospedagem: (
    <>
      <rect x="16" y="12" width="88" height="16" rx="3" {...S} opacity={O2} />
      <rect x="16" y="34" width="88" height="16" rx="3" {...S} />
      <rect x="16" y="56" width="88" height="16" rx="3" {...S} opacity={O2} />
      <circle cx="94" cy="20" r="1.6" fill="currentColor" opacity={O2} />
      <circle cx="94" cy="64" r="1.6" fill="currentColor" opacity={O2} />
      <path d="M24 42h14l5-8 6 16 5-8h32" {...S} />
    </>
  ),

  // Cartão inclinado + QR sobreposto (o cartão digital).
  "cartao-interativo": (
    <>
      <g transform="rotate(-7 46 40)">
        <rect x="12" y="20" width="68" height="42" rx="6" {...S} opacity={O2} />
        <path d="M22 44h26M22 52h16" {...S} opacity={O3} />
        <circle cx="30" cy="32" r="5" {...S} opacity={O2} />
      </g>
      <rect x="62" y="24" width="44" height="44" rx="5" {...S} />
      <rect x="68" y="30" width="10" height="10" rx="2" {...S} />
      <rect x="90" y="30" width="10" height="10" rx="2" {...S} />
      <rect x="68" y="52" width="10" height="10" rx="2" {...S} />
      <path d="M90 52h4v4M98 56v6M90 62h4" {...S} />
    </>
  ),

  // Funil de vendas com o gargalo apontado pela lupa da auditoria.
  "auditoria-comercial": (
    <>
      <path d="M14 14h58M14 14L46 44M72 14L46 44M46 44v18" {...S} opacity={O2} />
      <circle cx="60" cy="42" r="17" {...S} />
      <path d="M72 54l16 16" {...S} />
      <path d="M18 62h20M18 68h14" {...S} opacity={O3} />
    </>
  ),

  /* ── Atrair demanda ──────────────────────────────────────────────────── */

  // Megafone → ondas → alvo: anúncio que chega em quem importa.
  "marketing-trafego": (
    <>
      <path d="M14 32v16l10 4V28z" {...S} />
      <path d="M24 28l16-9v42l-16-9z" {...S} />
      <path d="M46 26a20 20 0 0 1 0 28M54 20a30 30 0 0 1 0 40" {...S} opacity={O2} />
      <circle cx="92" cy="40" r="18" {...S} opacity={O3} />
      <circle cx="92" cy="40" r="11" {...S} opacity={O2} />
      <circle cx="92" cy="40" r="4" fill="currentColor" />
    </>
  ),

  // Envelope → fluxo automático → entregue.
  "email-marketing": (
    <>
      <rect x="12" y="22" width="46" height="34" rx="4" {...S} />
      <path d="M12 26l23 16 23-16" {...S} />
      <path d="M62 39h10M82 26h8M82 52h8" {...S} opacity={O2} />
      <path d="M72 39V26h10M72 39v13h10" {...S} opacity={O2} />
      <circle cx="96" cy="26" r="6" {...S} opacity={O2} />
      <circle cx="96" cy="52" r="6" {...S} />
      <path d="M93 52l2 2 4-4" {...S} />
    </>
  ),

  // 3 stories verticais 9:16 + barra de progresso — formato indexável.
  "web-stories": (
    <>
      <rect x="14" y="20" width="24" height="42" rx="4" {...S} opacity={O3} />
      <rect x="82" y="20" width="24" height="42" rx="4" {...S} opacity={O3} />
      <rect x="44" y="12" width="32" height="56" rx="5" {...S} />
      <path d="M49 19h6M58 19h6M67 19h4" {...S} opacity={O2} />
      <circle cx="60" cy="42" r="9" {...S} opacity={O2} />
      <path d="M66 48l5 5" {...S} opacity={O2} />
    </>
  ),

  /* ── Marca & conteúdo ────────────────────────────────────────────────── */

  // Calendário editorial + conversa da comunidade.
  "redes-sociais": (
    <>
      <rect x="14" y="16" width="66" height="52" rx="5" {...S} opacity={O2} />
      <path d="M14 30h66M30 16v-6M64 16v-6" {...S} opacity={O2} />
      <rect x="22" y="38" width="12" height="10" rx="2" fill="currentColor" />
      <rect x="42" y="38" width="12" height="10" rx="2" {...S} opacity={O3} />
      <rect x="62" y="38" width="12" height="10" rx="2" {...S} opacity={O3} />
      <rect x="22" y="54" width="12" height="10" rx="2" {...S} opacity={O3} />
      <rect x="42" y="54" width="12" height="10" rx="2" fill="currentColor" />
      <path d="M76 46h26a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-14l-6 6v-6h-6a4 4 0 0 1-4-4V50a4 4 0 0 1 4-4z" {...S} />
    </>
  ),

  // Grid de feed + setas de carrossel.
  "posts-redes-sociais": (
    <>
      <g opacity={O3} {...S}>
        <rect x="28" y="10" width="18" height="18" rx="3" />
        <rect x="72" y="10" width="18" height="18" rx="3" />
        <rect x="28" y="32" width="18" height="18" rx="3" />
        <rect x="72" y="32" width="18" height="18" rx="3" />
        <rect x="28" y="54" width="18" height="18" rx="3" />
        <rect x="50" y="54" width="18" height="18" rx="3" />
        <rect x="72" y="54" width="18" height="18" rx="3" />
      </g>
      <rect x="50" y="10" width="18" height="18" rx="3" fill="currentColor" />
      <rect x="50" y="32" width="18" height="18" rx="3" {...S} />
      <path d="M18 41l-6-5 6-5M100 31l6 5-6 5" {...S} opacity={O2} />
    </>
  ),

  // Tira de filme vertical + play sólido.
  "posts-video": (
    <>
      <rect x="38" y="8" width="44" height="64" rx="5" {...S} />
      <g opacity={O2} {...S}>
        <rect x="42" y="14" width="6" height="7" rx="1.5" />
        <rect x="42" y="27" width="6" height="7" rx="1.5" />
        <rect x="42" y="40" width="6" height="7" rx="1.5" />
        <rect x="42" y="53" width="6" height="7" rx="1.5" />
        <rect x="72" y="14" width="6" height="7" rx="1.5" />
        <rect x="72" y="27" width="6" height="7" rx="1.5" />
        <rect x="72" y="40" width="6" height="7" rx="1.5" />
        <rect x="72" y="53" width="6" height="7" rx="1.5" />
      </g>
      <path d="M54 30l16 10-16 10z" fill="currentColor" />
    </>
  ),

  // Anel de story segmentado + enquete dentro.
  "stories-instagram": (
    <>
      <circle cx="60" cy="40" r="30" {...S} strokeDasharray="30 8" />
      <circle cx="60" cy="40" r="23" {...S} opacity={O3} />
      <rect x="46" y="30" width="28" height="7" rx="3.5" fill="currentColor" opacity={O2} />
      <rect x="46" y="42" width="16" height="7" rx="3.5" fill="currentColor" opacity={O2} />
      <path d="M46 55h28" {...S} opacity={O3} />
    </>
  ),

  // Claquete + linha do tempo de edição.
  "producao-de-video": (
    <>
      <rect x="16" y="20" width="52" height="34" rx="4" {...S} />
      <path d="M16 30h52" {...S} />
      <path d="M26 20l-6 10M40 20l-6 10M54 20l-6 10" {...S} opacity={O2} />
      <g opacity={O3} {...S}>
        <rect x="16" y="60" width="24" height="10" rx="2" />
        <rect x="44" y="60" width="30" height="10" rx="2" />
        <rect x="78" y="60" width="26" height="10" rx="2" />
      </g>
      <path d="M86 14v56" {...S} />
      <circle cx="86" cy="14" r="3" fill="currentColor" />
    </>
  ),

  // Câmera + softbox de estúdio.
  "producao-fotografica": (
    <>
      <path d="M14 22l22-8v52l-22-8z" {...S} opacity={O2} />
      <path d="M38 30h8M38 40h10M38 50h8" {...S} opacity={O3} />
      <rect x="56" y="24" width="50" height="36" rx="5" {...S} />
      <path d="M68 24l4-6h14l4 6" {...S} />
      <circle cx="81" cy="42" r="11" {...S} />
      <circle cx="81" cy="42" r="5" fill="currentColor" />
    </>
  ),

  // Ciclorama (fundo infinito) + produto isométrico + sombra.
  "fotos-produtos": (
    <>
      <path d="M14 16v26q0 14 16 14h76" {...S} opacity={O3} />
      <path d="M60 22l22 11v22L60 66 38 55V33z" {...S} />
      <path d="M38 33l22 11 22-11M60 44v22" {...S} opacity={O2} />
      <ellipse cx="60" cy="72" rx="26" ry="4" {...S} opacity={O3} />
    </>
  ),

  // Leque de peças de campanha + cursor.
  "design-identidade": (
    <>
      <g transform="rotate(-9 60 40)">
        <rect x="26" y="16" width="52" height="46" rx="5" {...S} opacity={O3} />
      </g>
      <g transform="rotate(-2 60 40)">
        <rect x="34" y="18" width="52" height="46" rx="5" {...S} opacity={O2} />
      </g>
      <rect x="42" y="20" width="52" height="46" rx="5" {...S} />
      <path d="M52 34h32M52 44h22" {...S} opacity={O2} />
      <path d="M76 52l14 12-5 1 3 6-3 1-3-6-4 3z" fill="currentColor" />
    </>
  ),

  // Grade de construção de marca: formas primárias + guias.
  "criacao-logo": (
    <>
      <path d="M60 4v72M24 40h72" {...S} opacity={O3} strokeDasharray="4 5" />
      <rect x="30" y="24" width="34" height="34" rx="3" {...S} opacity={O3} />
      <circle cx="66" cy="41" r="19" {...S} opacity={O2} />
      <path d="M52 56l14-24 14 24z" {...S} />
      <path d="M18 22v-4h5M102 22v-4h-5M18 58v4h5M102 58v4h-5" {...S} opacity={O2} />
    </>
  ),

  /* ── Operar com IA ───────────────────────────────────────────────────── */

  // Núcleo de IA distribuindo trabalho: conversa, 24h e concluído.
  "automacoes-ia": (
    <>
      <g opacity={O3}>
        <circle cx="24" cy="16" r="1.4" fill="currentColor" />
        <circle cx="60" cy="12" r="1.4" fill="currentColor" />
        <circle cx="96" cy="16" r="1.4" fill="currentColor" />
        <circle cx="24" cy="66" r="1.4" fill="currentColor" />
        <circle cx="96" cy="66" r="1.4" fill="currentColor" />
      </g>
      <path d="M60 26L46 34v16l14 8 14-8V34z" {...S} />
      <circle cx="60" cy="42" r="4" fill="currentColor" />
      <path d="M46 34L26 28M74 34l20-6M46 50l-20 8M74 50l20 8" {...S} opacity={O2} />
      <path d="M10 20h16a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-8l-5 5v-5h-3a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3z" {...S} opacity={O2} />
      <circle cx="102" cy="24" r="9" {...S} opacity={O2} />
      <path d="M102 19v5l3 3" {...S} opacity={O2} />
      <circle cx="102" cy="62" r="9" {...S} opacity={O2} />
      <path d="M98 62l3 3 5-6" {...S} />
      <path d="M14 56h16" {...S} opacity={O2} />
    </>
  ),

  // Funil de vendas afunilando até o negócio fechado + IA gerando insight (sparkle) e tendência.
  "crm-com-ia": (
    <>
      <path d="M12 14h72l-9 15H21z" {...S} />
      <path d="M24 33h48l-8 14H32z" {...S} opacity={O2} />
      <path d="M35 51h26l-6 15H41z" {...S} opacity={O2} />
      <circle cx="48" cy="70" r="2.6" fill="currentColor" />
      <path d="M100 14l2.8 8.6 8.6 2.8-8.6 2.8-2.8 8.6-2.8-8.6-8.6-2.8 8.6-2.8z" fill="currentColor" />
      <path d="M78 60l8-6 7 4 9-9" {...S} opacity={O2} />
    </>
  ),

  // Conversa que entra e é triada pela IA: bifurca em pronto (check) ou pesquisando (relógio).
  "sdr-com-ia": (
    <>
      <path d="M10 20h40a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H26l-9 8v-8h-1a6 6 0 0 1-6-6V26a6 6 0 0 1 6-6z" {...S} />
      <path d="M20 32h26M20 40h18" {...S} opacity={O2} />
      <path d="M60 39h14M74 39l14-16M74 39l14 16" {...S} opacity={O2} />
      <circle cx="98" cy="20" r="11" {...S} />
      <path d="M93 20l4 4 8-8" {...S} />
      <circle cx="98" cy="60" r="11" {...S} opacity={O3} />
      <path d="M98 53v7l5 4" {...S} opacity={O3} />
    </>
  ),
};

/** Grafismo do serviço. Herda a cor do pilar via currentColor.
 *  Se um serviço novo não tiver desenho, retorna null e o card cai no ícone lucide. */
export default function ServiceGlyph({ slug, height = 80 }) {
  const g = GLYPHS[slug];
  if (!g) return null;
  return (
    <svg viewBox="0 0 120 80" height={height} width={(height * 120) / 80} aria-hidden="true" focusable="false" style={{ display: "block", overflow: "visible" }}>
      {g}
    </svg>
  );
}

export { GLYPHS };

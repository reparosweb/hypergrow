import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FLAGSHIP_SLUGS, pillarOf, type ServiceCardData } from "@/lib/pillars";
import { ClaroHead } from "./ClaroUI";
import { ClaroServiceIcon } from "./ClaroServiceIcon";
import { CLARO_PILLAR_ACCENT } from "./claroPillarAccent";

/* ─────────────────────────────────────────────────────────────────────────────
   CATÁLOGO (mais serviços na home, sem precisar clicar em aba) — pedido do
   dono depois da bronca de 2026-08-06: "ClaroSolucoes" já mostra os serviços,
   mas só um pilar por vez (abas). Esta seção é NOVA e ACRESCENTA uma grade
   maior, com serviços de vários pilares ao mesmo tempo, sem substituir as
   abas.

   Reaproveita o MESMO mecanismo visual de ClaroSolucoes.tsx: `.card.lit` com
   `--beam` na cor do pilar (CLARO_PILLAR_ACCENT, a paleta local desta rota —
   não inventei uma cor nova). Como esta grade mistura serviços de pilares
   diferentes no mesmo grid (a Solucoes só mostra 1 pilar por vez), o `--beam`
   é calculado POR CARD via `pillarOf(slug)`, não uma única variável no
   container.

   CURADORIA: os 4 "carro-chefe" (FLAGSHIP_SLUGS) primeiro, depois o resto do
   catálogo (2026-08-06: passou de 10 para os 22 reais — pedido explícito do
   dono depois de ver a grade inicial: "quero mais copy de todos os serviços
   que eu ofereço"). `services` chega do server já enxuto (mesmo contrato de
   ClaroSolucoes/ClaroNav) — não importa lib/site-services.ts direto aqui,
   mesma razão de performance já documentada nos outros arquivos desta rota. */
const CATALOGO_HOME = [
  ...FLAGSHIP_SLUGS,
  "seo", "redes-sociais", "crm-com-ia", "email-marketing", "criacao-logo", "sdr-com-ia",
  "consultoria-ecommerce", "hospedagem", "cartao-interativo", "auditoria-comercial",
  "web-stories", "posts-redes-sociais", "posts-video", "stories-instagram",
  "producao-de-video", "producao-fotografica", "fotos-produtos", "design-identidade",
];

/* Copy escrita pelo agente hg-conteudo (2026-08-06), em duas rodadas, a
   partir do catálogo real em lib/site-services.ts — nada inventado, nenhum
   número que não estivesse já no texto publicado do serviço. `blurb` mede
   65-85 caracteres de propósito: o card tem `-webkit-line-clamp:2` numa
   coluna de ~240px, e a primeira leva de frases (17-20 palavras) não cabia
   em duas linhas sem cortar no meio — o mesmo tipo de "fonte estourando a
   borda" que o dono reclamou em outro lugar do site. Se um slug não tiver
   entrada aqui, o card cai no fallback `title`/`desc` de lib/site-services.ts
   (nunca fica sem texto, nunca trava a estrutura esperando copy nova). */
export type ServicoCopyOverride = { headline?: string; blurb?: string };
export const CATALOGO_COPY_OVERRIDES: Record<string, ServicoCopyOverride> = {
  "criacao-de-site": { headline: "Seu site vendendo, não só existindo", blurb: "Cada página construída com um objetivo: venda, contato ou agendamento." },
  "loja-virtual": { headline: "Loja pronta para vender, não travar no checkout", blurb: "Catálogo, checkout e frete configurados — sem o carrinho abandonado que trava venda." },
  "marketing-trafego": { headline: "Tráfego pago com plano, não no escuro", blurb: "Público, oferta e funil definidos antes do primeiro real investido em anúncio." },
  "automacoes-ia": { headline: "Atendimento que nunca deixa cliente esperando", blurb: "Agente treinado no seu catálogo responde no WhatsApp na hora, 24 horas por dia." },
  "seo": { headline: "Tráfego que chega sem pagar por clique", blurb: "SEO técnico e conteúdo criam um fluxo de visitas que continua sem anúncio pago." },
  "redes-sociais": { headline: "Presença que aparece todo dia, sem você lembrar", blurb: "Pauta, arte, legenda e resposta a comentário — a constância que a maioria perde." },
  "email-marketing": { headline: "Carrinho abandonado virando venda no automático", blurb: "Réguas automáticas de boas-vindas e recuperação vendem mesmo sem você mexer em nada." },
  "crm-com-ia": { headline: "Nenhum lead perdido em planilha ou memória", blurb: "O mesmo funil que já roda no Agentop, no ar, organizado dentro do seu processo." },
  "criacao-logo": { headline: "Uma identidade que funciona em qualquer lugar", blurb: "Logo em toda versão, com manual de marca — ninguém aplica sua identidade errado." },
  "sdr-com-ia": { headline: "Só lead pronto chega ao seu vendedor", blurb: "O mesmo agente que qualifica quem visita este site agora filtra seus leads." },
  "consultoria-ecommerce": { headline: "Saiba onde sua operação está perdendo receita", blurb: "Diagnóstico cruza seus números com o mercado e prioriza por impacto." },
  "hospedagem": { headline: "Seu site sempre no ar, sem susto", blurb: "Monitoramos o uptime 24/7 e agimos antes que você perceba a queda." },
  "cartao-interativo": { headline: "Todos seus contatos em um toque", blurb: "QR Code e vCard salvam seu contato direto na agenda de quem visitar." },
  "auditoria-comercial": { headline: "Descubra onde sua venda está travando", blurb: "Acompanhamos suas ligações reais e achamos o gargalo, não um genérico." },
  "web-stories": { headline: "Tráfego do Google que não para", blurb: "Páginas indexáveis pelo Google que trazem visita sem pagar por clique." },
  "posts-redes-sociais": { headline: "Feed com cara de marca grande", blurb: "Padrão visual consistente em cada post — feed reconhecível à primeira vista." },
  "posts-video": { headline: "Reels editados para prender atenção", blurb: "Cortes, legenda e ritmo pensados para segurar o espectador até o fim." },
  "stories-instagram": { headline: "Presença diária no topo do feed", blurb: "Enquetes e caixinhas que viram conversa — e conversa que vira venda." },
  "producao-de-video": { headline: "Vídeos que prendem do primeiro segundo", blurb: "Roteiro com gancho nos 3 segundos iniciais, editado para reter até o fim." },
  "producao-fotografica": { headline: "Fotos que constroem autoridade de marca", blurb: "Shot list planejado antes do clique — nada de foto solta e genérica." },
  "fotos-produtos": { headline: "Fotos no padrão que os marketplaces exigem", blurb: "Fundo branco exatamente no padrão que Mercado Livre, Amazon e Shopee exigem." },
  "design-identidade": { headline: "Peças feitas para vender, não só bonitas", blurb: "Cada peça nasce com um objetivo: clique, lead ou venda — nunca só estética." },
};

export default function ClaroServicos({ services }: { services: ServiceCardData[] }) {
  const porSlug = new Map(services.map((s) => [s.slug, s]));
  const itens = CATALOGO_HOME
    .map((slug) => porSlug.get(slug))
    .filter((s): s is ServiceCardData => !!s);

  return (
    // "alt" de propósito: entra logo depois de ClaroCaptura (faixa full-bleed
    // em vídeo, não usa `.sec`, não participa da alternância --paper/--paper-2)
    // e antes de ClaroDiag ("plain"/`sec` sem alt) — ver ordem completa no topo
    // de ClaroSite.tsx. Como o vizinho de cima não é `.sec`, inserir aqui não
    // exige tocar no className de nenhuma outra seção da página.
    <section id="catalogo" className="sec alt">
      <div className="wrap">
        <ClaroHead center eyebrow="Catálogo" sub={`Um recorte do que fazemos, direto na página — sem precisar trocar de aba. O catálogo completo tem ${services.length} serviços.`}>
          Mais soluções, <span className="grad">na mesma operação</span>
        </ClaroHead>

        <div className="svm-grid">
          {itens.map((s, i) => {
            const cor = CLARO_PILLAR_ACCENT[pillarOf(s.slug).key];
            const overr = CATALOGO_COPY_OVERRIDES[s.slug];
            const headline = overr?.headline || s.title;
            // ⚠️ PLACEHOLDER — s.desc é o texto curto já publicado em
            // /servicos/[slug]; some assim que a copy definitiva (hg-conteudo)
            // preencher CATALOGO_COPY_OVERRIDES[s.slug].blurb.
            const blurb = overr?.blurb || s.desc;
            const flagship = FLAGSHIP_SLUGS.includes(s.slug);
            return (
              <Link
                href={`/servicos/${s.slug}`}
                className="card svm-card lit"
                key={s.slug}
                style={{ ["--beam" as string]: cor, animationDelay: `${i * 30}ms` }}
              >
                {flagship && (
                  <span className="chip svm-flag" style={{ color: cor, borderColor: cor + "40", background: cor + "0f" }}>
                    Carro-chefe
                  </span>
                )}
                <span className="svm-ic glow"><ClaroServiceIcon name={s.icon} size={20} /></span>
                <b className="glow-t svm-t">{headline}</b>
                <p className="svm-d">{blurb}</p>
                <span className="svm-go">Ver serviço <ArrowRight size={14} aria-hidden /></span>
              </Link>
            );
          })}
        </div>

        <div className="svm-cta">
          <Link href="/servicos" className="btn btn-d">
            Ver o catálogo completo <ArrowRight size={17} aria-hidden />
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        #catalogo .svm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:var(--gap);margin-top:44px}
        /* fill-mode backwards (não forwards): a animação segura o estado inicial
           durante o delay e SOLTA o elemento quando termina — com forwards o
           transform final ficaria travado e mataria o levantar do :hover
           (mesmo bug documentado em ClaroSolucoes.tsx). */
        #catalogo .svm-card{position:relative;display:flex;flex-direction:column;gap:10px;padding:24px 22px;text-decoration:none;color:inherit;animation:svm-in .42s var(--ease) backwards}
        @keyframes svm-in{from{opacity:0;transform:translateY(9px)}}
        #catalogo .svm-flag{align-self:flex-start;padding:4px 10px;font-size:11.5px}
        #catalogo .svm-ic{flex-shrink:0;width:44px;height:44px;border-radius:12px;border:1px solid color-mix(in srgb,var(--beam) 18%,white);background:color-mix(in srgb,var(--beam) 8%,white);color:var(--beam);display:inline-flex;align-items:center;justify-content:center;transition:color .3s var(--ease),background .3s var(--ease),border-color .3s var(--ease),box-shadow .3s var(--ease)}
        #catalogo .svm-t{font:600 16px/1.35 var(--text);color:var(--ink);transition:color .3s var(--ease)}
        #catalogo .svm-d{flex:1;font:400 14px/1.55 var(--text);color:var(--ink-2);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
        #catalogo .svm-go{display:inline-flex;align-items:center;gap:6px;margin-top:2px;font:600 13.5px var(--text);color:var(--beam);opacity:0;transform:translateX(-5px);transition:opacity .28s var(--ease),transform .28s var(--ease)}
        #catalogo .svm-card:hover{border-color:color-mix(in srgb,var(--beam) 26%,var(--line));box-shadow:0 16px 36px -20px var(--beam),var(--sh-2)}
        #catalogo .svm-card:focus-visible{outline:2px solid var(--beam);outline-offset:3px;transform:translateY(-3px);border-color:color-mix(in srgb,var(--beam) 26%,var(--line));box-shadow:0 16px 36px -20px var(--beam),var(--sh-2)}
        #catalogo .svm-card:focus-visible::after{opacity:1;animation:cl-ba 2.4s linear infinite}
        #catalogo .svm-card:hover .svm-ic,#catalogo .svm-card:focus-visible .svm-ic{color:#fff!important;background:var(--beam)!important;border-color:var(--beam);box-shadow:0 10px 24px -10px var(--beam)}
        #catalogo .svm-cta{margin-top:32px;text-align:center}
        @media(max-width:600px){#catalogo .svm-grid{margin-top:34px}#catalogo .svm-card{padding:20px 18px}}
        @media(prefers-reduced-motion:reduce){
          #catalogo .svm-card{animation:none}
          #catalogo .svm-card:hover,#catalogo .svm-card:focus-visible{transform:none}
        }
      `}} />
    </section>
  );
}

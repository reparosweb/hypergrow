"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search, Ruler, Wrench, Gauge, TrendingUp, ArrowRight, ArrowUpRight,
  UserRound, LineChart, ShieldCheck,
} from "lucide-react";
import { PROJECTS } from "@/lib/projects";
import { blogPosts } from "@/lib/blog-posts";
import { BrowserFrame } from "@/components/site/DeviceMockup";
import { ClaroHead } from "./ClaroUI";

/* ─────────────────────────────────────────────────────────────────────────────
   BANNER, FLUXO, PORTFÓLIO, CLIENTES, SOBRE, BLOG — versão clara.

   Portfólio, clientes e blog usam os MESMOS dados reais já publicados no site
   escuro (lib/projects.ts, lib/blog-posts.ts) — o mockup original tinha 4
   projetos de clientes FICTÍCIOS ("Cafeteria de bairro", "Ateliê de flores"...)
   com foto de banco Pexels fingindo ser projeto real, e uma marquee que
   misturava 4 nomes reais (Agentop, NutriSnap, Unixx, Packslog) com 6
   inventados. Trocar por dado real custa a mesma linha de código e é
   estritamente melhor — não há motivo pra portar o fictício aqui.

   Os cartões de ESTATÍSTICA da seção Clientes (20+ anos, 480+ projetos, 7,4x
   ROAS, 98% renovação) são a exceção: o dono pediu para MANTER como
   placeholder por ora, não trocar por dado real (não existe dado real
   equivalente ainda). Ficam com os MESMOS números do mockup original — não
   um novo número inventado — e marcados abaixo com comentário PLACEHOLDER. */

/* ── Banner full-bleed em vídeo ───────────────────────────────────────────── */
export function ClaroBanner() {
  const v = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = v.current; if (!el) return;
    /* Quem pediu menos movimento no sistema não recebe vídeo rodando em loop
       atrás do texto: fica no poster. `autoPlay` é atributo, então não basta
       "não chamar play()" — tem que pausar de fato depois que o browser começa. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.pause();
      const trava = () => el.pause();
      el.addEventListener("play", trava);
      return () => el.removeEventListener("play", trava);
    }
    const kick = () => el.play().catch(() => {});
    el.addEventListener("loadeddata", kick);
    el.addEventListener("canplay", kick);
    kick();
    return () => { el.removeEventListener("loadeddata", kick); el.removeEventListener("canplay", kick); };
  }, []);
  return (
    <section className="cl-bn">
      <video ref={v} className="cl-bn-v" poster="/media/launch-poster.webp" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1}>
        <source src="/media/launch.mp4" type="video/mp4" />
      </video>
      <div className="cl-bn-grade" aria-hidden />
      <div className="wrap cl-bn-in">
        <div className="eyebrow" style={{ color: "rgba(255,255,255,.72)" }}><i style={{ background: "#E0165F" }} />Operação em ignição</div>
        <h2 className="h2 cl-bn-h" style={{ color: "#fff", marginTop: 16, maxWidth: 720 }}>
          Empresa boa não precisa de sorte.<br />Precisa de <span style={{ color: "#9FB2FF" }}>estrutura para escalar</span>.
        </h2>
        <p className="lead cl-bn-p" style={{ color: "rgba(255,255,255,.86)", marginTop: 18, maxWidth: 560 }}>
          Loja, anúncio, atendimento e time comercial funcionando como um sistema — não como seis fornecedores diferentes.
        </p>
        <div className="cl-bn-cta">
          <Link href="#diagnostico" className="btn btn-p">Fazer o diagnóstico gratuito <ArrowRight className="cl-arw" size={17} /></Link>
          <Link href="#contato" className="btn cl-bn-b2">Falar com especialista</Link>
        </div>
      </div>
      {/* Sem backdrop-filter no botão sobre o vídeo: blur em cima de vídeo que
          está tocando repinta a cada frame e já custou travamento de scroll no
          mobile neste projeto. Fundo translúcido sólido dá o mesmo efeito. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .cl-bn{position:relative;min-height:min(520px,70vh);display:flex;align-items:center;overflow:hidden;background:#0D1013}
        .cl-bn-v{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:58% 42%}
        .cl-bn-grade{position:absolute;inset:0;background:linear-gradient(96deg,rgba(13,16,19,.94) 0%,rgba(13,16,19,.72) 42%,rgba(13,16,19,.3) 74%,rgba(13,16,19,.55) 100%)}
        .cl-bn-in{position:relative;padding:76px 34px}
        .cl-bn-h{text-shadow:0 2px 24px rgba(6,8,11,.45)}
        .cl-bn-p{text-shadow:0 1px 14px rgba(6,8,11,.5)}
        .cl-bn-cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
        .cl-bn-b2{background:rgba(255,255,255,.13);color:#fff;border:1px solid rgba(255,255,255,.34)}
        .cl-bn-b2:hover{background:rgba(255,255,255,.24);border-color:rgba(255,255,255,.85);color:#fff;transform:translateY(-2px)}
        .cl-bn-cta .btn:focus-visible{outline:2px solid #fff;outline-offset:3px}
        .cl-bn .cl-arw{transition:transform .25s var(--ease)}
        .cl-bn .btn:hover .cl-arw{transform:translateX(3px)}
        @media(prefers-reduced-motion:reduce){.cl-bn .btn:hover{transform:none}.cl-bn .btn:hover .cl-arw{transform:none}}
        @media(max-width:760px){.cl-bn{min-height:460px}.cl-bn-in{padding:60px 20px}.cl-bn-grade{background:linear-gradient(180deg,rgba(13,16,19,.6),rgba(13,16,19,.92))}.cl-bn-cta .btn{width:100%}}
      `}} />
    </section>
  );
}

/* ── Fluxo do processo — MESMA copy já aprovada no site escuro (Process(),
   HypergrowSite.tsx), não uma nova redação para esta rota. ─────────────────── */
const FLUXO = [
  { Ic: Search, t: "Diagnóstico", d: "Entendemos sua operação, metas e gargalos antes de propor qualquer solução.", hex: "#0A6C9E" },
  { Ic: Ruler, t: "Planejamento", d: "Desenhamos a estratégia, o escopo e o roadmap de tecnologia ideal.", hex: "#1B3B8B" },
  { Ic: Wrench, t: "Desenvolvimento", d: "Construímos com tecnologia de ponta, IA e automação — direto ao ponto.", hex: "#3B2FCC" },
  { Ic: Gauge, t: "Implantação", d: "Colocamos no ar, integramos e treinamos sua equipe para usar.", hex: "#5B3CFF" },
  { Ic: TrendingUp, t: "Crescimento", d: "Monitoramos, otimizamos e escalamos os resultados de forma contínua.", hex: "#E0165F" },
];

export function ClaroFluxo() {
  return (
    <section id="processo" className="sec alt">
      <div className="wrap">
        <ClaroHead center eyebrow="Como trabalhamos" sub="Nada de improviso. Cada etapa tem responsável, prazo e entregável definido.">
          Um processo que você <span className="grad">consegue acompanhar</span>
        </ClaroHead>
        <div className="cl-fx">
          <span className="cl-fx-line" aria-hidden><i /></span>
          {FLUXO.map(({ Ic, t, d, hex }, i) => (
            // O `rv` saiu do container e veio para cada nó: antes a cascata era
            // um @keyframes com animation-delay que rodava no CARREGAMENTO, ou
            // seja, terminava enquanto o container ainda estava invisível — o
            // visitante nunca via a entrada escalonada. Agora usa o mesmo
            // observer do resto da página, com atraso por transition-delay.
            <article className="card cl-fx-node lit rv" key={t} style={{ ["--beam" as string]: hex, transitionDelay: i * 0.09 + "s" }}>
              <span className="cl-fx-ic glow" style={{ color: hex, background: hex + "12", borderColor: hex + "2e" }}><Ic size={20} /></span>
              <span className="cl-fx-n mono" style={{ color: hex }}>Etapa {i + 1}</span>
              <b className="glow-t">{t}</b>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </div>
      {/* A luz que percorre a linha do processo anima `transform`, não `left`:
          animar `left` refaz layout a cada quadro, em loop infinito, na seção
          inteira — é o tipo de coisa que trava a rolagem no celular. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .cl-fx{position:relative;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;margin-top:48px}
        .cl-fx-line{position:absolute;top:48px;left:6%;right:6%;height:2px;background:repeating-linear-gradient(90deg,var(--line) 0 7px,transparent 7px 14px);overflow:hidden}
        .cl-fx-line i{position:absolute;top:-1px;left:0;width:18%;height:4px;border-radius:99px;background:linear-gradient(90deg,transparent,var(--brand),transparent);transform:translateX(-120%);animation:cl-fxpulse 3.6s linear infinite}
        @keyframes cl-fxpulse{to{transform:translateX(560%)}}
        /* A lista de transição é declarada INTEIRA de propósito: o ".rv" da
           folha de tokens vem depois do ".card" e sequestrava a transição de
           todo card com reveal para 700ms — o hover ficava tão lento que parecia
           não existir. Aqui: entrada suave (opacity .6s) e hover rápido (.34s). */
        #processo .cl-fx-node{position:relative;padding:22px 20px;transition:opacity .6s var(--ease),transform .34s var(--ease),box-shadow .3s var(--ease),border-color .3s var(--ease)}
        /* ⚠️ CAUSA RAIZ do "não tem efeito ao passar o mouse": na folha de
           tokens, ".cl .rv.in{transform:none}" (3 classes) vence
           ".cl .card:hover{transform:translateY(-3px)}" (3 classes, declarada
           ANTES) — ou seja, TODO card com reveal ficava travado sem levantar.
           Repor o levantar exige especificidade maior, daí o prefixo de id.
           O transition-delay inline (cascata de entrada) também valeria para o
           hover, atrasando o levantar — zera junto. */
        #processo .cl-fx-node:hover{transition-delay:0s!important;transform:translateY(-4px);border-color:#D6DDEA;box-shadow:var(--sh-2)}
        .cl-fx-ic{width:44px;height:44px;border-radius:13px;border:1px solid;display:inline-flex;align-items:center;justify-content:center;background:#fff;transition:background .3s var(--ease),color .3s var(--ease),box-shadow .3s var(--ease),transform .3s var(--ease)}
        .cl-fx-node:hover .cl-fx-ic{transform:translateY(-2px)}
        .cl-fx-n{display:block;margin-top:16px}
        .cl-fx-node b{display:block;font:600 17px var(--disp);letter-spacing:-.02em;color:var(--ink);margin-top:6px;transition:color .3s}
        .cl-fx-node p{font:400 14.5px/1.6 var(--text);color:var(--ink-3);margin-top:8px;text-wrap:pretty}
        @media(prefers-reduced-motion:reduce){
          .cl-fx-line i{animation:none;opacity:0}
          #processo .cl-fx-node{transition-delay:0s!important}
          #processo .cl-fx-node:hover{transform:none}
          #processo .cl-fx-node:hover .cl-fx-ic{transform:none}
        }
        @media(max-width:1000px){.cl-fx{grid-template-columns:repeat(2,minmax(0,1fr))}.cl-fx-line{display:none}}
        @media(max-width:600px){.cl-fx{grid-template-columns:minmax(0,1fr)}}
      `}} />
    </section>
  );
}

/* ── Portfólio — os 10 projetos REAIS (lib/projects.ts), tela real dentro de
   moldura de navegador (mesmo componente já usado em /sobre) em vez de foto de
   banco de negócio fictício. Card inteiro clicável quando há URL — mesmo
   ajuste de acessibilidade feito hoje no portfólio do site escuro. ─────────── */
function hostOf(url?: string) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/* Cor da borda de luz por CATEGORIA do projeto, dentro da paleta desta rota.
   Não dá pra usar `p.grad` (lib/projects.ts): aquele degradê é jade/cobre do
   site escuro e traria cor banida para cá. Mapa determinístico, sem sorteio —
   o mesmo projeto acende sempre com a mesma cor. */
const BEAM_POR_CAT: Record<string, string> = {
  "E-commerce": "#3B2FCC",
  Websites: "#1550E8",
  Sistemas: "#0A6C9E",
  Aplicativos: "#5B3CFF",
  "Automações": "#0A6C9E",
  IA: "#0A6C9E",
};
const beamProjeto = (cat: string[]) => BEAM_POR_CAT[cat[0]] || "#1550E8";

export function ClaroPortfolio() {
  return (
    <section id="portfolio" className="sec">
      <div className="wrap">
        <ClaroHead center eyebrow="Portfólio" sub="Negócios reais, do pequeno ao grande — o mesmo padrão de cuidado.">
          Projetos que estão <span className="grad">no ar e vendendo</span>
        </ClaroHead>
        <div className="cl-pf">
          {PROJECTS.map((p) => {
            const inner = (
              <>
                <BrowserFrame src={`/portfolio/${p.id}.webp`} alt={`${p.name} — tela real do produto`} title={hostOf(p.url) || p.name} maxWidth={640} />
                <div className="cl-pf-b">
                  <div className="cl-pf-tags">
                    <span>{p.own ? "Produto próprio" : "Cliente"}</span>
                    {p.tags.slice(0, 1).map((t) => <span key={t}>{t}</span>)}
                  </div>
                  <div className="cl-pf-h">
                    <b className="glow-t">{p.name}</b>
                    {p.url && <span className="cl-pf-go" aria-hidden><ArrowUpRight size={15} /></span>}
                  </div>
                  <em>{p.desc}</em>
                </div>
              </>
            );
            /* Só o card COM link recebe a borda de luz e o levantar no hover:
               prometer interação onde não há clique é o tipo de detalhe que faz
               o visitante clicar e não acontecer nada. */
            return p.url ? (
              <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
                aria-label={`${p.name} — abrir ${hostOf(p.url)} em nova aba`}
                className="cl-pf-c lit rv" style={{ ["--beam" as string]: beamProjeto(p.cat) }}>{inner}</a>
            ) : (
              <article key={p.id} className="cl-pf-c cl-pf-c--fixo rv">{inner}</article>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        #portfolio .cl-pf{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-top:44px}
        /* mesma correção de transição explicada na seção do processo */
        #portfolio .cl-pf-c{display:block;border-radius:18px;overflow:hidden;background:#fff;border:1px solid var(--line);box-shadow:var(--sh-1);transition:opacity .6s var(--ease),transform .34s var(--ease),box-shadow .34s var(--ease),border-color .3s var(--ease);text-decoration:none;color:inherit}
        #portfolio a.cl-pf-c:hover{transform:translateY(-5px);box-shadow:var(--sh-3);border-color:#D6DDEA}
        #portfolio a.cl-pf-c:focus-visible{outline:2px solid var(--brand);outline-offset:3px;transform:translateY(-5px);box-shadow:var(--sh-3)}
        #portfolio .cl-pf-c--fixo{cursor:default}
        #portfolio .dv-screen__img{transition:transform .8s var(--ease)}
        #portfolio a.cl-pf-c:hover .dv-screen__img,#portfolio a.cl-pf-c:focus-visible .dv-screen__img{transform:scale(1.045)}
        .cl-pf-b{padding:20px}
        .cl-pf-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:11px}
        .cl-pf-tags span{font:600 10.5px var(--text);letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2);background:var(--paper-2);border:1px solid var(--line);border-radius:99px;padding:4px 9px;transition:border-color .3s,color .3s}
        a.cl-pf-c:hover .cl-pf-tags span{border-color:#D6DDEA;color:var(--ink)}
        .cl-pf-h{display:flex;align-items:center;gap:10px}
        .cl-pf-b b{display:block;font:600 17.5px var(--disp);letter-spacing:-.02em;color:var(--ink);transition:color .3s}
        .cl-pf-go{flex-shrink:0;margin-left:auto;width:30px;height:30px;border-radius:99px;display:inline-flex;align-items:center;justify-content:center;color:var(--ink-3);background:var(--paper-2);border:1px solid var(--line);transition:transform .3s var(--ease),background .3s var(--ease),color .3s var(--ease),border-color .3s}
        a.cl-pf-c:hover .cl-pf-go,a.cl-pf-c:focus-visible .cl-pf-go{background:var(--beam,var(--brand));border-color:var(--beam,var(--brand));color:#fff;transform:translate(2px,-2px)}
        .cl-pf-b em{display:block;font:400 14px/1.55 var(--text);font-style:normal;color:var(--ink-3);margin-top:5px;text-wrap:pretty}
        @media(prefers-reduced-motion:reduce){
          #portfolio a.cl-pf-c:hover .dv-screen__img,#portfolio a.cl-pf-c:focus-visible .dv-screen__img{transform:none}
          #portfolio a.cl-pf-c:hover,#portfolio a.cl-pf-c:focus-visible{transform:none}
          #portfolio a.cl-pf-c:hover .cl-pf-go,#portfolio a.cl-pf-c:focus-visible .cl-pf-go{transform:none}
        }
        @media(max-width:1000px){#portfolio .cl-pf{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:600px){#portfolio .cl-pf{grid-template-columns:minmax(0,1fr)}}
      `}} />
    </section>
  );
}

/* ── Clientes: marquee com os 10 nomes REAIS + estatísticas ──────────────────
   PLACEHOLDER (declarado ao dono, não substituído por dado real ainda):
   os 4 números abaixo são os MESMOS do mockup original — não foram trocados
   por outro número inventado, só portados com o aviso explícito de que
   precisam de dado real antes de esta rota virar produção. */
const STATS_PLACEHOLDER = [
  { v: 20, suf: "+", l: "anos de estrada" },
  { v: 480, suf: "+", l: "projetos entregues" },
  { v: 7.4, suf: "x", l: "ROAS médio" },
  { v: 98, suf: "%", l: "clientes que renovam" },
] as const;

/* Contagem animada ao entrar na tela — mesma mecânica do mockup original
   (useCount): sobe em easing cúbico até o valor PLACEHOLDER real quando o
   card cruza 50% da viewport, e respeita prefers-reduced-motion escrevendo o
   valor final direto. Sem mismatch de hidratação: o HTML inicial (servidor e
   1ª pintura do cliente) sempre mostra "0" + sufixo — a troca acontece só
   depois, via ref + IntersectionObserver, escrevendo textContent direto (não
   é state React, não força re-render), exatamente como no original. */
function useClaroCount(target: number, suf: string) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const dec = String(target).includes(".") ? 1 : 0;
    const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    let done = false;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || done) return;
      done = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = fmt(target);
        return;
      }
      const t0 = performance.now();
      const tick = (n: number) => {
        const p = Math.min(1, (n - t0) / 1500);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, suf]);
  return ref;
}

/* Cor por cartão seguindo o mesmo degradê da marca nesta rota (azul → violeta
   → rosa, igual ao `.grad`): dá ritmo à faixa e faz a borda de luz de cada
   cartão acender com a própria cor. Só visual — número e rótulo intocados. */
const STAT_BEAM = ["#1550E8", "#3B2FCC", "#5B3CFF", "#E0165F"];

function ClaroStat({ v, suf, l, hex }: { v: number; suf: string; l: string; hex: string }) {
  const ref = useClaroCount(v, suf);
  return (
    <div className="card lit cl-st" style={{ ["--beam" as string]: hex }}>
      <div ref={ref} className="cl-st-v" style={{ color: hex }}>0{suf}</div>
      <div className="small glow-t">{l}</div>
    </div>
  );
}

export function ClaroClientes() {
  const nomes = PROJECTS.map((p) => p.name);
  const loop = [...nomes, ...nomes];
  return (
    <section id="clientes" className="sec alt">
      <div className="wrap">
        <ClaroHead center eyebrow="Projetos" sub="Produtos próprios e projetos de cliente — o mesmo padrão de cuidado em todos.">
          Marcas que <span className="grad">operam com a gente</span>
        </ClaroHead>
      </div>
      <div className="rv" style={{ marginTop: 40 }}>
        <div className="mq" tabIndex={0} role="group" aria-label="Projetos — pause com o mouse ou Tab">
          <div className="mq-t">{loop.map((x, i) => <span className="mq-i" key={i}>{x}</span>)}</div>
          <div className="mq-t" aria-hidden>{loop.map((x, i) => <span className="mq-i" key={"b" + i}>{x}</span>)}</div>
        </div>
      </div>
      <div className="wrap">
        {/* ⚠️ PLACEHOLDER — ver comentário de STATS_PLACEHOLDER acima. Não promover
            esta rota sem substituir por número real ou remover a faixa. */}
        <div className="g g-220 rv" style={{ marginTop: 44 }}>
          {STATS_PLACEHOLDER.map((s, i) => (
            <ClaroStat key={s.l} v={s.v} suf={s.suf} l={s.l} hex={STAT_BEAM[i % STAT_BEAM.length]} />
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        #clientes .mq{padding:6px 0;border-radius:14px}
        #clientes .mq:focus-visible{outline:2px solid var(--brand);outline-offset:4px}
        .cl-st{padding:28px 22px;text-align:center}
        .cl-st-v{font:700 clamp(34px,4vw,42px)/1 var(--disp);letter-spacing:-.04em;font-variant-numeric:tabular-nums}
        .cl-st .small{margin-top:10px;transition:color .3s var(--ease)}
      `}} />
    </section>
  );
}

/* ── Sobre ─────────────────────────────────────────────────────────────────
   Foto real (CC0) em vez de foto de banco apresentada como "nossa equipe" —
   a mesma regra já aplicada no resto do site: contexto, não retrato falso. */
export function ClaroSobre() {
  return (
    // "alt" pra alternar com Depoimentos (plain) logo antes na ordem final da
    // página — ver mapa de seções em ClaroSite.tsx.
    <section id="sobre" className="sec alt">
      <div className="wrap">
        <div className="split">
          <figure className="rv cl-sb-fig">
            {/* Foto do Pexels (PX 8475203) igual ao arquivo original — mesma
                licença livre pra uso comercial, "figure" já trava aspect-ratio
                5/4 então não precisa de width/height fixo aqui. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.pexels.com/photos/8475203/pexels-photo-8475203.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="Equipe organizando a operação de um cliente" loading="lazy" decoding="async" />
          </figure>
          <div>
            <ClaroHead eyebrow="Nossa agência" sub="Não entregamos apresentação bonita que morre na gaveta. Implantamos, operamos e respondemos pelo número.">
              Um time que <span className="grad">opera</span>, não só planeja
            </ClaroHead>
            {/* Três ícones IGUAIS (MessageCircle) para três promessas diferentes
                era ruído visual: ícone que não distingue nada é só enfeite.
                Cada linha ganhou o seu, e a cor acompanha o degradê da marca. */}
            <div className="cl-sb-l rv">
              {([
                [UserRound, "Gestor humano dedicado", "Sem fila de suporte, sem chatbot para falar com a gente.", "#1550E8"],
                [LineChart, "Relatório sem maquiagem", "Você vê o que deu certo e o que não deu — com o número do lado.", "#3B2FCC"],
                [ShieldCheck, "Responsabilidade de dono", "Tratamos a sua operação como se o faturamento fosse nosso.", "#E0165F"],
              ] as [typeof UserRound, string, string, string][]).map(([Ic, t, d, hex]) => (
                <div className="card lit cl-sb-c" key={t} style={{ ["--beam" as string]: hex }}>
                  <span className="glow cl-sb-ic" style={{ color: hex, background: hex + "12" }}>
                    <Ic size={19} />
                  </span>
                  <div>
                    <b className="glow-t">{t}</b>
                    <span className="small">{d}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .cl-sb-fig{margin:0;border-radius:22px;overflow:hidden;box-shadow:var(--sh-3);aspect-ratio:5/4;background:var(--paper-2)}
        .cl-sb-fig img{width:100%;height:100%;object-fit:cover;transition:transform .9s var(--ease)}
        .cl-sb-fig:hover img{transform:scale(1.04)}
        .cl-sb-l{margin-top:26px;display:flex;flex-direction:column;gap:12px}
        .cl-sb-c{display:flex;gap:14px;padding:18px;align-items:flex-start}
        .cl-sb-ic{flex-shrink:0;width:42px;height:42px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center}
        .cl-sb-c b{display:block;font:600 15.5px var(--text);color:var(--ink);transition:color .3s}
        .cl-sb-c .small{display:block;margin-top:4px}
        @media(prefers-reduced-motion:reduce){.cl-sb-fig:hover img{transform:none}}
      `}} />
    </section>
  );
}

/* ── Blog — os 4 posts REAIS (lib/blog-posts.ts). Sem foto por post: o
   /blog de verdade também não tem (nenhum campo `image` no tipo BlogPost) —
   inventar uma capa aqui criaria um recurso que não existe em lugar nenhum
   do site de verdade. Tempo de leitura: mesma fórmula já usada em
   app/blog/page.tsx (palavras / 200), calculada do corpo REAL do post. ────── */
function readingTime(body: { h: string; p: string }[], intro: string) {
  const text = [intro, ...body.flatMap((b) => [b.h, b.p])].join(" ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/* Data formatada À MÃO, sem toLocaleDateString: a tabela de locale do Node
   (servidor) e a do navegador podem divergir, e texto diferente entre servidor
   e cliente é exatamente a falha de hidratação que já custou bug aqui. */
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function dataCurta(iso: string) {
  const [a, m, d] = iso.split("-");
  const mi = Number(m) - 1;
  if (!a || !d || mi < 0 || mi > 11) return "";
  return `${d} ${MESES[mi]} ${a}`;
}

/* Mesma lógica do portfólio: cor por categoria, dentro da paleta desta rota.
   `p.accent` (lib/blog-posts.ts) é jade — cor do site escuro, banida aqui. */
const BEAM_POR_CATEGORIA: Record<string, string> = {
  Sites: "#1550E8",
  "E-commerce": "#3B2FCC",
  "Inteligência Artificial": "#0A6C9E",
  "SEO & IA": "#E0165F",
};

export function ClaroBlog() {
  return (
    // "plain" (sem alt) pra alternar com Sobre (alt) logo antes.
    <section id="blog" className="sec">
      <div className="wrap">
        <ClaroHead center eyebrow="Blog" sub="Estratégia e operação explicadas sem enrolação.">Conteúdo que <span className="grad">acelera você</span></ClaroHead>
        <div className="g g-280 cl-bl">
          {blogPosts.map((p) => (
            <Link href={`/blog/${p.slug}`} className="card lit rv cl-bl-c" key={p.slug}
              style={{ ["--beam" as string]: BEAM_POR_CATEGORIA[p.category] || "#1550E8" }}>
              <div className="cl-bl-meta">
                <span className="chip cl-bl-cat">{p.category}</span>
                <span className="small">{readingTime(p.body, p.intro)} min de leitura</span>
              </div>
              <b className="glow-t cl-bl-t">{p.title}</b>
              <p className="body cl-bl-d">{p.description}</p>
              <span className="cl-bl-f">
                <time className="small" dateTime={p.date}>{dataCurta(p.date)}</time>
                <span className="cl-bl-go">Ler artigo <ArrowRight className="cl-arw" size={15} /></span>
              </span>
            </Link>
          ))}
        </div>
        <div className="rv cl-bl-all">
          <Link href="/blog" className="btn btn-s">Ver todos os artigos <ArrowRight className="cl-arw" size={16} /></Link>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        #blog .cl-bl{margin-top:42px;align-items:stretch}
        /* transição completa + hover reposto: ver comentário da causa raiz na
           seção do processo (o .rv.in dos tokens travava o transform). */
        #blog .cl-bl-c{padding:24px;display:flex;flex-direction:column;text-decoration:none;transition:opacity .6s var(--ease),transform .34s var(--ease),box-shadow .3s var(--ease),border-color .3s var(--ease)}
        #blog .cl-bl-c:hover{transform:translateY(-4px);box-shadow:var(--sh-2);border-color:#D6DDEA}
        #blog .cl-bl-c:focus-visible{outline:2px solid var(--beam,var(--brand));outline-offset:3px;transform:translateY(-4px);box-shadow:var(--sh-2)}
        #blog .cl-bl-meta{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
        #blog .cl-bl-cat{padding:4px 10px;font-size:12px;transition:border-color .3s,color .3s,background .3s}
        #blog .cl-bl-c:hover .cl-bl-cat{border-color:var(--beam,var(--brand));color:var(--beam,var(--brand))}
        #blog .cl-bl-t{display:block;font:600 18.5px/1.32 var(--disp);letter-spacing:-.02em;color:var(--ink);margin-top:15px;transition:color .3s;text-wrap:pretty}
        #blog .cl-bl-d{font-size:15px;margin-top:10px;flex:1}
        #blog .cl-bl-f{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px;padding-top:15px;border-top:1px solid var(--line-2)}
        #blog .cl-bl-go{display:inline-flex;align-items:center;gap:7px;font:600 14px var(--text);color:var(--beam,var(--brand))}
        #blog .cl-arw{transition:transform .28s var(--ease)}
        #blog .cl-bl-c:hover .cl-arw,#blog .cl-bl-c:focus-visible .cl-arw{transform:translateX(4px)}
        #blog .cl-bl-all{margin-top:32px;display:flex;justify-content:center}
        #blog .cl-bl-all .btn:hover .cl-arw{transform:translateX(3px)}
        #blog .cl-bl-all .btn:focus-visible{outline:2px solid var(--brand);outline-offset:3px}
        @media(prefers-reduced-motion:reduce){
          #blog .cl-arw{transition:none;transform:none!important}
          #blog .cl-bl-c:hover,#blog .cl-bl-c:focus-visible{transform:none}
        }
      `}} />
    </section>
  );
}

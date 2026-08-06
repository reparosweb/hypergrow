"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Handshake, LifeBuoy, Wrench } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   CAPTURA — faixa full-bleed em vídeo, entre "Resultados" e "Diagnóstico".

   CONCEITO (documentado em plans/secao-captura-copy.md): toda agência vende a
   DECOLAGEM. O ângulo aqui é a VOLTA — no vídeo, o propulsor não pousa sozinho:
   a mesma torre que o lançou abre os braços e o pega no ar. É a imagem do que o
   dono pediu: "pegamos na sua mão e entregamos resultado".

   ⚠️ LEGENDA DA SPACEX É OBRIGATÓRIA (`.cp-fonte`, no fim da seção). A filmagem
   é do 5º voo de teste do Starship, da SpaceX. Sem a legenda, usar essa imagem
   numa página comercial deixa de ser analogia e passa a sugerir parceria ou
   feito próprio. Não remova.

   VÍDEO: `/media/captura.mp4` — arquivo NOVO (nome novo por causa do cache
   `immutable` de 1 ano em /media), 14 s, 2 MB, sem áudio, `+faststart`,
   1920×1080 nativo. Recortado do master exatamente no trecho da captura
   (o público comemorando, que vem logo depois, ficou de fora de propósito:
   a seção precisa terminar no braço segurando o foguete, não na plateia).
   Deliberadamente DIFERENTE do vídeo do hero — foi por repetir o mesmo vídeo
   que o banner antigo saiu da composição.

   SEM `backdrop-filter` em nada aqui: sobre vídeo em reprodução ele repinta a
   cada quadro e já custou travamento de rolagem no mobile deste projeto.

   COPY: nenhum número, nenhuma garantia, nenhuma estatística — a força vem da
   especificidade da cena. O bloco "Quem planeja, opera" é ancorado numa
   afirmação que JÁ está publicada e aprovada na seção Sobre ("Um time que
   opera, não só planeja"); não é promessa nova.
   ──────────────────────────────────────────────────────────────────────────── */

const BLOCOS = [
  {
    Ic: Handshake,
    t: "Quem planeja, opera",
    d: "A mesma equipe que desenhou a estratégia senta com o seu time na implantação. Não existe passagem de bastão depois que você assina.",
  },
  {
    Ic: Wrench,
    t: "Mão na operação",
    d: "Trabalhamos dentro das suas ferramentas — loja, conta de anúncio, ERP e WhatsApp — em vez de mandar recomendação por e-mail para o seu time executar.",
  },
  {
    Ic: LifeBuoy,
    t: "Quando trava, é com a gente",
    d: "No dia em que a campanha para de entregar, o pedido não cai no ERP ou o site sai do ar, você tem uma pessoa para chamar — com nome, não um número de protocolo.",
  },
  {
    Ic: GraduationCap,
    t: "Seu time sai sabendo",
    d: "Na entrega, treinamos quem vai usar aquilo todo dia. A sua empresa não pode ficar refém da gente para mexer no básico.",
  },
];

export default function ClaroCaptura() {
  const vid = useRef<HTMLVideoElement>(null);
  const [reduzido, setReduzido] = useState(false);

  /* Estado neutro no servidor (false) e só depois da hidratação — mesma
     disciplina do useClaroWhatsApp(), para não divergir servidor/cliente. */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduzido(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Toca SÓ quando a seção está visível. Dois motivos: (1) esta faixa fica no
     meio da página — um vídeo em laço rodando fora da tela gasta CPU e bateria
     à toa, e o navegador ainda por cima costuma estrangular a reprodução fora
     da viewport, o que deixava o vídeo parado quando o visitante finalmente
     chegava aqui; (2) `prefers-reduced-motion` precisa PAUSAR de verdade —
     `autoPlay` é atributo, então deixar de chamar play() não basta. */
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (reduzido) { v.pause(); return; }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduzido]);

  return (
    <section id="captura" className="cp">
      <video
        ref={vid}
        className="cp-v"
        poster="/media/captura-poster.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/media/captura.mp4" type="video/mp4" />
      </video>
      <div className="cp-grade" aria-hidden />

      <div className="wrap cp-in">
        <div className="cp-copy">
          <div className="eyebrow cp-eyebrow"><i />Depois do lançamento</div>
          <h2 className="cp-h2">
            Pegamos na sua mão —<br /><span className="cp-accent">e não soltamos no meio</span>
          </h2>
          <p className="cp-lead">
            Site no ar, campanha rodando e integração feita é o ponto em que a maioria dos
            fornecedores se despede. É onde a gente começa a trabalhar de verdade: a mesma equipe
            que planejou fica operando, medindo e corrigindo junto com você.
          </p>
        </div>

        <ul className="cp-g">
          {BLOCOS.map(({ Ic, t, d }, i) => (
            <li className="cp-c" key={t} style={{ ["--i" as string]: i }}>
              <span className="cp-ic" aria-hidden><Ic size={19} /></span>
              <div>
                <b>{t}</b>
                <span>{d}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="cp-foot">
          <Link href="#contato" className="btn btn-p cp-cta">
            Falar com especialista <ArrowRight size={17} aria-hidden />
          </Link>
          {/* ⚠️ Legenda obrigatória — ver comentário no topo do arquivo. */}
          <p className="cp-fonte">
            Imagens de arquivo do teste de voo do Starship, da SpaceX. Usamos como analogia — não
            temos nenhuma relação com a empresa.
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </section>
  );
}

const CSS = `
  .cp { position: relative; overflow: hidden; background: #050B18; padding: 96px 0; }
  .cp-v { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 42%; }
  /* duas camadas: escurece de cima pra baixo E pela esquerda, onde mora o texto */
  .cp-grade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,11,24,.9) 0%, rgba(5,11,24,.62) 34%, rgba(5,11,24,.72) 68%, rgba(5,11,24,.94) 100%), linear-gradient(100deg, rgba(5,11,24,.88) 0%, rgba(5,11,24,.35) 58%, transparent 78%); }
  .cp-in { position: relative; z-index: 3; }
  .cp-copy { max-width: 660px; }
  .cp-eyebrow { color: rgba(255,255,255,.78); }
  .cp-eyebrow i { background: #FF5C93; box-shadow: 0 0 0 4px rgba(255,92,147,.18); }
  .cp-h2 { margin: 16px 0 0; font: 700 clamp(30px,4.2vw,50px)/1.08 var(--font-display); letter-spacing: -.035em; color: #fff; text-wrap: balance; text-shadow: 0 6px 40px rgba(0,0,0,.55); }
  /* tons CLAROS: o azul saturado da marca some sobre vídeo escuro */
  .cp-accent { background: linear-gradient(96deg, #7DA8FF, #B9A8FF 45%, #FF7AAA); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  .cp-lead { font: 400 clamp(16px,1.45vw,19px)/1.62 var(--font-sans); color: rgba(255,255,255,.86); margin: 20px 0 0; max-width: 60ch; text-wrap: pretty; text-shadow: 0 2px 18px rgba(0,0,0,.5); }

  .cp-g { list-style: none; margin: 44px 0 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 940px; }
  /* fundo translúcido SÓLIDO (sem backdrop-filter) — ver nota no topo */
  .cp-c { display: flex; gap: 14px; padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.07); transition: transform .3s var(--ease), background .3s var(--ease), border-color .3s var(--ease); }
  .cp-c:hover { transform: translateY(-3px); background: rgba(255,255,255,.11); border-color: rgba(255,255,255,.3); }
  .cp-ic { flex-shrink: 0; width: 42px; height: 42px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: #fff; background: linear-gradient(140deg, rgba(125,168,255,.34), rgba(255,122,170,.28)); border: 1px solid rgba(255,255,255,.22); transition: transform .3s var(--ease); }
  .cp-c:hover .cp-ic { transform: scale(1.06) rotate(-3deg); }
  .cp-c b { display: block; font: 600 16px var(--font-sans); color: #fff; }
  .cp-c span { display: block; font: 400 14px/1.55 var(--font-sans); color: rgba(255,255,255,.76); margin-top: 5px; text-wrap: pretty; }

  .cp-foot { margin-top: 36px; display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
  .cp-cta { padding: 15px 26px; }
  .cp-cta:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
  .cp-fonte { font: 400 12.5px/1.5 var(--font-sans); color: rgba(255,255,255,.5); max-width: 46ch; margin: 0; }

  @media (max-width: 900px) { .cp-g { grid-template-columns: 1fr; } }
  @media (max-width: 760px) {
    .cp { padding: 68px 0; }
    .cp-grade { background: linear-gradient(180deg, rgba(5,11,24,.72) 0%, rgba(5,11,24,.66) 45%, rgba(5,11,24,.95) 100%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .cp-c, .cp-ic { transition: none; }
    .cp-c:hover { transform: none; }
    .cp-c:hover .cp-ic { transform: none; }
  }
`;

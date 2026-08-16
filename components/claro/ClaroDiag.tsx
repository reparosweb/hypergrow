"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Lightbulb, Share2, Target, Clock, User, Sparkles, HelpCircle, Calculator,
  BarChart3, Shuffle, FileWarning, CheckCheck, Lock, Eye, HeartHandshake,
  ArrowRight, CornerUpLeft, RotateCcw, type LucideIcon,
} from "lucide-react";
import { ClaroHead } from "./ClaroUI";
import { EVENTOS, rastrear } from "@/lib/track";

/* ─────────────────────────────────────────────────────────────────────────────
   DIAGNÓSTICO INTERATIVO — 4 perguntas, resultado na hora. Porta quase 1:1 do
   mockup: é conteúdo DINÂMICO gerado pela resposta do visitante, não uma
   alegação sobre a empresa — não se aplica a regra de "placeholder pendente de
   dado real" aqui. Roda 100% no navegador, nada é enviado. ───────────────── */

type Q = { q: string; s: string; a: [string, number, LucideIcon][] };

const QUESTOES: Q[] = [
  { q: "Hoje, de onde vem a maior parte dos seus clientes?", s: "Responda pelo que acontece, não pelo que devia acontecer.",
    a: [["Indicação e sorte", 0, Lightbulb], ["Redes sociais, sem previsão", 1, Share2], ["Canais pagos que eu meço", 2, Target]] },
  { q: "Quando um cliente manda mensagem às 22h, o que acontece?", s: "É aqui que a maioria perde dinheiro sem perceber.",
    a: [["Respondo quando dá", 0, Clock], ["Alguém responde no horário comercial", 1, User], ["Automação atende e qualifica na hora", 2, Sparkles]] },
  { q: "Você sabe quanto custa conquistar um cliente?", s: "Valor aproximado já conta. \"Não sei\" também é resposta.",
    a: [["Não tenho ideia", 0, HelpCircle], ["Tenho uma noção", 1, Calculator], ["Sei o CAC e o retorno por canal", 2, BarChart3]] },
  { q: "Sua operação de vendas tem processo escrito?", s: "Script, cadência de follow-up e CRM alimentado todo dia.",
    a: [["Cada um faz do seu jeito", 0, Shuffle], ["Existe, mas ninguém segue", 1, FileWarning], ["Sim, com metas e rotina", 2, CheckCheck]] },
];

const RESULTADOS = [
  { max: 2, stage: "Estágio 1 · Improviso", hex: "#B0155F", verdict: "Sua empresa cresce por esforço, não por sistema.",
    body: "Você já provou que o produto funciona. O que falta é parar de depender de sorte — antes de colocar mais dinheiro em anúncio, fechamos o balde furado.",
    next: ["Diagnóstico de maturidade", "Site ou loja que converte", "Automação de WhatsApp"] },
  { max: 5, stage: "Estágio 2 · Tração", hex: "#A8560B", verdict: "Você tem demanda. Ainda não tem previsibilidade.",
    body: "Entra pedido, sai venda, mas ninguém consegue prometer o mês que vem. O gargalo quase sempre está na passagem do marketing para o comercial.",
    next: ["Estruturação comercial", "Tráfego pago com meta de CAC", "CRM implantado de verdade"] },
  { max: 8, stage: "Estágio 3 · Escala", hex: "#1550E8", verdict: "A base está de pé. Agora é multiplicar.",
    body: "Você mede, tem processo e time. Daqui para frente o ganho vem de eficiência: baixar o custo de aquisição e abrir canais novos sem quebrar o que já funciona.",
    next: ["SEO avançado e GEO/AEO", "Agentes de IA no atendimento", "Indicadores e BI"] },
];

export default function ClaroDiag() {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<number[]>([]);
  /* Captura opcional do resultado (2026-08-08). O quiz era 100% client-side e
     não deixava rastro: o visitante MAIS engajado do site — que respondeu 4
     perguntas sobre a própria operação — saía sem virar lead e sem a agência
     sequer saber que ele existiu. Agora o resultado continua saindo de graça,
     e quem quiser o plano detalhado deixa o e-mail. */
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erroCap, setErroCap] = useState("");
  /* Foco: cada clique DESMONTA o botão clicado (a pergunta some), e o foco do
     teclado cai no <body> — o próximo Tab volta para o topo do site. Aqui o
     foco vai para o painel da etapa nova, que contém o título e as opções.
     `mexeu` impede que isso rode na primeira pintura (senão a página abriria
     rolada até o quiz) e `preventScroll` evita solavanco em quem usa mouse. */
  const painel = useRef<HTMLDivElement>(null);
  const mexeu = useRef(false);
  useEffect(() => {
    if (!mexeu.current) return;
    painel.current?.focus({ preventScroll: true });
  }, [step]);
  const done = step >= QUESTOES.length;
  const score = ans.reduce((a, b) => a + b, 0);
  const res = RESULTADOS.find((r) => score <= r.max) || RESULTADOS[2];
  const pct = done ? 100 : Math.round((step / QUESTOES.length) * 100);
  const cur = QUESTOES[Math.min(step, QUESTOES.length - 1)];

  /* Mede o quiz TERMINADO, com ou sem e-mail deixado — evento separado de
     "diagnostico_lead" (que só mede quem capturou). Sem isto o site nunca
     saberia quantas pessoas chegam ao resultado e desistem de deixar
     contato — número que falta para calcular a taxa de conversão do campo
     opcional de e-mail (item que motivou esta seção inteira). */
  useEffect(() => {
    if (!done) return;
    rastrear(EVENTOS.diagnosticoFim, { estagio: res.stage, pontuacao: score });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  async function enviarDiag(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const limpo = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpo)) {
      setErroCap("Confira o e-mail: falta algo nele.");
      return;
    }
    setErroCap("");
    setEnviando(true);
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // O nome é obrigatório na API e aqui não perguntamos (pedir nome
          // dobraria o atrito para um campo que o comercial descobre na
          // primeira resposta). Marcamos a origem no lugar do nome para o
          // painel mostrar de onde veio sem parecer cadastro real.
          name: "Diagnóstico do site",
          email: limpo,
          product: res.stage,
          message: `Resultado do diagnóstico: ${res.stage} (pontuação ${score} de 8). Respostas: ${ans.join(", ")}.`,
          source: "diagnostico",
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setEnviado(true);
        rastrear("diagnostico_lead", { estagio: res.stage, pontuacao: score });
      } else {
        setErroCap(j.error || "Não foi possível enviar agora. Tente pelo formulário abaixo.");
      }
    } catch {
      setErroCap("Sem conexão. Tente pelo formulário abaixo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section id="diagnostico" className="sec">
      <div className="wrap">
        <div className="split">
          <div>
            <ClaroHead eyebrow="4 perguntas · 40 segundos" sub="Sem formulário, sem e-mail, sem vendedor no seu pé. Responda com honestidade e veja o retrato da sua operação.">
              Descubra em que momento<br /><span className="grad">sua empresa está</span>
            </ClaroHead>
            <ul className="cl-dg-notes rv">
              {([[Lock, "Nada é enviado. Roda no seu navegador."], [Eye, "Resultado na tela, na hora."], [HeartHandshake, "Se não for para você, a gente diz."]] as [LucideIcon, string][]).map(([Ic, t]) => (
                <li key={t}><span className="cl-dg-note-ic" aria-hidden><Ic size={15} /></span>{t}</li>
              ))}
            </ul>
          </div>

          <div className="card cl-dg rv">
            <div className="cl-dg-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do diagnóstico">
              <span style={{ width: pct + "%", background: done ? res.hex : "var(--brand)" }} />
            </div>
            {/* painel ESTÁVEL (não é remontado a cada passo) para poder receber
                o foco — ver comentário no topo do componente. */}
            <div className="cl-dg-stage" ref={painel} tabIndex={-1}>
              {!done ? (
                <div key={step} className="cl-dg-in">
                  <div className="mono cl-dg-step">Pergunta {step + 1} de {QUESTOES.length}</div>
                  <h3 className="h3 cl-dg-q">{cur.q}</h3>
                  <p className="body cl-dg-s">{cur.s}</p>
                  <div className="cl-dg-opts">
                    {cur.a.map(([label, v, Ic]) => {
                      // ao voltar, a resposta que já tinha sido dada aparece
                      // marcada — antes o visitante voltava e não fazia ideia
                      // do que havia escolhido.
                      const escolhido = ans.length > step && ans[step] === v;
                      return (
                        <button key={label} type="button" aria-pressed={escolhido}
                          className={"cl-dg-opt" + (escolhido ? " on" : "")}
                          onClick={() => { mexeu.current = true; setAns((a) => [...a.slice(0, step), v]); setStep((s) => s + 1); }}>
                          <span className="cl-dg-opt-ic" aria-hidden><Ic size={17} /></span>
                          <span className="cl-dg-opt-t">{label}</span>
                          <ArrowRight className="cl-dg-opt-go" size={16} aria-hidden />
                        </button>
                      );
                    })}
                  </div>
                  {step > 0 && <button type="button" className="cl-dg-back" onClick={() => { mexeu.current = true; setStep((s) => s - 1); }}><CornerUpLeft size={14} aria-hidden /> voltar</button>}
                </div>
              ) : (
                <div className="cl-dg-in">
                  <div className="mono" style={{ color: res.hex }}>Seu retrato</div>
                  <div className="cl-dg-meter" aria-hidden>
                    {[0, 1, 2].map((i) => <span key={i} style={{ background: RESULTADOS.indexOf(res) >= i ? res.hex : "var(--line)", animationDelay: i * 0.11 + "s" }} />)}
                  </div>
                  <h3 className="h3 cl-dg-stg">{res.stage}</h3>
                  <p className="cl-dg-vd" style={{ color: res.hex }}>{res.verdict}</p>
                  <p className="body cl-dg-bd">{res.body}</p>
                  <div className="cl-dg-next">
                    <span className="mono cl-dg-step">Por onde começar</span>
                    {res.next.map((n, i) => (
                      <div className="cl-dg-next-row" key={n}>
                        <span className="cl-dg-n" style={{ color: res.hex, borderColor: res.hex + "44" }}>{i + 1}</span>{n}
                      </div>
                    ))}
                  </div>
                  {/* Captura OPCIONAL. O resultado inteiro já foi entregue
                      acima — quem não quiser deixar contato leva o diagnóstico
                      do mesmo jeito. Pedir dado ANTES de mostrar o resultado
                      converteria mais no papel e destruiria a confiança que a
                      seção inteira existe para construir. */}
                  {enviado ? (
                    <p className="cl-dg-ok" role="status">
                      <CheckCheck size={16} aria-hidden /> Recebido. Vamos te mandar o plano do {res.stage.toLowerCase()}.
                    </p>
                  ) : (
                    <form className="cl-dg-cap" onSubmit={enviarDiag}>
                      <label className="cl-dg-cap-l" htmlFor="cl-dg-email">
                        Quer receber o plano detalhado do seu estágio?
                      </label>
                      <div className="cl-dg-cap-row">
                        <input
                          id="cl-dg-email" type="email" inputMode="email" autoComplete="email"
                          placeholder="seu@email.com.br" value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-invalid={!!erroCap} aria-describedby={erroCap ? "cl-dg-email-e" : undefined}
                        />
                        <button type="submit" className="btn btn-p" disabled={enviando}>
                          {enviando ? "Enviando..." : "Receber"}
                        </button>
                      </div>
                      {erroCap && <span className="cl-dg-cap-e" id="cl-dg-email-e">{erroCap}</span>}
                      <span className="cl-dg-cap-note">Sem spam. Só o plano e nada mais.</span>
                    </form>
                  )}
                  <div className="cl-dg-cta">
                    <Link href="#contato" className="btn btn-d">Falar com um estrategista <ArrowRight className="cl-dg-arw" size={16} aria-hidden /></Link>
                    <button type="button" className="cl-dg-back cl-dg-back--fim" onClick={() => { mexeu.current = true; setAns([]); setStep(0); setEnviado(false); setErroCap(""); }}><RotateCcw size={14} aria-hidden /> refazer</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nada de `transition:all` aqui: `all` inclui propriedades de layout
          (padding, largura) e faz o navegador recalcular o quadro inteiro a
          cada hover. Só transform, cor e sombra — as três baratas. */}
      <style dangerouslySetInnerHTML={{ __html: `
        #diagnostico .cl-dg-notes{list-style:none;padding:0;margin:28px 0 0;display:flex;flex-direction:column;gap:13px}
        #diagnostico .cl-dg-notes li{display:flex;align-items:center;gap:12px;font:400 15.5px var(--text);color:var(--ink-2)}
        #diagnostico .cl-dg-note-ic{flex-shrink:0;width:32px;height:32px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;color:var(--brand);background:rgba(21,80,232,.09);border:1px solid rgba(21,80,232,.16)}
        #diagnostico .cl-dg{position:relative;overflow:hidden;padding:32px}
        #diagnostico .cl-dg:hover{transform:none;box-shadow:var(--sh-2)}
        #diagnostico .cl-dg-bar{position:absolute;top:0;left:0;right:0;height:3px;background:var(--line-2)}
        #diagnostico .cl-dg-bar span{display:block;height:100%;transition:width .5s var(--ease),background .4s}
        #diagnostico .cl-dg-in{animation:cl-dgin .4s var(--ease)}
        @keyframes cl-dgin{from{opacity:0;transform:translateY(8px)}}
        /* Captura opcional do resultado. Fica DEPOIS do plano completo de
           propósito: o visitante ja recebeu tudo antes de ver este campo. */
        #diagnostico .cl-dg-cap{margin-top:24px;padding-top:22px;border-top:1px solid var(--line-2)}
        #diagnostico .cl-dg-cap-l{display:block;font:600 14.5px var(--text);color:var(--ink)}
        #diagnostico .cl-dg-cap-row{display:flex;gap:9px;margin-top:10px;flex-wrap:wrap}
        #diagnostico .cl-dg-cap-row input{flex:1;min-width:190px;min-height:48px;padding:12px 14px;border:1px solid var(--line);border-radius:11px;background:#fff;font:400 15px var(--text);color:var(--ink);transition:border-color .2s var(--ease),box-shadow .2s var(--ease)}
        #diagnostico .cl-dg-cap-row input::placeholder{color:#9AA4B4}
        #diagnostico .cl-dg-cap-row input:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 3px rgba(21,80,232,.18)}
        #diagnostico .cl-dg-cap-row input[aria-invalid=true]{border-color:var(--cta);background:rgba(224,22,95,.035)}
        #diagnostico .cl-dg-cap-row .btn{flex-shrink:0}
        #diagnostico .cl-dg-cap-e{display:block;margin-top:7px;font:500 12.5px var(--text);color:#B0155F}
        #diagnostico .cl-dg-cap-note{display:block;margin-top:9px;font:400 12.5px var(--text);color:var(--ink-3)}
        #diagnostico .cl-dg-ok{display:flex;align-items:center;gap:9px;margin-top:24px;padding:14px 16px;border-radius:12px;background:rgba(15,157,88,.08);border:1px solid rgba(15,157,88,.24);font:500 14.5px var(--text);color:#0B7A4C}
        /* No celular o botao vai para a linha de baixo, largura total: campo de
           e-mail espremido ao lado de um botao e o erro classico de formulario
           em tela pequena. */
        @media(max-width:600px){
          #diagnostico .cl-dg-cap-row input{min-width:100%}
          #diagnostico .cl-dg-cap-row .btn{width:100%}
        }
        /* o painel recebe foco por programa (tabIndex -1): anel só quando o
           teclado está em uso, nunca no clique de mouse. */
        #diagnostico .cl-dg-stage:focus{outline:none}
        #diagnostico .cl-dg-stage:focus-visible{outline:2px solid var(--brand);outline-offset:6px;border-radius:14px}
        #diagnostico .cl-dg-step{color:var(--ink-3)}
        #diagnostico .cl-dg-q{margin-top:13px;text-wrap:pretty}
        #diagnostico .cl-dg-s{margin-top:9px}
        #diagnostico .cl-dg-opts{display:flex;flex-direction:column;gap:10px;margin-top:24px}
        #diagnostico .cl-dg-opt{display:flex;align-items:center;gap:13px;width:100%;min-height:56px;text-align:left;padding:15px 16px;border-radius:13px;border:1px solid var(--line);background:#fff;font:500 15.5px var(--text);color:var(--ink);transition:transform .24s var(--ease),border-color .24s var(--ease),background .24s var(--ease),box-shadow .24s var(--ease)}
        #diagnostico .cl-dg-opt-t{flex:1}
        #diagnostico .cl-dg-opt:hover{border-color:var(--brand);background:rgba(21,80,232,.05);transform:translateX(4px);box-shadow:var(--sh-2)}
        #diagnostico .cl-dg-opt:focus-visible{outline:2px solid var(--brand);outline-offset:2px;border-color:var(--brand);transform:translateX(4px)}
        #diagnostico .cl-dg-opt:active{transform:translateX(4px) scale(.99)}
        #diagnostico .cl-dg-opt.on{border-color:var(--brand);background:rgba(21,80,232,.07)}
        #diagnostico .cl-dg-opt-ic{flex-shrink:0;width:34px;height:34px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;color:var(--brand);background:rgba(21,80,232,.09);border:1px solid rgba(21,80,232,.2);transition:background .24s var(--ease),color .24s var(--ease),border-color .24s var(--ease)}
        #diagnostico .cl-dg-opt:hover .cl-dg-opt-ic,#diagnostico .cl-dg-opt:focus-visible .cl-dg-opt-ic,#diagnostico .cl-dg-opt.on .cl-dg-opt-ic{background:var(--brand);border-color:var(--brand);color:#fff}
        #diagnostico .cl-dg-opt-go{flex-shrink:0;color:var(--brand);opacity:.45;transition:transform .24s var(--ease),opacity .24s var(--ease)}
        #diagnostico .cl-dg-opt:hover .cl-dg-opt-go,#diagnostico .cl-dg-opt:focus-visible .cl-dg-opt-go{opacity:1;transform:translateX(3px)}
        #diagnostico .cl-dg-back{margin-top:18px;display:inline-flex;align-items:center;gap:7px;min-height:44px;background:none;border:none;border-radius:9px;font:500 14px var(--text);color:var(--ink-3);padding:6px 10px 6px 2px;cursor:pointer;transition:color .22s var(--ease),transform .22s var(--ease)}
        #diagnostico .cl-dg-back:hover{color:var(--ink);transform:translateX(-3px)}
        #diagnostico .cl-dg-back:focus-visible{outline:2px solid var(--brand);outline-offset:2px;color:var(--ink)}
        #diagnostico .cl-dg-back--fim{margin-top:0}
        #diagnostico .cl-dg-meter{display:flex;gap:7px;margin-top:18px}
        /* as 3 barras do medidor nascem preenchendo da esquerda, em cascata —
           antes tinham transition sem estado anterior, ou seja, não animavam
           nada: o resultado aparecia pronto. */
        #diagnostico .cl-dg-meter span{height:6px;flex:1;border-radius:99px;transform-origin:left;animation:cl-dgm .5s var(--ease) both}
        @keyframes cl-dgm{from{transform:scaleX(0);opacity:.35}}
        #diagnostico .cl-dg-stg{margin-top:18px}
        #diagnostico .cl-dg-vd{font:600 17px/1.5 var(--text);margin-top:11px;text-wrap:pretty}
        #diagnostico .cl-dg-bd{margin-top:11px}
        #diagnostico .cl-dg-next{margin-top:24px;padding-top:19px;border-top:1px solid var(--line-2)}
        #diagnostico .cl-dg-next-row{display:flex;align-items:center;gap:12px;padding:10px 0;font:500 15.5px var(--text);color:var(--ink)}
        #diagnostico .cl-dg-n{width:26px;height:26px;flex-shrink:0;border:1px solid;border-radius:99px;display:inline-flex;align-items:center;justify-content:center;font:600 11.5px var(--code)}
        #diagnostico .cl-dg-cta{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-top:24px}
        #diagnostico .cl-dg-arw{transition:transform .25s var(--ease)}
        #diagnostico .cl-dg-cta .btn:hover .cl-dg-arw{transform:translateX(3px)}
        #diagnostico .cl-dg-cta .btn:focus-visible{outline:2px solid var(--cta);outline-offset:3px}
        /* altura mínima só no desktop: sem isso o cartão encolhe e cresce a cada
           pergunta e a página inteira pula debaixo do cursor. */
        @media(min-width:901px){#diagnostico .cl-dg-stage{min-height:352px}}
        @media(prefers-reduced-motion:reduce){
          #diagnostico .cl-dg-in{animation:none}
          #diagnostico .cl-dg-opt,#diagnostico .cl-dg-opt-go,#diagnostico .cl-dg-back,#diagnostico .cl-dg-arw{transition:none}
          #diagnostico .cl-dg-opt:hover,#diagnostico .cl-dg-opt:focus-visible,#diagnostico .cl-dg-opt:active,#diagnostico .cl-dg-back:hover{transform:none}
          #diagnostico .cl-dg-opt:hover .cl-dg-opt-go,#diagnostico .cl-dg-opt:focus-visible .cl-dg-opt-go,#diagnostico .cl-dg-cta .btn:hover .cl-dg-arw{transform:none}
          #diagnostico .cl-dg-meter span{animation:none}
        }
      `}} />
    </section>
  );
}

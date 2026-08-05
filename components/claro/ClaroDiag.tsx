"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lightbulb, Share2, Target, Clock, User, Sparkles, HelpCircle, Calculator,
  BarChart3, Shuffle, FileWarning, CheckCheck, Lock, Eye, HeartHandshake,
  ArrowRight, CornerUpLeft, RotateCcw, type LucideIcon,
} from "lucide-react";
import { ClaroHead } from "./ClaroUI";

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
  { max: 5, stage: "Estágio 2 · Tração", hex: "#C4763C", verdict: "Você tem demanda. Ainda não tem previsibilidade.",
    body: "Entra pedido, sai venda, mas ninguém consegue prometer o mês que vem. O gargalo quase sempre está na passagem do marketing para o comercial.",
    next: ["Estruturação comercial", "Tráfego pago com meta de CAC", "CRM implantado de verdade"] },
  { max: 8, stage: "Estágio 3 · Escala", hex: "#0B7A4C", verdict: "A base está de pé. Agora é multiplicar.",
    body: "Você mede, tem processo e time. Daqui para frente o ganho vem de eficiência: baixar o custo de aquisição e abrir canais novos sem quebrar o que já funciona.",
    next: ["SEO avançado e GEO/AEO", "Agentes de IA no atendimento", "Indicadores e BI"] },
];

export default function ClaroDiag() {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<number[]>([]);
  const done = step >= QUESTOES.length;
  const score = ans.reduce((a, b) => a + b, 0);
  const res = RESULTADOS.find((r) => score <= r.max) || RESULTADOS[2];
  const pct = done ? 100 : Math.round((step / QUESTOES.length) * 100);
  const cur = QUESTOES[Math.min(step, QUESTOES.length - 1)];

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
                <li key={t}><Ic size={16} style={{ color: "var(--brand)" }} />{t}</li>
              ))}
            </ul>
          </div>

          <div className="card cl-dg rv">
            <div className="cl-dg-bar"><span style={{ width: pct + "%", background: done ? res.hex : "var(--brand)" }} /></div>
            {!done ? (
              <div key={step} className="cl-dg-in">
                <div className="mono" style={{ color: "var(--ink-3)" }}>Pergunta {step + 1} de {QUESTOES.length}</div>
                <h3 className="h3" style={{ marginTop: 12 }}>{cur.q}</h3>
                <p className="body" style={{ marginTop: 8 }}>{cur.s}</p>
                <div className="cl-dg-opts">
                  {cur.a.map(([label, v, Ic]) => (
                    <button key={label} className="cl-dg-opt" onClick={() => { setAns((a) => [...a.slice(0, step), v]); setStep((s) => s + 1); }}>
                      <span className="cl-dg-opt-ic"><Ic size={17} /></span>{label}
                      <ArrowRight size={16} style={{ marginLeft: "auto", color: "var(--brand)" }} />
                    </button>
                  ))}
                </div>
                {step > 0 && <button className="cl-dg-back" onClick={() => setStep((s) => s - 1)}><CornerUpLeft size={14} /> voltar</button>}
              </div>
            ) : (
              <div className="cl-dg-in">
                <div className="mono" style={{ color: res.hex }}>Seu retrato</div>
                <div className="cl-dg-meter">
                  {[0, 1, 2].map((i) => <span key={i} style={{ background: RESULTADOS.indexOf(res) >= i ? res.hex : "var(--line)" }} />)}
                </div>
                <h3 className="h3" style={{ marginTop: 16 }}>{res.stage}</h3>
                <p style={{ font: "600 17px/1.5 var(--text)", color: res.hex, marginTop: 10 }}>{res.verdict}</p>
                <p className="body" style={{ marginTop: 10 }}>{res.body}</p>
                <div className="cl-dg-next">
                  <span className="mono" style={{ color: "var(--ink-3)" }}>Por onde começar</span>
                  {res.next.map((n, i) => (
                    <div className="cl-dg-next-row" key={n}>
                      <span className="cl-dg-n" style={{ color: res.hex, borderColor: res.hex + "44" }}>{i + 1}</span>{n}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginTop: 22 }}>
                  <Link href="#contato" className="btn btn-p">Falar com um estrategista <ArrowRight size={16} /></Link>
                  <button className="cl-dg-back" style={{ marginTop: 0 }} onClick={() => { setAns([]); setStep(0); }}><RotateCcw size={14} /> refazer</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .cl-dg-notes{list-style:none;padding:0;margin:26px 0 0;display:flex;flex-direction:column;gap:12px}
        .cl-dg-notes li{display:flex;align-items:center;gap:10px;font:400 15.5px var(--text);color:var(--ink-2)}
        .cl-dg{position:relative;overflow:hidden;padding:30px}
        .cl-dg:hover{transform:none;box-shadow:var(--sh-2)}
        .cl-dg-bar{position:absolute;top:0;left:0;right:0;height:3px;background:var(--line-2)}
        .cl-dg-bar span{display:block;height:100%;transition:width .5s var(--ease),background .4s}
        .cl-dg-in{animation:cl-dgin .4s var(--ease)}
        @keyframes cl-dgin{from{opacity:0;transform:translateY(8px)}}
        .cl-dg-opts{display:flex;flex-direction:column;gap:9px;margin-top:22px}
        .cl-dg-opt{display:flex;align-items:center;gap:13px;width:100%;text-align:left;padding:15px 16px;border-radius:13px;border:1px solid var(--line);background:#fff;font:500 15.5px var(--text);color:var(--ink);transition:all .24s var(--ease)}
        .cl-dg-opt:hover{border-color:var(--brand);background:rgba(15,169,104,.06);transform:translateX(4px)}
        .cl-dg-opt-ic{flex-shrink:0;width:34px;height:34px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;color:var(--brand);background:rgba(15,169,104,.09);border:1px solid rgba(15,169,104,.2)}
        .cl-dg-back{margin-top:16px;display:inline-flex;align-items:center;gap:7px;background:none;border:none;font:500 14px var(--text);color:var(--ink-3);padding:6px 2px;cursor:pointer}
        .cl-dg-back:hover{color:var(--ink)}
        .cl-dg-meter{display:flex;gap:7px;margin-top:16px}
        .cl-dg-meter span{height:6px;flex:1;border-radius:99px;transition:background .4s}
        .cl-dg-next{margin-top:22px;padding-top:18px;border-top:1px solid var(--line-2)}
        .cl-dg-next-row{display:flex;align-items:center;gap:12px;padding:9px 0;font:500 15.5px var(--text);color:var(--ink)}
        .cl-dg-n{width:25px;height:25px;flex-shrink:0;border:1px solid;border-radius:99px;display:inline-flex;align-items:center;justify-content:center;font:600 11.5px var(--code)}
      `}} />
    </section>
  );
}

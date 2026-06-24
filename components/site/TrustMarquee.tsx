// @ts-nocheck
"use client";

const BRANDS = [
  "Clicou Enviou", "EB Corretora", "OdontoMed Saúde", "Pneus Maninho",
  "Agentop", "Unixx", "Packslog", "NutriSnap", "Sorteio Bilionário", "Marido de Aluguel",
];

const STATS = [
  { v: "+10", l: "marcas no ar" },
  { v: "24/7", l: "operação com IA" },
  { v: "6", l: "mercados atendidos" },
  { v: "100%", l: "foco em resultado" },
];

function Row({ reverse }) {
  const items = [...BRANDS, ...BRANDS];
  return (
    <div className="mq-row">
      <div className={`mq-track ${reverse ? "rev" : ""}`}>
        {items.map((b, i) => (
          <span key={i} className="mq-pill">
            <span className="mq-dot" />
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TrustMarquee() {
  return (
    <section className="sec" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <div className="wrap">
        <div className="reveal" style={{ textAlign: "center", marginBottom: 34 }}>
          <div className="eyebrow"><span className="dot" style={{ background: "#3ee6b5", boxShadow: "0 0 10px #3ee6b5, 0 0 4px #fff" }} />Prova social</div>
          <h2 className="h-sec" style={{ marginLeft: "auto", marginRight: "auto" }}>
            Empresas que crescem com a <span className="accent">HyperGrow</span>
          </h2>
        </div>
      </div>

      <div className="mq-mask reveal">
        <Row />
        <Row reverse />
      </div>

      <div className="wrap">
        <div className="reveal stat-strip">
          {STATS.map((s) => (
            <div key={s.l} className="stat-cell">
              <div className="stat-v">{s.v}</div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .mq-mask {
          position: relative; overflow: hidden; padding: 4px 0;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          display: flex; flex-direction: column; gap: 14px;
        }
        .mq-row { display: flex; overflow: hidden; }
        .mq-track { display: flex; gap: 14px; padding-right: 14px; width: max-content; animation: mq 38s linear infinite; }
        .mq-track.rev { animation-direction: reverse; animation-duration: 46s; }
        .mq-mask:hover .mq-track { animation-play-state: paused; }
        @keyframes mq { to { transform: translateX(-50%); } }
        .mq-pill {
          display: inline-flex; align-items: center; gap: 10px; white-space: nowrap;
          padding: 13px 22px; border-radius: 999px;
          font: 600 15px var(--font-display); letter-spacing: -0.01em; color: rgba(255,255,255,0.86);
          background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: inset 0 0 24px -16px rgba(91,60,255,0.8);
          transition: border-color .3s, color .3s, box-shadow .3s;
        }
        .mq-pill:hover { color: #fff; border-color: rgba(52,225,255,0.55); box-shadow: 0 0 24px -6px rgba(52,225,255,0.55); }
        .mq-dot { width: 8px; height: 8px; border-radius: 999px; background: linear-gradient(135deg, #1565FF, #FF2D7A); box-shadow: 0 0 10px rgba(91,60,255,0.8); }
        @media (prefers-reduced-motion: reduce) { .mq-track { animation: none; } }

        .stat-strip {
          margin-top: 40px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;
          padding: 26px; border-radius: 20px;
          background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow: 0 40px 90px -50px rgba(0,0,0,0.8);
        }
        .stat-cell { text-align: center; }
        .stat-v { font: 800 40px/1 var(--font-display); letter-spacing: -0.03em; background: linear-gradient(120deg,#4d8bff,#5b3cff 50%,#FF2D7A); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .stat-l { margin-top: 8px; font: 500 13px var(--font-sans); color: rgba(255,255,255,0.6); }
        @media (max-width: 760px) { .stat-strip { grid-template-columns: 1fr 1fr; } .stat-v { font-size: 32px; } }
      `}</style>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Quadro kanban arrastável, SEM biblioteca de drag-and-drop.

   Por que não instalar `@dnd-kit` ou similar: são ~40 KB de JS para um quadro
   de 6 colunas, e o navegador já resolve os dois casos. A abordagem abaixo é a
   mesma que o Agentop usa em produção (`CampoKanban.tsx`), portada:

   · MOUSE  — HTML5 nativo (`draggable` + `onDragOver`/`onDrop`). Zero código
              de posicionamento; o navegador desenha o fantasma sozinho.
   · TOQUE  — HTML5 drag NÃO funciona em toque. Aqui vai Pointer Events na mão,
              com um detalhe que faz toda a diferença: só vira arrasto depois de
              8px de movimento (`Math.hypot`). Sem esse limiar, um toque simples
              para abrir o card era interpretado como arrasto e o quadro ficava
              impossível de usar no celular.
   · TECLADO — cada card tem `‹ ›` que chamam o MESMO `onMove`. É o que torna o
              quadro operável sem mouse nem toque; sem isso, quem usa teclado
              simplesmente não consegue mover nada.
   ──────────────────────────────────────────────────────────────────────────── */

export type KanbanStage = { key: string; label: string; color: string };
export type KanbanItem = { id: string; status: string | null; [k: string]: unknown };

type Props<T extends KanbanItem> = {
  stages: KanbanStage[];
  items: T[];
  /** Devolver `false` cancela o movimento (a UI faz rollback sozinha). */
  onMove: (id: string, status: string) => Promise<boolean | void> | boolean | void;
  renderCard: (item: T) => React.ReactNode;
  onOpen?: (item: T) => void;
  emptyLabel?: string;
};

export default function KanbanBoard<T extends KanbanItem>({
  stages, items, onMove, renderCard, onOpen, emptyLabel = "Nada aqui",
}: Props<T>) {
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<string | null>(null);
  const [fantasma, setFantasma] = useState<{ x: number; y: number; label: string } | null>(null);

  /* `arrastouRef` suprime o clique sintético que o navegador dispara logo
     depois de soltar — sem ele, terminar um arrasto ABRIA o card. */
  const arrastouRef = useRef(false);
  const toqueRef = useRef<{ id: string; x0: number; y0: number; ativo: boolean; pid: number } | null>(null);

  const porEstagio = useMemo(() => {
    const m: Record<string, T[]> = {};
    stages.forEach((s) => (m[s.key] = []));
    items.forEach((it) => {
      const k = it.status && m[it.status] ? it.status : stages[0].key;
      m[k].push(it);
    });
    return m;
  }, [items, stages]);

  function mover(id: string, status: string) {
    const atual = items.find((i) => i.id === id);
    if (!atual || atual.status === status) return;
    void onMove(id, status);
  }

  /* ── Toque ─────────────────────────────────────────────────────────────── */
  function onPointerDown(e: React.PointerEvent, id: string, label: string) {
    if (e.pointerType === "mouse") return; // mouse usa o caminho HTML5
    toqueRef.current = { id, x0: e.clientX, y0: e.clientY, ativo: false, pid: e.pointerId };
    void label;
  }

  function onPointerMove(e: React.PointerEvent, label: string) {
    const t = toqueRef.current;
    if (!t || e.pointerId !== t.pid) return;
    const dist = Math.hypot(e.clientX - t.x0, e.clientY - t.y0);

    if (!t.ativo) {
      if (dist < 8) return; // ainda pode ser um toque simples
      t.ativo = true;
      arrastouRef.current = true;
      setArrastando(t.id);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    }
    e.preventDefault(); // trava a rolagem da página enquanto arrasta
    setFantasma({ x: e.clientX, y: e.clientY, label });

    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const col = el?.closest("[data-stage-key]") as HTMLElement | null;
    setAlvo(col?.dataset.stageKey ?? null);
  }

  function onPointerUp(e: React.PointerEvent) {
    const t = toqueRef.current;
    toqueRef.current = null;
    setFantasma(null);
    setArrastando(null);
    const destino = alvo;
    setAlvo(null);
    if (!t?.ativo) return; // foi toque simples: deixa o click abrir o card
    e.preventDefault();
    if (destino) mover(t.id, destino);
    // solta o supressor de clique só depois do ciclo de eventos
    setTimeout(() => { arrastouRef.current = false; }, 0);
  }

  useEffect(() => {
    if (!fantasma) return;
    const cancelar = () => { toqueRef.current = null; setFantasma(null); setArrastando(null); setAlvo(null); };
    window.addEventListener("pointercancel", cancelar);
    return () => window.removeEventListener("pointercancel", cancelar);
  }, [fantasma]);

  return (
    <div className="kb">
      {stages.map((s) => {
        const lista = porEstagio[s.key] ?? [];
        const iStage = stages.findIndex((x) => x.key === s.key);
        return (
          <section
            key={s.key}
            data-stage-key={s.key}
            className={"kb-col" + (alvo === s.key ? " kb-col--alvo" : "")}
            style={{ ["--c" as string]: s.color }}
            onDragOver={(e) => { e.preventDefault(); setAlvo(s.key); }}
            onDragLeave={() => setAlvo((a) => (a === s.key ? null : a))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              setAlvo(null); setArrastando(null);
              if (id) mover(id, s.key);
            }}
          >
            <header className="kb-hd">
              <span className="kb-dot" />
              <b>{s.label}</b>
              <span className="kb-n">{lista.length}</span>
            </header>

            <div className="kb-body">
              {lista.length === 0 && <p className="kb-vazio">{emptyLabel}</p>}
              {lista.map((it) => {
                const label = String((it as { name?: string }).name ?? "Card");
                return (
                  <article
                    key={it.id}
                    className={"kb-card" + (arrastando === it.id ? " kb-card--drag" : "")}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", it.id);
                      e.dataTransfer.effectAllowed = "move";
                      arrastouRef.current = true;
                      setArrastando(it.id);
                    }}
                    onDragEnd={() => {
                      setArrastando(null); setAlvo(null);
                      setTimeout(() => { arrastouRef.current = false; }, 0);
                    }}
                    onPointerDown={(e) => onPointerDown(e, it.id, label)}
                    onPointerMove={(e) => onPointerMove(e, label)}
                    onPointerUp={onPointerUp}
                    onClick={() => { if (!arrastouRef.current) onOpen?.(it); }}
                  >
                    {renderCard(it)}

                    {/* Alternativa por teclado/clique — o quadro precisa ser
                        operável sem arrastar. Chama o MESMO onMove. */}
                    <div className="kb-setas">
                      <button
                        type="button" className="kb-seta"
                        disabled={iStage === 0}
                        aria-label={`Mover ${label} para ${stages[iStage - 1]?.label ?? ""}`}
                        onClick={(e) => { e.stopPropagation(); mover(it.id, stages[iStage - 1].key); }}
                      >‹</button>
                      <button
                        type="button" className="kb-seta"
                        disabled={iStage === stages.length - 1}
                        aria-label={`Mover ${label} para ${stages[iStage + 1]?.label ?? ""}`}
                        onClick={(e) => { e.stopPropagation(); mover(it.id, stages[iStage + 1].key); }}
                      >›</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Fantasma que segue o dedo. `pointer-events:none` é obrigatório: sem
          isso ele viraria o alvo do elementFromPoint e a coluna nunca seria
          detectada. */}
      {fantasma && (
        <div className="kb-ghost" style={{ left: fantasma.x, top: fantasma.y }} aria-hidden>
          {fantasma.label}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </div>
  );
}

const CSS = `
  .kb { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(268px, 1fr); gap: 14px;
        overflow-x: auto; padding-bottom: 10px; scroll-snap-type: x proximity; }
  .kb-col { scroll-snap-align: start; background: rgba(148,163,184,.05); border: 1px solid rgba(148,163,184,.12);
            border-radius: 14px; display: flex; flex-direction: column; min-height: 220px;
            transition: background .2s, border-color .2s, box-shadow .2s; }
  .kb-col--alvo { background: color-mix(in srgb, var(--c) 12%, transparent);
                  border-color: var(--c); box-shadow: 0 0 0 2px color-mix(in srgb, var(--c) 35%, transparent); }
  .kb-hd { display: flex; align-items: center; gap: 8px; padding: 12px 14px;
           border-bottom: 1px solid rgba(148,163,184,.12); }
  .kb-dot { width: 8px; height: 8px; border-radius: 99px; background: var(--c); flex-shrink: 0; }
  .kb-hd b { font-size: 13.5px; font-weight: 600; color: #e2e8f0; flex: 1; }
  .kb-n { font-size: 11.5px; font-weight: 600; color: #94a3b8; background: rgba(148,163,184,.14);
          border-radius: 99px; padding: 2px 8px; }
  .kb-body { padding: 10px; display: flex; flex-direction: column; gap: 9px; flex: 1; }
  .kb-vazio { font-size: 12.5px; color: #64748b; text-align: center; padding: 18px 0; margin: 0; }

  .kb-card { position: relative; background: rgba(17,19,31,.72); border: 1px solid rgba(148,163,184,.14);
             border-radius: 11px; padding: 12px; cursor: grab; touch-action: none;
             transition: transform .18s, box-shadow .18s, border-color .18s; }
  .kb-card:hover { border-color: color-mix(in srgb, var(--c) 45%, transparent); transform: translateY(-2px); }
  .kb-card:active { cursor: grabbing; }
  .kb-card--drag { opacity: .45; }
  .kb-card:focus-within { outline: 2px solid var(--c); outline-offset: 2px; }

  .kb-setas { display: flex; gap: 6px; margin-top: 10px; }
  .kb-seta { width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(148,163,184,.2);
             background: rgba(148,163,184,.06); color: #cbd5e1; font-size: 16px; line-height: 1;
             display: inline-flex; align-items: center; justify-content: center; }
  .kb-seta:hover:not(:disabled) { background: color-mix(in srgb, var(--c) 22%, transparent); border-color: var(--c); color: #fff; }
  .kb-seta:disabled { opacity: .3; cursor: not-allowed; }
  .kb-seta:focus-visible { outline: 2px solid var(--c); outline-offset: 2px; }

  .kb-ghost { position: fixed; z-index: 9999; pointer-events: none; transform: translate(-50%, -140%);
              background: #1e293b; color: #fff; border: 1px solid rgba(148,163,184,.3);
              border-radius: 10px; padding: 8px 12px; font-size: 13px; font-weight: 600;
              box-shadow: 0 16px 40px rgba(0,0,0,.5); max-width: 220px; white-space: nowrap;
              overflow: hidden; text-overflow: ellipsis; }

  @media (max-width: 760px) {
    .kb { grid-auto-columns: minmax(84vw, 1fr); gap: 10px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .kb-col, .kb-card { transition: none; }
    .kb-card:hover { transform: none; }
  }
`;

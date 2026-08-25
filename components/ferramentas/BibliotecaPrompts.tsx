"use client";

import { useMemo, useState } from "react";
import { useCopiar, IconeAcao } from "./acoes";
import { CATEGORIAS, PROMPTS, type PromptCategoriaKey, type PromptItem } from "@/lib/prompt-library";

/* -----------------------------------------------------------------------------
   BIBLIOTECA DE PROMPTS PARA IMAGENS COM IA — busca + filtro por categoria +
   copiar, tudo no navegador (sem servidor, sem conta, sem limite de uso).

   POR QUE NÃO REUSAR .ft-card DIRETO NO GRID: EstilosFerramentas.tsx declara
   ".ft-card + .ft-card { margin-top: 16px }" para empilhar cartões numa coluna
   (é assim que GeradorUtm usa). Dentro de um grid de várias colunas essa regra
   empurra para baixo todo cartão que TENHA um .ft-card antes dele no DOM,
   mesmo estando ao lado (não abaixo) na tela — o resultado é uma fileira
   descida escada. .bp-card copia a mesma aparência (fundo, borda, sombra,
   padding) sem herdar esse combinador de irmãos.

   Contagem por categoria e total: sempre calculados a partir do array real
   (PROMPTS.length / CATEGORIAS.length), nunca escritos à mão — se o número
   mudar amanhã, a tela muda sozinha e continua verdadeira.
   ----------------------------------------------------------------------------- */

type FiltroCategoria = "todos" | PromptCategoriaKey;

/** Tira acento e baixa para minúscula, para a busca não depender de acentuação
 *  exata. Mesma técnica do GeradorUtm (faixa de marcas diacríticas em vez de
 *  \p{Mn}, que não compila com o alvo deste tsconfig). */
function normalizar(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function LupaIcone() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10.6" cy="10.6" r="6.6" stroke="currentColor" strokeWidth="1.9" />
      <path d="m15.6 15.6 4.4 4.4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function CardPrompt({ item, rotulo }: { item: PromptItem; rotulo: string }) {
  const [copiado, copiar] = useCopiar("biblioteca-prompts-imagens-ia");
  return (
    <article className="bp-card lit">
      <span className="pg-tag bp-cat">{rotulo}</span>
      <h3 className="bp-card-t">{item.titulo}</h3>
      <p className="bp-card-r">{item.resultado}</p>
      <span className="bp-prompt-k">Prompt</span>
      <code className="ft-out bp-prompt">{item.prompt}</code>
      <button
        type="button"
        className={copiado ? "ft-mini on" : "ft-mini"}
        onClick={() => copiar(item.prompt)}
      >
        <IconeAcao nome={copiado ? "ok" : "copiar"} />
        {copiado ? "Copiado!" : "Copiar prompt"}
      </button>
    </article>
  );
}

export default function BibliotecaPrompts() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<FiltroCategoria>("todos");

  const porCategoria = useMemo(() => {
    const mapa = new Map<PromptCategoriaKey, number>();
    for (const p of PROMPTS) mapa.set(p.categoria, (mapa.get(p.categoria) || 0) + 1);
    return mapa;
  }, []);

  const rotulos = useMemo(() => {
    const mapa = new Map<PromptCategoriaKey, string>();
    for (const c of CATEGORIAS) mapa.set(c.key, c.label);
    return mapa;
  }, []);

  const termo = useMemo(() => normalizar(busca.trim()), [busca]);

  const filtrados = useMemo(() => {
    return PROMPTS.filter((p) => {
      if (categoria !== "todos" && p.categoria !== categoria) return false;
      if (!termo) return true;
      return normalizar(p.titulo + " " + p.resultado + " " + p.prompt).includes(termo);
    });
  }, [categoria, termo]);

  const filtroAtivo = termo !== "" || categoria !== "todos";
  const categoriaAtiva = categoria !== "todos" ? CATEGORIAS.find((c) => c.key === categoria) : undefined;

  return (
    <div className="bp">
      <div className="bp-bar">
        <div className="ft-inwrap bp-search">
          <span className="ft-pre bp-search-ic" aria-hidden>
            <LupaIcone />
          </span>
          <input
            className="ft-in pre"
            type="text"
            inputMode="search"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Buscar: produto, post, anúncio, logotipo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar prompt por palavra"
          />
        </div>
        <p className="bp-count">
          {PROMPTS.length} {PROMPTS.length === 1 ? "prompt" : "prompts"} em {CATEGORIAS.length}{" "}
          {CATEGORIAS.length === 1 ? "categoria" : "categorias"}
          {filtroAtivo && <> — mostrando {filtrados.length}</>}
        </p>
      </div>

      <div className="bp-chips">
        <button
          type="button"
          className="ft-chip"
          aria-pressed={categoria === "todos"}
          onClick={() => setCategoria("todos")}
        >
          Todos <small>({PROMPTS.length})</small>
        </button>
        {CATEGORIAS.map((c) => (
          <button
            key={c.key}
            type="button"
            className="ft-chip"
            aria-pressed={categoria === c.key}
            title={c.desc}
            onClick={() => setCategoria((atual) => (atual === c.key ? "todos" : c.key))}
          >
            {c.label} <small>({porCategoria.get(c.key) || 0})</small>
          </button>
        ))}
      </div>

      {categoriaAtiva && (
        <div className="ft-alert info bp-cat-desc" role="status">
          <span>{categoriaAtiva.desc}</span>
        </div>
      )}

      {filtrados.length > 0 ? (
        <div className="bp-grid">
          {filtrados.map((p) => (
            <CardPrompt key={p.slug} item={p} rotulo={rotulos.get(p.categoria) || p.categoria} />
          ))}
        </div>
      ) : (
        <div className="ft-card bp-empty">
          <p className="ft-h">Nenhum prompt encontrado</p>
          <p className="ft-sub" style={{ marginBottom: 0 }}>
            Tente outra palavra na busca ou toque em <b>Todos</b> para tirar o filtro de categoria.
          </p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </div>
  );
}

const CSS = `
  .bp-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
    gap: 12px 16px; margin-bottom: 14px; }
  .bp-search { flex: 1 1 320px; min-width: 0; }
  /* .ft-pre (EstilosFerramentas.tsx) foi desenhado para uma letra/sigla
     ("R$", "+") e conta com o alinhamento estático do flex pai para centralizar
     na vertical. Um ícone SVG não é texto de mesma altura de linha, então aqui
     a centralização é garantida explicitamente em vez de confiar no mesmo
     comportamento herdado. */
  .bp-search-ic { top: 50%; transform: translateY(-50%); display: flex; align-items: center; color: var(--ink-3); }
  .bp-count { flex: 0 0 auto; font: 500 13px var(--text); color: var(--ink-3); white-space: nowrap; }

  /* fileira de categorias: rola de lado no celular (não cabem sete chips numa
     tela de 360px), vira fileira que quebra normalmente a partir de 640px. */
  .bp-chips { display: flex; flex-wrap: nowrap; gap: 8px; overflow-x: auto; -webkit-overflow-scrolling: touch;
    padding-bottom: 4px; margin-bottom: 8px; scrollbar-width: none; }
  .bp-chips::-webkit-scrollbar { display: none; }
  .bp-chips .ft-chip { flex: 0 0 auto; }
  @media (min-width: 640px) { .bp-chips { flex-wrap: wrap; overflow-x: visible; } }

  /* ".cl .ft-alert" (EstilosFerramentas.tsx) já vale duas classes de
     especificidade (0,2,0) com margin-top:14px; ".bp-cat-desc" sozinha (0,1,0)
     perderia esse empate. ".ft-alert.bp-cat-desc" soma três classes (0,3,0) e
     vence sem depender da ordem em que os dois <style> aparecem no documento. */
  .ft-alert.bp-cat-desc { margin-top: 0; margin-bottom: 22px; }

  .bp-grid { display: grid; gap: 16px; margin-top: 22px;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); }

  /* mesma aparência de .ft-card, escrito à parte para não herdar o combinador
     de irmãos ".ft-card + .ft-card" (ver comentário no topo do arquivo). */
  .bp-card { display: flex; flex-direction: column; gap: 10px; min-width: 0;
    background: var(--card); border: 1px solid var(--line); border-radius: 18px;
    box-shadow: var(--sh-1); padding: clamp(16px, 3.6vw, 24px);
    transition: transform .28s var(--ease), box-shadow .28s var(--ease), border-color .28s var(--ease); }
  .bp-card:hover { transform: translateY(-3px); box-shadow: var(--sh-2);
    border-color: color-mix(in srgb, var(--beam, var(--acc)) 30%, var(--line)); }

  .bp-cat { align-self: flex-start; }
  .bp-card-t { font: 600 17.5px/1.32 var(--disp); letter-spacing: -.02em; color: var(--ink); margin: 2px 0 0; }
  .bp-card-r { font: 400 14px/1.55 var(--text); color: var(--ink-2); margin: 0; }
  .bp-prompt-k { font: 600 10.5px var(--code); letter-spacing: .12em; text-transform: uppercase;
    color: var(--ink-3); margin-top: 4px; }
  .bp-prompt { margin: 0; max-height: 240px; overflow-y: auto; -webkit-overflow-scrolling: touch; }
  .bp-card .ft-mini { width: 100%; margin-top: auto; }

  .bp-empty { text-align: center; padding: clamp(30px, 5vw, 48px) clamp(18px, 4vw, 30px); margin-top: 22px; }
  .bp-empty .ft-h { margin-bottom: 8px; }

  @media (prefers-reduced-motion: reduce) {
    .bp-card { transition: border-color .2s ease; }
    .bp-card:hover { transform: none; }
  }
`;

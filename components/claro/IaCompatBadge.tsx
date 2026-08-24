/* ─────────────────────────────────────────────────────────────────────────────
   SELO "FUNCIONA COM CHATGPT E CLAUDE" + os dois glifos.

   DECISÃO DE MARCA (dono aprovou 2026-08-16): NÃO usamos os logos oficiais do
   ChatGPT (OpenAI) nem do Claude (Anthropic) — são marcas registradas de
   terceiros, mesmo risco que já fez o projeto evitar os logos de Shopify/VTEX
   (ver PlatformShowcase.tsx). Aqui os ícones são DESENHOS PRÓPRIOS genéricos
   (um balão de chat com faísca; uma faísca/asterisco de IA), com o NOME escrito
   ao lado — comunica compatibilidade de forma factual, sem hospedar marca de
   ninguém. Mesmo espírito do wordmark tipográfico das plataformas.

   Server component (sem "use client", sem estado) — pode ser usado tanto no
   componente de home quanto na página estática da ferramenta.
   ──────────────────────────────────────────────────────────────────────────── */

/** Balão de chat com uma faísca dentro — genérico, representa "conversar com IA
 *  de texto". NÃO é o logo do ChatGPT. */
export function ChatGptGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-6l-4 3v-3H6a2 2 0 0 1-2-2V6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m12 6.8.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9Z" fill="currentColor" />
    </svg>
  );
}

/** Faísca/asterisco de seis raios — genérico, o "brilho de IA". NÃO é o logo do
 *  Claude. */
export function ClaudeGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.2v17.6M4.4 7.6l15.2 8.8M19.6 7.6 4.4 16.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Linha "Funciona com [chatgpt] ChatGPT · [claude] Claude". */
export function IaCompatBadge({ className }: { className?: string }) {
  return (
    <div className={"ia-compat" + (className ? ` ${className}` : "")}>
      <span className="ia-compat-l">Funciona com</span>
      <span className="ia-compat-t"><ChatGptGlyph /> ChatGPT</span>
      <span className="ia-compat-dot" aria-hidden>·</span>
      <span className="ia-compat-t"><ClaudeGlyph /> Claude</span>
      <style dangerouslySetInnerHTML={{ __html: `
        .cl .ia-compat{display:inline-flex;align-items:center;flex-wrap:wrap;gap:9px;font:500 13.5px var(--font-sans)}
        .cl .ia-compat-l{color:var(--ink-3);font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase}
        .cl .ia-compat-t{display:inline-flex;align-items:center;gap:6px;color:var(--ink);font-weight:600;padding:5px 11px;border-radius:999px;border:1px solid var(--line);background:var(--card)}
        .cl .ia-compat-t svg{color:var(--acc,var(--brand))}
        .cl .ia-compat-dot{color:var(--ink-3)}
      ` }} />
    </div>
  );
}

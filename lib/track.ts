/* ─────────────────────────────────────────────────────────────────────────────
   EVENTOS DE CONVERSÃO — uma função só, usada por todo o site.

   POR QUE CENTRALIZAR: sem isto, cada componente escreveria seu próprio
   `window.dataLayer.push(...)` com nome de evento inventado na hora. Seis meses
   depois o relatório do GA teria "lead", "Lead", "lead_enviado" e
   "form_submit" medindo a mesma coisa, e ninguém confia mais no número.
   Aqui os nomes vivem num lugar só (ver EVENTOS abaixo).

   FUNCIONA SEM ANALYTICS CONFIGURADO: se `dataLayer` não existir, a função cria
   o array e empilha mesmo assim. Quando o GTM subir (depois do consentimento),
   ele consome a fila inteira — nenhum evento anterior ao carregamento se perde.

   RESPEITA O CONSENTIMENTO POR CONSTRUÇÃO: não há nada aqui sobre consentir.
   O bloqueio acontece uma camada acima, no Consent Mode (lib/consent.ts):
   enquanto o visitante não aceitar, o Google recebe estes eventos sem cookie e
   sem identificador. É o desenho correto — a regra de privacidade mora num
   lugar só, e não espalhada em cada `if` de cada chamada.
   ──────────────────────────────────────────────────────────────────────────── */

/** Catálogo fechado de eventos. Adicionar evento = adicionar aqui primeiro. */
export const EVENTOS = {
  /** Formulário de contato enviado com sucesso. */
  leadEnviado: "lead_enviado",
  /** Diagnóstico concluído E e-mail deixado. */
  diagnosticoLead: "diagnostico_lead",
  /** Diagnóstico concluído (com ou sem e-mail) — mede engajamento real. */
  diagnosticoFim: "diagnostico_concluido",
  /** Clique em qualquer CTA de WhatsApp. */
  whatsapp: "clique_whatsapp",
  /** Uso efetivo de uma ferramenta grátis (calculou/gerou algo). */
  ferramentaUso: "ferramenta_uso",
} as const;

type Props = Record<string, string | number | boolean | undefined>;

/** Empilha um evento no dataLayer. Nunca lança: telemetria quebrada não pode
 *  derrubar a ação que o visitante estava fazendo. */
export function rastrear(evento: string, props: Props = {}) {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: evento, ...props });
  } catch {
    /* silencioso de propósito — ver comentário acima */
  }
}

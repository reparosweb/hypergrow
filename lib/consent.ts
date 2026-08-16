/* ─────────────────────────────────────────────────────────────────────────────
   CONSENTIMENTO DE COOKIES — fonte única da decisão do visitante.

   POR QUE EXISTE: o site tinha o código de GA4/GTM pronto (components/
   Analytics.tsx) disparando com `strategy="afterInteractive"`, ou seja, no
   instante em que a página carregava. Enquanto os IDs estavam vazios isso era
   inofensivo; no dia em que NEXT_PUBLIC_GA_ID fosse preenchida, o site passaria
   a rastrear visitante brasileiro sem banner e sem base legal declarada na
   política de privacidade. Este módulo existe para que ligar a medição e
   respeitar a LGPD sejam a MESMA ação, não duas.

   COMO FUNCIONA: usamos o Consent Mode v2 do Google. A diferença em relação a
   "não carregar o script" é importante:
     · O gtag/GTM carrega SEMPRE, mas já nasce com todos os sinais negados.
     · Enquanto negado, o Google não grava cookie nem envia dado identificável;
       manda apenas um ping sem cookie (modelagem agregada).
     · Ao aceitar, um `consent update` libera os sinais — sem recarregar a
       página e sem perder a visita em curso.
   Se em vez disso a gente só injetasse o script após o aceite, quem recusasse
   sumiria por completo da medição E quem aceitasse perderia o evento de entrada.

   ZERO DEPENDÊNCIA: nada de biblioteca de CMP. São ~60 linhas e um localStorage.
   ──────────────────────────────────────────────────────────────────────────── */

/** Chave no localStorage. Versionada: se um dia a política mudar de forma
 *  relevante, subir para `hg_consent_v2` faz todo mundo ser perguntado de novo,
 *  que é o comportamento correto — consentimento antigo não vale para
 *  finalidade nova. */
export const CONSENT_KEY = "hg_consent_v1";

/** Evento disparado no `window` quando a decisão muda. Quem precisa reagir
 *  (o gate do Analytics) escuta isto em vez de fazer polling no localStorage. */
export const CONSENT_EVENT = "hg:consent";

export type ConsentState = "aceito" | "recusado" | null;

/** Lê a decisão já tomada. `null` = nunca respondeu (mostrar o banner).
 *  Retorna null no servidor de propósito: durante a renderização do servidor
 *  não existe localStorage, e assumir "aceito" ali criaria divergência de
 *  hidratação — bug que este projeto já teve (React #418/#423/#425). */
export function lerConsentimento(): ConsentState {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "aceito" || v === "recusado" ? v : null;
  } catch {
    // localStorage pode lançar em modo privado/bloqueado. Sem decisão gravada,
    // o padrão é o mais conservador: tratar como "ainda não respondeu".
    return null;
  }
}

export function gravarConsentimento(estado: Exclude<ConsentState, null>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_KEY, estado);
  } catch {
    /* modo privado: a decisão vale para esta sessão, o banner volta na próxima */
  }
  aplicarConsentimento(estado);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: estado }));
}

/** Empurra o `consent update` para o dataLayer. Seguro chamar antes de o gtag
 *  existir: o array `dataLayer` é criado aqui se preciso, e o Google consome a
 *  fila inteira quando o script sobe. */
export function aplicarConsentimento(estado: Exclude<ConsentState, null>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  const concedido = estado === "aceito" ? "granted" : "denied";
  // `arguments`-style: é assim que o gtag espera receber (array-like), por isso
  // o push de um array e não de um objeto.
  w.dataLayer.push(["consent", "update", {
    ad_storage: concedido,
    ad_user_data: concedido,
    ad_personalization: concedido,
    analytics_storage: concedido,
  }]);
}

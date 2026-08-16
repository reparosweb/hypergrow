import Script from "next/script";

/* ─────────────────────────────────────────────────────────────────────────────
   GA4 + GTM com Consent Mode v2.

   O QUE MUDOU (2026-08-08) E POR QUÊ: antes os dois scripts subiam com
   `afterInteractive` assim que a página carregava. Enquanto os IDs estavam
   vazios ninguém percebia; no dia em que `NEXT_PUBLIC_GA_ID` fosse preenchida,
   o site passaria a rastrear visitante brasileiro sem banner e sem base legal
   na política — risco jurídico criado por uma variável de ambiente.

   A ORDEM AQUI É O QUE IMPORTA, e por isso o `id` e a `strategy` de cada
   Script não são detalhe:

   1. `consent-default` roda com `beforeInteractive` — precisa estar no
      dataLayer ANTES de o gtag.js existir. É o que garante que a primeira
      medição já nasça negada. Se rodasse depois, haveria uma janela em que o
      Google grava cookie antes de saber que foi recusado.
   2. GTM e gtag sobem normalmente (`afterInteractive`), já sob o default
      negado.
   3. `components/ConsentBanner.tsx` empurra o `consent update` quando o
      visitante decide — e reaplica a decisão salva a cada nova carga.

   Enquanto negado, o Google não grava cookie nem envia dado identificável:
   manda um ping sem cookie (modelagem agregada). É por isso que este desenho é
   melhor do que "só injetar o script depois do aceite" — quem recusa não some
   das estatísticas agregadas, e quem aceita não perde o evento de entrada.
   ──────────────────────────────────────────────────────────────────────────── */
export default function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  const gtm = process.env.NEXT_PUBLIC_GTM_ID;

  // Sem ID configurado não há o que negar nem o que carregar. Mantém o HTML
  // limpo enquanto o dono não criar as contas.
  if (!ga && !gtm) return null;

  return (
    <>
      {/* Sinais negados por padrão. `wait_for_update` dá 500ms para o banner
          reaplicar uma decisão já salva antes do primeiro disparo — sem isso, o
          visitante que JÁ aceitou teria a primeira pageview medida como negada. */}
      <Script id="consent-default" strategy="beforeInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`}
      </Script>

      {gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
    </>
  );
}

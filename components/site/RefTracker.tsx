"use client";

import { useEffect } from "react";
import { chamarApi } from "@/lib/admin-api";

/* ─────────────────────────────────────────────────────────────────────────────
   RefTracker — rastreio de indicação de afiliado. Sem UI (retorna `null`),
   montado no layout raiz ao lado de <Analytics/> e <ConsentBanner/>.

   COMO FUNCIONA (last-click com memória): lê `?ref=CODIGO` da URL atual. Se
   existir E for diferente do que já está salvo no cookie `hg_ref`, grava o
   cookie de novo (30 dias) e avisa o servidor. Um simples F5 na mesma URL, ou
   voltar ao site sem `?ref=` na barra de endereço, NÃO gera clique duplicado
   nem troca o afiliado que já estava salvo.

   `window.location.search` em vez de `useSearchParams`: este componente mora
   no layout RAIZ (toda página do site passa por ele). `useSearchParams` num
   client component exige embrulhar em `<Suspense>` para não forçar o Next a
   desistir da renderização estática de todo o site — desnecessário aqui, já
   que o componente não renderiza nada e só precisa da URL depois do mount.

   NUNCA CONFIA NO CLIENTE: o valor do `code` só vira um `affiliate_events`
   tipo "clique" se o SERVIDOR confirmar que o código existe em `affiliates`
   (ver a ação "clique" em lib/modules/mod-afiliados.ts). Se o código for
   inventado, o servidor ignora em silêncio e nada é gravado.
   ──────────────────────────────────────────────────────────────────────────── */

const COOKIE_REF = "hg_ref";
const DIAS_VALIDADE = 30;

function lerCookie(nome: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${nome}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function gravarCookie(nome: string, valor: string, dias: number) {
  const expira = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${nome}=${encodeURIComponent(valor)}; expires=${expira}; path=/; samesite=lax`;
}

export default function RefTracker() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const bruto = params.get("ref");
      if (!bruto) return;

      const codigo = bruto.trim().toUpperCase().slice(0, 20);
      if (!codigo) return;

      const salvo = lerCookie(COOKIE_REF);
      if (salvo === codigo) return; // mesmo código já contabilizado — nada a fazer

      gravarCookie(COOKIE_REF, codigo, DIAS_VALIDADE);

      // Telemetria não pode quebrar a navegação: erro de rede aqui nunca
      // aparece pro visitante.
      chamarApi("afiliado", "clique", { code: codigo }).catch(() => {});
    } catch {
      /* silencioso de propósito — o rastreio nunca pode derrubar o site */
    }
  }, []);

  return null;
}

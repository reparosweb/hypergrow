"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { CONSENT_KEY, aplicarConsentimento, gravarConsentimento, lerConsentimento } from "@/lib/consent";

/* ─────────────────────────────────────────────────────────────────────────────
   BANNER DE COOKIES — a peça que torna legal ligar o GA4/GTM.

   DISCIPLINA DE HIDRATAÇÃO (regra que este projeto pagou com bug real,
   React #418/#423/#425): nada que dependa de localStorage pode mudar o que é
   renderizado na PRIMEIRA passagem. Por isso `pronto` começa false SEMPRE — no
   servidor e na primeira pintura do cliente o componente devolve null, e só
   depois do mount é que ele decide se aparece. O custo é um frame; o benefício
   é não voltar a quebrar a página inteira.

   PESO: zero dependência de CMP. O ícone vem do lucide-react, que já é
   dependência do projeto.

   ACESSIBILIDADE: `role="dialog"` + `aria-live` não combinam bem aqui (o
   banner não sequestra o foco de propósito — sequestrar foco em cookie banner
   é hostil e o visitante não consegue nem ler a política antes de decidir).
   Usamos `role="region"` com rótulo, os dois botões são alcançáveis por Tab na
   ordem natural, e o banner não bloqueia a página.
   ──────────────────────────────────────────────────────────────────────────── */
export default function ConsentBanner() {
  const [pronto, setPronto] = useState(false);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const decisao = lerConsentimento();
    // Quem JÁ decidiu antes precisa ter a decisão reaplicada a cada carga:
    // o Consent Mode nasce negado em toda página nova (ver ConsentInit), então
    // sem esta linha quem aceitou uma vez seria tratado como negado depois.
    if (decisao) aplicarConsentimento(decisao);
    else setVisivel(true);
    setPronto(true);

    // Sincroniza entre abas: decidir numa aba não pode deixar a outra
    // perguntando de novo.
    const onStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_KEY && e.newValue) setVisivel(false);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!pronto || !visivel) return null;

  function decidir(estado: "aceito" | "recusado") {
    gravarConsentimento(estado);
    setVisivel(false);
  }

  return (
    <>
      <div className="hg-consent" role="region" aria-label="Aviso de cookies">
        <span className="hg-consent-ic" aria-hidden>
          <Cookie size={20} />
        </span>
        <p className="hg-consent-tx">
          Usamos cookies para entender como o site é usado e melhorar a experiência. Você pode
          recusar — o site continua funcionando igual. Detalhes na{" "}
          <Link href="/privacidade">política de privacidade</Link>.
        </p>
        <span className="hg-consent-btns">
          <button type="button" className="hg-consent-b hg-consent-b--no" onClick={() => decidir("recusado")}>
            Recusar
          </button>
          <button type="button" className="hg-consent-b hg-consent-b--yes" onClick={() => decidir("aceito")}>
            Aceitar
          </button>
        </span>
      </div>

      {/* Estilo próprio e auto-contido: o banner aparece em TODAS as rotas,
          inclusive nas que não carregam os tokens de `.cl` (admin, por
          exemplo). Depender de var(--brand) aqui deixaria o botão invisível
          fora da rota clara. Cores literais da paleta de propósito.
          Sem crase nos comentarios: isto vive dentro de template literal. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hg-consent{position:fixed;z-index:70;left:max(16px,env(safe-area-inset-left));right:max(16px,env(safe-area-inset-right));bottom:calc(16px + env(safe-area-inset-bottom));max-width:760px;margin-inline:auto;display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:16px 18px;border-radius:16px;background:#FFFFFF;border:1px solid #E3E7EF;box-shadow:0 18px 48px -18px rgba(11,18,32,.28),0 2px 8px rgba(11,18,32,.06);animation:hg-consent-in .38s cubic-bezier(.2,.6,.2,1) both}
        @keyframes hg-consent-in{from{opacity:0;transform:translateY(14px)}}
        .hg-consent-ic{flex-shrink:0;width:38px;height:38px;border-radius:11px;display:inline-flex;align-items:center;justify-content:center;color:#1550E8;background:rgba(21,80,232,.09)}
        .hg-consent-tx{flex:1;min-width:220px;margin:0;font:400 14px/1.55 var(--font-sans,system-ui,sans-serif);color:#3E4A61}
        .hg-consent-tx a{color:#1550E8;font-weight:600;text-decoration:underline;text-underline-offset:2px}
        .hg-consent-btns{display:flex;gap:9px;flex-shrink:0}
        .hg-consent-b{min-height:44px;padding:0 18px;border-radius:11px;font:600 14px var(--font-sans,system-ui,sans-serif);border:1px solid transparent;cursor:pointer;transition:background .2s,border-color .2s,color .2s,transform .2s}
        .hg-consent-b:active{transform:scale(.985)}
        .hg-consent-b--no{background:#fff;color:#3E4A61;border-color:#E3E7EF}
        .hg-consent-b--no:hover{border-color:#C7CFDE;color:#0B1220}
        .hg-consent-b--yes{background:#1550E8;color:#fff}
        .hg-consent-b--yes:hover{background:#0F3CB5}
        .hg-consent-b:focus-visible{outline:2px solid #1550E8;outline-offset:3px}
        /* No celular os dois botoes ocupam a linha inteira, lado a lado: alvo
           de toque generoso e nenhum deles escondido abaixo da dobra do card. */
        @media(max-width:560px){
          .hg-consent{gap:12px;padding:14px 15px}
          .hg-consent-btns{width:100%}
          .hg-consent-b{flex:1}
        }
        @media(prefers-reduced-motion:reduce){.hg-consent{animation:none}}
      ` }} />
    </>
  );
}

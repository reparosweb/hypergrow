import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { IaCompatBadge } from "./IaCompatBadge";

/* ─────────────────────────────────────────────────────────────────────────────
   DESTAQUE "SHOP DE PROMPT IA" na home — pedido do dono (2026-08-16): um bloco
   em destaque logo abaixo do banner principal, apontando para a biblioteca de
   prompts (a ferramenta grátis /ferramentas/biblioteca-prompts-imagens-ia).

   É uma FAIXA de destaque, não uma seção de conteúdo longa: um card só, com o
   selo "funciona com ChatGPT e Claude" (glifos próprios, não os logos oficiais
   de terceiros — ver IaCompatBadge.tsx) e um botão para abrir a ferramenta.

   Fundo escuro de propósito: fica logo abaixo do hero (também escuro) e antes da
   primeira seção clara — a faixa escura costura a transição em vez de cortar
   seco de preto para branco, e dá o contraste que "destaque" pede.
   ──────────────────────────────────────────────────────────────────────────── */

const URL_SHOP = "/ferramentas/biblioteca-prompts-imagens-ia";

export default function ClaroShopPrompt() {
  return (
    <section className="sec cl-shop-sec" aria-labelledby="cl-shop-t">
      <div className="wrap">
        <div className="cl-shop lit">
          <div className="cl-shop-body">
            <span className="cl-shop-kicker">
              <Sparkles size={13} aria-hidden /> Novo · grátis
            </span>
            <h2 className="cl-shop-h" id="cl-shop-t">Shop de Prompt IA</h2>
            <p className="cl-shop-p">
              Uma biblioteca de prompts prontos para gerar imagens com IA — foto de
              produto, post, anúncio, marca e mais. Escolha, copie e cole no seu gerador.
            </p>
            <IaCompatBadge className="cl-shop-compat" />
          </div>

          <div className="cl-shop-cta">
            <Link href={URL_SHOP} className="btn btn-p cl-shop-btn">
              Abrir o Shop de Prompt IA <ArrowRight size={17} aria-hidden />
            </Link>
            <span className="cl-shop-note">Sem cadastro · sem limite de uso</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .cl .cl-shop-sec{background:#0D1013;padding-top:clamp(40px,5vw,64px);padding-bottom:clamp(40px,5vw,64px)}
        .cl .cl-shop{--acc:#7DA8FF;--beam:#7DA8FF;position:relative;display:flex;align-items:center;justify-content:space-between;gap:clamp(22px,4vw,48px);flex-wrap:wrap;
          padding:clamp(26px,3.4vw,40px);border-radius:22px;
          border:1px solid rgba(232,238,247,.12);
          background:radial-gradient(120% 140% at 0% 0%,rgba(21,80,232,.28),transparent 60%),linear-gradient(180deg,#141922,#0F131A)}
        .cl .cl-shop-body{min-width:0;flex:1 1 min(100%,420px)}
        .cl .cl-shop-kicker{display:inline-flex;align-items:center;gap:7px;font:600 11px var(--font-mono);letter-spacing:.16em;text-transform:uppercase;color:#7DA8FF;
          padding:6px 12px;border-radius:999px;border:1px solid rgba(125,168,255,.3);background:rgba(125,168,255,.1)}
        .cl .cl-shop-h{font:800 clamp(26px,3.4vw,40px)/1.05 var(--font-display);letter-spacing:-.035em;color:#fff;margin:16px 0 0}
        .cl .cl-shop-p{font:400 clamp(15px,1.4vw,16.5px)/1.6 var(--font-sans);color:rgba(232,238,247,.72);margin:12px 0 0;max-width:52ch;text-wrap:pretty}
        /* selo de compatibilidade: no fundo escuro os tokens claros do IaCompatBadge
           precisam de override — as pílulas viram vidro escuro, o texto vira claro. */
        .cl .cl-shop-compat{margin-top:20px}
        .cl .cl-shop-compat .ia-compat-l{color:rgba(232,238,247,.5)}
        .cl .cl-shop-compat .ia-compat-t{color:#fff;background:rgba(232,238,247,.06);border-color:rgba(232,238,247,.16)}
        .cl .cl-shop-compat .ia-compat-t svg{color:#7DA8FF}
        .cl .cl-shop-compat .ia-compat-dot{color:rgba(232,238,247,.4)}
        .cl .cl-shop-cta{display:flex;flex-direction:column;align-items:flex-start;gap:12px;flex-shrink:0}
        .cl .cl-shop-btn{white-space:nowrap}
        .cl .cl-shop-note{font:400 12.5px var(--font-sans);color:rgba(232,238,247,.5)}
        @media(max-width:640px){
          .cl .cl-shop-cta{width:100%}
          .cl .cl-shop-btn{width:100%}
        }
      ` }} />
    </section>
  );
}

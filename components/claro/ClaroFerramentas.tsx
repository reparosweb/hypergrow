import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { FERRAMENTAS } from "@/lib/ferramentas";

/* ─────────────────────────────────────────────────────────────────────────────
   DESTAQUE "FERRAMENTAS GRÁTIS" na home — pedido do dono (2026-08-16): um bloco
   em grande destaque apontando para a página /ferramentas, com foto de contexto
   e um CTA claro.

   Server component: só dados e link, nenhum estado. A contagem sai de
   FERRAMENTAS.length (nunca escrita à mão) — ferramenta nova entra no catálogo
   e este número acompanha sozinho, sem o site mentir "9 ferramentas" quando já
   são 10.

   Faixa escura de propósito: fica entre duas seções CLARAS (Diagnóstico e
   Clientes) e tem fundo PRÓPRIO, então não participa da alternância
   --paper/--paper-2 das vizinhas (mesmo princípio de ClaroCaptura e
   ClaroShopPrompt). Isso dá o contraste que "grande destaque" pede e evita
   recolorir as seções seguintes.

   Foto: fotografia real (StockSnap, CC0 1.0 — uso comercial liberado, créditos
   em public/fotos/CREDITOS.json). painel-resultados.webp mostra um painel de
   métricas num notebook: contexto de "ferramenta que mede/calcula", que é
   exatamente o que o catálogo grátis faz (ROAS, preço, SERP, UTM...). Não é
   "nossa equipe" — é cena ilustrativa de uso, a mesma regra do resto do site.
   ──────────────────────────────────────────────────────────────────────────── */

export default function ClaroFerramentas() {
  const total = FERRAMENTAS.length;

  return (
    <section className="sec cl-tools-sec" aria-labelledby="cl-tools-t">
      <div className="wrap">
        <div className="cl-tools lit">
          <div className="cl-tools-fig" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fotos/painel-resultados.webp"
              alt=""
              width={960}
              height={640}
              loading="lazy"
              decoding="async"
            />
            <span className="cl-tools-fig-glow" />
          </div>

          <div className="cl-tools-body">
            <span className="cl-tools-kicker">
              <Wrench size={13} aria-hidden /> {total} ferramentas grátis
            </span>
            <h2 className="cl-tools-h" id="cl-tools-t">
              Ferramentas que resolvem<br />na hora — de graça
            </h2>
            <p className="cl-tools-p">
              Calculadora de preço e de ROAS, gerador de QR Code e de link do WhatsApp,
              simulador do Google, biblioteca de prompts e mais. Abrem, funcionam e não
              pedem nada em troca.
            </p>

            <div className="cl-tools-cta">
              <Link href="/ferramentas" className="btn btn-p cl-tools-btn">
                Ver todas as ferramentas grátis <ArrowRight size={17} aria-hidden />
              </Link>
              <span className="cl-tools-note">Sem cadastro · sem limite de uso</span>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .cl .cl-tools-sec{background:#0D1013;padding-top:clamp(48px,6vw,80px);padding-bottom:clamp(48px,6vw,80px)}
        .cl .cl-tools{--acc:#7DA8FF;--beam:#7DA8FF;position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,4vw,52px);align-items:center;
          padding:clamp(22px,3vw,36px);border-radius:24px;
          border:1px solid rgba(232,238,247,.12);
          background:radial-gradient(120% 140% at 100% 0%,rgba(21,80,232,.26),transparent 58%),linear-gradient(180deg,#141922,#0F131A)}
        /* moldura da foto */
        .cl .cl-tools-fig{position:relative;min-width:0;border-radius:16px;overflow:hidden;border:1px solid rgba(232,238,247,.14);
          box-shadow:0 24px 60px -30px rgba(0,0,0,.8);aspect-ratio:16/11}
        .cl .cl-tools-fig img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 45%}
        /* brilho de marca sobre a foto, canto superior — dá coesão com o card */
        .cl .cl-tools-fig-glow{position:absolute;inset:0;pointer-events:none;
          background:radial-gradient(90% 70% at 100% 0%,rgba(21,80,232,.28),transparent 60%),
                     linear-gradient(180deg,transparent 55%,rgba(13,16,19,.5))}
        .cl .cl-tools-body{min-width:0}
        .cl .cl-tools-kicker{display:inline-flex;align-items:center;gap:7px;font:600 11px var(--font-mono);letter-spacing:.16em;text-transform:uppercase;color:#7DA8FF;
          padding:6px 12px;border-radius:999px;border:1px solid rgba(125,168,255,.3);background:rgba(125,168,255,.1)}
        .cl .cl-tools-h{font:800 clamp(27px,3.6vw,42px)/1.05 var(--font-display);letter-spacing:-.035em;color:#fff;margin:16px 0 0;text-wrap:balance}
        .cl .cl-tools-p{font:400 clamp(15px,1.4vw,16.5px)/1.62 var(--font-sans);color:rgba(232,238,247,.72);margin:14px 0 0;max-width:52ch;text-wrap:pretty}
        .cl .cl-tools-cta{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:26px}
        .cl .cl-tools-btn{white-space:nowrap}
        .cl .cl-tools-note{font:400 12.5px var(--font-sans);color:rgba(232,238,247,.5)}
        /* MD: empilha, foto em cima */
        @media(max-width:820px){
          .cl .cl-tools{grid-template-columns:1fr}
          .cl .cl-tools-fig{aspect-ratio:16/9}
        }
        @media(max-width:520px){
          .cl .cl-tools-cta{width:100%}
          .cl .cl-tools-btn{width:100%;justify-content:center}
        }
      ` }} />
    </section>
  );
}

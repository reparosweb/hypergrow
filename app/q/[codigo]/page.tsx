import "../../claro-tokens.css";
import { headers } from "next/headers";
import { gerarQr, qrParaCaminhoSvg, qrLadoTotal } from "@/lib/qrcode";
import { getServerSupabase } from "@/lib/supabase";
import { BotaoCopiar, BotaoSalvarContato } from "@/components/hyper-qrcode/AcoesInterstitial";

/* ─────────────────────────────────────────────────────────────────────────────
   /q/{codigo} — a página pública do Hyper QR Code.

   Só é alcançada pelos tipos INTERSTITIAL (pix/wifi/vcard/texto) — os
   redirecionáveis (link/whatsapp/instagram/pdf) já saem direto no
   `middleware.ts`, nunca chegam aqui. E pelo caso "não encontrado/pausado".

   Página standalone de propósito (sem o header/rodapé do site): quem chega
   aqui veio de um scan físico de QR Code, não de navegação — velocidade e
   foco importam mais que o chrome do site institucional.

   Server Component: busca os dados no servidor (chave anônima, mesma RPC
   `hqr_buscar_qrcode_publico` que o middleware usa — nunca lista/consulta a
   tabela hqr_qrcodes direto, só por essa função, ver comentário de segurança
   na migration 009_hyper_qrcode.sql). Registra o scan aqui mesmo, já que o
   middleware deixou passar sem registrar (só ele sabe que chegou nesta
   página e não foi redirecionado). ──────────────────────────────────────── */

type HqrTipo = "link" | "whatsapp" | "pix" | "wifi" | "vcard" | "pdf" | "texto" | "instagram";

type HqrConteudoPublico = {
  id: string;
  tipo: HqrTipo;
  titulo: string;
  conteudo: Record<string, unknown>;
  cor_frente: string;
  cor_fundo: string;
  logo_url: string | null;
};

async function buscarQrCode(codigo: string): Promise<HqrConteudoPublico | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("hqr_buscar_qrcode_publico", { p_codigo: codigo });
  if (error || !data || !Array.isArray(data) || data.length === 0) return null;
  return data[0] as HqrConteudoPublico;
}

async function registrarScan(codigo: string) {
  const supabase = getServerSupabase();
  if (!supabase) return;
  const h = headers();
  const pais = h.get("x-vercel-ip-country") || null;
  const cidade = h.get("x-vercel-ip-city") || null;
  const ua = (h.get("user-agent") || "").toLowerCase();
  const dispositivo = /mobile|android|iphone/.test(ua) ? "mobile" : /tablet|ipad/.test(ua) ? "tablet" : ua ? "desktop" : "outro";
  let refererHost: string | null = null;
  try {
    const ref = h.get("referer");
    refererHost = ref ? new URL(ref).host : null;
  } catch {
    refererHost = null;
  }
  // Fogo-e-esquece: um scan não registrado é aceitável, a página nunca pode
  // travar esperando isso.
  void supabase
    .rpc("hqr_registrar_scan", { p_codigo: codigo, p_pais: pais, p_cidade: cidade, p_dispositivo: dispositivo, p_referer_host: refererHost })
    .then(() => {});
}

function TelaNaoEncontrado() {
  return (
    <main className="cl hqr-tela">
      <div className="hqr-card">
        <h1 className="hqr-h1">QR Code não encontrado</h1>
        <p className="hqr-p">
          Esse código não existe, foi apagado, ou está pausado no momento pelo dono. Se você é o
          dono deste QR Code, entre no seu painel para reativar.
        </p>
      </div>
      <style dangerouslySetInnerHTML={{ __html: HQR_CSS }} />
    </main>
  );
}

export default async function PaginaQrCode({ params }: { params: { codigo: string } }) {
  const qr = await buscarQrCode(params.codigo);
  if (!qr) return <TelaNaoEncontrado />;

  void registrarScan(params.codigo);

  const c = qr.conteudo || {};

  return (
    <main className="cl hqr-tela">
      <div className="hqr-card">
        <p className="hqr-kicker">{qr.titulo}</p>

        {qr.tipo === "pix" && typeof c.codigoCopiaECola === "string" && (
          <>
            <h1 className="hqr-h1">Pagar com Pix</h1>
            {(() => {
              const desenho = gerarQr(c.codigoCopiaECola as string, "M");
              if (!desenho) return null;
              const lado = qrLadoTotal(desenho);
              return (
                <svg viewBox={`0 0 ${lado} ${lado}`} className="hqr-qr-preview" role="img" aria-label="QR Code do Pix">
                  <rect width={lado} height={lado} fill="#ffffff" />
                  <path d={qrParaCaminhoSvg(desenho)} fill="#0B1220" />
                </svg>
              );
            })()}
            <p className="hqr-p">Escaneie com o app do seu banco, ou copie o código abaixo:</p>
            <code className="hqr-codigo">{c.codigoCopiaECola as string}</code>
            <BotaoCopiar texto={c.codigoCopiaECola as string} rotulo="Copiar código Pix" />
          </>
        )}

        {qr.tipo === "wifi" && typeof c.ssid === "string" && (
          <>
            <h1 className="hqr-h1">Conectar ao Wi-Fi</h1>
            <p className="hqr-p">Toque para copiar e cole nas configurações de Wi-Fi do seu aparelho.</p>
            <div className="hqr-campo">
              <span className="hqr-campo-l">Rede</span>
              <strong>{c.ssid as string}</strong>
            </div>
            {typeof c.senha === "string" && c.senha && (
              <div className="hqr-campo">
                <span className="hqr-campo-l">Senha</span>
                <strong>{c.senha}</strong>
              </div>
            )}
            <BotaoCopiar texto={(c.senha as string) || (c.ssid as string)} rotulo="Copiar senha" />
          </>
        )}

        {qr.tipo === "vcard" && typeof c.nome === "string" && (
          <>
            <h1 className="hqr-h1">{c.nome as string}</h1>
            {typeof c.cargo === "string" && c.cargo && <p className="hqr-p">{c.cargo as string}</p>}
            {typeof c.telefone === "string" && c.telefone && <p className="hqr-p">📞 {c.telefone as string}</p>}
            {typeof c.email === "string" && c.email && <p className="hqr-p">✉️ {c.email as string}</p>}
            <BotaoSalvarContato
              nome={c.nome as string}
              telefone={typeof c.telefone === "string" ? c.telefone : undefined}
              email={typeof c.email === "string" ? c.email : undefined}
              empresa={typeof c.empresa === "string" ? c.empresa : undefined}
            />
          </>
        )}

        {qr.tipo === "texto" && typeof c.texto === "string" && (
          <>
            <h1 className="hqr-h1">{qr.titulo}</h1>
            <p className="hqr-p hqr-p-texto">{c.texto as string}</p>
          </>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: HQR_CSS }} />
    </main>
  );
}

/* Estilo mínimo e isolado — não depende de nenhuma classe do resto do site
   além dos tokens de cor (`app/claro-tokens.css`, já importado no topo). */
const HQR_CSS = `
  .cl.hqr-tela{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--paper)}
  .hqr-card{width:100%;max-width:420px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:28px;box-shadow:var(--sh-2);text-align:center}
  .hqr-kicker{font:600 11px var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);margin:0 0 10px}
  .hqr-h1{font:800 clamp(22px,5vw,28px)/1.2 var(--font-display);color:var(--ink);margin:0 0 12px}
  .hqr-p{font:400 15px/1.5 var(--font-sans);color:var(--ink-2);margin:0 0 16px}
  .hqr-p-texto{white-space:pre-wrap;text-align:left}
  .hqr-qr-preview{width:100%;max-width:220px;margin:0 auto 16px;display:block;border-radius:10px;border:1px solid var(--line)}
  .hqr-codigo{display:block;width:100%;word-break:break-all;font:400 12px/1.5 var(--font-mono);background:var(--paper-2);border:1px solid var(--line);border-radius:10px;padding:12px;margin-bottom:14px;color:var(--ink-2)}
  .hqr-campo{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--line-2);text-align:left}
  .hqr-campo-l{color:var(--ink-3);font:400 13px var(--font-sans)}
  .hqr-btn{display:inline-flex;align-items:center;justify-content:center;width:100%;min-height:48px;border-radius:12px;font:600 15px var(--font-sans);cursor:pointer;border:none;margin-top:8px;transition:transform .2s var(--ease),box-shadow .2s var(--ease)}
  .hqr-btn-p{background:var(--brand);color:#fff}
  .hqr-btn-p:hover{transform:translateY(-2px);box-shadow:var(--sh-2)}
`;

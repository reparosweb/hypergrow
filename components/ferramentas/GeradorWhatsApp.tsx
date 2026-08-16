"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { gerarQr, qrParaCaminhoSvg, qrLadoTotal } from "@/lib/qrcode";
import { EVENTOS, rastrear } from "@/lib/track";

/* ─────────────────────────────────────────────────────────────────────────────
   GERADOR DE LINK + QR CODE DO WHATSAPP — 100% no navegador.

   Nada aqui vai para servidor: sem rota de API, sem formulário de captura, sem
   pedágio de e-mail. O link é montado no próprio aparelho de quem usa.

   O FORMATO CERTO DO LINK (é onde quase todo gerador erra):
   https://wa.me/<DDI><DDD><NUMERO>?text=<mensagem codificada>
   · SEM "+", SEM parêntese, SEM traço e SEM espaço no número — só dígitos;
   · a mensagem passa por encodeURIComponent, senão acento, "&" e quebra de
     linha cortam o texto no meio;
   · quando não há mensagem, o "?text=" não entra (link mais curto e QR menos
     denso).
   ──────────────────────────────────────────────────────────────────────────── */

/* DDDs que existem no Brasil (plano de numeração da Anatel). Serve para pegar
   erro de digitação — DDD 20, 23, 25, 26, 29, 30, 36, 39, 40, 50, 52, 56-60,
   70, 72, 76, 78, 80 e 90 não existem, e um link com eles nunca vai abrir. */
const DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

const MODELOS: [string, string][] = [
  ["Orçamento", "Olá! Vim pelo site e queria um orçamento."],
  ["Dúvida", "Olá! Tenho uma dúvida sobre o produto e queria falar com alguém."],
  ["Carrinho parado", "Oi! Vi que ficaram itens no seu carrinho. Posso ajudar a finalizar?"],
  ["Agendar horário", "Olá! Gostaria de agendar um horário. Quais os dias disponíveis?"],
  ["Pós-venda", "Oi! Passando para saber se está tudo certo com o seu pedido."],
];

function mascaraBr(digitos: string): string {
  const d = digitos.slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return "(" + d;
  if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
  if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
  return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
}

function Icone({ nome }: { nome: "copiar" | "ok" | "baixar" | "abrir" | "alerta" }) {
  const comum = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;
  if (nome === "ok")
    return (<svg {...comum}><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  if (nome === "baixar")
    return (<svg {...comum}><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  if (nome === "abrir")
    return (<svg {...comum}><path d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  if (nome === "alerta")
    return (<svg {...comum}><path d="M12 8v5m0 3.5h.01M10.3 3.9 2.6 17.2A1.9 1.9 0 0 0 4.3 20h15.4a1.9 1.9 0 0 0 1.7-2.8L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  return (<svg {...comum}><rect x="9" y="9" width="12" height="12" rx="2.4" stroke="currentColor" strokeWidth="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>);
}

export default function GeradorWhatsApp() {
  const [ddi, setDdi] = useState("55");
  const [fone, setFone] = useState("");
  const [msg, setMsg] = useState("");
  const [copiado, setCopiado] = useState(false);
  const tempo = useRef<ReturnType<typeof setTimeout> | null>(null);

  const digitos = fone.replace(/\D/g, "");
  const ddiLimpo = ddi.replace(/\D/g, "");
  const ehBrasil = ddiLimpo === "55";
  const ddd = digitos.slice(0, 2);

  /* Diagnóstico do número. `bloqueia` = não dá para montar link nenhum;
     `avisa` = o link sai, mas provavelmente não é o que a pessoa quis. */
  const diagnostico = useMemo(() => {
    if (!digitos) return { bloqueia: true, tipo: "vazio" as const, texto: "" };
    if (!ddiLimpo) return { bloqueia: true, tipo: "erro" as const, texto: "Informe o DDI do país (Brasil é 55)." };
    if (ehBrasil) {
      if (digitos.length < 10)
        return { bloqueia: true, tipo: "erro" as const, texto: "Faltam dígitos: no Brasil são 10 (fixo) ou 11 (celular), contando o DDD." };
      if (!DDDS.has(Number(ddd)))
        return { bloqueia: true, tipo: "erro" as const, texto: "O DDD " + ddd + " não existe no Brasil. Confira os dois primeiros dígitos." };
      if (digitos.length === 11 && digitos[2] !== "9")
        return { bloqueia: false, tipo: "aviso" as const, texto: "Número de 11 dígitos que não começa com 9 depois do DDD. Celular no Brasil começa com 9 — confira antes de divulgar." };
      if (digitos.length === 10)
        return { bloqueia: false, tipo: "aviso" as const, texto: "10 dígitos costuma ser telefone fixo. O WhatsApp funciona em fixo só se a conta foi ativada nele — teste o link antes de divulgar." };
      return { bloqueia: false, tipo: "ok" as const, texto: "Número válido: celular com DDD " + ddd + "." };
    }
    if (digitos.length < 6)
      return { bloqueia: true, tipo: "erro" as const, texto: "Número curto demais para um telefone internacional." };
    return { bloqueia: false, tipo: "ok" as const, texto: "Número internacional (DDI " + ddiLimpo + ") — sem 0 na frente e sem o código de operadora." };
  }, [digitos, ddiLimpo, ehBrasil, ddd]);

  const link = useMemo(() => {
    if (diagnostico.bloqueia) return "";
    const base = "https://wa.me/" + ddiLimpo + digitos;
    return msg.trim() ? base + "?text=" + encodeURIComponent(msg) : base;
  }, [diagnostico.bloqueia, ddiLimpo, digitos, msg]);

  const qr = useMemo(() => (link ? gerarQr(link, "M") : null), [link]);

  const copiar = useCallback(async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* Safari antigo e página sem HTTPS não têm clipboard: cai no caminho velho. */
      const area = document.createElement("textarea");
      area.value = link;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try { document.execCommand("copy"); } catch { /* sem o que fazer: o link continua visível na tela para copiar à mão */ }
      document.body.removeChild(area);
    }
    setCopiado(true);
    rastrear(EVENTOS.ferramentaUso, { ferramenta: "gerador-link-whatsapp", acao: "copiar" });
    if (tempo.current) clearTimeout(tempo.current);
    tempo.current = setTimeout(() => setCopiado(false), 2200);
  }, [link]);

  const baixar = useCallback((formato: "png" | "svg") => {
    if (!qr) return;
    const borda = 4;
    const lado = qrLadoTotal(qr, borda);
    const nome = "qrcode-whatsapp-" + ddiLimpo + digitos + "." + formato;

    if (formato === "svg") {
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + lado + " " + lado + '" width="1024" height="1024" shape-rendering="crispEdges">' +
        '<rect width="' + lado + '" height="' + lado + '" fill="#ffffff"/>' +
        '<path d="' + qrParaCaminhoSvg(qr, borda) + '" fill="#000000"/></svg>';
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = nome;
      a.click();
      URL.revokeObjectURL(url);
      rastrear(EVENTOS.ferramentaUso, { ferramenta: "gerador-link-whatsapp", acao: "baixar_svg" });
      return;
    }

    /* PNG desenhado módulo a módulo — sem passar por SVG, que sujaria o canvas
       em alguns navegadores e faria o toDataURL falhar. Escala calculada para
       o arquivo sair com ~1 000 px, tamanho que aguenta impressão em balcão. */
    const escala = Math.max(4, Math.ceil(1000 / lado));
    const canvas = document.createElement("canvas");
    canvas.width = lado * escala;
    canvas.height = lado * escala;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    for (let y = 0; y < qr.tamanho; y++) {
      for (let x = 0; x < qr.tamanho; x++) {
        if (qr.matriz[y][x]) ctx.fillRect((x + borda) * escala, (y + borda) * escala, escala, escala);
      }
    }
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nome;
      a.click();
      URL.revokeObjectURL(url);
      rastrear(EVENTOS.ferramentaUso, { ferramenta: "gerador-link-whatsapp", acao: "baixar_png" });
    }, "image/png");
  }, [qr, ddiLimpo, digitos]);

  const classeAlerta =
    diagnostico.tipo === "erro" ? "bad" : diagnostico.tipo === "aviso" ? "warn" : "ok";

  return (
    <div className="ft-lay">
      {/* Faixa que acompanha a rolagem NO CELULAR: o link fica sempre à mão,
          com o botão de copiar, em vez de esperar a pessoa rolar até o fim do
          formulário para descobrir se deu certo. Some no desktop, onde o
          resultado já mora na coluna da direita. */}
      <div className="ft-live">
        <span className="ft-live-i ft-live-grow">
          <span className="ft-live-k">Seu link</span>
          {link ? (
            <span className="ft-live-link">{link}</span>
          ) : (
            <span className="ft-live-link" style={{ color: "rgba(255,255,255,.66)", fontWeight: 500 }}>
              preencha o telefone
            </span>
          )}
        </span>
        {link && (
          <button type="button" className={copiado ? "ft-mini on" : "ft-mini"} onClick={copiar}>
            <Icone nome={copiado ? "ok" : "copiar"} />
            {copiado ? "Copiado" : "Copiar"}
          </button>
        )}
      </div>

      {/* ── coluna 1: os campos ─────────────────────────────────────────── */}
      <div>
        <div className="ft-card">
          <p className="ft-h">Dados do seu WhatsApp</p>
          <p className="ft-sub">
            O link é montado aqui no seu aparelho enquanto você digita. Nada é enviado para
            nenhum servidor — nem o número, nem a mensagem.
          </p>

          <div className="ft-fields">
            <div className="ft-f" style={{ maxWidth: 110 }}>
              <label className="ft-lbl" htmlFor="ft-ddi">DDI do país</label>
              <div className="ft-inwrap">
                <span className="ft-pre" aria-hidden>+</span>
                <input
                  id="ft-ddi"
                  className="ft-in pre"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={ddi}
                  onChange={(e) => setDdi(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>

            <div className="ft-f" style={{ flex: "1 1 200px" }}>
              <label className="ft-lbl" htmlFor="ft-fone">
                {ehBrasil ? "Telefone com DDD" : "Telefone (só números)"}
              </label>
              <input
                id="ft-fone"
                className="ft-in"
                type="text"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder={ehBrasil ? "(11) 91234-5678" : "1234567890"}
                value={ehBrasil ? mascaraBr(digitos) : digitos}
                onChange={(e) => setFone(e.target.value)}
                aria-describedby="ft-fone-diag"
              />
            </div>

            <div className="ft-f ft-full">
              <label className="ft-lbl" htmlFor="ft-msg">
                Mensagem que já vem digitada <span style={{ fontWeight: 400, color: "#5A6579" }}>(opcional)</span>
              </label>
              <textarea
                id="ft-msg"
                className="ft-in"
                value={msg}
                maxLength={1000}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Olá! Vim pelo site e queria um orçamento."
              />
              <span className="ft-hint">
                {msg.length}/1000 caracteres. Quem clicar já encontra esse texto escrito — é só apertar enviar.
              </span>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <p className="ft-lbl" style={{ marginBottom: 9 }}>Modelos prontos</p>
            <div className="ft-chips">
              {MODELOS.map(([rotulo, texto]) => (
                <button
                  key={rotulo}
                  type="button"
                  className="ft-chip"
                  aria-pressed={msg === texto}
                  onClick={() => setMsg(msg === texto ? "" : texto)}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </div>

          {diagnostico.texto && (
            <div className={"ft-alert " + classeAlerta} id="ft-fone-diag" role="status">
              {diagnostico.tipo !== "ok" && <Icone nome="alerta" />}
              {diagnostico.tipo === "ok" && <Icone nome="ok" />}
              <span>{diagnostico.texto}</span>
            </div>
          )}
        </div>

        <div className="ft-card">
          <p className="ft-h">Onde usar esse link</p>
          <ul className="ft-sub" style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 7 }}>
            <li>No botão &ldquo;Fale conosco&rdquo; do site — a conversa já abre com o assunto escrito.</li>
            <li>Na bio do Instagram e do TikTok, onde só cabe um link.</li>
            <li>Como QR impresso no balcão, na vitrine, na embalagem ou no cartão.</li>
            <li>No anúncio pago: cada campanha com uma mensagem diferente mostra qual delas traz conversa.</li>
          </ul>
        </div>
      </div>

      {/* ── coluna 2: o resultado ───────────────────────────────────────── */}
      <div className="ft-sticky">
        <div className="ft-res">
          <p className="ft-res-k">Seu link</p>
          {link ? (
            <>
              <code className="ft-out" style={{ background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.28)", color: "#fff" }}>
                {link}
              </code>
              <div className="ft-acts">
                <button type="button" className={copiado ? "ft-mini on" : "ft-mini"} onClick={copiar} style={{ flex: "1 1 auto" }}>
                  <Icone nome={copiado ? "ok" : "copiar"} />
                  {copiado ? "Copiado!" : "Copiar link"}
                </button>
                <a className="ft-mini" href={link} target="_blank" rel="noopener noreferrer" style={{ flex: "1 1 auto" }}
                  onClick={() => rastrear(EVENTOS.ferramentaUso, { ferramenta: "gerador-link-whatsapp", acao: "testar_link" })}>
                  <Icone nome="abrir" />
                  Testar agora
                </a>
              </div>
              <p aria-live="polite" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                {copiado ? "Link copiado para a área de transferência" : ""}
              </p>
            </>
          ) : (
            <p className="ft-res-sub" style={{ margin: 0 }}>
              Digite o telefone ao lado e o link aparece aqui na hora, pronto para copiar.
            </p>
          )}
        </div>

        {qr && (
          <div className="ft-card" style={{ marginTop: 16 }}>
            <p className="ft-h">QR Code do mesmo link</p>
            <p className="ft-sub">
              Aponte a câmera do celular para conferir antes de imprimir. Ele abre a conversa
              {msg.trim() ? " já com a mensagem escrita." : "."}
            </p>
            <div className="ft-qr-wrap">
              <div className="ft-qr">
                <svg
                  viewBox={"0 0 " + qrLadoTotal(qr) + " " + qrLadoTotal(qr)}
                  role="img"
                  aria-label={"QR Code que abre a conversa no WhatsApp com o número " + (ehBrasil ? mascaraBr(digitos) : digitos)}
                  shapeRendering="crispEdges"
                >
                  <rect width={qrLadoTotal(qr)} height={qrLadoTotal(qr)} fill="#ffffff" />
                  <path d={qrParaCaminhoSvg(qr)} fill="#0B1220" />
                </svg>
              </div>
              <div className="ft-acts" style={{ marginTop: 0, width: "100%" }}>
                <button type="button" className="ft-mini" onClick={() => baixar("png")} style={{ flex: "1 1 auto" }}>
                  <Icone nome="baixar" />
                  Baixar PNG
                </button>
                <button type="button" className="ft-mini" onClick={() => baixar("svg")} style={{ flex: "1 1 auto" }}>
                  <Icone nome="baixar" />
                  Baixar SVG
                </button>
              </div>
            </div>
            <p className="ft-hint" style={{ marginTop: 12 }}>
              PNG sai com cerca de 1 000 px (serve para post e para impressão pequena). SVG é
              vetor: não perde qualidade em banner, fachada ou adesivo grande.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

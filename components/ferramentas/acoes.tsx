"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { qrParaCaminhoSvg, qrLadoTotal, type QrCode } from "@/lib/qrcode";

/* ─────────────────────────────────────────────────────────────────────────────
   AÇÕES DE SAÍDA DAS FERRAMENTAS — copiar e baixar, no navegador.

   Estava tudo repetido dentro de `GeradorWhatsApp.tsx`. Com quatro ferramentas
   novas fazendo a mesma coisa, o caminho alternativo do clipboard (Safari
   antigo e página sem HTTPS) seria copiado cinco vezes e divergiria na
   primeira correção. Aqui ele existe uma vez só.

   NADA AQUI TOCA SERVIDOR: `Blob` + `URL.createObjectURL` + `<a download>`
   geram o arquivo na memória do próprio aparelho. Nenhuma rota de API, nenhum
   upload — é o que permite estas páginas continuarem 100% estáticas (a Vercel
   no plano Hobby aceita 12 funções serverless e o site já usa 9).
   ──────────────────────────────────────────────────────────────────────────── */

/** Copia texto e devolve `copiado` (volta a false sozinho depois de 2,2 s). */
export function useCopiar(): [boolean, (texto: string) => void] {
  const [copiado, setCopiado] = useState(false);
  const tempo = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (tempo.current) clearTimeout(tempo.current); }, []);

  const copiar = useCallback((texto: string) => {
    if (!texto) return;
    const marcar = () => {
      setCopiado(true);
      if (tempo.current) clearTimeout(tempo.current);
      tempo.current = setTimeout(() => setCopiado(false), 2200);
    };
    const antigo = () => {
      /* Safari antigo e página sem HTTPS não expõem navigator.clipboard. */
      const area = document.createElement("textarea");
      area.value = texto;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try { document.execCommand("copy"); } catch { /* o texto continua na tela para copiar à mão */ }
      document.body.removeChild(area);
      marcar();
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(texto).then(marcar, antigo);
    } else {
      antigo();
    }
  }, []);

  return [copiado, copiar];
}

/** Baixa um texto como arquivo (.txt, .html, .csv…). */
export function baixarTexto(conteudo: string, nomeArquivo: string, mime: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: mime + ";charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  /* setTimeout(0): o Firefox cancela o download se a URL for revogada no mesmo
     tique em que o clique acontece. */
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Baixa o QR como SVG (vetor: amplia sem serrilhar — banner, fachada, adesivo). */
export function baixarQrSvg(qr: QrCode, nomeArquivo: string, borda = 4) {
  const lado = qrLadoTotal(qr, borda);
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + lado + " " + lado + '" width="1024" height="1024" shape-rendering="crispEdges">' +
    '<rect width="' + lado + '" height="' + lado + '" fill="#ffffff"/>' +
    '<path d="' + qrParaCaminhoSvg(qr, borda) + '" fill="#000000"/></svg>';
  baixarTexto(svg, nomeArquivo, "image/svg+xml");
}

/**
 * Baixa o QR como PNG, desenhado módulo a módulo no canvas.
 *
 * POR QUE NÃO DESENHAR O SVG NO CANVAS: uma imagem SVG "suja" o canvas em
 * parte dos navegadores e o `toBlob` passa a falhar por segurança. Preenchendo
 * retângulo por retângulo o canvas continua limpo em todo lugar.
 *
 * `alvoPx` = lado aproximado do arquivo final. A escala é inteira (nunca
 * fracionária) para o módulo não sair com meia borda cinza na ampliação.
 */
export function baixarQrPng(qr: QrCode, nomeArquivo: string, borda = 4, alvoPx = 1000) {
  const lado = qrLadoTotal(qr, borda);
  const escala = Math.max(4, Math.ceil(alvoPx / lado));
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
    a.download = nomeArquivo;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, "image/png");
}

/** Ícones das ações — SVG inline (estas rotas não carregam o script do lucide). */
export type NomeIcone = "copiar" | "ok" | "baixar" | "abrir" | "alerta" | "varinha";

export function IconeAcao({ nome, tamanho = 16 }: { nome: NomeIcone; tamanho?: number }) {
  const p = { width: tamanho, height: tamanho, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;
  if (nome === "ok")
    return (<svg {...p}><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  if (nome === "baixar")
    return (<svg {...p}><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  if (nome === "abrir")
    return (<svg {...p}><path d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  if (nome === "alerta")
    return (<svg {...p}><path d="M12 8v5m0 3.5h.01M10.3 3.9 2.6 17.2A1.9 1.9 0 0 0 4.3 20h15.4a1.9 1.9 0 0 0 1.7-2.8L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  if (nome === "varinha")
    return (<svg {...p}><path d="m4 20 9.5-9.5M15 4l.7 1.9L17.6 6l-1.9.7L15 8.6l-.7-1.9L12.4 6l1.9-.7L15 4ZM19.4 11l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5.5-1.3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  return (<svg {...p}><rect x="9" y="9" width="12" height="12" rx="2.4" stroke="currentColor" strokeWidth="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>);
}

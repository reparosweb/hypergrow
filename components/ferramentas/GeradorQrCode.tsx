"use client";

import { useMemo, useState } from "react";
import { gerarQr, qrParaCaminhoSvg, qrLadoTotal, capacidadeEmBytes, type NivelEcc } from "@/lib/qrcode";
import { baixarQrPng, baixarQrSvg, useCopiar, IconeAcao } from "./acoes";

/* ─────────────────────────────────────────────────────────────────────────────
   GERADOR DE QR CODE GENÉRICO — desenhado no navegador, zero dependência.

   O motor é `lib/qrcode.ts` (implementação própria, conferida módulo a módulo
   contra a lib `qrcode` do npm nas 160 combinações versão × nível, e lida de
   volta por um decodificador real — ver o cabeçalho daquele arquivo). Aqui só
   mora o que é específico de cada TIPO de conteúdo.

   POR QUE ISTO É DIFERENTE DA MAIORIA DOS GERADORES ONLINE: eles devolvem um QR
   que aponta para um encurtador do próprio site (qrcode-xyz.com/abc123). O
   desenho é bonito e o QR morre no dia em que aquele site sair do ar, mudar de
   plano ou resolver cobrar. Aqui o QR aponta direto para o SEU conteúdo: não há
   intermediário para quebrar, e nada é enviado para servidor nenhum.

   OS QUATRO TIPOS:
   · Link — vira uma URL (https:// entra sozinho se faltar).
   · Texto — qualquer coisa, gravada literalmente.
   · PIX — o "copia e cola" que o banco gera. NUNCA é modificado: o texto é
     usado exatamente como colado, e a ferramenta só CONFERE o dígito
     verificador para pegar o erro mais comum, que é copiar pela metade.
   · Wi-Fi — o formato `WIFI:T:...;S:...;P:...;;` que Android e iPhone leem
     nativamente para entrar na rede sem digitar senha.
   ──────────────────────────────────────────────────────────────────────────── */

type Tipo = "link" | "texto" | "pix" | "wifi";
type Seguranca = "WPA" | "WEP" | "nopass";

const TIPOS: { id: Tipo; rotulo: string }[] = [
  { id: "link", rotulo: "Link" },
  { id: "texto", rotulo: "Texto" },
  { id: "pix", rotulo: "PIX" },
  { id: "wifi", rotulo: "Wi-Fi" },
];

const NIVEIS: { id: NivelEcc; rotulo: string; recupera: string; quando: string }[] = [
  { id: "L", rotulo: "L", recupera: "7%", quando: "QR grande e limpo, lido de perto. Gera o desenho menos denso." },
  { id: "M", rotulo: "M", recupera: "15%", quando: "O equilíbrio para quase tudo: tela, post, cartão, adesivo." },
  { id: "Q", rotulo: "Q", recupera: "25%", quando: "Impressão pequena, papel que amassa ou fundo com textura." },
  { id: "H", rotulo: "H", recupera: "30%", quando: "Ambiente sujo, embalagem que dobra ou logo sobreposto no meio." },
];

/**
 * CRC-16/CCITT-FALSE (polinômio 0x1021, valor inicial 0xFFFF, sem reflexão e
 * sem XOR final) — o dígito verificador que o padrão EMV do BR Code exige no
 * campo 63 do "copia e cola" do PIX.
 *
 * CONFERIDO nesta sessão contra o vetor de teste canônico do algoritmo:
 * CRC16("123456789") = 0x29B1. É a checagem padrão de qualquer implementação
 * de CRC-16/CCITT-FALSE.
 */
function crc16(texto: string): number {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i++) {
    crc ^= (texto.charCodeAt(i) & 0xff) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

type VerdictoPix =
  | { tipo: "vazio" }
  | { tipo: "nao-brcode" }
  | { tipo: "sem-crc" }
  | { tipo: "nao-ascii" }
  | { tipo: "ok" }
  | { tipo: "crc-diferente"; calculado: string; informado: string };

/**
 * Confere o BR Code SEM NUNCA alterá-lo.
 *
 * CUIDADO DELIBERADO: quando o texto tem caractere fora do ASCII (acento no
 * nome do recebedor, por exemplo), a conferência é PULADA em vez de
 * arriscada. O padrão do BR Code pede ASCII, mas há emissores que fogem disso,
 * e aí o CRC depende de qual codificação de bytes o banco usou — dizer "seu
 * código está errado" sem certeza seria pior do que não dizer nada.
 */
function conferirPix(bruto: string): VerdictoPix {
  const t = bruto.trim();
  if (!t) return { tipo: "vazio" };
  if (!t.startsWith("000201")) return { tipo: "nao-brcode" };
  const i = t.length - 8;
  if (i < 0 || t.slice(i, i + 4) !== "6304") return { tipo: "sem-crc" };
  // eslint-disable-next-line no-control-regex
  if (/[^\x00-\x7F]/.test(t)) return { tipo: "nao-ascii" };
  const calculado = crc16(t.slice(0, i + 4)).toString(16).toUpperCase().padStart(4, "0");
  const informado = t.slice(-4).toUpperCase();
  return calculado === informado ? { tipo: "ok" } : { tipo: "crc-diferente", calculado, informado };
}

/** Escapa `\ ; , : "` — os cinco caracteres que separam campos no formato Wi-Fi. */
function escaparWifi(v: string): string {
  return v.replace(/([\\;,:"])/g, "\\$1");
}

export default function GeradorQrCode() {
  const [tipo, setTipo] = useState<Tipo>("link");
  const [link, setLink] = useState("");
  const [texto, setTexto] = useState("");
  const [pix, setPix] = useState("");
  const [ssid, setSsid] = useState("");
  const [senha, setSenha] = useState("");
  const [seguranca, setSeguranca] = useState<Seguranca>("WPA");
  const [oculta, setOculta] = useState(false);
  const [nivel, setNivel] = useState<NivelEcc>("M");
  const [copiado, copiar] = useCopiar("gerador-qr-code");

  /* O texto EXATO que será gravado no QR. Fica visível na tela de propósito:
     quem imprime um QR precisa poder conferir o que está dentro dele. */
  const conteudo = useMemo(() => {
    if (tipo === "link") {
      const v = link.trim();
      if (!v) return "";
      return /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : "https://" + v;
    }
    if (tipo === "texto") return texto;
    if (tipo === "pix") return pix.trim();
    const rede = ssid.trim();
    if (!rede) return "";
    let s = "WIFI:T:" + seguranca + ";S:" + escaparWifi(rede) + ";";
    if (seguranca !== "nopass") s += "P:" + escaparWifi(senha) + ";";
    if (oculta) s += "H:true;";
    return s + ";";
  }, [tipo, link, texto, pix, ssid, senha, seguranca, oculta]);

  const bytes = useMemo(() => (conteudo ? new TextEncoder().encode(conteudo).length : 0), [conteudo]);
  const qr = useMemo(() => (conteudo ? gerarQr(conteudo, nivel) : null), [conteudo, nivel]);
  const capacidadeMax = useMemo(() => capacidadeEmBytes(40, nivel), [nivel]);
  const capacidadeAtual = qr ? capacidadeEmBytes(qr.versao, nivel) : 0;

  const verdicto = tipo === "pix" ? conferirPix(pix) : null;

  const semProtocolo = tipo === "link" && link.trim() !== "" && !/^[a-z][a-z0-9+.-]*:/i.test(link.trim());
  const linkComEspaco = tipo === "link" && /\s/.test(link.trim());

  const nomeArquivo =
    "qrcode-" + (tipo === "wifi" ? "wifi" : tipo === "pix" ? "pix" : tipo === "link" ? "link" : "texto");

  const rotuloAcessivel =
    tipo === "wifi"
      ? "QR Code que conecta na rede Wi-Fi " + (ssid.trim() || "informada")
      : tipo === "pix"
        ? "QR Code do código PIX copia e cola informado"
        : tipo === "link"
          ? "QR Code que abre o endereço " + conteudo
          : "QR Code do texto informado";

  return (
    <div className="ft-lay">
      <div className="ft-live">
        <span className="ft-live-i ft-live-grow">
          <span className="ft-live-k">Seu QR Code</span>
          <span className="ft-live-v" style={{ fontSize: 16 }}>
            {qr
              ? "pronto · versão " + qr.versao + " · " + qr.tamanho + " x " + qr.tamanho + " módulos"
              : conteudo
                ? "não cabe neste nível"
                : "preencha ao lado"}
          </span>
        </span>
        {qr && (
          <button type="button" className="ft-mini" onClick={() => baixarQrPng(qr, nomeArquivo + ".png", 4, 1000, "gerador-qr-code")}>
            <IconeAcao nome="baixar" />
            PNG
          </button>
        )}
      </div>

      {/* ── coluna 1: o conteúdo ────────────────────────────────────────── */}
      <div>
        <div className="ft-card">
          <p className="ft-h">O que vai dentro do QR Code</p>
          <p className="ft-sub">
            O desenho é feito aqui no seu aparelho e aponta direto para o seu conteúdo — sem
            encurtador no meio, sem link intermediário que pode sair do ar e sem prazo de validade.
          </p>

          <div className="ft-tabs" role="tablist" aria-label="Tipo de conteúdo">
            {TIPOS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                className="ft-tab"
                aria-selected={tipo === t.id}
                onClick={() => setTipo(t.id)}
              >
                {t.rotulo}
              </button>
            ))}
          </div>

          {tipo === "link" && (
            <div className="ft-fields">
              <div className="ft-f ft-full">
                <label className="ft-lbl" htmlFor="ft-qr-link">Endereço que o QR deve abrir</label>
                <input
                  id="ft-qr-link"
                  className="ft-in"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="https://minhaloja.com.br/promocao"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
                <span className="ft-hint">
                  Serve para site, cardápio, catálogo, formulário, playlist, localização no mapa,
                  perfil de rede social — qualquer endereço.
                </span>
              </div>
            </div>
          )}

          {tipo === "texto" && (
            <div className="ft-fields">
              <div className="ft-f ft-full">
                <label className="ft-lbl" htmlFor="ft-qr-texto">Texto que fica gravado</label>
                <textarea
                  id="ft-qr-texto"
                  className="ft-in"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Número do lote, instrução de montagem, senha do evento, recado…"
                />
                <span className="ft-hint">
                  A câmera mostra o texto e a pessoa decide o que fazer com ele. Acento e emoji
                  funcionam — só ocupam mais espaço, o que aumenta o tamanho do desenho.
                </span>
              </div>
            </div>
          )}

          {tipo === "pix" && (
            <div className="ft-fields">
              <div className="ft-f ft-full">
                <label className="ft-lbl" htmlFor="ft-qr-pix">Código PIX copia e cola</label>
                <textarea
                  id="ft-qr-pix"
                  className="ft-in"
                  value={pix}
                  onChange={(e) => setPix(e.target.value)}
                  spellCheck={false}
                  autoCapitalize="none"
                  placeholder="00020126360014BR.GOV.BCB.PIX..."
                />
                <span className="ft-hint">
                  Gere o &ldquo;copia e cola&rdquo; no app do seu banco e cole aqui inteiro. A
                  ferramenta <b>não altera nem inventa</b> nada do código: ela desenha exatamente o
                  texto que você colou.
                </span>
              </div>
            </div>
          )}

          {tipo === "wifi" && (
            <div className="ft-fields">
              <div className="ft-f ft-full">
                <label className="ft-lbl" htmlFor="ft-qr-ssid">Nome da rede (SSID)</label>
                <input
                  id="ft-qr-ssid"
                  className="ft-in"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="MinhaRede_5G"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                />
                <span className="ft-hint">Exatamente como aparece na lista de redes, com maiúsculas e símbolos.</span>
              </div>

              <div className="ft-f">
                <label className="ft-lbl" htmlFor="ft-qr-seg">Tipo de segurança</label>
                <select
                  id="ft-qr-seg"
                  className="ft-in"
                  value={seguranca}
                  onChange={(e) => setSeguranca(e.target.value as Seguranca)}
                >
                  <option value="WPA">WPA / WPA2 / WPA3 (o normal hoje)</option>
                  <option value="WEP">WEP (roteador antigo)</option>
                  <option value="nopass">Rede aberta, sem senha</option>
                </select>
              </div>

              {seguranca !== "nopass" && (
                <div className="ft-f">
                  <label className="ft-lbl" htmlFor="ft-qr-senha">Senha da rede</label>
                  <input
                    id="ft-qr-senha"
                    className="ft-in"
                    type="text"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="senha-do-wifi"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                  <span className="ft-hint">Digitada em texto normal para você conferir. Ela não sai deste aparelho.</span>
                </div>
              )}

              <div className="ft-f ft-full">
                <button
                  type="button"
                  className="ft-chip"
                  aria-pressed={oculta}
                  onClick={() => setOculta((v) => !v)}
                >
                  Rede oculta (não aparece na lista)
                </button>
              </div>
            </div>
          )}

          {linkComEspaco && (
            <div className="ft-alert bad" role="status">
              <IconeAcao nome="alerta" />
              <span>O endereço tem espaço. Endereço de site não pode ter espaço — confira o que foi colado.</span>
            </div>
          )}

          {semProtocolo && !linkComEspaco && (
            <div className="ft-alert info" role="status">
              <span>
                Você não escreveu o protocolo, então o QR foi gerado com <code>https://</code> na
                frente. Sem isso, parte das câmeras trata o conteúdo como texto e não oferece abrir.
              </span>
            </div>
          )}

          {verdicto?.tipo === "nao-brcode" && (
            <div className="ft-alert warn" role="status">
              <IconeAcao nome="alerta" />
              <span>
                Este texto não começa com <code>000201</code>, que é como todo código PIX começa.
                Confira se você colou o <b>copia e cola</b> do banco, e não a chave PIX. O QR é
                gerado assim mesmo, com o texto exato que está aí.
              </span>
            </div>
          )}

          {verdicto?.tipo === "sem-crc" && (
            <div className="ft-alert warn" role="status">
              <IconeAcao nome="alerta" />
              <span>
                Falta o dígito verificador no fim do código (todo PIX termina com{" "}
                <code>6304</code> e mais quatro caracteres). Isso quase sempre é código copiado pela
                metade — copie de novo no app do banco.
              </span>
            </div>
          )}

          {verdicto?.tipo === "crc-diferente" && (
            <div className="ft-alert warn" role="status">
              <IconeAcao nome="alerta" />
              <span>
                O dígito verificador do fim (<code>{verdicto.informado}</code>) não bate com o
                conteúdo do código, que daria <code>{verdicto.calculado}</code>. Quase sempre é
                código copiado incompleto ou com um caractere a mais. Copie outra vez no app do
                banco e <b>teste o QR com o seu próprio celular antes de imprimir</b>.
              </span>
            </div>
          )}

          {verdicto?.tipo === "ok" && (
            <div className="ft-alert ok" role="status">
              <IconeAcao nome="ok" />
              <span>Dígito verificador confere: o código foi copiado inteiro.</span>
            </div>
          )}

          {verdicto?.tipo === "nao-ascii" && (
            <div className="ft-alert info" role="status">
              <span>
                O código tem caractere com acento. Não conferimos o dígito verificador nesse caso
                para não dar alarme falso — o QR é gerado normalmente. Teste com o seu celular antes
                de imprimir.
              </span>
            </div>
          )}
        </div>

        <div className="ft-card">
          <p className="ft-h">Nível de correção de erro</p>
          <p className="ft-sub">
            Quanto do desenho pode estar sujo, rasgado ou coberto e o código ainda ser lido. Mais
            correção deixa o QR mais denso — e mais denso pede impressão maior.
          </p>
          <div className="ft-chips">
            {NIVEIS.map((n) => (
              <button
                key={n.id}
                type="button"
                className="ft-chip"
                aria-pressed={nivel === n.id}
                onClick={() => setNivel(n.id)}
              >
                {n.rotulo} <small>{n.recupera}</small>
              </button>
            ))}
          </div>
          <div className="ft-alert info" role="status">
            <span>{NIVEIS.find((n) => n.id === nivel)!.quando}</span>
          </div>
        </div>

        <div className="ft-card">
          <p className="ft-h">O texto exato que está dentro do QR</p>
          <p className="ft-sub">
            Confira antes de imprimir: depois de o adesivo estar colado na embalagem, não há
            correção.
          </p>
          {conteudo ? (
            <>
              <code className="ft-out">{conteudo}</code>
              <div className="ft-acts">
                <button
                  type="button"
                  className={copiado ? "ft-mini on" : "ft-mini"}
                  onClick={() => copiar(conteudo)}
                  style={{ flex: "1 1 auto" }}
                >
                  <IconeAcao nome={copiado ? "ok" : "copiar"} />
                  {copiado ? "Copiado!" : "Copiar o conteúdo"}
                </button>
              </div>
              <p className="ft-hint" style={{ marginTop: 12 }}>
                {bytes} bytes de conteúdo
                {qr ? " — cabem " + capacidadeAtual + " nesta versão do desenho." : "."}
              </p>
            </>
          ) : (
            <p className="ft-sub" style={{ marginBottom: 0 }}>Preencha os campos acima para ver o conteúdo aqui.</p>
          )}
        </div>
      </div>

      {/* ── coluna 2: o QR ──────────────────────────────────────────────── */}
      <div className="ft-sticky">
        {qr ? (
          <div className="ft-card">
            <p className="ft-h">Seu QR Code</p>
            <p className="ft-sub">
              Aponte a câmera do seu próprio celular para conferir <b>antes</b> de mandar imprimir.
            </p>
            <div className="ft-qr-wrap">
              <div className="ft-qr">
                <svg
                  viewBox={"0 0 " + qrLadoTotal(qr) + " " + qrLadoTotal(qr)}
                  role="img"
                  aria-label={rotuloAcessivel}
                  shapeRendering="crispEdges"
                >
                  <rect width={qrLadoTotal(qr)} height={qrLadoTotal(qr)} fill="#ffffff" />
                  <path d={qrParaCaminhoSvg(qr)} fill="#0B1220" />
                </svg>
              </div>
              <div className="ft-acts" style={{ marginTop: 0, width: "100%" }}>
                <button
                  type="button"
                  className="ft-mini"
                  onClick={() => baixarQrPng(qr, nomeArquivo + ".png", 4, 1000, "gerador-qr-code")}
                  style={{ flex: "1 1 auto" }}
                >
                  <IconeAcao nome="baixar" />
                  Baixar PNG
                </button>
                <button
                  type="button"
                  className="ft-mini"
                  onClick={() => baixarQrSvg(qr, nomeArquivo + ".svg", 4, "gerador-qr-code")}
                  style={{ flex: "1 1 auto" }}
                >
                  <IconeAcao nome="baixar" />
                  Baixar SVG
                </button>
              </div>
            </div>

            <div className="ft-form" style={{ marginTop: 18 }}>
              <div>
                <dt style={{ font: "600 14.5px var(--text)", color: "var(--ink)" }}>Ficha técnica</dt>
                <dd style={{ margin: 0, font: "400 14px/1.6 var(--text)", color: "var(--ink-2)" }}>
                  Versão {qr.versao} · {qr.tamanho} x {qr.tamanho} módulos · nível {qr.ecc} (recupera{" "}
                  {NIVEIS.find((n) => n.id === qr.ecc)!.recupera} do desenho danificado).
                </dd>
              </div>
            </div>

            <p className="ft-hint" style={{ marginTop: 12 }}>
              PNG sai com cerca de 1 000 pixels — resolve post, cartão e impressão pequena. SVG é
              vetor: amplia para fachada, banner ou adesivo grande sem serrilhar.
            </p>
          </div>
        ) : (
          <div className="ft-res">
            <p className="ft-res-k">Seu QR Code</p>
            {conteudo ? (
              <>
                <p className="ft-res-v" style={{ fontSize: "clamp(20px, 5.4vw, 26px)" }}>
                  Conteúdo grande demais
                </p>
                <p className="ft-res-sub">
                  São {bytes} bytes, e no nível {nivel} o limite do padrão QR é {capacidadeMax}. Encurte
                  o texto, ou baixe o nível de correção (H guarda menos conteúdo que L). Se for um
                  link comprido, vale usar um endereço mais curto no seu próprio site.
                </p>
              </>
            ) : (
              <p className="ft-res-sub" style={{ margin: 0 }}>
                Escolha o tipo e preencha ao lado. O QR Code aparece aqui na hora, pronto para baixar
                em PNG ou SVG.
              </p>
            )}
          </div>
        )}

        <div className="ft-card" style={{ marginTop: 16 }}>
          <p className="ft-h">Antes de imprimir</p>
          <ul className="ft-sub" style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 7 }}>
            <li>Teste com dois celulares diferentes, um Android e um iPhone.</li>
            <li>Deixe a moldura branca em volta: sem ela, a câmera não encontra o código.</li>
            <li>Em papel, não desça de 2 cm de lado. Em fachada, calcule 1 cm de lado para cada 10 cm de distância de leitura.</li>
            <li>Nunca inverta as cores (claro sobre escuro) sem testar — boa parte dos leitores só lê escuro sobre claro.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

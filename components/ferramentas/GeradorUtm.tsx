"use client";

import { useMemo, useState } from "react";
import { useCopiar, IconeAcao } from "./acoes";

/* ─────────────────────────────────────────────────────────────────────────────
   GERADOR DE LINK UTM — monta e CONFERE, no navegador.

   Montar o link é a parte fácil (é uma concatenação). O que esta ferramenta faz
   de diferente é apontar os quatro erros que só aparecem três meses depois,
   quando o relatório já está sujo e não dá para consertar o passado:

   1. LETRA MAIÚSCULA. O GA4 diferencia maiúscula de minúscula no valor do
      parâmetro: "Facebook", "facebook" e "FaceBook" viram TRÊS linhas
      diferentes no relatório de aquisição, cada uma com um pedaço do resultado.
   2. ESPAÇO. Vira %20 no link. "black friday" e "black-friday" também viram
      duas linhas — e o %20 ainda deixa o link feio quando alguém o copia.
   3. ACENTO E SÍMBOLO. "promoção" vira "promo%C3%A7%C3%A3o" no relatório.
      Legível não é.
   4. URL QUE JÁ TEM "?" OU "#". Quem cola um segundo "?" quebra o link inteiro,
      e quem põe os UTM depois do "#" faz o navegador tratá-los como âncora —
      o parâmetro nunca chega ao Analytics.

   MONTAGEM MANUAL, SEM `new URL()`: o construtor nativo reescreve o que recebe
   (normaliza host, reordena nada mas re-codifica caminho) e o resultado pode
   sair diferente do que a pessoa digitou. Aqui a URL original é preservada
   caractere por caractere; só os parâmetros novos são codificados.
   ──────────────────────────────────────────────────────────────────────────── */

type Chave = "utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content";

const CAMPOS: { chave: Chave; rotulo: string; obrig: boolean; exemplo: string; dica: string }[] = [
  {
    chave: "utm_source",
    rotulo: "Origem (utm_source)",
    obrig: true,
    exemplo: "instagram",
    dica: "De onde vem a visita: instagram, google, newsletter, whatsapp, parceiro-x.",
  },
  {
    chave: "utm_medium",
    rotulo: "Mídia (utm_medium)",
    obrig: true,
    exemplo: "social",
    dica: "Que tipo de canal é: social, email, cpc, paid_social, referral, offline.",
  },
  {
    chave: "utm_campaign",
    rotulo: "Campanha (utm_campaign)",
    obrig: false,
    exemplo: "black-friday-2026",
    dica: "O nome da ação. Padronize desde o primeiro link: o relatório agrupa por este texto.",
  },
  {
    chave: "utm_term",
    rotulo: "Termo (utm_term)",
    obrig: false,
    exemplo: "tenis-corrida",
    dica: "A palavra-chave paga. Só faz sentido em campanha de busca.",
  },
  {
    chave: "utm_content",
    rotulo: "Conteúdo (utm_content)",
    obrig: false,
    exemplo: "banner-topo",
    dica: "Qual peça ou botão foi clicado. É o que separa duas variações da mesma campanha.",
  },
];

const MODELOS: { rotulo: string; source: string; medium: string; campaign: string; nota: string }[] = [
  {
    rotulo: "Bio do Instagram",
    source: "instagram", medium: "social", campaign: "bio",
    nota: "O link da bio é permanente, então a campanha também deve ser: use um nome que não envelhece.",
  },
  {
    rotulo: "Stories",
    source: "instagram", medium: "social", campaign: "stories",
    nota: "Separe do link da bio, senão os dois viram a mesma linha e você nunca sabe qual traz mais gente.",
  },
  {
    rotulo: "E-mail / newsletter",
    source: "newsletter", medium: "email", campaign: "disparo-mensal",
    nota: "utm_medium=email é o que faz o GA4 classificar a visita como canal E-mail.",
  },
  {
    rotulo: "Anúncio no Meta",
    source: "facebook", medium: "paid_social", campaign: "campanha-1",
    nota: "paid_social é o que joga a visita no canal Paid Social do GA4. Use utm_content para separar cada criativo.",
  },
  {
    rotulo: "Anúncio no Google",
    source: "google", medium: "cpc", campaign: "campanha-1",
    nota: "Se o Google Ads está vinculado ao GA4 com marcação automática (gclid), NÃO use UTM: os dois juntos brigam e o relatório fica duplicado.",
  },
  {
    rotulo: "QR impresso",
    source: "qrcode", medium: "offline", campaign: "balcao-loja",
    nota: "É o único jeito de medir material físico. Um utm_campaign por peça (balcão, embalagem, panfleto).",
  },
];

/** Tira acento, baixa para minúscula e troca espaço/símbolo por hífen.
 *
 *  A faixa ̀-ͯ (Combining Diacritical Marks) faz o mesmo papel que
 *  \p{Mn} com a flag `u`, mas sem exigir alvo ES6+ no tsconfig deste projeto —
 *  a versão com \p{Mn} não compilava aqui. Depois do NFD, todo acento vira um
 *  caractere combinante nessa faixa, então o resultado é idêntico para
 *  português. */
function normalizar(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** O que há de errado num valor de parâmetro. Lista vazia = está limpo. */
function problemasDoValor(v: string): string[] {
  const p: string[] = [];
  if (!v.trim()) return p;
  if (/\s/.test(v)) p.push("espaço");
  if (/[A-Z]/.test(v)) p.push("letra maiúscula");
  if (/[^\x00-\x7F]/.test(v)) p.push("acento");
  if (/[^A-Za-z0-9_.\-\s\x80-\uFFFF]/.test(v)) p.push("símbolo");
  return p;
}

export default function GeradorUtm() {
  const [url, setUrl] = useState("");
  const [valores, setValores] = useState<Record<Chave, string>>({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  });
  const [copiado, copiar] = useCopiar();

  const setValor = (c: Chave, v: string) => setValores((a) => ({ ...a, [c]: v }));

  const alvo = useMemo(() => {
    const cru = url.trim();
    if (!cru) return { ok: false as const, motivo: "vazio" as const };
    if (/\s/.test(cru)) return { ok: false as const, motivo: "espaco" as const };

    let base = cru;
    let semProtocolo = false;
    let inseguro = false;
    if (/^https?:\/\//i.test(base)) {
      inseguro = /^http:\/\//i.test(base);
    } else if (/^[a-z][a-z0-9+.-]*:/i.test(base)) {
      return { ok: false as const, motivo: "protocolo" as const };
    } else {
      base = "https://" + base;
      semProtocolo = true;
    }

    const iHash = base.indexOf("#");
    const hash = iHash >= 0 ? base.slice(iHash) : "";
    const semHash = iHash >= 0 ? base.slice(0, iHash) : base;
    const iQuery = semHash.indexOf("?");
    const query = iQuery >= 0 ? semHash.slice(iQuery + 1) : "";
    const caminho = iQuery >= 0 ? semHash.slice(0, iQuery) : semHash;

    const host = caminho.replace(/^https?:\/\//i, "").split("/")[0];
    if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}(?::\d{1,5})?$/i.test(host)) {
      return { ok: false as const, motivo: "host" as const };
    }

    return {
      ok: true as const,
      caminho,
      query,
      hash,
      semProtocolo,
      inseguro,
      jaTemUtm: /(?:^|&)utm_[a-z]+=/i.test(query),
      jaTemQuery: query.length > 0,
      temHash: hash.length > 0,
    };
  }, [url]);

  const link = useMemo(() => {
    if (!alvo.ok) return "";
    const partes = CAMPOS.map((c) => {
      const v = valores[c.chave].trim();
      return v ? c.chave + "=" + encodeURIComponent(v) : "";
    }).filter(Boolean);
    const inicio = alvo.caminho + (alvo.query ? "?" + alvo.query : "");
    if (!partes.length) return inicio + alvo.hash;
    return inicio + (alvo.query ? "&" : "?") + partes.join("&") + alvo.hash;
  }, [alvo, valores]);

  /* Sujeira nos valores digitados, listada campo a campo para a pessoa ver
     exatamente onde está o problema — e um botão que arruma todos de uma vez. */
  const sujos = useMemo(
    () =>
      CAMPOS.map((c) => ({ campo: c, lista: problemasDoValor(valores[c.chave]) }))
        .filter((x) => x.lista.length > 0),
    [valores],
  );

  const arrumar = () => {
    setValores((a) => {
      const novo = { ...a };
      for (const c of CAMPOS) novo[c.chave] = normalizar(a[c.chave]);
      return novo;
    });
  };

  const faltaObrigatorio = CAMPOS.filter((c) => c.obrig && !valores[c.chave].trim()).map((c) => c.chave);
  const temAlgumValor = CAMPOS.some((c) => valores[c.chave].trim() !== "");
  const pronto = alvo.ok && temAlgumValor;

  const aplicarModelo = (m: (typeof MODELOS)[number]) => {
    setValores((a) => ({ ...a, utm_source: m.source, utm_medium: m.medium, utm_campaign: m.campaign }));
  };
  const modeloAtivo = MODELOS.find(
    (m) => m.source === valores.utm_source && m.medium === valores.utm_medium && m.campaign === valores.utm_campaign,
  );

  const erroUrl =
    alvo.ok || !url.trim()
      ? ""
      : alvo.motivo === "espaco"
        ? "A URL tem espaço. Endereço de site não pode ter espaço — confira se você colou o texto certo."
        : alvo.motivo === "protocolo"
          ? "Endereço com protocolo que o navegador não abre em link de campanha. Use http:// ou https://."
          : "Isso não parece um endereço de site. O domínio precisa ter um ponto e uma terminação (exemplo.com.br, minhaloja.com).";

  return (
    <div className="ft-lay">
      <div className="ft-live">
        <span className="ft-live-i ft-live-grow">
          <span className="ft-live-k">Seu link com UTM</span>
          {pronto ? (
            <span className="ft-live-link">{link}</span>
          ) : (
            <span className="ft-live-link" style={{ color: "rgba(255,255,255,.66)", fontWeight: 500 }}>
              {alvo.ok ? "preencha origem e mídia" : "cole o endereço da página"}
            </span>
          )}
        </span>
        {pronto && (
          <button type="button" className={copiado ? "ft-mini on" : "ft-mini"} onClick={() => copiar(link)}>
            <IconeAcao nome={copiado ? "ok" : "copiar"} />
            {copiado ? "Copiado" : "Copiar"}
          </button>
        )}
      </div>

      {/* ── coluna 1: os campos ─────────────────────────────────────────── */}
      <div>
        <div className="ft-card">
          <p className="ft-h">Para onde o link leva</p>
          <p className="ft-sub">
            Cole o endereço exatamente como ele é hoje. Se já houver parâmetro ou âncora nele, a
            ferramenta encaixa os UTM no lugar certo sem quebrar nada.
          </p>
          <div className="ft-fields">
            <div className="ft-f ft-full">
              <label className="ft-lbl" htmlFor="ft-utm-url">Endereço da página de destino</label>
              <input
                id="ft-utm-url"
                className="ft-in"
                type="text"
                inputMode="url"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="https://minhaloja.com.br/promocao"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                aria-describedby="ft-utm-url-diag"
              />
              <span className="ft-hint">Sem o https:// a ferramenta assume https, que é o correto hoje.</span>
            </div>
          </div>

          {erroUrl && (
            <div className="ft-alert bad" id="ft-utm-url-diag" role="status">
              <IconeAcao nome="alerta" />
              <span>{erroUrl}</span>
            </div>
          )}

          {alvo.ok && alvo.jaTemUtm && (
            <div className="ft-alert bad" role="status">
              <IconeAcao nome="alerta" />
              <span>
                <b>Esta URL já tem parâmetros UTM.</b> Colar outro conjunto cria parâmetro repetido no
                mesmo link e o Analytics considera só o primeiro — o resto vira lixo na URL. Apague os
                UTM que já estão no endereço e monte tudo aqui.
              </span>
            </div>
          )}

          {alvo.ok && alvo.jaTemQuery && !alvo.jaTemUtm && (
            <div className="ft-alert info" role="status">
              <span>
                Esta URL já tem uma query string (o trecho depois do <code>?</code>). Os UTM entram
                em seguida com <code>&amp;</code>, que é a forma certa — nunca com um segundo{" "}
                <code>?</code>, que quebraria o link.
              </span>
            </div>
          )}

          {alvo.ok && alvo.temHash && (
            <div className="ft-alert info" role="status">
              <span>
                A URL termina numa âncora (<code>{alvo.hash}</code>). Os UTM foram colocados{" "}
                <b>antes</b> dela: parâmetro depois do <code>#</code> nunca chega ao Analytics,
                porque o navegador não envia o que vem depois do <code>#</code>.
              </span>
            </div>
          )}

          {alvo.ok && alvo.inseguro && (
            <div className="ft-alert warn" role="status">
              <IconeAcao nome="alerta" />
              <span>
                O endereço está em <code>http://</code>, sem o S. Navegador marca a página como não
                segura e parte dos anúncios recusa o link. Confira se o seu site atende em{" "}
                <code>https://</code>.
              </span>
            </div>
          )}

          {alvo.ok && alvo.semProtocolo && (
            <div className="ft-alert info" role="status">
              <span>Você não escreveu o protocolo, então o link foi montado com <code>https://</code>.</span>
            </div>
          )}
        </div>

        <div className="ft-card">
          <p className="ft-h">Modelos prontos</p>
          <p className="ft-sub">
            Toque para preencher origem, mídia e campanha com a convenção que o GA4 entende. Depois
            ajuste o nome da campanha para o seu caso.
          </p>
          <div className="ft-chips">
            {MODELOS.map((m) => (
              <button
                key={m.rotulo}
                type="button"
                className="ft-chip"
                aria-pressed={modeloAtivo?.rotulo === m.rotulo}
                onClick={() => aplicarModelo(m)}
              >
                {m.rotulo}
              </button>
            ))}
          </div>
          {modeloAtivo && (
            <div className="ft-alert info" role="status">
              <span>{modeloAtivo.nota}</span>
            </div>
          )}
        </div>

        <div className="ft-card">
          <p className="ft-h">Os parâmetros</p>
          <p className="ft-sub">
            <b>utm_source</b> e <b>utm_medium</b> são os dois que o Analytics realmente precisa. Sem
            eles a visita cai em &ldquo;não definido&rdquo; e o link deixa de ser rastreável.
          </p>

          <div className="ft-fields">
            {CAMPOS.map((c) => {
              const lista = problemasDoValor(valores[c.chave]);
              return (
                <div key={c.chave} className={c.chave === "utm_campaign" ? "ft-f ft-full" : "ft-f"}>
                  <label className="ft-lbl" htmlFor={"ft-" + c.chave}>
                    {c.rotulo}{" "}
                    {c.obrig ? (
                      <span style={{ fontWeight: 600, color: "var(--acc)" }}>obrigatório</span>
                    ) : (
                      <span style={{ fontWeight: 400, color: "#5A6579" }}>(opcional)</span>
                    )}
                  </label>
                  <input
                    id={"ft-" + c.chave}
                    className="ft-in"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder={c.exemplo}
                    value={valores[c.chave]}
                    onChange={(e) => setValor(c.chave, e.target.value)}
                  />
                  <span className="ft-hint" style={lista.length ? { color: "#8A5A00", fontWeight: 500 } : undefined}>
                    {lista.length ? "Tem " + lista.join(", ") + " — isso divide o relatório em linhas separadas." : c.dica}
                  </span>
                </div>
              );
            })}
          </div>

          {sujos.length > 0 && (
            <>
              <div className="ft-alert warn" role="status">
                <IconeAcao nome="alerta" />
                <span>
                  <b>
                    {sujos.length === 1
                      ? "Um parâmetro vai sujar o relatório."
                      : sujos.length + " parâmetros vão sujar o relatório."}
                  </b>{" "}
                  O Google Analytics trata o valor como texto e diferencia maiúscula de minúscula:{" "}
                  <code>Instagram</code> e <code>instagram</code> viram duas linhas, cada uma com
                  metade das visitas. Espaço vira <code>%20</code> e acento vira código no relatório.
                </span>
              </div>
              <div className="ft-acts">
                <button type="button" className="ft-mini" onClick={arrumar} style={{ flex: "1 1 auto" }}>
                  <IconeAcao nome="varinha" />
                  Arrumar tudo: minúscula, sem acento, com hífen
                </button>
              </div>
            </>
          )}

          {alvo.ok && temAlgumValor && faltaObrigatorio.length > 0 && (
            <div className="ft-alert warn" role="status">
              <IconeAcao nome="alerta" />
              <span>
                Falta {faltaObrigatorio.length === 1 ? "o parâmetro" : "os parâmetros"}{" "}
                <b>{faltaObrigatorio.join(" e ")}</b>. Sem os dois, o GA4 não classifica a visita e ela
                aparece como &ldquo;(not set)&rdquo; ou entra no tráfego direto — que é justamente o que
                você queria parar de ver.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── coluna 2: o resultado ───────────────────────────────────────── */}
      <div className="ft-sticky">
        <div className="ft-res">
          <p className="ft-res-k">Seu link com UTM</p>
          {pronto ? (
            <>
              <code
                className="ft-out"
                style={{ background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.28)", color: "#fff" }}
              >
                {link}
              </code>
              <div className="ft-acts">
                <button
                  type="button"
                  className={copiado ? "ft-mini on" : "ft-mini"}
                  onClick={() => copiar(link)}
                  style={{ flex: "1 1 auto" }}
                >
                  <IconeAcao nome={copiado ? "ok" : "copiar"} />
                  {copiado ? "Copiado!" : "Copiar link"}
                </button>
                <a className="ft-mini" href={link} target="_blank" rel="noopener noreferrer" style={{ flex: "1 1 auto" }}>
                  <IconeAcao nome="abrir" />
                  Testar agora
                </a>
              </div>
              <p className="ft-res-sub">
                Abra o link uma vez antes de divulgar: se a página carregar normalmente, o parâmetro
                está no formato certo.
              </p>

              <div className="ft-rows">
                {CAMPOS.filter((c) => valores[c.chave].trim()).map((c) => (
                  <div className="ft-row" key={c.chave}>
                    <span>{c.chave}</span>
                    <b>{valores[c.chave].trim()}</b>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="ft-res-sub" style={{ margin: 0 }}>
              {alvo.ok
                ? "Preencha a origem e a mídia ao lado — o link montado aparece aqui na hora."
                : "Cole o endereço da página ao lado e preencha os parâmetros. O link aparece aqui, pronto para copiar."}
            </p>
          )}
        </div>

        <div className="ft-card" style={{ marginTop: 16 }}>
          <p className="ft-h">A regra que salva o relatório</p>
          <p className="ft-sub" style={{ marginBottom: 0 }}>
            Escolha um padrão e nunca mais mude: <b>tudo minúsculo, sem acento, palavras separadas por
            hífen</b>. Não porque é bonito — porque o Analytics agrupa por texto exato, e qualquer
            variação vira uma linha nova que rouba parte do resultado da linha certa. Um relatório com
            &ldquo;Instagram&rdquo;, &ldquo;instagram&rdquo; e &ldquo;insta&rdquo; não mente: ele
            simplesmente não responde nada.
          </p>
        </div>
      </div>
    </div>
  );
}

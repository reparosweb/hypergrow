"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { numero } from "./formato";

/* ─────────────────────────────────────────────────────────────────────────────
   SIMULADOR DE RESULTADO NO GOOGLE — prévia + contagem, tudo no navegador.

   O QUE ESTA FERRAMENTA PROMETE (e o que ela não promete):
   · a prévia mostra como o texto SE COMPORTA no espaço de um resultado de
     busca — quantas linhas ocupa, onde estoura, como fica no celular;
   · o contador de caracteres é a régua prática do dia a dia (~60 no título,
     ~155-160 na descrição);
   · a medida em pixels é REAL: o texto é medido com <canvas> na fonte da
     prévia. O Google corta por LARGURA EM PIXEL, não por número de caracteres
     — por isso "Wi" e "MM" ocupam espaços bem diferentes com a mesma contagem.
   · o Google reescreve título e descrição quando quer (é comportamento
     conhecido dele). Nenhum simulador — este inclusive — garante que vai sair
     exatamente assim.

   Medida em pixel só depois da montagem (useEffect): no servidor não existe
   <canvas>, e escrever um número no HTML do servidor que o navegador
   recalcularia diferente derrubaria a hidratação da página.
   ──────────────────────────────────────────────────────────────────────────── */

const LIMITE_PX_TITULO = 580; // faixa em que o Google costuma cortar no desktop

/** Mede a largura real do texto na fonte informada. null até montar no cliente. */
function useLarguraPx(texto: string, fonte: string): number | null {
  const [px, setPx] = useState<number | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!canvas.current) canvas.current = document.createElement("canvas");
    const ctx = canvas.current.getContext("2d");
    if (!ctx) return;
    ctx.font = fonte;
    setPx(Math.round(ctx.measureText(texto).width));
  }, [texto, fonte]);
  return px;
}

type Estado = "ok" | "warn" | "bad" | "vazio";

function avaliar(n: number, curto: number, ideal: number, limite: number): Estado {
  if (n === 0) return "vazio";
  if (n > limite) return "bad";
  if (n > ideal || n < curto) return "warn";
  return "ok";
}

function Medidor({
  rotulo, atual, ideal, limite, estado, extra,
}: { rotulo: string; atual: number; ideal: number; limite: number; estado: Estado; extra?: string }) {
  const largura = Math.min(100, (atual / limite) * 100);
  const cor = estado === "bad" ? " bad" : estado === "warn" ? " warn" : "";
  return (
    <div style={{ marginTop: 9 }}>
      <div className={"ft-meter" + cor}>
        <span>{rotulo}</span>
        <b>
          {atual} / {ideal} caracteres{extra ? " · " + extra : ""}
        </b>
      </div>
      <div className="ft-track">
        <div className={"ft-fill" + cor} style={{ width: largura + "%" }} />
      </div>
    </div>
  );
}

function partesDaUrl(bruta: string): { host: string; trilha: string[]; ok: boolean } {
  const texto = (bruta || "").trim();
  if (!texto) return { host: "", trilha: [], ok: false };
  try {
    const u = new URL(/^https?:\/\//i.test(texto) ? texto : "https://" + texto);
    const trilha = u.pathname.split("/").filter(Boolean).map((p) => decodeURIComponent(p));
    return { host: u.hostname.replace(/^www\./, ""), trilha, ok: true };
  } catch {
    return { host: texto, trilha: [], ok: false };
  }
}

export default function SimuladorGoogle() {
  /* Exemplo ILUSTRATIVO — domínio e produto fictícios, só para a pessoa ver a
     ferramenta funcionando antes de colar os textos dela. */
  const [titulo, setTitulo] = useState("Camiseta de algodão pima masculina | Loja Exemplo");
  const [descricao, setDescricao] = useState(
    "Camisetas de algodão pima com caimento reto e gola que não deforma. Frete grátis acima de R$ 199 e troca em 30 dias. Compre em até 6x sem juros."
  );
  const [url, setUrl] = useState("https://www.sualoja.com.br/camisetas/algodao-pima");
  const [aba, setAba] = useState<"desktop" | "mobile">("desktop");

  const pxTitulo = useLarguraPx(titulo, "20px arial, sans-serif");
  const u = useMemo(() => partesDaUrl(url), [url]);

  const estTitulo = avaliar(titulo.length, 30, 60, 70);
  const estDesc = avaliar(descricao.length, 70, 158, 175);
  const cortaPorPixel = pxTitulo !== null && pxTitulo > LIMITE_PX_TITULO;

  const ehMobile = aba === "mobile";

  return (
    <div className="ft-lay">
      <div>
        <div className="ft-card">
          <p className="ft-h">Seus textos</p>
          <p className="ft-sub">
            Comece trocando o exemplo abaixo pelos textos da sua página. A prévia ao lado muda
            enquanto você digita.
          </p>

          <div className="ft-fields">
            <div className="ft-f ft-full">
              <label className="ft-lbl" htmlFor="ft-titulo">Título da página (title tag)</label>
              <input id="ft-titulo" className="ft-in" type="text" value={titulo}
                onChange={(e) => setTitulo(e.target.value)} placeholder="O que a pessoa lê primeiro, em azul" />
              <Medidor
                rotulo="Título"
                atual={titulo.length}
                ideal={60}
                limite={70}
                estado={estTitulo}
                extra={pxTitulo === null ? undefined : numero(pxTitulo, 0) + " px de " + LIMITE_PX_TITULO}
              />
              <span className="ft-hint">
                {estTitulo === "vazio" && "Sem título, o Google escolhe um pedaço do seu conteúdo — e quase nunca escolhe bem."}
                {estTitulo === "ok" && "Bom tamanho. Coloque o termo mais importante no começo: é o que sobrevive ao corte."}
                {estTitulo === "warn" && titulo.length < 30 && "Curto demais — sobra espaço que poderia estar vendendo."}
                {estTitulo === "warn" && titulo.length >= 30 && "Passou do tamanho confortável. Deve aparecer com reticências no fim."}
                {estTitulo === "bad" && "Vai ser cortado com certeza. O que estiver depois do limite não será lido."}
              </span>
            </div>

            <div className="ft-f ft-full">
              <label className="ft-lbl" htmlFor="ft-desc">Descrição (meta description)</label>
              <textarea id="ft-desc" className="ft-in" value={descricao} rows={4}
                onChange={(e) => setDescricao(e.target.value)} placeholder="O convite: por que clicar no seu resultado e não no de cima" />
              <Medidor rotulo="Descrição" atual={descricao.length} ideal={158} limite={175} estado={estDesc} />
              <span className="ft-hint">
                {estDesc === "vazio" && "Sem descrição, o Google monta uma com trechos soltos da página."}
                {estDesc === "ok" && "Tamanho bom. Ela não é fator de posição — é o que faz a pessoa clicar em você."}
                {estDesc === "warn" && descricao.length < 70 && "Curta: você está deixando espaço grátis de anúncio sem usar."}
                {estDesc === "warn" && descricao.length >= 70 && "Acima do que costuma aparecer. O fim provavelmente será cortado."}
                {estDesc === "bad" && "Bem acima do limite. Ponha o argumento principal nas duas primeiras linhas."}
              </span>
            </div>

            <div className="ft-f ft-full">
              <label className="ft-lbl" htmlFor="ft-url">Endereço da página (URL)</label>
              <input id="ft-url" className="ft-in" type="text" inputMode="url" value={url}
                onChange={(e) => setUrl(e.target.value)} placeholder="https://seusite.com.br/categoria/pagina" />
              <span className="ft-hint">
                {u.ok
                  ? "O Google mostra o caminho em migalhas: " + [u.host, ...u.trilha].join(" › ")
                  : "Digite o endereço completo para ver como o caminho aparece no resultado."}
              </span>
            </div>
          </div>

          {cortaPorPixel && (
            <div className="ft-alert warn" role="status">
              <span>
                Seu título mede <b>{numero(pxTitulo as number, 0)} px</b> na fonte do resultado, acima
                dos ~{LIMITE_PX_TITULO} px que o Google costuma exibir no desktop. Vale mais reduzir
                do que confiar só na contagem de caracteres: letras largas (M, W, maiúsculas) comem
                muito mais espaço que i, l e t.
              </span>
            </div>
          )}
        </div>

        <div className="ft-card">
          <p className="ft-h">Duas coisas que todo simulador deveria dizer</p>
          <dl className="ft-form">
            <div>
              <dt>O corte é por pixel, não por caractere</dt>
              <dd>
                A régua de ~60 caracteres é um atalho útil, mas o Google corta pela largura: um
                título só de maiúsculas estoura antes dos 60, e um cheio de letras finas passa de 65
                sem cortar. Por isso esta ferramenta mostra os dois números.
              </dd>
            </div>
            <div>
              <dt>O Google pode reescrever o que você escreveu</dt>
              <dd>
                Ele troca título e descrição quando julga que outro texto responde melhor à busca —
                isso é comportamento conhecido e vale para qualquer site. Escrever bem aumenta muito
                a chance de o seu texto ser mantido, mas ninguém garante o resultado exato.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="ft-sticky">
        <div className="ft-card">
          <div className="ft-tabs" role="tablist" aria-label="Formato da prévia">
            <button type="button" className="ft-tab" role="tab" aria-selected={!ehMobile}
              onClick={() => setAba("desktop")}>Computador</button>
            <button type="button" className="ft-tab" role="tab" aria-selected={ehMobile}
              onClick={() => setAba("mobile")}>Celular</button>
          </div>

          <div className={ehMobile ? "ft-serp mob" : "ft-serp"}>
            <div className="ft-serp-head">
              <span className="ft-serp-fav" aria-hidden>{(u.host || "?").charAt(0).toUpperCase()}</span>
              <span className="ft-serp-site">
                <span className="ft-serp-name">{u.host || "seusite.com.br"}</span>
                <br />
                <span className="ft-serp-url">
                  {u.host ? ["https://" + u.host, ...u.trilha].join(" › ") : "https://seusite.com.br"}
                </span>
              </span>
            </div>
            <p className="ft-serp-t">
              {titulo || <span className="ft-serp-empty">Seu título aparece aqui</span>}
            </p>
            <p className="ft-serp-d">
              {descricao || <span className="ft-serp-empty">Sua descrição aparece aqui, com duas linhas no computador e até três no celular.</span>}
            </p>
          </div>

          <p className="ft-hint" style={{ marginTop: 12 }}>
            A prévia corta o texto no mesmo lugar que o navegador cortaria: duas linhas no
            computador, até três no celular. É aproximação fiel do espaço, não uma cópia oficial
            da página de resultados do Google.
          </p>
        </div>

        <div className="ft-res" style={{ marginTop: 16 }}>
          <p className="ft-res-k">Diagnóstico rápido</p>
          <div className="ft-rows" style={{ marginTop: 8, borderTop: "none" }}>
            <div className="ft-row">
              <span>Título</span>
              <b>{titulo.length} caracteres{pxTitulo !== null ? " · " + numero(pxTitulo, 0) + " px" : ""}</b>
            </div>
            <div className="ft-row">
              <span>Corta no computador?</span>
              <b>{titulo.length === 0 ? "—" : cortaPorPixel || titulo.length > 65 ? "Provavelmente sim" : "Provavelmente não"}</b>
            </div>
            <div className="ft-row">
              <span>Descrição</span>
              <b>{descricao.length} caracteres</b>
            </div>
            <div className="ft-row tot">
              <span>Descrição no limite?</span>
              <b>{descricao.length === 0 ? "—" : descricao.length > 160 ? "Passou de 160" : "Dentro"}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

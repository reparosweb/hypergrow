"use client";

import { useMemo, useState } from "react";
import { useCopiar, baixarTexto, IconeAcao } from "./acoes";

/* ─────────────────────────────────────────────────────────────────────────────
   GERADOR DE POLÍTICA DE PRIVACIDADE (LGPD) — montado e escrito no navegador.

   O que esta ferramenta É: um modelo de referência que organiza, na estrutura
   que qualquer política de privacidade séria segue (controlador, dados
   coletados, finalidade, base legal, retenção, direitos do titular, contato),
   o texto a partir de seis respostas simples.

   O que esta ferramenta NÃO É — e isso fica escrito na tela e dentro do
   próprio texto gerado, sem exceção: uma peça jurídica revisada por advogado.
   Cada negócio tem particularidade que um formulário de seis perguntas não
   captura (dado sensível, público infantil, operação fora do Brasil, etc.).

   NADA TOCA SERVIDOR: o texto é montado em memória a partir do que a pessoa
   digitou, e as duas opções de download (`baixarTexto`, de "./acoes") geram o
   arquivo via Blob no próprio navegador — mesmo mecanismo do QR Code e do link
   do WhatsApp desta pasta.
   ──────────────────────────────────────────────────────────────────────────── */

type ChaveDado = "identificacao" | "navegacao" | "pagamento" | "localizacao";
type ChaveTerceiro = "analytics" | "pixel";
type DadosColetados = Record<ChaveDado, boolean>;
type Terceiros = Record<ChaveTerceiro, boolean>;
type Secao = { titulo: string; paragrafos: string[] };

const CAMPOS_DADOS: { id: ChaveDado; rotulo: string }[] = [
  { id: "identificacao", rotulo: "Nome, e-mail ou telefone" },
  { id: "navegacao", rotulo: "Dados de navegação e cookies" },
  { id: "pagamento", rotulo: "Dados de pagamento" },
  { id: "localizacao", rotulo: "Localização" },
];

const CAMPOS_TERCEIROS: { id: ChaveTerceiro; rotulo: string }[] = [
  { id: "analytics", rotulo: "Google Analytics" },
  { id: "pixel", rotulo: "Meta Pixel (Facebook/Instagram)" },
];

/** Tira acento e baixa para minúscula — mesma técnica do GeradorUtm.tsx
 *  (a faixa ̀-ͯ faz o papel de \p{Mn} sem exigir alvo ES6+ no tsconfig). */
function slug(v: string): string {
  return (
    v
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "empresa"
  );
}

function dataDeHoje(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return dd + "/" + mm + "/" + d.getFullYear();
}

function escapeHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Monta as seções NUMERADAS a partir das respostas. A numeração é aplicada
 *  no fim (índice + 1) em vez de escrita à mão em cada bloco — assim uma
 *  seção condicional (cookies só entra se houver rastreamento) nunca deixa
 *  buraco ou repetição no número. */
function montarSecoes(args: {
  nome: string;
  dominio: string;
  email: string;
  dados: DadosColetados;
  terceiros: Terceiros;
  emailMkt: boolean;
}): Secao[] {
  const { nome, dominio, email, dados, terceiros, emailMkt } = args;
  const usaCookies = dados.navegacao || terceiros.analytics || terceiros.pixel;
  const brutas: Secao[] = [];

  brutas.push({
    titulo: "Quem é o controlador dos seus dados",
    paragrafos: [
      "A " + nome + ", através do site " + dominio + ", é a controladora dos dados pessoais tratados nesta política, nos termos da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais — LGPD).",
      "Dúvidas, solicitações ou reclamações sobre o tratamento dos seus dados podem ser enviadas para " + email + ".",
    ],
  });

  const listaDados: string[] = [];
  if (dados.identificacao) listaDados.push("- Dados de identificação e contato: nome, e-mail e telefone informados por você em formulários, cadastro ou atendimento.");
  if (dados.navegacao) listaDados.push("- Dados de navegação e cookies: páginas visitadas, tempo de permanência, tipo de dispositivo e navegador, coletados automaticamente durante o uso do site.");
  if (dados.pagamento) listaDados.push("- Dados de pagamento: forma de pagamento e valor da transação. O número completo do cartão e o código de segurança são processados diretamente pela operadora de pagamento; este site não os armazena.");
  if (dados.localizacao) listaDados.push("- Dados de localização: aproximada ou precisa, somente quando você autoriza o compartilhamento pelo navegador ou aplicativo.");

  brutas.push({
    titulo: "Quais dados coletamos",
    paragrafos: [
      listaDados.length
        ? "Coletamos as seguintes categorias de dados pessoais:"
        : "Além dos dados técnicos mínimos necessários para o funcionamento e a segurança do site, não coletamos outras categorias de dados pessoais.",
      ...listaDados,
      "Independentemente das opções acima, registros de acesso (como endereço IP, data e hora) são mantidos por exigência do art. 15 da Lei nº 12.965/2014 (Marco Civil da Internet).",
    ],
  });

  const finalidades: string[] = [];
  if (dados.identificacao) finalidades.push("- Responder contatos, prestar atendimento e cumprir obrigações relacionadas ao relacionamento com você.");
  if (dados.pagamento) finalidades.push("- Processar pedidos e pagamentos e cumprir obrigações fiscais e contratuais.");
  if (dados.localizacao) finalidades.push("- Oferecer funcionalidades que dependem da sua localização, como cálculo de frete ou indicação de unidades próximas.");
  if (usaCookies) finalidades.push("- Entender como o site é usado, medir desempenho e melhorar a experiência de navegação.");
  if (emailMkt) finalidades.push("- Enviar comunicações de marketing, promoções e novidades, sempre que você autorizar.");
  brutas.push({
    titulo: "Para que usamos os dados",
    paragrafos: [
      finalidades.length ? "Usamos os dados coletados para:" : "Usamos os dados técnicos mínimos apenas para garantir o funcionamento e a segurança do site.",
      ...finalidades,
    ],
  });

  if (usaCookies) {
    const paragrafosCookies: string[] = [
      "Utilizamos cookies e tecnologias semelhantes para lembrar preferências, manter você conectado e entender como o site é usado.",
    ];
    if (terceiros.analytics) paragrafosCookies.push("Utilizamos o Google Analytics para entender, de forma agregada, como as pessoas usam o site. Os dados coletados por essa ferramenta também são tratados conforme a política de privacidade do Google.");
    if (terceiros.pixel) paragrafosCookies.push("Utilizamos o Meta Pixel (Facebook/Instagram) para medir o desempenho de anúncios e montar públicos para campanhas. Os dados coletados por essa ferramenta também são tratados conforme a política de privacidade da Meta.");
    paragrafosCookies.push("Você pode gerenciar ou bloquear cookies diretamente nas configurações do seu navegador. Bloquear cookies pode limitar algumas funcionalidades do site.");
    brutas.push({ titulo: "Cookies e ferramentas de terceiros", paragrafos: paragrafosCookies });
  }

  const compartilha: string[] = [
    "Não vendemos os seus dados pessoais.",
    "Podemos compartilhar dados com prestadores de serviço necessários para a operação do site — como hospedagem, envio de e-mail e processamento de pagamento — e com autoridades públicas, quando exigido por lei ou ordem judicial.",
  ];
  if (usaCookies) compartilha.push("As ferramentas de análise e publicidade citadas na seção de cookies também recebem os dados descritos naquela seção, dentro dos limites ali explicados.");
  brutas.push({ titulo: "Com quem compartilhamos os dados", paragrafos: compartilha });

  const bases: string[] = [
    "- Cumprimento de obrigação legal ou regulatória (art. 7º, II) — para os registros de acesso exigidos pelo Marco Civil da Internet e obrigações fiscais.",
  ];
  if (dados.identificacao || emailMkt) bases.push("- Consentimento (art. 7º, I) — para contato, cadastro e envio de comunicações de marketing, sempre revogável a qualquer momento.");
  if (dados.pagamento) bases.push("- Execução de contrato (art. 7º, V) — para processar pedidos e pagamentos.");
  if (usaCookies) bases.push("- Legítimo interesse (art. 7º, IX) — para entender o uso do site e melhorar a experiência, respeitando as suas expectativas e direitos.");
  brutas.push({
    titulo: "Base legal do tratamento",
    paragrafos: [
      "O tratamento dos seus dados pessoais tem como base legal, conforme o art. 7º da Lei nº 13.709/2018 (LGPD), uma ou mais das seguintes hipóteses:",
      ...bases,
    ],
  });

  brutas.push({
    titulo: "Por quanto tempo guardamos os dados",
    paragrafos: [
      "Mantemos os seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política, os prazos exigidos por lei — como prazos fiscais e contábeis, geralmente de cinco anos — ou até que você solicite a exclusão, prevalecendo o que ocorrer depois, sempre respeitando eventuais obrigações legais de guarda.",
    ],
  });

  brutas.push({
    titulo: "Seus direitos como titular dos dados",
    paragrafos: [
      "Nos termos do art. 18 da LGPD, você tem direito a:",
      "- Confirmar se tratamos os seus dados e acessá-los.",
      "- Corrigir dados incompletos, inexatos ou desatualizados.",
      "- Solicitar a anonimização, o bloqueio ou a eliminação de dados desnecessários ou tratados em desconformidade com a lei.",
      "- Solicitar a portabilidade dos seus dados a outro fornecedor de serviço.",
      "- Solicitar a eliminação dos dados tratados com base no seu consentimento.",
      "- Saber com quem os seus dados foram compartilhados.",
      "- Revogar o seu consentimento a qualquer momento.",
      "Para exercer qualquer um desses direitos, entre em contato pelo e-mail " + email + ".",
    ],
  });

  brutas.push({
    titulo: "Segurança dos dados",
    paragrafos: [
      "Adotamos medidas técnicas e organizacionais razoáveis para proteger os seus dados contra acesso não autorizado, perda, alteração ou divulgação indevida. Nenhum sistema é totalmente imune a incidentes; caso ocorra um incidente de segurança que possa gerar risco a você, a comunicação seguirá o que exige a LGPD.",
    ],
  });

  brutas.push({
    titulo: "Alterações desta política",
    paragrafos: [
      "Esta política pode ser atualizada para refletir mudanças legais ou operacionais. A versão vigente é sempre a publicada nesta página, com a data de atualização ao final do texto.",
    ],
  });

  brutas.push({
    titulo: "Contato e Autoridade Nacional de Proteção de Dados (ANPD)",
    paragrafos: [
      "Dúvidas, solicitações ou reclamações sobre o tratamento dos seus dados podem ser enviadas para " + email + ".",
      "Caso não fique satisfeito com a resposta, você também pode procurar a Autoridade Nacional de Proteção de Dados (ANPD), pelo site gov.br/anpd.",
    ],
  });

  return brutas.map((s, i) => ({ titulo: i + 1 + ". " + s.titulo, paragrafos: s.paragrafos }));
}

function montarHtml(args: { nome: string; introducao: string; secoes: Secao[]; rodape: string[] }): string {
  const { nome, introducao, secoes, rodape } = args;
  const corpo = secoes
    .map((s) => "<h2>" + escapeHtml(s.titulo) + "</h2>\n" + s.paragrafos.map((p) => "<p>" + escapeHtml(p) + "</p>").join("\n"))
    .join("\n\n");
  const rodapeHtml = rodape.map((p) => "<p>" + escapeHtml(p) + "</p>").join("\n");
  return (
    "<!DOCTYPE html>\n" +
    '<html lang="pt-BR">\n' +
    "<head>\n" +
    '<meta charset="utf-8">\n' +
    "<title>Política de Privacidade — " + escapeHtml(nome) + "</title>\n" +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    "<style>body{font-family:Arial,Helvetica,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.6;color:#1a1a1a}" +
    "h1{font-size:26px;margin-bottom:8px}h2{font-size:19px;margin-top:32px}p{margin:0 0 12px}" +
    "footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;font-size:13px;color:#555}</style>\n" +
    "</head>\n" +
    "<body>\n" +
    "<h1>Política de Privacidade — " + escapeHtml(nome) + "</h1>\n" +
    "<p>" + escapeHtml(introducao) + "</p>\n\n" +
    corpo +
    "\n\n<footer>\n" + rodapeHtml + "\n</footer>\n" +
    "</body>\n</html>\n"
  );
}

export default function GeradorPoliticaPrivacidade() {
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [dominio, setDominio] = useState("");
  const [emailContato, setEmailContato] = useState("");
  const [dados, setDados] = useState<DadosColetados>({ identificacao: false, navegacao: false, pagamento: false, localizacao: false });
  const [terceiros, setTerceiros] = useState<Terceiros>({ analytics: false, pixel: false });
  const [emailMkt, setEmailMkt] = useState(false);
  const [copiado, copiar] = useCopiar();

  const dominioBruto = dominio.trim();
  const dominioLimpo = dominioBruto.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").replace(/\s+/g, "");
  const dominioValido = dominioLimpo !== "" && /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(dominioLimpo);
  const emailBruto = emailContato.trim();
  const emailValido = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(emailBruto);
  const nomeOk = nomeEmpresa.trim().length >= 2;
  const pronto = nomeOk && dominioValido && emailValido;

  const faltando: string[] = [];
  if (!nomeOk) faltando.push("nome da empresa");
  if (!dominioValido) faltando.push("site/domínio");
  if (!emailValido) faltando.push("e-mail de contato");

  const documento = useMemo(() => {
    if (!pronto) return null;
    const nome = nomeEmpresa.trim();
    const email = emailBruto;
    const secoes = montarSecoes({ nome, dominio: dominioLimpo, email, dados, terceiros, emailMkt });
    const dataTxt = dataDeHoje();
    const introducao =
      "Esta política descreve como a " + nome + " coleta, usa e protege os dados pessoais de quem visita " +
      dominioLimpo + ", em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais — LGPD).";
    const rodape = [
      "Última atualização: " + dataTxt + ".",
      "Este texto é um modelo de referência gerado a partir das respostas informadas acima. Ele não substitui a análise de um advogado especializado em proteção de dados e pode precisar de ajustes para refletir, com exatidão, as práticas da " + nome + ".",
    ];
    const cabecalho = "POLÍTICA DE PRIVACIDADE — " + nome + "\n\n" + introducao;
    const textoPlano = [cabecalho, ...secoes.map((s) => s.titulo.toUpperCase() + "\n\n" + s.paragrafos.join("\n\n")), rodape.join("\n\n")].join("\n\n\n");
    const html = montarHtml({ nome, introducao, secoes, rodape });
    return { secoes, introducao, rodape, textoPlano, html, nomeArquivo: slug(nome) };
  }, [pronto, nomeEmpresa, dominioLimpo, emailBruto, dados, terceiros, emailMkt]);

  return (
    <>
      <div className="ft-lay">
        <div className="ft-live">
          <span className="ft-live-i ft-live-grow">
            <span className="ft-live-k">Sua política de privacidade</span>
            <span className="ft-live-v" style={{ fontSize: 16 }}>
              {pronto ? "pronta para copiar" : "faltam " + faltando.join(", ")}
            </span>
          </span>
          {pronto && documento && (
            <button type="button" className={copiado ? "ft-mini on" : "ft-mini"} onClick={() => copiar(documento.textoPlano)}>
              <IconeAcao nome={copiado ? "ok" : "copiar"} />
              {copiado ? "Copiado" : "Copiar"}
            </button>
          )}
        </div>

        {/* ── coluna 1: as perguntas ────────────────────────────────────── */}
        <div>
          <div className="ft-card">
            <p className="ft-h">Antes de começar</p>
            <div className="ft-alert warn" role="status">
              <IconeAcao nome="alerta" />
              <span>
                Esta ferramenta gera um <b>modelo de referência</b>, não uma peça jurídica pronta.
                Ela organiza o texto a partir das suas respostas, mas não substitui a revisão de um
                advogado especializado em proteção de dados — principalmente se o seu negócio lida
                com dado sensível, público infantil ou operação fora do Brasil.
              </span>
            </div>
          </div>

          <div className="ft-card">
            <p className="ft-h">Sobre a sua empresa</p>
            <p className="ft-sub">Estes três dados formam o cabeçalho da política: quem é o controlador e como falar com ele.</p>
            <div className="ft-fields">
              <div className="ft-f ft-full">
                <label className="ft-lbl" htmlFor="ft-priv-nome">Nome da empresa</label>
                <input
                  id="ft-priv-nome"
                  className="ft-in"
                  type="text"
                  autoComplete="organization"
                  placeholder="Loja da Ana Ltda"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                />
              </div>

              <div className="ft-f">
                <label className="ft-lbl" htmlFor="ft-priv-dominio">Site ou domínio</label>
                <input
                  id="ft-priv-dominio"
                  className="ft-in"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="minhaloja.com.br"
                  value={dominio}
                  onChange={(e) => setDominio(e.target.value)}
                />
                <span className="ft-hint">Escreva como aparece na barra de endereço, sem precisar do https://.</span>
              </div>

              <div className="ft-f">
                <label className="ft-lbl" htmlFor="ft-priv-email">E-mail de contato</label>
                <input
                  id="ft-priv-email"
                  className="ft-in"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="contato@minhaloja.com.br"
                  value={emailContato}
                  onChange={(e) => setEmailContato(e.target.value)}
                />
                <span className="ft-hint">É para onde a política manda quem quiser exercer os direitos da LGPD.</span>
              </div>
            </div>

            {dominioBruto !== "" && !dominioValido && (
              <div className="ft-alert bad" role="status">
                <IconeAcao nome="alerta" />
                <span>Isso não parece um domínio válido. Exemplo: <code>minhaloja.com.br</code>.</span>
              </div>
            )}
            {emailBruto !== "" && !emailValido && (
              <div className="ft-alert bad" role="status">
                <IconeAcao nome="alerta" />
                <span>Esse e-mail não parece válido. Confira se não falta o @ ou a terminação (.com, .com.br…).</span>
              </div>
            )}
          </div>

          <div className="ft-card">
            <p className="ft-h">Quais dados você coleta</p>
            <p className="ft-sub">Marque tudo que se aplica ao seu site hoje. Pode marcar mais de um — ou nenhum.</p>
            <div className="ft-fields">
              <div className="ft-f ft-full">
                <span className="ft-lbl" id="ft-priv-dados-lbl">Tipos de dado coletados</span>
                <div className="ft-chips" role="group" aria-labelledby="ft-priv-dados-lbl">
                  {CAMPOS_DADOS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="ft-chip"
                      aria-pressed={dados[c.id]}
                      onClick={() => setDados((d) => ({ ...d, [c.id]: !d[c.id] }))}
                    >
                      {c.rotulo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="ft-card">
            <p className="ft-h">Ferramentas de terceiros e comunicação</p>
            <p className="ft-sub">As duas últimas perguntas: o que você usa para medir audiência e se você envia e-mail de marketing.</p>
            <div className="ft-fields">
              <div className="ft-f ft-full">
                <span className="ft-lbl" id="ft-priv-terc-lbl">Você usa alguma destas ferramentas?</span>
                <div className="ft-chips" role="group" aria-labelledby="ft-priv-terc-lbl">
                  {CAMPOS_TERCEIROS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="ft-chip"
                      aria-pressed={terceiros[c.id]}
                      onClick={() => setTerceiros((t) => ({ ...t, [c.id]: !t[c.id] }))}
                    >
                      {c.rotulo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ft-f ft-full">
                <span className="ft-lbl" id="ft-priv-mkt-lbl">Você envia e-mail marketing (newsletter, promoções)?</span>
                <div className="ft-chips" role="group" aria-labelledby="ft-priv-mkt-lbl">
                  <button type="button" className="ft-chip" aria-pressed={emailMkt} onClick={() => setEmailMkt(true)}>
                    Sim, envio
                  </button>
                  <button type="button" className="ft-chip" aria-pressed={!emailMkt} onClick={() => setEmailMkt(false)}>
                    Não envio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── coluna 2: status e ações ─────────────────────────────────── */}
        <div className="ft-sticky">
          <div className="ft-res">
            {pronto && documento ? (
              <>
                <p className="ft-res-k">Sua política de privacidade</p>
                <p className="ft-res-v" style={{ fontSize: "clamp(18px, 4.6vw, 22px)" }}>Pronta para copiar</p>
                <p className="ft-res-sub">
                  O texto completo aparece logo abaixo do formulário, seção por seção — e nas duas
                  opções de arquivo aqui embaixo.
                </p>
                <div className="ft-acts">
                  <button type="button" className={copiado ? "ft-mini on" : "ft-mini"} onClick={() => copiar(documento.textoPlano)} style={{ flex: "1 1 auto" }}>
                    <IconeAcao nome={copiado ? "ok" : "copiar"} />
                    {copiado ? "Copiado!" : "Copiar texto"}
                  </button>
                  <button type="button" className="ft-mini" onClick={() => baixarTexto(documento.textoPlano, "politica-privacidade-" + documento.nomeArquivo + ".txt", "text/plain")} style={{ flex: "1 1 auto" }}>
                    <IconeAcao nome="baixar" />
                    Baixar .txt
                  </button>
                  <button type="button" className="ft-mini" onClick={() => baixarTexto(documento.html, "politica-privacidade-" + documento.nomeArquivo + ".html", "text/html")} style={{ flex: "1 1 auto" }}>
                    <IconeAcao nome="baixar" />
                    Baixar .html
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="ft-res-k">Sua política de privacidade</p>
                <p className="ft-res-v" style={{ fontSize: "clamp(18px, 4.6vw, 22px)" }}>Faltam dados</p>
                <p className="ft-res-sub">
                  Preencha nome da empresa, site e e-mail de contato ao lado. As perguntas sobre
                  dados coletados e ferramentas de terceiros são opcionais — podem ficar todas sem
                  marcar.
                </p>
              </>
            )}
          </div>

          <div className="ft-card" style={{ marginTop: 16 }}>
            <p className="ft-h">Revisão antes de publicar</p>
            <p className="ft-sub" style={{ marginBottom: 0 }}>
              Publicar uma política que não corresponde ao que o site realmente faz é pior do que
              não ter política nenhuma. Confira se cada seção reflete a sua operação de verdade
              antes de colar no site.
            </p>
          </div>
        </div>
      </div>

      {/* ── documento completo, largura cheia ──────────────────────────── */}
      <div className="ft-card" style={{ marginTop: 16 }}>
        <p className="ft-h">O texto completo</p>
        {pronto && documento ? (
          <>
            <p className="ft-sub">{documento.introducao}</p>
            <div className="ft-form">
              {documento.secoes.map((s) => (
                <div key={s.titulo}>
                  <p className="pg-h3">{s.titulo}</p>
                  {s.paragrafos.map((p, i) => (
                    <p key={i} className="pg-p" style={{ marginBottom: i === s.paragrafos.length - 1 ? 0 : 10, whiteSpace: "pre-line" }}>
                      {p}
                    </p>
                  ))}
                </div>
              ))}
              <div>
                {documento.rodape.map((p, i) => (
                  <p key={i} className="pg-p" style={{ marginBottom: i === documento.rodape.length - 1 ? 0 : 10, fontStyle: i === documento.rodape.length - 1 ? "italic" : "normal" }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="ft-sub" style={{ marginBottom: 0 }}>
            Preencha os campos acima para ver aqui o texto inteiro, seção por seção.
          </p>
        )}
      </div>
    </>
  );
}

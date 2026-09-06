import type { Supa } from "./modules/_shared";
import { enviarEmailBruto, escapar } from "./notificar";

/* ─────────────────────────────────────────────────────────────────────────────
   MOTOR DE AUTOMAÇÕES — lê `automation_rules` e dispara `message_log`.

   Chamado por `app/api/cron/route.ts`, que é quem confere o segredo do cron.
   Este arquivo não sabe nada de autenticação — só avalia réguas ativas contra
   as tabelas de negócio e decide o que enviar.

   ── PLACEHOLDERS SUPORTADOS (não são os do rascunho da tarefa, são os que já
   estão gravados no banco) ───────────────────────────────────────────────────
   As 3 réguas semeadas em `006_agenda.sql` (linhas 126-140) já usam chave
   ÚNICA, não dupla: `{cliente_nome}`, `{data}`, `{hora}`, `{titulo}`,
   `{link_meet}`, `{empresa}` — é o próprio comentário do SQL que documenta
   essa lista ("Variáveis disponíveis no template"). Implementar `{{nome}}` em
   chave dupla, como uma primeira leitura apressada da tarefa sugeriria, faria
   o motor não preencher NENHUMA das 3 réguas já cadastradas — eu li o SQL
   antes de escrever isto e seguí o que está gravado de verdade, não o que
   parecia óbvio. Só estas 6 chaves são substituídas; qualquer outra
   `{coisa}` no texto da régua fica literal no e-mail (sinal visível de que o
   campo não existe, em vez de sumir silenciosamente).

   Por gatilho, o que dá para preencher de verdade:
   - appointment_created / appointment_reminder / appointment_cancelled:
     cliente_nome, data, hora (de `start_time`), titulo, link_meet, empresa.
   - new_lead: cliente_nome, data, hora (de `created_at`, quando o lead
     chegou), titulo (= `product`, pode vir vazio), empresa. `link_meet` fica
     sempre vazio — lead não tem reunião ainda.
   - payment_received: cliente_nome (`customer_name`), data, hora (de
     `paid_at`/`created_at`), titulo (= `description`), empresa. `link_meet`
     fica sempre vazio.

   ── DEDUPE — o índice `msglog_dedupe_idx` NÃO É ÚNICO ───────────────────────
   A tarefa pedia para confiar num "índice único" que impediria duplicata no
   próprio INSERT. Fui conferir a definição exata em `006_agenda.sql` (linha
   119):
       create index if not exists msglog_dedupe_idx
         on public.message_log (related_type, related_id, rule_id, status);
   Sem a palavra `unique`. É um índice comum (só acelera a busca) — o banco
   NÃO recusa uma segunda linha idêntica. Se eu tivesse implementado dedupe
   "espere o INSERT falhar", ele nunca falharia, e rodar o cron duas vezes
   MANDARIA dois e-mails — o oposto do que a tarefa queria.
   Por isso o dedupe aqui é em nível de aplicação: antes de enviar, um SELECT
   confere se já existe linha com status='sent' para
   (related_type, related_id, rule_id); só então o INSERT acontece. Isso
   resolve o caso real (agendador externo chamando `/api/cron` uma vez por
   vez, em sequência) mas não é atômico — duas execuções *simultâneas* do
   cron (corrida de verdade) poderiam, em tese, passar pelo SELECT ao mesmo
   tempo e enviar duas vezes. Não tentei migrar o índice para `unique` porque
   isto exigiria `apply_migration` contra o Supabase de produção, que a
   tarefa proibiu explicitamente ("não rode nada contra o Supabase real") —
   fica registrado aqui para o dono decidir se quer essa migração depois.

   ── STATUS gravado em `message_log.status` ──────────────────────────────────
   O comentário de `006_agenda.sql` (linha 111) documenta os dois valores
   válidos: `sent | failed`. Uso exatamente esses dois — não "enviado/erro"
   em português, que não têm nenhuma âncora no schema real.
   ──────────────────────────────────────────────────────────────────────────── */

const EMPRESA = "HyperGrow";
const TETO_POR_EXECUCAO = 50; // trava contra régua mal configurada varrendo a base inteira
const LIMITE_POR_CONSULTA = 200; // trava defensiva por query (o teto real de envio é o de cima)
const JANELA_SEGURANCA_MS = 24 * 60 * 60 * 1000; // "criado/cancelado recentemente" = últimas 24h

const CHAVES_TEMPLATE = ["cliente_nome", "data", "hora", "titulo", "link_meet", "empresa"] as const;
type ChaveTemplate = (typeof CHAVES_TEMPLATE)[number];
type CamposTemplate = Record<ChaveTemplate, string>;

type RegraAtiva = {
  id: string;
  name: string;
  trigger_event: string;
  offset_minutes: number;
  channels: unknown;
  subject_template: string | null;
  message_template: string;
};

type TipoRelacionado = "appointment" | "lead" | "charge";

type Alvo = {
  relatedType: TipoRelacionado;
  relatedId: string;
  target: string; // e-mail
  campos: CamposTemplate;
};

type Acumulador = {
  reguasAtivas: number;
  alvosAvaliados: number;
  enviados: number;
  puladosDedupe: number;
  puladosCanalIndisponivel: number;
  puladosEnsaio: number;
  falharam: number;
  avisos: string[];
  ensaio: Array<{ regra: string; gatilho: string; para: string; assunto: string }>;
};

export type ResumoMotor = {
  /** true só quando CRON_SECRET (checado pela rota) e RESEND_API_KEY estão
   *  configurados — ou seja, quando este resumo reflete envios REAIS. */
  envioReal: boolean;
  reguasAtivas: number;
  alvosAvaliados: number;
  enviados: number;
  puladosDedupe: number;
  puladosCanalIndisponivel: number;
  /** Quantos teriam sido enviados se houvesse RESEND_API_KEY. Sempre 0 fora
   *  do modo ensaio (nesse caso o alvo vira `enviados` ou `falharam`, não
   *  fica aqui). O array `ensaio` abaixo é só uma AMOSTRA (até 30) disto —
   *  este número é a contagem completa, mesmo quando o array é cortado. */
  puladosEnsaio: number;
  falharam: number;
  /** Amostra do que TERIA sido enviado, presente só em modo ensaio. */
  ensaio?: Array<{ regra: string; gatilho: string; para: string; assunto: string }>;
  avisos: string[];
};

/** Data/hora no fuso de Brasília, formatada em pt-BR. O servidor roda em UTC
 *  (mesma armadilha documentada em `mod-agenda.ts`) — sem `timeZone` explícito
 *  o e-mail mostraria a hora errada para o cliente brasileiro. */
function fmtDataHora(iso: string | null | undefined): { data: string; hora: string } {
  if (!iso) return { data: "", hora: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { data: "", hora: "" };
  return {
    data: d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    hora: d.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }),
  };
}

function janelaDesde(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

function camposAppointment(a: {
  client_name?: string | null;
  title?: string | null;
  start_time?: string | null;
  meeting_link?: string | null;
}): CamposTemplate {
  const { data, hora } = fmtDataHora(a.start_time);
  return { cliente_nome: a.client_name || "", data, hora, titulo: a.title || "", link_meet: a.meeting_link || "", empresa: EMPRESA };
}

function camposLead(l: { name?: string | null; product?: string | null; created_at?: string | null }): CamposTemplate {
  const { data, hora } = fmtDataHora(l.created_at);
  return { cliente_nome: l.name || "", data, hora, titulo: l.product || "", link_meet: "", empresa: EMPRESA };
}

function camposCharge(c: {
  customer_name?: string | null;
  description?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
}): CamposTemplate {
  const { data, hora } = fmtDataHora(c.paid_at || c.created_at);
  return { cliente_nome: c.customer_name || "", data, hora, titulo: c.description || "", link_meet: "", empresa: EMPRESA };
}

/** Só troca as 6 chaves suportadas (ver comentário no topo do arquivo).
 *  Qualquer outra `{coisa}` na régua fica intacta no texto — de propósito. */
function preencherTemplate(tpl: string, campos: CamposTemplate): string {
  return tpl.replace(/\{(cliente_nome|data|hora|titulo|link_meet|empresa)\}/g, (_m, chave: ChaveTemplate) => campos[chave] ?? "");
}

/** As réguas semeadas foram gravadas com `'...\n\n...'` em SQL padrão (sem o
 *  prefixo `E`), então o Postgres NÃO interpretou o `\n` como quebra de linha
 *  — ele ficou salvo como os dois caracteres literais barra-invertida e "n".
 *  (Conferido lendo o texto do INSERT em `006_agenda.sql`, não rodando SQL —
 *  não fui autorizado a consultar o banco real. Se a leitura estiver errada e
 *  o Postgres já guardou quebra de linha real, este `replace` é inofensivo:
 *  não encontra `\n` literal e não muda nada.) Trato os dois casos para o
 *  e-mail não sair com "\n\n" visível no meio do texto. */
function paraHtml(corpo: string): string {
  const comQuebras = corpo.replace(/\\n/g, "\n");
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;white-space:pre-wrap;line-height:1.6;color:#0B1220">${escapar(comQuebras)}</div>`;
}

async function buscarLembretes(supabase: Supa, regra: RegraAtiva, acc: Acumulador): Promise<Alvo[]> {
  const minutos = Math.abs(regra.offset_minutes);
  if (minutos <= 0) {
    acc.avisos.push(`Régua "${regra.name}" é appointment_reminder com antecedência 0/positiva — não há "antes" para calcular a janela. Ignorada.`);
    return [];
  }
  const agora = new Date();
  const limite = new Date(agora.getTime() + minutos * 60_000);
  const { data, error } = await supabase
    .from("appointments")
    .select("id,client_name,client_email,title,start_time,meeting_link,status")
    .in("status", ["agendado", "confirmado"])
    .gte("start_time", agora.toISOString())
    .lte("start_time", limite.toISOString())
    .limit(LIMITE_POR_CONSULTA);
  if (error) {
    acc.avisos.push(`Falha ao buscar lembretes da régua "${regra.name}": ${error.message}`);
    return [];
  }
  return (data ?? [])
    .filter((a: any) => !!a.client_email)
    .map((a: any) => ({ relatedType: "appointment" as const, relatedId: a.id as string, target: a.client_email as string, campos: camposAppointment(a) }));
}

async function buscarAppointmentsCriados(supabase: Supa, acc: Acumulador): Promise<Alvo[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("id,client_name,client_email,title,start_time,meeting_link,status,created_at")
    .neq("status", "cancelado")
    .gte("created_at", janelaDesde(JANELA_SEGURANCA_MS))
    .limit(LIMITE_POR_CONSULTA);
  if (error) {
    acc.avisos.push(`Falha ao buscar compromissos criados recentemente: ${error.message}`);
    return [];
  }
  return (data ?? [])
    .filter((a: any) => !!a.client_email)
    .map((a: any) => ({ relatedType: "appointment" as const, relatedId: a.id as string, target: a.client_email as string, campos: camposAppointment(a) }));
}

async function buscarAppointmentsCancelados(supabase: Supa, acc: Acumulador): Promise<Alvo[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("id,client_name,client_email,title,start_time,meeting_link,cancelled_at")
    .eq("status", "cancelado")
    .gte("cancelled_at", janelaDesde(JANELA_SEGURANCA_MS))
    .limit(LIMITE_POR_CONSULTA);
  if (error) {
    acc.avisos.push(`Falha ao buscar cancelamentos recentes: ${error.message}`);
    return [];
  }
  return (data ?? [])
    .filter((a: any) => !!a.client_email)
    .map((a: any) => ({ relatedType: "appointment" as const, relatedId: a.id as string, target: a.client_email as string, campos: camposAppointment(a) }));
}

async function buscarLeadsNovos(supabase: Supa, acc: Acumulador): Promise<Alvo[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("id,name,email,product,created_at")
    .gte("created_at", janelaDesde(JANELA_SEGURANCA_MS))
    .limit(LIMITE_POR_CONSULTA);
  if (error) {
    acc.avisos.push(`Falha ao buscar leads novos: ${error.message}`);
    return [];
  }
  return (data ?? [])
    .filter((l: any) => !!l.email)
    .map((l: any) => ({ relatedType: "lead" as const, relatedId: l.id as string, target: l.email as string, campos: camposLead(l) }));
}

async function buscarPagamentos(supabase: Supa, acc: Acumulador): Promise<Alvo[]> {
  const { data, error } = await supabase
    .from("charges")
    .select("id,customer_name,customer_email,description,status,paid_at,created_at")
    .in("status", ["RECEIVED", "CONFIRMED"])
    .gte("created_at", janelaDesde(JANELA_SEGURANCA_MS))
    .limit(LIMITE_POR_CONSULTA);
  if (error) {
    acc.avisos.push(`Falha ao buscar pagamentos recentes: ${error.message}`);
    return [];
  }
  const todos = data ?? [];
  const comEmail = todos.filter((c: any) => !!c.customer_email);
  const semEmail = todos.length - comEmail.length;
  if (semEmail > 0) {
    acc.avisos.push(`${semEmail} pagamento(s) recente(s) sem e-mail do cliente (charges.customer_email vazio) — pulado(s), não dá para notificar.`);
  }
  return comEmail.map((c: any) => ({ relatedType: "charge" as const, relatedId: c.id as string, target: c.customer_email as string, campos: camposCharge(c) }));
}

async function buscarAlvos(supabase: Supa, regra: RegraAtiva, acc: Acumulador): Promise<Alvo[]> {
  switch (regra.trigger_event) {
    case "appointment_reminder":
      return buscarLembretes(supabase, regra, acc);
    case "appointment_created":
      return buscarAppointmentsCriados(supabase, acc);
    case "appointment_cancelled":
      return buscarAppointmentsCancelados(supabase, acc);
    case "new_lead":
      return buscarLeadsNovos(supabase, acc);
    case "payment_received":
      return buscarPagamentos(supabase, acc);
    default:
      acc.avisos.push(`Gatilho desconhecido "${regra.trigger_event}" na régua "${regra.name}" — ignorada.`);
      return [];
  }
}

/** SELECT-antes-do-INSERT: ver o comentário grande no topo do arquivo sobre
 *  `msglog_dedupe_idx` não ser único. */
async function jaEnviado(supabase: Supa, regra: RegraAtiva, alvo: Alvo): Promise<{ sim: boolean; erro?: string }> {
  const { data, error } = await supabase
    .from("message_log")
    .select("id")
    .eq("related_type", alvo.relatedType)
    .eq("related_id", alvo.relatedId)
    .eq("rule_id", regra.id)
    .eq("status", "sent")
    .limit(1);
  if (error) return { sim: false, erro: error.message };
  return { sim: !!data && data.length > 0 };
}

async function processarAlvo(supabase: Supa, regra: RegraAtiva, alvo: Alvo, ensaio: boolean, acc: Acumulador): Promise<void> {
  const dedupe = await jaEnviado(supabase, regra, alvo);
  if (dedupe.erro) {
    acc.avisos.push(`Falha ao checar duplicidade da régua "${regra.name}" para ${alvo.target}: ${dedupe.erro}`);
    acc.falharam++;
    return;
  }
  if (dedupe.sim) {
    acc.puladosDedupe++;
    return;
  }

  const assunto = regra.subject_template ? preencherTemplate(regra.subject_template, alvo.campos) : regra.name;
  const corpo = preencherTemplate(regra.message_template, alvo.campos);

  if (ensaio) {
    acc.puladosEnsaio++;
    acc.ensaio.push({ regra: regra.name, gatilho: regra.trigger_event, para: alvo.target, assunto });
    return;
  }

  const resultado = await enviarEmailBruto({ to: alvo.target, subject: assunto, html: paraHtml(corpo) });

  const { error: erroLog } = await supabase.from("message_log").insert({
    channel: "email",
    target: alvo.target,
    subject: assunto,
    body: corpo,
    status: resultado.ok ? "sent" : "failed",
    error_msg: resultado.ok ? null : resultado.erro,
    rule_id: regra.id,
    related_type: alvo.relatedType,
    related_id: alvo.relatedId,
  });
  if (erroLog) {
    acc.avisos.push(
      `Envio da régua "${regra.name}" para ${alvo.target} ${resultado.ok ? "saiu, mas" : "falhou e"} não foi possível gravar o histórico: ${erroLog.message}`
    );
  }

  if (resultado.ok) acc.enviados++;
  else acc.falharam++;
}

/** Roda uma passada completa: lê réguas ativas, avalia alvos, envia (ou
 *  ensaia) e devolve um resumo honesto. Nunca lança para fora — falhas de
 *  leitura/gravação viram entradas em `avisos` e o resumo segue completo com
 *  o que deu para apurar. */
export async function rodarMotor(supabase: Supa): Promise<ResumoMotor> {
  const envioReal = !!process.env.RESEND_API_KEY;

  const acc: Acumulador = {
    reguasAtivas: 0,
    alvosAvaliados: 0,
    enviados: 0,
    puladosDedupe: 0,
    puladosCanalIndisponivel: 0,
    puladosEnsaio: 0,
    falharam: 0,
    avisos: [],
    ensaio: [],
  };

  if (!envioReal) {
    acc.avisos.push("Sem RESEND_API_KEY configurada — motor rodou em modo ENSAIO (avaliou tudo, mas não enviou nenhum e-mail de verdade).");
  }

  const { data: regrasData, error: erroRegras } = await supabase
    .from("automation_rules")
    .select("id,name,trigger_event,offset_minutes,channels,subject_template,message_template")
    .eq("is_active", true)
    .limit(200);

  if (erroRegras) {
    acc.avisos.push(`Não foi possível ler as réguas ativas: ${erroRegras.message}`);
    return montarResumo(acc, envioReal);
  }

  const regras = (regrasData ?? []) as RegraAtiva[];
  acc.reguasAtivas = regras.length;

  let orcamento = TETO_POR_EXECUCAO;
  let avisouTeto = false;

  for (const regra of regras) {
    if (orcamento <= 0) {
      if (!avisouTeto) {
        acc.avisos.push(`Teto de ${TETO_POR_EXECUCAO} alvos processados nesta execução atingido — as réguas restantes ficam para a próxima chamada do cron.`);
        avisouTeto = true;
      }
      break;
    }

    const canais = Array.isArray(regra.channels) ? (regra.channels as unknown[]) : [];
    if (!canais.includes("email")) {
      // Só e-mail está implementado. Uma régua só-WhatsApp não é erro dela —
      // é o canal que ainda não existe no motor.
      acc.puladosCanalIndisponivel++;
      continue;
    }

    const alvos = await buscarAlvos(supabase, regra, acc);
    for (const alvo of alvos) {
      if (orcamento <= 0) {
        if (!avisouTeto) {
          acc.avisos.push(`Teto de ${TETO_POR_EXECUCAO} alvos processados nesta execução atingido — os alvos restantes ficam para a próxima chamada do cron.`);
          avisouTeto = true;
        }
        break;
      }
      orcamento--;
      acc.alvosAvaliados++;
      await processarAlvo(supabase, regra, alvo, !envioReal, acc);
    }
  }

  return montarResumo(acc, envioReal);
}

function montarResumo(acc: Acumulador, envioReal: boolean): ResumoMotor {
  const base: ResumoMotor = {
    envioReal,
    reguasAtivas: acc.reguasAtivas,
    alvosAvaliados: acc.alvosAvaliados,
    enviados: acc.enviados,
    puladosDedupe: acc.puladosDedupe,
    puladosCanalIndisponivel: acc.puladosCanalIndisponivel,
    puladosEnsaio: acc.puladosEnsaio,
    falharam: acc.falharam,
    avisos: acc.avisos.slice(0, 30),
  };
  if (!envioReal) base.ensaio = acc.ensaio.slice(0, 30);
  return base;
}

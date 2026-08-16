import { Ctx, ModResult, ok, fail, str, assertGravou } from "./_shared";

/* ─────────────────────────────────────────────────────────────────────────────
   Automações — réguas de mensagem (`automation_rules`) e o histórico
   (`message_log`).

   ⚠️ O QUE EXISTE E O QUE NÃO EXISTE (dizer isto é obrigatório):
   as duas tabelas já estão no banco desde `006_agenda.sql`, inclusive com três
   réguas semeadas. O MOTOR que lê as réguas e dispara as mensagens NÃO existe:
   não há cron, não há provedor de e-mail configurado, `message_log` está vazio.

   Ou seja: esta tela cadastra e edita as réguas — ela NÃO faz nada ser enviado.
   Marcar uma régua como ativa aqui não manda mensagem nenhuma. A interface diz
   isso em letras grandes, de propósito: uma tela que parece funcionar e não
   funciona é pior do que tela nenhuma, porque o dono confia e o cliente não
   recebe o lembrete.

   Para ligar de verdade faltam três coisas, nesta ordem: um provedor de e-mail
   (Resend), uma rota de cron (`/api/cron`, que é uma das funções que ainda
   cabem no limite da Vercel) e o motor de disparo com a idempotência que o
   índice `msglog_dedupe_idx` já prevê.
   ──────────────────────────────────────────────────────────────────────────── */

export const GATILHOS = [
  "appointment_created",
  "appointment_reminder",
  "appointment_cancelled",
  "new_lead",
  "payment_received",
] as const;
type Gatilho = (typeof GATILHOS)[number];

export const ROTULO_GATILHO: Record<Gatilho, string> = {
  appointment_created: "Compromisso agendado",
  appointment_reminder: "Lembrete de compromisso",
  appointment_cancelled: "Compromisso cancelado",
  new_lead: "Lead novo chegou",
  payment_received: "Pagamento recebido",
};

const CAMPOS =
  "id,name,trigger_event,offset_minutes,channels,subject_template,message_template,is_active,created_at,updated_at";

/** O motor ainda não existe — este flag é lido pela tela para avisar o dono. */
export const MOTOR_ATIVO = false;

export async function modAutomacoes(action: string, ctx: Ctx): Promise<ModResult> {
  const { supabase, body } = ctx;

  switch (action) {
    case "list": {
      const { data, error } = await supabase
        .from("automation_rules")
        .select(CAMPOS)
        .order("trigger_event", { ascending: true })
        .order("offset_minutes", { ascending: true })
        .limit(200);
      if (error) return fail(error.message, 500);
      return ok({ regras: data ?? [], motorAtivo: MOTOR_ATIVO, gatilhos: GATILHOS });
    }

    case "create": {
      const name = str(body.name, 160);
      const template = str(body.message_template, 4000);
      const gatilho = body.trigger_event as Gatilho;
      if (!name) return fail("Informe o nome da régua.");
      if (!GATILHOS.includes(gatilho)) return fail("Gatilho inválido.");
      if (!template) return fail("Escreva a mensagem que será enviada.");

      const { data, error } = await supabase
        .from("automation_rules")
        .insert({
          name,
          trigger_event: gatilho,
          // Negativo = antes do evento (lembrete); positivo = depois (follow-up).
          offset_minutes: Number.isFinite(Number(body.offset_minutes)) ? Math.trunc(Number(body.offset_minutes)) : 0,
          channels: ["email"],
          subject_template: str(body.subject_template, 300),
          message_template: template,
          is_active: body.is_active !== false,
        })
        .select(CAMPOS);

      try {
        return ok({ regra: assertGravou(data, error, "Criar régua")[0] });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    case "update": {
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");

      const patch: Record<string, unknown> = {};
      if (body.name !== undefined) patch.name = str(body.name, 160);
      if (body.subject_template !== undefined) patch.subject_template = str(body.subject_template, 300);
      if (body.message_template !== undefined) {
        const t = str(body.message_template, 4000);
        if (!t) return fail("A mensagem não pode ficar vazia.");
        patch.message_template = t;
      }
      if (body.trigger_event !== undefined) {
        if (!GATILHOS.includes(body.trigger_event as Gatilho)) return fail("Gatilho inválido.");
        patch.trigger_event = body.trigger_event;
      }
      if (body.offset_minutes !== undefined) {
        const n = Number(body.offset_minutes);
        if (!Number.isFinite(n)) return fail("Antecedência inválida.");
        patch.offset_minutes = Math.trunc(n);
      }
      if (body.is_active !== undefined) patch.is_active = body.is_active === true;
      if (Object.keys(patch).length === 0) return fail("Nada para alterar.");

      const { data, error } = await supabase.from("automation_rules").update(patch).eq("id", id).select(CAMPOS);
      try {
        return ok({ regra: assertGravou(data, error, "Salvar régua")[0] });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    case "delete": {
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");
      const { data, error } = await supabase.from("automation_rules").delete().eq("id", id).select("id");
      try {
        assertGravou(data, error, "Excluir régua");
        return ok();
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    /* ── Histórico de envios ────────────────────────────────────────────── */
    case "log": {
      const { data, error } = await supabase
        .from("message_log")
        .select("id,channel,target,subject,status,error_msg,rule_id,related_type,related_id,sent_at")
        .order("sent_at", { ascending: false })
        .limit(100);
      if (error) return fail(error.message, 500);
      return ok({ envios: data ?? [], motorAtivo: MOTOR_ATIVO });
    }

    default:
      return fail(`Ação desconhecida: ${action}`, 404);
  }
}

import { Ctx, ModResult, ok, fail, str, isEmail, assertGravou } from "./_shared";

/* ─────────────────────────────────────────────────────────────────────────────
   Agenda — compromissos (`appointments`) e a tela "Meu dia".

   A tabela JÁ EXISTIA no banco desde `006_agenda.sql`, mas nenhuma tela usava:
   só o webhook do Cal.com escrevia por perto. Este módulo é o CRUD que faltava.
   Nada de Google Calendar aqui — o OAuth do Google exige uma rota de callback
   própria, que é justamente o que o limite de funções da Vercel não permite
   agora. Quando entrar, entra como rota dedicada e planejada.

   ── FUSO HORÁRIO (a armadilha desta tela) ───────────────────────────────────
   O servidor da Vercel roda em UTC. Um horário digitado como "14:00" no Brasil
   (UTC-3) viraria 14:00 UTC = 11:00 no Brasil se o servidor fizesse a conversão.
   Por isso o NAVEGADOR manda o instante já em ISO com fuso (`toISOString()`),
   e o "Meu dia" manda também o começo e o fim do SEU dia. O servidor não
   adivinha fuso de ninguém — só valida o que chegou.
   ──────────────────────────────────────────────────────────────────────────── */

export const STATUS_AGENDA = ["agendado", "confirmado", "concluido", "cancelado", "faltou"] as const;
type StatusAgenda = (typeof STATUS_AGENDA)[number];

const CAMPOS =
  "id,lead_id,client_name,client_email,client_phone,title,notes,start_time,end_time,status,source,meeting_link,confirmed_at,cancelled_at,created_by,created_at,updated_at";

/** Aceita só instante ISO válido (o navegador manda `toISOString()`). */
function instante(v: unknown): string | null {
  const s = str(v, 40);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Mensagem em português para o índice único de horário de 006_agenda.sql. */
function traduzErro(msg?: string): string {
  if (msg && /appt_no_overlap_idx|duplicate key/i.test(msg)) {
    return "Já existe um compromisso começando exatamente nesse horário. Escolha outro horário.";
  }
  return msg || "Erro no banco.";
}

export async function modAgenda(action: string, ctx: Ctx): Promise<ModResult> {
  const { supabase, body, user } = ctx;

  switch (action) {
    /* ── Lista por período ──────────────────────────────────────────────── */
    case "list": {
      const de = instante(body.de);
      const ate = instante(body.ate);
      const status = str(body.status, 20);

      let q = supabase.from("appointments").select(CAMPOS);
      if (de) q = q.gte("start_time", de);
      if (ate) q = q.lte("start_time", ate);
      if (status && STATUS_AGENDA.includes(status as StatusAgenda)) q = q.eq("status", status);

      const { data, error } = await q.order("start_time", { ascending: true }).limit(500);
      if (error) return fail(error.message, 500);
      return ok({ itens: data ?? [] });
    }

    /* ── Cria compromisso ───────────────────────────────────────────────── */
    case "create": {
      const clientName = str(body.client_name, 120);
      const clientEmail = str(body.client_email, 160)?.toLowerCase() ?? "";
      const inicio = instante(body.start_time);
      const fim = instante(body.end_time);

      if (!clientName) return fail("Informe o nome do cliente.");
      if (!isEmail(clientEmail)) return fail("E-mail do cliente inválido.");
      if (!inicio) return fail("Informe a data e a hora de início.");
      if (!fim) return fail("Informe a data e a hora de término.");
      if (new Date(fim).getTime() <= new Date(inicio).getTime()) {
        return fail("O término precisa ser depois do início.");
      }

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          lead_id: str(body.lead_id, 60),
          client_name: clientName,
          client_email: clientEmail,
          client_phone: str(body.client_phone, 40),
          title: str(body.title, 160) || "Reunião",
          notes: str(body.notes, 2000),
          start_time: inicio,
          end_time: fim,
          status: STATUS_AGENDA.includes(body.status as StatusAgenda) ? body.status : "agendado",
          source: "painel",
          meeting_link: str(body.meeting_link, 500),
          created_by: user?.email ?? null,
        })
        .select(CAMPOS);

      try {
        return ok({ item: assertGravou(data, error && { message: traduzErro(error.message) }, "Agendar")[0] });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    /* ── Edita ──────────────────────────────────────────────────────────── */
    case "update": {
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");

      const patch: Record<string, unknown> = {};
      if (body.client_name !== undefined) patch.client_name = str(body.client_name, 120);
      if (body.client_email !== undefined) {
        if (!isEmail(body.client_email)) return fail("E-mail do cliente inválido.");
        patch.client_email = (body.client_email as string).toLowerCase();
      }
      if (body.client_phone !== undefined) patch.client_phone = str(body.client_phone, 40);
      if (body.title !== undefined) patch.title = str(body.title, 160);
      if (body.notes !== undefined) patch.notes = str(body.notes, 2000);
      if (body.meeting_link !== undefined) patch.meeting_link = str(body.meeting_link, 500);
      if (body.lead_id !== undefined) patch.lead_id = str(body.lead_id, 60);
      if (body.start_time !== undefined) {
        const i = instante(body.start_time);
        if (!i) return fail("Data de início inválida.");
        patch.start_time = i;
      }
      if (body.end_time !== undefined) {
        const f = instante(body.end_time);
        if (!f) return fail("Data de término inválida.");
        patch.end_time = f;
      }
      if (
        patch.start_time && patch.end_time &&
        new Date(patch.end_time as string).getTime() <= new Date(patch.start_time as string).getTime()
      ) {
        return fail("O término precisa ser depois do início.");
      }
      if (Object.keys(patch).length === 0) return fail("Nada para alterar.");

      const { data, error } = await supabase.from("appointments").update(patch).eq("id", id).select(CAMPOS);
      try {
        return ok({ item: assertGravou(data, error && { message: traduzErro(error.message) }, "Salvar compromisso")[0] });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    /* ── Muda o status (confirmar, concluir, cancelar, faltou) ──────────── */
    case "status": {
      const id = str(body.id, 60);
      const status = body.status as StatusAgenda;
      if (!id) return fail("id ausente.");
      if (!STATUS_AGENDA.includes(status)) return fail("Status inválido.");

      const agora = new Date().toISOString();
      const patch: Record<string, unknown> = { status };
      // Carimbos que o banco já previa em 006_agenda.sql e ninguém preenchia.
      if (status === "confirmado") patch.confirmed_at = agora;
      if (status === "cancelado") patch.cancelled_at = agora;

      const { data, error } = await supabase.from("appointments").update(patch).eq("id", id).select(CAMPOS);
      try {
        return ok({ item: assertGravou(data, error, "Atualizar compromisso")[0] });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    case "delete": {
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");
      const { data, error } = await supabase.from("appointments").delete().eq("id", id).select("id");
      try {
        assertGravou(data, error, "Excluir compromisso");
        return ok();
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    /* ─────────────────────────────────────────────────────────────────────
       MEU DIA — as três coisas que travam o dia de uma agência pequena:
       o que tem hora marcada, quem chegou e ninguém falou, e o dinheiro que
       está para vencer. Tudo com dado REAL das tabelas, nada calculado por
       estimativa.
       ──────────────────────────────────────────────────────────────────── */
    case "meu-dia": {
      // O navegador manda o começo e o fim do dia DELE. Sem isso, o servidor
      // (UTC) chamaria de "hoje" um intervalo que no Brasil começa às 21h.
      const inicio = instante(body.inicio) ?? new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
      const fim = instante(body.fim) ?? new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
      const emSeteDias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const [compromissos, novos, receber] = await Promise.all([
        supabase
          .from("appointments")
          .select("id,client_name,client_email,title,start_time,end_time,status,meeting_link")
          .gte("start_time", inicio)
          .lte("start_time", fim)
          .neq("status", "cancelado")
          .order("start_time", { ascending: true })
          .limit(50),
        // "Leads sem contato" = quem ainda está na primeira coluna do funil.
        // É o que o banco sabe: não existe registro de tentativa de contato.
        supabase
          .from("leads")
          .select("id,name,email,phone,product,value,created_at")
          .eq("status", "novo")
          .order("created_at", { ascending: true })
          .limit(30),
        supabase
          .from("receivables")
          .select("id,subject,client_name,value,due_date,status")
          .eq("status", "pendente")
          .lte("due_date", emSeteDias)
          .order("due_date", { ascending: true })
          .limit(30),
      ]);

      /* Cada bloco falha por conta própria: se a tabela `receivables` ainda não
         existir no banco, o restante do "Meu dia" continua aparecendo em vez de
         a tela inteira virar erro. */
      return ok({
        janela: { inicio, fim },
        compromissos: compromissos.data ?? [],
        leadsSemContato: novos.data ?? [],
        recebiveis: receber.data ?? [],
        avisos: [compromissos.error?.message, novos.error?.message, receber.error?.message].filter(Boolean),
      });
    }

    default:
      return fail(`Ação desconhecida: ${action}`, 404);
  }
}

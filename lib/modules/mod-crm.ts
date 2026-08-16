import { Ctx, ModResult, ok, fail, str, isEmail, parseValor, assertGravou } from "./_shared";
import { registrarConversaoAfiliado } from "./mod-afiliados";

/* ─────────────────────────────────────────────────────────────────────────────
   CRM — leads e o kanban.

   Os 6 estágios são os que JÁ existiam em `app/api/admin/leads/route.ts`;
   não foram inventados agora. Mudar esta lista sem migrar os dados deixa leads
   órfãos numa coluna que não existe mais na tela.
   ──────────────────────────────────────────────────────────────────────────── */
export const ESTAGIOS = ["novo", "em_contato", "reuniao", "proposta", "cliente", "descartado"] as const;
export type Estagio = (typeof ESTAGIOS)[number];

const CAMPOS = "id,name,email,phone,product,message,source,status,owner,value,notes,stage_order,lost_reason,created_at,updated_at";

export async function modCrm(action: string, ctx: Ctx): Promise<ModResult> {
  const { supabase, body } = ctx;

  switch (action) {
    /* ── Lista o quadro inteiro ─────────────────────────────────────────── */
    case "list": {
      const busca = str(body.busca, 120);
      let q = supabase.from("leads").select(CAMPOS);

      // Busca por nome, e-mail ou empresa. `or` do PostgREST usa vírgula como
      // separador, então uma vírgula digitada pelo usuário quebraria a query.
      if (busca) {
        const t = busca.replace(/[,()]/g, " ");
        q = q.or(`name.ilike.%${t}%,email.ilike.%${t}%,product.ilike.%${t}%`);
      }
      const { data, error } = await q
        .order("stage_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) return fail(error.message, 500);
      return ok({ leads: data ?? [] });
    }

    /* ── Cria lead pelo painel (o formulário público usa /api/lead) ─────── */
    case "create": {
      const name = str(body.name, 120);
      if (!name || name.length < 2) return fail("Informe o nome.");
      if (!isEmail(body.email)) return fail("E-mail inválido.");

      const { data, error } = await supabase
        .from("leads")
        .insert({
          name,
          email: (body.email as string).toLowerCase(),
          phone: str(body.phone, 40),
          product: str(body.product, 120),
          message: str(body.message, 2000),
          notes: str(body.notes, 2000),
          owner: str(body.owner, 120),
          value: parseValor(body.value),
          status: ESTAGIOS.includes(body.status as Estagio) ? body.status : "novo",
          source: "painel",
        })
        .select(CAMPOS);

      try {
        return ok({ lead: assertGravou(data, error, "Criar lead")[0] });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    /* ── Edita campos do lead ───────────────────────────────────────────── */
    case "update": {
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");

      // Só estes campos podem ser alterados pelo painel. Uma lista fechada
      // evita que um payload malicioso mexa em `source`/`created_at`.
      const patch: Record<string, unknown> = {};
      if (body.name !== undefined) patch.name = str(body.name, 120);
      if (body.email !== undefined) {
        if (!isEmail(body.email)) return fail("E-mail inválido.");
        patch.email = (body.email as string).toLowerCase();
      }
      if (body.phone !== undefined) patch.phone = str(body.phone, 40);
      if (body.product !== undefined) patch.product = str(body.product, 120);
      if (body.notes !== undefined) patch.notes = str(body.notes, 2000);
      if (body.owner !== undefined) patch.owner = str(body.owner, 120);
      if (body.value !== undefined) patch.value = parseValor(body.value);
      if (body.lost_reason !== undefined) patch.lost_reason = str(body.lost_reason, 300);

      if (Object.keys(patch).length === 0) return fail("Nada para alterar.");

      const { data, error } = await supabase.from("leads").update(patch).eq("id", id).select(CAMPOS);
      try {
        return ok({ lead: assertGravou(data, error, "Salvar lead")[0] });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    /* ── Move de coluna (o arrastar do kanban) ──────────────────────────── */
    case "move": {
      const id = str(body.id, 60);
      const status = body.status as Estagio;
      if (!id) return fail("id ausente.");
      if (!ESTAGIOS.includes(status)) return fail("Estágio inválido.");

      const patch: Record<string, unknown> = { status };
      if (typeof body.stage_order === "number") patch.stage_order = body.stage_order;
      // Motivo da perda só faz sentido em "descartado"; ao sair de lá, limpa.
      if (status === "descartado") {
        if (body.lost_reason !== undefined) patch.lost_reason = str(body.lost_reason, 300);
      } else {
        patch.lost_reason = null;
      }

      // Além dos campos que a tela precisa de volta, pede email/value/
      // affiliate_code — é o que o hook de afiliados logo abaixo usa. Custa
      // nada a mais (mesma query) e evita uma segunda ida ao banco.
      const { data, error } = await supabase
        .from("leads")
        .update(patch)
        .eq("id", id)
        .select("id,status,stage_order,email,value,affiliate_code");
      try {
        assertGravou(data, error, "Mover lead");
      } catch (e) {
        return fail((e as Error).message, 500);
      }

      // Hook do programa de afiliados: lead virou cliente → apura comissão
      // (se ele tiver vindo de indicação). FIRE-AND-FORGET DE VERDADE: o move
      // do lead já foi gravado no banco na linha acima; nada que aconteça
      // daqui pra baixo pode fazer esta ação devolver erro para a tela do CRM.
      if (status === "cliente") {
        try {
          const lead = (data as Array<{ id: string; email: string | null; value: number | null; affiliate_code: string | null }>)[0];
          await registrarConversaoAfiliado(supabase, lead);
        } catch (e) {
          console.error("[mod-crm] conversão de afiliado falhou (não propagado ao move):", e);
        }
      }

      return ok();
    }

    /* ── Reordena vários de uma vez (soltar entre dois cards) ───────────── */
    case "reorder": {
      const itens = Array.isArray(body.itens) ? body.itens : null;
      if (!itens?.length) return fail("Lista vazia.");
      if (itens.length > 200) return fail("Lista grande demais.");

      for (const it of itens as Array<{ id?: string; stage_order?: number; status?: string }>) {
        if (!it?.id || typeof it.stage_order !== "number") continue;
        const patch: Record<string, unknown> = { stage_order: it.stage_order };
        if (it.status && ESTAGIOS.includes(it.status as Estagio)) patch.status = it.status;
        await supabase.from("leads").update(patch).eq("id", it.id);
      }
      return ok();
    }

    /* ── Exclui ─────────────────────────────────────────────────────────── */
    case "delete": {
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");
      const { data, error } = await supabase.from("leads").delete().eq("id", id).select("id");
      try {
        assertGravou(data, error, "Excluir lead");
        return ok();
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    /* ── Histórico de anotações ─────────────────────────────────────────── */
    case "notes": {
      const leadId = str(body.lead_id, 60);
      if (!leadId) return fail("lead_id ausente.");
      const { data, error } = await supabase
        .from("lead_notes")
        .select("id,body,author,created_at")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) return fail(error.message, 500);
      return ok({ notes: data ?? [] });
    }

    case "add-note": {
      const leadId = str(body.lead_id, 60);
      const texto = str(body.body, 2000);
      if (!leadId || !texto) return fail("Anotação vazia.");
      const { data, error } = await supabase
        .from("lead_notes")
        .insert({ lead_id: leadId, body: texto, author: str(body.author, 120) })
        .select("id,body,author,created_at");
      try {
        return ok({ note: assertGravou(data, error, "Salvar anotação")[0] });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    default:
      return fail(`Ação desconhecida: ${action}`, 404);
  }
}

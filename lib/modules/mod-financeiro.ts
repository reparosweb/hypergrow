import { Ctx, ModResult, ok, fail, str, parseValor, assertGravou, logFinanceiro } from "./_shared";

/* ─────────────────────────────────────────────────────────────────────────────
   Financeiro — contas a receber, contas a pagar, extrato e DRE simples.

   Escopo enxuto de propósito (Fase 3 do plano): sem parcelamento, sem
   recorrência automática de lançamento (só a flag `is_recurring` em payables,
   pra filtro visual). O que existe é o que o dono efetivamente pediu:
   receitas, despesas, recebíveis, extrato e um resultado (receita - despesa)
   por período.
   ──────────────────────────────────────────────────────────────────────────── */

const STATUS_RECEBER = ["pendente", "recebido", "atrasado", "cancelado"] as const;
const STATUS_PAGAR = ["pendente", "pago", "atrasado", "cancelado"] as const;
type StatusReceber = (typeof STATUS_RECEBER)[number];
type StatusPagar = (typeof STATUS_PAGAR)[number];

const CAMPOS_RECEBER =
  "id,subject,client_name,lead_id,charge_id,category_id,value,status,payment_method,due_date,paid_at,notes,created_by,created_at,updated_at";
const CAMPOS_PAGAR =
  "id,title,supplier,document,category_id,value,status,payment_method,due_date,paid_at,is_recurring,notes,created_by,created_at,updated_at";

function periodo(body: Record<string, unknown>): { de: string | null; ate: string | null } {
  const de = str(body.de, 10);
  const ate = str(body.ate, 10);
  return { de: de || null, ate: ate || null };
}

export async function modFinanceiro(action: string, ctx: Ctx): Promise<ModResult> {
  const { supabase, body } = ctx;

  switch (action) {
    /* ── Plano de contas ──────────────────────────────────────────────────── */
    case "categorias": {
      const { data, error } = await supabase
        .from("financial_categories")
        .select("id,name,type,parent_id,color,is_active,display_order")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) return fail(error.message, 500);
      return ok({ categorias: data ?? [] });
    }

    case "categoria-create": {
      const name = str(body.name, 120);
      if (!name) return fail("Informe o nome da categoria.");
      const { data, error } = await supabase
        .from("financial_categories")
        .insert({ name, type: str(body.type, 60) || "despesa_operacional", color: str(body.color, 20) })
        .select("id,name,type,color,display_order");
      try {
        return ok({ categoria: assertGravou(data, error, "Criar categoria")[0] });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    /* ── Contas a receber ─────────────────────────────────────────────────── */
    case "receber-list": {
      const busca = str(body.busca, 120);
      const status = str(body.status, 20);
      let q = supabase.from("receivables").select(CAMPOS_RECEBER);
      if (busca) q = q.or(`subject.ilike.%${busca}%,client_name.ilike.%${busca}%`);
      if (status && STATUS_RECEBER.includes(status as StatusReceber)) q = q.eq("status", status);
      const { data, error } = await q.order("due_date", { ascending: true }).limit(500);
      if (error) return fail(error.message, 500);
      return ok({ itens: data ?? [] });
    }

    case "receber-create": {
      const subject = str(body.subject, 200);
      const value = parseValor(body.value);
      if (!subject) return fail("Informe a descrição.");
      if (value === null || value <= 0) return fail("Valor inválido.");
      const { data, error } = await supabase
        .from("receivables")
        .insert({
          subject,
          client_name: str(body.client_name, 120),
          lead_id: str(body.lead_id, 60),
          category_id: str(body.category_id, 60),
          value,
          status: STATUS_RECEBER.includes(body.status as StatusReceber) ? body.status : "pendente",
          payment_method: str(body.payment_method, 30) || "pix",
          due_date: str(body.due_date, 10),
          notes: str(body.notes, 1000),
        })
        .select(CAMPOS_RECEBER);
      try {
        const linha = assertGravou(data, error, "Lançar recebível")[0];
        await logFinanceiro(ctx, "create", "receivable", (linha as { id: string }).id, { value });
        return ok({ item: linha });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    case "receber-update": {
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");
      const patch: Record<string, unknown> = {};
      if (body.subject !== undefined) patch.subject = str(body.subject, 200);
      if (body.client_name !== undefined) patch.client_name = str(body.client_name, 120);
      if (body.category_id !== undefined) patch.category_id = str(body.category_id, 60);
      if (body.value !== undefined) patch.value = parseValor(body.value);
      if (body.payment_method !== undefined) patch.payment_method = str(body.payment_method, 30);
      if (body.due_date !== undefined) patch.due_date = str(body.due_date, 10);
      if (body.notes !== undefined) patch.notes = str(body.notes, 1000);
      if (Object.keys(patch).length === 0) return fail("Nada para alterar.");
      const { data, error } = await supabase.from("receivables").update(patch).eq("id", id).select(CAMPOS_RECEBER);
      try {
        return ok({ item: assertGravou(data, error, "Salvar recebível")[0] });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    /* Marcar como recebido/pendente. Separado do `update` porque grava
       `paid_at` junto — é o que faz o extrato e o DRE em regime de caixa
       enxergarem a entrada de dinheiro. */
    case "receber-marcar": {
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");
      const recebido = body.recebido !== false;
      const patch = recebido ? { status: "recebido", paid_at: new Date().toISOString() } : { status: "pendente", paid_at: null };
      const { data, error } = await supabase.from("receivables").update(patch).eq("id", id).select("id,status,paid_at,value");
      try {
        const linha = assertGravou(data, error, "Atualizar recebível")[0] as { id: string; value: number };
        await logFinanceiro(ctx, recebido ? "marcar-recebido" : "desmarcar-recebido", "receivable", id, { value: linha.value });
        return ok({ item: linha });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    case "receber-delete": {
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");
      const { data, error } = await supabase.from("receivables").delete().eq("id", id).select("id");
      try {
        assertGravou(data, error, "Excluir recebível");
        await logFinanceiro(ctx, "delete", "receivable", id);
        return ok();
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    /* ── Contas a pagar ───────────────────────────────────────────────────── */
    case "pagar-list": {
      const busca = str(body.busca, 120);
      const status = str(body.status, 20);
      let q = supabase.from("payables").select(CAMPOS_PAGAR);
      if (busca) q = q.or(`title.ilike.%${busca}%,supplier.ilike.%${busca}%`);
      if (status && STATUS_PAGAR.includes(status as StatusPagar)) q = q.eq("status", status);
      const { data, error } = await q.order("due_date", { ascending: true }).limit(500);
      if (error) return fail(error.message, 500);
      return ok({ itens: data ?? [] });
    }

    case "pagar-create": {
      const title = str(body.title, 200);
      const value = parseValor(body.value);
      if (!title) return fail("Informe a descrição.");
      if (value === null || value <= 0) return fail("Valor inválido.");
      const { data, error } = await supabase
        .from("payables")
        .insert({
          title,
          supplier: str(body.supplier, 120),
          document: str(body.document, 60),
          category_id: str(body.category_id, 60),
          value,
          status: STATUS_PAGAR.includes(body.status as StatusPagar) ? body.status : "pendente",
          payment_method: str(body.payment_method, 30) || "boleto",
          due_date: str(body.due_date, 10),
          is_recurring: body.is_recurring === true,
          notes: str(body.notes, 1000),
        })
        .select(CAMPOS_PAGAR);
      try {
        const linha = assertGravou(data, error, "Lançar despesa")[0];
        await logFinanceiro(ctx, "create", "payable", (linha as { id: string }).id, { value });
        return ok({ item: linha });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    case "pagar-update": {
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");
      const patch: Record<string, unknown> = {};
      if (body.title !== undefined) patch.title = str(body.title, 200);
      if (body.supplier !== undefined) patch.supplier = str(body.supplier, 120);
      if (body.document !== undefined) patch.document = str(body.document, 60);
      if (body.category_id !== undefined) patch.category_id = str(body.category_id, 60);
      if (body.value !== undefined) patch.value = parseValor(body.value);
      if (body.payment_method !== undefined) patch.payment_method = str(body.payment_method, 30);
      if (body.due_date !== undefined) patch.due_date = str(body.due_date, 10);
      if (body.is_recurring !== undefined) patch.is_recurring = body.is_recurring === true;
      if (body.notes !== undefined) patch.notes = str(body.notes, 1000);
      if (Object.keys(patch).length === 0) return fail("Nada para alterar.");
      const { data, error } = await supabase.from("payables").update(patch).eq("id", id).select(CAMPOS_PAGAR);
      try {
        return ok({ item: assertGravou(data, error, "Salvar despesa")[0] });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    case "pagar-marcar": {
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");
      const pago = body.pago !== false;
      const patch = pago ? { status: "pago", paid_at: new Date().toISOString() } : { status: "pendente", paid_at: null };
      const { data, error } = await supabase.from("payables").update(patch).eq("id", id).select("id,status,paid_at,value");
      try {
        const linha = assertGravou(data, error, "Atualizar despesa")[0] as { id: string; value: number };
        await logFinanceiro(ctx, pago ? "marcar-pago" : "desmarcar-pago", "payable", id, { value: linha.value });
        return ok({ item: linha });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    case "pagar-delete": {
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");
      const { data, error } = await supabase.from("payables").delete().eq("id", id).select("id");
      try {
        assertGravou(data, error, "Excluir despesa");
        await logFinanceiro(ctx, "delete", "payable", id);
        return ok();
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    /* ── Extrato: caixa (o que de fato entrou/saiu) + cobranças do Asaas ───── */
    case "extrato": {
      const { de, ate } = periodo(body);
      if (!de || !ate) return fail("Informe o período (de/até).");

      const [receb, pag, cobr] = await Promise.all([
        supabase
          .from("receivables")
          .select("id,subject,client_name,value,paid_at")
          .eq("status", "recebido")
          .gte("paid_at", de)
          .lte("paid_at", `${ate}T23:59:59`),
        supabase
          .from("payables")
          .select("id,title,supplier,value,paid_at")
          .eq("status", "pago")
          .gte("paid_at", de)
          .lte("paid_at", `${ate}T23:59:59`),
        supabase
          .from("charges")
          .select("id,description,customer_name,value,status,created_at")
          .in("status", ["RECEIVED", "CONFIRMED"])
          .gte("created_at", de)
          .lte("created_at", `${ate}T23:59:59`),
      ]);

      if (receb.error) return fail(receb.error.message, 500);
      if (pag.error) return fail(pag.error.message, 500);
      // Charges pode não existir/estar acessível em algum ambiente — não derruba o extrato.
      const cobrancas = cobr.error ? [] : cobr.data ?? [];

      const linhas = [
        ...(receb.data ?? []).map((r) => ({
          tipo: "receita" as const, origem: "recebivel" as const, id: r.id,
          data: r.paid_at, descricao: r.subject, contraparte: r.client_name, valor: r.value,
        })),
        ...cobrancas.map((c) => ({
          tipo: "receita" as const, origem: "asaas" as const, id: c.id,
          data: c.created_at, descricao: c.description || "Cobrança Asaas", contraparte: c.customer_name, valor: c.value,
        })),
        ...(pag.data ?? []).map((p) => ({
          tipo: "despesa" as const, origem: "pagavel" as const, id: p.id,
          data: p.paid_at, descricao: p.title, contraparte: p.supplier, valor: p.value,
        })),
      ].sort((a, b) => new Date(a.data ?? 0).getTime() - new Date(b.data ?? 0).getTime());

      const totalReceita = linhas.filter((l) => l.tipo === "receita").reduce((s, l) => s + (l.valor || 0), 0);
      const totalDespesa = linhas.filter((l) => l.tipo === "despesa").reduce((s, l) => s + (l.valor || 0), 0);

      return ok({ linhas, totalReceita, totalDespesa, saldo: totalReceita - totalDespesa });
    }

    /* ── DRE simples: regime de caixa (pago/recebido) ou competência (vencimento) ── */
    case "dre": {
      const { de, ate } = periodo(body);
      if (!de || !ate) return fail("Informe o período (de/até).");
      const competencia = body.regime === "competencia";
      const campoData = competencia ? "due_date" : "paid_at";

      let qr = supabase.from("receivables").select("value,status,category_id").gte(campoData, de).lte(campoData, competencia ? ate : `${ate}T23:59:59`);
      let qp = supabase.from("payables").select("value,status,category_id").gte(campoData, de).lte(campoData, competencia ? ate : `${ate}T23:59:59`);
      // Em competência conta tudo que venceu no período, exceto cancelado. Em caixa, só o que efetivamente moveu.
      qr = competencia ? qr.neq("status", "cancelado") : qr.eq("status", "recebido");
      qp = competencia ? qp.neq("status", "cancelado") : qp.eq("status", "pago");

      const [receb, pag, cat] = await Promise.all([
        qr, qp,
        supabase.from("financial_categories").select("id,name,type"),
      ]);
      if (receb.error) return fail(receb.error.message, 500);
      if (pag.error) return fail(pag.error.message, 500);

      const categorias = new Map((cat.data ?? []).map((c) => [c.id as string, c as { id: string; name: string; type: string }]));
      const agrupar = (rows: { value: number; category_id: string | null }[]) => {
        const m = new Map<string, number>();
        for (const r of rows) {
          const nome = (r.category_id && categorias.get(r.category_id)?.name) || "Sem categoria";
          m.set(nome, (m.get(nome) ?? 0) + (r.value || 0));
        }
        return Array.from(m, ([categoria, total]) => ({ categoria, total })).sort((a, b) => b.total - a.total);
      };

      const receitas = agrupar(receb.data ?? []);
      const despesas = agrupar(pag.data ?? []);
      const totalReceitas = receitas.reduce((s, r) => s + r.total, 0);
      const totalDespesas = despesas.reduce((s, d) => s + d.total, 0);

      return ok({ regime: competencia ? "competencia" : "caixa", receitas, despesas, totalReceitas, totalDespesas, resultado: totalReceitas - totalDespesas });
    }

    default:
      return fail(`Ação desconhecida: ${action}`, 404);
  }
}

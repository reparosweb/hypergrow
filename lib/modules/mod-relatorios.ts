import { Ctx, ModResult, ok, fail, dataISO } from "./_shared";

/* ─────────────────────────────────────────────────────────────────────────────
   Relatórios.

   ⚠️ HONESTIDADE DO DADO — leia antes de pedir "tempo em cada estágio".

   O banco NÃO guarda histórico de mudança de estágio. A tabela `leads` tem
   `created_at` e `updated_at`, e mais nada: quando um lead sai de "novo" para
   "proposta", o estado anterior é sobrescrito e some para sempre. Portanto:

   · "Quanto tempo o lead fica em cada etapa" é IMPOSSÍVEL de calcular hoje.
     Qualquer número desses seria inventado. Não existe neste arquivo.
   · O que dá para medir de verdade: a IDADE do lead (agora − created_at), que
     é exata.
   · Para quem já virou cliente, `updated_at − created_at` é uma APROXIMAÇÃO do
     ciclo de venda — e é aproximação porque qualquer edição posterior (corrigir
     um telefone, por exemplo) empurra o `updated_at` para frente e infla o
     número. Vai rotulado como aproximação em todo lugar onde aparece.

   Para ter o tempo por etapa de verdade seria preciso uma tabela de histórico
   (`lead_stage_events`) gravando cada transição. Não foi feito aqui: é decisão
   do dono, mexe em migração e no fluxo de gravação do CRM.

   Agregação em JavaScript de propósito: o PostgREST não faz GROUP BY. Com o
   volume desta agência (centenas de leads) isso é irrelevante; se um dia virar
   dezenas de milhares, o caminho é uma view no banco.
   ──────────────────────────────────────────────────────────────────────────── */

const DIA_MS = 24 * 60 * 60 * 1000;
const LIMITE = 5000;

const ROTULO_ESTAGIO: Record<string, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  reuniao: "Reunião agendada",
  proposta: "Proposta enviada",
  cliente: "Cliente",
  descartado: "Descartado",
};
const ORDEM_ESTAGIO = ["novo", "em_contato", "reuniao", "proposta", "cliente", "descartado"];

type LeadLinha = {
  id: string;
  status: string | null;
  value: number | null;
  source: string | null;
  lost_reason: string | null;
  created_at: string;
  updated_at: string | null;
};

function diasEntre(a: string | number, b: string | number): number {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / DIA_MS));
}

function media(ns: number[]): number | null {
  if (ns.length === 0) return null;
  return Math.round(ns.reduce((s, n) => s + n, 0) / ns.length);
}

async function lerLeads(ctx: Ctx) {
  const de = dataISO(ctx.body.de);
  const ate = dataISO(ctx.body.ate);
  let q = ctx.supabase.from("leads").select("id,status,value,source,lost_reason,created_at,updated_at");
  if (de) q = q.gte("created_at", de);
  if (ate) q = q.lte("created_at", `${ate}T23:59:59`);
  const { data, error } = await q.limit(LIMITE);
  return { linhas: (data ?? []) as LeadLinha[], error };
}

export async function modRelatorios(action: string, ctx: Ctx): Promise<ModResult> {
  const { supabase } = ctx;

  switch (action) {
    /* ── Números do topo ────────────────────────────────────────────────── */
    case "kpis": {
      const { linhas, error } = await lerLeads(ctx);
      if (error) return fail(error.message, 500);

      const agora = Date.now();
      const abertos = linhas.filter((l) => l.status !== "cliente" && l.status !== "descartado");
      const clientes = linhas.filter((l) => l.status === "cliente");
      const perdidos = linhas.filter((l) => l.status === "descartado");

      const somaValor = (ls: LeadLinha[]) => ls.reduce((s, l) => s + (Number(l.value) || 0), 0);

      const [receber, charges] = await Promise.all([
        supabase.from("receivables").select("value,status,due_date").limit(LIMITE),
        supabase.from("charges").select("value,status").limit(LIMITE),
      ]);

      const recebiveis = receber.data ?? [];
      const hoje = new Date().toISOString().slice(0, 10);

      return ok({
        leads: {
          total: linhas.length,
          abertos: abertos.length,
          clientes: clientes.length,
          perdidos: perdidos.length,
          // Conversão sobre o total do período. Sem histórico de estágio não dá
          // para medir conversão etapa a etapa — só a ponta a ponta.
          taxaConversao: linhas.length ? Math.round((clientes.length / linhas.length) * 1000) / 10 : 0,
        },
        valores: {
          pipelineAberto: somaValor(abertos),
          ganho: somaValor(clientes),
          perdido: somaValor(perdidos),
        },
        tempo: {
          // Exato: agora menos a criação.
          idadeMediaDiasAbertos: media(abertos.map((l) => diasEntre(l.created_at, agora))),
          idadeMaiorDiasAberto: abertos.length
            ? Math.max(...abertos.map((l) => diasEntre(l.created_at, agora)))
            : null,
          // APROXIMAÇÃO — ver o bloco de honestidade no topo do arquivo.
          cicloVendaAproxDias: media(
            clientes.filter((l) => l.updated_at).map((l) => diasEntre(l.created_at, l.updated_at as string))
          ),
          cicloEhAproximacao: true,
        },
        financeiro: {
          aReceberPendente: recebiveis
            .filter((r) => r.status === "pendente")
            .reduce((s, r) => s + (Number(r.value) || 0), 0),
          aReceberVencido: recebiveis
            .filter((r) => r.status === "pendente" && r.due_date && String(r.due_date) < hoje)
            .reduce((s, r) => s + (Number(r.value) || 0), 0),
          recebidoTotal: recebiveis
            .filter((r) => r.status === "recebido")
            .reduce((s, r) => s + (Number(r.value) || 0), 0),
          cobrancasPagas: (charges.data ?? []).filter((c) =>
            ["RECEIVED", "CONFIRMED"].includes(String(c.status))
          ).length,
        },
        avisos: [receber.error?.message, charges.error?.message].filter(Boolean),
      });
    }

    /* ── Funil: quantidade e valor por estágio ──────────────────────────── */
    case "funil": {
      const { linhas, error } = await lerLeads(ctx);
      if (error) return fail(error.message, 500);

      const agora = Date.now();
      const etapas = ORDEM_ESTAGIO.map((chave) => {
        const doEstagio = linhas.filter((l) => (l.status || "novo") === chave);
        return {
          estagio: chave,
          rotulo: ROTULO_ESTAGIO[chave] ?? chave,
          quantidade: doEstagio.length,
          valor: doEstagio.reduce((s, l) => s + (Number(l.value) || 0), 0),
          // Idade do lead, não tempo NO estágio: o banco não guarda a transição.
          idadeMediaDias: media(doEstagio.map((l) => diasEntre(l.created_at, agora))),
        };
      });

      return ok({
        etapas,
        total: linhas.length,
        nota: "Idade = tempo desde a criação do lead. O banco não guarda histórico de mudança de estágio, então tempo POR etapa não é calculável.",
      });
    }

    /* ── De onde vieram ─────────────────────────────────────────────────── */
    case "origem": {
      const { linhas, error } = await lerLeads(ctx);
      if (error) return fail(error.message, 500);

      const mapa = new Map<string, { quantidade: number; valor: number; clientes: number }>();
      for (const l of linhas) {
        const chave = (l.source || "").trim() || "Não informado";
        const atual = mapa.get(chave) ?? { quantidade: 0, valor: 0, clientes: 0 };
        atual.quantidade += 1;
        atual.valor += Number(l.value) || 0;
        if (l.status === "cliente") atual.clientes += 1;
        mapa.set(chave, atual);
      }

      const origens = Array.from(mapa, ([origem, v]) => ({
        origem,
        ...v,
        taxaConversao: v.quantidade ? Math.round((v.clientes / v.quantidade) * 1000) / 10 : 0,
      })).sort((a, b) => b.quantidade - a.quantidade);

      return ok({ origens, total: linhas.length });
    }

    /* ── Por que perdemos ───────────────────────────────────────────────── */
    case "perdas": {
      const { linhas, error } = await lerLeads(ctx);
      if (error) return fail(error.message, 500);

      const perdidos = linhas.filter((l) => l.status === "descartado");
      const mapa = new Map<string, { quantidade: number; valor: number }>();
      for (const l of perdidos) {
        const chave = (l.lost_reason || "").trim() || "Sem motivo registrado";
        const atual = mapa.get(chave) ?? { quantidade: 0, valor: 0 };
        atual.quantidade += 1;
        atual.valor += Number(l.value) || 0;
        mapa.set(chave, atual);
      }

      const motivos = Array.from(mapa, ([motivo, v]) => ({ motivo, ...v })).sort(
        (a, b) => b.quantidade - a.quantidade
      );

      return ok({
        motivos,
        totalPerdidos: perdidos.length,
        valorPerdido: perdidos.reduce((s, l) => s + (Number(l.value) || 0), 0),
      });
    }

    /* ── Receita mês a mês ──────────────────────────────────────────────── */
    case "receita-mensal": {
      const meses = Math.min(24, Math.max(3, Number(ctx.body.meses) || 6));
      const inicio = new Date();
      inicio.setDate(1);
      inicio.setHours(0, 0, 0, 0);
      inicio.setMonth(inicio.getMonth() - (meses - 1));
      const inicioISO = inicio.toISOString();

      const [receb, cobr, pag] = await Promise.all([
        supabase.from("receivables").select("value,paid_at,charge_id").eq("status", "recebido").gte("paid_at", inicioISO).limit(LIMITE),
        supabase.from("charges").select("charge_id,value,status,created_at").in("status", ["RECEIVED", "CONFIRMED"]).gte("created_at", inicioISO).limit(LIMITE),
        supabase.from("payables").select("value,paid_at").eq("status", "pago").gte("paid_at", inicioISO).limit(LIMITE),
      ]);

      if (receb.error) return fail(receb.error.message, 500);

      /* Uma cobrança do Asaas que já virou recebível seria contada DUAS vezes
         (uma em cada tabela) e a receita do mês apareceria inflada. `receivables`
         guarda o `charge_id` justamente para permitir este cruzamento. */
      const jaContadas = new Set(
        (receb.data ?? []).map((r) => r.charge_id).filter((c): c is string => !!c)
      );

      const balde = new Map<string, { receita: number; despesa: number }>();
      for (let i = 0; i < meses; i++) {
        const d = new Date(inicio);
        d.setMonth(d.getMonth() + i);
        balde.set(d.toISOString().slice(0, 7), { receita: 0, despesa: 0 });
      }
      const somar = (data: string | null, campo: "receita" | "despesa", valor: number) => {
        if (!data) return;
        const chave = String(data).slice(0, 7);
        const linha = balde.get(chave);
        if (linha) linha[campo] += valor;
      };

      for (const r of receb.data ?? []) somar(r.paid_at as string | null, "receita", Number(r.value) || 0);
      for (const c of cobr.data ?? []) {
        if (jaContadas.has(String(c.charge_id))) continue;
        somar(c.created_at as string | null, "receita", Number(c.value) || 0);
      }
      for (const p of pag.data ?? []) somar(p.paid_at as string | null, "despesa", Number(p.value) || 0);

      const linhas = Array.from(balde, ([mes, v]) => ({
        mes,
        receita: Math.round(v.receita * 100) / 100,
        despesa: Math.round(v.despesa * 100) / 100,
        resultado: Math.round((v.receita - v.despesa) * 100) / 100,
      }));

      return ok({
        linhas,
        nota: "Regime de caixa: conta o que foi efetivamente recebido/pago. Cobranças do Asaas já vinculadas a um recebível não são contadas duas vezes.",
        avisos: [cobr.error?.message, pag.error?.message].filter(Boolean),
      });
    }

    default:
      return fail(`Ação desconhecida: ${action}`, 404);
  }
}

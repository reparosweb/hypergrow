import crypto from "crypto";
import { Ctx, ModResult, ok, fail, str, parseValor, assertGravou, type Supa } from "./_shared";
import { SITE_URL } from "@/lib/seo";

/* ─────────────────────────────────────────────────────────────────────────────
   Afiliados — comissão única (não recorrente) quando um lead indicado vira
   cliente. Um afiliado é sempre um `admin_users` de papel 'afiliado' (a
   autenticação é a mesma de todo o painel); esta tabela só guarda o que é
   exclusivo de quem indica: código, percentual, chave PIX.

   REGISTRADO como módulo "afiliado" (singular) no roteador — é o nome que já
   está em `lib/permissions.ts` (MODULE_ACCESS.afiliado = ["super","afiliado"]).
   O arquivo se chama `mod-afiliados.ts` (plural) só por convenção de nome de
   arquivo; a CHAVE do roteador precisa bater com o `?module=` da URL e com a
   permissão, e essa chave é "afiliado".

   PRIVACIDADE (LGPD) E SIGILO COMERCIAL: nenhuma ação aqui devolve para o
   afiliado nome, e-mail, telefone ou valor exato de um lead que não seja o
   dele mesmo — e mesmo os leads DELE vêm anonimizados em "meus-leads" (ver
   comentário na ação). O afiliado só precisa saber "indiquei, virou cliente,
   gerei comissão" — não precisa (e não deve) ver o dossiê do lead.
   ──────────────────────────────────────────────────────────────────────────── */

const CAMPOS_AFILIADO = "id,user_id,code,commission_pct,pix_key,status,created_at";

/* Alfabeto sem 0/O/1/I — mesma ideia do token de convite em lib/auth.ts: o
   dono ou o afiliado podem precisar ditar/digitar o código à mão. */
const ALFABETO_CODIGO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function gerarCodigo(): string {
  const bytes = crypto.randomBytes(4);
  let sufixo = "";
  for (let i = 0; i < 4; i++) sufixo += ALFABETO_CODIGO[bytes[i] % ALFABETO_CODIGO.length];
  return `HG-${sufixo}`;
}

async function gerarCodigoUnico(supabase: Supa): Promise<string> {
  for (let tentativa = 0; tentativa < 8; tentativa++) {
    const code = gerarCodigo();
    const { data } = await supabase.from("affiliates").select("id").eq("code", code).maybeSingle();
    if (!data) return code;
  }
  throw new Error("Não foi possível gerar um código único. Tente novamente.");
}

/** Hash do IP com sal que muda TODO DIA — minimização de dado (LGPD): dá para
 *  ver "quantos cliques diferentes" sem guardar o IP puro nem poder cruzar
 *  cliques do mesmo visitante entre dias diferentes. */
function ipHashDoDia(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const dia = new Date().toISOString().slice(0, 10);
  const salt = process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "hg-fallback-salt";
  return crypto.createHash("sha256").update(`${ip}|${dia}|${salt}`).digest("hex");
}

/** O perfil de afiliado do usuário logado — usado por toda ação "meu-*". */
async function buscarMeuAfiliado(
  supabase: Supa,
  userId: string
): Promise<{ id: string; code: string; status: string } | null> {
  const { data } = await supabase
    .from("affiliates")
    .select("id,code,status")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as { id: string; code: string; status: string } | null) ?? null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   registrarConversaoAfiliado — chamada pelo HOOK em mod-crm.ts quando um lead
   é movido para o estágio "cliente". Fica aqui (e não duplicada em mod-crm)
   porque a regra de negócio de afiliados pertence a este módulo; o CRM só
   avisa "este lead virou cliente".

   FIRE-AND-FORGET DE VERDADE: quem chama (mod-crm.ts) envolve esta função em
   try/catch e nunca deixa um erro daqui derrubar o `move` do lead — o negócio
   principal (CRM) não pode depender da saúde do programa de afiliados.
   ──────────────────────────────────────────────────────────────────────────── */
export async function registrarConversaoAfiliado(
  supabase: Supa,
  lead: { id: string; email?: string | null; value?: number | null; affiliate_code?: string | null }
): Promise<void> {
  const codigo = lead.affiliate_code;
  if (!codigo) return; // lead não veio de indicação

  const { data: afiliado } = await supabase
    .from("affiliates")
    .select("id,user_id,commission_pct,status")
    .eq("code", codigo)
    .maybeSingle();
  if (!afiliado || afiliado.status !== "ativo") return;

  // Antifraude mínima: auto-indicação (o e-mail do lead é o mesmo do dono do
  // código) nunca gera conversão nem comissão. Pula em silêncio — não é erro,
  // é uma tentativa de fraude ignorada.
  const { data: dono } = await supabase
    .from("admin_users")
    .select("email")
    .eq("id", afiliado.user_id as string)
    .maybeSingle();
  const emailAfiliado = String(dono?.email || "").toLowerCase();
  const emailLead = String(lead.email || "").toLowerCase();
  if (emailAfiliado && emailLead && emailAfiliado === emailLead) return;

  // O índice único PARCIAL `affiliate_events_conversao_unica` (008_afiliados.sql)
  // garante no banco que este lead nunca gera duas conversões — mesmo que o
  // move seja chamado duas vezes em corrida. Se já existir, o insert abaixo
  // simplesmente falha e paramos aqui, sem criar comissão duplicada.
  const { data: evento, error: erroEvento } = await supabase
    .from("affiliate_events")
    .insert({ affiliate_id: afiliado.id, lead_id: lead.id, type: "conversao" })
    .select("id")
    .maybeSingle();
  if (erroEvento || !evento) return;

  const valor = Number(lead.value || 0);
  const pct = Number(afiliado.commission_pct || 0);
  if (valor <= 0 || pct <= 0) return; // conversão registrada, mas sem valor de negócio não há comissão a apurar
  const comissao = Math.round(((valor * pct) / 100) * 100) / 100; // arredonda pra centavo

  await supabase.from("affiliate_commissions").insert({
    affiliate_id: afiliado.id,
    lead_id: lead.id,
    event_id: (evento as { id: string }).id,
    value: comissao,
    status: "apurada",
  });
}

export async function modAfiliados(action: string, ctx: Ctx): Promise<ModResult> {
  const { supabase, body, user } = ctx;

  switch (action) {
    /* ── PÚBLICA: clique validado no servidor ───────────────────────────── */
    case "clique": {
      const codigo = str(body.code, 20)?.toUpperCase() ?? "";
      if (!codigo) return fail("Código ausente.");

      const { data: afiliado } = await supabase
        .from("affiliates")
        .select("id,status")
        .eq("code", codigo)
        .maybeSingle();

      // Código inválido: não confirma nem nega para o cliente qual código
      // existe — só ignora silenciosamente. Nunca grava clique de código que
      // não existe (o servidor é quem decide, nunca o valor vindo da URL).
      if (!afiliado || afiliado.status !== "ativo") return ok();

      await supabase.from("affiliate_events").insert({
        affiliate_id: afiliado.id,
        type: "clique",
        ip_hash: ipHashDoDia(ctx.ip),
      });
      return ok();
    }

    /* ── Meu link de indicação ───────────────────────────────────────────── */
    case "meu-link": {
      if (!user) return fail("Sessão expirada.", 401);
      const afiliado = await buscarMeuAfiliado(supabase, user.id);
      if (!afiliado) return fail("Você ainda não tem um perfil de afiliado. Fale com o administrador.", 404);
      return ok({
        code: afiliado.code,
        url: `${SITE_URL}/?ref=${afiliado.code}`,
        // Nome diferente de propósito: `status` em ModResult é reservado para o
        // código HTTP da resposta (lib/modules/_shared.ts) — reusar o nome aqui
        // colidiria com esse campo e o TypeScript recusa (string em vez de number).
        statusAfiliado: afiliado.status,
      });
    }

    /* ── Meus cliques recentes ───────────────────────────────────────────── */
    case "meus-cliques": {
      if (!user) return fail("Sessão expirada.", 401);
      const afiliado = await buscarMeuAfiliado(supabase, user.id);
      if (!afiliado) return fail("Você ainda não tem um perfil de afiliado.", 404);

      const { data, error } = await supabase
        .from("affiliate_events")
        .select("id,created_at")
        .eq("affiliate_id", afiliado.id)
        .eq("type", "clique")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) return fail(error.message, 500);
      return ok({ cliques: data ?? [] });
    }

    /* ── Meus leads — ANONIMIZADOS (LGPD + sigilo comercial) ─────────────── */
    case "meus-leads": {
      if (!user) return fail("Sessão expirada.", 401);
      const afiliado = await buscarMeuAfiliado(supabase, user.id);
      if (!afiliado) return fail("Você ainda não tem um perfil de afiliado.", 404);

      const { data: leads, error } = await supabase
        .from("leads")
        .select("id,status,created_at")
        .eq("affiliate_code", afiliado.code)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return fail(error.message, 500);

      const ids = (leads ?? []).map((l) => l.id as string);
      let comComissao = new Set<string>();
      if (ids.length > 0) {
        const { data: comissoes } = await supabase.from("affiliate_commissions").select("lead_id").in("lead_id", ids);
        comComissao = new Set((comissoes ?? []).map((c) => c.lead_id as string));
      }

      // Nunca devolve nome, e-mail, telefone ou valor do lead — só data,
      // estágio grosso e se já gerou comissão. É regra explícita do plano,
      // não um esquecimento.
      const leadsAnonimos = (leads ?? []).map((l) => ({
        id: l.id,
        data: l.created_at,
        estagio: l.status === "cliente" ? "fechado" : l.status === "descartado" ? "perdido" : "em_andamento",
        comissao_gerada: comComissao.has(l.id as string),
      }));

      return ok({ leads: leadsAnonimos });
    }

    /* ── Minhas comissões ─────────────────────────────────────────────────── */
    case "minhas-comissoes": {
      if (!user) return fail("Sessão expirada.", 401);
      const afiliado = await buscarMeuAfiliado(supabase, user.id);
      if (!afiliado) return fail("Você ainda não tem um perfil de afiliado.", 404);

      const { data: comissoes, error } = await supabase
        .from("affiliate_commissions")
        .select("id,value,status,payable_id,created_at")
        .eq("affiliate_id", afiliado.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return fail(error.message, 500);

      const payableIds = (comissoes ?? []).map((c) => c.payable_id).filter((v): v is string => !!v);
      let statusPayable: Record<string, string> = {};
      if (payableIds.length > 0) {
        const { data: pagaveis } = await supabase.from("payables").select("id,status").in("id", payableIds);
        statusPayable = Object.fromEntries((pagaveis ?? []).map((p) => [p.id as string, p.status as string]));
      }

      // "pago" nunca é gravado em affiliate_commissions.status — é sempre lido
      // do status do payable vinculado, para não ter duas fontes de verdade.
      const linhas = (comissoes ?? []).map((c) => {
        const statusFinanceiro = c.payable_id ? statusPayable[c.payable_id as string] : null;
        const statusExibicao = statusFinanceiro === "pago" ? "pago" : (c.status as string);
        return { id: c.id, value: c.value, status: statusExibicao, created_at: c.created_at };
      });

      return ok({ comissoes: linhas });
    }

    /* ── SUPER: lista todos os afiliados ─────────────────────────────────── */
    case "listar-afiliados": {
      if (!user) return fail("Sessão expirada.", 401);
      if (user.role !== "super") return fail("Apenas administradores podem ver isto.", 403);

      const { data: afiliados, error } = await supabase
        .from("affiliates")
        .select(CAMPOS_AFILIADO)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return fail(error.message, 500);

      const ids = Array.from(new Set((afiliados ?? []).map((a) => a.user_id as string)));
      let usuarios: Record<string, { name: string | null; email: string }> = {};
      if (ids.length > 0) {
        const { data: linhas } = await supabase.from("admin_users").select("id,name,email").in("id", ids);
        usuarios = Object.fromEntries(
          (linhas ?? []).map((u) => [u.id as string, { name: u.name as string | null, email: u.email as string }])
        );
      }

      return ok({
        afiliados: (afiliados ?? []).map((a) => ({ ...a, usuario: usuarios[a.user_id as string] ?? null })),
      });
    }

    /* ── SUPER: usuários com papel 'afiliado' ainda sem perfil ──────────── */
    case "usuarios-elegiveis": {
      if (!user) return fail("Sessão expirada.", 401);
      if (user.role !== "super") return fail("Apenas administradores podem ver isto.", 403);

      const { data: candidatos, error } = await supabase
        .from("admin_users")
        .select("id,name,email,status")
        .eq("role", "afiliado")
        .order("created_at", { ascending: true });
      if (error) return fail(error.message, 500);

      const { data: jaTem } = await supabase.from("affiliates").select("user_id");
      const usados = new Set((jaTem ?? []).map((a) => a.user_id as string));

      return ok({ usuarios: (candidatos ?? []).filter((u) => !usados.has(u.id as string)) });
    }

    /* ── SUPER: cria o perfil de afiliado (gera o código) ────────────────── */
    case "criar-afiliado": {
      if (!user) return fail("Sessão expirada.", 401);
      if (user.role !== "super") return fail("Apenas administradores podem fazer isso.", 403);

      const userId = str(body.user_id, 60);
      if (!userId) return fail("Selecione o usuário.");
      const commissionPct = parseValor(body.commission_pct);
      if (commissionPct === null || commissionPct <= 0 || commissionPct > 100) {
        return fail("Informe um percentual de comissão entre 0 e 100.");
      }
      const pixKey = str(body.pix_key, 200);

      const { data: alvo, error: erroAlvo } = await supabase
        .from("admin_users")
        .select("id,role")
        .eq("id", userId)
        .maybeSingle();
      if (erroAlvo || !alvo) return fail("Usuário não encontrado.", 404);
      if (alvo.role !== "afiliado") {
        return fail("Este usuário não tem o papel \"Afiliado\". Troque o papel dele em Usuários antes.");
      }

      const { data: jaExiste } = await supabase.from("affiliates").select("id").eq("user_id", userId).maybeSingle();
      if (jaExiste) return fail("Este usuário já tem um perfil de afiliado.");

      let code: string;
      try {
        code = await gerarCodigoUnico(supabase);
      } catch (e) {
        return fail((e as Error).message, 500);
      }

      const { data, error } = await supabase
        .from("affiliates")
        .insert({ user_id: userId, code, commission_pct: commissionPct, pix_key: pixKey, status: "ativo" })
        .select(CAMPOS_AFILIADO);
      try {
        return ok({ afiliado: assertGravou(data, error, "Criar afiliado")[0] });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    /* ── SUPER: lista comissões de todos os afiliados ────────────────────── */
    case "listar-comissoes": {
      if (!user) return fail("Sessão expirada.", 401);
      if (user.role !== "super") return fail("Apenas administradores podem ver isto.", 403);

      const status = str(body.status, 20);
      let q = supabase.from("affiliate_commissions").select("id,affiliate_id,lead_id,value,status,payable_id,created_at");
      if (status && ["apurada", "aprovada"].includes(status)) q = q.eq("status", status);

      const { data: comissoes, error } = await q.order("created_at", { ascending: false }).limit(300);
      if (error) return fail(error.message, 500);

      const affIds = Array.from(new Set((comissoes ?? []).map((c) => c.affiliate_id as string)));
      let codigos: Record<string, string> = {};
      if (affIds.length > 0) {
        const { data: afiliados } = await supabase.from("affiliates").select("id,code").in("id", affIds);
        codigos = Object.fromEntries((afiliados ?? []).map((a) => [a.id as string, a.code as string]));
      }

      return ok({
        comissoes: (comissoes ?? []).map((c) => ({ ...c, afiliado_code: codigos[c.affiliate_id as string] ?? null })),
      });
    }

    /* ── SUPER: aprova a comissão e lança no financeiro ──────────────────── */
    case "aprovar-comissao": {
      if (!user) return fail("Sessão expirada.", 401);
      if (user.role !== "super") return fail("Apenas administradores podem fazer isso.", 403);

      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");

      const { data: comissao, error: erroComissao } = await supabase
        .from("affiliate_commissions")
        .select("id,affiliate_id,value,status")
        .eq("id", id)
        .maybeSingle();
      if (erroComissao || !comissao) return fail("Comissão não encontrada.", 404);
      if (comissao.status !== "apurada") return fail("Esta comissão já foi aprovada.");

      const { data: afiliado } = await supabase
        .from("affiliates")
        .select("id,user_id,code")
        .eq("id", comissao.affiliate_id as string)
        .maybeSingle();
      if (!afiliado) return fail("Afiliado não encontrado.", 404);

      const { data: dono } = await supabase
        .from("admin_users")
        .select("name,email")
        .eq("id", afiliado.user_id as string)
        .maybeSingle();
      const nomeAfiliado = (dono?.name as string | null) || (dono?.email as string | null) || afiliado.code;

      // Tenta lançar em "payables" (financeiro que já existe) para entrar no
      // fluxo de pagamento normal. Se falhar por qualquer motivo, a comissão
      // ainda assim é aprovada — melhor um lançamento manual do que travar a
      // aprovação por causa de uma tabela auxiliar.
      let payableId: string | null = null;
      let aviso: string | undefined;
      try {
        const { data: payable, error: erroPayable } = await supabase
          .from("payables")
          .insert({
            title: `Comissão de afiliado — ${afiliado.code}`,
            supplier: nomeAfiliado,
            value: comissao.value,
            status: "pendente",
            payment_method: "pix",
            notes: `Comissão de indicação. Afiliado ${afiliado.code}. Comissão #${comissao.id}.`,
          })
          .select("id");
        if (erroPayable || !payable?.length) {
          aviso = "Comissão aprovada, mas não foi possível lançar no financeiro automaticamente. Lance manualmente em Financeiro > A pagar.";
        } else {
          payableId = payable[0].id as string;
        }
      } catch {
        aviso = "Comissão aprovada, mas não foi possível lançar no financeiro automaticamente. Lance manualmente em Financeiro > A pagar.";
      }

      const patch: Record<string, unknown> = { status: "aprovada" };
      if (payableId) patch.payable_id = payableId;

      const { data, error } = await supabase
        .from("affiliate_commissions")
        .update(patch)
        .eq("id", id)
        .select("id,status,payable_id,value");
      try {
        const linha = assertGravou(data, error, "Aprovar comissão")[0];
        return ok({ comissao: linha, aviso });
      } catch (e) {
        return fail((e as Error).message, 500);
      }
    }

    default:
      return fail(`Ação desconhecida: ${action}`, 404);
  }
}

import { Ctx, ModResult, ok, fail, str, isEmail, parseValor, logFinanceiro } from "./_shared";
import {
  asaasReady,
  getOrCreateCustomer,
  createPayment,
  getPixQrCode,
  sanitizeAsaas,
  isValidCpfCnpj,
} from "@/lib/asaas";

/* ─────────────────────────────────────────────────────────────────────────────
   Cobranças (Asaas) — antes vivia em `app/api/admin/charge/route.ts`.

   POR QUE MUDOU DE LUGAR: cada `route.ts` do App Router vira uma função
   serverless e a Vercel no plano Hobby aceita no máximo 12. Absorvendo esta
   rota (e a de leads) no roteador `/api/app`, o projeto volta de 9 para 7
   funções — folga real para os módulos novos do painel.

   A LÓGICA NÃO FOI REESCRITA: validações, ordem das chamadas ao Asaas e o
   formato da resposta são os mesmos que já estavam em produção. O que mudou é
   só o envelope (`ok:true` do roteador) e o log de auditoria com o usuário.
   ──────────────────────────────────────────────────────────────────────────── */

const TIPOS = ["PIX", "CREDIT_CARD", "BOLETO"] as const;
type Tipo = (typeof TIPOS)[number];

const CAMPOS =
  "id,charge_id,customer_name,customer_email,value,billing_type,status,invoice_url,pix_payload,pix_qr,description,created_at";

export async function modCobrancas(action: string, ctx: Ctx): Promise<ModResult> {
  const { supabase, body } = ctx;

  switch (action) {
    /* ── Lista as últimas cobranças ─────────────────────────────────────── */
    case "list": {
      const { data, error } = await supabase
        .from("charges")
        .select(CAMPOS)
        .order("created_at", { ascending: false })
        .limit(100);

      // A tabela `charges` pode não existir num ambiente recém-criado. Isso não
      // é motivo para derrubar a tela: devolve lista vazia + aviso.
      if (error) return ok({ charges: [], asaas: asaasReady(), aviso: error.message });
      return ok({ charges: data ?? [], asaas: asaasReady() });
    }

    /* ── Gera cobrança no Asaas e registra no banco ─────────────────────── */
    case "create": {
      if (!asaasReady()) {
        return fail("Asaas não configurado. Defina ASAAS_API_KEY na Vercel.", 503);
      }

      const name = sanitizeAsaas(String(body.name ?? ""), 100);
      const email = String(body.email ?? "").trim().toLowerCase();
      const cpf = String(body.cpf ?? "").replace(/\D/g, "");
      const value = parseValor(body.value);
      const billingType: Tipo = TIPOS.includes(body.billingType as Tipo) ? (body.billingType as Tipo) : "PIX";
      const description = sanitizeAsaas(String(body.description || "HyperGrow - servico"), 160);
      const leadId = str(body.lead_id, 60);

      if (name.length < 2) return fail("Informe o nome do cliente.");
      if (!isEmail(email)) return fail("E-mail inválido.");
      if (!isValidCpfCnpj(cpf)) return fail("CPF/CNPJ inválido.");
      // Piso de R$5,00 é regra do próprio Asaas: abaixo disso a cobrança é recusada.
      if (value === null || value < 5) return fail("Valor mínimo R$5,00.");

      let charge: { id: string; invoiceUrl?: string | null };
      try {
        const customer = await getOrCreateCustomer({ name, email, cpfCnpj: cpf });
        const venc = new Date();
        venc.setDate(venc.getDate() + 3);
        charge = await createPayment({
          customer,
          billingType,
          value,
          dueDate: venc.toISOString().split("T")[0],
          description,
        });
      } catch (e) {
        return fail((e as Error)?.message || "Erro ao criar cobrança no Asaas.", 502);
      }

      let pixPayload: string | null = null;
      let pixQr: string | null = null;
      if (billingType === "PIX") {
        try {
          const pix = await getPixQrCode(charge.id);
          pixPayload = pix.payload ?? null;
          pixQr = pix.encodedImage ?? null;
        } catch {
          /* o QR do PIX às vezes demora a ficar pronto — a cobrança já existe */
        }
      }

      const linha: Record<string, unknown> = {
        charge_id: charge.id,
        customer_name: name,
        customer_email: email,
        value,
        billing_type: billingType,
        status: "PENDING",
        invoice_url: charge.invoiceUrl ?? null,
        pix_payload: pixPayload,
        pix_qr: pixQr,
        description,
      };
      if (leadId) linha.lead_id = leadId;

      const { error } = await supabase.from("charges").insert(linha);
      await logFinanceiro(ctx, "cobranca-criada", "charge", null, { charge_id: charge.id, value, billingType });

      // A cobrança JÁ existe no Asaas neste ponto. Se o registro local falhou,
      // mentir "deu erro" faria o operador gerar a cobrança de novo e cobrar o
      // cliente duas vezes. Devolve sucesso com aviso visível.
      return ok({
        chargeId: charge.id,
        billingType,
        invoiceUrl: charge.invoiceUrl ?? null,
        pixPayload,
        pixQr,
        value,
        aviso: error ? `Cobrança criada no Asaas, mas não foi gravada no painel: ${error.message}` : undefined,
      });
    }

    default:
      return fail(`Ação desconhecida: ${action}`, 404);
  }
}

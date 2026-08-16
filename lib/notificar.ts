/* ─────────────────────────────────────────────────────────────────────────────
   NOTIFICAÇÃO DE LEAD — o elo que faltava entre "lead entrou" e "alguém sabe".

   O PROBLEMA QUE ISTO RESOLVE: até 2026-08-08, um lead preenchido no site era
   gravado no Supabase e mais nada acontecia. Nenhum e-mail, nenhum aviso.
   O lead só existia para quem abrisse /admin por conta própria — ou seja, a
   velocidade de resposta da agência dependia de alguém lembrar de olhar.
   Em venda consultiva, responder em minutos versus em dias é a diferença
   entre fechar e perder.

   POR QUE RESEND: é o provedor que a política anti-spam do projeto já
   pressupõe (`.env.example` declarava RESEND_API_KEY desde o início, mas nunca
   houve implementação). Chamada por `fetch` cru — ZERO dependência nova, mesmo
   padrão que `app/api/chat/route.ts` usa para a OpenAI.

   REGRA ANTI-SPAM (a decisão central, herdada do Agentop): o remetente é
   SEMPRE um domínio verificado NOSSO, trocando apenas o nome de exibição.
   Nunca enviar "de" o domínio do lead — é isso que joga e-mail em spam e
   queima a reputação do domínio.

   FALHA SILENCIOSA DE PROPÓSITO: se o e-mail não sair, o lead JÁ ESTÁ salvo no
   banco. Derrubar a resposta do formulário por causa da notificação seria
   trocar um problema pequeno (aviso atrasado) por um grande (visitante vê erro
   e vai embora achando que não enviou). Toda falha aqui vira console.error e
   segue o jogo.
   ──────────────────────────────────────────────────────────────────────────── */

const RESEND_URL = "https://api.resend.com/emails";

/** Remetente. Enquanto o domínio próprio não estiver verificado no Resend, o
 *  `onboarding@resend.dev` é o único endereço que a conta grátis aceita — ele
 *  só entrega para o e-mail dono da conta, o que é suficiente para o aviso
 *  interno. Assim que `hypergrow.com.br` estiver verificado, basta preencher
 *  RESEND_FROM na Vercel e nada mais muda no código. */
function remetente(): string {
  return process.env.RESEND_FROM || "HyperGrow <onboarding@resend.dev>";
}

function escapar(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type LeadNotificacao = {
  name: string;
  email: string;
  phone?: string | null;
  product?: string | null;
  message?: string | null;
  source: string;
};

/** Avisa a equipe que entrou lead novo. Nunca lança — devolve `true` só quando
 *  o Resend confirmou o envio, para o chamador poder logar sem quebrar nada. */
export async function notificarLeadNovo(lead: LeadNotificacao): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const para = process.env.LEAD_NOTIFY_EMAIL;

  // Sem configuração não é erro: é uma feature ainda não ligada. Loga em nível
  // informativo para o dono ver nos logs da Vercel que o lead chegou.
  if (!key || !para) {
    console.info("[lead] notificação desligada (falta RESEND_API_KEY ou LEAD_NOTIFY_EMAIL). Lead:", lead.email);
    return false;
  }

  const linhas: [string, string][] = [
    ["Nome", lead.name],
    ["E-mail", lead.email],
    ["WhatsApp", lead.phone || "não informado"],
    ["Interesse", lead.product || "não informado"],
    ["Origem", lead.source],
  ];

  const corpo = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6B7688">HyperGrow</p>
      <h1 style="margin:0 0 20px;font-size:22px;color:#0B1220">Lead novo pelo site</h1>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3E4A61">
        ${linhas
          .map(
            ([k, v]) =>
              `<tr><td style="padding:8px 0;border-bottom:1px solid #EEF1F6;width:110px;color:#6B7688">${k}</td><td style="padding:8px 0;border-bottom:1px solid #EEF1F6;color:#0B1220"><b>${escapar(v)}</b></td></tr>`
          )
          .join("")}
      </table>
      ${
        lead.message
          ? `<p style="margin:20px 0 6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#6B7688">Mensagem</p>
             <p style="margin:0;padding:14px;border-radius:10px;background:#F2F4F8;font-size:14px;line-height:1.6;color:#0B1220;white-space:pre-wrap">${escapar(lead.message)}</p>`
          : ""
      }
      <p style="margin:24px 0 0;font-size:13px;color:#6B7688">
        Responda rápido: lead respondido na primeira hora converte muito mais que lead respondido no dia seguinte.
      </p>
    </div>`;

  try {
    const r = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: remetente(),
        to: [para],
        // `reply_to` no e-mail do lead: responder o aviso já responde a pessoa,
        // sem copiar e colar endereço.
        reply_to: lead.email,
        subject: `Lead novo: ${lead.name}${lead.product ? ` — ${lead.product}` : ""}`,
        html: corpo,
      }),
    });
    if (!r.ok) {
      console.error("[lead] Resend recusou:", r.status, await r.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[lead] falha ao notificar:", (e as Error).message);
    return false;
  }
}

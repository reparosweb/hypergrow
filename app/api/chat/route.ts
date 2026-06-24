import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { services, faqs, processSteps } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const KEY = process.env.OPENAI_API_KEY;
const CAL = process.env.NEXT_PUBLIC_CALCOM_LINK;

type Msg = { role: "user" | "assistant"; content: string };

function systemPrompt() {
  const svc = services
    .map((s) => `- ${s.title}: ${s.description} (${s.items.join(", ")})`)
    .join("\n");
  const faq = faqs.map((f) => `P: ${f.q}\nR: ${f.a}`).join("\n\n");
  const proc = processSteps.map((p, i) => `${i + 1}. ${p.title}: ${p.desc}`).join("\n");
  const cal = CAL
    ? `Para marcar uma reunião, compartilhe ESTE link de agendamento: ${CAL} (o cliente escolhe o horário e recebe o convite do Google Meet automaticamente).`
    : `Se o cliente quiser reunião, peça o melhor horário e diga que a equipe confirmará o convite do Google Meet por e-mail.`;

  return `Você é o assistente virtual da HyperGrow, uma agência de tecnologia (sites, e-commerce, sistemas sob medida, automação e inteligência artificial).

Fale sempre em português do Brasil, com tom profissional, próximo e objetivo. Respostas curtas (2-4 frases). Use no máximo 1 emoji quando fizer sentido.

SERVIÇOS:
${svc}

COMO TRABALHAMOS:
${proc}

PERGUNTAS FREQUENTES:
${faq}

OBJETIVO: entender a necessidade do visitante, qualificar e converter em reunião.
- Faça poucas perguntas por vez. Descubra: o que a empresa precisa, nome e e-mail (e WhatsApp se possível).
- NUNCA invente preços exatos nem prazos garantidos. Fale em faixas e que a proposta é sob medida; convide para uma reunião/orçamento.
- Quando tiver NOME e E-MAIL (e idealmente o interesse), chame a função save_lead para registrar o contato.
- ${cal}
- Nunca prometa funcionalidades que não foram citadas aqui. Se não souber, ofereça falar com um especialista.`;
}

const tools = [
  {
    type: "function",
    function: {
      name: "save_lead",
      description:
        "Registra o contato/lead no CRM da HyperGrow quando o visitante fornece nome e e-mail.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nome do visitante" },
          email: { type: "string", description: "E-mail do visitante" },
          phone: { type: "string", description: "WhatsApp/telefone, se houver" },
          interest: { type: "string", description: "Serviço ou necessidade de interesse" },
          summary: { type: "string", description: "Resumo curto da conversa/necessidade" },
        },
        required: ["name", "email"],
      },
    },
  },
];

async function saveLead(args: any) {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "db_off" };
  const { error } = await supabase.from("leads").insert({
    name: (args.name || "").toString().slice(0, 120),
    email: (args.email || "").toString().slice(0, 160),
    phone: args.phone ? args.phone.toString().slice(0, 40) : null,
    product: args.interest ? args.interest.toString().slice(0, 120) : null,
    message: args.summary ? args.summary.toString().slice(0, 1000) : null,
    source: "agente-ia",
    status: "novo",
  });
  return { ok: !error };
}

async function callOpenAI(messages: any[]) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({ model: MODEL, messages, tools, temperature: 0.4 }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`openai ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}

/** Auto-aprendizado: busca Q&A passadas relevantes (overlap de palavras). */
async function fetchKnowledge(question: string): Promise<string> {
  const supabase = getServerSupabase();
  if (!supabase) return "";
  try {
    const { data, error } = await supabase
      .from("agent_qa")
      .select("question, answer")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error || !data?.length) return "";
    const words = new Set(
      question.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
        .split(/[^a-z0-9]+/).filter((w) => w.length > 3)
    );
    const scored = data
      .map((qa: any) => {
        const qw = (qa.question || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        let score = 0;
        words.forEach((w) => { if (qw.includes(w)) score++; });
        return { qa, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    if (!scored.length) return "";
    const block = scored.map((x) => `P: ${x.qa.question}\nR: ${x.qa.answer}`).join("\n\n");
    return `\n\nBASE DE CONHECIMENTO (perguntas reais de clientes e como já respondemos — use como referência, mantendo coerência):\n${block}`;
  } catch {
    return "";
  }
}

/** Salva a pergunta + resposta para o agente aprender com o tempo (best-effort). */
async function saveQA(question: string, answer: string) {
  const supabase = getServerSupabase();
  if (!supabase) return;
  if (!question || !answer || answer.length < 12) return;
  try {
    await supabase.from("agent_qa").insert({
      question: question.slice(0, 600),
      answer: answer.slice(0, 2000),
    });
  } catch { /* tabela pode não existir ainda — ignora */ }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const history: Msg[] = Array.isArray(body?.messages) ? body.messages : [];

  if (!KEY) {
    return NextResponse.json({
      offline: true,
      reply:
        "Nosso assistente de IA ainda não está ativo. Mas posso te ajudar agora: clique em “Solicitar orçamento” ou fale no WhatsApp que respondemos rápido. 😉",
    });
  }

  const clean = history
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.toString().slice(0, 2000) }));

  const lastUser = [...clean].reverse().find((m) => m.role === "user")?.content || "";
  const knowledge = await fetchKnowledge(lastUser);

  const msgs: any[] = [{ role: "system", content: systemPrompt() + knowledge }, ...clean];

  try {
    let data = await callOpenAI(msgs);
    let choice = data.choices?.[0]?.message;
    let savedLead = false;

    // Uma rodada de tool-calls (save_lead)
    if (choice?.tool_calls?.length) {
      msgs.push(choice);
      for (const tc of choice.tool_calls) {
        let result: any = { ok: false };
        if (tc.function?.name === "save_lead") {
          let args: any = {};
          try {
            args = JSON.parse(tc.function.arguments || "{}");
          } catch {}
          result = await saveLead(args);
          if (result.ok) savedLead = true;
        }
        msgs.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        });
      }
      data = await callOpenAI(msgs);
      choice = data.choices?.[0]?.message;
    }

    const reply = choice?.content || "Pode me contar um pouco mais sobre o que você precisa?";
    // Auto-aprendizado: registra a interação para o agente melhorar com o tempo.
    await saveQA(lastUser, reply);

    return NextResponse.json({
      reply,
      savedLead,
      schedulingLink: CAL || null,
    });
  } catch (e: any) {
    console.error("[chat]", e?.message);
    return NextResponse.json(
      {
        offline: true,
        reply:
          "Tive um problema para responder agora. Pode falar no WhatsApp ou clicar em “Solicitar orçamento” que a equipe te atende. 🙏",
      },
      { status: 200 }
    );
  }
}

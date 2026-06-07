import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, ADMIN_COOKIE } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authed() {
  return verifySession(cookies().get(ADMIN_COOKIE)?.value);
}

const ALLOWED_STAGES = [
  "novo",
  "em_contato",
  "reuniao",
  "proposta",
  "cliente",
  "descartado",
];

export async function GET() {
  if (!authed()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data || [] });
}

export async function PATCH(req: NextRequest) {
  if (!authed()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = (body?.id || "").toString();
  const status = (body?.status || "").toString();

  if (!id || !ALLOWED_STAGES.includes(status)) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });

  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

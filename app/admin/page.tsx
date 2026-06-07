import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, ADMIN_COOKIE } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase";
import Kanban, { type Lead } from "@/components/admin/Kanban";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = { title: "Painel — HyperGrow", robots: { index: false } };

export default async function AdminPage() {
  if (!verifySession(cookies().get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/login");
  }

  const supabase = getServerSupabase();
  let leads: Lead[] = [];
  let dbError = false;

  if (supabase) {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) dbError = true;
    else leads = (data as Lead[]) || [];
  } else {
    dbError = true;
  }

  return <Kanban initialLeads={leads} dbError={dbError} />;
}

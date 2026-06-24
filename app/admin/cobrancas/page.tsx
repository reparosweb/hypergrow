import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, ADMIN_COOKIE } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase";
import { asaasReady } from "@/lib/asaas";
import Billing, { type Charge } from "@/components/admin/Billing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Cobranças — HyperGrow", robots: { index: false } };

export default async function CobrancasPage() {
  if (!verifySession(cookies().get(ADMIN_COOKIE)?.value)) redirect("/admin/login");

  const supabase = getServerSupabase();
  let charges: Charge[] = [];
  let dbReady = false;

  if (supabase) {
    const { data, error } = await supabase
      .from("charges")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error) { dbReady = true; charges = (data as Charge[]) || []; }
  }

  return <Billing initialCharges={charges} asaasReady={asaasReady()} dbReady={dbReady} />;
}

import { getServerSupabase } from "@/lib/supabase";
import { asaasReady } from "@/lib/asaas";
import Billing, { type Charge } from "@/components/admin/Billing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Cobranças — HyperGrow", robots: { index: false } };

/* Sessão validada em `(painel)/layout.tsx`. */
export default async function CobrancasPage() {
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

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, ADMIN_COOKIE } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase";
import Financeiro, { type Categoria, type Receivable, type Payable } from "@/components/admin/Financeiro";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Financeiro — HyperGrow", robots: { index: false } };

export default async function FinanceiroPage() {
  if (!verifySession(cookies().get(ADMIN_COOKIE)?.value)) redirect("/admin/login");

  const supabase = getServerSupabase();
  let categorias: Categoria[] = [];
  let receber: Receivable[] = [];
  let pagar: Payable[] = [];
  let dbError = false;

  if (supabase) {
    const [c, r, p] = await Promise.all([
      supabase.from("financial_categories").select("id,name,type,color,display_order").eq("is_active", true).order("display_order"),
      supabase
        .from("receivables")
        .select("id,subject,client_name,lead_id,charge_id,category_id,value,status,payment_method,due_date,paid_at,notes,created_at,updated_at")
        .order("due_date", { ascending: true })
        .limit(500),
      supabase
        .from("payables")
        .select("id,title,supplier,document,category_id,value,status,payment_method,due_date,paid_at,is_recurring,notes,created_at,updated_at")
        .order("due_date", { ascending: true })
        .limit(500),
    ]);
    if (c.error || r.error || p.error) dbError = true;
    categorias = (c.data as Categoria[]) || [];
    receber = (r.data as Receivable[]) || [];
    pagar = (p.data as Payable[]) || [];
  } else {
    dbError = true;
  }

  return <Financeiro initialCategorias={categorias} initialReceber={receber} initialPagar={pagar} dbError={dbError} />;
}

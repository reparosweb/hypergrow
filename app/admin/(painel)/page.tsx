import { getServerSupabase } from "@/lib/supabase";
import CrmView, { type Lead } from "@/components/admin/CrmView";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = { title: "Painel — HyperGrow", robots: { index: false } };

/* A checagem de sessão saiu daqui: agora mora em `(painel)/layout.tsx`, uma vez
   só para todas as telas do painel. */
export default async function AdminPage() {
  const supabase = getServerSupabase();
  let leads: Lead[] = [];
  let dbError = false;

  if (supabase) {
    /* `stage_order` ordena dentro da coluna do kanban, mas essa coluna só passa
       a existir depois que o dono rodar `supabase/004_crm.sql`. Ordenar por uma
       coluna inexistente faz o PostgREST devolver erro e o painel abriria VAZIO
       — quebrando uma tela que hoje funciona. Por isso a tentativa é escalonada:
       usa a ordenação boa se existir, e cai na antiga se ainda não existir. */
    let { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("stage_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      ({ data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false }));
    }

    if (error) dbError = true;
    else leads = (data as Lead[]) || [];
  } else {
    dbError = true;
  }

  return <CrmView initialLeads={leads} dbError={dbError} />;
}

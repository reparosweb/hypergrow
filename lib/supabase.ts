import { createClient } from "@supabase/supabase-js";

// Server-side client. Uses the service role key when available (for inserting
// leads from the API route), otherwise falls back to the anon key.
// All values come from environment variables — nothing is hardcoded.
export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

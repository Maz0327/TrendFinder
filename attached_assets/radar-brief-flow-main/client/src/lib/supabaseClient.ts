import { createClient } from "@supabase/supabase-js";
import type { Database } from "@shared/database.types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const isDev = import.meta.env.DEV;

export const IS_DEMO = (!url || !anon) && isDev;

if ((!url || !anon) && !isDev) {
  throw new Error(
    "Missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in production. Configure env or use demo locally."
  );
}

if (IS_DEMO) {
  console.warn(
    "[Demo Mode] Supabase env vars not found in dev. Using in-memory demo data."
  );
}

export const supabase = !IS_DEMO
  ? createClient<Database>(url!, anon!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export function getClient() {
  if (!supabase) throw new Error("Demo mode active: Supabase client unavailable");
  return supabase;
}

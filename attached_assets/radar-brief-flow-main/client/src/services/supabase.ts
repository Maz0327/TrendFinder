import { IS_DEMO, getClient, supabase } from "../lib/supabaseClient";

export { IS_DEMO, getClient, supabase };

export async function getSession() {
  if (IS_DEMO) return { data: { session: null }, error: null } as const;
  return getClient().auth.getSession();
}

// Small helper for demo latency
export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

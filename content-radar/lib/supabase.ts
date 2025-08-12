// Re-export the existing env-based Supabase client for content-radar
export { supabase } from "../../client/src/lib/supabaseClient";

// Add getClient function for Lovable compatibility
export const getClient = () => supabase;

import { createClient } from '@supabase/supabase-js'

// Prefer env vars; fall back to existing generated client values if missing
const url = import.meta.env.VITE_SUPABASE_URL || 'https://uytiwodjtulpjvgjtsod.supabase.co'
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dGl3b2RqdHVscGp2Z2p0c29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzAwNzUsImV4cCI6MjA2OTkwNjA3NX0.p_ss1MSfiy4fuRZV6UqO-y90HWjGiMs78knSX8HSlRM'

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
})

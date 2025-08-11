import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCaptures } from "@/hooks/useCaptures";
import { useBriefs } from "@/hooks/useBriefs";
import { useMoments } from "@/hooks/useMoments";

export default function SupabaseSmokeTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { data: captures, loading: cl, error: ce, insertDummy: addCapture, fetchCaptures } = useCaptures();
  const { data: briefs,   loading: bl, error: be, insertDummy: addBrief,   fetchBriefs }   = useBriefs();
  const { data: moments,  loading: ml, error: me, insertDummy: addMoment,  fetchMoments }  = useMoments();

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    alert(error ? `Sign up error: ${error.message}` : "Check your email to confirm.");
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    alert(error ? `Sign in error: ${error.message}` : "Signed in!");
    if (!error) { fetchCaptures(); fetchBriefs(); }
  }

  async function signOut() {
    await supabase.auth.signOut();
    alert("Signed out");
  }

  return (
    <div style={{ color: "#EAEAEA", background: "#0F1115", minHeight: "100vh", padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Supabase Smoke Test</h1>

      <section style={{ marginBottom: 24, padding: 16, background: "#151822", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Auth</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 8, borderRadius: 8, background: "#0F1115", color: "#EAEAEA", border: "1px solid #2A2F3A", minWidth: 220 }}
          />
          <input
            type="password"
            placeholder="password (min 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 8, borderRadius: 8, background: "#0F1115", color: "#EAEAEA", border: "1px solid #2A2F3A", minWidth: 220 }}
          />
          <button onClick={signUp}  style={{ padding: "8px 12px", borderRadius: 8, background: "#3B82F6", border: 0, color: "#fff" }}>Sign Up</button>
          <button onClick={signIn}  style={{ padding: "8px 12px", borderRadius: 8, background: "#10B981", border: 0, color: "#fff" }}>Sign In</button>
          <button onClick={signOut} style={{ padding: "8px 12px", borderRadius: 8, background: "#EF4444", border: 0, color: "#fff" }}>Sign Out</button>
        </div>
        <p style={{ marginTop: 8, opacity: 0.8 }}>RLS policies require an authenticated user for captures/briefs CRUD.</p>
      </section>

      <section style={{ marginBottom: 24, padding: 16, background: "#151822", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Captures</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <button onClick={addCapture}    style={{ padding: "8px 12px", borderRadius: 8, background: "#6366F1", border: 0, color: "#fff" }}>Insert Dummy</button>
          <button onClick={fetchCaptures} style={{ padding: "8px 12px", borderRadius: 8, background: "#374151", border: 0, color: "#fff" }}>Refresh</button>
        </div>
        {cl && <div>Loading…</div>}
        {ce && <div style={{ color: "#F87171" }}>{ce}</div>}
        <pre style={{ whiteSpace: "pre-wrap", background: "#0F1115", padding: 12, borderRadius: 8, border: "1px solid #2A2F3A" }}>
{JSON.stringify(captures ?? [], null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: 24, padding: 16, background: "#151822", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>DSD Briefs</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <button onClick={addBrief}  style={{ padding: "8px 12px", borderRadius: 8, background: "#6366F1", border: 0, color: "#fff" }}>Insert Dummy</button>
          <button onClick={fetchBriefs} style={{ padding: "8px 12px", borderRadius: 8, background: "#374151", border: 0, color: "#fff" }}>Refresh</button>
        </div>
        {bl && <div>Loading…</div>}
        {be && <div style={{ color: "#F87171" }}>{be}</div>}
        <pre style={{ whiteSpace: "pre-wrap", background: "#0F1115", padding: 12, borderRadius: 8, border: "1px solid #2A2F3A" }}>
{JSON.stringify(briefs ?? [], null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: 24, padding: 16, background: "#151822", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Cultural Moments</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <button onClick={addMoment}  style={{ padding: "8px 12px", borderRadius: 8, background: "#6366F1", border: 0, color: "#fff" }}>Insert Dummy</button>
          <button onClick={fetchMoments} style={{ padding: "8px 12px", borderRadius: 8, background: "#374151", border: 0, color: "#fff" }}>Refresh</button>
        </div>
        {ml && <div>Loading…</div>}
        {me && <div style={{ color: "#F87171" }}>{me}</div>}
        <pre style={{ whiteSpace: "pre-wrap", background: "#0F1115", padding: 12, borderRadius: 8, border: "1px solid #2A2F3A" }}>
{JSON.stringify(moments ?? [], null, 2)}
        </pre>
      </section>
    </div>
  );
}
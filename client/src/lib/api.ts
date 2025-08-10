// Minimal API wrapper that adds Authorization header if a Supabase token is present.
// If you already have a Supabase client, you can swap the token getter below.

async function getSupabaseToken(): Promise<string | null> {
  try {
    // Common places to look (adjust if you already store differently)
    const raw = localStorage.getItem("sb-access-token") || localStorage.getItem("supabase.auth.token");
    if (raw) {
      // supabase.auth.token often stores a JSON object; try parse then fallback
      try {
        const obj = JSON.parse(raw);
        // v2 session shape: { currentSession: { access_token: "..." }, ... }
        const token =
          obj?.currentSession?.access_token ||
          obj?.access_token ||
          obj?.accessToken ||
          null;
        return token || null;
      } catch {
        return raw;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await getSupabaseToken();
  const headers = new Headers(init.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  return fetch(input, { ...init, headers });
}

// Export as 'api' for compatibility with existing imports
export const api = apiFetch;
// client/src/ui-v2/lib/api.ts
export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type Json = Record<string, any> | any[];
type Query = Record<string, string | number | boolean | undefined>;

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  "/api";

export const IS_MOCK_MODE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_UIV2_MOCK === "1") ||
  false;

// Token is stored by host app after auth; UI-v2 just reads it
function getToken(): string | null {
  try {
    return localStorage.getItem("sb-access-token");
  } catch {
    return null;
  }
}

function toQuery(params?: Query): string {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: Json | FormData,
  headers?: HeadersInit,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const h = new Headers(headers || {});
  const token = getToken();
  if (token) h.set("Authorization", `Bearer ${token}`);

  const init: RequestInit = { method, headers: h };

  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    if (!h.has("Content-Type")) h.set("Content-Type", "application/json");
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  // Non-JSON fallback
  return (await res.text()) as unknown as T;
}

export const api = {
  get: <T>(path: string, params?: Query, headers?: HeadersInit) =>
    request<T>("GET", `${path}${toQuery(params)}`, undefined, headers),
  post: <T>(path: string, body?: Json | FormData, headers?: HeadersInit) =>
    request<T>("POST", path, body, headers),
  patch: <T>(path: string, body?: Json | FormData, headers?: HeadersInit) =>
    request<T>("PATCH", path, body, headers),
  del: <T>(path: string, body?: Json | FormData, headers?: HeadersInit) =>
    request<T>("DELETE", path, body, headers),
};
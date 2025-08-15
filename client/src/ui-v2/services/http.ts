const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export const IS_MOCK_MODE =
  Boolean(import.meta.env.VITE_UIV2_MOCK) ||
  (typeof location !== "undefined" && location.hostname.includes("bolt"));

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = (typeof localStorage !== "undefined" && localStorage.getItem("sb-access-token")) || "";
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const api = {
  request,
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body?: unknown) => request<T>(p, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(p: string, body?: unknown) => request<T>(p, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(p: string) => request<T>(p, { method: "DELETE" }),
};

export default api;
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export const IS_MOCK_MODE =
  Boolean(import.meta.env.VITE_UIV2_MOCK) ||
  (typeof window !== "undefined" &&
    window.location &&
    String(window.location.hostname || "").includes("stackblitz"));

function authHeader(): Record<string,string> {
  try {
    const t = localStorage.getItem("sb-access-token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch { return {}; }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...Object.fromEntries(headers), ...authHeader() },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

async function mock<T>(data: T, delay = 250): Promise<T> {
  await new Promise(r => setTimeout(r, delay));
  return data;
}

export const api = { request, mock };
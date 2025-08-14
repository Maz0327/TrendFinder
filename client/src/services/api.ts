import { supabase } from "@/integrations/supabase/client";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// Enhanced token retrieval from auth context
async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Build query string from parameters
export function buildQuery(params?: Record<string, any>): string {
  if (!params) return "";
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        searchParams.set(key, value.join(","));
      } else {
        searchParams.set(key, String(value));
      }
    }
  });
  
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

// Enhanced API fetch with error handling and auth
export async function apiFetch<T>(
  path: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid - redirect to login
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 100);
      throw new Error("Authentication required");
    }
    
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || response.statusText;
    } catch {
      errorMessage = response.statusText;
    }
    
    throw new Error(`API Error ${response.status}: ${errorMessage}`);
  }
  
  return response.json() as Promise<T>;
}

// Convenience methods for common HTTP verbs
export const api = {
  get: <T>(path: string, params?: Record<string, any>) => 
    apiFetch<T>(`${path}${buildQuery(params)}`),
    
  post: <T>(path: string, body?: any) => 
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
    
  put: <T>(path: string, body?: any) => 
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) }),
    
  patch: <T>(path: string, body?: any) => 
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
    
  delete: <T>(path: string) => 
    apiFetch<T>(path, { method: "DELETE" })
};

// Response types for paginated endpoints
export interface PaginatedResponse<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}
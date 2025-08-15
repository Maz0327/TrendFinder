import { useEffect, useState } from "react";
import { IS_MOCK_MODE, api } from "../services/http";

export type AuthUser = { id: string; email?: string; name?: string; avatar_url?: string };

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (IS_MOCK_MODE) {
          if (mounted) setUser({ id: "mock-user", email: "demo@local" });
        } else {
          const me = await api.request<AuthUser | null>("/auth/user");
          if (mounted) setUser(me);
        }
      } catch {
        if (IS_MOCK_MODE && mounted) setUser({ id: "mock-user", email: "demo@local" });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
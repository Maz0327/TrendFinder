import { ReactNode, useEffect, createContext, useContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IS_MOCK_MODE } from "../lib/api";
import { useAuth, AuthProvider } from "../hooks/useAuth";

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

// Project Context
interface ProjectContextType {
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}

function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  return (
    <ProjectContext.Provider value={{ currentProjectId, setCurrentProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const el = document.documentElement;
    const body = document.body;
    const saved = localStorage.getItem("theme");
    const theme = saved || "dark";
    
    el.classList.remove("theme-dark", "theme-light");
    el.classList.add(theme === "light" ? "theme-light" : "theme-dark");
    
    // Ensure body has proper styling
    body.classList.add("bg-app", "text-ink");
    body.style.minHeight = "100vh";
    body.style.margin = "0";
    body.style.padding = "0";
  }, []);
  return <>{children}</>;
}

export function AuthBoundary({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  

  
  if (loading) return <div className="p-6 text-ink">Loading…</div>;
  
  // If we have a user (including mock user), show the app
  if (user) return <>{children}</>;
  
  // If no user, redirect to login (regardless of mock mode for now)
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {

    window.location.href = '/login';
    return <div className="p-6 text-ink">Redirecting to login...</div>;
  }
  
  // If already on login page but no user, something is wrong

  return <div className="p-6 text-ink">Please log in to continue</div>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <ProjectProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ProjectProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}


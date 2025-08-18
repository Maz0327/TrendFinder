import { ReactNode, useEffect, createContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../hooks/useAuth";

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
  const context = React.useContext(ProjectContext);
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

function ThemeProvider({ children }: { children: ReactNode }) {
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

function AuthBoundary({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="p-6 text-ink bg-app min-h-screen">Loading…</div>;
  
  // If we have a user (including mock user), show the app
  if (user) return <>{children}</>;
  
  // For development, bypass login redirect temporarily
  return <>{children}</>;
}

// Manual routing system - bypassing problematic wouter Route/Switch
function SimpleRouter() {
  const [currentPage, setCurrentPage] = useState<string>('briefs');
  
  return (
    <div className="flex h-screen bg-app text-ink">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-glass border-r border-border p-4">
        <div className="space-y-2">
          <button
            onClick={() => setCurrentPage('briefs')}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              currentPage === 'briefs' 
                ? 'bg-glass-heavy text-ink' 
                : 'text-ink-light hover:bg-glass hover:text-ink'
            }`}
          >
            📋 Strategic Briefs
          </button>
          <button
            onClick={() => setCurrentPage('captures')}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              currentPage === 'captures' 
                ? 'bg-glass-heavy text-ink' 
                : 'text-ink-light hover:bg-glass hover:text-ink'
            }`}
          >
            🎯 Content Captures
          </button>
          <button
            onClick={() => setCurrentPage('radar')}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              currentPage === 'radar' 
                ? 'bg-glass-heavy text-ink' 
                : 'text-ink-light hover:bg-glass hover:text-ink'
            }`}
          >
            📡 Moments Radar
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {currentPage === 'briefs' && <BriefsPage />}
        {currentPage === 'captures' && <CapturesPage />}
        {currentPage === 'radar' && <RadarPage />}
      </main>
    </div>
  );
}

// Simple page components
function BriefsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Strategic Briefs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-glass border border-border rounded-2xl">
          <h3 className="font-medium text-ink mb-2">Cultural Moment Analysis</h3>
          <p className="text-ink-light text-sm">Track emerging cultural trends</p>
        </div>
        <div className="p-6 bg-glass border border-border rounded-2xl">
          <h3 className="font-medium text-ink mb-2">Brand Voice Alignment</h3>
          <p className="text-ink-light text-sm">Optimize brand messaging</p>
        </div>
        <div className="p-6 bg-glass border border-border rounded-2xl">
          <h3 className="font-medium text-ink mb-2">Viral Potential Scoring</h3>
          <p className="text-ink-light text-sm">Predict content performance</p>
        </div>
      </div>
    </div>
  );
}

function CapturesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Content Captures</h1>
      <div className="p-6 bg-glass border border-border rounded-2xl">
        <p className="text-ink-light">Capture and analyze content from across the web</p>
      </div>
    </div>
  );
}

function RadarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Moments Radar</h1>
      <div className="p-6 bg-glass border border-border rounded-2xl">
        <p className="text-ink-light">Real-time monitoring of cultural moments</p>
      </div>
    </div>
  );
}

export function UiV2App() {
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <ProjectProvider>
          <AuthProvider>
            <div className="ui-v2 bg-app min-h-screen text-ink">
              <AuthBoundary>
                <SimpleRouter />
              </AuthBoundary>
            </div>
          </AuthProvider>
        </ProjectProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
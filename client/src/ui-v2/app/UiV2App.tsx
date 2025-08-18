import { ReactNode, useEffect, createContext, useState, useContext } from "react";
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
    <div className="flex min-h-screen bg-app">
      {/* Sophisticated Sidebar */}
      <aside className="w-80 bg-glass border-r border-border backdrop-blur-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-glass-heavy flex items-center justify-center">
              <span className="text-xl">📡</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-ink">Content Radar</h1>
              <p className="text-xs text-ink-light">Strategic Intelligence</p>
            </div>
          </div>

          <nav className="space-y-3">
            <NavButton 
              active={currentPage === 'briefs'} 
              onClick={() => setCurrentPage('briefs')}
              icon="📋"
              title="Strategic Briefs"
              subtitle="DSD Signal Drop"
            />
            <NavButton 
              active={currentPage === 'captures'} 
              onClick={() => setCurrentPage('captures')}
              icon="🎯"
              title="Content Captures"
              subtitle="Multi-platform analysis"
            />
            <NavButton 
              active={currentPage === 'radar'} 
              onClick={() => setCurrentPage('radar')}
              icon="📡"
              title="Moments Radar"
              subtitle="Cultural emergence"
            />
            <NavButton 
              active={currentPage === 'canvas'} 
              onClick={() => setCurrentPage('canvas')}
              icon="🎨"
              title="Brief Canvas"
              subtitle="Visual editor"
            />
            <NavButton 
              active={currentPage === 'truth'} 
              onClick={() => setCurrentPage('truth')}
              icon="🔍"
              title="Truth Analysis"
              subtitle="4-layer framework"
            />
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {currentPage === 'briefs' && <BriefsPage />}
        {currentPage === 'captures' && <CapturesPage />}
        {currentPage === 'radar' && <RadarPage />}
        {currentPage === 'canvas' && <CanvasPage />}
        {currentPage === 'truth' && <TruthAnalysisPage />}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, title, subtitle }: {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-2xl text-left transition-all duration-200 ${
        active 
          ? 'bg-glass-heavy border border-border shadow-lg' 
          : 'hover:bg-glass border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
          active ? 'bg-glass-heavy' : 'bg-glass'
        }`}>
          <span className="text-sm">{icon}</span>
        </div>
        <div>
          <div className={`font-medium text-sm ${active ? 'text-ink' : 'text-ink-light'}`}>
            {title}
          </div>
          <div className="text-xs text-ink-light">
            {subtitle}
          </div>
        </div>
      </div>
    </button>
  );
}

// Sophisticated page components
function BriefsPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="p-8 border-b border-border bg-glass backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Strategic Briefs</h1>
            <p className="text-ink-light">Transform signals into strategic decisions</p>
          </div>
          <button className="px-6 py-3 bg-glass-heavy border border-border rounded-2xl text-ink hover:bg-glass transition-colors">
            Create Brief
          </button>
        </div>
      </header>
      
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <BriefCard 
            title="Cultural Moment Analysis"
            description="Track emerging cultural trends and viral patterns"
            status="Active"
            insights={24}
          />
          <BriefCard 
            title="Brand Voice Alignment"
            description="Optimize messaging for authentic engagement"
            status="Draft"
            insights={12}
          />
          <BriefCard 
            title="Viral Potential Scoring"
            description="Predict content performance with AI analysis"
            status="Complete"
            insights={36}
          />
        </div>
      </div>
    </div>
  );
}

function BriefCard({ title, description, status, insights }: {
  title: string;
  description: string;
  status: string;
  insights: number;
}) {
  const statusColors = {
    Active: 'bg-green-500/20 text-green-400 border-green-500/30',
    Draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Complete: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="p-6 bg-glass border border-border rounded-2xl hover:bg-glass-heavy transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-ink">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs border ${statusColors[status as keyof typeof statusColors]}`}>
          {status}
        </span>
      </div>
      <p className="text-ink-light text-sm mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-light">{insights} insights</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-glass"></div>
          <div className="w-6 h-6 rounded-full bg-glass -ml-2"></div>
          <div className="w-6 h-6 rounded-full bg-glass -ml-2"></div>
        </div>
      </div>
    </div>
  );
}

function CapturesPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="p-8 border-b border-border bg-glass backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-ink mb-2">Content Captures</h1>
        <p className="text-ink-light">Collect and analyze content from across platforms</p>
      </header>
      <div className="flex-1 p-8">
        <div className="p-12 bg-glass border border-border rounded-2xl text-center">
          <div className="w-16 h-16 bg-glass-heavy rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-ink mb-2">Start Capturing</h3>
          <p className="text-ink-light mb-6">Use the Chrome extension to capture content</p>
          <button className="px-6 py-3 bg-glass-heavy border border-border rounded-2xl text-ink">
            Install Extension
          </button>
        </div>
      </div>
    </div>
  );
}

function RadarPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="p-8 border-b border-border bg-glass backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-ink mb-2">Moments Radar</h1>
        <p className="text-ink-light">Real-time cultural moment detection</p>
      </header>
      <div className="flex-1 p-8">
        <div className="h-full bg-glass border border-border rounded-2xl p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-glass-heavy rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl">📡</span>
            </div>
            <h3 className="text-xl font-semibold text-ink mb-2">Scanning for Moments</h3>
            <p className="text-ink-light">AI is analyzing cultural patterns across platforms</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="p-8 border-b border-border bg-glass backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-ink mb-2">Brief Canvas</h1>
        <p className="text-ink-light">Visual brief editor with 8 block types</p>
      </header>
      <div className="flex-1 p-8">
        <div className="h-full bg-glass border border-border rounded-2xl p-8">
          <div className="h-full border-2 border-dashed border-border rounded-xl flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl mb-4 block">🎨</span>
              <h3 className="text-lg font-semibold text-ink mb-2">Canvas Ready</h3>
              <p className="text-ink-light">Start building your strategic brief</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TruthAnalysisPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="p-8 border-b border-border bg-glass backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-ink mb-2">Truth Analysis</h1>
        <p className="text-ink-light">4-layer philosophical framework</p>
      </header>
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          <div className="space-y-4">
            <TruthLayer layer="1" title="Fact" description="Observable data points" />
            <TruthLayer layer="2" title="Observation" description="Pattern recognition" />
          </div>
          <div className="space-y-4">
            <TruthLayer layer="3" title="Insight" description="Strategic understanding" />
            <TruthLayer layer="4" title="Human Truth" description="Deeper meaning" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TruthLayer({ layer, title, description }: {
  layer: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-glass border border-border rounded-2xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-glass-heavy flex items-center justify-center">
          <span className="text-sm font-bold text-ink">{layer}</span>
        </div>
        <div>
          <h3 className="font-semibold text-ink">{title}</h3>
          <p className="text-ink-light text-sm">{description}</p>
        </div>
      </div>
      <div className="h-32 bg-glass-heavy rounded-xl border border-border"></div>
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
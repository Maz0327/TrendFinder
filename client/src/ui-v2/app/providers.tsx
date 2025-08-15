import { createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../hooks/useApi';

// Import auth hook
import { useAuth } from '../hooks/useAuth';

// Project Context
interface ProjectContextType {
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
}

function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('currentProjectId');
    } catch {
      return null;
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      if (currentProjectId) {
        localStorage.setItem('currentProjectId', currentProjectId);
      } else {
        localStorage.removeItem('currentProjectId');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [currentProjectId]);

  return (
    <ProjectContext.Provider value={{ currentProjectId, setCurrentProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

// Auth Boundary
function AuthBoundary({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Always allow access for now - bypass auth completely
  return <>{children}</>;

  // Original auth logic commented out for direct access
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
  //       <div className="glass rounded-2xl p-8 text-center">
  //         <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
  //         <p className="text-white/70">Loading...</p>
  //       </div>
  //     );
  //   }
  // 
  //   if (!user && !window.location.pathname.includes('/login')) {
  //     return (
  //       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
  //         <div className="glass rounded-2xl p-8 text-center max-w-md">
  //           <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
  //           <p className="text-white/70 mb-6">
  //             Please sign in to access Content Radar.
  //           </p>
  //           <a
  //             href="/login"
  //             className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
  //           >
  //             Sign In
  //           </a>
  //         </div>
  //       </div>
  //     );
  //   }
}

// Main Providers
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBoundary>
        <ProjectProvider>
          <div className="ui-v2">
            {children}
          </div>
        </ProjectProvider>
      </AuthBoundary>
    </QueryClientProvider>
  );
}
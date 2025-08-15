import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import { ProjectProvider } from '@/context/ProjectContext';
import { AppLayout } from '@/components/layout/AppLayout';
import RequireAuth from '@/components/auth/RequireAuth';
import AuthDebug from '@/components/auth/AuthDebug';

// Auth pages
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import AuthCallback from '@/pages/AuthCallback';
import HealthCheck from '@/pages/HealthCheck';

// Protected pages
import Dashboard from '@/pages/dashboard';
import CapturesInbox from '@/pages/captures-inbox';
import MomentsRadar from '@/pages/moments-radar';
import BriefBuilderV2 from '@/pages/brief-builder-v2';
import FeedsPage from '@/pages/feeds';
import { Settings } from '@/pages/Settings';
import Integrations from '@/pages/integrations';

// Keep existing pages accessible
import SupabaseSmokeTest from '@/pages/SupabaseSmokeTest';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen ui-v2 ui-v2-app-bg" style={{ color: 'rgb(var(--text))' }}>
          <Switch>
            {/* Public auth routes */}
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/auth/callback" component={AuthCallback} />
            <Route path="/health-check" component={HealthCheck} />
            

            
            {/* Protected routes */}
            <Route path="/dashboard">
              <RequireAuth>
                <ProjectProvider>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProjectProvider>
              </RequireAuth>
            </Route>
            
            <Route path="/captures-inbox">
              <RequireAuth>
                <ProjectProvider>
                  <AppLayout>
                    <CapturesInbox />
                  </AppLayout>
                </ProjectProvider>
              </RequireAuth>
            </Route>
            
            <Route path="/moments-radar">
              <RequireAuth>
                <ProjectProvider>
                  <AppLayout>
                    <MomentsRadar />
                  </AppLayout>
                </ProjectProvider>
              </RequireAuth>
            </Route>
            
            <Route path="/brief-builder-v2">
              <RequireAuth>
                <ProjectProvider>
                  <AppLayout>
                    <BriefBuilderV2 />
                  </AppLayout>
                </ProjectProvider>
              </RequireAuth>
            </Route>
            
            <Route path="/feeds">
              <RequireAuth>
                <ProjectProvider>
                  <AppLayout>
                    <FeedsPage />
                  </AppLayout>
                </ProjectProvider>
              </RequireAuth>
            </Route>
            
            <Route path="/settings">
              <RequireAuth>
                <ProjectProvider>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProjectProvider>
              </RequireAuth>
            </Route>
            
            <Route path="/settings">
              <RequireAuth>
                <ProjectProvider>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProjectProvider>
              </RequireAuth>
            </Route>
            
            <Route path="/integrations">
              <RequireAuth>
                <ProjectProvider>
                  <AppLayout>
                    <Integrations />
                  </AppLayout>
                </ProjectProvider>
              </RequireAuth>
            </Route>
            
            <Route path="/supabase-test">
              <RequireAuth>
                <ProjectProvider>
                  <AppLayout>
                    <SupabaseSmokeTest />
                  </AppLayout>
                </ProjectProvider>
              </RequireAuth>
            </Route>
            
            {/* Default route - go to dashboard when authenticated, login when not */}
            <Route path="/">
              <RequireAuth>
                <ProjectProvider>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProjectProvider>
              </RequireAuth>
            </Route>
            
            {/* Fallback */}
            <Route>
              <div className="p-8 text-center text-zinc-400">
                <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                <a href="/" className="text-blue-400 underline">Go Home</a>
              </div>
            </Route>
          </Switch>
          
          {/* Temporary debug component */}
          <AuthDebug />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
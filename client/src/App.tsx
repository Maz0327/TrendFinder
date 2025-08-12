import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ProjectProvider } from '@/context/ProjectContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Lovable UI Integration
import { ProjectProvider as LovableProjectProvider } from '../../content-radar/context/ProjectContext';
import LovableApp from '../../content-radar/App';

// Auth pages
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import AuthCallback from '@/pages/AuthCallback';

// Protected pages
import Dashboard from '@/pages/dashboard';
import CapturesInbox from '@/pages/captures-inbox';
import MomentsRadar from '@/pages/moments-radar';
import BriefBuilderV2 from '@/pages/brief-builder-v2';
import FeedsPage from '@/pages/feeds';
import Settings from '@/pages/settings';
import Integrations from '@/pages/integrations';

// Keep existing pages accessible
import SupabaseSmokeTest from '@/pages/SupabaseSmokeTest';

function ProtectedApp() {
  return (
    <AuthGuard>
      <ProjectProvider>
        <AppLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/captures-inbox" component={CapturesInbox} />
            <Route path="/moments-radar" component={MomentsRadar} />
            <Route path="/brief-builder-v2" component={BriefBuilderV2} />
            <Route path="/feeds" component={FeedsPage} />
            <Route path="/settings" component={Settings} />
            <Route path="/integrations" component={Integrations} />
            
            {/* Keep existing pages accessible */}
            <Route path="/supabase-test" component={SupabaseSmokeTest} />
            
            {/* 404 fallback */}
            <Route>
              <div className="p-8 text-center text-zinc-400">
                <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            </Route>
          </Switch>
        </AppLayout>
      </ProjectProvider>
    </AuthGuard>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Switch>
          {/* Public auth routes */}
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/auth/callback" component={AuthCallback} />
          
          {/* Lovable UI routes */}
          <Route path="/app-v2/:rest*">
            <LovableProjectProvider>
              <LovableApp />
            </LovableProjectProvider>
          </Route>
          
          {/* Protected routes - simplified without AuthGuard for now */}
          <Route path="/dashboard">
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </Route>
          
          <Route path="/captures-inbox">
            <AppLayout>
              <CapturesInbox />
            </AppLayout>
          </Route>
          
          <Route path="/feeds">
            <AppLayout>
              <FeedsPage />
            </AppLayout>
          </Route>
          
          {/* Default route */}
          <Route path="/">
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Content Radar</h1>
              <p className="mb-4">Strategic Intelligence Platform</p>
              <div className="space-x-4">
                <a href="/login" className="text-blue-400 underline">Login</a>
                <a href="/register" className="text-blue-400 underline">Register</a>
                <a href="/dashboard" className="text-blue-400 underline">Dashboard</a>
                <a href="/app-v2/captures-inbox" className="text-blue-400 underline">Lovable UI</a>
              </div>
            </div>
          </Route>
          
          {/* Fallback */}
          <Route>
            <div className="p-8 text-center text-zinc-400">
              <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
              <a href="/" className="text-blue-400 underline">Go Home</a>
            </div>
          </Route>
        </Switch>
      </div>
    </QueryClientProvider>
  );
}
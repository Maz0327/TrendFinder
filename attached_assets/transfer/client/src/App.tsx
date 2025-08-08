import React, { useState, useEffect } from 'react';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Route, Switch, Redirect } from 'wouter';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { authService } from './lib/auth';
import AuthPage from './pages/auth';
import { NewWorkspacePage } from './pages/new-workspace-page';
import AdminRegister from './components/admin-register';
import NotFound from './pages/not-found';
import { DebugPanel } from './components/debug-panel';
import { ErrorBoundary, setupGlobalErrorHandlers } from './components/error-boundary';
import { ThemeProvider } from '@/context/ThemeContext';

function AppContent() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [initialized, setInitialized] = useState(false);

  // auth check
  const { data, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: () => authService.getCurrentUser().catch(() => null),
    retry: false,
    enabled: !initialized,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (!isLoading) {
      const user = data?.user;
      if (user) {
        // Convert number ID to string for consistency
        setUser({ id: String(user.id), email: user.email });
      } else {
        setUser(null);
      }
      setInitialized(true);
    }
  }, [isLoading, data]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading application...</p>
      </div>
    );
  }

  const handleAuthSuccess = (authUser: { id: number; email: string }) => {
    setUser({ id: String(authUser.id), email: authUser.email });
  };

  const element = (
    <Switch>
      {/* Admin register route */}
      <Route path="/admin-register">
        <AdminRegister />
      </Route>
      
      {/* Auth route */}
      <Route path="/auth">
        {!user ? (
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        ) : (
          <Redirect to="/workspace/dashboard" />
        )}
      </Route>
      
      {/* Workspace routes - new redesigned navigation */}
      <Route path="/workspace/:rest*">
        {user ? (
          <NewWorkspacePage user={user} onLogout={() => setUser(null)} />
        ) : (
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        )}
      </Route>
      
      {/* Legacy redirects */}
      <Route path="/dashboard">
        <Redirect to="/workspace/briefing" />
      </Route>
      <Route path="/capture">
        <Redirect to="/workspace/capture" />
      </Route>
      <Route path="/signals">
        <Redirect to="/workspace/explore" />
      </Route>
      <Route path="/briefing">
        <Redirect to="/workspace/briefing" />
      </Route>
      <Route path="/explore">
        <Redirect to="/workspace/explore" />
      </Route>
      <Route path="/brief">
        <Redirect to="/workspace/briefs" />
      </Route>
      <Route path="/manage">
        <Redirect to="/workspace/manage" />
      </Route>
      
      {/* Default route */}
      <Route path="/">
        {user ? (
          <Redirect to="/workspace/dashboard" />
        ) : (
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        )}
      </Route>
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );

  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        {element}
        <DebugPanel />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default function App() {
  // global JS error handlers
  useEffect(setupGlobalErrorHandlers, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
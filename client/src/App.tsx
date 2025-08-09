import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LovableDashboard from "@/pages/lovable-dashboard";
import LovableExplore from "@/pages/lovable-explore";
import LovableCapture from "@/pages/lovable-capture";
import LovableStrategicLab from "@/pages/lovable-strategic-lab";
import Manage from "@/pages/manage";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import AuthLogin from "@/pages/auth-login";
import AuthRegister from "@/pages/auth-register";
// Legacy pages (keeping for backward compatibility)
import SignalMining from "@/pages/signal-mining";
import Projects from "@/pages/projects";
import BriefBuilder from "@/pages/brief-builder";
import MyCaptures from "@/pages/my-captures";
import IntelligenceHub from "@/pages/intelligence";
import AnalysisCenter from "@/pages/analysis";
import BriefGenerator from "@/pages/briefs";
import LovableProjects from "@/pages/lovable-projects";
import LovableTrends from "@/pages/lovable-trends";
import LovableSearch from "@/pages/lovable-search";
import LovableInsights from "@/pages/lovable-insights";
import MobileNavBar from "@/components/layout/MobileNavBar";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TourProvider } from "@/components/onboarding/OnboardingTour";
import { ProgressiveDisclosureProvider } from "@/components/onboarding/ProgressiveDisclosure";
import { SampleContentProvider } from "@/components/onboarding/SampleContent";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={AuthLogin} />
      <Route path="/register" component={AuthRegister} />
      
      {/* Lovable Design Routes - exact match to sidebar */}
      <Route path="/" component={() => <ProtectedRoute><LovableDashboard /></ProtectedRoute>} />
      <Route path="/explore" component={() => <ProtectedRoute><LovableExplore /></ProtectedRoute>} />
      <Route path="/capture" component={() => <ProtectedRoute><LovableCapture /></ProtectedRoute>} />
      <Route path="/lab" component={() => <ProtectedRoute><LovableStrategicLab /></ProtectedRoute>} />
      <Route path="/projects" component={() => <ProtectedRoute><LovableProjects /></ProtectedRoute>} />
      <Route path="/trends" component={() => <ProtectedRoute><LovableTrends /></ProtectedRoute>} />
      <Route path="/search" component={() => <ProtectedRoute><LovableSearch /></ProtectedRoute>} />
      <Route path="/insights" component={() => <ProtectedRoute><LovableInsights /></ProtectedRoute>} />
      <Route path="/settings" component={() => <ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      
      {/* Legacy Routes (backward compatibility) */}
      <Route path="/dashboard" component={() => <ProtectedRoute><LovableDashboard /></ProtectedRoute>} />
      <Route path="/explore-signals" component={() => <ProtectedRoute><LovableExplore /></ProtectedRoute>} />
      <Route path="/signal-capture" component={() => <ProtectedRoute><LovableCapture /></ProtectedRoute>} />
      <Route path="/brief-lab" component={() => <ProtectedRoute><LovableStrategicLab /></ProtectedRoute>} />
      <Route path="/manage" component={() => <ProtectedRoute><Manage /></ProtectedRoute>} />
      <Route path="/signal-mining" component={() => <ProtectedRoute><SignalMining /></ProtectedRoute>} />
      <Route path="/my-captures" component={() => <ProtectedRoute><MyCaptures /></ProtectedRoute>} />
      <Route path="/brief-builder" component={() => <ProtectedRoute><BriefBuilder /></ProtectedRoute>} />
      <Route path="/intelligence" component={() => <ProtectedRoute><IntelligenceHub /></ProtectedRoute>} />
      <Route path="/analysis" component={() => <ProtectedRoute><AnalysisCenter /></ProtectedRoute>} />
      <Route path="/briefs" component={() => <ProtectedRoute><BriefGenerator /></ProtectedRoute>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TourProvider>
          <ProgressiveDisclosureProvider>
            <SampleContentProvider>
              <TooltipProvider>
                <Toaster />
                <AppContent />
              </TooltipProvider>
            </SampleContentProvider>
          </ProgressiveDisclosureProvider>
        </TourProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  const isAuthPage = location === '/login' || location === '/register';
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return (
    <div className={user && !isAuthPage ? "pb-16 lg:pb-0" : ""}>
      <Router />
      {user && !isAuthPage && <MobileNavBar />}
    </div>
  );
}

export default App;

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NewDashboard from "@/pages/new-dashboard";
import ExploreSignals from "@/pages/explore-signals";
import SignalCapture from "@/pages/signal-capture";
import BriefLab from "@/pages/brief-lab";
import Manage from "@/pages/manage";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
// Legacy pages (keeping for backward compatibility)
import SignalMining from "@/pages/signal-mining";
import Projects from "@/pages/projects";
import BriefBuilder from "@/pages/brief-builder";
import MyCaptures from "@/pages/my-captures";
import IntelligenceHub from "@/pages/intelligence";
import AnalysisCenter from "@/pages/analysis";
import BriefGenerator from "@/pages/briefs";
import MobileNavBar from "@/components/layout/MobileNavBar";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TourProvider } from "@/components/onboarding/OnboardingTour";
import { ProgressiveDisclosureProvider } from "@/components/onboarding/ProgressiveDisclosure";
import { SampleContentProvider } from "@/components/onboarding/SampleContent";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={() => <ProtectedRoute><NewDashboard /></ProtectedRoute>} />
      
      {/* New Strategic Workflow */}
      <Route path="/explore-signals" component={() => <ProtectedRoute><ExploreSignals /></ProtectedRoute>} />
      <Route path="/signal-capture" component={() => <ProtectedRoute><SignalCapture /></ProtectedRoute>} />
      <Route path="/brief-lab" component={() => <ProtectedRoute><BriefLab /></ProtectedRoute>} />
      <Route path="/manage" component={() => <ProtectedRoute><Manage /></ProtectedRoute>} />
      <Route path="/settings" component={() => <ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      
      {/* Legacy Routes (backward compatibility) */}
      <Route path="/signal-mining" component={() => <ProtectedRoute><SignalMining /></ProtectedRoute>} />
      <Route path="/projects" component={() => <ProtectedRoute><Projects /></ProtectedRoute>} />
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
                <div className="pb-16 lg:pb-0">
                  <Router />
                </div>
                <MobileNavBar />
              </TooltipProvider>
            </SampleContentProvider>
          </ProgressiveDisclosureProvider>
        </TourProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

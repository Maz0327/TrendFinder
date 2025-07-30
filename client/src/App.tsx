import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NewDashboard from "@/pages/new-dashboard";
import IntelligenceHub from "@/pages/intelligence";
import AnalysisCenter from "@/pages/analysis";
import BriefGenerator from "@/pages/briefs";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import SignalMining from "@/pages/signal-mining";
import Projects from "@/pages/projects";
import BriefBuilder from "@/pages/brief-builder";
import MyCaptures from "@/pages/my-captures";
import Login from "@/pages/login";
import Register from "@/pages/register";
import SystemStatus from "@/pages/system-status";
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
      <Route path="/signal-mining" component={() => <ProtectedRoute><SignalMining /></ProtectedRoute>} />
      <Route path="/projects" component={() => <ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/my-captures" component={() => <ProtectedRoute><MyCaptures /></ProtectedRoute>} />
      <Route path="/brief-builder" component={() => <ProtectedRoute><BriefBuilder /></ProtectedRoute>} />
      <Route path="/intelligence" component={() => <ProtectedRoute><IntelligenceHub /></ProtectedRoute>} />
      <Route path="/analysis" component={() => <ProtectedRoute><AnalysisCenter /></ProtectedRoute>} />
      <Route path="/briefs" component={() => <ProtectedRoute><BriefGenerator /></ProtectedRoute>} />
      <Route path="/settings" component={() => <ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/system-status" component={() => <ProtectedRoute><SystemStatus /></ProtectedRoute>} />
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

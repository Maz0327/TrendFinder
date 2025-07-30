import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import IntelligenceHub from "@/pages/intelligence";
import AnalysisCenter from "@/pages/analysis";
import BriefGenerator from "@/pages/briefs";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import MobileNavBar from "@/components/layout/MobileNavBar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/intelligence" component={IntelligenceHub} />
      <Route path="/analysis" component={AnalysisCenter} />
      <Route path="/briefs" component={BriefGenerator} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="pb-16 lg:pb-0">
          <Router />
        </div>
        <MobileNavBar />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

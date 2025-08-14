import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CapturesInbox from "./routes/CapturesInbox";
import MomentsRadar from "./routes/MomentsRadar";
import BriefBuilderV2 from "./routes/BriefBuilderV2";
import Search from "./routes/Search";
import Collections from "./routes/Collections";
import ComingSoon from "./components/common/ComingSoon";
import DownloadZip from "./pages/DownloadZip";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import { ProjectProvider } from "./context/ProjectContext";
import { flags } from "./flags";

// Import pages from src folder
import DashboardPage from "./pages/DashboardPage";
import AppLayout from "./layout/AppLayout";
import ContentRadarApp from "../content-radar/App";

const queryClient = new QueryClient();

const App = () => {
  // useEffect(() => {
  //   document.documentElement.classList.add('dark');
  // }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot" element={<ForgotPasswordPage />} />
              
              {/* Main routes with layout */}
              <Route path="/" element={<AppLayout><Index /></AppLayout>} />
              <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
              <Route path="/download-zip" element={<DownloadZip />} />
              {flags.uiV2 && (
                <Route path="/app-v2/*" element={<ContentRadarApp />} />
              )}
              
              {flags.phase5 ? (
                <>
                  <Route path="/captures-inbox" element={<AppLayout><CapturesInbox /></AppLayout>} />
                  <Route path="/moments-radar" element={<AppLayout><MomentsRadar /></AppLayout>} />
                  <Route path="/brief-builder-v2" element={<AppLayout><BriefBuilderV2 /></AppLayout>} />
                  <Route path="/search" element={<AppLayout><Search /></AppLayout>} />
                  <Route path="/collections" element={<AppLayout><Collections /></AppLayout>} />
                </>
              ) : (
                <Route path="*" element={<ComingSoon title="Phase 5 features coming soon" />} />
              )}
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProjectProvider>
    </QueryClientProvider>
  );
};

export default App;

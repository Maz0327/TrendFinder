import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import Capture from "./pages/Capture";
import Trends from "./pages/Trends";
import Projects from "./pages/Projects";
import StrategicLab from "./pages/StrategicLab";
import Insights from "./pages/Insights";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import ExtensionPreview from "./pages/ExtensionPreview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/lab" element={<StrategicLab />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/search" element={<Search />} />
          <Route path="/extension-preview" element={<ExtensionPreview />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

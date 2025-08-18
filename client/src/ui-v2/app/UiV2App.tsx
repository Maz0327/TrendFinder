import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Providers } from './providers';
import { AppShell } from '../components/AppShell';
import AuthPage from '../pages/AuthPage';
import DashboardPage from '../pages/DashboardPage';
import ProjectsPage from '../pages/ProjectsPage';
import CapturesInboxPage from '../pages/CapturesInboxPage';
import MomentsRadarPage from '../pages/MomentsRadarPage';
import SimpleBriefsPage from '../pages/SimpleBriefsPage';
import BriefCanvasPage from '../pages/BriefCanvasPage';
import FeedsPage from '../pages/FeedsPage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';
import { ProjectUploadPage } from '../pages/ProjectUploadPage';
import { TruthLabPage } from '../pages/TruthLabPage';
import { TruthDetailPage } from '../pages/TruthDetailPage';
import { useAuth } from '../hooks/useAuth';

function AppRouter() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-ink">Loading...</div>
      </div>
    );
  }

  // For development, bypass authentication check temporarily
  // if (!isAuthenticated) {
  //   return <AuthPage />;
  // }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId/upload" element={<ProjectUploadPage />} />
        <Route path="/captures" element={<CapturesInboxPage />} />
        <Route path="/moments" element={<MomentsRadarPage />} />
        <Route path="/briefs" element={<SimpleBriefsPage />} />
        <Route path="/briefs/:id" element={<BriefCanvasPage />} />
        <Route path="/feeds" element={<FeedsPage />} />
        <Route path="/truth-lab" element={<TruthLabPage />} />
        <Route path="/truth-lab/:id" element={<TruthDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}

export function UiV2App() {
  return (
    <Providers>
      <BrowserRouter>
        <div className="ui-v2">
          <AppRouter />
        </div>
      </BrowserRouter>
    </Providers>
  );
}
import { Router, Route, Switch } from 'wouter';
import { Providers, AuthBoundary } from './providers';
import { Suspense } from 'react';
import { ErrorBoundary, CrashScreen } from '../components/system/ErrorBoundary';
import { AppShell } from '../components/AppShell';
import AuthPage from '../pages/AuthPage';
import DashboardPage from '../pages/DashboardPage';
import ProjectsPage from '../pages/ProjectsPage';
import CapturesInboxPage from '../pages/CapturesInboxPage';
import MomentsRadarPage from '../pages/MomentsRadarPage';
import SimpleBriefsPage from '../pages/SimpleBriefsPage';
import TestPage from '../pages/TestPage';
import BriefCanvasPage from '../pages/BriefCanvasPage';
import FeedsPage from '../pages/FeedsPage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';
import { ProjectUploadPage } from '../pages/ProjectUploadPage';
import { TruthLabPage } from '../pages/TruthLabPage';
import { TruthDetailPage } from '../pages/TruthDetailPage';

export function UiV2App() {
  return (
    <Providers>
      <Router>
        <div className="ui-v2 bg-app min-h-screen text-ink">
          <Suspense fallback={<div className="ui-v2 p-6">Loading…</div>}>
            <ErrorBoundary fallback={<CrashScreen title="App failed to render" hint="A component threw during render." />}>
              <Switch>
                {/* Public route - login page */}
                <Route path="/login"><AuthPage /></Route>
                
                {/* Protected routes - wrapped in auth boundary */}
                <Route path="/:rest*">
                  <AuthBoundary>
                    <AppShell>
                      <Switch>
                        <Route path="/"><SimpleBriefsPage /></Route>
                        <Route path="/dashboard"><DashboardPage /></Route>
                        <Route path="/projects"><ProjectsPage /></Route>
                        <Route path="/projects/:projectId/upload"><ProjectUploadPage /></Route>
                        <Route path="/captures"><CapturesInboxPage /></Route>
                        <Route path="/moments"><MomentsRadarPage /></Route>
                        <Route path="/briefs"><SimpleBriefsPage /></Route>
                        <Route path="/briefs/:id"><BriefCanvasPage /></Route>
                        <Route path="/feeds"><FeedsPage /></Route>
                        <Route path="/truth-lab"><TruthLabPage /></Route>
                        <Route path="/truth-lab/:id"><TruthDetailPage /></Route>
                        <Route path="/settings"><SettingsPage /></Route>
                        <Route><NotFoundPage /></Route>
                      </Switch>
                    </AppShell>
                  </AuthBoundary>
                </Route>
              </Switch>
            </ErrorBoundary>
          </Suspense>
        </div>
      </Router>
    </Providers>
  );
}
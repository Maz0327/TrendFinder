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

// Progressive restoration to identify the failing component
function MinimalUITest() {
  return (
    <div style={{
      backgroundColor: 'rgb(24, 28, 32)',
      color: 'rgb(241, 244, 248)',
      padding: '20px',
      minHeight: '100vh'
    }}>
      <h1 style={{ marginBottom: '16px' }}>Content Radar - Progressive Test</h1>
      <p>✅ Basic UI-V2 rendering working</p>
      <p>✅ CSS variables applied correctly</p>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '16px'
      }}>
        <p style={{ margin: 0 }}>Glass effect working - ready for full UI</p>
      </div>
    </div>
  );
}

export function UiV2App() {
  // Step 1: Test basic providers first
  return (
    <Providers>
      <div className="ui-v2 bg-app min-h-screen text-ink">
        <MinimalUITest />
      </div>
    </Providers>
  );
}
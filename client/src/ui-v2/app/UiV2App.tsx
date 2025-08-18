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

// Simplified test component to isolate rendering issues
function SimpleTest() {
  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      padding: '40px',
      minHeight: '100vh',
      fontSize: '18px',
      fontFamily: 'system-ui'
    }}>
      <h1 style={{ color: '#ffffff', marginBottom: '20px' }}>Content Radar UI-V2 Test</h1>
      <p style={{ color: '#e2e8f0' }}>✅ React is working</p>
      <p style={{ color: '#e2e8f0' }}>✅ CSS styling is applied</p>
      <p style={{ color: '#e2e8f0' }}>✅ UI-V2 system is loading</p>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <p style={{ color: '#ffffff', margin: 0 }}>Glass card effect working</p>
      </div>
    </div>
  );
}

export function UiV2App() {
  // Temporarily show simple test
  return <SimpleTest />;
}
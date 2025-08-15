import { RouteObject } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import AuthPage from '../pages/AuthPage';
import DashboardPage from '../pages/DashboardPage';
import ProjectsPage from '../pages/ProjectsPage';
import CapturesInboxPage from '../pages/CapturesInboxPage';
import MomentsRadarPage from '../pages/MomentsRadarPage';
import BriefsListPage from '../pages/BriefsListPage';
import BriefCanvasPage from '../pages/BriefCanvasPage';
import FeedsPage from '../pages/FeedsPage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'captures',
        element: <CapturesInboxPage />,
      },
      {
        path: 'moments',
        element: <MomentsRadarPage />,
      },
      {
        path: 'briefs',
        element: <BriefsListPage />,
      },
      {
        path: 'briefs/:id',
        element: <BriefCanvasPage />,
      },
      {
        path: 'feeds',
        element: <FeedsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];
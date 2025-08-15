import { BrowserRouter, useRoutes } from 'react-router-dom';
import { Providers } from './providers';
import { routes } from './routes.tsx';
import { DebugPanel } from '../components/DebugPanel';

function AppRoutes() {
  return useRoutes(routes);
}

export function UiV2App() {
  return (
    <Providers>
      <BrowserRouter>
        <div className="ui-v2 bg-app min-h-screen text-ink">
          <DebugPanel />
          <AppRoutes />
        </div>
      </BrowserRouter>
    </Providers>
  );
}
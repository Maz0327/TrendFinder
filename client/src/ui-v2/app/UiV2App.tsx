import { BrowserRouter, useRoutes } from 'react-router-dom';
import { Providers } from './providers';
import { routes } from './routes';
import { useTheme } from '../hooks/useTheme';
import '../../index.css';

function AppRoutes() {
  return useRoutes(routes);
}

function ThemedApp() {
  const { theme } = useTheme();
  return (
    <div data-theme={theme} className="ui-v2 ui-v2-app-bg min-h-screen text-ink">
      <AppRoutes />
    </div>
  );
}

export function UiV2App() {
  return (
    <BrowserRouter>
      <Providers>
        <ThemedApp />
      </Providers>
    </BrowserRouter>
  );
}
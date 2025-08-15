import { BrowserRouter, useRoutes } from 'react-router-dom';
import { Providers } from './providers';
import { routes } from './routes.tsx';

function AppRoutes() {
  return useRoutes(routes);
}

export function UiV2App() {
  return (
    <Providers>
      <BrowserRouter>
        <div className="ui-v2 bg-app min-h-screen text-ink">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </Providers>
  );
}
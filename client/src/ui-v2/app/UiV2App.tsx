import { BrowserRouter, useRoutes } from 'react-router-dom';
import { Providers } from './providers';
import { routes } from './routes';
import '../../index.css';

function AppRoutes() {
  return useRoutes(routes);
}

export function UiV2App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppRoutes />
      </Providers>
    </BrowserRouter>
  );
}
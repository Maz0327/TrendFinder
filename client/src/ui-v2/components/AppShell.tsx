import { Outlet } from 'react-router-dom';
import { AppHeader } from './layout/AppHeader';
import { SideNav } from './SideNav';
import { PageHeader } from './PageHeader';

export function AppShell() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AppHeader />
      <div className="flex">
        <SideNav />
        <main className="flex-1">
          <PageHeader />
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
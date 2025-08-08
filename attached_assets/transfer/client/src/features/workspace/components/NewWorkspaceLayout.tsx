import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BarChart3, 
  Compass, 
  Plus, 
  FileText, 
  Settings,
  LogOut,
  User,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { authService } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';

interface NewWorkspaceLayoutProps {
  user: { id: string; email: string };
  onLogout: () => void;
  children: React.ReactNode;
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    path: '/workspace/dashboard',
    description: 'Overview and metrics'
  },
  {
    id: 'signals',
    label: 'Signals',
    icon: Zap,
    path: '/workspace/signals',
    description: 'Browse and analyze content'
  },
  {
    id: 'capture',
    label: 'Capture',
    icon: Plus,
    path: '/workspace/capture',
    description: 'Add new content'
  },
  {
    id: 'briefs',
    label: 'Briefs',
    icon: FileText,
    path: '/workspace/briefs',
    description: 'Strategic documents'
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: Compass,
    path: '/workspace/insights',
    description: 'Deep analysis'
  }
];

export function NewWorkspaceLayout({ user, onLogout, children }: NewWorkspaceLayoutProps) {
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      await authService.logout();
      queryClient.clear();
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="flex h-16 items-center px-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Content Radar</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1 ml-8">
            {navigationItems.map((item) => {
              const isActive = location.startsWith(item.path);
              const Icon = item.icon;
              
              return (
                <Link key={item.id} href={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center space-x-3">
            <ThemeToggle />
            
            {/* User menu */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted">
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <User className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden border-b border-border bg-card">
        <div className="flex overflow-x-auto px-4 py-2 space-x-1">
          {navigationItems.map((item) => {
            const isActive = location.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Link key={item.id} href={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-shrink-0 flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
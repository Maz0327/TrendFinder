// New Workspace Layout - Phase 2 UI/UX Overhaul
// Implements the 5-tab navigation system

import React from 'react';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Search,
  Plus,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  user: { email: string; id: string };
  onLogout: () => void;
}

const navigationItems = [
  {
    id: 'briefing',
    label: "Today's Briefing",
    icon: Calendar,
    path: '/workspace/briefing',
    description: 'Daily insights and trending signals',
  },
  {
    id: 'explore',
    label: 'Explore Signals',
    icon: Search,
    path: '/workspace/explore',
    description: 'Browse and analyze captured signals',
  },
  {
    id: 'capture',
    label: 'New Signal Capture',
    icon: Plus,
    path: '/workspace/capture',
    description: 'Add new content to analyze',
  },
  {
    id: 'briefs',
    label: 'Strategic Brief Lab',
    icon: FileText,
    path: '/workspace/briefs',
    description: 'Create and manage strategic briefs',
  },
  {
    id: 'manage',
    label: 'Manage',
    icon: Settings,
    path: '/workspace/manage',
    description: 'Projects, settings, and analytics',
  },
];

export function WorkspaceLayout({ children, user, onLogout }: WorkspaceLayoutProps) {
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const currentPath = location;
  const activeItem = navigationItems.find(item => currentPath.startsWith(item.path));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
          sidebarCollapsed ? 'w-12' : 'w-48'
        )}
      >
        {/* Logo/Header */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Content Radar
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem?.id === item.id;

            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link href={item.path}>
                    <a
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        'hover:bg-gray-100 dark:hover:bg-gray-700',
                        isActive && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </a>
                  </Link>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right" className="flex flex-col">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* User Menu - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-200 dark:border-gray-700">
          <div className={cn('flex items-center gap-2', sidebarCollapsed && 'justify-center')}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
              {user.email[0].toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <button
                  onClick={onLogout}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {activeItem?.label || 'Workspace'}
          </h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
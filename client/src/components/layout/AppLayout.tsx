// client/src/components/layout/AppLayout.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ENABLE_NAV_SHELL, ENABLE_PROJECT_SWITCHER } from '@/flags';
import { ProjectSwitcher } from './ProjectSwitcher';

const NavItem: React.FC<{ to: string; label: string; onClick?: () => void }> = ({ to, label, onClick }) => {
  const [location] = useLocation();
  const isActive = location === to || (to !== '/' && location.startsWith(to));
  
  return (
    <Link href={to} onClick={onClick}>
      <a className={`block rounded-md px-3 py-2 text-sm hover:bg-zinc-800 transition ${
        isActive ? 'bg-zinc-800 text-white' : 'text-zinc-300'
      }`}>
        {label}
      </a>
    </Link>
  );
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!ENABLE_NAV_SHELL) return <>{children}</>;

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const v = localStorage.getItem('sidebar_collapsed');
    return v === '1';
  });

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar_collapsed', next ? '1' : '0');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto flex h-14 items-center gap-3 px-4">
          <button
            onClick={toggle}
            className="rounded-md border border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-800"
            aria-label="Toggle sidebar"
          >
            {collapsed ? '☰' : '×'}
          </button>
          <Link href="/">
            <a className="font-semibold tracking-wide text-zinc-100">
              Content Radar
            </a>
          </Link>
          <div className="mx-3 flex-1">
            <input
              type="search"
              placeholder="Search captures, moments, briefs…"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>
          {/* User avatar placeholder */}
          <div className="size-8 rounded-full bg-zinc-700" />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`h-[calc(100vh-56px)] shrink-0 border-r border-zinc-800 bg-zinc-900 p-3 transition-all ${
            collapsed ? 'w-[56px]' : 'w-64'
          }`}
        >
          {!collapsed && ENABLE_PROJECT_SWITCHER && (
            <div className="mb-3">
              <ProjectSwitcher />
            </div>
          )}

          <nav className="space-y-1">
            <NavItem to="/dashboard" label="Dashboard" />
            <NavItem to="/captures-inbox" label="Captures Inbox" />
            <NavItem to="/moments-radar" label="Moments Radar" />
            <NavItem to="/brief-builder-v2" label="Brief Builder" />
            <NavItem to="/feeds" label="Feeds" />
            <NavItem to="/settings" label="Settings" />
          </nav>
        </aside>

        {/* Content */}
        <main className="min-h-[calc(100vh-56px)] flex-1 p-4">{children}</main>
      </div>
    </div>
  );
};
import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { useProjects } from "../hooks/useProjects";
import { subscribeRealtime } from "../services/supabase-realtime";
import { toast } from "@/components/ui/use-toast";
import { useProject } from "../../context/ProjectContext";

export default function MainLayout() {
  const { projectsQuery } = useProjects();
  const location = useLocation();
  const { currentProjectId, setProjectId } = useProject();

  useEffect(() => {
    document.title = "Content Radar";
    const unsub = subscribeRealtime((msg) => toast({ title: msg }));
    return () => unsub();
  }, []);

  const navLink = (to: string, label: string) => (
    <Button variant="ghost" asChild>
      <Link to={to} className={location.pathname.startsWith(to) ? "text-primary" : undefined}>
        {label}
      </Link>
    </Button>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background text-foreground">
        <header className="h-14 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="font-semibold">Content Radar</Link>
            {projectsQuery.isLoading ? (
              <span className="text-xs text-muted-foreground">Loading projects…</span>
            ) : projectsQuery.isError ? (
              <span className="text-xs text-destructive">Failed to load projects</span>
            ) : (
              <select
                aria-label="Project Switcher"
                className="bg-background border rounded px-2 py-1 text-sm"
                value={currentProjectId ?? ""}
                onChange={(e)=> setProjectId(e.target.value || null)}
              >
                <option value="">Select a project…</option>
                {projectsQuery.data?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
          <nav className="flex items-center gap-2">
            {navLink("/dashboard", "Dashboard")}
            {navLink("/projects", "Projects")}
            {navLink("/captures", "Captures")}
            {navLink("/moments", "Moments")}
            {navLink("/briefs", "Briefs")}
            {navLink("/feeds", "Feeds")}
          </nav>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}

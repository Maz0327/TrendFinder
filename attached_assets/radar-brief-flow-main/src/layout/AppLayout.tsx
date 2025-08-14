import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useProjects } from "../hooks/useProjects";
import { ProjectProvider, useProject } from "../context/ProjectContext";
import { useSupabaseUser } from "../hooks/useSupabaseUser";
import { supabase } from "@/integrations/supabase/client";
import { Link, NavLink } from "react-router-dom";

function ProjectSwitcher() {
  const { projectsQuery } = useProjects();
  const { currentProjectId, setProjectId } = useProject();
  const { user } = useSupabaseUser();

  useEffect(() => {
    document.title = "Content Radar V2";
  }, []);

  if (projectsQuery.isLoading) return <span className="text-sm text-muted-foreground">Loading projects…</span>;
  if (projectsQuery.isError) return <span className="text-sm text-destructive">Failed to load projects</span>;
  if (!user) return <span className="text-sm text-muted-foreground">Not authenticated</span>;

  return (
    <select
      aria-label="Project Switcher"
      className="bg-background border rounded px-2 py-1 text-sm"
      value={currentProjectId ?? ""}
      onChange={(e) => setProjectId(e.target.value || null)}
    >
      <option value="">Select a project…</option>
      {projectsQuery.data?.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSupabaseUser();
  
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <header className="h-16 apple-blur border-b border-border/20 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-semibold text-foreground tracking-tight">
            Content Radar
          </Link>
          <ProjectSwitcher />
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="font-medium">
            <Link to="/captures-inbox">Captures</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="font-medium">
            <Link to="/moments-radar">Moments</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="font-medium">
            <Link to="/brief-builder-v2">Brief Builder</Link>
          </Button>
          {user ? (
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()} className="ml-2">
              Sign out
            </Button>
          ) : (
            <Button size="sm" asChild className="ml-2">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}

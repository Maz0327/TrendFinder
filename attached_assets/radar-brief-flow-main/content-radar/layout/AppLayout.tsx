import { NavLink, useNavigate } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { useSupabaseUser } from "../hooks/useSupabaseUser";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { projectsQuery } = useProjects();
  const { user } = useSupabaseUser();
  const { currentProjectId, setProjectId } = useProject();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background/95">
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="font-semibold tracking-tight">Content Radar</div>
          <nav className="ml-4 flex items-center gap-1 text-sm">
            <NavLink
              to="/app-v2/captures-inbox"
              className={({ isActive }) => cn("px-3 py-2 rounded-xl hover:bg-muted/50", isActive && "bg-muted text-primary font-medium")}
            >
              Captures
            </NavLink>
            <NavLink
              to="/app-v2/moments-radar"
              className={({ isActive }) => cn("px-3 py-2 rounded-xl hover:bg-muted/50", isActive && "bg-muted text-primary font-medium")}
            >
              Moments
            </NavLink>
            <NavLink
              to="/app-v2/brief-builder-v2"
              className={({ isActive }) => cn("px-3 py-2 rounded-xl hover:bg-muted/50", isActive && "bg-muted text-primary font-medium")}
            >
              Brief Builder
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Select value={currentProjectId ?? undefined} onValueChange={(v) => setProjectId(v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={projectsQuery.isLoading ? "Loading projects..." : "Select project"} />
              </SelectTrigger>
              <SelectContent>
                {projectsQuery.data?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {user ? (
              <Button variant="outline" size="sm" onClick={() => navigate("/login")}>Sign out</Button>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate("/login")}>Sign in</Button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

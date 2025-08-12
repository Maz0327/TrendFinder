import { Link, useLocation } from "wouter";
import { useProjects } from "../hooks/useProjects";
import { useSupabaseUser } from "../hooks/useSupabaseUser";
import { useProject } from "../context/ProjectContext";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../client/src/components/ui/select";
import { cn } from "../../client/src/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { projectsQuery } = useProjects();
  const { user } = useSupabaseUser();
  const { currentProjectId, setProjectId } = useProject();
  const [location, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background/95">
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="font-semibold tracking-tight">Content Radar</div>
          <nav className="ml-4 flex items-center gap-1 text-sm">
            <Link href="/app-v2/captures-inbox">
              <a className={cn("px-3 py-2 rounded-xl hover:bg-muted/50", location === "/app-v2/captures-inbox" && "bg-muted text-primary font-medium")}>
                Captures
              </a>
            </Link>
            <Link href="/app-v2/moments-radar">
              <a className={cn("px-3 py-2 rounded-xl hover:bg-muted/50", location === "/app-v2/moments-radar" && "bg-muted text-primary font-medium")}>
                Moments
              </a>
            </Link>
            <Link href="/app-v2/brief-builder-v2">
              <a className={cn("px-3 py-2 rounded-xl hover:bg-muted/50", location === "/app-v2/brief-builder-v2" && "bg-muted text-primary font-medium")}>
                Brief Builder
              </a>
            </Link>
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

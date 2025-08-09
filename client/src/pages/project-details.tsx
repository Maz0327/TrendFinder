import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Clock, User, FileText, TrendingUp, Target, BarChart3, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  // Fetch project details
  const { data: project, isLoading } = useQuery<any>({
    queryKey: ["/api/projects", id],
    enabled: !!id,
  });

  // Fetch project captures
  const { data: captures = [], isLoading: capturesLoading } = useQuery<any[]>({
    queryKey: ["/api/captures", "project", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center justify-between h-full px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="text-muted-foreground hover:text-primary" />
                  <Skeleton className="h-6 w-48" />
                </div>
              </div>
            </header>
            <main className="flex-1 p-6">
              <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!project) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center justify-between h-full px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="text-muted-foreground hover:text-primary" />
                  <h1 className="text-xl font-bold text-foreground">Project Not Found</h1>
                </div>
              </div>
            </header>
            <main className="flex-1 p-6">
              <Card className="bg-gradient-surface border-border/50 shadow-card">
                <CardContent className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-foreground">Project Not Found</h3>
                  <div className="text-muted-foreground mb-4">
                    The project you're looking for doesn't exist or has been removed.
                  </div>
                  <Button onClick={() => navigate("/projects")} className="bg-gradient-primary shadow-glow">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                  </Button>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-primary" />
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
                  {getStatusBadge(project.status)}
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate("/projects")}
                className="hover:bg-muted/80"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Project Overview */}
            <Card className="bg-gradient-surface border-border/50 shadow-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-foreground">{project.name}</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {project.client && (
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Client: {project.client}</span>
                        </div>
                      )}
                      {project.description && (
                        <div className="text-muted-foreground">{project.description}</div>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>{captures.length} captures</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Actions */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card 
                className="bg-gradient-surface border-border/50 shadow-card hover:shadow-elevated transition-smooth cursor-pointer"
                onClick={() => navigate("/capture")}
              >
                <CardContent className="text-center py-6">
                  <Plus className="mx-auto h-8 w-8 text-primary mb-2" />
                  <h3 className="font-medium text-foreground">Add Content</h3>
                  <div className="text-sm text-muted-foreground">Capture new signals</div>
                </CardContent>
              </Card>
              
              <Card 
                className="bg-gradient-surface border-border/50 shadow-card hover:shadow-elevated transition-smooth cursor-pointer"
                onClick={() => navigate("/lab")}
              >
                <CardContent className="text-center py-6">
                  <TrendingUp className="mx-auto h-8 w-8 text-primary mb-2" />
                  <h3 className="font-medium text-foreground">Generate Brief</h3>
                  <div className="text-sm text-muted-foreground">Create DSD brief</div>
                </CardContent>
              </Card>
              
              <Card 
                className="bg-gradient-surface border-border/50 shadow-card hover:shadow-elevated transition-smooth cursor-pointer"
                onClick={() => navigate("/insights")}
              >
                <CardContent className="text-center py-6">
                  <FileText className="mx-auto h-8 w-8 text-primary mb-2" />
                  <h3 className="font-medium text-foreground">View Analysis</h3>
                  <div className="text-sm text-muted-foreground">Review insights</div>
                </CardContent>
              </Card>
            </div>

            {/* Project Captures */}
            <Card className="bg-gradient-surface border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Captures</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Content signals collected for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {capturesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : captures.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-foreground">No captures yet</h3>
                    <div className="text-muted-foreground mb-4">
                      Start capturing content signals for this project
                    </div>
                    <Button 
                      onClick={() => navigate("/capture")}
                      className="bg-gradient-primary shadow-glow"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Capture
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {captures.slice(0, 5).map((capture: any) => (
                      <Card key={capture.id} className="bg-muted/30 border-border/30">
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-foreground">{capture.title || "Untitled Capture"}</h4>
                              <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {capture.content?.substring(0, 100)}...
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Platform: {capture.platform}</span>
                                <span>Score: {capture.viralScore || 0}/100</span>
                                <span>{new Date(capture.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
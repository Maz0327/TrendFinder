import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Target, Plus, Calendar, BarChart3 } from "lucide-react"

const LovableProjects = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    client: "",
    briefTemplate: "jimmy-johns"
  });
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch projects from API
  const { data: projects = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    enabled: true,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: typeof newProject) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error("Failed to create project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateDialogOpen(false);
      setNewProject({ name: "", description: "", client: "", briefTemplate: "jimmy-johns" });
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-primary" />
                <h1 className="text-xl font-bold text-foreground">Projects</h1>
                <div className="text-sm text-muted-foreground">Manage your monitoring projects</div>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary shadow-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Start a new strategic campaign or initiative
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Project Name</Label>
                      <Input
                        id="name"
                        placeholder="Nike Spring Campaign 2025"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="client">Client</Label>
                      <Input
                        id="client"
                        placeholder="Nike"
                        value={newProject.client}
                        onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Strategic campaign for Nike's spring product launch..."
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => createProjectMutation.mutate(newProject)}
                      disabled={!newProject.name || createProjectMutation.isPending}
                      className="bg-gradient-primary shadow-glow"
                    >
                      {createProjectMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Project"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <main className="flex-1 p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-gradient-surface border-border/50 shadow-card">
                    <CardHeader className="space-y-3">
                      <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                        <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="h-4 w-full bg-muted animate-pulse rounded" />
                      <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <Card className="bg-gradient-surface border-border/50 shadow-card">
                <CardContent className="text-center py-12">
                  <div className="animate-pulse">
                    <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">No projects yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first project to start organizing your strategic campaigns
                  </p>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-primary shadow-glow"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: any) => (
                  <Card key={project.id} className="bg-gradient-surface border-border/50 shadow-card hover:shadow-elevated transition-smooth">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Target className="w-5 h-5 text-primary" />
                        <Badge variant={project.status === "active" ? "default" : "secondary"}>
                          {project.status || "active"}
                        </Badge>
                      </div>
                      <CardTitle className="text-foreground">{project.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{project.description || "No description provided"}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          <span className="text-foreground">0 signals</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        View Project
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default LovableProjects
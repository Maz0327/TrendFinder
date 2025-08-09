import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Clock, User, FileText, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import PageLayout from "@/components/layout/PageLayout";
import { FadeIn, StaggeredFadeIn } from "@/components/ui/fade-in";
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
      <PageLayout title="Loading Project..." description="Fetching project details">
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!project) {
    return (
      <PageLayout title="Project Not Found" description="The requested project could not be found">
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Project Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/projects")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
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
    <PageLayout 
      title={project.name} 
      description={project.description || "Project details and captures"}
    >
      <FadeIn>
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate("/projects")}
            className="hover-lift"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <div className="flex items-center gap-2">
            {getStatusBadge(project.status)}
          </div>
        </div>

        {/* Project Overview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{project.name}</CardTitle>
                <CardDescription className="text-lg mt-2">
                  {project.client && (
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      <span>Client: {project.client}</span>
                    </div>
                  )}
                  {project.description && (
                    <p className="text-muted-foreground">{project.description}</p>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{captures.length} captures</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Actions */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="cursor-pointer hover-lift transition-all duration-200">
            <CardContent className="text-center py-6">
              <Plus className="mx-auto h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Add Content</h3>
              <p className="text-sm text-muted-foreground">Capture new signals</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover-lift transition-all duration-200">
            <CardContent className="text-center py-6">
              <TrendingUp className="mx-auto h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Generate Brief</h3>
              <p className="text-sm text-muted-foreground">Create DSD brief</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover-lift transition-all duration-200">
            <CardContent className="text-center py-6">
              <FileText className="mx-auto h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">View Analysis</h3>
              <p className="text-sm text-muted-foreground">Review insights</p>
            </CardContent>
          </Card>
        </div>

        {/* Project Captures */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Captures</CardTitle>
            <CardDescription>
              Content signals collected for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {capturesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : captures.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No captures yet</h3>
                <p className="text-muted-foreground">
                  Start capturing content signals for this project
                </p>
              </div>
            ) : (
              <StaggeredFadeIn className="space-y-4">
                {captures.slice(0, 5).map((capture: any) => (
                  <Card key={capture.id} className="bg-muted/50">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{capture.title || "Untitled Capture"}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {capture.content?.substring(0, 100)}...
                          </p>
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
              </StaggeredFadeIn>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </PageLayout>
  );
}
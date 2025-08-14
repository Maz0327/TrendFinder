import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Users, Calendar, MoreHorizontal } from "lucide-react";

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      name: "Summer Campaign 2024",
      description: "Complete marketing campaign for summer product launch",
      status: "Active",
      members: 8,
      lastActivity: "2 hours ago",
      progress: 75
    },
    {
      id: 2,
      name: "Brand Refresh",
      description: "Complete rebrand including logo, colors, and messaging",
      status: "In Review",
      members: 5,
      lastActivity: "1 day ago",
      progress: 90
    },
    {
      id: 3,
      name: "Q4 Content Strategy",
      description: "Content planning and strategy for Q4 campaigns",
      status: "Planning",
      members: 3,
      lastActivity: "3 days ago",
      progress: 25
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-primary/20 text-primary";
      case "In Review": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "Planning": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-large-title font-semibold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage and organize your content projects</p>
        </div>
        <Button className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(project.status)} variant="secondary">
                    {project.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{project.members} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Updated {project.lastActivity}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{project.progress}% complete</span>
                  </div>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button size="sm">
                    View Project
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Create Your First Project</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Projects help you organize campaigns, collaborate with your team, and track progress.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, Calendar, BarChart3 } from "lucide-react"

const Projects = () => {
  const projects = [
    {
      name: "Competitor Analysis Q1",
      description: "Monitoring competitor content strategies and viral posts",
      signals: 234,
      status: "active",
      lastUpdate: "2h ago"
    },
    {
      name: "Trend Research - AI Content",
      description: "Tracking AI-generated content trends across platforms",
      signals: 127,
      status: "active", 
      lastUpdate: "5h ago"
    },
    {
      name: "Brand Monitoring",
      description: "Tracking mentions and sentiment analysis",
      signals: 89,
      status: "paused",
      lastUpdate: "1d ago"
    }
  ]

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
              <Button className="bg-gradient-primary shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <Card key={index} className="bg-gradient-surface border-border/50 shadow-card hover:shadow-elevated transition-smooth">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Target className="w-5 h-5 text-primary" />
                      <Badge variant={project.status === "active" ? "default" : "secondary"}>
                        {project.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-foreground">{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span className="text-foreground">{project.signals} signals</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{project.lastUpdate}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">View Project</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Projects
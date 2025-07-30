import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn, StaggeredFadeIn } from "@/components/ui/fade-in";
import { useAuth } from "@/hooks/use-auth";
import { 
  Plus, 
  FolderOpen, 
  FileText, 
  TrendingUp, 
  Target,
  Puzzle,
  ArrowRight,
  Image,
  Link as LinkIcon,
  MessageSquare,
  Brain,
  Search,
  Radar,
  Sparkles,
  CheckCircle,
  Activity,
  Zap,
  Eye
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  captureCount?: number;
  briefCount?: number;
}

interface DashboardStats {
  totalProjects: number;
  totalCaptures: number;
  totalBriefs: number;
  recentActivity: number;
}

interface RecentCapture {
  id: string;
  title: string;
  type: string;
  projectName: string;
  createdAt: string;
}

export default function NewDashboard() {
  const { user } = useAuth();

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Fetch recent captures across all projects
  const { data: recentCaptures = [], isLoading: capturesLoading } = useQuery({
    queryKey: ["/api/captures/all"],
    queryFn: async () => {
      const response = await fetch("/api/captures/all");
      if (!response.ok) throw new Error("Failed to fetch captures");
      const captures = await response.json();
      return captures.slice(0, 5); // Show only recent 5
    },
  });

  // Calculate dashboard stats
  const dashboardStats: DashboardStats = {
    totalProjects: projects.length,
    totalCaptures: recentCaptures.length,
    totalBriefs: 0, // TODO: Implement when briefs are available
    recentActivity: projects.filter((p: Project) => {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return new Date(p.createdAt) > dayAgo;
    }).length,
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'link': return <LinkIcon className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-purple-100 text-purple-800';
      case 'link': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout 
      title={`Welcome back, ${user?.username}`} 
      description="Strategic intelligence at your fingertips"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalProjects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Puzzle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Captures</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalCaptures}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Briefs Created</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalBriefs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.recentActivity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* Quick Actions */}
        <FadeIn delay={100}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access all your strategic intelligence tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/projects">
                  <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover-lift">
                    <Plus className="h-6 w-6" />
                    <span>New Project</span>
                  </Button>
                </Link>
                
                <Link href="/my-captures">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover-lift border-green-200 text-green-700 hover:bg-green-50">
                    <Puzzle className="h-6 w-6" />
                    <span>Quick Capture</span>
                  </Button>
                </Link>
                
                <Link href="/analysis">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover-lift border-purple-200 text-purple-700 hover:bg-purple-50">
                    <Brain className="h-6 w-6" />
                    <span>AI Analysis</span>
                  </Button>
                </Link>
                
                <Link href="/brief-builder">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover-lift border-blue-200 text-blue-700 hover:bg-blue-50">
                    <FileText className="h-6 w-6" />
                    <span>Google Export</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Platform Features */}
        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn delay={200}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Google API Integration
                </CardTitle>
                <CardDescription>Complete Google Workspace ecosystem</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Google Slides for presentations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Google Docs for detailed reports</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Google Vision & NLP analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Google Sheets for data analysis</span>
                </div>
                <Link href="/brief-builder">
                  <Button size="sm" className="mt-3">
                    <FileText className="h-4 w-4 mr-2" />
                    Try Google Export
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={250}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  AI Analysis Pipeline
                </CardTitle>
                <CardDescription>Multi-AI processing with Truth Analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>OpenAI GPT-4o for strategic analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Gemini for visual intelligence</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Truth Analysis Framework</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Automatic processing pipeline</span>
                </div>
                <Link href="/analysis">
                  <Button size="sm" className="mt-3">
                    <Brain className="h-4 w-4 mr-2" />
                    View Analysis
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Platform Access */}
        <FadeIn delay={300}>
          <Card>
            <CardHeader>
              <CardTitle>Platform Access</CardTitle>
              <CardDescription>Explore all Content Radar capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/signal-mining">
                  <Button variant="outline" className="w-full p-4 h-auto flex flex-col items-start space-y-2 hover-lift border-red-200 text-red-700 hover:bg-red-50">
                    <div className="flex items-center gap-2">
                      <Radar className="h-5 w-5" />
                      <span className="font-medium">Signal Mining</span>
                    </div>
                    <p className="text-xs text-gray-600">Bright Data powered content mining</p>
                  </Button>
                </Link>

                <Link href="/intelligence">
                  <Button variant="outline" className="w-full p-4 h-auto flex flex-col items-start space-y-2 hover-lift border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      <span className="font-medium">Intelligence Hub</span>
                    </div>
                    <p className="text-xs text-gray-600">Cross-platform intelligence gathering</p>
                  </Button>
                </Link>

                <Link href="/system-status">
                  <Button variant="outline" className="w-full p-4 h-auto flex flex-col items-start space-y-2 hover-lift border-teal-200 text-teal-700 hover:bg-teal-50">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      <span className="font-medium">System Status</span>
                    </div>
                    <p className="text-xs text-gray-600">Platform health & API monitoring</p>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <FadeIn delay={200}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>Your latest strategic initiatives</CardDescription>
                  </div>
                  <Link href="/projects">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-3">No projects yet</p>
                    <Link href="/projects">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Project
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 3).map((project: Project) => (
                      <Link key={project.id} href="/projects">
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Target className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {project.name}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                {project.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(project.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Recent Captures */}
          <FadeIn delay={300}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Captures</CardTitle>
                    <CardDescription>Latest content from your research</CardDescription>
                  </div>
                  <Link href="/my-captures">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {capturesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentCaptures.length === 0 ? (
                  <div className="text-center py-8">
                    <Puzzle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-3">No captures yet</p>
                    <p className="text-sm text-gray-500">
                      Install the Chrome extension to start capturing content
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentCaptures.map((capture: RecentCapture) => (
                      <Link key={capture.id} href="/my-captures">
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <Badge className={getTypeColor(capture.type)}>
                            {getTypeIcon(capture.type)}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {capture.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {capture.projectName}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {new Date(capture.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </PageLayout>
  );
}
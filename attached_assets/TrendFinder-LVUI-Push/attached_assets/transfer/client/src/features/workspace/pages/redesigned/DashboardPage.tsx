import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  FileText, 
  Plus,
  ArrowRight,
  Activity
} from 'lucide-react';
import { Link } from 'wouter';

export function DashboardPage() {
  // Fetch workspace stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['workspace-stats'],
    queryFn: () => apiClient.workspace.getStats()
  });

  // Fetch recent projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['workspace-projects'],
    queryFn: () => apiClient.workspace.getProjects()
  });

  // Fetch recent captures
  const { data: captures, isLoading: capturesLoading } = useQuery({
    queryKey: ['workspace-captures'],
    queryFn: () => apiClient.captures.getRecent()
  });

  const quickActions = [
    {
      label: 'Capture Content',
      icon: Plus,
      href: '/workspace/capture',
      description: 'Add new content to analyze',
      variant: 'default' as const
    },
    {
      label: 'View Signals',
      icon: Zap,
      href: '/workspace/signals',
      description: 'Browse captured content'
    },
    {
      label: 'Create Brief',
      icon: FileText,
      href: '/workspace/briefs',
      description: 'Generate strategic document'
    }
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Your content intelligence overview
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.variant === 'default' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {action.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Captures</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalCaptures || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newCapturesThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalProjects || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeProjects || 0} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Briefs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalBriefs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newBriefsThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analysis Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.analysisScore || 0}%
            </div>
            <Progress 
              value={stats?.analysisScore || 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Recent Projects</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {project.description || 'No description'}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/workspace/briefs?project=${project.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">No projects yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first project to get started
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/workspace/briefs">Create Project</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Captures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {capturesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : captures && captures.length > 0 ? (
              <div className="space-y-3">
                {captures.slice(0, 5).map((capture: any) => (
                  <div key={capture.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">
                        {capture.title || 'New capture'}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(capture.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      capture.status === 'validated' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      capture.status === 'signal' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      capture.status === 'potential' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {capture.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">No activity yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Start capturing content to see activity
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/workspace/capture">Start Capturing</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
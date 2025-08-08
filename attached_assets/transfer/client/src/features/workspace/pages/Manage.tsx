// Manage - Phase 2 UI/UX
// Projects, settings, and analytics

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  Plus, 
  Settings, 
  BarChart3, 
  Trash2, 
  Edit, 
  Save,
  X,
  TrendingUp,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function Manage() {
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProject, setEditingProject] = useState<{ id: string; name: string } | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['workspace', 'projects'],
    queryFn: () => apiClient.workspace.getProjects(),
  });

  // Fetch workspace stats
  const { data: stats } = useQuery({
    queryKey: ['workspace', 'stats'],
    queryFn: () => apiClient.workspace.getStats(),
  });

  // Create project mutation
  const createProject = useMutation({
    mutationFn: (name: string) => apiClient.workspace.createProject({ 
      name, 
      userId: 1 // TODO: Get from auth context when available 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'projects'] });
      toast({ title: 'Project created successfully!' });
      setNewProjectName('');
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to create project', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Update project mutation
  const updateProject = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      apiClient.workspace.updateProject(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'projects'] });
      toast({ title: 'Project updated successfully!' });
      setEditingProject(null);
    },
  });

  const getStorageUsage = () => {
    // Mock calculation - in real app would come from backend
    const totalStorage = 5000; // 5GB in MB
    const usedStorage = (stats?.totalCaptures || 0) * 0.5; // Assume 0.5MB per capture
    return {
      used: usedStorage,
      total: totalStorage,
      percentage: (usedStorage / totalStorage) * 100,
    };
  };

  const storage = getStorageUsage();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manage</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Projects, settings, and platform analytics
        </p>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">
            <Folder className="h-4 w-4 mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Manage your content projects</CardDescription>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <p className="text-center py-8 text-gray-500">Loading projects...</p>
              ) : projects.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No projects yet. Create your first project!
                </p>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      {editingProject?.id === String(project.id) ? (
                        <>
                          <Input
                            value={editingProject.name}
                            onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                            className="flex-1 mr-2"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateProject.mutate({ 
                                id: String(project.id), 
                                name: editingProject.name 
                              })}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingProject(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <h3 className="font-medium">{project.name}</h3>
                            <p className="text-sm text-gray-500">
                              Created {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingProject({ 
                                id: String(project.id), 
                                name: project.name || '' 
                              })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Captures</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCaptures || 0}</div>
                <p className="text-xs text-muted-foreground">Across all projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Validated Signals</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.capturesByStatus?.validated || 0}</div>
                <p className="text-xs text-muted-foreground">Ready for briefs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Capture Distribution</CardTitle>
              <CardDescription>Content status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['capture', 'potential', 'signal', 'validated'].map((status) => {
                  const count = stats?.capturesByStatus?.[status] || 0;
                  const total = stats?.totalCaptures || 1;
                  const percentage = (count / total) * 100;
                  
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{status}</span>
                        <span>{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>Monitor your platform storage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Used Storage</span>
                  <span>{storage.used.toFixed(1)} MB / {storage.total} MB</span>
                </div>
                <Progress value={storage.percentage} className="h-2" />
              </div>
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  You're using {storage.percentage.toFixed(1)}% of your storage. 
                  Upgrade your plan for more space.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>External service integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <span className="text-sm font-medium">OpenAI GPT-4</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <span className="text-sm font-medium">Google Gemini</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <span className="text-sm font-medium">Bright Data</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Connected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Projects help you organize your content captures and briefs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g., Q1 2025 Campaign"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createProject.mutate(newProjectName)}
              disabled={!newProjectName.trim() || createProject.isPending}
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Search,
  Download,
  Eye,
  Loader2,
  BarChart3,
  Folder
} from 'lucide-react';

export function BriefsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['workspace-projects'],
    queryFn: () => apiClient.workspace.getProjects()
  });

  // Fetch briefs
  const { data: briefs, isLoading: briefsLoading } = useQuery({
    queryKey: ['workspace-briefs'],
    queryFn: () => apiClient.briefs.getAll()
  });

  // Create project mutation
  const createProject = useMutation({
    mutationFn: (data: any) => apiClient.workspace.createProject(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
      setNewProject({ name: '', description: '' });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['workspace-projects'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    }
  });

  // Generate brief mutation
  const generateBrief = useMutation({
    mutationFn: (projectId: string) => apiClient.briefs.generate(projectId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Brief generated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['workspace-briefs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate brief",
        variant: "destructive",
      });
    }
  });

  // Filter projects
  const filteredProjects = projects?.filter((project: any) => {
    return !searchQuery || 
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a project name",
        variant: "destructive",
      });
      return;
    }
    createProject.mutate(newProject);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects & Briefs</h1>
          <p className="text-muted-foreground mt-2">
            Manage projects and generate strategic briefs
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Description (optional)</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Brief description of the project"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createProject.isPending}>
                  {createProject.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {projectsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">
              {projects?.length === 0 ? 'No projects yet' : 'No projects found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {projects?.length === 0 
                ? "Create your first project to organize your content and generate briefs."
                : "Try adjusting your search to find projects."
              }
            </p>
            {projects?.length === 0 && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {project.captureCount || 0} signals
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{project.briefCount || 0} briefs</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => generateBrief.mutate(project.id)}
                    disabled={generateBrief.isPending}
                  >
                    {generateBrief.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <FileText className="h-3 w-3 mr-1" />
                    )}
                    Generate Brief
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Briefs Section */}
      {briefs && briefs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recent Briefs</h2>
          
          <div className="grid gap-4">
            {briefs.slice(0, 5).map((brief: any) => (
              <Card key={brief.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {brief.title || `Brief for ${brief.projectName}`}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(brief.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <Badge variant="outline">
                          {brief.projectName}
                        </Badge>
                      </div>
                      
                      {brief.summary && (
                        <p className="text-muted-foreground line-clamp-2">
                          {brief.summary}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  Brain, 
  Users, 
  MessageCircle, 
  Lightbulb, 
  Zap, 
  Target, 
  TrendingUp,
  Search,
  Filter,
  Tag
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Capture {
  id: string;
  title: string;
  content: string;
  url?: string;
  platform: string;
  type: string;
  dsdTags?: {
    lifeLens?: boolean;
    rawBehavior?: boolean;
    channelVibes?: boolean;
    strategicIntelligence?: boolean;
    humanTruth?: boolean;
    culturalMoment?: boolean;
    creativeTerritory?: boolean;
    executionIdea?: boolean;
    attentionValue?: boolean;
  };
  dsdSection?: 'define' | 'shift' | 'deliver';
  viralScore?: number;
  truthDepth?: number;
  projectId: string;
}

interface Project {
  id: string;
  name: string;
}

export default function CaptureTagging() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: captures = [], isLoading } = useQuery({
    queryKey: ['/api/captures', selectedProject],
    enabled: !!selectedProject,
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ captureId, section }: { captureId: string; section: string }) => {
      return apiRequest(`/api/captures/${captureId}`, {
        method: 'PATCH',
        body: JSON.stringify({ dsdSection: section }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/captures'] });
      toast({ title: 'Success', description: 'Capture section updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update capture', variant: 'destructive' });
    },
  });

  const filteredCaptures = (captures as Capture[]).filter((capture: Capture) => {
    const matchesSearch = capture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capture.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = filterSection === 'all' || capture.dsdSection === filterSection ||
                          (filterSection === 'untagged' && !capture.dsdSection);
    return matchesSearch && matchesSection;
  });

  const updateCaptureSection = (captureId: string, section: string) => {
    updateSectionMutation.mutate({ captureId, section });
  };

  if (projectsLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center justify-between h-full px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="text-muted-foreground hover:text-primary" />
                  <h1 className="text-xl font-bold text-foreground">Capture Tagging</h1>
                </div>
              </div>
            </header>
            <main className="flex-1 p-6">
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!selectedProject) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center justify-between h-full px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="text-muted-foreground hover:text-primary" />
                  <h1 className="text-xl font-bold text-foreground">Capture Tagging</h1>
                  <div className="text-sm text-muted-foreground">
                    Apply DSD tags to organize content for strategic analysis
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1 p-6">
              <Card className="text-center py-12">
                <CardContent>
                  <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a project to start tagging captured content
                  </p>
                  <Select onValueChange={setSelectedProject}>
                    <SelectTrigger className="max-w-sm mx-auto">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project: Project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

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
                  <h1 className="text-xl font-bold text-foreground">Capture Tagging</h1>
                </div>
              </div>
            </header>
            <main className="flex-1 p-6">
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-primary" />
                <h1 className="text-xl font-bold text-foreground">Capture Tagging</h1>
                <div className="text-sm text-muted-foreground">
                  Apply DSD tags to organize content for strategic analysis
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project: Project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters & Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      <Input
                        placeholder="Search captures..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                        data-testid="input-search-captures"
                      />
                    </div>
                    
                    <Select value={filterSection} onValueChange={setFilterSection}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        <SelectItem value="define">Define</SelectItem>
                        <SelectItem value="shift">Shift</SelectItem>
                        <SelectItem value="deliver">Deliver</SelectItem>
                        <SelectItem value="untagged">Untagged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredCaptures.map((capture: Capture) => (
                      <Card key={capture.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              {capture.title}
                            </CardTitle>
                            <Badge variant="outline">
                              {capture.platform}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            {capture.content.slice(0, 100)}...
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <Button
                                variant={capture.dsdSection === 'define' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateCaptureSection(capture.id, 'define')}
                                className="h-8"
                                data-testid={`button-define-${capture.id}`}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Define
                              </Button>
                              <Button
                                variant={capture.dsdSection === 'shift' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateCaptureSection(capture.id, 'shift')}
                                className="h-8"
                                data-testid={`button-shift-${capture.id}`}
                              >
                                <Brain className="w-3 h-3 mr-1" />
                                Shift
                              </Button>
                              <Button
                                variant={capture.dsdSection === 'deliver' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateCaptureSection(capture.id, 'deliver')}
                                className="h-8"
                                data-testid={`button-deliver-${capture.id}`}
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                Deliver
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredCaptures.length === 0 && (
                    <Card className="text-center py-12">
                      <CardContent>
                        <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Captures Found</h3>
                        <p className="text-muted-foreground mb-4">
                          No captures match the current filters. Try adjusting your search.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
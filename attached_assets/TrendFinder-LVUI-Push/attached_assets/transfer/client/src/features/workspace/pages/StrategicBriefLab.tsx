// Strategic Brief Lab - Phase 2 UI/UX
// Create and manage strategic briefs using Jimmy John's template

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Plus, Sparkles, Target, Users, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

export function StrategicBriefLab() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const { toast } = useToast();

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['workspace', 'projects'],
    queryFn: () => apiClient.workspace.getProjects(),
  });

  // Fetch briefs
  const { data: briefs = [], isLoading: briefsLoading } = useQuery({
    queryKey: ['briefs', selectedProject],
    queryFn: () => apiClient.briefs.list(selectedProject),
    enabled: !!selectedProject,
  });

  // Jimmy John's template sections
  const briefSections = [
    {
      id: 'performance',
      title: 'Performance',
      icon: Target,
      description: 'What content is performing best',
      color: 'text-blue-600',
    },
    {
      id: 'cultural-signals',
      title: 'Cultural Signals',
      icon: Sparkles,
      description: 'Emerging cultural moments and trends',
      color: 'text-purple-600',
    },
    {
      id: 'platform-signals',
      title: 'Platform Signals',
      icon: FileText,
      description: 'Platform-specific insights',
      color: 'text-green-600',
    },
    {
      id: 'opportunities',
      title: 'Opportunities',
      icon: Lightbulb,
      description: 'Strategic opportunities to explore',
      color: 'text-orange-600',
    },
    {
      id: 'cohorts',
      title: 'Cohorts',
      icon: Users,
      description: 'Audience segments and behaviors',
      color: 'text-pink-600',
    },
  ];

  const handleGenerateBrief = async () => {
    if (!selectedProject) {
      toast({ title: 'Please select a project first', variant: 'destructive' });
      return;
    }

    try {
      // In real implementation, we'd select specific captures
      const mockCaptureIds = ['1', '2', '3'];
      
      await apiClient.briefs.generate(selectedProject, mockCaptureIds);
      toast({ 
        title: 'Brief generated successfully!', 
        description: 'Your strategic brief is ready to review' 
      });
    } catch (error: any) {
      toast({ 
        title: 'Failed to generate brief', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const handleExportToSlides = async (briefId: string) => {
    try {
      const result = await apiClient.briefs.exportToSlides(briefId);
      window.open(result.url, '_blank');
      toast({ 
        title: 'Exported to Google Slides!', 
        description: 'Your presentation is ready' 
      });
    } catch (error: any) {
      toast({ 
        title: 'Export failed', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Strategic Brief Lab</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Transform your signals into strategic briefs using proven templates
        </p>
      </div>

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
          <CardDescription>Choose a project to view or create briefs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleGenerateBrief}
              disabled={!selectedProject}
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Brief
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Brief Template */}
      <Card>
        <CardHeader>
          <CardTitle>Jimmy John's Brief Template</CardTitle>
          <CardDescription>
            Our proven 6-section framework for strategic content briefs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {briefSections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${section.color}`} />
                    <div className="flex-1">
                      <h3 className="font-medium">{section.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 mt-0.5 text-indigo-600" />
                <div className="flex-1">
                  <h3 className="font-medium">Ideation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Creative concepts and campaign ideas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Briefs */}
      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Briefs</CardTitle>
            <CardDescription>Previously generated strategic briefs</CardDescription>
          </CardHeader>
          <CardContent>
            {briefsLoading ? (
              <p className="text-center py-8 text-gray-500">Loading briefs...</p>
            ) : briefs.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No briefs yet. Generate your first brief above!
              </p>
            ) : (
              <div className="space-y-4">
                {briefs.map((brief) => (
                  <div
                    key={brief.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div>
                      <h4 className="font-medium">{brief.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Created {brief.createdAt ? new Date(brief.createdAt).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportToSlides(brief.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export to Slides
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Pro Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Badge variant="secondary">1</Badge>
            <p className="text-sm">
              Validate at least 5-10 signals before generating a brief for best results
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="secondary">2</Badge>
            <p className="text-sm">
              Mix content from different platforms to get a comprehensive view
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="secondary">3</Badge>
            <p className="text-sm">
              Export to Google Slides for easy sharing with stakeholders
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
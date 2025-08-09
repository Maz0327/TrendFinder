import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Link as LinkIcon, 
  FileText, 
  Loader2,
  CheckCircle,
  Globe
} from 'lucide-react';

export function CapturePage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sourceUrl: '',
    projectId: '',
    tags: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects for the dropdown
  const { data: projects } = useQuery({
    queryKey: ['workspace-projects'],
    queryFn: () => apiClient.workspace.getProjects()
  });

  // Create capture mutation
  const createCapture = useMutation({
    mutationFn: (data: any) => apiClient.captures.create(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content captured successfully!",
      });
      // Reset form
      setFormData({
        title: '',
        content: '',
        sourceUrl: '',
        projectId: '',
        tags: ''
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['workspace-captures'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to capture content",
        variant: "destructive",
      });
    }
  });

  // URL scraping mutation
  const scrapeUrl = useMutation({
    mutationFn: (url: string) => apiClient.scrape.extractContent(url),
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        content: data.content || prev.content
      }));
      toast({
        title: "Success",
        description: "Content extracted from URL!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to extract content from URL",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a title for the capture",
        variant: "destructive",
      });
      return;
    }

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    createCapture.mutate({
      title: formData.title.trim(),
      content: formData.content.trim(),
      sourceUrl: formData.sourceUrl.trim() || null,
      projectId: formData.projectId || null,
      tags: tagsArray.length > 0 ? tagsArray : null
    });
  };

  const handleUrlScrape = () => {
    if (!formData.sourceUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a URL to extract content from",
        variant: "destructive",
      });
      return;
    }

    scrapeUrl.mutate(formData.sourceUrl.trim());
  };

  const captureTemplates = [
    {
      title: 'Social Media Post',
      description: 'Capture trending social content',
      icon: Globe,
      fields: {
        title: 'Social Media Signal',
        content: 'Describe the social media content and its significance...'
      }
    },
    {
      title: 'Article or Blog',
      description: 'Capture insights from articles',
      icon: FileText,
      fields: {
        title: 'Article Insights',
        content: 'Key takeaways and strategic implications...'
      }
    },
    {
      title: 'Quick Note',
      description: 'Capture a quick observation',
      icon: Plus,
      fields: {
        title: 'Quick Observation',
        content: 'What did you notice? Why is it significant?'
      }
    }
  ];

  const useTemplate = (template: any) => {
    setFormData(prev => ({
      ...prev,
      title: template.fields.title,
      content: template.fields.content
    }));
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Capture Content</h1>
        <p className="text-muted-foreground mt-2">
          Add new content to analyze and generate insights
        </p>
      </div>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {captureTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Button
                  key={template.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                  onClick={() => useTemplate(template)}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{template.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    {template.description}
                  </p>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Capture Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source URL with extraction */}
            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL (optional)</Label>
              <div className="flex space-x-2">
                <Input
                  id="sourceUrl"
                  type="url"
                  placeholder="https://example.com/article"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUrlScrape}
                  disabled={scrapeUrl.isPending || !formData.sourceUrl.trim()}
                >
                  {scrapeUrl.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                  Extract
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Paste a URL to automatically extract title and content
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title for this capture"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Describe the content, your observations, or key insights..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
              />
            </div>

            {/* Project Selection */}
            <div className="space-y-2">
              <Label htmlFor="project">Project (optional)</Label>
              <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project or leave blank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-project">No Project</SelectItem>
                  {projects?.map((project: any) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (optional)</Label>
              <Input
                id="tags"
                placeholder="social media, trending, culture (comma-separated)"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                Add tags to help categorize and find this content later
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  title: '',
                  content: '',
                  sourceUrl: '',
                  projectId: '',
                  tags: ''
                })}
              >
                Clear Form
              </Button>
              <Button type="submit" disabled={createCapture.isPending}>
                {createCapture.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Capture Content
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
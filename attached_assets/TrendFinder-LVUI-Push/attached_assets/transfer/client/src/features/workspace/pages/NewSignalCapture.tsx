// New Signal Capture - Phase 2 UI/UX
// Add new content to analyze

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link2, FileText, Image, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { useCreateCapture } from '@/features/captures/hooks/useCaptures';

export function NewSignalCapture() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [analysisMode, setAnalysisMode] = useState<'quick' | 'deep'>('quick');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { toast } = useToast();
  const createCapture = useCreateCapture();

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['workspace', 'projects'],
    queryFn: () => apiClient.workspace.getProjects(),
  });

  const handleUrlCapture = async () => {
    if (!url) {
      toast({ title: 'Please enter a URL', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Scrape the URL
      const scrapedData = await apiClient.scraping.scrapeUrl(url);
      
      // Analyze the content
      const analysis = await apiClient.analysis.analyzeTruth(
        scrapedData.content,
        analysisMode
      );

      // Create the capture
      await createCapture.mutateAsync({
        url,
        title: scrapedData.title || title,
        content: scrapedData.content,
        detectedPlatform: scrapedData.platform,
        truthAnalysis: { analysis: analysis.analysis },
        projectId: projectId ? Number(projectId) : undefined,
        status: 'capture',
        metadata: scrapedData.metadata,
      });

      toast({ 
        title: 'Success!', 
        description: 'Content captured and analyzed successfully' 
      });

      // Reset form
      setUrl('');
      setTitle('');
    } catch (error: any) {
      toast({ 
        title: 'Capture failed', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextCapture = async () => {
    if (!content) {
      toast({ title: 'Please enter some content', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Analyze the content
      const analysis = await apiClient.analysis.analyzeTruth(content, analysisMode);

      // Create the capture
      await createCapture.mutateAsync({
        title: title || 'Manual Entry',
        content,
        truthAnalysis: { analysis: analysis.analysis },
        projectId: projectId ? Number(projectId) : undefined,
        status: 'capture',
        detectedPlatform: 'manual',
      });

      toast({ 
        title: 'Success!', 
        description: 'Content captured and analyzed successfully' 
      });

      // Reset form
      setContent('');
      setTitle('');
    } catch (error: any) {
      toast({ 
        title: 'Capture failed', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">New Signal Capture</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Capture content from URLs or add your own insights
        </p>
      </div>

      {/* Common Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Capture Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="project">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Analysis Mode</Label>
              <Select value={analysisMode} onValueChange={(v) => setAnalysisMode(v as 'quick' | 'deep')}>
                <SelectTrigger id="mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick (2-4 sentences)</SelectItem>
                  <SelectItem value="deep">Deep (4-7 sentences)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capture Methods */}
      <Tabs defaultValue="url" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="url">
            <Link2 className="h-4 w-4 mr-2" />
            URL
          </TabsTrigger>
          <TabsTrigger value="text">
            <FileText className="h-4 w-4 mr-2" />
            Text
          </TabsTrigger>
          <TabsTrigger value="image" disabled>
            <Image className="h-4 w-4 mr-2" />
            Image (Coming Soon)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Capture from URL</CardTitle>
              <CardDescription>
                Enter a URL to automatically extract and analyze content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title-url">Title (optional)</Label>
                <Input
                  id="title-url"
                  placeholder="Custom title for this capture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleUrlCapture} 
                disabled={isAnalyzing || !url}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Capture & Analyze
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Capture from Text</CardTitle>
              <CardDescription>
                Paste or type content to analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title-text">Title</Label>
                <Input
                  id="title-text"
                  placeholder="Give this capture a title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Paste or type your content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                />
              </div>
              <Button 
                onClick={handleTextCapture} 
                disabled={isAnalyzing || !content}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Capture & Analyze
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips */}
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro tip:</strong> Use Quick mode for rapid content scanning and Deep mode 
          when you need comprehensive strategic analysis. All captures can be promoted to 
          signals later as patterns emerge.
        </AlertDescription>
      </Alert>
    </div>
  );
}
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Link, Upload, Zap, Brain, Target } from "lucide-react"
import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"

const Capture = () => {
  const [urlInput, setUrlInput] = useState("")
  const [manualContent, setManualContent] = useState("")
  const [selectedProject, setSelectedProject] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const { toast } = useToast()

  // Get projects for selection
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Create capture mutation
  const createCapture = useMutation({
    mutationFn: async (captureData: any) => {
      const response = await fetch('/api/captures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(captureData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create capture');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Capture Created",
        description: "Your content has been captured and is being analyzed.",
      });
      setUrlInput("");
      setManualContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/captures"] });
    },
    onError: (error: any) => {
      toast({
        title: "Capture Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnalyzeUrl = () => {
    if (!selectedProject) {
      toast({
        title: "Project Required",
        description: "Please select a project first.",
        variant: "destructive",
      });
      return;
    }
    
    setAnalyzing(true);
    createCapture.mutate({
      projectId: selectedProject,
      type: "url",
      content: urlInput,
      url: urlInput,
      title: "URL Capture",
      platform: "manual"
    });
    setAnalyzing(false);
  }

  const handleManualSubmit = () => {
    if (!selectedProject) {
      toast({
        title: "Project Required", 
        description: "Please select a project first.",
        variant: "destructive",
      });
      return;
    }

    createCapture.mutate({
      projectId: selectedProject,
      type: "text",
      content: manualContent,
      title: "Manual Entry",
      platform: "manual"
    });
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
                <h1 className="text-xl font-bold text-foreground">New Signal Capture</h1>
                <div className="text-sm text-muted-foreground">
                  Add content for AI analysis
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Capture Methods */}
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                  <TabsTrigger value="url" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Link className="w-4 h-4 mr-2" />
                    URL Capture
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Manual Entry
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Upload className="w-4 h-4 mr-2" />
                    File Upload
                  </TabsTrigger>
                </TabsList>

                {/* URL Capture */}
                <TabsContent value="url" className="mt-6">
                  <Card className="bg-gradient-surface border-border/50 shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Link className="w-5 h-5 text-primary" />
                        Capture from URL
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="url">Content URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="url"
                            placeholder="https://reddit.com/r/example/post or https://twitter.com/user/status..."
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            onClick={handleAnalyzeUrl}
                            disabled={analyzing || !urlInput}
                            className="bg-gradient-primary shadow-glow"
                          >
                            {analyzing ? (
                              <>
                                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Brain className="w-4 h-4 mr-2" />
                                Analyze
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {analyzing && (
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                              <span className="text-sm text-primary">AI is analyzing the content...</span>
                            </div>
                            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                              <div>✓ Extracting content and metadata</div>
                              <div>✓ Analyzing viral potential</div>
                              <div>✓ Generating content hooks</div>
                              <div className="opacity-50">⏳ Calculating engagement metrics</div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="project">Project</Label>
                          <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                              {(projects as any[])?.map((project: any) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="platform">Platform</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Auto-detect platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reddit">Reddit</SelectItem>
                              <SelectItem value="twitter">Twitter/X</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="project">Project</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Monitoring</SelectItem>
                              <SelectItem value="competitor">Competitor Analysis</SelectItem>
                              <SelectItem value="trend">Trend Research</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Manual Entry */}
                <TabsContent value="manual" className="mt-6">
                  <Card className="bg-gradient-surface border-border/50 shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Plus className="w-5 h-5 text-primary" />
                        Manual Content Entry
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Content Title</Label>
                          <Input id="title" placeholder="Enter content title..." />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="author">Author/Creator</Label>
                          <Input id="author" placeholder="@username or name" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea 
                          id="content" 
                          placeholder="Paste or type the content here..." 
                          className="min-h-[120px]"
                          value={manualContent}
                          onChange={(e) => setManualContent(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="platform-manual">Platform</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reddit">Reddit</SelectItem>
                              <SelectItem value="twitter">Twitter/X</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="engagement">Engagement Count</Label>
                          <Input id="engagement" type="number" placeholder="Total engagement" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timestamp">Posted</Label>
                          <Input id="timestamp" placeholder="e.g., 2h ago" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input id="tags" placeholder="ai, technology, viral, trending" />
                      </div>

                      <Button 
                        onClick={handleManualSubmit}
                        disabled={!manualContent.trim() || createCapture.isPending}
                        className="w-full bg-gradient-primary shadow-glow"
                      >
                        {createCapture.isPending ? (
                          <>
                            <Zap className="w-4 h-4 mr-2 animate-pulse" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Target className="w-4 h-4 mr-2" />
                            Analyze Manual Entry
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* File Upload */}
                <TabsContent value="upload" className="mt-6">
                  <Card className="bg-gradient-surface border-border/50 shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Upload className="w-5 h-5 text-primary" />
                        File Upload
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Upload Content Files</h3>
                        <p className="text-muted-foreground mb-4">
                          Drag and drop files here, or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports: Images, Videos, CSV files, Text files
                        </p>
                        <Button variant="outline" className="mt-4">
                          Choose Files
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* AI Analysis Preview */}
              <Card className="bg-gradient-surface border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Analysis Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Capture content above to see AI analysis results</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Capture
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Link as LinkIcon, 
  FileText, 
  Sparkles, 
  Upload,
  Globe,
  Zap,
  Target,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface CaptureForm {
  type: 'url' | 'text' | 'image';
  content: string;
  url?: string;
  title?: string;
  description?: string;
  projectId?: string;
  platform?: string;
}

export default function SignalCapture() {
  const [activeTab, setActiveTab] = useState("url");
  const [form, setForm] = useState<CaptureForm>({
    type: 'url',
    content: '',
    title: '',
    description: '',
    platform: ''
  });
  const { toast } = useToast();

  // Get projects for selection
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Create capture mutation
  const createCapture = useMutation({
    mutationFn: async (captureData: CaptureForm) => {
      const response = await fetch('/api/captures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(captureData),
      });
      if (!response.ok) throw new Error('Failed to create capture');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Capture Created",
        description: "Your content has been captured and is being analyzed.",
      });
      setForm({ type: activeTab as any, content: '', title: '', description: '', platform: '' });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    
    createCapture.mutate({
      ...form,
      type: activeTab as any,
    });
  };

  const updateForm = (field: keyof CaptureForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <PageLayout 
      title="New Signal Capture" 
      description="Content analysis workspace for strategic analysis"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Chrome Extension Status */}
        <Card className="border-l-4 border-l-green-400">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Chrome Extension Active
                </CardTitle>
                <CardDescription>
                  Smart capture modes available: Precision (yellow overlay) and Context (blue border)
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Camera className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Use keyboard shortcuts: <kbd className="px-2 py-1 bg-gray-100 rounded">Cmd+Shift+S</kbd> for precision capture, 
              <kbd className="px-2 py-1 bg-gray-100 rounded ml-2">Cmd+Shift+C</kbd> for context capture
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                Install Extension
              </Button>
              <Button size="sm" variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                Test Capture
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Capture Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Content Capture</CardTitle>
            <CardDescription>
              Manually input content for strategic analysis when Chrome extension isn't available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="url">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    URL Capture
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <FileText className="h-4 w-4 mr-2" />
                    Text Analysis
                  </TabsTrigger>
                  <TabsTrigger value="image">
                    <Camera className="h-4 w-4 mr-2" />
                    Image Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-4">
                  <div>
                    <Label htmlFor="url">Content URL</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com/content"
                      value={form.content}
                      onChange={(e) => updateForm('content', e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Paste any social media post, article, or webpage URL
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label htmlFor="text-content">Text Content</Label>
                    <Textarea
                      id="text-content"
                      placeholder="Paste or type content for analysis..."
                      value={form.content}
                      onChange={(e) => updateForm('content', e.target.value)}
                      className="mt-1 min-h-[120px]"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Social media posts, articles, comments, or any text content
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                  <div>
                    <Label htmlFor="image-upload">Image Upload</Label>
                    <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              updateForm('content', reader.result as string);
                              toast({
                                title: "Image Uploaded",
                                description: `${file.name} ready for analysis`,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drag and drop an image, or click to select
                      </p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        Choose Image
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Screenshots, memes, infographics, or any visual content
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    placeholder="Give this capture a title"
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={form.platform} onValueChange={(value) => updateForm('platform', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="reddit">Reddit</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="project">Project (Optional)</Label>
                <Select value={form.projectId} onValueChange={(value) => updateForm('projectId', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select project or leave unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project: any) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Analysis Notes (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add context or specific analysis requests..."
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={!form.content.trim() || createCapture.isPending}
                  className="flex-1"
                >
                  {createCapture.isPending ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Capture & Analyze
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setForm({ type: activeTab as any, content: '', title: '', description: '', platform: '' })}
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Truth Analysis Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Truth Analysis Framework
            </CardTitle>
            <CardDescription>
              Preview of AI analysis layers: Fact → Observation → Insight → Human Truth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">1</div>
                <div className="text-sm font-medium">Fact</div>
                <div className="text-xs text-gray-600">Content extraction</div>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">2</div>
                <div className="text-sm font-medium">Observation</div>
                <div className="text-xs text-gray-600">Pattern recognition</div>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">3</div>
                <div className="text-sm font-medium">Insight</div>
                <div className="text-xs text-gray-600">Strategic implications</div>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">4</div>
                <div className="text-sm font-medium">Human Truth</div>
                <div className="text-xs text-gray-600">Cultural meaning</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
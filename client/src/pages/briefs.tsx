import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Loader2, Copy, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface BriefTemplate {
  id: string;
  name: string;
  description: string;
  format: string;
  structure: string[];
}

export default function BriefGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("jimmyjohns_strategic");
  const [briefMode, setBriefMode] = useState<string>("ai-assisted");
  const [generatedBrief, setGeneratedBrief] = useState<any>(null);
  const [userEdits, setUserEdits] = useState<string>("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Get brief templates
  const { data: templates = [] } = useQuery<BriefTemplate[]>({
    queryKey: ['/api/briefs/templates'],
    queryFn: () => api.get('/api/briefs/templates'),
  });

  // Get recent signals for brief generation
  const { data: recentContent = [] } = useQuery({
    queryKey: ['/api/content', { limit: 20, sortBy: 'viralScore' }],
    queryFn: () => api.get<any[]>('/api/content?sortBy=viralScore'),
  });

  // Generate brief mutation
  const generateBrief = useMutation({
    mutationFn: async (params: any) => {
      return api.post('/api/briefs/generate', params);
    },
    onSuccess: (data) => {
      setGeneratedBrief(data);
      toast({
        title: "Brief Generated",
        description: "Your strategic brief has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate brief",
        variant: "destructive",
      });
    },
  });

  const handleGenerateBrief = () => {
    // Transform recent content into signals format
    const signals = recentContent.slice(0, 10).map((item: any) => ({
      title: item.title,
      content: item.content || item.summary,
      platform: item.platform,
      viralScore: item.viralScore,
      category: item.category,
    }));

    generateBrief.mutate({
      templateId: selectedTemplate,
      signals,
      culturalMoments: [], // Would be populated from analysis
      trends: [], // Would be populated from trends endpoint
      metadata: {
        project: "Strategic Brief " + new Date().toLocaleDateString(),
        generatedBy: "Content Radar Platform",
        briefMode,
      }
    });
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
      toast({
        title: "Copied",
        description: `${section} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const exportBrief = (format: 'markdown' | 'pdf' | 'docx') => {
    // In a real implementation, this would call an export endpoint
    toast({
      title: "Export Started",
      description: `Exporting brief as ${format.toUpperCase()}...`,
    });
  };

  const selectedTemplateData = templates.find((t: BriefTemplate) => t.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 lg:p-6">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Strategic Brief Generator</h1>
          <p className="text-sm lg:text-base text-gray-600">Create professional strategic briefs with AI-powered insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Brief Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger id="template" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template: BriefTemplate) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplateData && (
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedTemplateData.description}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Copy Control Mode</Label>
                  <RadioGroup value={briefMode} onValueChange={setBriefMode} className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ai-generated" id="ai-generated" />
                      <Label htmlFor="ai-generated" className="font-normal cursor-pointer">
                        AI Generated (Full automation)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ai-assisted" id="ai-assisted" />
                      <Label htmlFor="ai-assisted" className="font-normal cursor-pointer">
                        AI Assisted (Hybrid approach)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="user-controlled" id="user-controlled" />
                      <Label htmlFor="user-controlled" className="font-normal cursor-pointer">
                        User Controlled (Manual editing)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  onClick={handleGenerateBrief}
                  disabled={generateBrief.isPending || recentContent.length === 0}
                  className="w-full"
                >
                  {generateBrief.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Brief
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Data Sources</CardTitle>
                <CardDescription>Using latest content from your platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trending Content</span>
                    <span className="font-medium">{recentContent.length} items</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Coverage</span>
                    <span className="font-medium">5 platforms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time Range</span>
                    <span className="font-medium">Last 24 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Brief Preview/Editor */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Brief Preview</CardTitle>
                    <CardDescription>
                      {generatedBrief ? `Generated using ${selectedTemplateData?.name} template` : 'Generate a brief to see preview'}
                    </CardDescription>
                  </div>
                  {generatedBrief && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedBrief.content || JSON.stringify(generatedBrief.sections, null, 2), "Full Brief")}
                      >
                        {copiedSection === "Full Brief" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportBrief('markdown')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedBrief ? (
                  <div className="space-y-6">
                    {briefMode === 'user-controlled' ? (
                      <div>
                        <Label htmlFor="brief-editor">Edit Your Brief</Label>
                        <Textarea
                          id="brief-editor"
                          value={userEdits || generatedBrief.content || JSON.stringify(generatedBrief.sections, null, 2)}
                          onChange={(e) => setUserEdits(e.target.value)}
                          className="mt-2 min-h-[500px] font-mono text-sm"
                        />
                      </div>
                    ) : (
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-6">
                          {generatedBrief.sections ? (
                            Object.entries(generatedBrief.sections).map(([section, content]: [string, any]) => (
                              <div key={section} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <h3 className="text-lg font-semibold capitalize">
                                    {section.replace(/_/g, ' ')}
                                  </h3>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(
                                      typeof content === 'string' ? content : JSON.stringify(content, null, 2),
                                      section
                                    )}
                                  >
                                    {copiedSection === section ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="prose max-w-none">
                              <pre className="whitespace-pre-wrap text-sm">
                                {generatedBrief.content || JSON.stringify(generatedBrief, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    )}

                    {/* Brief Metadata */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-2">
                          <Badge variant="secondary">{generatedBrief.format || 'Strategic'}</Badge>
                          <Badge variant="outline">{briefMode}</Badge>
                        </div>
                        <div className="text-gray-500">
                          Generated: {new Date(generatedBrief.timestamp || Date.now()).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Brief Generated</h3>
                    <p className="text-sm text-gray-500">
                      Configure your settings and click generate to create a strategic brief
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FadeIn } from "@/components/ui/fade-in";
import { Brain, Sparkles, Target, Users, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/queryClient";

interface TruthAnalysis {
  fact: any;
  observation: any;
  insight: any;
  humanTruth: any;
  confidence: number;
  sources: string[];
  timestamp: string;
}

export default function AnalysisCenter() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [analysisResult, setAnalysisResult] = useState<TruthAnalysis | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Truth analysis mutation
  const analyzeTruth = useMutation({
    mutationFn: async (params: { content: string; platform: string }) => {
      return api.post('/api/truth-analysis/analyze', {
        content: params.content,
        platform: params.platform,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'manual_input'
        }
      });
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: "Analysis Complete",
        description: "Truth analysis framework has processed your content",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze content",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!content.trim()) {
      toast({
        title: "No Content",
        description: "Please enter some content to analyze",
        variant: "destructive",
      });
      return;
    }
    analyzeTruth.mutate({ content, platform });
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

  const confidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 lg:p-6">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Truth Analysis Framework</h1>
          <p className="text-sm lg:text-base text-gray-600">Deep cultural and strategic analysis using the four-layer truth framework</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Content Input
                </CardTitle>
                <CardDescription>Enter content for strategic analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Platform Context</label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="reddit">Reddit</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="web">General Web</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Content to Analyze</label>
                  <Textarea
                    placeholder="Paste content, social media post, article excerpt, or any text you want to analyze..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {content.length} characters • {content.split(/\s+/).filter(w => w).length} words
                  </p>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeTruth.isPending || !content.trim()}
                  className="w-full hover-lift"
                >
                  {analyzeTruth.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Examples</CardTitle>
                <CardDescription>Try these sample analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start hover-lift"
                    onClick={() => {
                      setContent("AI is revolutionizing how we work. Companies are implementing AI tools at record pace, transforming productivity and creating new opportunities.");
                      setPlatform("linkedin");
                    }}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Professional AI Trend
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start hover-lift"
                    onClick={() => {
                      setContent("The minimalist lifestyle is more than decluttering - it's about intentional living and finding joy in simplicity. #MinimalismLife");
                      setPlatform("instagram");
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Lifestyle Movement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {analysisResult ? (
              <FadeIn>
                <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    Four-layer truth framework analysis • Confidence: 
                    <span className={`font-medium ml-1 ${confidenceColor(analysisResult.confidence)}`}>
                      {analysisResult.confidence}%
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={analysisResult.confidence} className="mb-6" />
                  
                  <Tabs defaultValue="fact" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="fact">Fact</TabsTrigger>
                      <TabsTrigger value="observation">Observation</TabsTrigger>
                      <TabsTrigger value="insight">Insight</TabsTrigger>
                      <TabsTrigger value="truth">Human Truth</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="fact" className="space-y-4">
                      <div className="relative">
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(analysisResult.fact, null, 2), "Fact Analysis")}
                          >
                            {copiedSection === "Fact Analysis" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <h4 className="font-medium mb-2">Factual Analysis</h4>
                        <div className="space-y-2 text-sm">
                          {typeof analysisResult.fact === 'string' ? (
                            <p className="text-gray-700">{analysisResult.fact}</p>
                          ) : (
                            <>
                              {analysisResult.fact.claims && (
                                <div>
                                  <p className="font-medium text-gray-600">Claims:</p>
                                  <ul className="list-disc list-inside ml-2">
                                    {analysisResult.fact.claims.map((claim: string, i: number) => (
                                      <li key={i} className="text-gray-700">{claim}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {analysisResult.fact.verificationStatus && (
                                <div>
                                  <Badge variant="outline">{analysisResult.fact.verificationStatus}</Badge>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="observation" className="space-y-4">
                      <div className="relative">
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(analysisResult.observation, null, 2), "Observation Analysis")}
                          >
                            {copiedSection === "Observation Analysis" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <h4 className="font-medium mb-2">Behavioral Observations</h4>
                        <div className="space-y-2 text-sm">
                          {typeof analysisResult.observation === 'string' ? (
                            <p className="text-gray-700">{analysisResult.observation}</p>
                          ) : (
                            <div className="text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(analysisResult.observation, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="insight" className="space-y-4">
                      <div className="relative">
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(analysisResult.insight, null, 2), "Strategic Insights")}
                          >
                            {copiedSection === "Strategic Insights" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <h4 className="font-medium mb-2">Strategic Insights</h4>
                        <div className="space-y-2 text-sm">
                          {typeof analysisResult.insight === 'string' ? (
                            <p className="text-gray-700">{analysisResult.insight}</p>
                          ) : (
                            <div className="text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(analysisResult.insight, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="truth" className="space-y-4">
                      <div className="relative">
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(analysisResult.humanTruth, null, 2), "Human Truth")}
                          >
                            {copiedSection === "Human Truth" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <h4 className="font-medium mb-2">Human Truth</h4>
                        <div className="space-y-2 text-sm">
                          {typeof analysisResult.humanTruth === 'string' ? (
                            <p className="text-gray-700">{analysisResult.humanTruth}</p>
                          ) : (
                            <div className="text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(analysisResult.humanTruth, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Sources */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Analysis Sources</p>
                        <div className="flex gap-2 mt-1">
                          {analysisResult.sources.map((source, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(analysisResult.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </FadeIn>
            ) : (
              <FadeIn>
                <Card>
                  <CardContent className="py-16 text-center">
                    <div className="animate-pulse-scale">
                      <Brain className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Analysis Yet</h3>
                    <p className="text-sm text-gray-500">
                      Enter content and click analyze to see the four-layer truth framework in action
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
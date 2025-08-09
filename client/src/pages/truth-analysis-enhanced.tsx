import PageLayout from "@/components/layout/PageLayout";
import StrategicCard from "@/components/dashboard/StrategicCard";
import { FadeIn, StaggeredFadeIn } from "@/components/ui/fade-in";
import { LoadingCard, LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Eye, Lightbulb, Heart, Search, Play, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TruthAnalysisEnhanced() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCapture, setSelectedCapture] = useState<any>(null);

  // Fetch captures with truth analysis
  const { data: captures = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/captures'],
    queryFn: async () => {
      const response = await fetch('/api/captures', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch captures');
      return response.json();
    }
  });

  // Run truth analysis mutation
  const runAnalysisMutation = useMutation({
    mutationFn: async (captureId: string) => {
      const response = await fetch(`/api/captures/${captureId}/truth-analysis`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to run analysis');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/captures'] });
      toast({ title: "Success", description: "Truth analysis completed" });
    }
  });

  // Filter captures
  const filteredCaptures = captures.filter((capture: any) => 
    searchQuery === "" || 
    capture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    capture.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const analyzedCaptures = captures.filter((c: any) => c.truthAnalysis);
  const pendingCaptures = captures.filter((c: any) => !c.truthAnalysis);

  const truthLayers = [
    {
      name: "Fact",
      icon: Eye,
      color: "blue",
      description: "Verifiable information and data points"
    },
    {
      name: "Observation", 
      icon: Search,
      color: "green",
      description: "What we can directly see and measure"
    },
    {
      name: "Insight",
      icon: Lightbulb,
      color: "yellow", 
      description: "Patterns and connections that emerge"
    },
    {
      name: "Human Truth",
      icon: Heart,
      color: "purple",
      description: "Deeper meaning and emotional resonance"
    }
  ];

  return (
    <PageLayout 
      title="Truth Analysis Framework" 
      description="4-layer philosophical analysis using GPT-5 selective reasoning for enhanced content assessment"
      onRefresh={() => refetch()}
    >
      <div className="space-y-6">
        {/* Framework Overview */}
        <FadeIn>
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>Truth Analysis Layers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {truthLayers.map((layer, index) => {
                  const Icon = layer.icon;
                  return (
                    <div key={layer.name} className="relative">
                      <div className={`bg-${layer.color}-100 dark:bg-${layer.color}-900/20 p-4 rounded-lg text-center`}>
                        <Icon className={`h-8 w-8 mx-auto mb-2 text-${layer.color}-600`} />
                        <h3 className="font-semibold text-sm">{layer.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {layer.description}
                        </p>
                      </div>
                      {index < truthLayers.length - 1 && (
                        <ChevronRight className="absolute top-1/2 -right-2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Analysis Stats */}
        <FadeIn delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{captures.length}</div>
                <p className="text-sm text-muted-foreground">Total Captures</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{analyzedCaptures.length}</div>
                <p className="text-sm text-muted-foreground">Analyzed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{pendingCaptures.length}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {analyzedCaptures.length > 0 ? Math.round((analyzedCaptures.length / captures.length) * 100) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Coverage</p>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* Search and Actions */}
        <FadeIn delay={200}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search captures for analysis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => {
                    // Run batch analysis on pending captures
                    pendingCaptures.slice(0, 5).forEach(capture => {
                      runAnalysisMutation.mutate(capture.id);
                    });
                  }}
                  disabled={runAnalysisMutation.isPending || pendingCaptures.length === 0}
                >
                  {runAnalysisMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>Analyze Batch</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Analysis Tabs */}
        <FadeIn delay={300}>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Captures ({filteredCaptures.length})</TabsTrigger>
              <TabsTrigger value="analyzed">Analyzed ({analyzedCaptures.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCaptures.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <LoadingCard key={i} />
                  ))}
                </div>
              ) : filteredCaptures.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="text-muted-foreground">
                      {searchQuery ? "No captures match your search" : "No captures found"}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <StaggeredFadeIn
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  staggerDelay={50}
                >
                  {filteredCaptures.map((capture: any) => (
                    <div key={capture.id} className="relative group">
                      <StrategicCard
                        capture={capture}
                        onClick={() => setSelectedCapture(capture)}
                        variant="capture"
                      />
                      
                      {/* Analysis Action Overlay */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!capture.truthAnalysis ? (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              runAnalysisMutation.mutate(capture.id);
                            }}
                            disabled={runAnalysisMutation.isPending}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {runAnalysisMutation.isPending ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Brain className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            ✓ Analyzed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </StaggeredFadeIn>
              )}
            </TabsContent>

            <TabsContent value="analyzed" className="space-y-4">
              <StaggeredFadeIn
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                staggerDelay={50}
              >
                {analyzedCaptures.map((capture: any) => (
                  <StrategicCard
                    key={capture.id}
                    capture={capture}
                    onClick={() => setSelectedCapture(capture)}
                    variant="capture"
                  />
                ))}
              </StaggeredFadeIn>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <StaggeredFadeIn
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                staggerDelay={50}
              >
                {pendingCaptures.map((capture: any) => (
                  <div key={capture.id} className="relative">
                    <StrategicCard
                      capture={capture}
                      onClick={() => setSelectedCapture(capture)}
                      variant="capture"
                    />
                    <div className="absolute inset-0 bg-yellow-50/80 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                      <Button
                        onClick={() => runAnalysisMutation.mutate(capture.id)}
                        disabled={runAnalysisMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {runAnalysisMutation.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            Run Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </StaggeredFadeIn>
            </TabsContent>
          </Tabs>
        </FadeIn>

        {/* Detailed Analysis Modal/Panel */}
        {selectedCapture && (
          <FadeIn>
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Truth Analysis Details</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCapture(null)}
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">{selectedCapture.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCapture.content.slice(0, 200)}...
                  </p>
                </div>

                {selectedCapture.truthAnalysis ? (
                  <div className="space-y-4">
                    {truthLayers.map(layer => {
                      const Icon = layer.icon;
                      return (
                        <div key={layer.name} className={`p-4 rounded-lg bg-${layer.color}-50 dark:bg-${layer.color}-900/10`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <Icon className={`h-5 w-5 text-${layer.color}-600`} />
                            <span className="font-semibold">{layer.name}</span>
                          </div>
                          <p className="text-sm">
                            {selectedCapture.truthAnalysis?.[layer.name.toLowerCase()] || "Analysis pending..."}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No analysis available yet</p>
                    <Button 
                      onClick={() => runAnalysisMutation.mutate(selectedCapture.id)}
                      disabled={runAnalysisMutation.isPending}
                    >
                      {runAnalysisMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Run Truth Analysis
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>
    </PageLayout>
  );
}
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Eye, 
  Brain, 
  Lightbulb, 
  Heart,
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TruthAnalysis {
  id: string;
  captureId: string;
  fact: {
    claims: string[];
    sources: string[];
    verificationStatus: 'verified' | 'unverified' | 'disputed';
    confidence: number;
  };
  observation: {
    behaviorPatterns: string[];
    audienceSignals: {
      demographics: string[];
      psychographics: string[];
      engagement: string[];
    };
    contextualFactors: string[];
    crossPlatformSignals?: Array<{
      platform: string;
      signal: string;
      strength: number;
    }>;
  };
  insight: {
    strategicImplications: string[];
    opportunityMapping: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
    riskAssessment: {
      reputational: string[];
      competitive: string[];
      operational: string[];
    };
    competitiveIntelligence?: {
      gaps: string[];
      advantages: string[];
      threats: string[];
    };
  };
  humanTruth: {
    emotionalUndercurrent: {
      primary: string;
      secondary: string[];
      triggers: string[];
    };
    culturalContext: {
      moment: string;
      relevance: number;
      socialDynamics: string[];
    };
    psychologicalDrivers: {
      motivations: string[];
      barriers: string[];
      biases: string[];
    };
    communicationCues: {
      tone: string;
      messaging: string[];
      channels: string[];
    };
  };
  viralScore: number;
  strategicValue: number;
  culturalRelevance: number;
  createdAt: string;
  capture?: {
    id: string;
    title: string;
    platform: string;
    content: string;
  };
}

interface Project {
  id: string;
  name: string;
}

export default function TruthAnalysis() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerification, setFilterVerification] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState<TruthAnalysis | null>(null);
  
  const { toast } = useToast();

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: analyses = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/truth-analysis', selectedProject],
    enabled: !!selectedProject,
  });

  const regenerateAnalysisMutation = useMutation({
    mutationFn: (captureId: string) =>
      apiRequest(`/api/captures/${captureId}/reanalyze`, {
        method: 'POST',
      }),
    onSuccess: () => {
      refetch();
      toast({ title: 'Analysis regenerated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to regenerate analysis', variant: 'destructive' });
    },
  });

  const filteredAnalyses = analyses.filter((analysis: TruthAnalysis) => {
    const matchesSearch = analysis.capture?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.capture?.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVerification = filterVerification === 'all' || analysis.fact.verificationStatus === filterVerification;
    const matchesPlatform = filterPlatform === 'all' || analysis.capture?.platform === filterPlatform;
    
    return matchesSearch && matchesVerification && matchesPlatform;
  });

  const platforms = [...new Set(analyses.map((a: TruthAnalysis) => a.capture?.platform).filter(Boolean))];

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'unverified': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'disputed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return CheckCircle;
      case 'unverified': return AlertCircle;
      case 'disputed': return XCircle;
      default: return AlertCircle;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  if (!selectedProject) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Truth Analysis Framework</h1>
          <p className="text-muted-foreground">4-layer analysis: Fact → Observation → Insight → Human Truth</p>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
            <p className="text-muted-foreground mb-4">
              Choose a project to view Truth Analysis results
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
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Truth Analysis Framework</h1>
          <p className="text-muted-foreground">4-layer analysis: Fact → Observation → Insight → Human Truth</p>
        </div>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Analysis Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
                data-testid="input-search-analyses"
              />
            </div>
            
            <Select value={filterVerification} onValueChange={setFilterVerification}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform} value={platform!}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => refetch()}
              data-testid="button-refresh-analyses"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredAnalyses.map((analysis: TruthAnalysis) => {
            const VerificationIcon = getVerificationIcon(analysis.fact.verificationStatus);
            
            return (
              <Card 
                key={analysis.id} 
                className={`bg-gradient-surface border-border/50 hover:border-primary/20 transition-smooth cursor-pointer ${
                  selectedAnalysis?.id === analysis.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedAnalysis(analysis)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <CardTitle className="text-lg line-clamp-1">
                        {analysis.capture?.title || 'Unknown Capture'}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {analysis.capture?.content}
                      </CardDescription>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{analysis.capture?.platform}</Badge>
                        <Badge className={getVerificationColor(analysis.fact.verificationStatus)}>
                          <VerificationIcon className="w-3 h-3 mr-1" />
                          {analysis.fact.verificationStatus}
                        </Badge>
                        <Badge variant="outline">
                          <Target className="w-3 h-3 mr-1" />
                          {analysis.strategicValue}/10 strategic
                        </Badge>
                        <Badge variant="outline">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {analysis.viralScore}% viral
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        regenerateAnalysisMutation.mutate(analysis.captureId);
                      }}
                      disabled={regenerateAnalysisMutation.isPending}
                      data-testid={`button-regenerate-${analysis.id}`}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 mx-auto mb-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-medium">Fact</p>
                      <p className="text-xs text-muted-foreground">{analysis.fact.confidence}%</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 mx-auto mb-1">
                        <Eye className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-medium">Observation</p>
                      <p className="text-xs text-muted-foreground">
                        {analysis.observation.behaviorPatterns.length} patterns
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-400 mx-auto mb-1">
                        <Brain className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-medium">Insight</p>
                      <p className="text-xs text-muted-foreground">
                        {analysis.insight.strategicImplications.length} implications
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-400 mx-auto mb-1">
                        <Heart className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-medium">Human Truth</p>
                      <p className="text-xs text-muted-foreground">
                        {analysis.culturalRelevance}% relevance
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          {selectedAnalysis ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Detailed Analysis</CardTitle>
                <CardDescription>
                  {selectedAnalysis.capture?.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="fact" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 text-xs">
                    <TabsTrigger value="fact" className="p-1">
                      <CheckCircle className="w-3 h-3" />
                    </TabsTrigger>
                    <TabsTrigger value="observation" className="p-1">
                      <Eye className="w-3 h-3" />
                    </TabsTrigger>
                    <TabsTrigger value="insight" className="p-1">
                      <Brain className="w-3 h-3" />
                    </TabsTrigger>
                    <TabsTrigger value="humanTruth" className="p-1">
                      <Heart className="w-3 h-3" />
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4 max-h-96 overflow-y-auto">
                    <TabsContent value="fact" className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Fact Layer
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium mb-1">Verification Status</p>
                            <Badge className={getVerificationColor(selectedAnalysis.fact.verificationStatus)}>
                              {selectedAnalysis.fact.verificationStatus}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs font-medium mb-1">Confidence</p>
                            <div className="flex items-center gap-2">
                              <Progress value={selectedAnalysis.fact.confidence} className="flex-1" />
                              <span className="text-xs">{selectedAnalysis.fact.confidence}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium mb-1">Claims</p>
                            <div className="space-y-1">
                              {selectedAnalysis.fact.claims.map((claim, index) => (
                                <p key={index} className="text-xs text-muted-foreground">• {claim}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="observation" className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Observation Layer
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium mb-1">Behavior Patterns</p>
                            <div className="space-y-1">
                              {selectedAnalysis.observation.behaviorPatterns.map((pattern, index) => (
                                <p key={index} className="text-xs text-muted-foreground">• {pattern}</p>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium mb-1">Audience Demographics</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedAnalysis.observation.audienceSignals.demographics.map((demo, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {demo}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium mb-1">Contextual Factors</p>
                            <div className="space-y-1">
                              {selectedAnalysis.observation.contextualFactors.map((factor, index) => (
                                <p key={index} className="text-xs text-muted-foreground">• {factor}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="insight" className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Insight Layer
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium mb-1">Strategic Implications</p>
                            <div className="space-y-1">
                              {selectedAnalysis.insight.strategicImplications.map((implication, index) => (
                                <p key={index} className="text-xs text-muted-foreground">• {implication}</p>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium mb-1">Opportunity Mapping</p>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs font-medium text-green-400">Immediate</p>
                                {selectedAnalysis.insight.opportunityMapping.immediate.map((opp, index) => (
                                  <p key={index} className="text-xs text-muted-foreground ml-2">• {opp}</p>
                                ))}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-yellow-400">Short Term</p>
                                {selectedAnalysis.insight.opportunityMapping.shortTerm.map((opp, index) => (
                                  <p key={index} className="text-xs text-muted-foreground ml-2">• {opp}</p>
                                ))}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-blue-400">Long Term</p>
                                {selectedAnalysis.insight.opportunityMapping.longTerm.map((opp, index) => (
                                  <p key={index} className="text-xs text-muted-foreground ml-2">• {opp}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="humanTruth" className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          Human Truth Layer
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium mb-1">Emotional Undercurrent</p>
                            <p className="text-xs text-primary mb-1">
                              Primary: {selectedAnalysis.humanTruth.emotionalUndercurrent.primary}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {selectedAnalysis.humanTruth.emotionalUndercurrent.secondary.map((emotion, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {emotion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium mb-1">Cultural Context</p>
                            <p className="text-xs text-muted-foreground mb-1">
                              {selectedAnalysis.humanTruth.culturalContext.moment}
                            </p>
                            <div className="flex items-center gap-2">
                              <Progress value={selectedAnalysis.humanTruth.culturalContext.relevance} className="flex-1" />
                              <span className="text-xs">{selectedAnalysis.humanTruth.culturalContext.relevance}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium mb-1">Psychological Drivers</p>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs font-medium text-green-400">Motivations</p>
                                {selectedAnalysis.humanTruth.psychologicalDrivers.motivations.map((motivation, index) => (
                                  <p key={index} className="text-xs text-muted-foreground ml-2">• {motivation}</p>
                                ))}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-red-400">Barriers</p>
                                {selectedAnalysis.humanTruth.psychologicalDrivers.barriers.map((barrier, index) => (
                                  <p key={index} className="text-xs text-muted-foreground ml-2">• {barrier}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Analysis</h3>
                <p className="text-muted-foreground">
                  Click on any analysis to view detailed breakdown
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {filteredAnalyses.length === 0 && analyses.length > 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Matching Analyses</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}

      {analyses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Truth Analyses</h3>
            <p className="text-muted-foreground">
              Analyze some captures to see Truth Framework results
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
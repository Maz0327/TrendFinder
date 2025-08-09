import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-primary" />
                <h1 className="text-xl font-bold text-foreground">Truth Analysis Framework</h1>
                <div className="text-sm text-muted-foreground">
                  4-layer analysis: Fact → Observation → Insight → Human Truth
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
                    Analysis Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Content will go here */}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

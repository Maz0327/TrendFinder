import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Zap, 
  AlertTriangle, 
  Clock, 
  Users, 
  Target,
  Brain,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Filter,
  Download,
  Plus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

interface Signal {
  id: string;
  title: string;
  description: string;
  platform: string;
  urgency: 'high' | 'medium' | 'low';
  culturalMoment?: string;
  attentionScore: number;
  engagementRate: number;
  category: string;
  bridgeWorthy: boolean;
  cohortOpportunity?: string;
  keywords: string[];
  url?: string;
  timestamp: string;
}

interface CulturalMoment {
  id: string;
  title: string;
  lifecycle: 'emerging' | 'peak' | 'declining';
  timeToAct: number; // hours
  platforms: string[];
  attentionValue: 'underpriced' | 'fair' | 'overpriced';
  competitorGap?: string;
  opportunity: string;
}

export default function SignalMining() {
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [activeTab, setActiveTab] = useState("signals");
  const { toast } = useToast();

  // Mock data for now - will connect to API
  const mockSignals: Signal[] = [
    {
      id: "1",
      title: "AI-Generated Art Controversy",
      description: "Major artists protesting AI art tools, creating viral moment around creative ownership",
      platform: "twitter",
      urgency: "high",
      culturalMoment: "Creator Rights Movement",
      attentionScore: 92,
      engagementRate: 4500,
      category: "Technology",
      bridgeWorthy: true,
      cohortOpportunity: "Creative professionals, Gen Z activists",
      keywords: ["AI", "art", "creativity", "ownership"],
      url: "https://twitter.com/example",
      timestamp: new Date().toISOString()
    },
    {
      id: "2",
      title: "Minimalist Morning Routines",
      description: "Influencers sharing 5-minute morning routines, challenging hustle culture",
      platform: "tiktok",
      urgency: "medium",
      culturalMoment: "Anti-Hustle Movement",
      attentionScore: 78,
      engagementRate: 3200,
      category: "Lifestyle",
      bridgeWorthy: true,
      cohortOpportunity: "Millennials, busy parents",
      keywords: ["minimalism", "morning", "routine", "wellness"],
      url: "https://tiktok.com/example",
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const mockCulturalMoments: CulturalMoment[] = [
    {
      id: "1",
      title: "Authentic Vulnerability Era",
      lifecycle: "emerging",
      timeToAct: 48,
      platforms: ["tiktok", "instagram"],
      attentionValue: "underpriced",
      competitorGap: "Most brands still using polished content",
      opportunity: "Create raw, behind-the-scenes content showing real struggles"
    },
    {
      id: "2",
      title: "Local-First Movement",
      lifecycle: "peak",
      timeToAct: 24,
      platforms: ["instagram", "linkedin"],
      attentionValue: "fair",
      competitorGap: "National chains slow to adapt messaging",
      opportunity: "Highlight local partnerships and community impact"
    }
  ];

  const handleCapture = (signal: Signal) => {
    toast({
      title: "Signal Captured",
      description: `"${signal.title}" has been added to your workspace`,
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getLifecycleColor = (lifecycle: string) => {
    switch (lifecycle) {
      case 'emerging': return 'bg-blue-500';
      case 'peak': return 'bg-purple-500';
      case 'declining': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getAttentionValueColor = (value: string) => {
    switch (value) {
      case 'underpriced': return 'text-green-600 bg-green-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'overpriced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Signal Mining Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Discover cultural moments and bridge-worthy content opportunities
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="twitter">Twitter/X</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="reddit">Reddit</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Urgency Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency Levels</SelectItem>
              <SelectItem value="high">High Urgency</SelectItem>
              <SelectItem value="medium">Medium Urgency</SelectItem>
              <SelectItem value="low">Low Urgency</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signals">Live Signals</TabsTrigger>
            <TabsTrigger value="cultural">Cultural Moments</TabsTrigger>
            <TabsTrigger value="opportunities">Bridge Opportunities</TabsTrigger>
          </TabsList>

          {/* Live Signals Tab */}
          <TabsContent value="signals" className="space-y-4">
            <div className="grid gap-4">
              {mockSignals.map((signal) => (
                <Card key={signal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{signal.title}</CardTitle>
                        <CardDescription>{signal.description}</CardDescription>
                      </div>
                      <Badge className={getUrgencyColor(signal.urgency)}>
                        {signal.urgency.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Metrics Row */}
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Attention Score: <strong>{signal.attentionScore}%</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Engagement: <strong>{signal.engagementRate.toLocaleString()}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{signal.platform}</Badge>
                        <Badge variant="secondary">{signal.category}</Badge>
                        {signal.bridgeWorthy && (
                          <Badge variant="default" className="bg-purple-500">
                            Bridge Worthy
                          </Badge>
                        )}
                        {signal.culturalMoment && (
                          <Badge variant="outline">{signal.culturalMoment}</Badge>
                        )}
                      </div>

                      {/* Cohort Opportunity */}
                      {signal.cohortOpportunity && (
                        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                          <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Cohort Opportunity</p>
                            <p className="text-sm text-muted-foreground">{signal.cohortOpportunity}</p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleCapture(signal)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Capture Signal
                        </Button>
                        <Button size="sm" variant="outline">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Cultural Moments Tab */}
          <TabsContent value="cultural" className="space-y-4">
            <div className="grid gap-4">
              {mockCulturalMoments.map((moment) => (
                <Card key={moment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{moment.title}</CardTitle>
                      <Badge className={getLifecycleColor(moment.lifecycle)}>
                        {moment.lifecycle.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Time to Act */}
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">
                          Time to Act: {moment.timeToAct} hours
                        </span>
                      </div>

                      {/* Platforms */}
                      <div className="flex gap-2">
                        {moment.platforms.map((platform) => (
                          <Badge key={platform} variant="secondary">
                            {platform}
                          </Badge>
                        ))}
                      </div>

                      {/* Attention Value */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getAttentionValueColor(moment.attentionValue)}`}>
                        <Target className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Attention: {moment.attentionValue}
                        </span>
                      </div>

                      {/* Competitor Gap */}
                      {moment.competitorGap && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">Competitor Gap</p>
                          <p className="text-sm text-blue-700">{moment.competitorGap}</p>
                        </div>
                      )}

                      {/* Opportunity */}
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900">Opportunity</p>
                        <p className="text-sm text-green-700">{moment.opportunity}</p>
                      </div>

                      <Button size="sm">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Create Brief from Moment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bridge Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Bridge Opportunities Analysis</h3>
                  <p className="text-muted-foreground mb-4">
                    AI-powered recommendations for cross-platform content opportunities
                  </p>
                  <Button>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Analyze Current Signals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
}
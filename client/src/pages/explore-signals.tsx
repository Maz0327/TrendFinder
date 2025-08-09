import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  TrendingUp, 
  Radar, 
  Zap, 
  Target,
  Clock,
  Users,
  Filter,
  RefreshCw,
  Globe,
  AlertTriangle,
  CheckCircle,
  Eye
} from "lucide-react";

export default function ExploreSignals() {
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24h");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    highViral: false,
    recentActivity: false,
    truthAnalyzed: false
  });

  // Fetch trending topics
  const { data: trendingData = [], isLoading: trendingLoading } = useQuery({
    queryKey: ['/api/content', { type: 'trending', platform: selectedPlatform, timeFilter }],
    queryFn: () => fetch(`/api/content?type=trending&platform=${selectedPlatform}&time=${timeFilter}`).then(res => res.json()),
    refetchInterval: 30000,
  });

  // Fetch cultural signals
  const { data: culturalSignals = [] } = useQuery({
    queryKey: ['/api/signals/cultural'],
    queryFn: () => fetch('/api/signals/cultural').then(res => res.json()),
    refetchInterval: 60000,
  });

  // Fetch real-time opportunities
  const { data: opportunities = [] } = useQuery({
    queryKey: ['/api/opportunities/realtime'],
    queryFn: () => fetch('/api/opportunities/realtime').then(res => res.json()),
    refetchInterval: 15000,
  });

  return (
    <PageLayout 
      title="Explore Signals" 
      description="Unified discovery workspace with four discovery modes"
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trending">Trending Topics</TabsTrigger>
            <TabsTrigger value="cultural">Signal Mining</TabsTrigger>
            <TabsTrigger value="opportunities">Real-time Opportunities</TabsTrigger>
            <TabsTrigger value="suggestions">System Suggestions</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="time">Time Range</Label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Advanced Filters</DialogTitle>
                  <DialogDescription>
                    Apply additional filtering criteria to refine your signal discovery
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="highViral"
                      checked={advancedFilters.highViral}
                      onCheckedChange={(checked) => 
                        setAdvancedFilters(prev => ({ ...prev, highViral: checked as boolean }))
                      }
                    />
                    <Label htmlFor="highViral">High Viral Score (80+)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="recentActivity"
                      checked={advancedFilters.recentActivity}
                      onCheckedChange={(checked) => 
                        setAdvancedFilters(prev => ({ ...prev, recentActivity: checked as boolean }))
                      }
                    />
                    <Label htmlFor="recentActivity">Recent Activity (Last 24h)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="truthAnalyzed"
                      checked={advancedFilters.truthAnalyzed}
                      onCheckedChange={(checked) => 
                        setAdvancedFilters(prev => ({ ...prev, truthAnalyzed: checked as boolean }))
                      }
                    />
                    <Label htmlFor="truthAnalyzed">Truth Analyzed Content</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setFilterDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // Apply filters and refresh data
                    queryClient.invalidateQueries({ queryKey: ['/api/content'] });
                    setFilterDialogOpen(false);
                  }}>
                    Apply Filters
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/content'] });
                queryClient.invalidateQueries({ queryKey: ['/api/signals/cultural'] });
                queryClient.invalidateQueries({ queryKey: ['/api/opportunities/realtime'] });
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <TabsContent value="trending" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trendingLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                trendingData.map((item: any, index: number) => (
                  <Card 
                    key={index} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      // Open detail modal or navigate to detail page
                      window.open(item.url || '#', '_blank');
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                        <span className="text-xs text-gray-500">{item.platform}</span>
                      </div>
                      <CardTitle className="text-base">{item.title || "Trending Topic"}</CardTitle>
                      <CardDescription className="text-sm">
                        {item.description || "Real-time trend analysis across multiple platforms"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Engagement: {item.engagement || "High"}</span>
                        <span>Viral Score: {item.viralScore || "8.5"}/10</span>
                      </div>
                      <Button variant="ghost" size="sm" className="mt-2 w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="cultural" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {culturalSignals.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="p-6 text-center">
                    <Radar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Cultural Intelligence Engine</h3>
                    <p className="text-gray-600 mb-4">
                      Advanced pattern detection and cultural moment identification across platforms
                    </p>
                    <Button>
                      <Zap className="h-4 w-4 mr-2" />
                      Start Cultural Analysis
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                culturalSignals.map((signal: any, index: number) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          <Radar className="h-3 w-3 mr-1" />
                          Cultural Signal
                        </Badge>
                        <Badge variant={signal.urgency === 'high' ? 'destructive' : signal.urgency === 'medium' ? 'default' : 'secondary'}>
                          {signal.urgency} urgency
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{signal.title}</CardTitle>
                      <CardDescription>{signal.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Attention Score:</span>
                          <span className="font-medium">{signal.attentionScore}/100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Cultural Moment:</span>
                          <span className="font-medium">{signal.culturalMoment}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <div className="grid gap-4">
              {opportunities.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Real-time Opportunity Monitor</h3>
                    <p className="text-gray-600 mb-4">
                      Urgent content moments requiring immediate strategic action
                    </p>
                    <Button>
                      <Eye className="h-4 w-4 mr-2" />
                      Monitor Opportunities
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                opportunities.map((opp: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-orange-400">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          <Clock className="h-3 w-3 mr-1" />
                          Time Sensitive
                        </Badge>
                        <span className="text-sm text-gray-500">Act within {opp.timeWindow || "2 hours"}</span>
                      </div>
                      <CardTitle className="text-base">{opp.title}</CardTitle>
                      <CardDescription>{opp.opportunity}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button size="sm">
                          <Target className="h-4 w-4 mr-2" />
                          Create Capture
                        </Button>
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4 mr-2" />
                          View Cohort
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  AI-Generated Recommendations
                </CardTitle>
                <CardDescription>
                  System suggestions for content promotion and strategic opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Cross-platform Amplification Opportunity</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your recent TikTok content about plant care shows 300% higher engagement. 
                      Consider adapting for Instagram Reels with garden-to-table messaging.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Cohort Bridge Opportunity</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Bridge "Plant Parents" and "Healthy Eating" cohorts with content about 
                      growing herbs for cooking. High potential for viral crossover.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
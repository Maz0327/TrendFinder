import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, Zap, TrendingUp, Globe, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/queryClient";

interface PlatformStatus {
  platform: string;
  status: 'active' | 'configured' | 'error';
  lastFetch?: string;
  itemsCount?: number;
}

export default function IntelligenceHub() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'linkedin']);
  const [keywords, setKeywords] = useState<string>("");
  const [timeWindow, setTimeWindow] = useState<string>("24h");
  const [fetchLimit, setFetchLimit] = useState<number>(50);

  // Get platform status
  const { data: systemStatus } = useQuery({
    queryKey: ['/api/system/status'],
    queryFn: () => fetch('/api/system/status').then(res => res.json()),
    refetchInterval: 30000,
  });

  // Get Tier 2 sources
  const { data: tier2Sources = [] } = useQuery({
    queryKey: ['/api/tier2/sources'],
    queryFn: () => fetch('/api/tier2/sources').then(res => res.json()),
  });

  // Get live data status
  const { data: liveStatus } = useQuery({
    queryKey: ['/api/bright-data/live/status'],
    queryFn: () => fetch('/api/bright-data/live/status').then(res => res.json()),
  });

  // Fetch intelligence mutation
  const fetchIntelligence = useMutation({
    mutationFn: async (params: any) => {
      return api.post('/api/intelligence/comprehensive', params);
    },
    onSuccess: (data) => {
      toast({
        title: "Intelligence Collection Complete",
        description: `Collected ${data.totalSignals} signals across ${data.tier1Signals + data.tier2Signals} sources`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Collection Failed",
        description: error.message || "Failed to fetch intelligence",
        variant: "destructive",
      });
    },
  });

  const platformStatuses: PlatformStatus[] = [
    // Tier 1 platforms
    { platform: 'Twitter/X', status: systemStatus?.platforms?.tier1?.twitter || 'configured' },
    { platform: 'LinkedIn', status: systemStatus?.platforms?.tier1?.linkedin || 'configured' },
    { platform: 'Instagram', status: systemStatus?.platforms?.tier1?.instagram || 'configured' },
    { platform: 'TikTok', status: systemStatus?.platforms?.tier1?.tiktok || 'configured' },
    { platform: 'Medium', status: systemStatus?.platforms?.tier1?.medium || 'configured' },
    // Tier 2 platforms
    ...tier2Sources.map((source: any) => ({
      platform: source.displayName,
      status: source.isActive ? 'active' : 'configured',
    })),
  ];

  const handleFetchIntelligence = () => {
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
    
    fetchIntelligence.mutate({
      tier1Platforms: selectedPlatforms.filter(p => ['twitter', 'linkedin', 'instagram', 'tiktok', 'medium'].includes(p)),
      tier2Platforms: selectedPlatforms.filter(p => !['twitter', 'linkedin', 'instagram', 'tiktok', 'medium'].includes(p)),
      keywords: keywordArray,
      limit: fetchLimit,
      generateBrief: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 lg:p-6">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Strategic Intelligence Hub</h1>
          <p className="text-sm lg:text-base text-gray-600">Monitor and analyze content across multiple platforms in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Platform Status Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Platform Status
              </CardTitle>
              <CardDescription>Real-time connectivity and data availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {platformStatuses.map((platform) => (
                  <div key={platform.platform} className="flex items-center gap-2 p-3 rounded-lg border">
                    {platform.status === 'active' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : platform.status === 'configured' ? (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{platform.platform}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Data Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Live Data Engine
              </CardTitle>
              <CardDescription>Bright Data browser automation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Browser API</span>
                  <Badge variant={liveStatus?.browser?.connected ? "default" : "secondary"}>
                    {liveStatus?.browser?.connected ? "Connected" : "Offline"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Sessions</span>
                  <span className="font-medium">{liveStatus?.browser?.activeSessions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rate Limit</span>
                  <span className="text-sm">{liveStatus?.browser?.rateLimit || "100/hour"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intelligence Collection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Intelligence Collection</CardTitle>
            <CardDescription>Configure and fetch multi-platform intelligence data</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="quick" className="w-full">
              <TabsList>
                <TabsTrigger value="quick">Quick Scan</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Configuration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="quick" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Select Platforms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['twitter', 'linkedin', 'reddit', 'youtube'].map((platform) => (
                        <Button
                          key={platform}
                          variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedPlatforms(prev =>
                              prev.includes(platform)
                                ? prev.filter(p => p !== platform)
                                : [...prev, platform]
                            );
                          }}
                        >
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                    <Input
                      id="keywords"
                      placeholder="AI, technology, trends..."
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleFetchIntelligence}
                  disabled={fetchIntelligence.isPending || selectedPlatforms.length === 0}
                  className="w-full"
                >
                  {fetchIntelligence.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Collecting Intelligence...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Fetch Intelligence
                    </>
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="timeWindow">Time Window</Label>
                    <Select value={timeWindow} onValueChange={setTimeWindow}>
                      <SelectTrigger id="timeWindow" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Last Hour</SelectItem>
                        <SelectItem value="6h">Last 6 Hours</SelectItem>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="limit">Results Limit</Label>
                    <Input
                      id="limit"
                      type="number"
                      value={fetchLimit}
                      onChange={(e) => setFetchLimit(parseInt(e.target.value) || 50)}
                      min={10}
                      max={500}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>All Platforms</Label>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allPlatforms = [
                            'twitter', 'linkedin', 'instagram', 'tiktok', 'medium',
                            'reddit', 'youtube', 'hackernews', 'producthunt'
                          ];
                          setSelectedPlatforms(allPlatforms);
                        }}
                      >
                        Select All
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Selected Platforms</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPlatforms.map((platform) => (
                      <Badge key={platform} variant="secondary" className="cursor-pointer"
                        onClick={() => setSelectedPlatforms(prev => prev.filter(p => p !== platform))}>
                        {platform} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Intelligence Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Intelligence Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fetchIntelligence.data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{fetchIntelligence.data.totalSignals}</div>
                    <div className="text-sm text-gray-600">Total Signals</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{fetchIntelligence.data.tier1Signals}</div>
                    <div className="text-sm text-gray-600">Tier 1 Sources</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{fetchIntelligence.data.tier2Signals}</div>
                    <div className="text-sm text-gray-600">Tier 2 Sources</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{fetchIntelligence.data.trends}</div>
                    <div className="text-sm text-gray-600">Trends Detected</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent intelligence collection. Start a new scan to gather fresh data.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
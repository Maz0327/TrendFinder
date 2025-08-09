import PageLayout from "@/components/layout/PageLayout";
import StrategicCard from "@/components/dashboard/StrategicCard";
import StatsOverview from "@/components/dashboard/StatsOverview";
import SystemStatus from "@/components/dashboard/SystemStatus";
import StrategicModal from "@/components/dashboard/StrategicModal";
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
import { Flame, TrendingUp, Users, Globe, Search, Filter, Zap, Clock, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CulturalMomentsEnhanced() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIntensity, setFilterIntensity] = useState("all");
  const [selectedMoment, setSelectedMoment] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch cultural moments
  const { data: moments = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/cultural-moments'],
    queryFn: async () => {
      const response = await fetch('/api/cultural-moments', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch cultural moments');
      return response.json();
    }
  });

  // Filter moments
  const filteredMoments = moments.filter((moment: any) => {
    const matchesSearch = searchQuery === "" || 
      moment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      moment.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIntensity = filterIntensity === "all" || 
      (filterIntensity === "emerging" && moment.intensity < 40) ||
      (filterIntensity === "growing" && moment.intensity >= 40 && moment.intensity < 70) ||
      (filterIntensity === "viral" && moment.intensity >= 70);
    
    return matchesSearch && matchesIntensity;
  });

  const emergingMoments = moments.filter((m: any) => m.intensity < 40);
  const growingMoments = moments.filter((m: any) => m.intensity >= 40 && m.intensity < 70);
  const viralMoments = moments.filter((m: any) => m.intensity >= 70);

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 70) return 'red';
    if (intensity >= 40) return 'yellow';
    return 'blue';
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity >= 70) return 'Viral';
    if (intensity >= 40) return 'Growing';
    return 'Emerging';
  };

  const getGenerationColor = (generation: string) => {
    switch (generation.toLowerCase()) {
      case 'gen-z': return 'purple';
      case 'millennial': return 'blue';
      case 'gen-x': return 'green';
      case 'boomer': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <PageLayout 
      title="Cultural Moments" 
      description="Cross-generational trend detection with cultural resonance analysis and viral potential scoring"
      onRefresh={() => refetch()}
    >
      <div className="space-y-6">
        {/* Cultural Intelligence Overview with TrendFinder-LVUI-Push StatsOverview */}
        <StatsOverview
          variant="strategic"
          stats={{
            totalTrends: moments.length,
            viralPotential: moments.length > 0 ? Math.round(moments.reduce((acc: number, m: any) => acc + m.intensity, 0) / moments.length) : 0,
            activeSources: viralMoments.length,
            avgScore: 8.5,
            truthAnalyzed: growingMoments.length,
            hypothesesTracked: emergingMoments.length
          }}
        />

        {/* System Status with TrendFinder-LVUI-Push SystemStatus */}
        <FadeIn delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SystemStatus />
            </div>
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <Flame className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-red-600">{viralMoments.length}</div>
                  <p className="text-sm text-muted-foreground">Viral Moments</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* Search and Filters */}
        <FadeIn delay={100}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Cultural Radar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cultural moments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex space-x-2">
                  {['all', 'emerging', 'growing', 'viral'].map(filter => (
                    <Button
                      key={filter}
                      variant={filterIntensity === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterIntensity(filter)}
                      className="capitalize"
                    >
                      {filter}
                    </Button>
                  ))}
                </div>
                
                <Button variant="outline" className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Detect New Moments</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Cultural Moments Tabs */}
        <FadeIn delay={200}>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All Moments ({filteredMoments.length})
              </TabsTrigger>
              <TabsTrigger value="viral">
                Viral ({viralMoments.length})
              </TabsTrigger>
              <TabsTrigger value="growing">
                Growing ({growingMoments.length})
              </TabsTrigger>
              <TabsTrigger value="emerging">
                Emerging ({emergingMoments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <LoadingCard key={i} />
                  ))}
                </div>
              ) : filteredMoments.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="text-muted-foreground">
                      {searchQuery || filterIntensity !== "all" 
                        ? "No cultural moments match your filters" 
                        : "No cultural moments detected yet. The system continuously monitors for emerging trends."
                      }
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <StaggeredFadeIn
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  staggerDelay={50}
                >
                  {filteredMoments.map((moment: any) => (
                    <Card 
                      key={moment.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => {
                        setSelectedMoment(moment);
                        setModalOpen(true);
                      }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-2">
                            {moment.title}
                          </CardTitle>
                          <Badge className={`bg-${getIntensityColor(moment.intensity)}-100 text-${getIntensityColor(moment.intensity)}-800`}>
                            {getIntensityLabel(moment.intensity)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {moment.description}
                        </p>

                        {/* Intensity Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Cultural Intensity</span>
                            <span className={`font-medium text-${getIntensityColor(moment.intensity)}-600`}>
                              {moment.intensity}%
                            </span>
                          </div>
                          <Progress 
                            value={moment.intensity} 
                            className="h-2"
                          />
                        </div>

                        {/* Cross-Generational Analysis */}
                        {moment.generationalReach && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Generational Reach</span>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(moment.generationalReach).map(([generation, score]: [string, any]) => (
                                <Badge 
                                  key={generation}
                                  variant="secondary"
                                  className={`bg-${getGenerationColor(generation)}-100 text-${getGenerationColor(generation)}-800`}
                                >
                                  {generation}: {score}%
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Platform Distribution */}
                        {moment.platformDistribution && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Platform Heat</span>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(moment.platformDistribution).map(([platform, intensity]: [string, any]) => (
                                <Badge 
                                  key={platform}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {platform}: {intensity}%
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Metrics */}
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>Growth: {moment.growthRate || 0}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>Reach: {moment.audienceSize ? (moment.audienceSize / 1000).toFixed(1) + 'k' : '0'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(moment.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Cultural Resonance Indicator */}
                        {moment.culturalResonance && (
                          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Heart className="h-4 w-4 text-pink-600" />
                              <span className="text-sm font-medium text-pink-700">Cultural Resonance</span>
                            </div>
                            <p className="text-xs text-pink-800">
                              {moment.culturalResonance.description || "High emotional and cultural connection detected"}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </StaggeredFadeIn>
              )}
            </TabsContent>

            {/* Viral Moments Tab */}
            <TabsContent value="viral" className="space-y-4">
              {viralMoments.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Flame className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="text-muted-foreground">No viral moments detected</div>
                  </CardContent>
                </Card>
              ) : (
                <StaggeredFadeIn
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  staggerDelay={50}
                >
                  {viralMoments.map((moment: any) => (
                    <Card key={moment.id} className="border-red-200 bg-red-50/50 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Flame className="h-5 w-5 text-red-600" />
                          <span className="line-clamp-2">{moment.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {moment.description}
                        </p>
                        <div className="bg-red-100 p-3 rounded-lg">
                          <div className="text-red-800 text-sm font-medium">
                            Viral Intensity: {moment.intensity}%
                          </div>
                          <Progress value={moment.intensity} className="mt-2 h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </StaggeredFadeIn>
              )}
            </TabsContent>

            {/* Growing Moments Tab */}
            <TabsContent value="growing" className="space-y-4">
              <StaggeredFadeIn
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                staggerDelay={50}
              >
                {growingMoments.map((moment: any) => (
                  <Card key={moment.id} className="border-yellow-200 bg-yellow-50/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-yellow-600" />
                        <span className="line-clamp-2">{moment.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {moment.description}
                      </p>
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <div className="text-yellow-800 text-sm font-medium">
                          Growth Momentum: {moment.intensity}%
                        </div>
                        <Progress value={moment.intensity} className="mt-2 h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </StaggeredFadeIn>
            </TabsContent>

            {/* Emerging Moments Tab */}
            <TabsContent value="emerging" className="space-y-4">
              <StaggeredFadeIn
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                staggerDelay={50}
              >
                {emergingMoments.map((moment: any) => (
                  <Card key={moment.id} className="border-blue-200 bg-blue-50/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <span className="line-clamp-2">{moment.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {moment.description}
                      </p>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <div className="text-blue-800 text-sm font-medium">
                          Early Signal: {moment.intensity}%
                        </div>
                        <Progress value={moment.intensity} className="mt-2 h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </StaggeredFadeIn>
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>

      {/* Strategic Modal for Detailed Cultural Moment Analysis */}
      <StrategicModal
        capture={selectedMoment}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedMoment(null);
        }}
      />
    </PageLayout>
  );
}
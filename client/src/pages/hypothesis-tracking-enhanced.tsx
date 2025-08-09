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
import { TrendingUp, Target, CheckCircle, Clock, AlertTriangle, Plus, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HypothesisTrackingEnhanced() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedHypothesis, setSelectedHypothesis] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch hypothesis validations
  const { data: hypotheses = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/hypothesis-validations'],
    queryFn: async () => {
      const response = await fetch('/api/hypothesis-validations', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch hypotheses');
      return response.json();
    }
  });

  // Create hypothesis mutation
  const createHypothesisMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/hypothesis-validations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create hypothesis');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hypothesis-validations'] });
      toast({ title: "Success", description: "Hypothesis created successfully" });
    }
  });

  // Update hypothesis mutation
  const updateHypothesisMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await fetch(`/api/hypothesis-validations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update hypothesis');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hypothesis-validations'] });
      toast({ title: "Success", description: "Hypothesis updated successfully" });
    }
  });

  const activeHypotheses = hypotheses.filter((h: any) => h.status === 'active');
  const validatedHypotheses = hypotheses.filter((h: any) => h.status === 'validated');
  const invalidatedHypotheses = hypotheses.filter((h: any) => h.status === 'invalidated');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'blue';
      case 'validated': return 'green';
      case 'invalidated': return 'red';
      default: return 'gray';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'green';
    if (confidence >= 60) return 'yellow';
    if (confidence >= 40) return 'orange';
    return 'red';
  };

  return (
    <PageLayout 
      title="Hypothesis Tracking" 
      description="Prediction validation system for measuring accuracy of trend predictions and strategic insights"
      onRefresh={() => refetch()}
    >
      <div className="space-y-6">
        {/* Overview Stats with TrendFinder-LVUI-Push StatsOverview */}
        <StatsOverview
          variant="strategic"
          stats={{
            totalTrends: hypotheses.length,
            viralPotential: validatedHypotheses.length > 0 
              ? Math.round((validatedHypotheses.length / (validatedHypotheses.length + invalidatedHypotheses.length)) * 100)
              : 0,
            activeSources: activeHypotheses.length,
            avgScore: 8.5,
            truthAnalyzed: validatedHypotheses.length,
            hypothesesTracked: activeHypotheses.length
          }}
        />

        {/* System Status with TrendFinder-LVUI-Push SystemStatus */}
        <FadeIn delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SystemStatus />
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{validatedHypotheses.length}</div>
                  <p className="text-sm text-muted-foreground">Validated Predictions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* Create New Hypothesis */}
        <FadeIn delay={100}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create New Hypothesis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => {
                  // This would open a form modal or navigate to creation page
                  toast({ title: "Feature Coming Soon", description: "Hypothesis creation form will be available soon" });
                }}
                className="w-full md:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Prediction
              </Button>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Hypothesis Tabs */}
        <FadeIn delay={200}>
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">
                Active ({activeHypotheses.length})
              </TabsTrigger>
              <TabsTrigger value="validated">
                Validated ({validatedHypotheses.length})
              </TabsTrigger>
              <TabsTrigger value="invalidated">
                Invalidated ({invalidatedHypotheses.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({hypotheses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeHypotheses.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="text-muted-foreground">No active hypotheses</div>
                  </CardContent>
                </Card>
              ) : (
                <StaggeredFadeIn
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  staggerDelay={50}
                >
                  {activeHypotheses.map((hypothesis: any) => (
                    <Card key={hypothesis.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-2">
                            {hypothesis.hypothesis}
                          </CardTitle>
                          <Badge className={`bg-${getStatusColor(hypothesis.status)}-100 text-${getStatusColor(hypothesis.status)}-800`}>
                            {hypothesis.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {hypothesis.reasoning}
                        </p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Confidence</span>
                            <span className={`font-medium text-${getConfidenceColor(hypothesis.confidence)}-600`}>
                              {hypothesis.confidence}%
                            </span>
                          </div>
                          <Progress 
                            value={hypothesis.confidence} 
                            className={`h-2 bg-${getConfidenceColor(hypothesis.confidence)}-200`}
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Created: {new Date(hypothesis.createdAt).toLocaleDateString()}</span>
                          <span>
                            Target: {hypothesis.targetDate ? new Date(hypothesis.targetDate).toLocaleDateString() : 'Ongoing'}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => updateHypothesisMutation.mutate({
                              id: hypothesis.id,
                              updates: { status: 'validated' }
                            })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Validate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => updateHypothesisMutation.mutate({
                              id: hypothesis.id,
                              updates: { status: 'invalidated' }
                            })}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Invalidate
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </StaggeredFadeIn>
              )}
            </TabsContent>

            <TabsContent value="validated" className="space-y-4">
              <StaggeredFadeIn
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                staggerDelay={50}
              >
                {validatedHypotheses.map((hypothesis: any) => (
                  <Card key={hypothesis.id} className="border-green-200 bg-green-50/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="line-clamp-2">{hypothesis.hypothesis}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {hypothesis.reasoning}
                      </p>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-green-600 font-medium">
                          Confidence: {hypothesis.confidence}%
                        </span>
                        <span className="text-muted-foreground">
                          Validated: {hypothesis.updatedAt ? new Date(hypothesis.updatedAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>

                      {hypothesis.outcome && (
                        <div className="bg-green-100 p-3 rounded-lg">
                          <p className="text-xs text-green-800">
                            <strong>Outcome:</strong> {hypothesis.outcome}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </StaggeredFadeIn>
            </TabsContent>

            <TabsContent value="invalidated" className="space-y-4">
              <StaggeredFadeIn
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                staggerDelay={50}
              >
                {invalidatedHypotheses.map((hypothesis: any) => (
                  <Card key={hypothesis.id} className="border-red-200 bg-red-50/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="line-clamp-2">{hypothesis.hypothesis}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {hypothesis.reasoning}
                      </p>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-red-600 font-medium">
                          Confidence: {hypothesis.confidence}%
                        </span>
                        <span className="text-muted-foreground">
                          Invalidated: {hypothesis.updatedAt ? new Date(hypothesis.updatedAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>

                      {hypothesis.outcome && (
                        <div className="bg-red-100 p-3 rounded-lg">
                          <p className="text-xs text-red-800">
                            <strong>What happened:</strong> {hypothesis.outcome}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </StaggeredFadeIn>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <LoadingCard key={i} />
                  ))}
                </div>
              ) : hypotheses.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="text-muted-foreground">No hypotheses found. Create your first prediction to start tracking accuracy.</div>
                  </CardContent>
                </Card>
              ) : (
                <StaggeredFadeIn
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  staggerDelay={50}
                >
                  {hypotheses.map((hypothesis: any) => (
                    <Card 
                      key={hypothesis.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedHypothesis(hypothesis);
                        setModalOpen(true);
                      }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-2">
                            {hypothesis.hypothesis}
                          </CardTitle>
                          <Badge className={`bg-${getStatusColor(hypothesis.status)}-100 text-${getStatusColor(hypothesis.status)}-800`}>
                            {hypothesis.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {hypothesis.reasoning}
                        </p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Confidence</span>
                            <span className={`font-medium text-${getConfidenceColor(hypothesis.confidence)}-600`}>
                              {hypothesis.confidence}%
                            </span>
                          </div>
                          <Progress 
                            value={hypothesis.confidence} 
                            className={`h-2`}
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Created: {new Date(hypothesis.createdAt).toLocaleDateString()}</span>
                          {hypothesis.updatedAt && (
                            <span>
                              Updated: {new Date(hypothesis.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </StaggeredFadeIn>
              )}
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>

      {/* Strategic Modal for Detailed Hypothesis Analysis */}
      <StrategicModal
        capture={selectedHypothesis}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedHypothesis(null);
        }}
      />
    </PageLayout>
  );
}
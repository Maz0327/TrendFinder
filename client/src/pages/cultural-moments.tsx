import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Calendar, 
  Globe, 
  Users, 
  Zap,
  Search,
  Filter,
  Eye,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Archive
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CulturalMoment {
  id: string;
  momentType: string;
  description: string;
  emergenceDate: string;
  peakDate?: string;
  contributingCaptures: string[];
  globalConfidence: number;
  culturalContext: {
    generationSegments?: string[];
    geographicSpread?: string[];
    platformOrigin?: string;
    viralityFactors?: string[];
  };
  strategicImplications: string;
  status: 'emerging' | 'active' | 'declining' | 'archived';
  createdAt: string;
  captures?: Array<{
    id: string;
    title: string;
    platform: string;
    viralScore?: number;
  }>;
}

interface TimelineEvent {
  date: string;
  moment: CulturalMoment;
  type: 'emergence' | 'peak' | 'decline';
}

export default function CulturalMoments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedMoment, setSelectedMoment] = useState<CulturalMoment | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
  
  const { toast } = useToast();

  const { data: moments = [], isLoading } = useQuery({
    queryKey: ['/api/cultural-moments'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest(`/api/cultural-moments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cultural-moments'] });
      toast({ title: 'Cultural moment status updated' });
    },
    onError: () => {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    },
  });

  const queryClient = useQueryClient();

  const filteredMoments = moments.filter((moment: CulturalMoment) => {
    const matchesSearch = moment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         moment.momentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         moment.strategicImplications.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || moment.status === filterStatus;
    const matchesType = filterType === 'all' || moment.momentType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const momentTypes = [...new Set(moments.map((m: CulturalMoment) => m.momentType))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emerging': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'declining': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'archived': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'emerging': return TrendingUp;
      case 'active': return CheckCircle;
      case 'declining': return XCircle;
      case 'archived': return Archive;
      default: return AlertCircle;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    if (confidence >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const createTimelineEvents = (moments: CulturalMoment[]): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    moments.forEach(moment => {
      events.push({
        date: moment.emergenceDate,
        moment,
        type: 'emergence'
      });
      
      if (moment.peakDate) {
        events.push({
          date: moment.peakDate,
          moment,
          type: 'peak'
        });
      }
    });
    
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const timelineEvents = createTimelineEvents(filteredMoments);

  const statusDistribution = {
    emerging: moments.filter((m: CulturalMoment) => m.status === 'emerging').length,
    active: moments.filter((m: CulturalMoment) => m.status === 'active').length,
    declining: moments.filter((m: CulturalMoment) => m.status === 'declining').length,
    archived: moments.filter((m: CulturalMoment) => m.status === 'archived').length,
  };

  const averageConfidence = moments.length > 0 
    ? moments.reduce((sum: number, m: CulturalMoment) => sum + m.globalConfidence, 0) / moments.length 
    : 0;

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
          <h1 className="text-3xl font-bold text-foreground">Cultural Moments Timeline</h1>
          <p className="text-muted-foreground">Track emerging cultural trends and zeitgeist moments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            onClick={() => setViewMode('cards')}
            data-testid="button-cards-view"
          >
            Cards
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            onClick={() => setViewMode('timeline')}
            data-testid="button-timeline-view"
          >
            Timeline
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Moments</p>
                <p className="text-2xl font-bold text-foreground">{moments.length}</p>
              </div>
              <Globe className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Moments</p>
                <p className="text-2xl font-bold text-green-400">{statusDistribution.active}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emerging</p>
                <p className="text-2xl font-bold text-blue-400">{statusDistribution.emerging}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(averageConfidence)}`}>
                  {(averageConfidence * 100).toFixed(1)}%
                </p>
              </div>
              <Eye className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Cultural Moment Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search moments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
                data-testid="input-search-moments"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="emerging">Emerging</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {momentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredMoments.map((moment: CulturalMoment) => {
              const StatusIcon = getStatusIcon(moment.status);
              
              return (
                <Card 
                  key={moment.id} 
                  className={`bg-gradient-surface border-border/50 hover:border-primary/20 transition-smooth cursor-pointer ${
                    selectedMoment?.id === moment.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedMoment(moment)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {moment.description}
                        </CardTitle>
                        <CardDescription>
                          {moment.strategicImplications}
                        </CardDescription>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getStatusColor(moment.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {moment.status}
                          </Badge>
                          <Badge variant="outline">
                            <Globe className="w-3 h-3 mr-1" />
                            {(moment.globalConfidence * 100).toFixed(0)}% confidence
                          </Badge>
                          <Badge variant="outline">
                            <Users className="w-3 h-3 mr-1" />
                            {moment.contributingCaptures.length} signals
                          </Badge>
                          <Badge variant="outline">
                            {moment.momentType}
                          </Badge>
                        </div>
                      </div>
                      <Select
                        value={moment.status}
                        onValueChange={(status) => updateStatusMutation.mutate({ id: moment.id, status })}
                      >
                        <SelectTrigger className="w-32" onClick={(e) => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emerging">Emerging</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="declining">Declining</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Global Confidence</p>
                        <div className="flex items-center gap-2">
                          <Progress value={moment.globalConfidence * 100} className="flex-1" />
                          <span className={`text-sm font-medium ${getConfidenceColor(moment.globalConfidence)}`}>
                            {(moment.globalConfidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground">Emerged</p>
                          <p>{new Date(moment.emergenceDate).toLocaleDateString()}</p>
                        </div>
                        {moment.peakDate && (
                          <div>
                            <p className="font-medium text-muted-foreground">Peak</p>
                            <p>{new Date(moment.peakDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      {moment.culturalContext?.generationSegments && moment.culturalContext.generationSegments.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Generation Segments</p>
                          <div className="flex flex-wrap gap-1">
                            {moment.culturalContext.generationSegments.map((segment, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {segment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {moment.captures && moment.captures.length > 0 && (
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Contributing Signals</p>
                          <div className="space-y-1">
                            {moment.captures.slice(0, 3).map((capture, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <span className="line-clamp-1">{capture.title}</span>
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {capture.platform}
                                  </Badge>
                                  {capture.viralScore && (
                                    <Badge variant="outline" className="text-xs">
                                      {capture.viralScore}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                            {moment.captures.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{moment.captures.length - 3} more signals
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            {selectedMoment ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Cultural Moment Details</CardTitle>
                  <CardDescription>
                    {selectedMoment.momentType}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="context">Context</TabsTrigger>
                    </TabsList>

                    <div className="mt-4 max-h-96 overflow-y-auto">
                      <TabsContent value="overview" className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedMoment.description}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-2">Strategic Implications</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedMoment.strategicImplications}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Timeline</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Emerged:</span>
                              <span>{new Date(selectedMoment.emergenceDate).toLocaleDateString()}</span>
                            </div>
                            {selectedMoment.peakDate && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Peak:</span>
                                <span>{new Date(selectedMoment.peakDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status:</span>
                              <Badge className={getStatusColor(selectedMoment.status)}>
                                {selectedMoment.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Confidence Level</h4>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedMoment.globalConfidence * 100} className="flex-1" />
                            <span className={`text-sm font-medium ${getConfidenceColor(selectedMoment.globalConfidence)}`}>
                              {(selectedMoment.globalConfidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="context" className="space-y-4">
                        {selectedMoment.culturalContext?.generationSegments && 
                         selectedMoment.culturalContext.generationSegments.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Generation Segments</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedMoment.culturalContext.generationSegments.map((segment, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {segment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedMoment.culturalContext?.geographicSpread && 
                         selectedMoment.culturalContext.geographicSpread.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Geographic Spread</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedMoment.culturalContext.geographicSpread.map((region, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {region}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedMoment.culturalContext?.platformOrigin && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Platform Origin</h4>
                            <Badge variant="outline">
                              {selectedMoment.culturalContext.platformOrigin}
                            </Badge>
                          </div>
                        )}

                        {selectedMoment.culturalContext?.viralityFactors && 
                         selectedMoment.culturalContext.viralityFactors.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Virality Factors</h4>
                            <div className="space-y-1">
                              {selectedMoment.culturalContext.viralityFactors.map((factor, index) => (
                                <p key={index} className="text-xs text-muted-foreground">• {factor}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium text-sm mb-2">Contributing Signals</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedMoment.contributingCaptures.length} captured signals contributing to this moment
                          </p>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Cultural Moment</h3>
                  <p className="text-muted-foreground">
                    Click on any moment to view detailed context and analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Cultural Moments Timeline
            </CardTitle>
            <CardDescription>
              Chronological view of cultural emergence and peak moments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {timelineEvents.map((event, index) => {
                const StatusIcon = getStatusIcon(event.moment.status);
                
                return (
                  <div key={`${event.moment.id}-${event.type}-${index}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${
                        event.type === 'emergence' ? 'bg-blue-500/10 text-blue-400' :
                        event.type === 'peak' ? 'bg-green-500/10 text-green-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {event.type === 'emergence' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : event.type === 'peak' ? (
                          <Zap className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                      {index < timelineEvents.length - 1 && (
                        <div className="w-px h-8 bg-border mt-2"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-sm mb-1">
                            {event.moment.description}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {event.type === 'emergence' ? 'Emerged' : 
                             event.type === 'peak' ? 'Peaked' : 'Declined'} on{' '}
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(event.moment.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {event.moment.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {event.moment.momentType}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {(event.moment.globalConfidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMoment(event.moment)}
                          data-testid={`button-view-moment-${event.moment.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredMoments.length === 0 && moments.length > 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Matching Cultural Moments</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}

      {moments.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Cultural Moments Detected</h3>
            <p className="text-muted-foreground">
              Cultural moments will appear here as they are detected from signal analysis
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
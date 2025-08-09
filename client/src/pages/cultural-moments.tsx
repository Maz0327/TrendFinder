import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-primary" />
                <h1 className="text-xl font-bold text-foreground">Cultural Moments Timeline</h1>
                <div className="text-sm text-muted-foreground">
                  Track emerging cultural trends and zeitgeist moments
                </div>
              </div>
              <div className="flex items-center gap-3">
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
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Cultural Moments Dashboard
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

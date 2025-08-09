import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  Search,
  Filter,
  Plus,
  Eye,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const validationSchema = z.object({
  originalCaptureId: z.string().min(1, 'Original capture is required'),
  originalPrediction: z.object({
    prediction: z.string().min(1, 'Prediction is required'),
    confidence: z.number().min(0).max(100),
    timeframe: z.string().min(1, 'Timeframe is required'),
    metrics: z.array(z.string()).optional(),
  }),
  actualOutcome: z.object({
    outcome: z.string().min(1, 'Outcome description is required'),
    measuredResults: z.record(z.number()).optional(),
    evidenceLinks: z.array(z.string()).optional(),
  }),
  supportingEvidence: z.string().optional(),
});

type ValidationForm = z.infer<typeof validationSchema>;

interface HypothesisValidation {
  id: string;
  originalCaptureId: string;
  validatingUserId: string;
  originalPrediction: {
    prediction: string;
    confidence: number;
    timeframe: string;
    metrics?: string[];
  };
  actualOutcome: {
    outcome: string;
    measuredResults?: Record<string, number>;
    evidenceLinks?: string[];
  };
  accuracyScore: number;
  supportingEvidence?: string;
  validatedAt: string;
  capture?: {
    id: string;
    title: string;
    platform: string;
    content: string;
  };
}

interface Capture {
  id: string;
  title: string;
  platform: string;
  content: string;
  viralScore?: number;
  strategicValue?: number;
}

export default function HypothesisTracking() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccuracy, setFilterAccuracy] = useState<string>('all');
  const [filterTimeframe, setFilterTimeframe] = useState<string>('all');
  const [selectedValidation, setSelectedValidation] = useState<HypothesisValidation | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ValidationForm>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      originalCaptureId: '',
      originalPrediction: {
        prediction: '',
        confidence: 50,
        timeframe: '',
        metrics: [],
      },
      actualOutcome: {
        outcome: '',
        measuredResults: {},
        evidenceLinks: [],
      },
      supportingEvidence: '',
    },
  });

  const { data: validations = [], isLoading } = useQuery({
    queryKey: ['/api/hypothesis-validations'],
  });

  const { data: captures = [] } = useQuery({
    queryKey: ['/api/captures'],
  });

  const createMutation = useMutation({
    mutationFn: (data: ValidationForm) => apiRequest('/api/hypothesis-validations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hypothesis-validations'] });
      setIsCreateOpen(false);
      form.reset();
      toast({ title: 'Hypothesis validation created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create hypothesis validation', variant: 'destructive' });
    },
  });

  const onSubmit = (data: ValidationForm) => {
    createMutation.mutate(data);
  };

  const filteredValidations = validations.filter((validation: HypothesisValidation) => {
    const matchesSearch = validation.originalPrediction.prediction.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         validation.actualOutcome.outcome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAccuracy = filterAccuracy === 'all' || 
      (filterAccuracy === 'high' && validation.accuracyScore >= 80) ||
      (filterAccuracy === 'medium' && validation.accuracyScore >= 50 && validation.accuracyScore < 80) ||
      (filterAccuracy === 'low' && validation.accuracyScore < 50);
      
    const matchesTimeframe = filterTimeframe === 'all' || validation.originalPrediction.timeframe === filterTimeframe;
    
    return matchesSearch && matchesAccuracy && matchesTimeframe;
  });

  const getAccuracyColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getAccuracyBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    if (score >= 40) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  const overallAccuracy = validations.length > 0 
    ? validations.reduce((sum: number, v: HypothesisValidation) => sum + v.accuracyScore, 0) / validations.length 
    : 0;

  const accuracyDistribution = {
    high: validations.filter((v: HypothesisValidation) => v.accuracyScore >= 80).length,
    medium: validations.filter((v: HypothesisValidation) => v.accuracyScore >= 50 && v.accuracyScore < 80).length,
    low: validations.filter((v: HypothesisValidation) => v.accuracyScore < 50).length,
  };

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
                <h1 className="text-xl font-bold text-foreground">Hypothesis Tracking</h1>
                <div className="text-sm text-muted-foreground">
                  Track prediction accuracy and validate strategic intelligence
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-validation">
                      <Plus className="w-4 h-4 mr-2" />
                      New Validation
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Hypothesis Tracking Dashboard
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
      
      {/* Dialog outside main layout */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Hypothesis Validation</DialogTitle>
          </DialogHeader>
          {/* Dialog content */}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

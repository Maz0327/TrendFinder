import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hypothesis Tracking</h1>
          <p className="text-muted-foreground">Track prediction accuracy and validate strategic intelligence</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-validation">
              <Plus className="w-4 h-4 mr-2" />
              New Validation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Hypothesis Validation</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="originalCaptureId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Capture</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-capture">
                            <SelectValue placeholder="Select capture to validate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {captures.map((capture: Capture) => (
                            <SelectItem key={capture.id} value={capture.id}>
                              {capture.title} ({capture.platform})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="font-semibold">Original Prediction</h3>
                  <FormField
                    control={form.control}
                    name="originalPrediction.prediction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prediction Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What was predicted to happen?"
                            {...field}
                            data-testid="input-prediction"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="originalPrediction.confidence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confidence (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="0"
                              max="100"
                              placeholder="50"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              data-testid="input-confidence"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="originalPrediction.timeframe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeframe</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-timeframe">
                                <SelectValue placeholder="Select timeframe" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-week">1 Week</SelectItem>
                              <SelectItem value="2-weeks">2 Weeks</SelectItem>
                              <SelectItem value="1-month">1 Month</SelectItem>
                              <SelectItem value="3-months">3 Months</SelectItem>
                              <SelectItem value="6-months">6 Months</SelectItem>
                              <SelectItem value="1-year">1 Year</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Actual Outcome</h3>
                  <FormField
                    control={form.control}
                    name="actualOutcome.outcome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outcome Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What actually happened?"
                            {...field}
                            data-testid="input-outcome"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supportingEvidence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supporting Evidence</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Links, data, or other evidence supporting the outcome"
                            {...field}
                            data-testid="input-evidence"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    data-testid="button-cancel-validation"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-save-validation"
                  >
                    {createMutation.isPending ? 'Saving...' : 'Save Validation'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Accuracy</p>
                <p className={`text-2xl font-bold ${getAccuracyColor(overallAccuracy)}`}>
                  {overallAccuracy.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Validations</p>
                <p className="text-2xl font-bold text-foreground">{validations.length}</p>
              </div>
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Accuracy</p>
                <p className="text-2xl font-bold text-green-400">{accuracyDistribution.high}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Accuracy</p>
                <p className="text-2xl font-bold text-red-400">{accuracyDistribution.low}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Validation Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search validations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
                data-testid="input-search-validations"
              />
            </div>
            
            <Select value={filterAccuracy} onValueChange={setFilterAccuracy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accuracy</SelectItem>
                <SelectItem value="high">High (80%+)</SelectItem>
                <SelectItem value="medium">Medium (50-79%)</SelectItem>
                <SelectItem value="low">Low (&lt;50%)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTimeframe} onValueChange={setFilterTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Timeframes</SelectItem>
                <SelectItem value="1-week">1 Week</SelectItem>
                <SelectItem value="2-weeks">2 Weeks</SelectItem>
                <SelectItem value="1-month">1 Month</SelectItem>
                <SelectItem value="3-months">3 Months</SelectItem>
                <SelectItem value="6-months">6 Months</SelectItem>
                <SelectItem value="1-year">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredValidations.map((validation: HypothesisValidation) => (
            <Card 
              key={validation.id} 
              className={`bg-gradient-surface border-border/50 hover:border-primary/20 transition-smooth cursor-pointer ${
                selectedValidation?.id === validation.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedValidation(validation)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {validation.originalPrediction.prediction}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {validation.actualOutcome.outcome}
                    </CardDescription>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getAccuracyBadgeColor(validation.accuracyScore)}>
                        {validation.accuracyScore}% accurate
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {validation.originalPrediction.timeframe}
                      </Badge>
                      <Badge variant="outline">
                        <Target className="w-3 h-3 mr-1" />
                        {validation.originalPrediction.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(validation.validatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Accuracy Score</p>
                    <div className="flex items-center gap-2">
                      <Progress value={validation.accuracyScore} className="flex-1" />
                      <span className={`text-sm font-medium ${getAccuracyColor(validation.accuracyScore)}`}>
                        {validation.accuracyScore}%
                      </span>
                    </div>
                  </div>
                  
                  {validation.capture && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Original Capture</p>
                      <p className="text-sm">{validation.capture.title}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {validation.capture.platform}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          {selectedValidation ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Validation Details</CardTitle>
                <CardDescription>
                  Validated {new Date(selectedValidation.validatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="prediction" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="prediction">Prediction</TabsTrigger>
                    <TabsTrigger value="outcome">Outcome</TabsTrigger>
                  </TabsList>

                  <div className="mt-4 max-h-96 overflow-y-auto">
                    <TabsContent value="prediction" className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Original Prediction</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {selectedValidation.originalPrediction.prediction}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Confidence:</span>
                            <span className="font-medium">
                              {selectedValidation.originalPrediction.confidence}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Timeframe:</span>
                            <span className="font-medium">
                              {selectedValidation.originalPrediction.timeframe}
                            </span>
                          </div>
                        </div>

                        {selectedValidation.originalPrediction.metrics && 
                         selectedValidation.originalPrediction.metrics.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-1">Metrics</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedValidation.originalPrediction.metrics.map((metric, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="outcome" className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Actual Outcome</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {selectedValidation.actualOutcome.outcome}
                        </p>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Accuracy Score</p>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedValidation.accuracyScore} className="flex-1" />
                            <span className={`text-sm font-medium ${getAccuracyColor(selectedValidation.accuracyScore)}`}>
                              {selectedValidation.accuracyScore}%
                            </span>
                          </div>
                        </div>

                        {selectedValidation.supportingEvidence && (
                          <div>
                            <p className="text-sm font-medium mb-1">Supporting Evidence</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedValidation.supportingEvidence}
                            </p>
                          </div>
                        )}

                        {selectedValidation.actualOutcome.measuredResults && 
                         Object.keys(selectedValidation.actualOutcome.measuredResults).length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-1">Measured Results</p>
                            <div className="space-y-1">
                              {Object.entries(selectedValidation.actualOutcome.measuredResults).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span>{key}:</span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Validation</h3>
                <p className="text-muted-foreground">
                  Click on any validation to view detailed breakdown
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {filteredValidations.length === 0 && validations.length > 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Matching Validations</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}

      {validations.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Hypothesis Validations</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking prediction accuracy by validating hypotheses
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-validation">
              <Plus className="w-4 h-4 mr-2" />
              Create First Validation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Share, 
  Target, 
  TrendingUp, 
  Lightbulb,
  Eye,
  Brain,
  Zap,
  FileText,
  ExternalLink
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const dsdBriefSchema = z.object({
  title: z.string().min(1, 'Brief title is required'),
  projectId: z.string().min(1, 'Project is required'),
  clientId: z.string().optional(),
  defineContent: z.object({
    lifeLens: z.string().optional(),
    rawBehavior: z.string().optional(),
    channelVibes: z.record(z.string()).optional(),
  }).optional(),
  shiftContent: z.object({
    strategicIntelligence: z.string().optional(),
    humanTruth: z.string().optional(),
    culturalMoment: z.string().optional(),
  }).optional(),
  deliverContent: z.object({
    creativeTerritory: z.array(z.string()).optional(),
    executionIdeas: z.array(z.string()).optional(),
    attentionValue: z.number().optional(),
    viralPotential: z.number().optional(),
  }).optional(),
});

type DsdBriefForm = z.infer<typeof dsdBriefSchema>;

interface DsdBrief {
  id: string;
  title: string;
  projectId: string;
  clientId?: string;
  defineContent?: {
    lifeLens?: string;
    rawBehavior?: string;
    channelVibes?: Record<string, string>;
  };
  shiftContent?: {
    strategicIntelligence?: string;
    humanTruth?: string;
    culturalMoment?: string;
  };
  deliverContent?: {
    creativeTerritory?: string[];
    executionIdeas?: string[];
    attentionValue?: number;
    viralPotential?: number;
  };
  googleSlidesUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
}

interface ClientProfile {
  id: string;
  name: string;
}

export default function DsdBriefBuilder() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBrief, setEditingBrief] = useState<DsdBrief | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [activeTab, setActiveTab] = useState('define');
  const [newIdea, setNewIdea] = useState('');
  const [ideaType, setIdeaType] = useState<'creativeTerritory' | 'executionIdeas'>('creativeTerritory');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<DsdBriefForm>({
    resolver: zodResolver(dsdBriefSchema),
    defaultValues: {
      title: '',
      projectId: '',
      clientId: '',
      defineContent: {
        lifeLens: '',
        rawBehavior: '',
        channelVibes: {},
      },
      shiftContent: {
        strategicIntelligence: '',
        humanTruth: '',
        culturalMoment: '',
      },
      deliverContent: {
        creativeTerritory: [],
        executionIdeas: [],
        attentionValue: 0,
        viralPotential: 0,
      },
    },
  });

  const { data: briefs = [], isLoading } = useQuery({
    queryKey: ['/api/dsd-briefs'],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: clientProfiles = [] } = useQuery({
    queryKey: ['/api/client-profiles'],
  });

  const createMutation = useMutation({
    mutationFn: (data: DsdBriefForm) => apiRequest('/api/dsd-briefs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dsd-briefs'] });
      setIsCreateOpen(false);
      form.reset();
      toast({ title: 'DSD Brief created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create DSD Brief', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DsdBriefForm> }) =>
      apiRequest(`/api/dsd-briefs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dsd-briefs'] });
      setEditingBrief(null);
      form.reset();
      toast({ title: 'DSD Brief updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update DSD Brief', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/dsd-briefs/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dsd-briefs'] });
      toast({ title: 'DSD Brief deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete DSD Brief', variant: 'destructive' });
    },
  });

  const generateSlidesMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/dsd-briefs/${id}/generate-slides`, {
      method: 'POST',
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dsd-briefs'] });
      if (data.url) {
        window.open(data.url, '_blank');
      }
      toast({ title: 'Google Slides generated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to generate Google Slides', variant: 'destructive' });
    },
  });

  const onSubmit = (data: DsdBriefForm) => {
    if (editingBrief) {
      updateMutation.mutate({ id: editingBrief.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (brief: DsdBrief) => {
    setEditingBrief(brief);
    form.reset({
      title: brief.title,
      projectId: brief.projectId,
      clientId: brief.clientId || '',
      defineContent: brief.defineContent || {
        lifeLens: '',
        rawBehavior: '',
        channelVibes: {},
      },
      shiftContent: brief.shiftContent || {
        strategicIntelligence: '',
        humanTruth: '',
        culturalMoment: '',
      },
      deliverContent: brief.deliverContent || {
        creativeTerritory: [],
        executionIdeas: [],
        attentionValue: 0,
        viralPotential: 0,
      },
    });
    setIsCreateOpen(true);
  };

  const addIdea = () => {
    if (!newIdea.trim()) return;
    
    const currentValues = form.getValues();
    const updatedValues = { ...currentValues };
    
    if (!updatedValues.deliverContent) updatedValues.deliverContent = {};
    if (!updatedValues.deliverContent[ideaType]) updatedValues.deliverContent[ideaType] = [];
    
    updatedValues.deliverContent[ideaType] = [
      ...(updatedValues.deliverContent[ideaType] || []),
      newIdea.trim()
    ];
    
    form.reset(updatedValues);
    setNewIdea('');
  };

  const removeIdea = (type: 'creativeTerritory' | 'executionIdeas', idea: string) => {
    const currentValues = form.getValues();
    const updatedValues = { ...currentValues };
    
    if (updatedValues.deliverContent && updatedValues.deliverContent[type]) {
      updatedValues.deliverContent[type] = updatedValues.deliverContent[type]!.filter(i => i !== idea);
    }
    
    form.reset(updatedValues);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'review': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'approved': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'delivered': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center justify-between h-full px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="text-muted-foreground hover:text-primary" />
                  <h1 className="text-xl font-bold text-foreground">DSD Brief Builder</h1>
                  <div className="text-sm text-muted-foreground">
                    Define → Shift → Deliver strategic intelligence briefs
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </main>
          </div>
        </div>
      </SidebarProvider>
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
                <h1 className="text-xl font-bold text-foreground">DSD Brief Builder</h1>
                <div className="text-sm text-muted-foreground">
                  Define → Shift → Deliver strategic intelligence briefs
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={isCreateOpen} onOpenChange={(open) => {
                  setIsCreateOpen(open);
                  if (!open) {
                    setEditingBrief(null);
                    form.reset();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-brief">
                      <Plus className="w-4 h-4 mr-2" />
                      New DSD Brief
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(briefs as DsdBrief[]).map((brief: DsdBrief) => (
                  <Card key={brief.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          {brief.title}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(brief)}
                            data-testid={`button-edit-${brief.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateSlidesMutation.mutate(brief.id)}
                            data-testid={`button-generate-${brief.id}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(brief.id)}
                            data-testid={`button-delete-${brief.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        Project: {brief.projectId} | Status: {brief.status}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <h4 className="font-medium mb-1">Define</h4>
                          <p className="text-muted-foreground">
                            {brief.defineContent ? 'Complete' : 'Pending'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Shift</h4>
                          <p className="text-muted-foreground">
                            {brief.shiftContent ? 'Complete' : 'Pending'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Deliver</h4>
                          <p className="text-muted-foreground">
                            {brief.deliverContent ? 'Complete' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {(briefs as DsdBrief[]).length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No DSD Briefs</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first DSD brief to start building strategic intelligence
                    </p>
                    <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-brief">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Brief
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
      
      {/* Dialog Form - Outside the main layout */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        setIsCreateOpen(open);
        if (!open) {
          setEditingBrief(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {editingBrief ? 'Edit DSD Brief' : 'Create DSD Brief'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="h-full overflow-hidden">
                <div className="space-y-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brief Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter brief title" {...field} data-testid="input-brief-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-project">
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(projects as Project[]).map((project: Project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Profile</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-client">
                                <SelectValue placeholder="Select client" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No Client</SelectItem>
                              {(clientProfiles as ClientProfile[]).map((client: ClientProfile) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full overflow-hidden">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="define" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Define
                    </TabsTrigger>
                    <TabsTrigger value="shift" className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Shift
                    </TabsTrigger>
                    <TabsTrigger value="deliver" className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Deliver
                    </TabsTrigger>
                  </TabsList>

                  <div className="overflow-y-auto max-h-96 mt-4">
                    <TabsContent value="define" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            Define: What We See
                          </CardTitle>
                          <CardDescription>Raw observations and behavioral signals</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="defineContent.lifeLens"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Life Lens</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="How does this content reflect real life experiences and contexts?"
                                    {...field}
                                    data-testid="input-life-lens"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="defineContent.rawBehavior"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Raw Behavior</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="What specific behaviors, actions, or patterns are visible?"
                                    {...field}
                                    data-testid="input-raw-behavior"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="shift" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Brain className="w-5 h-5" />
                            Shift: What It Means
                          </CardTitle>
                          <CardDescription>Strategic insights and cultural implications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="shiftContent.strategicIntelligence"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Strategic Intelligence</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="What are the strategic implications and business opportunities?"
                                    {...field}
                                    data-testid="input-strategic-intelligence"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="shiftContent.humanTruth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Human Truth</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="What deeper human truth or psychological driver does this reveal?"
                                    {...field}
                                    data-testid="input-human-truth"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="shiftContent.culturalMoment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cultural Moment</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="How does this connect to broader cultural trends or zeitgeist moments?"
                                    {...field}
                                    data-testid="input-cultural-moment"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="deliver" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Deliver: How We Act
                          </CardTitle>
                          <CardDescription>Actionable strategies and execution ideas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="deliverContent.attentionValue"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Attention Value (0-100)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number"
                                      min="0"
                                      max="100"
                                      placeholder="Rate attention-grabbing potential"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                      data-testid="input-attention-value"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="deliverContent.viralPotential"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Viral Potential (0-100)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number"
                                      min="0"
                                      max="100"
                                      placeholder="Rate viral sharing potential"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                      data-testid="input-viral-potential"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Select value={ideaType} onValueChange={(value: any) => setIdeaType(value)}>
                                <SelectTrigger className="w-48">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="creativeTerritory">Creative Territory</SelectItem>
                                  <SelectItem value="executionIdeas">Execution Ideas</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Add idea..."
                                value={newIdea}
                                onChange={(e) => setNewIdea(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIdea())}
                                data-testid="input-new-idea"
                              />
                              <Button type="button" onClick={addIdea} data-testid="button-add-idea">Add</Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Creative Territory</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {form.watch('deliverContent.creativeTerritory')?.map((territory, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs cursor-pointer w-full justify-between"
                                        onClick={() => removeIdea('creativeTerritory', territory)}
                                        data-testid={`territory-${index}`}
                                      >
                                        {territory} ×
                                      </Badge>
                                    )) || <span className="text-xs text-muted-foreground">No territories added</span>}
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Execution Ideas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {form.watch('deliverContent.executionIdeas')?.map((idea, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs cursor-pointer w-full justify-between"
                                        onClick={() => removeIdea('executionIdeas', idea)}
                                        data-testid={`idea-${index}`}
                                      >
                                        {idea} ×
                                      </Badge>
                                    )) || <span className="text-xs text-muted-foreground">No ideas added</span>}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    data-testid="button-cancel-brief"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-brief"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Brief'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
    </SidebarProvider>
  );
}

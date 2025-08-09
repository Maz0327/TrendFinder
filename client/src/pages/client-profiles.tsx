import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Users, Target, MessageSquare, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const clientProfileSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  brandVoice: z.string().optional(),
  targetAudience: z.object({
    demographics: z.array(z.string()).optional(),
    psychographics: z.array(z.string()).optional(),
    behaviors: z.array(z.string()).optional(),
    painPoints: z.array(z.string()).optional(),
  }).optional(),
  channelPreferences: z.object({
    twitter: z.object({ tone: z.string(), frequency: z.string() }).optional(),
    instagram: z.object({ tone: z.string(), frequency: z.string() }).optional(),
    tiktok: z.object({ tone: z.string(), frequency: z.string() }).optional(),
    linkedin: z.object({ tone: z.string(), frequency: z.string() }).optional(),
  }).optional(),
  noGoZones: z.array(z.string()).optional(),
  competitiveLandscape: z.record(z.any()).optional(),
});

type ClientProfileForm = z.infer<typeof clientProfileSchema>;

interface ClientProfile {
  id: string;
  name: string;
  brandVoice?: string;
  targetAudience?: {
    demographics?: string[];
    psychographics?: string[];
    behaviors?: string[];
    painPoints?: string[];
  };
  channelPreferences?: {
    twitter?: { tone: string; frequency: string };
    instagram?: { tone: string; frequency: string };
    tiktok?: { tone: string; frequency: string };
    linkedin?: { tone: string; frequency: string };
  };
  noGoZones?: string[];
  competitiveLandscape?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export default function ClientProfiles() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ClientProfile | null>(null);
  const [newTag, setNewTag] = useState('');
  const [tagCategory, setTagCategory] = useState<'demographics' | 'psychographics' | 'behaviors' | 'painPoints' | 'noGoZones'>('demographics');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ClientProfileForm>({
    resolver: zodResolver(clientProfileSchema),
    defaultValues: {
      name: '',
      brandVoice: '',
      targetAudience: {
        demographics: [],
        psychographics: [],
        behaviors: [],
        painPoints: [],
      },
      channelPreferences: {
        twitter: { tone: '', frequency: '' },
        instagram: { tone: '', frequency: '' },
        tiktok: { tone: '', frequency: '' },
        linkedin: { tone: '', frequency: '' },
      },
      noGoZones: [],
      competitiveLandscape: {},
    },
  });

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['/api/client-profiles'],
  });

  const createMutation = useMutation({
    mutationFn: (data: ClientProfileForm) => apiRequest('/api/client-profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-profiles'] });
      setIsCreateOpen(false);
      form.reset();
      toast({ title: 'Client profile created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create client profile', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientProfileForm> }) =>
      apiRequest(`/api/client-profiles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-profiles'] });
      setEditingProfile(null);
      form.reset();
      toast({ title: 'Client profile updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update client profile', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/client-profiles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-profiles'] });
      toast({ title: 'Client profile deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete client profile', variant: 'destructive' });
    },
  });

  const onSubmit = (data: ClientProfileForm) => {
    if (editingProfile) {
      updateMutation.mutate({ id: editingProfile.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (profile: ClientProfile) => {
    setEditingProfile(profile);
    form.reset({
      name: profile.name,
      brandVoice: profile.brandVoice || '',
      targetAudience: profile.targetAudience || {
        demographics: [],
        psychographics: [],
        behaviors: [],
        painPoints: [],
      },
      channelPreferences: profile.channelPreferences || {
        twitter: { tone: '', frequency: '' },
        instagram: { tone: '', frequency: '' },
        tiktok: { tone: '', frequency: '' },
        linkedin: { tone: '', frequency: '' },
      },
      noGoZones: profile.noGoZones || [],
      competitiveLandscape: profile.competitiveLandscape || {},
    });
    setIsCreateOpen(true);
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    
    const currentValues = form.getValues();
    const updatedValues = { ...currentValues };
    
    if (tagCategory === 'noGoZones') {
      updatedValues.noGoZones = [...(updatedValues.noGoZones || []), newTag.trim()];
    } else {
      if (!updatedValues.targetAudience) updatedValues.targetAudience = {};
      const categoryArray = updatedValues.targetAudience[tagCategory] || [];
      updatedValues.targetAudience[tagCategory] = [...categoryArray, newTag.trim()];
    }
    
    form.reset(updatedValues);
    setNewTag('');
  };

  const removeTag = (category: string, tag: string) => {
    const currentValues = form.getValues();
    const updatedValues = { ...currentValues };
    
    if (category === 'noGoZones') {
      updatedValues.noGoZones = updatedValues.noGoZones?.filter(t => t !== tag) || [];
    } else {
      if (updatedValues.targetAudience && updatedValues.targetAudience[category as keyof typeof updatedValues.targetAudience]) {
        updatedValues.targetAudience[category as keyof typeof updatedValues.targetAudience] = 
          (updatedValues.targetAudience[category as keyof typeof updatedValues.targetAudience] as string[])?.filter(t => t !== tag) || [];
      }
    }
    
    form.reset(updatedValues);
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
          <h1 className="text-3xl font-bold text-foreground">Client Profiles</h1>
          <p className="text-muted-foreground">Manage brand voice and strategic alignment for clients</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingProfile(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-profile">
              <Plus className="w-4 h-4 mr-2" />
              New Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? 'Edit Client Profile' : 'Create Client Profile'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter client name" {...field} data-testid="input-client-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brandVoice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Voice</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the brand voice and personality" {...field} data-testid="input-brand-voice" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Target Audience & Strategy
                  </h3>
                  
                  <div className="flex gap-2">
                    <Select value={tagCategory} onValueChange={(value: any) => setTagCategory(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demographics">Demographics</SelectItem>
                        <SelectItem value="psychographics">Psychographics</SelectItem>
                        <SelectItem value="behaviors">Behaviors</SelectItem>
                        <SelectItem value="painPoints">Pain Points</SelectItem>
                        <SelectItem value="noGoZones">No-Go Zones</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      data-testid="input-new-tag"
                    />
                    <Button type="button" onClick={addTag} data-testid="button-add-tag">Add</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(['demographics', 'psychographics', 'behaviors', 'painPoints', 'noGoZones'] as const).map((category) => {
                      const tags = category === 'noGoZones' 
                        ? form.watch('noGoZones') || []
                        : form.watch(`targetAudience.${category}`) || [];
                      
                      return (
                        <Card key={category}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm capitalize flex items-center gap-2">
                              {category === 'noGoZones' ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                              {category === 'noGoZones' ? 'No-Go Zones' : category}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-1">
                              {tags.map((tag: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant={category === 'noGoZones' ? 'destructive' : 'secondary'}
                                  className="text-xs cursor-pointer"
                                  onClick={() => removeTag(category, tag)}
                                  data-testid={`tag-${category}-${index}`}
                                >
                                  {tag} ×
                                </Badge>
                              ))}
                              {tags.length === 0 && (
                                <span className="text-xs text-muted-foreground">No {category} added</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Channel Preferences
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(['twitter', 'instagram', 'tiktok', 'linkedin'] as const).map((platform) => (
                      <Card key={platform}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm capitalize">{platform}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <FormField
                            control={form.control}
                            name={`channelPreferences.${platform}.tone`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Tone</FormLabel>
                                <FormControl>
                                  <Input placeholder="Professional, casual, etc." {...field} data-testid={`input-${platform}-tone`} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`channelPreferences.${platform}.frequency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Frequency</FormLabel>
                                <FormControl>
                                  <Input placeholder="Daily, weekly, etc." {...field} data-testid={`input-${platform}-frequency`} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile: ClientProfile) => (
          <Card key={profile.id} className="bg-gradient-surface border-border/50 hover:border-primary/20 transition-smooth">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{profile.name}</CardTitle>
                  <CardDescription className="mt-1">
                    Created {new Date(profile.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(profile)}
                    data-testid={`button-edit-${profile.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(profile.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${profile.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.brandVoice && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Brand Voice</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{profile.brandVoice}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-medium mb-1">Demographics</h4>
                  <p className="text-muted-foreground">
                    {profile.targetAudience?.demographics?.length || 0} tags
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Channels</h4>
                  <p className="text-muted-foreground">
                    {Object.keys(profile.channelPreferences || {}).length} configured
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Pain Points</h4>
                  <p className="text-muted-foreground">
                    {profile.targetAudience?.painPoints?.length || 0} identified
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">No-Go Zones</h4>
                  <p className="text-muted-foreground">
                    {profile.noGoZones?.length || 0} restrictions
                  </p>
                </div>
              </div>

              {profile.targetAudience?.demographics && profile.targetAudience.demographics.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Top Demographics</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.targetAudience.demographics.slice(0, 3).map((demo, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {demo}
                      </Badge>
                    ))}
                    {profile.targetAudience.demographics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.targetAudience.demographics.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {profiles.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Client Profiles</h3>
            <p className="text-muted-foreground mb-4">
              Create your first client profile to start building strategic intelligence
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-profile">
              <Plus className="w-4 h-4 mr-2" />
              Create First Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
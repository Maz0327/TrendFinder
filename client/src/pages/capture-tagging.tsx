import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Eye, 
  Brain, 
  Users, 
  MessageCircle, 
  Lightbulb, 
  Zap, 
  Target, 
  TrendingUp,
  Search,
  Filter,
  Tag,
  Plus,
  Save,
  Wand2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Capture {
  id: string;
  title: string;
  content: string;
  url?: string;
  platform: string;
  type: string;
  dsdTags?: {
    lifeLens?: boolean;
    rawBehavior?: boolean;
    channelVibes?: boolean;
    strategicIntelligence?: boolean;
    humanTruth?: boolean;
    culturalMoment?: boolean;
    creativeTerritory?: boolean;
    executionIdea?: boolean;
    attentionValue?: boolean;
  };
  dsdSection?: 'define' | 'shift' | 'deliver';
  viralScore?: number;
  strategicValue?: number;
  createdAt: string;
  tags?: string[];
}

interface Project {
  id: string;
  name: string;
}

const DSD_TAGS = [
  { key: 'lifeLens', label: 'Life Lens', icon: Eye, description: 'Real-world context and experiences', section: 'define' },
  { key: 'rawBehavior', label: 'Raw Behavior', icon: Users, description: 'Observable actions and patterns', section: 'define' },
  { key: 'channelVibes', label: 'Channel Vibes', icon: MessageCircle, description: 'Platform-specific dynamics', section: 'define' },
  { key: 'strategicIntelligence', label: 'Strategic Intelligence', icon: Brain, description: 'Business implications', section: 'shift' },
  { key: 'humanTruth', label: 'Human Truth', icon: Lightbulb, description: 'Deeper psychological insights', section: 'shift' },
  { key: 'culturalMoment', label: 'Cultural Moment', icon: TrendingUp, description: 'Zeitgeist connections', section: 'shift' },
  { key: 'creativeTerritory', label: 'Creative Territory', icon: Zap, description: 'Creative opportunities', section: 'deliver' },
  { key: 'executionIdea', label: 'Execution Idea', icon: Target, description: 'Actionable concepts', section: 'deliver' },
  { key: 'attentionValue', label: 'Attention Value', icon: Eye, description: 'Attention-grabbing potential', section: 'deliver' },
] as const;

export default function CaptureTagging() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [selectedCaptures, setSelectedCaptures] = useState<Set<string>>(new Set());
  const [bulkTags, setBulkTags] = useState<Record<string, boolean>>({});
  const [bulkSection, setBulkSection] = useState<'define' | 'shift' | 'deliver' | ''>('');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: captures = [], isLoading } = useQuery({
    queryKey: ['/api/captures', selectedProject],
    enabled: !!selectedProject,
  });

  const updateCaptureMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/captures/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/captures'] });
      toast({ title: 'Capture updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update capture', variant: 'destructive' });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (data: { captureIds: string[]; updates: any }) =>
      apiRequest('/api/captures/bulk-update', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/captures'] });
      setSelectedCaptures(new Set());
      setBulkTags({});
      setBulkSection('');
      toast({ title: 'Captures updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update captures', variant: 'destructive' });
    },
  });

  const aiSuggestionMutation = useMutation({
    mutationFn: (captureId: string) =>
      apiRequest(`/api/captures/${captureId}/ai-suggest-tags`, {
        method: 'POST',
      }),
    onSuccess: (data, captureId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/captures'] });
      toast({ 
        title: 'AI suggestions applied',
        description: `Applied ${Object.keys(data.dsdTags).length} suggested tags`
      });
    },
    onError: () => {
      toast({ title: 'Failed to get AI suggestions', variant: 'destructive' });
    },
  });

  const filteredCaptures = captures.filter((capture: Capture) => {
    const matchesSearch = capture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capture.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSection = filterSection === 'all' || capture.dsdSection === filterSection;
    const matchesPlatform = filterPlatform === 'all' || capture.platform === filterPlatform;
    
    return matchesSearch && matchesSection && matchesPlatform;
  });

  const platforms = [...new Set(captures.map((c: Capture) => c.platform))];

  const handleTagChange = (captureId: string, tagKey: string, checked: boolean) => {
    const capture = captures.find((c: Capture) => c.id === captureId);
    if (!capture) return;

    const updatedTags = {
      ...capture.dsdTags,
      [tagKey]: checked,
    };

    // Auto-suggest section based on tags
    let suggestedSection = capture.dsdSection;
    const tag = DSD_TAGS.find(t => t.key === tagKey);
    if (checked && tag && !suggestedSection) {
      suggestedSection = tag.section;
    }

    updateCaptureMutation.mutate({
      id: captureId,
      data: { 
        dsdTags: updatedTags,
        dsdSection: suggestedSection
      },
    });
  };

  const handleSectionChange = (captureId: string, section: 'define' | 'shift' | 'deliver') => {
    updateCaptureMutation.mutate({
      id: captureId,
      data: { dsdSection: section },
    });
  };

  const handleCaptureSelection = (captureId: string, checked: boolean) => {
    const newSelected = new Set(selectedCaptures);
    if (checked) {
      newSelected.add(captureId);
    } else {
      newSelected.delete(captureId);
    }
    setSelectedCaptures(newSelected);
  };

  const handleBulkUpdate = () => {
    if (selectedCaptures.size === 0) return;

    const updates: any = {};
    if (Object.keys(bulkTags).length > 0) {
      updates.dsdTags = bulkTags;
    }
    if (bulkSection) {
      updates.dsdSection = bulkSection;
    }

    bulkUpdateMutation.mutate({
      captureIds: Array.from(selectedCaptures),
      updates,
    });
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'define': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'shift': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'deliver': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getTagsBySection = (section: 'define' | 'shift' | 'deliver') => {
    return DSD_TAGS.filter(tag => tag.section === section);
  };

  if (!selectedProject) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Capture Tagging</h1>
          <p className="text-muted-foreground">Apply DSD tags to organize content for strategic analysis</p>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
            <p className="text-muted-foreground mb-4">
              Choose a project to start tagging captured content
            </p>
            <Select onValueChange={setSelectedProject}>
              <SelectTrigger className="max-w-sm mx-auto">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project: Project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-foreground">Capture Tagging</h1>
          <p className="text-muted-foreground">Apply DSD tags to organize content for strategic analysis</p>
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project: Project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Bulk Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search captures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
                data-testid="input-search-captures"
              />
            </div>
            
            <Select value={filterSection} onValueChange={setFilterSection}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                <SelectItem value="define">Define</SelectItem>
                <SelectItem value="shift">Shift</SelectItem>
                <SelectItem value="deliver">Deliver</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCaptures.size > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">{selectedCaptures.size} captures selected</h4>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="text-sm font-medium mb-2 block">Bulk Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {DSD_TAGS.slice(0, 6).map((tag) => (
                      <label key={tag.key} className="flex items-center gap-1 text-sm">
                        <Checkbox
                          checked={bulkTags[tag.key] || false}
                          onCheckedChange={(checked) => 
                            setBulkTags(prev => ({ ...prev, [tag.key]: checked as boolean }))
                          }
                          data-testid={`bulk-tag-${tag.key}`}
                        />
                        {tag.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Section</label>
                  <Select value={bulkSection} onValueChange={(value: any) => setBulkSection(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Change</SelectItem>
                      <SelectItem value="define">Define</SelectItem>
                      <SelectItem value="shift">Shift</SelectItem>
                      <SelectItem value="deliver">Deliver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleBulkUpdate}
                  disabled={bulkUpdateMutation.isPending}
                  data-testid="button-bulk-update"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Selected
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {filteredCaptures.map((capture: Capture) => (
          <Card key={capture.id} className="bg-gradient-surface border-border/50">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedCaptures.has(capture.id)}
                  onCheckedChange={(checked) => handleCaptureSelection(capture.id, checked as boolean)}
                  data-testid={`select-capture-${capture.id}`}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg line-clamp-1">{capture.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{capture.content}</CardDescription>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{capture.platform}</Badge>
                        {capture.dsdSection && (
                          <Badge className={getSectionColor(capture.dsdSection)}>
                            {capture.dsdSection}
                          </Badge>
                        )}
                        {capture.viralScore && (
                          <Badge variant="outline">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {capture.viralScore}% viral
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => aiSuggestionMutation.mutate(capture.id)}
                      disabled={aiSuggestionMutation.isPending}
                      data-testid={`button-ai-suggest-${capture.id}`}
                    >
                      <Wand2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="define" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger 
                    value="define" 
                    className="flex items-center gap-2"
                    onClick={() => handleSectionChange(capture.id, 'define')}
                  >
                    <Eye className="w-4 h-4" />
                    Define
                  </TabsTrigger>
                  <TabsTrigger 
                    value="shift" 
                    className="flex items-center gap-2"
                    onClick={() => handleSectionChange(capture.id, 'shift')}
                  >
                    <Brain className="w-4 h-4" />
                    Shift
                  </TabsTrigger>
                  <TabsTrigger 
                    value="deliver" 
                    className="flex items-center gap-2"
                    onClick={() => handleSectionChange(capture.id, 'deliver')}
                  >
                    <Zap className="w-4 h-4" />
                    Deliver
                  </TabsTrigger>
                </TabsList>

                {(['define', 'shift', 'deliver'] as const).map((section) => (
                  <TabsContent key={section} value={section}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {getTagsBySection(section).map((tag) => {
                        const Icon = tag.icon;
                        const isChecked = capture.dsdTags?.[tag.key] || false;
                        
                        return (
                          <Card 
                            key={tag.key}
                            className={`cursor-pointer transition-all hover:border-primary/20 ${
                              isChecked ? 'border-primary bg-primary/5' : ''
                            }`}
                            onClick={() => handleTagChange(capture.id, tag.key, !isChecked)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={isChecked}
                                  onChange={() => {}}
                                  data-testid={`tag-${capture.id}-${tag.key}`}
                                />
                                <Icon className="w-4 h-4 text-primary" />
                                <div>
                                  <p className="font-medium text-sm">{tag.label}</p>
                                  <p className="text-xs text-muted-foreground">{tag.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCaptures.length === 0 && captures.length > 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Matching Captures</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}

      {captures.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Captures Found</h3>
            <p className="text-muted-foreground">
              Add some captures to this project to start tagging
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
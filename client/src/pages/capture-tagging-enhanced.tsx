import PageLayout from "@/components/layout/PageLayout";
import StrategicCard from "@/components/dashboard/StrategicCard";
import StatsOverview from "@/components/dashboard/StatsOverview";
import StrategicModal from "@/components/dashboard/StrategicModal";
import { FadeIn, StaggeredFadeIn } from "@/components/ui/fade-in";
import { LoadingCard } from "@/components/ui/loading-spinner";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag, Filter, Search, Plus, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CaptureTaggingEnhanced() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [selectedCapture, setSelectedCapture] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isNewCaptureDialogOpen, setIsNewCaptureDialogOpen] = useState(false);

  // Fetch captures
  const { data: captures = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/captures'],
    queryFn: async () => {
      const response = await fetch('/api/captures', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch captures');
      return response.json();
    }
  });

  // Update capture mutation
  const updateCaptureMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await fetch(`/api/captures/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update capture');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/captures'] });
      toast({ title: "Success", description: "Capture updated successfully" });
    }
  });

  // Create capture mutation
  const createCaptureMutation = useMutation({
    mutationFn: async (newCapture: { title: string; url?: string; notes?: string }) => {
      const response = await fetch('/api/captures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newCapture)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create capture');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/captures'] });
      toast({ title: "Success", description: "New capture created." });
      setIsNewCaptureDialogOpen(false); // Close dialog on success
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const dsdTags = [
    "life-lens", "raw-behavior", "channel-vibes", "cultural-moment", 
    "strategic-signal", "competitive-intel", "trend-forecast", "audience-insight"
  ];

  const addTag = (captureId: string, tag: string) => {
    const capture = captures.find((c: any) => c.id === captureId);
    if (!capture) return;
    
    const currentTags = capture.dsdTags || [];
    if (!currentTags.includes(tag)) {
      updateCaptureMutation.mutate({
        id: captureId,
        updates: { dsdTags: [...currentTags, tag] }
      });
    }
  };

  const removeTag = (captureId: string, tag: string) => {
    const capture = captures.find((c: any) => c.id === captureId);
    if (!capture) return;
    
    const currentTags = capture.dsdTags || [];
    updateCaptureMutation.mutate({
      id: captureId,
      updates: { dsdTags: currentTags.filter((t: string) => t !== tag) }
    });
  };

  const assignToSection = (captureId: string, sectionName: string) => {
    updateCaptureMutation.mutate({
      id: captureId,
      updates: { dsdSection: sectionName }
    });
  };

  // Filter captures based on search and filters
  const filteredCaptures = captures.filter((capture: any) => {
    const matchesSearch = searchQuery === "" || 
      capture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capture.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlatform = filterPlatform === "all" || capture.platform === filterPlatform;
    const matchesSection = filterSection === "all" || capture.dsdSection === filterSection;
    
    return matchesSearch && matchesPlatform && matchesSection;
  });

  const platforms = [...new Set(captures.map((c: any) => c.platform))] as string[];

  return (
    <PageLayout 
      title="DSD Signal Capture & Tagging" 
      description="Apply DSD tags and organize captures into strategic sections for automated brief assembly"
      onRefresh={() => refetch()}
    >
      <div className="space-y-6">
        {/* Filters Section */}
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filter & Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search captures..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    {platforms.map((platform: string) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterSection} onValueChange={setFilterSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    <SelectItem value="define">Define</SelectItem>
                    <SelectItem value="shift">Shift</SelectItem>
                    <SelectItem value="deliver">Deliver</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Auto-Tag</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Stats Overview */}
        <StatsOverview
          variant="strategic"
          stats={{
            totalTrends: captures.length,
            viralPotential: Math.round(captures.reduce((acc: number, c: any) => acc + (c.viralScore || 0), 0) / captures.length || 0),
            activeSources: platforms.length,
            avgScore: 8.5,
            truthAnalyzed: captures.filter((c: any) => c.truthAnalysis).length,
            hypothesesTracked: captures.filter((c: any) => c.dsdSection).length
          }}
        />

        {/* Captures Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Captured Signals ({filteredCaptures.length})
            </h3>
            <Button variant="outline" size="sm" onClick={() => setIsNewCaptureDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Capture
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : filteredCaptures.length === 0 ? (
            <FadeIn>
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-muted-foreground">
                    {searchQuery || filterPlatform !== "all" || filterSection !== "all" 
                      ? "No captures match your filters" 
                      : "No captures found. Start by adding some content to analyze."
                    }
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ) : (
            <StaggeredFadeIn
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              staggerDelay={50}
            >
              {filteredCaptures.map((capture: any) => (
                <div key={capture.id} className="relative group">
                  <StrategicCard
                    capture={capture}
                    onClick={() => {
                      setSelectedCapture(capture);
                      setModalOpen(true);
                    }}
                    variant="capture"
                  />
                  
                  {/* Tagging Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-end p-4 space-y-2">
                    {/* DSD Tags */}
                    <div className="flex flex-wrap gap-1">
                      {(capture.dsdTags || []).map((tag: string) => (
                        <Badge 
                          key={tag} 
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeTag(capture.id, tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                    
                    <Select onValueChange={(tag) => addTag(capture.id, tag)}>
                      <SelectTrigger className="w-full bg-white/90">
                        <SelectValue placeholder="Add DSD tag..." />
                      </SelectTrigger>
                      <SelectContent>
                        {dsdTags.map(tag => (
                          <SelectItem key={tag} value={tag}>
                            {tag.replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Section Assignment */}
                    <div className="flex space-x-1">
                      {['define', 'shift', 'deliver'].map(sectionName => (
                        <Button
                          key={sectionName}
                          variant={capture.dsdSection === sectionName ? "default" : "outline"}
                          size="sm"
                          onClick={() => assignToSection(capture.id, sectionName)}
                          className="flex-1 text-xs"
                        >
                          {sectionName}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </StaggeredFadeIn>
          )}
        </div>
      </div>
      
      {/* Strategic Modal */}
      <StrategicModal
        capture={selectedCapture}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCapture(null);
        }}
      />

      <NewCaptureDialog
        isOpen={isNewCaptureDialogOpen}
        onClose={() => setIsNewCaptureDialogOpen(false)}
        createCapture={createCaptureMutation.mutate}
        isCreating={createCaptureMutation.isPending}
      />
    </PageLayout>
  );
}

function NewCaptureDialog({
  isOpen,
  onClose,
  createCapture,
  isCreating,
}: {
  isOpen: boolean;
  onClose: () => void;
  createCapture: (vars: { title: string; url?: string; notes?: string }) => void;
  isCreating: boolean;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = () => {
    if (!title) {
      // Basic validation
      alert("Title is required.");
      return;
    }
    createCapture({ title, url, notes });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Capture</DialogTitle>
          <DialogDescription>
            Manually add a new signal or piece of content for analysis.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 'New AI Trend on Twitter'"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="col-span-3"
              placeholder="https://example.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="Initial thoughts, context, or why this is interesting..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Capture"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
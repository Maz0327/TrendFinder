import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn, StaggeredFadeIn } from "@/components/ui/fade-in";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Archive, 
  Trash2, 
  Plus, 
  FileText, 
  Image, 
  Link, 
  Calendar,
  FolderOpen,
  Tag,
  Copy,
  ExternalLink,
  Brain,
  Loader2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Zap,
  Target,
  Lightbulb
} from "lucide-react";

interface CaptureItem {
  id: string;
  title: string;
  content: string;
  url?: string;
  type: 'text' | 'image' | 'link';
  projectId: string;
  projectName: string;
  notes?: string;
  customCopy?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // AI Analysis Fields
  analysisStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  truthAnalysis?: {
    fact: string;
    observation: string;
    insight: string;
    humanTruth: string;
    culturalMoment?: string;
    strategicValue: number;
    viralPotential: number;
    briefSectionSuggestion: 'define' | 'shift' | 'deliver';
    keywords: string[];
    tone: string;
    confidence: number;
  };
  visualAnalysis?: {
    brandElements: string[];
    culturalMoments: string[];
    competitiveInsights: string[];
    strategicRecommendations: string[];
    visualScore: number;
    confidenceScore: number;
  };
  strategicValue?: number;
  viralPotential?: number;
  confidenceScore?: number;
}

interface Project {
  id: string;
  name: string;
  description?: string;
}

export default function MyCaptures() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCapture, setSelectedCapture] = useState<CaptureItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editCustomCopy, setEditCustomCopy] = useState("");
  const [editTags, setEditTags] = useState("");
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [analysisCapture, setAnalysisCapture] = useState<CaptureItem | null>(null);

  // Fetch projects for filtering
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Fetch all captures
  const { data: captures = [], isLoading: capturesLoading, refetch } = useQuery({
    queryKey: ["/api/captures/all"],
    queryFn: async () => {
      const response = await fetch("/api/captures/all");
      if (!response.ok) throw new Error("Failed to fetch captures");
      return response.json();
    },
  });

  // Update capture mutation
  const updateCaptureMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CaptureItem> }) => {
      const response = await fetch(`/api/captures/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update capture");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Capture updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/captures/all"] });
      setIsEditDialogOpen(false);
      setSelectedCapture(null);
    },
  });

  // Delete capture mutation
  const deleteCaptureMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/captures/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete capture");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Capture deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/captures/all"] });
    },
  });

  // Filter captures based on search and filters
  const filteredCaptures = captures.filter((capture: CaptureItem) => {
    const matchesSearch = capture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         capture.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         capture.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         capture.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesProject = selectedProject === "all" || capture.projectId === selectedProject;
    const matchesType = selectedType === "all" || capture.type === selectedType;
    
    return matchesSearch && matchesProject && matchesType;
  });

  const handleEditCapture = (capture: CaptureItem) => {
    setSelectedCapture(capture);
    setEditNotes(capture.notes || "");
    setEditCustomCopy(capture.customCopy || "");
    setEditTags(capture.tags.join(", "));
    setIsEditDialogOpen(true);
  };

  const handleViewAnalysis = (capture: CaptureItem) => {
    setAnalysisCapture(capture);
    setIsAnalysisDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedCapture) return;
    
    updateCaptureMutation.mutate({
      id: selectedCapture.id,
      updates: {
        notes: editNotes,
        customCopy: editCustomCopy,
        tags: editTags.split(",").map(tag => tag.trim()).filter(Boolean),
      },
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    } catch (error) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'link': return <Link className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-purple-100 text-purple-800';
      case 'link': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout 
      title="My Captures" 
      description="Organize, annotate, and prepare your captured content for strategic briefs"
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search captures, notes, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Project Filter */}
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project: Project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full lg:w-32">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Captures Display */}
        {capturesLoading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-fade-in">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredCaptures.length === 0 ? (
          <FadeIn>
            <Card>
              <CardContent className="py-16 text-center">
                <div className="animate-pulse-scale mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No captures found</h3>
                <p className="text-sm text-gray-500">
                  {searchQuery || selectedProject !== "all" || selectedType !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start capturing content to see it organized here"}
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <StaggeredFadeIn 
            staggerDelay={50}
            className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}
          >
            {filteredCaptures.map((capture: CaptureItem) => (
              <Card key={capture.id} className="hover-lift cursor-pointer transition-all duration-200 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(capture.type)}>
                        {getTypeIcon(capture.type)}
                        <span className="ml-1 capitalize">{capture.type}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <FolderOpen className="h-3 w-3 mr-1" />
                        {capture.projectName}
                      </Badge>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditCapture(capture)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Notes
                        </DropdownMenuItem>
                        {capture.truthAnalysis && (
                          <DropdownMenuItem onClick={() => handleViewAnalysis(capture)}>
                            <Brain className="h-4 w-4 mr-2" />
                            View AI Analysis
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => copyToClipboard(capture.content)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Content
                        </DropdownMenuItem>
                        {capture.url && (
                          <DropdownMenuItem onClick={() => window.open(capture.url, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Link
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => deleteCaptureMutation.mutate(capture.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {capture.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {capture.content}
                  </p>

                  {capture.notes && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-md">
                      <p className="text-xs text-blue-700 font-medium">Notes:</p>
                      <p className="text-sm text-blue-600 line-clamp-2">{capture.notes}</p>
                    </div>
                  )}

                  {capture.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {capture.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {capture.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{capture.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* AI Analysis Status */}
                  <div className="flex items-center gap-2 mb-2">
                    {capture.analysisStatus === 'pending' && (
                      <Badge variant="secondary" className="text-xs">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Analysis Queued
                      </Badge>
                    )}
                    {capture.analysisStatus === 'processing' && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Processing
                      </Badge>
                    )}
                    {capture.analysisStatus === 'completed' && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Analysis Complete
                      </Badge>
                    )}
                    {capture.analysisStatus === 'failed' && (
                      <Badge variant="destructive" className="text-xs">
                        <XCircle className="h-3 w-3 mr-1" />
                        Analysis Failed
                      </Badge>
                    )}

                    {/* Strategic Scores */}
                    {capture.strategicValue && (
                      <Badge variant="outline" className="text-xs">
                        <Target className="h-3 w-3 mr-1" />
                        Strategic: {capture.strategicValue}/10
                      </Badge>
                    )}
                    {capture.viralPotential && (
                      <Badge variant="outline" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Viral: {capture.viralPotential}/10
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(capture.createdAt).toLocaleDateString()}
                    </div>
                    {capture.customCopy && (
                      <Badge variant="outline" className="text-xs">
                        Custom Copy
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </StaggeredFadeIn>
        )}
      </div>

      {/* Edit Capture Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Capture</DialogTitle>
            <DialogDescription>
              Add notes, custom copy, and tags to organize this capture
            </DialogDescription>
          </DialogHeader>
          
          {selectedCapture && (
            <div className="space-y-4">
              {/* Original Content Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Original Content</h4>
                <p className="text-sm text-gray-600 line-clamp-3">{selectedCapture.content}</p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add your strategic notes and insights..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Custom Copy */}
              <div className="space-y-2">
                <Label htmlFor="customCopy">Custom Copy</Label>
                <Textarea
                  id="customCopy"
                  placeholder="Create custom copy variations for this content..."
                  value={editCustomCopy}
                  onChange={(e) => setEditCustomCopy(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="trend, insight, competitor, viral (comma-separated)"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={updateCaptureMutation.isPending}
              className="hover-lift"
            >
              {updateCaptureMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Details Dialog */}
      <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Strategic Analysis
            </DialogTitle>
            <DialogDescription>
              {analysisCapture?.title}
            </DialogDescription>
          </DialogHeader>

          {analysisCapture?.truthAnalysis && (
            <div className="space-y-6">
              {/* Strategic Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Strategic Value</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisCapture.truthAnalysis.strategicValue}/10
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Viral Potential</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {analysisCapture.truthAnalysis.viralPotential}/10
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold">Confidence</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisCapture.truthAnalysis.confidence}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Truth Analysis Framework */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Truth Analysis Framework</h3>
                
                <div className="grid gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-blue-600">FACT</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm">{analysisCapture.truthAnalysis.fact}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-green-600">OBSERVATION</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm">{analysisCapture.truthAnalysis.observation}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-orange-600">INSIGHT</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm">{analysisCapture.truthAnalysis.insight}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-purple-600">HUMAN TRUTH</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm">{analysisCapture.truthAnalysis.humanTruth}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Strategic Intelligence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Strategic Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisCapture.truthAnalysis.keywords?.map((keyword, index) => (
                      <Badge key={index} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Brief Section Suggestion</h4>
                  <Badge variant="default" className="capitalize">
                    {analysisCapture.truthAnalysis.briefSectionSuggestion}
                  </Badge>
                </div>

                {analysisCapture.truthAnalysis.culturalMoment && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold mb-3">Cultural Moment</h4>
                    <p className="text-sm text-gray-600">{analysisCapture.truthAnalysis.culturalMoment}</p>
                  </div>
                )}
              </div>

              {/* Visual Analysis (if available) */}
              {analysisCapture.visualAnalysis && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Visual Intelligence</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Brand Elements</h4>
                      <ul className="space-y-1">
                        {analysisCapture.visualAnalysis.brandElements?.map((element, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            {element}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Cultural Moments</h4>
                      <ul className="space-y-1">
                        {analysisCapture.visualAnalysis.culturalMoments?.map((moment, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            {moment}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Competitive Insights</h4>
                      <ul className="space-y-1">
                        {analysisCapture.visualAnalysis.competitiveInsights?.map((insight, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-orange-500">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Strategic Recommendations</h4>
                      <ul className="space-y-1">
                        {analysisCapture.visualAnalysis.strategicRecommendations?.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-purple-500">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!analysisCapture?.truthAnalysis && (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No analysis results available yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Analysis may still be processing or failed to complete.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsAnalysisDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
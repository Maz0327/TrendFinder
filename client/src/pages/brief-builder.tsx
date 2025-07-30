import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import PageLayout from "@/components/layout/PageLayout";
import { 
  FileText, 
  Download, 
  Save, 
  Sparkles, 
  GripVertical, 
  Plus, 
  Trash2,
  ChevronRight,
  Image,
  Link,
  MessageSquare,
  Target,
  Users,
  Lightbulb,
  TrendingUp,
  Globe,
  Brain
} from "lucide-react";

// Brief sections based on Jimmy John's format
const BRIEF_SECTIONS = [
  { 
    id: 'performance', 
    title: 'Performance', 
    icon: TrendingUp,
    description: 'Key metrics and results that matter',
    placeholder: 'What success metrics or performance indicators support this brief?'
  },
  { 
    id: 'cultural-signals', 
    title: 'Cultural Signals', 
    icon: Globe,
    description: 'Emerging cultural trends and behaviors',
    placeholder: 'What cultural shifts or behavioral changes are we seeing?'
  },
  { 
    id: 'platform-signals', 
    title: 'Platform Signals', 
    icon: MessageSquare,
    description: 'Platform-specific trends and features',
    placeholder: 'What platform-specific trends or features are relevant?'
  },
  { 
    id: 'opportunities', 
    title: 'Opportunities', 
    icon: Target,
    description: 'Strategic opportunities to pursue',
    placeholder: 'What opportunities can the brand capitalize on?'
  },
  { 
    id: 'cohorts', 
    title: 'Cohorts', 
    icon: Users,
    description: 'Target audience segments',
    placeholder: 'Who are the key audience segments for this campaign?'
  },
  { 
    id: 'ideation', 
    title: 'Ideation', 
    icon: Lightbulb,
    description: 'Creative concepts and ideas',
    placeholder: 'What creative ideas can bring this strategy to life?'
  }
];

interface CaptureItem {
  id: string;
  title: string;
  content: string;
  type: string;
  sourceUrl: string;
  platform?: string;
  truthAnalysis?: any;
  thumbnail?: string;
}

interface BriefSection {
  id: string;
  content: string;
  captures: string[]; // Array of capture IDs
}

export default function BriefBuilder() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [briefTitle, setBriefTitle] = useState("");
  const [briefDescription, setBriefDescription] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [briefSections, setBriefSections] = useState<Record<string, BriefSection>>(
    BRIEF_SECTIONS.reduce((acc, section) => ({
      ...acc,
      [section.id]: { id: section.id, content: "", captures: [] }
    }), {})
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Fetch captures for selected project
  const { data: captures = [], isLoading: capturesLoading } = useQuery({
    queryKey: ["/api/captures", selectedProject],
    enabled: !!selectedProject,
  });

  // Available captures (not assigned to any section)
  const availableCaptures = (captures as CaptureItem[]).filter((capture) => 
    !Object.values(briefSections).some(section => 
      section.captures.includes(capture.id)
    )
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which section the capture is being dropped into
    const targetSection = BRIEF_SECTIONS.find(s => s.id === overId);
    if (targetSection) {
      setBriefSections(prev => ({
        ...prev,
        [targetSection.id]: {
          ...prev[targetSection.id],
          captures: [...prev[targetSection.id].captures, activeId]
        }
      }));
    }

    setActiveId(null);
  };

  const removeCapture = (sectionId: string, captureId: string) => {
    setBriefSections(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        captures: prev[sectionId].captures.filter(id => id !== captureId)
      }
    }));
  };

  const updateSectionContent = (sectionId: string, content: string) => {
    setBriefSections(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        content
      }
    }));
  };

  const generateBriefWithAI = async () => {
    if (!selectedProject || !briefTitle) {
      toast({
        title: "Missing information",
        description: "Please select a project and add a brief title",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/briefs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          title: briefTitle,
          description: briefDescription,
          sections: briefSections,
          captures: (captures as CaptureItem[]).filter((c) => 
            Object.values(briefSections).some(s => s.captures.includes(c.id))
          )
        })
      });

      if (!response.ok) throw new Error("Failed to generate brief");
      
      const result = await response.json();
      
      // Update sections with AI-generated content
      setBriefSections(result.sections);
      
      toast({
        title: "Brief generated!",
        description: "AI has enhanced your brief with strategic insights"
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate brief content",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveBrief = async () => {
    if (!selectedProject || !briefTitle) {
      toast({
        title: "Missing information",
        description: "Please select a project and add a brief title",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          title: briefTitle,
          description: briefDescription,
          sections: briefSections,
          template: "jimmy-johns"
        })
      });

      if (!response.ok) throw new Error("Failed to save brief");
      
      toast({
        title: "Brief saved!",
        description: "Your strategic brief has been saved successfully"
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/briefs"] });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save brief",
        variant: "destructive"
      });
    }
  };

  const exportBrief = async (format: 'markdown' | 'pdf' | 'slides') => {
    try {
      const response = await fetch(`/api/briefs/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          title: briefTitle,
          description: briefDescription,
          sections: briefSections,
          captures: (captures as CaptureItem[]).filter((c) => 
            Object.values(briefSections).some(s => s.captures.includes(c.id))
          )
        })
      });

      if (!response.ok) throw new Error("Failed to export brief");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${briefTitle.replace(/\s+/g, '-')}.${format === 'slides' ? 'pptx' : format}`;
      a.click();
      
      toast({
        title: "Export successful!",
        description: `Brief exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: `Failed to export brief as ${format}`,
        variant: "destructive"
      });
    }
  };

  const activeCapture = activeId ? (captures as CaptureItem[]).find((c) => c.id === activeId) : null;

  return (
    <PageLayout 
      title="Brief Builder" 
      description="Create strategic briefs using the Define → Shift → Deliver methodology"
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {(projects as any[]).map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 lg:col-span-2">
                <Label>Brief Title</Label>
                <Input
                  placeholder="Enter brief title..."
                  value={briefTitle}
                  onChange={(e) => setBriefTitle(e.target.value)}
                />
              </div>
              
              <div className="flex items-end gap-2">
                <Button onClick={saveBrief} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowExportDialog(true)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <Label>Brief Description</Label>
              <Textarea
                placeholder="Describe the strategic context and objectives..."
                value={briefDescription}
                onChange={(e) => setBriefDescription(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Builder Interface */}
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Available Captures */}
          <Card className="h-[calc(100vh-300px)]">
            <CardHeader>
              <CardTitle className="text-sm">Available Captures</CardTitle>
              <CardDescription>
                Drag captures to brief sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-400px)]">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <div className="space-y-2">
                    {availableCaptures.map((capture: CaptureItem) => (
                      <DraggableCapture key={capture.id} capture={capture} />
                    ))}
                  </div>
                  
                  <DragOverlay>
                    {activeCapture && (
                      <div className="bg-white border rounded-lg p-3 shadow-lg opacity-90">
                        <div className="font-medium text-sm truncate">
                          {activeCapture.title}
                        </div>
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Brief Sections */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Brief Sections</CardTitle>
                  <CardDescription>
                    Organize captures into strategic sections
                  </CardDescription>
                </div>
                <Button 
                  onClick={generateBriefWithAI}
                  disabled={isGenerating}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={BRIEF_SECTIONS[0].id}>
                <TabsList className="grid grid-cols-3 lg:grid-cols-6">
                  {BRIEF_SECTIONS.map(section => {
                    const Icon = section.icon;
                    return (
                      <TabsTrigger key={section.id} value={section.id}>
                        <Icon className="h-4 w-4" />
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                
                {BRIEF_SECTIONS.map(section => (
                  <TabsContent key={section.id} value={section.id}>
                    <BriefSectionEditor
                      section={section}
                      briefSection={briefSections[section.id]}
                      captures={(captures as CaptureItem[]).filter((c) => 
                        briefSections[section.id].captures.includes(c.id)
                      )}
                      onUpdateContent={(content) => updateSectionContent(section.id, content)}
                      onRemoveCapture={(captureId) => removeCapture(section.id, captureId)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Brief</DialogTitle>
            <DialogDescription>
              Choose your preferred export format
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                exportBrief('markdown');
                setShowExportDialog(false);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as Markdown
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                exportBrief('pdf');
                setShowExportDialog(false);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                exportBrief('slides');
                setShowExportDialog(false);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as Slides
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

// Draggable Capture Component
function DraggableCapture({ capture }: { capture: CaptureItem }) {
  return (
    <div
      draggable
      className="bg-white border rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-gray-400 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{capture.title}</div>
          <div className="text-xs text-gray-500 truncate">{capture.platform || 'Web'}</div>
          {capture.truthAnalysis?.humanTruth && (
            <div className="text-xs text-indigo-600 mt-1">
              <Brain className="h-3 w-3 inline mr-1" />
              Has Truth Analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Brief Section Editor Component
function BriefSectionEditor({
  section,
  briefSection,
  captures,
  onUpdateContent,
  onRemoveCapture
}: {
  section: any;
  briefSection: BriefSection;
  captures: CaptureItem[];
  onUpdateContent: (content: string) => void;
  onRemoveCapture: (captureId: string) => void;
}) {
  const Icon = section.icon;
  
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-gray-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium">{section.title}</h3>
          <p className="text-sm text-gray-500">{section.description}</p>
        </div>
      </div>
      
      <Textarea
        placeholder={section.placeholder}
        value={briefSection.content}
        onChange={(e) => onUpdateContent(e.target.value)}
        rows={4}
        className="resize-none"
      />
      
      {captures.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">Attached Captures</Label>
          <div className="space-y-2">
            {captures.map(capture => (
              <div
                key={capture.id}
                className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{capture.title}</div>
                  {capture.truthAnalysis?.humanTruth && (
                    <div className="text-xs text-indigo-600 mt-0.5">
                      Truth: {capture.truthAnalysis.humanTruth}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveCapture(capture.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
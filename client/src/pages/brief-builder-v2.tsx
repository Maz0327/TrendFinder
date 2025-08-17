// client/src/pages/brief-builder-v2.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PreBriefReview } from "@/components/briefs/PreBriefReview";
import { exportBriefToSlides } from "../services/briefs";

interface Capture {
  id: string;
  title: string;
  summary?: string;
  ai_analysis?: {
    summary?: string;
    key_insights?: string[];
  };
  metadata?: {
    image_url?: string;
  };
}

export default function BriefBuilderV2() {
  const [selectedCaptures, setSelectedCaptures] = useState<Capture[]>([]);
  const [showPreBriefReview, setShowPreBriefReview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Mock data for development - in real app this would come from API
  const mockCaptures: Capture[] = [
    {
      id: '1',
      title: 'TikTok Trend Analysis',
      summary: 'Viral dance trend spreading across platforms',
      ai_analysis: {
        summary: 'High engagement content with cross-platform potential',
        key_insights: ['Gen Z adoption', 'Brand opportunity', 'Viral coefficient 8.5']
      },
      metadata: { image_url: 'https://example.com/image1.jpg' }
    },
    {
      id: '2', 
      title: 'Brand Response Strategy',
      summary: 'Corporate social media engagement patterns',
      ai_analysis: {
        summary: 'Authentic brand voice resonating with audiences',
        key_insights: ['Increased engagement', 'Positive sentiment', 'Cultural relevance']
      }
    }
  ];

  useEffect(() => {
    // Auto-select mock captures for demo
    setSelectedCaptures(mockCaptures);
  }, []);

  const handleExportToSlides = async (options: { title: string; outline: any[] }) => {
    setIsExporting(true);
    
    try {
      toast({
        title: "Preparing brief...",
        description: "Creating your Google Slides presentation"
      });

      const result = await exportBriefToSlides('mock-brief-id', { templateId: 'default' });

      toast({
        title: "Export successful!",
        description: `Your brief is ready: ${result.slideUrl}`,
      });

      // Open the slides in a new tab
      window.open(result.slideUrl, '_blank');
      
    } catch (error: any) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: error.message || "Failed to export to Google Slides",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setShowPreBriefReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brief Builder V2</h1>
          <p className="text-muted-foreground mt-1">
            Create strategic intelligence briefs from analyzed captures
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={() => setShowPreBriefReview(true)}
            disabled={selectedCaptures.length === 0 || isExporting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isExporting ? "Exporting..." : "Export to Slides"}
          </Button>
        </div>
      </div>

      {/* Selected Captures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Selected Captures
            <Badge variant="secondary">{selectedCaptures.length}</Badge>
          </CardTitle>
          <CardDescription>
            These captures will be included in your strategic brief
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedCaptures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No captures selected</p>
              <p className="text-sm mt-1">Go to Captures Inbox to select and analyze content</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {selectedCaptures.map((capture) => (
                <div key={capture.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{capture.title}</h4>
                    {capture.ai_analysis?.summary && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {capture.ai_analysis.summary}
                      </p>
                    )}
                    {capture.ai_analysis?.key_insights && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {capture.ai_analysis.key_insights.slice(0, 3).map((insight, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {insight}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {capture.metadata?.image_url && (
                    <Badge variant="outline" className="text-xs">📷</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DSD Framework Preview */}
      <Card>
        <CardHeader>
          <CardTitle>DSD Framework Preview</CardTitle>
          <CardDescription>Define → Shift → Deliver structure for your brief</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-2">DEFINE</h4>
              <p className="text-sm text-muted-foreground">Current market reality, audience insights, and foundational data</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-green-600 mb-2">SHIFT</h4>
              <p className="text-sm text-muted-foreground">Strategic pivots, emerging opportunities, and market movements</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-purple-600 mb-2">DELIVER</h4>
              <p className="text-sm text-muted-foreground">Actionable recommendations and implementation roadmap</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-Brief Review Modal */}
      <PreBriefReview
        open={showPreBriefReview}
        onOpenChange={setShowPreBriefReview}
        captures={selectedCaptures}
        onConfirm={handleExportToSlides}
        onCancel={() => setShowPreBriefReview(false)}
      />
    </div>
  );
}
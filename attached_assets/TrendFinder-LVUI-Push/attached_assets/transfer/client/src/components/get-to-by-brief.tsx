import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Target, Users, Zap } from "lucide-react";
import type { Signal } from "@shared/schema";

interface GetToByBriefProps {
  selectedSignals?: Signal[];
}

export function GetToByBrief({ selectedSignals = [] }: GetToByBriefProps) {
  const [briefTitle, setBriefTitle] = useState("");
  const [defineStatement, setDefineStatement] = useState("");
  const [shiftStatement, setShiftStatement] = useState("");
  const [deliverStatement, setDeliverStatement] = useState("");
  const [cohorts, setCohorts] = useState("");
  const [strategy, setStrategy] = useState("");
  const [briefFormat, setBriefFormat] = useState<'markdown' | 'text'>('markdown');
  const { toast } = useToast();

  const generateGetToByBrief = () => {
    if (!briefTitle || !defineStatement || !shiftStatement || !deliverStatement) {
      toast({
        title: "Incomplete Brief",
        description: "Please fill in all Define → Shift → Deliver statements",
        variant: "destructive",
      });
      return;
    }

    // Generate insights from signals
    const insights = selectedSignals.map(signal => {
      return `### ${signal.title || 'Untitled Signal'}

**Human Truth:** ${signal.humanTruth || 'Not identified'}
**Cultural Moment:** ${signal.culturalMoment || 'Not identified'}
**Attention Value:** ${signal.attentionValue || 'Unknown'}
**Platform Context:** ${signal.platformContext || 'Not specified'}

**Key Insights:**
- Fact: ${signal.truthFact || 'Not identified'}
- Observation: ${signal.truthObservation || 'Not identified'}  
- Insight: ${signal.truthInsight || 'Not identified'}

**Cohort Opportunities:** ${Array.isArray(signal.cohortSuggestions) ? signal.cohortSuggestions.join(', ') : 'None identified'}
**Competitive Intelligence:** ${Array.isArray(signal.competitiveInsights) ? signal.competitiveInsights.join(', ') : 'None identified'}

---`;
    }).join('\n\n');

    const generatedContent = `# ${briefTitle}

*Strategic Brief - Generated ${new Date().toLocaleDateString()}*

## Executive Summary

This brief leverages **${selectedSignals.length} validated signals** to create a strategic framework using the Define → Shift → Deliver methodology. These insights represent curated content that has progressed through our validation pipeline from capture to strategic intelligence.

## Strategic Framework

### 🎯 Define
**Who are we speaking to?**
${defineStatement}

### 🚀 Shift  
**What change are we looking for?**
${shiftStatement}

### ⚡ Deliver
**How do we make it happen?**
${deliverStatement}

## Supporting Intelligence

${insights}

## Strategic Cohorts

${cohorts || 'Primary cohorts to be defined based on signal analysis above.'}

## Strategic Recommendations

Based on the analyzed signals and Define → Shift → Deliver framework:

1. **Immediate Actions:** Focus on signals with high attention value and positive sentiment
2. **Audience Strategy:** Target the identified cohorts with contextual messaging
3. **Platform Strategy:** Leverage platforms where attention is currently underpriced
4. **Content Strategy:** Create content that addresses the human truths identified
5. **Measurement Strategy:** Track behavior change indicators defined in the Shift statement

## Implementation Roadmap

**Phase 1 (Week 1-2):** Validate Define statement through research and cohort analysis
**Phase 2 (Week 3-4):** Test Deliver proposition with high-confidence signals
**Phase 3 (Week 5-8):** Scale successful approaches across all identified cohorts
**Phase 4 (Week 9-12):** Measure Shift outcomes and iterate

## Cultural Context & Timing

The signals analyzed reveal cultural moments that provide strategic timing opportunities:
${selectedSignals.map(s => `- ${s.culturalMoment || 'Cultural context not identified'}`).join('\n')}

## Success Metrics

- **Attention Metrics:** Engagement rates, share rates, viral coefficient
- **Behavior Metrics:** Conversion rates aligned with TO statement
- **Cultural Metrics:** Brand relevance and conversation participation

---

*Brief generated from ${selectedSignals.length} validated signals using GET → TO → BY framework*`;

    return generatedContent;
  };

  const handleExportBrief = () => {
    const content = generateGetToByBrief();
    if (!content) return;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${briefTitle || 'strategic-brief'}-get-to-by.${briefFormat === 'markdown' ? 'md' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Brief Exported",
      description: "Your Define → Shift → Deliver brief has been downloaded",
    });
  };

  // Extract cohort suggestions from signals
  const allCohorts = selectedSignals.flatMap(s => s.cohortSuggestions || []);
  const uniqueCohorts = Array.from(new Set(allCohorts));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Define → Shift → Deliver Strategic Brief Builder
          </CardTitle>
          <p className="text-sm text-gray-600">
            Create strategic briefs using the proven Define → Shift → Deliver framework
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brief Title */}
          <div>
            <Label htmlFor="brief-title">Brief Title</Label>
            <Input
              id="brief-title"
              placeholder="Enter strategic brief title..."
              value={briefTitle}
              onChange={(e) => setBriefTitle(e.target.value)}
            />
          </div>

          {/* Define Statement */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Define - Who are we speaking to?
            </Label>
            <Textarea
              placeholder="Who are we talking to? What is their current behavior and mindset? What tension are we addressing?"
              value={defineStatement}
              onChange={(e) => setDefineStatement(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Define the target audience, their current behavior, and the tension we need to solve for.
            </p>
          </div>

          {/* Shift Statement */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Shift - What change are we looking for?
            </Label>
            <Textarea
              placeholder="What do we want them to think, feel, or do? What behavior do we want to change?"
              value={shiftStatement}
              onChange={(e) => setShiftStatement(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Specify the desired response, behavior change, or action we want the audience to take.
            </p>
          </div>

          {/* Deliver Statement */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              Deliver - How do we make it happen?
            </Label>
            <Textarea
              placeholder="How will the brand compel them to do that? What's our strategic approach?"
              value={deliverStatement}
              onChange={(e) => setDeliverStatement(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Define the brand proposition and strategic approach that will drive the desired outcome.
            </p>
          </div>

          {/* Cohorts */}
          <div className="space-y-2">
            <Label>Strategic Cohorts</Label>
            <Textarea
              placeholder="Define specific audience cohorts and their unique characteristics..."
              value={cohorts}
              onChange={(e) => setCohorts(e.target.value)}
              rows={2}
            />
            {uniqueCohorts.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-2">Suggested cohorts from your signals:</p>
                <div className="flex flex-wrap gap-1">
                  {uniqueCohorts.slice(0, 5).map((cohort, index) => (
                    <Badge key={index} variant="secondary" className="text-xs cursor-pointer"
                           onClick={() => setCohorts(prev => prev ? `${prev}, ${cohort}` : cohort)}>
                      {cohort}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label>Export Format</Label>
              <Select value={briefFormat} onValueChange={(value: 'markdown' | 'text') => setBriefFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown (.md)</SelectItem>
                  <SelectItem value="text">Plain Text (.txt)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExportBrief} className="mt-6">
              <Download className="mr-2 h-4 w-4" />
              Export Brief
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signal Summary */}
      {selectedSignals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Supporting Signals ({selectedSignals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSignals.map((signal) => (
                <div key={signal.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm">{signal.title || "Untitled Signal"}</h4>
                  <p className="text-xs text-gray-600 mt-1">{signal.humanTruth || signal.summary}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {signal.attentionValue && (
                      <Badge variant="outline" className="text-xs">
                        {signal.attentionValue} attention
                      </Badge>
                    )}
                    {signal.viralPotential && (
                      <Badge variant="outline" className="text-xs">
                        {signal.viralPotential} viral
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
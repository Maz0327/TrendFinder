import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, Brain, Sparkles, TrendingUp } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface EnhancedAnalysisPanelProps {
  captureId: string;
  captureType: string;
  hasImageData?: boolean;
  existingAnalysis?: any;
  onAnalysisComplete?: (analysis: any) => void;
}

export function EnhancedAnalysisPanel({ 
  captureId, 
  captureType, 
  hasImageData, 
  existingAnalysis,
  onAnalysisComplete 
}: EnhancedAnalysisPanelProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(existingAnalysis?.googleAnalysis || null);
  const { toast } = useToast();

  const handleEnhancedAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await apiRequest(`/google/analyze/enhanced/${captureId}`, {
        method: 'POST'
      });

      setAnalysis(response.enhancedAnalysis);
      onAnalysisComplete?.(response.enhancedAnalysis);
      
      toast({
        title: "Enhanced Analysis Complete",
        description: "Google AI analysis has been added to your capture",
      });
    } catch (error: any) {
      console.error('Error performing enhanced analysis:', error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to perform enhanced analysis",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.6) return 'bg-green-100 text-green-800 border-green-200';
    if (score > 0.2) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score > -0.2) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (score > -0.6) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.6) return 'Very Positive';
    if (score > 0.2) return 'Positive';
    if (score > -0.2) return 'Neutral';
    if (score > -0.6) return 'Negative';
    return 'Very Negative';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Enhanced Google Analysis
        </CardTitle>
        <CardDescription>
          Advanced AI analysis using Google Vision and Natural Language APIs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!analysis ? (
          <div className="text-center">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Available Analysis:
              </p>
              <div className="flex justify-center gap-2">
                {hasImageData && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Visual Analysis
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Text Analysis
                </Badge>
              </div>
            </div>
            
            <Button 
              onClick={handleEnhancedAnalysis}
              disabled={analyzing}
              size="lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing with Google AI...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run Enhanced Analysis
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Google Vision Analysis */}
            {analysis.vision && (
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  Visual Intelligence
                </h4>
                
                {/* Brand Elements */}
                {analysis.vision.brandElements?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Brand Elements Detected</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.vision.brandElements.map((brand: any, index: number) => (
                        <Badge key={index} variant="outline">
                          {brand.brand} ({Math.round(brand.confidence * 100)}%)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Objects Detected */}
                {analysis.vision.objectsDetected?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Key Objects</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.vision.objectsDetected
                        .filter((obj: any) => obj.confidence > 0.7)
                        .slice(0, 6)
                        .map((obj: any, index: number) => (
                          <Badge key={index} variant="secondary">
                            {obj.object}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {/* Strategic Insights from Vision */}
                {analysis.vision.strategicInsights?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Visual Strategic Insights</h5>
                    <ul className="text-sm space-y-1">
                      {analysis.vision.strategicInsights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Google NLP Analysis */}
            {analysis.nlp && (
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  Language Intelligence
                </h4>

                {/* Sentiment Analysis */}
                {analysis.nlp.sentiment && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Sentiment Analysis</h5>
                    <div className="flex items-center gap-4">
                      <Badge 
                        className={getSentimentColor(analysis.nlp.sentiment.score)}
                        variant="outline"
                      >
                        {getSentimentLabel(analysis.nlp.sentiment.score)}
                      </Badge>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Score: {analysis.nlp.sentiment.score.toFixed(2)} | 
                        Magnitude: {analysis.nlp.sentiment.magnitude.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Entities */}
                {analysis.nlp.entities?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Key Entities</h5>
                    <div className="space-y-2">
                      {analysis.nlp.entities.slice(0, 5).map((entity: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{entity.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {entity.type}
                            </Badge>
                            <span className="text-gray-500">
                              {Math.round(entity.salience * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategic Insights from NLP */}
                {analysis.nlp.strategicInsights?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Language Strategic Insights</h5>
                    <ul className="text-sm space-y-1">
                      {analysis.nlp.strategicInsights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="h-3 w-3 mt-0.5 text-purple-500 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Re-analyze Button */}
            <div className="pt-4 border-t">
              <Button 
                onClick={handleEnhancedAnalysis}
                disabled={analyzing}
                variant="outline"
                size="sm"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Re-analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Re-analyze
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
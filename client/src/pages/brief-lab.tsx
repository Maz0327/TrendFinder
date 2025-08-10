import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PenTool, 
  ArrowRight, 
  Target, 
  Zap, 
  FileText, 
  Presentation,
  Download,
  Sparkles,
  CheckCircle,
  ArrowUpRight
} from "lucide-react";

export default function BriefLab() {
  const [activeTab, setActiveTab] = useState("builder");

  // Get recent captures for brief building
  const { data: recentCaptures = [] } = useQuery({
    queryKey: ["/api/captures/analyzed"],
    queryFn: () => fetch('/api/captures?analyzed=true&limit=6').then(res => res.json()),
  });

  // Get existing briefs
  const { data: briefs = [] } = useQuery({
    queryKey: ["/api/briefs"],
  });

  return (
    <PageLayout 
      title="Strategic Brief Lab" 
      description="Creative workspace for building strategic briefs"
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builder">Brief Builder</TabsTrigger>
            <TabsTrigger value="framework">Define → Shift → Deliver</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            {/* Google Export Integration */}
            <Card className="border-l-4 border-l-blue-400">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      Google Workspace Integration
                    </CardTitle>
                    <CardDescription>
                      Export professional briefs to Google Slides, Docs, and Sheets
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Presentation className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-medium text-sm">Google Slides</div>
                      <div className="text-xs text-gray-600">Professional presentations</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="font-medium text-sm">Google Docs</div>
                      <div className="text-xs text-gray-600">Detailed strategic documents</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Download className="h-8 w-8 text-purple-500" />
                    <div>
                      <div className="font-medium text-sm">Export Options</div>
                      <div className="text-xs text-gray-600">PDF, Markdown, JSON</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-blue-500" />
                    Start New Brief
                  </CardTitle>
                  <CardDescription>
                    Create a strategic brief from scratch or use templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/brief-builder">
                      <Button className="w-full justify-between">
                        Custom Brief Builder
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-between">
                      Jimmy John's Template
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      Cultural Moment Brief
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-500" />
                    Quick Brief from Captures
                  </CardTitle>
                  <CardDescription>
                    Generate briefs from your analyzed content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentCaptures.slice(0, 3).map((capture: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <div className="text-sm font-medium truncate">{capture.title || 'Untitled Capture'}</div>
                          <div className="text-xs text-gray-600">{capture.platform} • Analyzed</div>
                        </div>
                        <Button size="sm" variant="outline">
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {recentCaptures.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No analyzed captures yet</p>
                        <Link href="/signal-capture">
                          <Button size="sm" className="mt-2">Create Capture</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Briefs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Briefs</CardTitle>
                    <CardDescription>Your latest strategic documents</CardDescription>
                  </div>
                  <Link href="/briefs">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {(briefs as any[]).length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No briefs yet</h3>
                    <p className="text-gray-600 mb-4">Create your first strategic brief to get started</p>
                    <Button>
                      <PenTool className="h-4 w-4 mr-2" />
                      Create First Brief
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {(briefs as any[]).slice(0, 3).map((brief: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="font-medium">{brief.title}</div>
                          <div className="text-sm text-gray-600">
                            {brief.createdAt ? new Date(brief.createdAt).toLocaleDateString() : 'Draft'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{brief.status || 'Draft'}</Badge>
                          <Button size="sm" variant="outline">
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="framework" className="space-y-6">
            {/* Define → Shift → Deliver Framework */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Define → Shift → Deliver Framework
                </CardTitle>
                <CardDescription>
                  Structured strategic framework implementation for comprehensive briefs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600">1</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Define</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Establish the strategic foundation, objectives, and target audience
                    </p>
                    <Button variant="outline" size="sm">
                      Start Defining
                    </Button>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-green-600">2</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Shift</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Identify the narrative shift and cultural positioning strategy
                    </p>
                    <Button variant="outline" size="sm">
                      Plan Shift
                    </Button>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-purple-600">3</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Deliver</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Execute the strategy with specific tactics and content plans
                    </p>
                    <Button variant="outline" size="sm">
                      Create Delivery
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Framework Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Cultural Moment Framework</CardTitle>
                  <CardDescription>
                    For time-sensitive cultural opportunities requiring immediate action
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timeline:</span>
                      <span className="font-medium">24-48 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Focus:</span>
                      <span className="font-medium">Speed & Relevance</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Output:</span>
                      <span className="font-medium">Rapid Response Brief</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    Use This Framework
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Campaign Strategy Framework</CardTitle>
                  <CardDescription>
                    For comprehensive campaigns requiring detailed strategic planning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timeline:</span>
                      <span className="font-medium">1-2 weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Focus:</span>
                      <span className="font-medium">Depth & Analysis</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Output:</span>
                      <span className="font-medium">Full Strategy Document</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    Use This Framework
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
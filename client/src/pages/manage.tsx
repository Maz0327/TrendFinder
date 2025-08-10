import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  LayoutDashboard,
  Globe,
  FileText,
  Users,
  FolderOpen,
  Search,
  Settings,
  ArrowRight,
  TrendingUp,
  Target,
  CheckCircle,
  Calendar,
  Link as LinkIcon
} from "lucide-react";

export default function Manage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch dashboard data
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/stats/overview"],
    queryFn: () => fetch('/api/stats/overview').then(res => res.json()),
  });

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Fetch sources
  const { data: sources = [] } = useQuery({
    queryKey: ["/api/sources"],
    queryFn: () => fetch('/api/sources').then(res => res.json()),
  });

  return (
    <PageLayout 
      title="Manage" 
      description="Organization hub with comprehensive management tools"
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="reports">Daily Reports</TabsTrigger>
            <TabsTrigger value="audiences">Audience Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Signals</CardTitle>
                    <LayoutDashboard className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.totalSignals || 0}</div>
                  <p className="text-xs text-gray-600">+12% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
                    <FolderOpen className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(projects as any[])?.length || 0}</div>
                  <p className="text-xs text-gray-600">Across all campaigns</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Briefs Created</CardTitle>
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.totalBriefs || 0}</div>
                  <p className="text-xs text-gray-600">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Hit Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.hitRate || "85"}%</div>
                  <p className="text-xs text-gray-600">Signal accuracy</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your latest strategic initiatives</CardDescription>
                </CardHeader>
                <CardContent>
                  {((projects as any[])?.length || 0) === 0 ? (
                    <div className="text-center py-6">
                      <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No projects yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {((projects as any[]) || []).slice(0, 4).map((project: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{project.name}</div>
                            <div className="text-xs text-gray-600">
                              {project.captureCount || 0} captures • {project.status || 'Active'}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                  <CardDescription>Signal source effectiveness</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Twitter/X</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">35%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div className="w-[35%] h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Instagram</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">28%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div className="w-[28%] h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">TikTok</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">22%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div className="w-[22%] h-2 bg-purple-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">LinkedIn</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">15%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div className="w-[15%] h-2 bg-orange-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Research Provenance</CardTitle>
                    <CardDescription>Track and manage content source URLs</CardDescription>
                  </div>
                  <Button size="sm">
                    <Globe className="h-4 w-4 mr-2" />
                    Add Source
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input placeholder="Search sources..." className="flex-1" />
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>

                  {sources.length === 0 ? (
                    <div className="text-center py-8">
                      <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No sources tracked yet</h3>
                      <p className="text-gray-600 mb-4">Start capturing content to build your source library</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sources.map((source: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{source.title || source.url}</div>
                            <div className="text-xs text-gray-600 flex items-center gap-2">
                              <span>{source.platform}</span>
                              <span>•</span>
                              <span>{source.captureCount || 1} captures</span>
                              <span>•</span>
                              <span>{source.lastUsed}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                              {source.status || 'active'}
                            </Badge>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Automated Morning Briefings
                </CardTitle>
                <CardDescription>
                  Daily intelligence reports and strategic insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Daily Reports Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    Automated morning briefings with overnight intelligence and strategic recommendations
                  </p>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audiences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  7 Pillars Framework
                </CardTitle>
                <CardDescription>
                  Cohort building and audience insight development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Demographics", description: "Age, location, income", count: 0 },
                    { name: "Psychographics", description: "Values, attitudes, lifestyle", count: 0 },
                    { name: "Behavioral", description: "Purchase patterns, usage", count: 0 },
                    { name: "Cultural", description: "Interests, communities", count: 0 },
                    { name: "Situational", description: "Life stage, circumstances", count: 0 },
                    { name: "Digital", description: "Platform preferences, habits", count: 0 },
                    { name: "Emotional", description: "Motivations, pain points", count: 0 }
                  ].map((pillar, index) => (
                    <div key={index} className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-400 mb-2">{pillar.count}</div>
                      <div className="font-medium text-sm mb-1">{pillar.name}</div>
                      <div className="text-xs text-gray-600">{pillar.description}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-gray-600 mb-4">
                    Build detailed audience cohorts using the 7 Pillars Framework for strategic targeting
                  </p>
                  <Button>
                    <Target className="h-4 w-4 mr-2" />
                    Start Cohort Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
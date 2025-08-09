import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { FlaskConical, FileText, TrendingUp, Users, Target, Lightbulb, ChevronRight } from "lucide-react"

const LovableStrategicLab = () => {
  const briefTemplates = [
    {
      name: "Trend Analysis Brief",
      description: "Comprehensive trend analysis with actionable insights",
      signals: 23,
      completion: 85,
      lastUpdated: "2h ago"
    },
    {
      name: "Competitive Intelligence",
      description: "Monitor competitor activities and market positioning",
      signals: 18,
      completion: 62,
      lastUpdated: "4h ago"
    },
    {
      name: "Consumer Sentiment Report",
      description: "Track consumer opinions and brand perception",
      signals: 31,
      completion: 90,
      lastUpdated: "1h ago"
    }
  ]

  const insights = [
    {
      title: "Rising Interest in Sustainable Tech",
      impact: "High",
      confidence: 87,
      signals: 12,
      trend: "+34%"
    },
    {
      title: "Shift Toward Remote-First Culture",
      impact: "Medium",
      confidence: 73,
      signals: 8,
      trend: "+18%"
    },
    {
      title: "AI Integration in Daily Workflows",
      impact: "High",
      confidence: 92,
      signals: 15,
      trend: "+52%"
    }
  ]

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-primary" />
                <h1 className="text-xl font-bold text-foreground">Strategic Brief Lab</h1>
                <div className="text-sm text-muted-foreground">
                  Transform signals into strategic insights
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Brief
                </Button>
                <Button variant="default" className="bg-gradient-primary shadow-glow">
                  <FlaskConical className="w-4 h-4 mr-2" />
                  New Brief
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Briefs */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FlaskConical className="w-5 h-5 text-primary" />
                      Active Strategic Briefs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {briefTemplates.map((brief, index) => (
                      <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{brief.name}</h3>
                            <p className="text-sm text-muted-foreground">{brief.description}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>{brief.signals} signals</span>
                          <span>Updated {brief.lastUpdated}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>Completion</span>
                            <span>{brief.completion}%</span>
                          </div>
                          <Progress value={brief.completion} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Key Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      Key Strategic Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insights.map((insight, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{insight.title}</h3>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant={insight.impact === 'High' ? 'default' : 'secondary'}>
                                {insight.impact} Impact
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {insight.signals} signals
                              </span>
                              <Badge variant="outline" className="text-success">
                                {insight.trend}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>Confidence Level</span>
                            <span>{insight.confidence}%</span>
                          </div>
                          <Progress value={insight.confidence} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Lab Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-sm">Active Briefs</span>
                      </div>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm">Signals Analyzed</span>
                      </div>
                      <span className="font-semibold">72</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm">Insights Generated</span>
                      </div>
                      <span className="font-semibold">18</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Template Library */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Brief Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      Market Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      Competitive Intelligence
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      Trend Forecast
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      Consumer Insights
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-primary" size="sm">
                      + Custom Template
                    </Button>
                  </CardContent>
                </Card>

                {/* Export Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Export & Share</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      PDF Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      PowerPoint
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Executive Summary
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default LovableStrategicLab
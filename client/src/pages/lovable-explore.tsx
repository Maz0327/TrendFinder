import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, TrendingUp, Radar, Globe, Brain } from "lucide-react"
import { SignalCard } from "@/components/signals/SignalCard"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"

const Explore = () => {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    highViral: false,
    recentActivity: false,
    truthAnalyzed: false
  });
  const mockSignals = [
    {
      title: "Sustainable Fashion Movement Gains Momentum",
      content: "Fashion brands are pivoting to eco-friendly materials and transparent supply chains as consumers demand sustainability. Major brands report 60% increase in sustainable product lines...",
      platform: "instagram" as const,
      engagement: { likes: 34200, comments: 1800, shares: 2400 },
      viralScore: 85,
      tags: ["sustainability", "fashion", "ecofriendly", "climate"],
      timestamp: "1h ago",
      author: "EcoFashionista",
      url: "#"
    },
    {
      title: "Decentralized Social Media Platforms Rise",
      content: "Users are migrating to decentralized platforms like Mastodon and Bluesky, seeking alternatives to traditional social media. Privacy concerns and content moderation drive this shift...",
      platform: "twitter" as const,
      engagement: { likes: 12800, comments: 890, shares: 1600 },
      viralScore: 79,
      tags: ["decentralized", "privacy", "socialmedia", "web3"],
      timestamp: "3h ago",
      author: "TechLiberty",
      url: "#"
    },
    {
      title: "Mental Health Apps See Record Downloads",
      content: "Meditation and therapy apps report 200% increase in downloads as mental health awareness grows. Corporate wellness programs increasingly include digital mental health support...",
      platform: "tiktok" as const,
      engagement: { likes: 56700, comments: 3200, shares: 4100 },
      viralScore: 92,
      tags: ["mentalhealth", "wellness", "apps", "selfcare"],
      timestamp: "5h ago",
      author: "WellnessGuru24",
      url: "#"
    }
  ]

  const trendingTopics = [
    { name: "AI Integration", count: 47, trend: "+23%" },
    { name: "Sustainability", count: 34, trend: "+18%" },
    { name: "Remote Work", count: 29, trend: "+12%" },
    { name: "Mental Health", count: 25, trend: "+34%" },
    { name: "Crypto/Web3", count: 22, trend: "-8%" },
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
                <h1 className="text-xl font-bold text-foreground">Explore Signals</h1>
                <div className="text-sm text-muted-foreground">
                  Discover trending content across platforms
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Signal Filters</DialogTitle>
                      <DialogDescription>
                        Apply filters to discover the most relevant content signals
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="highViralLovable"
                          checked={advancedFilters.highViral}
                          onCheckedChange={(checked) => 
                            setAdvancedFilters(prev => ({ ...prev, highViral: checked as boolean }))
                          }
                        />
                        <Label htmlFor="highViralLovable">90+ Viral Score (Ultra Viral)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="recentActivityLovable"
                          checked={advancedFilters.recentActivity}
                          onCheckedChange={(checked) => 
                            setAdvancedFilters(prev => ({ ...prev, recentActivity: checked as boolean }))
                          }
                        />
                        <Label htmlFor="recentActivityLovable">Recent Activity (Last 24h)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="truthAnalyzedLovable"
                          checked={advancedFilters.truthAnalyzed}
                          onCheckedChange={(checked) => 
                            setAdvancedFilters(prev => ({ ...prev, truthAnalyzed: checked as boolean }))
                          }
                        />
                        <Label htmlFor="truthAnalyzedLovable">Truth Framework Analyzed</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setFilterDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        // Apply filters functionality can be implemented here
                        console.log('Applied filters:', advancedFilters);
                        setFilterDialogOpen(false);
                      }}>
                        Apply Filters
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar with trending topics */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="bg-gradient-surface border-border/50 shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Trending Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">{topic.name}</div>
                          <div className="text-sm text-muted-foreground">{topic.count} signals</div>
                        </div>
                        <Badge 
                          variant={topic.trend.startsWith('+') ? 'default' : 'secondary'}
                          className={topic.trend.startsWith('+') ? 'text-success' : 'text-destructive'}
                        >
                          {topic.trend}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-surface border-border/50 shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Brain className="w-5 h-5 text-primary" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">
                        <strong className="text-foreground">Pattern Detected:</strong> Sustainability topics are trending 34% higher this week.
                      </p>
                      <p>
                        <strong className="text-foreground">Recommendation:</strong> Consider creating content around eco-conscious themes.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main content area */}
              <div className="lg:col-span-3 space-y-6">
                {/* Search and Discovery Modes */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search signals, topics, or keywords..." 
                      className="pl-10 bg-muted/50 border-border"
                    />
                  </div>

                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                      <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        All Signals
                      </TabsTrigger>
                      <TabsTrigger value="viral" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        High Viral
                      </TabsTrigger>
                      <TabsTrigger value="emerging" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Emerging
                      </TabsTrigger>
                      <TabsTrigger value="watch" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Watchlist
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {mockSignals.map((signal, index) => (
                          <SignalCard key={index} {...signal} />
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="viral" className="mt-6">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {mockSignals.filter(s => s.viralScore >= 85).map((signal, index) => (
                          <SignalCard key={index} {...signal} />
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="emerging" className="mt-6">
                      <div className="text-center py-12 text-muted-foreground">
                        <Radar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Scanning for emerging trends...</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="watch" className="mt-6">
                      <div className="text-center py-12 text-muted-foreground">
                        <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Your watchlist is empty. Add signals to track them here.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Explore
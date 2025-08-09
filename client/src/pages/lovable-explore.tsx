import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { SignalCard } from "@/components/signals/SignalCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, SortDesc, Radar, TrendingUp, Users, Eye } from "lucide-react"

const LovableExplore = () => {
  const mockSignals = [
    {
      title: "AI-Generated Content Takes Over Social Media Feeds",
      content: "Users are reporting a massive surge in AI-generated content across platforms, with deepfake videos and AI art dominating trending hashtags. The shift represents a fundamental change in how content is created and consumed, raising questions about authenticity and creative ownership in the digital age.",
      platform: "reddit" as const,
      engagement: { likes: 15400, comments: 2300, shares: 890 },
      viralScore: 87,
      tags: ["AI", "deepfake", "socialmedia", "trending"],
      timestamp: "2h ago",
      author: "TechInsider_2024",
      url: "#"
    },
    {
      title: "Micro-Investing Apps See 340% Growth Among Gen Z",
      content: "Young investors are flocking to micro-investing platforms, with apps like Acorns and Stash reporting unprecedented user growth. This trend reflects changing attitudes toward traditional banking and investment strategies among digital natives.",
      platform: "twitter" as const,
      engagement: { likes: 8900, comments: 450, shares: 1200 },
      viralScore: 72,
      tags: ["investing", "genz", "fintech", "money"],
      timestamp: "4h ago",
      author: "FinanceGuru",
      url: "#"
    },
    {
      title: "Remote Work Tools Evolve with AR Integration",
      content: "Companies are integrating AR technology into remote work solutions, creating virtual offices that feel more immersive than traditional video calls. Early adopters report increased productivity and team cohesion.",
      platform: "youtube" as const,
      engagement: { likes: 23100, comments: 890, shares: 2100 },
      viralScore: 94,
      tags: ["remotework", "AR", "productivity", "future"],
      timestamp: "6h ago",
      author: "TechFuture",
      url: "#"
    },
    {
      title: "Sustainable Fashion Movement Gains Corporate Backing",
      content: "Major fashion brands are committing to sustainable practices as consumer demand for eco-friendly clothing surges. The movement is reshaping supply chains and manufacturing processes across the industry.",
      platform: "instagram" as const,
      engagement: { likes: 12600, comments: 780, shares: 445 },
      viralScore: 68,
      tags: ["sustainability", "fashion", "environment", "corporate"],
      timestamp: "8h ago",
      author: "EcoFashionista",
      url: "#"
    },
    {
      title: "Cryptocurrency Adoption Accelerates in Developing Nations",
      content: "Emerging markets are seeing rapid adoption of cryptocurrency as a hedge against inflation and currency instability. This trend is driving innovation in financial services and payment systems.",
      platform: "reddit" as const,
      engagement: { likes: 19200, comments: 1450, shares: 670 },
      viralScore: 81,
      tags: ["crypto", "finance", "emerging markets", "innovation"],
      timestamp: "10h ago",
      author: "CryptoAnalyst",
      url: "#"
    },
    {
      title: "Mental Health Apps Report Record Usage",
      content: "Digital wellness platforms are experiencing unprecedented growth as people seek accessible mental health support. The trend highlights changing attitudes toward mental health care and technology.",
      platform: "twitter" as const,
      engagement: { likes: 7800, comments: 320, shares: 890 },
      viralScore: 65,
      tags: ["mentalhealth", "wellness", "apps", "healthcare"],
      timestamp: "12h ago",
      author: "WellnessTech",
      url: "#"
    }
  ]

  const platforms = ["All Platforms", "reddit", "twitter", "youtube", "instagram", "tiktok"]
  const sortOptions = ["Most Recent", "Highest Viral Score", "Most Engagement", "Trending"]

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
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>
                <Button variant="default" className="bg-gradient-primary shadow-glow">
                  <Radar className="w-4 h-4 mr-2" />
                  New Scan
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search signals..." 
                    className="pl-10 bg-muted/50 border-border"
                  />
                </div>
                <Select defaultValue="All Platforms">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue="Most Recent">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discovery Modes */}
              <Tabs defaultValue="trending" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="trending" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="viral" className="flex items-center gap-2">
                    <Radar className="w-4 h-4" />
                    Viral Potential
                  </TabsTrigger>
                  <TabsTrigger value="engagement" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    High Engagement
                  </TabsTrigger>
                  <TabsTrigger value="watch" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Watch List
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="trending" className="mt-6">
                  <div className="space-y-4">
                    {mockSignals.filter(signal => signal.viralScore > 70).map((signal, index) => (
                      <SignalCard key={index} {...signal} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="viral" className="mt-6">
                  <div className="space-y-4">
                    {mockSignals.sort((a, b) => b.viralScore - a.viralScore).map((signal, index) => (
                      <SignalCard key={index} {...signal} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="engagement" className="mt-6">
                  <div className="space-y-4">
                    {mockSignals
                      .sort((a, b) => (b.engagement.likes + b.engagement.comments + b.engagement.shares) - (a.engagement.likes + a.engagement.comments + a.engagement.shares))
                      .map((signal, index) => (
                        <SignalCard key={index} {...signal} />
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="watch" className="mt-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No signals in watch list</h3>
                    <p>Add signals to your watch list to monitor them closely</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default LovableExplore
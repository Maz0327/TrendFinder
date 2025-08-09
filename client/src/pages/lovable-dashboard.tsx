import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { TrendChart } from "@/components/dashboard/TrendChart"
import { SignalCard } from "@/components/signals/SignalCard"
import { Activity, Radar, TrendingUp, Users, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Link } from "wouter"

const LovableDashboard = () => {
  // Mock data for demonstration (exact Lovable design)
  const trendData = [
    { name: "Mon", value: 45, engagement: 32 },
    { name: "Tue", value: 52, engagement: 41 },
    { name: "Wed", value: 67, engagement: 58 },
    { name: "Thu", value: 74, engagement: 62 },
    { name: "Fri", value: 89, engagement: 78 },
    { name: "Sat", value: 95, engagement: 85 },
    { name: "Sun", value: 82, engagement: 71 },
  ]

  const mockSignals = [
    {
      title: "AI-Generated Content Takes Over Social Media Feeds",
      content: "Users are reporting a massive surge in AI-generated content across platforms, with deepfake videos and AI art dominating trending hashtags. The shift represents a fundamental change in how content is created and consumed...",
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
      content: "Young investors are flocking to micro-investing platforms, with apps like Acorns and Stash reporting unprecedented user growth. This trend reflects changing attitudes toward traditional banking...",
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
      content: "Companies are integrating AR technology into remote work solutions, creating virtual offices that feel more immersive than traditional video calls. Early adopters report increased productivity...",
      platform: "youtube" as const,
      engagement: { likes: 23100, comments: 890, shares: 2100 },
      viralScore: 94,
      tags: ["remotework", "AR", "productivity", "future"],
      timestamp: "6h ago",
      author: "TechFuture",
      url: "#"
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
                <h1 className="text-xl font-bold text-foreground">Today's Briefing</h1>
                <div className="text-sm text-muted-foreground">
                  Strategic Intelligence Dashboard
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search signals..." 
                    className="pl-10 w-64 bg-muted/50 border-border"
                  />
                </div>
                <Link href="/signal-capture">
                  <Button variant="outline">Extension Preview</Button>
                </Link>
                <Button variant="default" className="bg-gradient-primary shadow-glow">
                  <Radar className="w-4 h-4 mr-2" />
                  New Scan
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Active Signals"
                value="127"
                change="+12%"
                changeType="positive"
                icon={Radar}
                description="vs last week"
              />
              <MetricCard
                title="Viral Score Avg"
                value="68.4"
                change="+5.2"
                changeType="positive"
                icon={TrendingUp}
                description="trending up"
              />
              <MetricCard
                title="Engagement Rate"
                value="23.8%"
                change="+2.1%"
                changeType="positive"
                icon={Users}
                description="across platforms"
              />
              <MetricCard
                title="Response Time"
                value="1.2h"
                change="-18min"
                changeType="positive"
                icon={Clock}
                description="faster detection"
              />
            </div>

            {/* Charts and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TrendChart data={trendData} />
              </div>
              
              <div className="space-y-4">
                <div className="bg-card rounded-lg border border-border p-4">
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href="/signal-capture">
                      <Button variant="outline" className="w-full justify-start">
                        <Radar className="w-4 h-4 mr-2" />
                        New Signal Capture
                      </Button>
                    </Link>
                    <Link href="/brief-lab">
                      <Button variant="outline" className="w-full justify-start">
                        <Activity className="w-4 h-4 mr-2" />
                        Strategic Brief Lab
                      </Button>
                    </Link>
                    <Link href="/explore-signals">
                      <Button variant="outline" className="w-full justify-start">
                        <Search className="w-4 h-4 mr-2" />
                        Explore Signals
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Signals */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Recent Signals</h2>
                <Link href="/explore-signals">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {mockSignals.map((signal, index) => (
                  <SignalCard key={index} {...signal} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default LovableDashboard
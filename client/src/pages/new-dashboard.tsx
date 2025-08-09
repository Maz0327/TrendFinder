import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { SignalCard } from "@/components/signals/SignalCard";
import { Activity, Radar, TrendingUp, Users, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  CardSkeleton, 
  StaggerContainer, 
  StaggerItem, 
  PulseDotsLoader,
  ContentPlaceholder 
} from "@/components/ui/loading-states";
import { 
  HoverScaleButton, 
  AnimatedCounter,
  GlowCard 
} from "@/components/ui/micro-interactions";

const NewDashboard = () => {
  // Mock data for demonstration (matching Lovable design)
  const trendData = [
    { name: "Mon", value: 45, engagement: 32 },
    { name: "Tue", value: 52, engagement: 41 },
    { name: "Wed", value: 67, engagement: 58 },
    { name: "Thu", value: 74, engagement: 62 },
    { name: "Fri", value: 89, engagement: 78 },
    { name: "Sat", value: 95, engagement: 85 },
    { name: "Sun", value: 82, engagement: 71 },
  ];

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
  ];

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
                <Link href="/extension-preview">
                  <HoverScaleButton className="px-4 py-2 border rounded-md bg-background hover:bg-accent transition-colors">
                    Extension Preview
                  </HoverScaleButton>
                </Link>
                <Link href="/signal-capture">
                  <HoverScaleButton className="px-4 py-2 bg-gradient-primary text-primary-foreground rounded-md shadow-glow">
                    <Radar className="w-4 h-4 mr-2 inline" />
                    New Scan
                  </HoverScaleButton>
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            {/* Metrics Overview */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metricsLoading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-lg border border-border p-4">
                      <ContentPlaceholder lines={2} />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <StaggerItem>
                    <MetricCard
                      title="Active Signals"
                      value={<AnimatedCounter value={metrics?.totalCaptures || 0} />}
                      change={`+${metrics?.recentCaptures || 0}`}
                      changeType="positive"
                      icon={Radar}
                      description="total captures"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <MetricCard
                      title="Viral Score Avg"
                      value={<AnimatedCounter value={parseFloat(metrics?.avgViralScore?.toFixed(1) || "0")} />}
                      change={`max: ${metrics?.maxViralScore?.toFixed(0) || 0}`}
                      changeType="positive"
                      icon={TrendingUp}
                      description="trending up"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <MetricCard
                      title="Engagement Rate"
                      value="23.8%"
                      change="+2.1%"
                      changeType="positive"
                      icon={Users}
                      description="across platforms"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <MetricCard
                      title="Response Time"
                      value="1.2h"
                      change="-18min"
                      changeType="positive"
                      icon={Clock}
                      description="faster analysis"
                    />
                  </StaggerItem>
                </>
              )}
            </StaggerContainer>

            {/* Trend Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart data={chartData} />
              
              {/* Quick Actions */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/signal-capture">
                    <Button variant="outline" className="w-full justify-start">
                      <Radar className="w-4 h-4 mr-2" />
                      Launch Content Scan
                    </Button>
                  </Link>
                  <Link href="/brief-lab">
                    <Button variant="outline" className="w-full justify-start">
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Strategic Brief
                    </Button>
                  </Link>
                  <Link href="/explore-signals">
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      Explore Signals
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Signals */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground">Recent Signals</h2>
                <Link href="/explore-signals">
                  <Button variant="ghost">View All →</Button>
                </Link>
              </div>
              
              {capturesLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : signals.length > 0 ? (
                <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {signals.map((signal, index) => (
                    <StaggerItem key={index}>
                      <GlowCard>
                        <SignalCard {...signal} />
                      </GlowCard>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PulseDotsLoader className="justify-center mb-4" />
                  No signals captured yet. Start by launching a content scan.
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default NewDashboard;
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { TrendChart } from "@/components/dashboard/TrendChart"
import { SignalCard } from "@/components/signals/SignalCard"
import StatsOverview from "@/components/dashboard/StatsOverview"
import SystemStatus from "@/components/dashboard/SystemStatus"
import { Activity, Radar, TrendingUp, Users, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Link } from "wouter"
import { useQuery } from "@tanstack/react-query"
import { fetchRecentCaptures, fetchMetrics, fetchTrendData } from "@/lib/lovable-api"

const Index = () => {
  // Fetch real data from backend
  const { data: signals = [], isLoading: signalsLoading } = useQuery({
    queryKey: ['captures', 'recent'],
    queryFn: fetchRecentCaptures,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: metrics = {
    activeSignals: 0,
    avgViralScore: 0,
    engagementRate: 0,
    responseTime: "N/A"
  }} = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: trendData = [] } = useQuery({
    queryKey: ['trends'],
    queryFn: fetchTrendData,
    refetchInterval: 60000
  });

  // Default data if no signals are available
  const displaySignals = signals.length > 0 ? signals : [
    {
      title: "No signals captured yet",
      content: "Start capturing content to see your signals here. Click 'New Scan' or navigate to 'New Signal Capture' to get started.",
      platform: "twitter" as const,
      engagement: { likes: 0, comments: 0, shares: 0 },
      viralScore: 0,
      tags: ["getting-started"],
      timestamp: "now",
      author: "System",
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
          <main className="flex-1 p-3 space-y-3 overflow-hidden">
            {/* Top Row: 4 Metrics */}
            <StatsOverview
              variant="dashboard"
              stats={{
                totalTrends: signals.length || metrics.activeSignals || 0,
                viralPotential: metrics.avgViralScore || 0,
                activeSources: 6, // Number of platforms we monitor
                avgScore: 8.5,
                truthAnalyzed: Math.floor((signals.length || 0) * 0.7),
                hypothesesTracked: Math.floor((signals.length || 0) * 0.3)
              }}
            />

            {/* Bottom Row: 3 Components */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[calc(100vh-280px)]">
              {/* Signal Detection Rate */}
              <div className="lg:col-span-1">
                <TrendChart
                  title="Signal Detection Rate"
                  data={trendData}
                />
              </div>
              
              {/* System Status */}
              <div className="lg:col-span-1">
                <SystemStatus />
              </div>
              
              {/* Latest Signals */}
              <div className="lg:col-span-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-foreground">Latest Signals</h2>
                  <Button variant="outline" size="sm" className="text-primary border-primary/20 hover:bg-primary/5">
                    View All
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {signalsLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : displaySignals.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground text-sm">No signals detected yet. Start capturing content to see insights here.</p>
                    </div>
                  ) : (
                    displaySignals.slice(0, 6).map((signal, index) => (
                      <SignalCard 
                        key={index}
                        title={signal.title}
                        content={signal.content}
                        platform={signal.platform}
                        engagement={signal.engagement}
                        viralScore={signal.viralScore}
                        tags={signal.tags}
                        timestamp={signal.timestamp}
                        author={signal.author}
                        url={signal.url}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
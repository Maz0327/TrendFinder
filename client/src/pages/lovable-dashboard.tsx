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
          <main className="flex-1 p-6 space-y-6">
            {/* Metrics Overview with TrendFinder-LVUI-Push StatsOverview */}
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

            {/* Trend Analysis & System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart
                title="Signal Detection Rate"
                data={trendData}
              />
              <SystemStatus />
            </div>

            {/* Latest Signals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Latest Signals</h2>
                <Button variant="outline" className="text-primary border-primary/20 hover:bg-primary/5">
                  View All Signals
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {signalsLoading ? (
                  <div className="col-span-full flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  displaySignals.slice(0, 6).map((signal, index) => (
                    <SignalCard key={signal.id || index} {...signal} />
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
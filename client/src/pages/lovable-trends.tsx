import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { TrendChart } from "@/components/dashboard/TrendChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

const LovableTrends = () => {
  const trendData = [
    { name: "Jan", value: 45, engagement: 32 },
    { name: "Feb", value: 52, engagement: 41 },
    { name: "Mar", value: 67, engagement: 58 },
    { name: "Apr", value: 74, engagement: 62 },
    { name: "May", value: 89, engagement: 78 },
    { name: "Jun", value: 95, engagement: 85 },
  ]

  const topTrends = [
    { topic: "AI Integration", growth: "+234%", signals: 47, status: "rising" },
    { topic: "Sustainability", growth: "+156%", signals: 34, status: "rising" },
    { topic: "Remote Work", growth: "+89%", signals: 29, status: "stable" },
    { topic: "Mental Health", growth: "+201%", signals: 25, status: "rising" },
    { topic: "Crypto/Web3", growth: "-23%", signals: 22, status: "declining" },
  ]

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4 h-full px-6">
              <SidebarTrigger className="text-muted-foreground hover:text-primary" />
              <h1 className="text-xl font-bold text-foreground">Trend Analysis</h1>
              <div className="text-sm text-muted-foreground">Advanced trend intelligence</div>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart title="Content Trend Growth" data={trendData} />
              <TrendChart title="Platform Engagement Trends" data={trendData} />
            </div>

            <Card className="bg-gradient-surface border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Top Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          {trend.status === "rising" ? (
                            <ArrowUpRight className="w-4 h-4 text-success" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{trend.topic}</div>
                          <div className="text-sm text-muted-foreground">{trend.signals} signals</div>
                        </div>
                      </div>
                      <Badge variant={trend.status === "rising" ? "default" : "secondary"}>
                        {trend.growth}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default LovableTrends
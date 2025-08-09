import { useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, AlertTriangle, Sparkles, LineChart, TrendingUp, Activity } from "lucide-react"

const Insights = () => {
  useEffect(() => {
    document.title = "AI Insights | TrendFinder"
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'AI insights highlighting patterns, anomalies, and recommendations from your monitored signals.')

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', window.location.href)
  }, [])

  const recommendations = [
    { title: "Leverage series content on YouTube", impact: "High", detail: "Series-based content drives 37% higher retention in B2B niches." },
    { title: "Test AI voiceover for shorts", impact: "Medium", detail: "Faster production without reducing engagement in tech categories." },
    { title: "Repurpose top threads to carousels", impact: "High", detail: "Threads → carousels lift share rate by ~24% on LinkedIn-like platforms." },
  ]

  const anomalies = [
    { title: "Sudden dip in remote work queries", detail: "Keyword volume dropped 18% WoW despite rising content output." },
    { title: "Spike in sustainability shares", detail: "Share-to-like ratio increased by 21% indicating strong advocacy." },
  ]

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4 h-full px-6">
              <SidebarTrigger className="text-muted-foreground hover:text-primary" />
              <h1 className="text-xl font-bold text-foreground">AI Insights</h1>
              <div className="text-sm text-muted-foreground">Automated patterns, anomalies, and actions</div>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-surface border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Brain className="w-5 h-5 text-primary" /> Weekly Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground"><TrendingUp className="w-4 h-4 text-primary" /> 4 themes rising</div>
                  <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Engagement up 12%</div>
                  <div className="flex items-center gap-2"><LineChart className="w-4 h-4 text-primary" /> 2 anomalies detected</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-surface border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <AlertTriangle className="w-5 h-5 text-primary" /> Anomalies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {anomalies.map((a, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30">
                      <div className="font-medium text-foreground">{a.title}</div>
                      <div className="text-sm text-muted-foreground">{a.detail}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gradient-surface border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Sparkles className="w-5 h-5 text-primary" /> Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.map((r, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-foreground">{r.title}</div>
                        <Badge variant="secondary">Impact: {r.impact}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{r.detail}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Insights Feed */}
            <Card className="bg-gradient-surface border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-foreground">Insights Feed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Sustainability shares indicate advocacy intent", time: "1h ago" },
                  { title: "AI tools trend diffuses from dev to creator niches", time: "3h ago" },
                  { title: "Remote work search interest normalizing", time: "6h ago" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="text-sm text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.time}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Insights

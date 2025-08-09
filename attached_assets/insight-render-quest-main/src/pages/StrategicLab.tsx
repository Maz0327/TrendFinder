import { useEffect, useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SignalCard } from "@/components/signals/SignalCard"
import { FlaskConical, Brain, FileText, Download, CheckCircle2, Zap } from "lucide-react"

const StrategicLab = () => {
  // Basic SEO setup per page
  useEffect(() => {
    document.title = "Strategic Brief Lab | TrendFinder"
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'Strategic brief lab to synthesize signals into an actionable strategy with AI insights.')

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', window.location.href)
  }, [])

  const [brief, setBrief] = useState({
    objective: "",
    audience: "",
    channels: "",
    summary: "",
  })

  const mockSignals = [
    {
      title: "AI content tools drive creator productivity",
      content: "Short-form creators report 3x output with AI assistance; engagement holds steady.",
      platform: "twitter" as const,
      engagement: { likes: 12800, comments: 760, shares: 980 },
      viralScore: 82,
      tags: ["ai", "creator-economy", "productivity"],
      timestamp: "2h ago",
      author: "CreatorTech",
    },
    {
      title: "YouTube shorts adoption spikes in B2B niches",
      content: "B2B channels embrace shorts for awareness; watch-time improves with series playlists.",
      platform: "youtube" as const,
      engagement: { likes: 25400, comments: 1200, shares: 2100 },
      viralScore: 88,
      tags: ["youtube", "shorts", "b2b"],
      timestamp: "5h ago",
      author: "PipelineGrowth",
    },
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
                <div className="text-sm text-muted-foreground">Synthesize signals into an actionable brief</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="hidden sm:flex">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Draft
                </Button>
                <Button className="bg-gradient-primary shadow-glow">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Brief Builder */}
              <Card className="bg-gradient-surface border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <FlaskConical className="w-5 h-5 text-primary" />
                    Brief Builder
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Objective</label>
                      <Input value={brief.objective} onChange={(e) => setBrief({ ...brief, objective: e.target.value })} placeholder="e.g., Launch awareness campaign" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Audience</label>
                      <Input value={brief.audience} onChange={(e) => setBrief({ ...brief, audience: e.target.value })} placeholder="e.g., SMB founders" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Key Channels</label>
                      <Input value={brief.channels} onChange={(e) => setBrief({ ...brief, channels: e.target.value })} placeholder="e.g., YouTube, TikTok" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Executive Summary</label>
                    <Textarea value={brief.summary} onChange={(e) => setBrief({ ...brief, summary: e.target.value })} placeholder="Summarize the brief in 4-6 sentences..." className="min-h-[140px]" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">
                      <Brain className="w-4 h-4 mr-2" />
                      Generate Outline
                    </Button>
                    <Button variant="outline">
                      <Zap className="w-4 h-4 mr-2" />
                      Suggest KPIs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Key Findings & Hooks */}
              <div className="space-y-6">
                <Card className="bg-gradient-surface border-border/50 shadow-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">Key Findings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {["AI-assisted creation accelerates publishing cadence","Short-form series outperform one-offs in B2B","Educational content with concrete frameworks drives shares"].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 mt-1 text-primary" />
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-surface border-border/50 shadow-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">Suggested Content Hooks</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {["3-step AI workflow","Framework first, demo second","From 0→1 playlist", "Behind-the-scenes ops"]
                      .map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Attached Signals */}
            <Card className="bg-gradient-surface border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-foreground">Attached Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {mockSignals.map((signal, idx) => (
                    <SignalCard key={idx} {...signal} />
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

export default StrategicLab

import { useEffect, useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignalCard } from "@/components/signals/SignalCard"
import { Search as SearchIcon, Filter, Calendar, Globe, Hash } from "lucide-react"

const Search = () => {
  useEffect(() => {
    document.title = "Signal Search | TrendFinder"
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'Search and filter signals across platforms, topics, and timeframes.')

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', window.location.href)
  }, [])

  const [query, setQuery] = useState("")

  const allSignals = [
    {
      title: "Sustainable Fashion Momentum",
      content: "Brands report 60% increase in sustainable lines; strong engagement on reels.",
      platform: "instagram" as const,
      engagement: { likes: 34200, comments: 1800, shares: 2400 },
      viralScore: 85,
      tags: ["sustainability", "fashion"],
      timestamp: "1h ago",
      author: "EcoFashionista",
    },
    {
      title: "Decentralized Social Platforms Rise",
      content: "Users shift to decentralized networks; privacy and moderation key drivers.",
      platform: "twitter" as const,
      engagement: { likes: 12800, comments: 890, shares: 1600 },
      viralScore: 79,
      tags: ["decentralized", "privacy", "web3"],
      timestamp: "3h ago",
      author: "TechLiberty",
    },
  ]

  const results = allSignals.filter(s => s.title.toLowerCase().includes(query.toLowerCase()) || s.tags.some(t => t.includes(query.toLowerCase())))

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
                <h1 className="text-xl font-bold text-foreground">Signal Search</h1>
                <div className="text-sm text-muted-foreground">Find signals by keyword, platform, and more</div>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            <Card className="bg-gradient-surface border-border/50 shadow-card">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2 relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search signals, topics, or #tags" className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reddit">Reddit</SelectItem>
                        <SelectItem value="twitter">Twitter/X</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">Last 24h</SelectItem>
                        <SelectItem value="7d">Last 7d</SelectItem>
                        <SelectItem value="30d">Last 30d</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-full"><Hash className="w-4 h-4 mr-2" />Tags</Button>
                    <Button className="w-full bg-gradient-primary shadow-glow"><Globe className="w-4 h-4 mr-2" />Search</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-muted/50 grid grid-cols-3">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
                <TabsTrigger value="high" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">High Viral</TabsTrigger>
                <TabsTrigger value="recent" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Most Recent</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {results.map((s, i) => (<SignalCard key={i} {...s} />))}
                </div>
              </TabsContent>
              <TabsContent value="high" className="mt-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {results.filter(r => r.viralScore >= 85).map((s, i) => (<SignalCard key={i} {...s} />))}
                </div>
              </TabsContent>
              <TabsContent value="recent" className="mt-6">
                <div className="text-sm text-muted-foreground p-6 rounded-lg bg-muted/30">
                  Use timeframe filter above to adjust recency.
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Search

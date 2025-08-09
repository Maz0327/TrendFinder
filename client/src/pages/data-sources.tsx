import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, Database, PlayCircle, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const DataSources = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("twitter")
  const [searchQuery, setSearchQuery] = useState("AI trends")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Available platforms with BrightData integration
  const platforms = [
    { id: "twitter", name: "Twitter/X", icon: "🐦", enabled: true },
    { id: "instagram", name: "Instagram", icon: "📷", enabled: true },
    { id: "tiktok", name: "TikTok", icon: "🎵", enabled: true },
    { id: "youtube", name: "YouTube", icon: "📺", enabled: true },
    { id: "reddit", name: "Reddit", icon: "🤖", enabled: true },
    { id: "linkedin", name: "LinkedIn", icon: "💼", enabled: true },
  ]

  // Test BrightData connection
  const { data: testResult, isLoading: testLoading } = useQuery({
    queryKey: ['bright-data-test'],
    queryFn: async () => {
      const response = await fetch('/api/public/bright-data-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'twitter', query: 'test' })
      })
      if (!response.ok) throw new Error('Failed to test BrightData')
      return response.json()
    },
    refetchInterval: false
  })

  // Trigger data collection
  const collectDataMutation = useMutation({
    mutationFn: async ({ platform, query }: { platform: string, query: string }) => {
      const response = await fetch('/api/bright-data/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, query, keywords: [query] })
      })
      if (!response.ok) throw new Error('Failed to collect data')
      return response.json()
    },
    onSuccess: (data) => {
      toast({
        title: "Data Collection Started",
        description: `Collected ${data.dataCount} items from ${data.platform}`,
      })
      // Refresh captures data
      queryClient.invalidateQueries({ queryKey: ['captures'] })
    },
    onError: (error) => {
      toast({
        title: "Collection Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Get recent captures to show scraped data
  const { data: recentCaptures = [], isLoading: capturesLoading } = useQuery({
    queryKey: ['captures', 'recent'],
    queryFn: async () => {
      const response = await fetch('/api/captures/recent')
      if (!response.ok) throw new Error('Failed to fetch captures')
      return response.json()
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  })

  const handleCollectData = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a search query",
        variant: "destructive"
      })
      return
    }
    collectDataMutation.mutate({ platform: selectedPlatform, query: searchQuery })
  }

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
                <h1 className="text-xl font-bold text-foreground">Data Sources</h1>
                <div className="text-sm text-muted-foreground">
                  Manage scraped content from BrightData & APIs
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={testResult?.success ? "default" : "destructive"}>
                  {testLoading ? "Testing..." : testResult?.success ? "BrightData Connected" : "Connection Issues"}
                </Badge>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            {/* Data Collection Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Trigger Data Collection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Platform Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Platform</label>
                    <div className="grid grid-cols-2 gap-2">
                      {platforms.map((platform) => (
                        <Button
                          key={platform.id}
                          variant={selectedPlatform === platform.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedPlatform(platform.id)}
                          disabled={!platform.enabled}
                          className="justify-start"
                        >
                          <span className="mr-2">{platform.icon}</span>
                          {platform.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Search Query */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search Query</label>
                    <Input
                      placeholder="Enter search terms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCollectData()}
                    />
                  </div>

                  {/* Trigger Button */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">&nbsp;</label>
                    <Button 
                      onClick={handleCollectData}
                      disabled={collectDataMutation.isPending}
                      className="w-full"
                    >
                      {collectDataMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Collecting...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Start Collection
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Scraped Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Recent Scraped Content ({recentCaptures.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {capturesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Loading scraped content...</span>
                  </div>
                ) : recentCaptures.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No scraped content yet</p>
                    <p className="text-sm">Use the data collection controls above to start scraping content from your selected platforms.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCaptures.slice(0, 10).map((capture: any, index: number) => (
                      <div key={capture.id || index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground mb-1">{capture.title || 'Untitled'}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {capture.content || 'No content available'}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{capture.platform || 'unknown'}</Badge>
                              {capture.viralScore && (
                                <Badge variant="secondary">
                                  Viral: {capture.viralScore}/100
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {capture.createdAt ? new Date(capture.createdAt).toLocaleString() : 'Recently'}
                              </span>
                            </div>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500 ml-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">BrightData API</span>
                    <Badge variant={testResult?.success ? "default" : "destructive"}>
                      {testLoading ? "Testing..." : testResult?.success ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Live Browser</span>
                    <Badge variant="default">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">AI Analysis</span>
                    <Badge variant="default">GPT-5 Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default DataSources
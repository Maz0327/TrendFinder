import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { ExternalLink, Filter, Plus, RefreshCcw } from 'lucide-react'
import CaptureCard from '@/components/captures/CaptureCard'
import CaptureDetailDrawer from '@/components/captures/CaptureDetailDrawer'
import BatchActionsBar from '@/components/captures/BatchActionsBar'
import PlatformFilter from '@/components/filters/PlatformFilter'
import TimeFilter, { TimeWindow } from '@/components/filters/TimeFilter'
import BriefPickerDialog from '@/components/captures/BriefPickerDialog'
import { Link } from 'react-router-dom'

export type Capture = {
  id: string
  title: string | null
  content: string | null
  platform: string | null
  url: string | null
  created_at: string
  predicted_virality?: number | null
  tags?: string[] | null // not guaranteed in schema
}

type Filters = {
  platforms: string[]
  time: TimeWindow
  search: string
}

const PAGE_SIZE = 30

const CapturesInbox = () => {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detailId, setDetailId] = useState<string | null>(null)
  const [briefDialogOpen, setBriefDialogOpen] = useState(false)

  const [filters, setFilters] = useState<Filters>({ platforms: [], time: 'all', search: '' })

  const applyFilters = (q: any) => {
    if (filters.platforms.length) q = q.in('platform', filters.platforms)
    if (filters.time !== 'all') {
      const now = new Date()
      const since = new Date()
      if (filters.time === '24h') since.setDate(now.getDate() - 1)
      if (filters.time === '7d') since.setDate(now.getDate() - 7)
      if (filters.time === '30d') since.setDate(now.getDate() - 30)
      q = q.gte('created_at', since.toISOString())
    }
    if (filters.search) q = q.ilike('content', `%${filters.search}%`)
    return q
  }

  const fetchPage = async ({ pageParam }: { pageParam?: string | null }) => {
    let q = supabase
      .from('captures')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (pageParam) q = q.lt('created_at', pageParam)
    q = applyFilters(q)

    const { data, error } = await q
    if (error) throw error

    return data as Capture[]
  }

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['captures', filters],
    queryFn: async () => {
      const page = await fetchPage({})
      return page
    },
    refetchOnWindowFocus: false,
  })

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('captures-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'captures' }, (payload) => {
        toast({ title: 'Captures updated', description: 'Realtime change received.' })
        queryClient.invalidateQueries({ queryKey: ['captures'] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  // Distinct platforms for filter
  const { data: platforms } = useQuery({
    queryKey: ['captures-platforms'],
    queryFn: async () => {
      const { data, error } = await supabase.from('captures').select('platform')
      if (error) return [] as string[]
      const vals = Array.from(new Set((data || []).map((r: any) => r.platform).filter(Boolean))) as string[]
      return vals
    },
  })

  const parentRef = useRef<HTMLDivElement | null>(null)
  const rows = data || []
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 110,
    overscan: 12,
  })

  const allSelected = selected.size > 0 && rows.every((r) => selected.has(r.id))
  const toggleAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(rows.map((r) => r.id)))
  }

  useEffect(() => {
    document.title = 'Captures Inbox — Content Radar'
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="apple-blur border-b border-border/20 sticky top-0 z-10">
        <div className="container mx-auto py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Captures Inbox</h1>
                <p className="text-sm text-muted-foreground">Organize and manage your content captures</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()} aria-label="Refresh">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  disabled={selected.size === 0} 
                  onClick={() => setBriefDialogOpen(true)}
                  className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add to Brief
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search content..."
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  className="bg-background/50"
                />
              </div>
              <Button variant="outline" size="sm" aria-label="Filters">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto grid grid-cols-12 gap-6 py-6">
        {/* Left Filters */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 space-y-4">
          <div className="apple-card p-4">
            <h3 className="font-medium mb-4">Platforms</h3>
            <div className="space-y-3">
              {platforms?.length ? (
                platforms.map((p) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.platforms.includes(p)}
                      onCheckedChange={(v) =>
                        setFilters((f) => ({
                          ...f,
                          platforms: v ? [...f.platforms, p] : f.platforms.filter((x) => x !== p),
                        }))
                      }
                    />
                    <span className="text-sm">{p}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No platform data</p>
              )}
            </div>
            <Separator className="my-4" />
            <TimeFilter value={filters.time} onChange={(time) => setFilters((f) => ({ ...f, time }))} />
          </div>
          <div className="apple-card p-4">
            <h3 className="font-medium mb-3">Saved Views</h3>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                📌 High Priority
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                🔥 Trending Today
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                💡 For Review
              </Button>
            </div>
          </div>
        </aside>

        {/* Center List */}
        <section className="col-span-12 md:col-span-6 lg:col-span-7">
          <div className="apple-card">
            <div ref={parentRef} className="h-[70vh] overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading captures...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <p className="text-destructive">Failed to load captures</p>
                  </div>
                </div>
              ) : rows.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📸</div>
                    <p className="text-muted-foreground mb-2">No captures yet</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/moments-radar">Explore Moments</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const item = rows[virtualRow.index]
                    return (
                      <div
                        key={item.id}
                        className="absolute left-0 right-0"
                        style={{ transform: `translateY(${virtualRow.start}px)` }}
                      >
                        <CaptureCard
                          capture={item}
                          checked={selected.has(item.id)}
                          onCheck={(v) =>
                            setSelected((s) => {
                              const n = new Set(s)
                              if (v) n.add(item.id)
                              else n.delete(item.id)
                              return n
                            })
                          }
                          onOpen={() => setDetailId(item.id)}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              <span>Select all</span>
            </label>
            <span className="text-muted-foreground">{rows.length} captures</span>
          </div>
        </section>

        {/* Right Detail */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-3 space-y-4">
          <div className="apple-card p-4 min-h-[300px]">
            <h3 className="font-medium mb-4">Quick Insights</h3>
            {detailId ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm text-muted-foreground">Detailed view available in drawer</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground">TODAY'S HIGHLIGHTS</p>
                  <p className="text-sm mt-1">156 new captures</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground">TOP PLATFORM</p>
                  <p className="text-sm mt-1">Twitter (34%)</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground">TRENDING TOPIC</p>
                  <p className="text-sm mt-1">AI Technology</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>

      <BatchActionsBar
        selectedCount={selected.size}
        onAddToBrief={() => setBriefDialogOpen(true)}
        onClear={() => setSelected(new Set())}
      />

      <CaptureDetailDrawer
        open={!!detailId}
        onOpenChange={(o) => !o && setDetailId(null)}
        capture={rows.find((c) => c.id === detailId) || null}
      />

      <BriefPickerDialog
        open={briefDialogOpen}
        onOpenChange={setBriefDialogOpen}
        captureIds={[...selected]}
      />
    </main>
  )
}

export default CapturesInbox

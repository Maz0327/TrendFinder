// @ts-nocheck
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Search = () => {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'all' | 'captures' | 'moments' | 'briefs'>('all')
  useEffect(() => { document.title = 'Search — Content Radar' }, [])

  const captures = useQuery({
    queryKey: ['search-captures', q],
    queryFn: async () => {
      if (!q) return []
      const { data, error } = await supabase.from('captures').select('*').ilike('content', `%${q}%`).limit(20)
      if (error) return []
      return data as any[]
    },
  })

  const moments = useQuery({
    queryKey: ['search-moments', q],
    queryFn: async () => {
      if (!q) return []
      const { data } = await supabase.from('cultural_moments').select('*').ilike('title', `%${q}%`).limit(20)
      return (data || []) as any[]
    },
  })

  const briefs = useQuery({
    queryKey: ['search-briefs', q],
    queryFn: async () => {
      if (!q) return []
      const { data } = await supabase.from('dsd_briefs').select('*').ilike('title', `%${q}%`).limit(20)
      return (data || []) as any[]
    },
  })

  const resultsAll = [...(captures.data || []), ...(moments.data || []), ...(briefs.data || [])]

  const List = ({ items }: { items: any[] }) => (
    <div className="grid gap-4">
      {items.map((it, i) => (
        <div key={i} className="apple-card p-4 group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium mb-1">{it.title || 'Untitled'}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {it.content || it.description || 'No description available'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                  {it.platform ? `📱 ${it.platform}` : it.intensity ? '🎯 Moment' : '📄 Brief'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(it.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </Button>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="apple-card p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-sm text-muted-foreground">
            {q ? `No results found for "${q}"` : 'Start typing to search'}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <main className="container mx-auto py-6 space-y-6">
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-large-title font-semibold">Search</h1>
          <p className="text-muted-foreground">Find captures, moments, and briefs across your content</p>
        </div>
        <div className="relative">
          <Input 
            placeholder="Search everything…" 
            value={q} 
            onChange={(e) => setQ(e.target.value)}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            🔍
          </div>
        </div>
      </header>
      
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="captures">Captures</TabsTrigger>
          <TabsTrigger value="moments">Moments</TabsTrigger>
          <TabsTrigger value="briefs">Briefs</TabsTrigger>
        </TabsList>
        
        <div className="space-y-4">
          <TabsContent value="all" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {resultsAll.length} results found
            </div>
            <List items={resultsAll} />
          </TabsContent>
          <TabsContent value="captures" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {(captures.data || []).length} captures found
            </div>
            <List items={captures.data || []} />
          </TabsContent>
          <TabsContent value="moments" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {(moments.data || []).length} moments found
            </div>
            <List items={moments.data || []} />
          </TabsContent>
          <TabsContent value="briefs" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {(briefs.data || []).length} briefs found
            </div>
            <List items={briefs.data || []} />
          </TabsContent>
        </div>
      </Tabs>
    </main>
  )
}

export default Search

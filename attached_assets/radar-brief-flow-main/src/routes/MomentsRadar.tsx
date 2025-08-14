import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { ResponsiveContainer, ScatterChart, XAxis, YAxis, ZAxis, Scatter, Tooltip, CartesianGrid } from 'recharts'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { RefreshCcw } from 'lucide-react'

export type Moment = {
  id: string
  title: string | null
  description?: string | null
  intensity?: number | null
  recency_bucket?: number | null
  created_at: string
  tags?: string[] | null
}

const MomentsRadar = () => {
  const [openId, setOpenId] = useState<string | null>(null)

  const { data, error } = useQuery({
    queryKey: ['moments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cultural_moments').select('*').order('created_at', { ascending: false })
      if (error) {
        console.warn('[Lovable-UI] cultural_moments unavailable.')
        return [] as Moment[]
      }
      return data as Moment[]
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel('moments-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cultural_moments' }, () => {
        toast({ title: 'Moments updated', description: 'Radar will reflect new data.' })
      })
      .subscribe()
    return () => {
      // ensure cleanup returns void, not a Promise
      void supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => { document.title = 'Moments Radar — Content Radar' }, [])

  const points = (data || []).map((m) => ({
    x: m.recency_bucket ?? 0,
    y: typeof m.intensity === 'number' ? m.intensity : 0,
    z: Math.max(20, (m.intensity || 10) * 3),
    id: m.id,
    title: m.title || 'Untitled',
  }))

  const active = (data || []).find((m) => m.id === openId) || null

  return (
    <main className="min-h-screen container mx-auto py-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-large-title font-semibold">Moments Radar</h1>
        <p className="text-muted-foreground">Visualize cultural moments by intensity and recency</p>
      </header>
      
      <section className="apple-card p-6 h-[65vh]">
        {(data || []).length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-medium mb-2">No moments detected yet</h3>
              <p className="text-muted-foreground mb-4">Cultural moments will appear here as they emerge</p>
              <Button variant="outline">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Recency" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Intensity" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <ZAxis type="number" dataKey="z" range={[30, 180]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-apple)'
                }}
              />
              <Scatter 
                data={points} 
                fill="hsl(var(--primary))" 
                onClick={(d: any) => setOpenId(d.id)}
                style={{ cursor: 'pointer' }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </section>

      <Drawer open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{active?.title || 'Moment'}</DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-6 space-y-4">
            <p className="text-sm text-muted-foreground">{active?.description || 'No description.'}</p>
            <div>
              <h3 className="font-medium mb-2">Top supporting captures</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => toast({ title: 'Watching moment' })}>Watch Moment</Button>
              <Button onClick={() => toast({ title: 'Added to brief' })}>Add to Brief</Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </main>
  )
}

export default MomentsRadar

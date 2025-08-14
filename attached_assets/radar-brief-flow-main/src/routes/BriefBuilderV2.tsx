import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'

// Local draft brief structure
export type SectionCard =
  | { type: 'capture'; captureId: string; note?: string }
  | { type: 'insight'; text: string }
  | { type: 'hook'; text: string }
  | { type: 'reference'; url?: string; imageUrl?: string; title?: string }

const BriefBuilderV2 = () => {
  const [title, setTitle] = useState('New Brief')
  const [status, setStatus] = useState<'draft' | 'active'>('draft')
  const [tab, setTab] = useState<'define' | 'shift' | 'deliver'>('define')
  const [define, setDefine] = useState<SectionCard[]>([])
  const [shift, setShift] = useState<SectionCard[]>([])
  const [deliver, setDeliver] = useState<SectionCard[]>([])
  const [savedAt, setSavedAt] = useState<string>('')

  useEffect(() => { document.title = 'Brief Builder — Content Radar' }, [])

  // Autosave to localStorage (fallback-first)
  useEffect(() => {
    const t = setTimeout(() => {
      const payload = { title, status, define, shift, deliver }
      localStorage.setItem('brief-current', JSON.stringify(payload))
      setSavedAt(new Date().toLocaleTimeString())
    }, 800)
    return () => clearTimeout(t)
  }, [title, status, define, shift, deliver])

  const addCard = (type: SectionCard['type']) => {
    const card: SectionCard =
      type === 'insight'
        ? { type: 'insight', text: 'New insight' }
        : type === 'hook'
        ? { type: 'hook', text: 'New hook' }
        : { type: 'capture', captureId: 'sample-id' }

    if (tab === 'define') setDefine((c) => [card, ...c])
    if (tab === 'shift') setShift((c) => [card, ...c])
    if (tab === 'deliver') setDeliver((c) => [card, ...c])
  }

  const Section = ({ items }: { items: SectionCard[] }) => (
    <div className="space-y-4">
      {items.map((c, i) => (
        <div key={i} className="apple-card p-4 group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {c.type}
            </div>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              ⋯
            </Button>
          </div>
          {'text' in c ? (
            <div className="text-sm leading-relaxed">{(c as any).text}</div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Capture:</span> {(c as any).captureId}
            </div>
          )}
        </div>
      ))}
      {items.length === 0 && (
        <div className="apple-card p-8 text-center">
          <div className="text-4xl mb-3">📝</div>
          <div className="text-sm text-muted-foreground">
            Start building your brief by adding cards from the sidebar
          </div>
        </div>
      )}
    </div>
  )

  return (
    <main className="container mx-auto py-6 space-y-6">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="text-2xl font-bold bg-transparent border-none px-0 focus:ring-0" 
            placeholder="Brief Title"
          />
          <Button 
            variant={status === 'draft' ? 'outline' : 'default'} 
            onClick={() => setStatus((s) => (s === 'draft' ? 'active' : 'draft'))}
            className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1"
          >
            {status === 'draft' ? 'Draft' : 'Active'}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Build your brief using the Define-Shift-Deliver framework</p>
          <div className="text-sm text-muted-foreground">
            {savedAt ? `Saved at ${savedAt}` : 'Saving...'}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-2">
          <div className="sticky top-6 space-y-4">
            <div className="apple-card p-4">
              <h3 className="text-sm font-medium mb-3">Add Content</h3>
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => addCard('insight')}
                  className="w-full justify-start hover:bg-accent"
                >
                  💡 Add Insight
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => addCard('hook')}
                  className="w-full justify-start hover:bg-accent"
                >
                  🎯 Add Hook
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => addCard('capture')}
                  className="w-full justify-start hover:bg-accent"
                >
                  📸 Add Capture
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-7">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="define" className="text-sm font-medium">Define</TabsTrigger>
              <TabsTrigger value="shift" className="text-sm font-medium">Shift</TabsTrigger>
              <TabsTrigger value="deliver" className="text-sm font-medium">Deliver</TabsTrigger>
            </TabsList>
            
            <div className="space-y-6">
              <TabsContent value="define" className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Define</h2>
                  <p className="text-muted-foreground">Set your objectives, audience, and core requirements</p>
                </div>
                <Section items={define} />
              </TabsContent>
              
              <TabsContent value="shift" className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Shift</h2>
                  <p className="text-muted-foreground">Define your positioning and key messages</p>
                </div>
                <Section items={shift} />
              </TabsContent>
              
              <TabsContent value="deliver" className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Deliver</h2>
                  <p className="text-muted-foreground">Plan your execution and deliverables</p>
                </div>
                <Section items={deliver} />
              </TabsContent>
            </div>
          </Tabs>
        </section>

        <aside className="lg:col-span-3">
          <div className="sticky top-6 space-y-4">
            <div className="apple-card p-4">
              <h3 className="text-sm font-medium mb-3">AI Suggestions</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground">TRENDING INSIGHT</p>
                  <p className="text-sm mt-1">Sustainable packaging is resonating with Gen Z consumers</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground">HOOK SUGGESTION</p>
                  <p className="text-sm mt-1">"What if your packaging could disappear?"</p>
                </div>
              </div>
            </div>
            
            <div className="apple-card p-4">
              <h3 className="text-sm font-medium mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Cards</span>
                  <span className="font-medium">{define.length + shift.length + deliver.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{status}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default BriefBuilderV2

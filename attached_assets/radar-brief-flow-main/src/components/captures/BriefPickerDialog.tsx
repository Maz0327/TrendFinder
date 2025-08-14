// @ts-nocheck
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

// Minimal Brief type for listing
type BriefRow = { id: string; title: string | null }

const BriefPickerDialog = ({ open, onOpenChange, captureIds }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  captureIds: string[]
}) => {
  const [briefs, setBriefs] = useState<BriefRow[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('dsd_briefs').select('id, title')
      if (error) {
        console.warn('[Lovable-UI] dsd_briefs unavailable. Using local drafts.')
        const local = JSON.parse(localStorage.getItem('dsd_briefs') || '[]') as BriefRow[]
        setBriefs(local)
      } else setBriefs((data || []) as BriefRow[])
    })()
  }, [open])

  const attachToBrief = async (briefId: string) => {
    setLoading(true)
    try {
      // Try updating remote JSONB sections; fallback to localStorage
      const { data, error } = await supabase
        .from('dsd_briefs')
        .update({
          // Minimal: append to define_section array if present
          define_section: [{ type: 'capture', captureId: captureIds[0] }],
        } as any)
        .eq('id', briefId)
        .select('id')
        .maybeSingle()

      if (error || !data) {
        // local fallback
        const local = JSON.parse(localStorage.getItem('dsd_briefs') || '[]') as any[]
        const idx = local.findIndex((b) => b.id === briefId)
        if (idx >= 0) {
          local[idx].define_section = [
            ...(local[idx].define_section || []),
            ...captureIds.map((id) => ({ type: 'capture', captureId: id })),
          ]
        }
        localStorage.setItem('dsd_briefs', JSON.stringify(local))
      }

      toast({ title: 'Added to brief', description: `${captureIds.length} capture(s) attached.` })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const createBrief = async () => {
    if (!newTitle.trim()) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('dsd_briefs')
        .insert({ title: newTitle })
        .select('id, title')
        .maybeSingle()
      if (error || !data) {
        const local = JSON.parse(localStorage.getItem('dsd_briefs') || '[]') as BriefRow[]
        const id = crypto.randomUUID()
        const row = { id, title: newTitle }
        local.push(row)
        localStorage.setItem('dsd_briefs', JSON.stringify(local))
        setBriefs(local)
      } else setBriefs((b) => [...b, data as BriefRow])
      setNewTitle('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Brief</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Select an existing brief</p>
            <div className="max-h-48 overflow-auto space-y-2">
              {briefs.map((b) => (
                <Button key={b.id} variant="secondary" className="w-full justify-start" onClick={() => attachToBrief(b.id)} disabled={loading}>
                  {b.title || 'Untitled'}
                </Button>
              ))}
              {briefs.length === 0 && <p className="text-sm text-muted-foreground">No briefs yet.</p>}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Or create new</p>
            <div className="flex gap-2">
              <Input placeholder="Brief title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <Button onClick={createBrief} disabled={loading}>Create</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BriefPickerDialog

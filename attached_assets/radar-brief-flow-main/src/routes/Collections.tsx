import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export type ReferenceCard = { type: 'reference'; title?: string; url?: string; imageUrl?: string }

const Collections = () => {
  const [items, setItems] = useState<ReferenceCard[]>([])
  useEffect(() => { document.title = 'Collections — Content Radar' }, [])
  useEffect(() => {
    const local = JSON.parse(localStorage.getItem('collections') || '[]') as ReferenceCard[]
    setItems(local)
  }, [])
  const addSample = () => {
    const newItem: ReferenceCard = { type: 'reference', title: 'Sample reference', url: 'https://example.com' }
    const next: ReferenceCard[] = [newItem, ...items]
    setItems(next)
    localStorage.setItem('collections', JSON.stringify(next))
  }
  return (
    <main className="max-w-6xl mx-auto py-8 px-6 animate-fade-in">
      <header className="mb-12">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-title mb-3">Collections</h1>
            <p className="text-lg text-muted-foreground">Organize your references and resources</p>
          </div>
          <Button onClick={addSample} className="px-6">
            Add Sample
          </Button>
        </div>
      </header>
      
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((r, i) => (
          <Card key={i} className="p-6 group cursor-pointer">
            <div className="flex flex-col h-full">
              <h3 className="font-semibold text-lg mb-3 text-card-foreground group-hover:text-primary transition-colors">
                {r.title || 'Untitled Reference'}
              </h3>
              <div className="mt-auto">
                <a 
                  href={r.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open Reference
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </Card>
        ))}
        
        {items.length === 0 && (
          <div className="col-span-full text-center py-20">
            <div className="w-16 h-16 bg-system-gray-5 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-system-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Collections Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Start building your reference library by adding your first collection
            </p>
            <Button onClick={addSample}>
              Add Your First Reference
            </Button>
          </div>
        )}
      </section>
    </main>
  )
}

export default Collections

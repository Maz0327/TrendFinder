import React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Camera, Wand2, Tag, Settings, Link as LinkIcon, Save, Search } from "lucide-react"
import Annotator from "@/components/annotator/Annotator"

function useSEO() {
  useEffect(() => {
    const title = "Chrome Extension UI Preview"
    const description = "Preview the Chrome extension UI: popup, options, and capture overlay."
    const canonicalHref = `${window.location.origin}/extension-preview`

    document.title = title

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement("meta")
        el.setAttribute("name", name)
        document.head.appendChild(el)
      }
      el.setAttribute("content", content)
    }

    setMeta("description", description)

    let linkEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!linkEl) {
      linkEl = document.createElement("link")
      linkEl.setAttribute("rel", "canonical")
      document.head.appendChild(linkEl)
    }
    linkEl.setAttribute("href", canonicalHref)

    return () => {
      // no-op cleanup to avoid removing global tags shared by other pages
    }
  }, [])
}

const PopupPreview: React.FC = () => {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [tags, setTags] = useState("")
  const [note, setNote] = useState("")
  const [addToProject, setAddToProject] = useState(true)
  const [autoSummarize, setAutoSummarize] = useState(true)

  const onCapture = () => {
    toast({
      title: "Captured + summarized",
      description: "Your page snapshot was saved with AI summary.",
    })
  }

  return (
    <section aria-label="Extension popup preview" className="w-full">
      <div className="mx-auto max-w-[380px]">
        <Card className="border-border/50 bg-gradient-surface shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Camera className="h-4 w-4 text-primary" /> Popup
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Current page title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input id="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={() => setUrl(window.location.href)}>
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags" className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> Tags
              </Label>
              <Input id="tags" placeholder="e.g. genai, strategy, competitor" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Quick note</Label>
              <Textarea id="note" placeholder="Why is this relevant?" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">AI summarize</span>
              </div>
              <Switch checked={autoSummarize} onCheckedChange={setAutoSummarize} aria-label="Enable AI summarize" />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">Add to current project</span>
              </div>
              <Switch checked={addToProject} onCheckedChange={setAddToProject} aria-label="Add to project" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={onCapture}>
                <Camera className="h-4 w-4" /> Capture + Summarize
              </Button>
              <Button className="flex-1" variant="secondary" onClick={() => toast({ title: "Saved", description: "Saved without summary." })}>
                <Save className="h-4 w-4" /> Save only
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

const OptionsPreview: React.FC = () => {
  const [enableShortcut, setEnableShortcut] = useState(true)
  const [shortcut, setShortcut] = useState("Ctrl+Shift+S")
  const [autoTag, setAutoTag] = useState(true)
  const [showOverlayHints, setShowOverlayHints] = useState(true)

  return (
    <section aria-label="Extension options preview" className="w-full">
      <Card className="border-border/50 bg-gradient-surface shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Settings className="h-4 w-4 text-primary" /> Options
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Enable keyboard shortcut</p>
              <p className="text-xs text-muted-foreground">Quick capture with a single key combo</p>
            </div>
            <Switch checked={enableShortcut} onCheckedChange={setEnableShortcut} aria-label="Enable shortcut" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shortcut">Shortcut</Label>
            <Input id="shortcut" value={shortcut} onChange={(e) => setShortcut(e.target.value)} />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-tag content</p>
              <p className="text-xs text-muted-foreground">Use AI to extract keywords</p>
            </div>
            <Switch checked={autoTag} onCheckedChange={setAutoTag} aria-label="Auto-tag" />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Show overlay hints</p>
              <p className="text-xs text-muted-foreground">Display tooltips in the capture overlay</p>
            </div>
            <Switch checked={showOverlayHints} onCheckedChange={setShowOverlayHints} aria-label="Show hints" />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => toast({ title: "Options saved", description: "Your preferences were updated." })}>
              <Save className="h-4 w-4" /> Save options
            </Button>
            <Button variant="secondary" onClick={() => toast({ title: "Reset to defaults" })}>Reset</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

const OverlayPreview: React.FC = () => {
  const [open, setOpen] = useState(false)

  const onSave = () => {
    setOpen(false)
    toast({ title: "Overlay saved", description: "Content captured from the page." })
  }

  return (
    <section aria-label="Capture overlay preview" className="w-full">
      <div className="grid gap-4">
        <Card className="border-border/50 bg-gradient-surface shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Search className="h-4 w-4 text-primary" /> In-page Capture Overlay
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-muted-foreground">This simulates the in-page overlay the extension injects on any site.</p>

            <div className="rounded-md border bg-card">
              <div className="flex items-center justify-between border-b p-2">
                <span className="text-xs text-muted-foreground">Mock webpage</span>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Camera className="h-4 w-4" /> Open overlay
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Capture overlay</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="ov-title">Title</Label>
                        <Input id="ov-title" placeholder="Detected page title" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="ov-summary">AI summary</Label>
                        <Textarea id="ov-summary" placeholder="Auto-generated summary will appear here" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="ov-tags">Tags</Label>
                        <Input id="ov-tags" placeholder="keywords, topics" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={onSave} className="flex-1">
                          <Save className="h-4 w-4" /> Save capture
                        </Button>
                        <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                <img
                  src="/placeholder.svg"
                  alt="Webpage preview placeholder"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

const ExtensionPreview: React.FC = () => {
  useSEO()

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Chrome Extension UI Preview</h1>
        <p className="text-sm text-muted-foreground">Popup, Options, and in-page Capture Overlay</p>
      </header>

      <main>
        <Tabs defaultValue="popup" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="popup">Popup</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="overlay">Overlay</TabsTrigger>
            <TabsTrigger value="annotator">Annotator</TabsTrigger>
          </TabsList>
          <TabsContent value="popup">
            <PopupPreview />
          </TabsContent>
          <TabsContent value="options">
            <OptionsPreview />
          </TabsContent>
          <TabsContent value="overlay">
            <OverlayPreview />
          </TabsContent>
          <TabsContent value="annotator">
            <Annotator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default ExtensionPreview

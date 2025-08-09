import React, { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Brush, Square, Crop, Undo2, ZoomIn, ZoomOut, Upload, Camera, Download, Copy
} from "lucide-react"
import html2canvas from "html2canvas"
import { Canvas as FabricCanvas, Rect, Image as FabricImage, PencilBrush } from "fabric"

// Minimal, focused annotator with drag-to-crop and highlight tools
// Tools: Upload image, Capture page, Freehand highlight, Rectangle highlight, Crop, Undo, Zoom, Export

export const Annotator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null)
  const [activeTool, setActiveTool] = useState<"select" | "draw" | "rect" | "crop">("select")
  const [zoom, setZoom] = useState(1)

  // Crop helpers
  const cropRectRef = useRef<Rect | null>(null)
  const isPointerDownRef = useRef(false)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)

  // Simple history (undo)
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)

  const saveHistory = useCallback(() => {
    if (!fabricCanvas) return
    // Truncate future states
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    }
    const json = JSON.stringify(fabricCanvas.toJSON())
    historyRef.current.push(json)
    historyIndexRef.current = historyRef.current.length - 1
  }, [fabricCanvas])

  const undo = useCallback(() => {
    if (!fabricCanvas) return
    if (historyIndexRef.current <= 0) {
      toast("Nothing to undo")
      return
    }
    historyIndexRef.current -= 1
    const json = historyRef.current[historyIndexRef.current]
    fabricCanvas.loadFromJSON(json, () => {
      fabricCanvas.renderAll()
      setActiveTool("select")
    })
  }, [fabricCanvas])

  // Initialize Fabric
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 960,
      height: 540,
      backgroundColor: "#ffffff",
      selection: true,
    })

    // Default free drawing brush (Fabric v6 requires explicit brush instance)
    const brush = new PencilBrush(canvas)
    brush.color = "rgba(245,158,11,0.35)" // amber highlight
    brush.width = 10
    canvas.freeDrawingBrush = brush

    setFabricCanvas(canvas)
    toast("Annotator ready. Upload or capture to start.")

    // Initial history state
    setTimeout(() => saveHistory(), 0)

    return () => {
      canvas.dispose()
      setFabricCanvas(null)
    }
  }, [])

  // Apply tool changes
  useEffect(() => {
    if (!fabricCanvas) return
    fabricCanvas.isDrawingMode = activeTool === "draw"

    // Wire crop interactions
    const handleMouseDown = (opt: any) => {
      if (activeTool !== "crop") return
      isPointerDownRef.current = true
      const p = fabricCanvas.getPointer(opt.e)
      pointerStartRef.current = { x: p.x, y: p.y }

      // Remove previous crop rect
      if (cropRectRef.current) {
        fabricCanvas.remove(cropRectRef.current)
        cropRectRef.current = null
      }

      const rect = new Rect({
        left: p.x,
        top: p.y,
        width: 1,
        height: 1,
        fill: "rgba(59,130,246,0.15)", // primary tinted
        stroke: "rgba(59,130,246,0.8)",
        strokeWidth: 1,
        selectable: false,
        evented: false,
      })
      cropRectRef.current = rect
      fabricCanvas.add(rect)
    }

    const handleMouseMove = (opt: any) => {
      if (activeTool !== "crop" || !isPointerDownRef.current || !cropRectRef.current || !pointerStartRef.current) return
      const p = fabricCanvas.getPointer(opt.e)
      const start = pointerStartRef.current

      cropRectRef.current.set({
        left: Math.min(start.x, p.x),
        top: Math.min(start.y, p.y),
        width: Math.abs(p.x - start.x),
        height: Math.abs(p.y - start.y),
      })
      fabricCanvas.requestRenderAll()
    }

    const handleMouseUp = () => {
      if (activeTool !== "crop") return
      isPointerDownRef.current = false
    }

    fabricCanvas.on("mouse:down", handleMouseDown)
    fabricCanvas.on("mouse:move", handleMouseMove)
    fabricCanvas.on("mouse:up", handleMouseUp)

    return () => {
      fabricCanvas.off("mouse:down", handleMouseDown)
      fabricCanvas.off("mouse:move", handleMouseMove)
      fabricCanvas.off("mouse:up", handleMouseUp)
    }
  }, [activeTool, fabricCanvas])

  const setTool = (tool: typeof activeTool) => {
    setActiveTool(tool)
    if (tool !== "draw") {
      // ensure drawing disabled when leaving draw
      fabricCanvas && (fabricCanvas.isDrawingMode = false)
    }
  }

  const addRectHighlight = () => {
    if (!fabricCanvas) return
    const rect = new Rect({
      left: 80,
      top: 80,
      width: 220,
      height: 120,
      rx: 6,
      ry: 6,
      fill: "rgba(245,158,11,0.25)", // amber highlight
      stroke: "rgba(245,158,11,0.9)",
      strokeWidth: 2,
    })
    fabricCanvas.add(rect)
    fabricCanvas.setActiveObject(rect)
    fabricCanvas.requestRenderAll()
    saveHistory()
  }

  const applyCrop = async () => {
    if (!fabricCanvas || !cropRectRef.current) {
      toast("Draw a crop area first")
      return
    }

    const r = cropRectRef.current
    const left = r.left ?? 0
    const top = r.top ?? 0
    const width = (r.width ?? 0) * (r.scaleX ?? 1)
    const height = (r.height ?? 0) * (r.scaleY ?? 1)

    if (width < 5 || height < 5) {
      toast("Crop area too small")
      return
    }

    // Export cropped image
    const dataUrl = fabricCanvas.toDataURL({ left, top, width, height, format: "png" as any, multiplier: 1 })

    // Replace canvas content with cropped image
    const img = new Image()
    img.onload = () => {
      fabricCanvas.clear()
      fabricCanvas.setWidth(img.width)
      fabricCanvas.setHeight(img.height)
      const fimg = new FabricImage(img, { left: 0, top: 0, selectable: false, evented: false })
      fabricCanvas.add(fimg)
      fabricCanvas.requestRenderAll()
      cropRectRef.current = null
      setTool("select")
      saveHistory()
    }
    img.src = dataUrl
  }

  const loadImageToCanvas = (img: HTMLImageElement) => {
    if (!fabricCanvas) return
    const maxW = 1280
    const scale = img.width > maxW ? maxW / img.width : 1
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)

    fabricCanvas.clear()
    fabricCanvas.setWidth(w)
    fabricCanvas.setHeight(h)

    const fimg = new FabricImage(img, { left: 0, top: 0, selectable: false, evented: false })
    fimg.scale(scale) // if needed
    fabricCanvas.add(fimg)
    
    fabricCanvas.requestRenderAll()
    saveHistory()
  }

  const onFileChange = (file?: File | null) => {
    if (!file) return
    const img = new Image()
    img.onload = () => loadImageToCanvas(img)
    img.onerror = () => toast.error("Failed to load image")
    img.src = URL.createObjectURL(file)
  }

  const capturePage = async () => {
    try {
      const node = document.body
      const cap = await html2canvas(node, { useCORS: true, backgroundColor: "#ffffff", scale: window.devicePixelRatio })
      const img = new Image()
      img.onload = () => loadImageToCanvas(img)
      img.src = cap.toDataURL("image/png", 1.0)
      toast.success("Captured page into canvas")
    } catch (e) {
      console.error(e)
      toast.error("Capture failed")
    }
  }

  const changeZoom = (delta: number) => {
    if (!fabricCanvas) return
    const next = Math.min(4, Math.max(0.25, zoom + delta))
    setZoom(next)
    fabricCanvas.setZoom(next as any)
    fabricCanvas.requestRenderAll()
  }

  const downloadPng = () => {
    if (!fabricCanvas) return
    const dataUrl = fabricCanvas.toDataURL({ format: "png" as any, multiplier: 1 })
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = "annotation.png"
    a.click()
  }

  const copyPng = async () => {
    if (!fabricCanvas) return
    try {
      const dataUrl = fabricCanvas.toDataURL({ format: "png" as any, multiplier: 1 })
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const ClipboardItemCtor = (window as any).ClipboardItem
      if (navigator && (navigator as any).clipboard && (navigator as any).clipboard.write && ClipboardItemCtor) {
        const item = new ClipboardItemCtor({ "image/png": blob })
        await (navigator as any).clipboard.write([item])
        toast.success("Copied to clipboard")
      } else {
        throw new Error("Clipboard API not supported")
      }
    } catch (e) {
      console.error(e)
      toast.error("Clipboard copy not supported here")
    }
  }

  return (
    <section aria-label="Screenshot annotator" className="w-full">
      <div className="grid gap-3">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="annotator-upload">Upload image</label>
          <input id="annotator-upload" type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
          <Button variant="secondary" onClick={() => document.getElementById("annotator-upload")?.click()}>
            <Upload className="h-4 w-4" /> Upload
          </Button>
          <Button variant="secondary" onClick={capturePage}>
            <Camera className="h-4 w-4" /> Capture page
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button variant={activeTool === "draw" ? "default" : "secondary"} onClick={() => setTool("draw")} title="Freehand highlight">
            <Brush className="h-4 w-4" /> Draw
          </Button>
          <Button variant="secondary" onClick={addRectHighlight} title="Rectangle highlight">
            <Square className="h-4 w-4" /> Rect
          </Button>
          <Button variant={activeTool === "crop" ? "default" : "secondary"} onClick={() => setTool("crop")} title="Drag to select crop area">
            <Crop className="h-4 w-4" /> Crop
          </Button>
          <Button variant="outline" onClick={applyCrop} title="Apply crop">
            Apply crop
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button variant="secondary" onClick={undo}>
            <Undo2 className="h-4 w-4" /> Undo
          </Button>
          <Button variant="secondary" onClick={() => changeZoom(0.25)}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={() => changeZoom(-0.25)}>
            <ZoomOut className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button onClick={downloadPng}>
            <Download className="h-4 w-4" /> Download
          </Button>
          <Button variant="secondary" onClick={copyPng}>
            <Copy className="h-4 w-4" /> Copy
          </Button>
        </div>

        {/* Canvas */}
        <div className="overflow-auto rounded-md border bg-card p-2">
          <div className="inline-block border border-border bg-background">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Annotator

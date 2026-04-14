"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Upload, ImageIcon, Tag, X, ZoomIn, ZoomOut, Maximize2, Loader2, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { 
  ImageGraphNode, ImageGraphEdge, SimImageNode, 
  INITIAL_IMAGE_NODES, INITIAL_IMAGE_EDGES, initImageSimNodes 
} from "@/lib/image-graph-data"

// Simulation constants
const REPULSION_IMG = 25000
const REPULSION_KW = 4000
const SPRING_K = 0.08
const SPRING_DIST = 120
const GRAVITY = 0.0005
const DAMPING = 0.82
const ALPHA_DECAY = 0.99
const MIN_ALPHA = 0.005

function simTick(nodes: SimImageNode[], edges: ImageGraphEdge[], alpha: number, width: number, height: number): SimImageNode[] {
  const out = nodes.map(n => ({ ...n }))
  const n = out.length
  const cx = width / 2
  const cy = height / 2

  // Repulsion
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = out[i].x - out[j].x
      const dy = out[i].y - out[j].y
      let dist = Math.sqrt(dx * dx + dy * dy)
      if (dist === 0) dist = 0.1
      
      const forceI = out[i].type === "image" ? REPULSION_IMG : REPULSION_KW
      const forceJ = out[j].type === "image" ? REPULSION_IMG : REPULSION_KW
      const force = ((forceI + forceJ) / 2) / (dist * dist)
      
      const fx = (dx / dist) * force * alpha
      const fy = (dy / dist) * force * alpha
      
      if (!out[i].pinned) { out[i].vx += fx; out[i].vy += fy }
      if (!out[j].pinned) { out[j].vx -= fx; out[j].vy -= fy }
    }
  }

  // Springs (Edges)
  edges.forEach(edge => {
    const source = out.find(n => n.id === edge.source)
    const target = out.find(n => n.id === edge.target)
    if (!source || !target) return

    const dx = target.x - source.x
    const dy = target.y - source.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.1
    
    const displacement = dist - SPRING_DIST
    const force = SPRING_K * displacement * alpha
    const fx = (dx / dist) * force
    const fy = (dy / dist) * force

    if (!source.pinned) { source.vx += fx; source.vy += fy }
    if (!target.pinned) { target.vx -= fx; target.vy -= fy }
  })

  // Gravity & Integration
  out.forEach(node => {
    if (!node.pinned) {
      node.vx += (cx - node.x) * GRAVITY * alpha
      node.vy += (cy - node.y) * GRAVITY * alpha
      node.vx *= DAMPING
      node.vy *= DAMPING
      node.x += node.vx
      node.y += node.vy
    }
  })

  return out
}

export default function ImageInterceptorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 })
  
  const [nodes, setNodes] = useState<ImageGraphNode[]>(INITIAL_IMAGE_NODES)
  const [edges, setEdges] = useState<ImageGraphEdge[]>(INITIAL_IMAGE_EDGES)
  const simNodesRef = useRef<SimImageNode[]>([])
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done">("idle")
  
  // Viewport transforms
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })

  // Init simulation
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current
      setDimensions({ w: clientWidth, h: clientHeight })
      simNodesRef.current = initImageSimNodes(nodes, clientWidth, clientHeight)
    }
  }, [nodes])

  // Physics Loop
  useEffect(() => {
    let alpha = 1
    let frameId: number
    const loop = () => {
      if (alpha > MIN_ALPHA && simNodesRef.current.length > 0) {
        simNodesRef.current = simTick(simNodesRef.current, edges, alpha, dimensions.w, dimensions.h)
        alpha *= ALPHA_DECAY
      }
      draw()
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [edges, dimensions, transform, selectedNodeId])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(transform.x, transform.y)
    ctx.scale(transform.scale, transform.scale)

    // Draw edges
    ctx.lineWidth = 1.5
    edges.forEach(edge => {
      const source = simNodesRef.current.find(n => n.id === edge.source)
      const target = simNodesRef.current.find(n => n.id === edge.target)
      if (!source || !target) return

      const isHighlight = selectedNodeId === source.id || selectedNodeId === target.id
      ctx.strokeStyle = isHighlight ? "rgba(14, 165, 233, 0.6)" : "rgba(150, 150, 150, 0.2)"
      ctx.beginPath()
      ctx.moveTo(source.x, source.y)
      ctx.lineTo(target.x, target.y)
      ctx.stroke()
    })

    // Draw nodes
    simNodesRef.current.forEach(node => {
      const isSelected = node.id === selectedNodeId
      
      if (node.type === "image") {
        ctx.fillStyle = isSelected ? "#0ea5e9" : "#1e293b" // Sky blue if selected, else slate
        ctx.strokeStyle = isSelected ? "#bae6fd" : "#475569"
        ctx.lineWidth = isSelected ? 4 : 2
        
        ctx.beginPath()
        ctx.arc(node.x, node.y, 24, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
        
        // Draw icon inside
        ctx.fillStyle = "#ffffff"
        ctx.font = '14px "Lucide"' // Fallback to text if icon font not loaded
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("IMG", node.x, node.y)
        
      } else {
        // Keyword nodes
        ctx.fillStyle = isSelected ? "#0ea5e9" : "#f1f5f9"
        ctx.strokeStyle = isSelected ? "#bae6fd" : "#cbd5e1"
        ctx.lineWidth = 2
        
        const paddingX = 12
        const paddingY = 6
        ctx.font = "12px sans-serif"
        const textWidth = ctx.measureText(node.label).width
        const width = textWidth + paddingX * 2
        const height = 24
        
        ctx.beginPath()
        ctx.roundRect(node.x - width/2, node.y - height/2, width, height, 12)
        ctx.fill()
        ctx.stroke()
        
        ctx.fillStyle = isSelected ? "#ffffff" : "#334155"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(node.label, node.x, node.y)
      }
    })
    ctx.restore()
  }, [edges, transform, selectedNodeId])

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    }))
  }

  const handleMouseUp = () => { isDragging.current = false }

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const clickX = (e.clientX - rect.left - transform.x) / transform.scale
    const clickY = (e.clientY - rect.top - transform.y) / transform.scale

    // Check hit starting from images, then keywords
    const hitNode = simNodesRef.current.find(n => {
      const radius = n.type === "image" ? 24 : 30
      const dx = n.x - clickX
      const dy = n.y - clickY
      return Math.sqrt(dx * dx + dy * dy) <= radius
    })

    setSelectedNodeId(hitNode ? hitNode.id : null)
  }

  // Upload Simulation
  const handleUpload = () => {
    setUploadState("uploading")
    setTimeout(() => {
      // Simulate adding a new image and keywords
      const newImgId = `img-new-${Date.now()}`
      const newKwId = `kw-new-${Date.now()}`
      
      setNodes(prev => [
        ...prev, 
        { id: newImgId, label: "New Upload", type: "image", imageUrl: "/images/new-product.jpg", hitCount: 0, lastUpdated: new Date().toISOString().split('T')[0] },
        { id: newKwId, label: "new-trend", type: "keyword", hitCount: 0, lastUpdated: new Date().toISOString().split('T')[0] }
      ])
      
      setEdges(prev => [
        ...prev,
        { id: `e-new-1`, source: newImgId, target: newKwId },
        { id: `e-new-2`, source: newImgId, target: "kw-apparel" } // Connect to existing
      ])
      
      setUploadState("done")
      setTimeout(() => setUploadState("idle"), 3000)
    }, 1500)
  }

  const selectedNode = nodes.find(n => n.id === selectedNodeId)
  const connectedEdges = edges.filter(e => e.source === selectedNodeId || e.target === selectedNodeId)
  const connectedNodes = connectedEdges.map(e => {
    const targetId = e.source === selectedNodeId ? e.target : e.source
    return nodes.find(n => n.id === targetId)!
  })

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background pt-16 lg:flex-row lg:pt-0">
      
      {/* Main Canvas Area */}
      <div className="relative flex-1 overflow-hidden" ref={containerRef}>
        <div className="absolute left-6 top-6 z-10">
          <h1 className="text-2xl font-bold text-foreground">Semantic Image Cache</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualizing relationships between generated images and semantic keywords.
          </p>
        </div>

        {/* Toolbar */}
        <div className="absolute right-6 top-6 z-10 flex gap-2">
          <div className="flex rounded-lg border border-border bg-card shadow-sm">
            <button onClick={() => setTransform(p => ({ ...p, scale: p.scale * 1.2 }))} className="p-2 hover:bg-muted transition-colors border-r border-border">
              <ZoomIn className="size-4 text-foreground" />
            </button>
            <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="p-2 hover:bg-muted transition-colors border-r border-border">
              <Maximize2 className="size-4 text-foreground" />
            </button>
            <button onClick={() => setTransform(p => ({ ...p, scale: p.scale / 1.2 }))} className="p-2 hover:bg-muted transition-colors">
              <ZoomOut className="size-4 text-foreground" />
            </button>
          </div>
          
          <button 
            onClick={handleUpload}
            disabled={uploadState !== "idle"}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {uploadState === "uploading" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Upload Image
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={dimensions.w}
          height={dimensions.h}
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
        />
      </div>

      {/* Sidebar Panel */}
      <div className="w-full border-l border-border bg-card p-6 shadow-xl lg:w-96 overflow-y-auto">
        {!selectedNode ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No node selected</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Click on an image or keyword in the graph to view relationships and cached data.
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <Badge variant={selectedNode.type === "image" ? "default" : "secondary"} className="mb-2">
                  {selectedNode.type === "image" ? "Cached Image" : "Semantic Tag"}
                </Badge>
                <h2 className="text-xl font-bold text-foreground capitalize">{selectedNode.label}</h2>
              </div>
              <button onClick={() => setSelectedNodeId(null)} className="rounded-md p-1 hover:bg-muted">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>

            {/* If it's an Image node, show a placeholder image box */}
            {selectedNode.type === "image" && (
              <div className="mb-6 aspect-video w-full rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                {/* Embed an actual image here using next/image once you have the assets */}
                <div className="flex flex-col items-center opacity-50">
                  <ImageIcon className="size-8 mb-2" />
                  <span className="text-xs font-mono">{selectedNode.imageUrl}</span>
                </div>
              </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/50 p-4">
              <div>
                <p className="text-[10px] font-medium uppercase text-muted-foreground">Cache Hits</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{selectedNode.hitCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-muted-foreground">Last Updated</p>
                <p className="mt-1 text-sm font-medium text-foreground">{selectedNode.lastUpdated}</p>
              </div>
            </div>

            <h3 className="mb-3 text-sm font-semibold text-foreground">
              {selectedNode.type === "image" ? "Semantic Keywords" : "Associated Images"}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {connectedNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  {node.type === "keyword" ? <Tag className="size-3" /> : <ImageIcon className="size-3" />}
                  {node.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Toast */}
      {uploadState === "done" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl border border-border bg-card px-5 py-3 shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4">
          <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10">
            <Check className="size-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Image Analyzed & Cached</p>
            <p className="text-xs text-muted-foreground">Keywords successfully mapped to graph.</p>
          </div>
        </div>
      )}
    </div>
  )
}
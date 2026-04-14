export type NodeType = "image" | "keyword"

export interface ImageGraphNode {
  id: string
  label: string
  type: NodeType
  imageUrl?: string // Added for images you want to display
  hitCount: number
  lastUpdated: string
}

export interface ImageGraphEdge {
  id: string
  source: string
  target: string
}

export interface SimImageNode extends ImageGraphNode {
  x: number
  y: number
  vx: number
  vy: number
  pinned: boolean
}

// Mock Data for the Demo
export const INITIAL_IMAGE_NODES: ImageGraphNode[] = [
  // Images
  { id: "img-1", label: "Coffee Mug", type: "image", imageUrl: "/images/mug.jpg", hitCount: 1250, lastUpdated: "2026-04-10" },
  { id: "img-2", label: "Basic T-Shirt", type: "image", imageUrl: "/images/tshirt.jpg", hitCount: 3420, lastUpdated: "2026-04-12" },
  { id: "img-3", label: "Desk Lamp", type: "image", imageUrl: "/images/lamp.jpg", hitCount: 890, lastUpdated: "2026-04-14" },
  
  // Keywords
  { id: "kw-ceramic", label: "ceramic", type: "keyword", hitCount: 500, lastUpdated: "2026-04-10" },
  { id: "kw-drinkware", label: "drinkware", type: "keyword", hitCount: 800, lastUpdated: "2026-04-10" },
  { id: "kw-white", label: "white", type: "keyword", hitCount: 4200, lastUpdated: "2026-04-12" },
  { id: "kw-apparel", label: "apparel", type: "keyword", hitCount: 2100, lastUpdated: "2026-04-12" },
  { id: "kw-cotton", label: "cotton", type: "keyword", hitCount: 1800, lastUpdated: "2026-04-12" },
  { id: "kw-furniture", label: "furniture", type: "keyword", hitCount: 300, lastUpdated: "2026-04-14" },
  { id: "kw-lighting", label: "lighting", type: "keyword", hitCount: 450, lastUpdated: "2026-04-14" },
]

export const INITIAL_IMAGE_EDGES: ImageGraphEdge[] = [
  { id: "e1", source: "img-1", target: "kw-ceramic" },
  { id: "e2", source: "img-1", target: "kw-drinkware" },
  { id: "e3", source: "img-1", target: "kw-white" },
  
  { id: "e4", source: "img-2", target: "kw-apparel" },
  { id: "e5", source: "img-2", target: "kw-cotton" },
  { id: "e6", source: "img-2", target: "kw-white" }, // Shared keyword
  
  { id: "e7", source: "img-3", target: "kw-furniture" },
  { id: "e8", source: "img-3", target: "kw-lighting" },
]

export function initImageSimNodes(nodes: ImageGraphNode[], width: number, height: number): SimImageNode[] {
  const cx = width / 2
  const cy = height / 2

  const images = nodes.filter(n => n.type === "image")
  const imgPos = new Map<string, { x: number; y: number }>()
  
  images.forEach((img, i) => {
    const angle = (i / images.length) * 2 * Math.PI - Math.PI / 2
    imgPos.set(img.id, {
      x: cx + 250 * Math.cos(angle),
      y: cy + 200 * Math.sin(angle),
    })
  })

  return nodes.map(node => {
    if (node.type === "image") {
      const pos = imgPos.get(node.id) ?? { x: cx, y: cy }
      return { ...node, x: pos.x, y: pos.y, vx: 0, vy: 0, pinned: false }
    }
    // Scatter keywords around the center initially
    return { 
      ...node, 
      x: cx + (Math.random() - 0.5) * 100, 
      y: cy + (Math.random() - 0.5) * 100, 
      vx: 0, 
      vy: 0, 
      pinned: false 
    }
  })
}
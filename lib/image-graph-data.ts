export type NodeType = "image" | "keyword"

export interface ImageGraphNode {
  id: string
  label: string
  type: NodeType
  imageUrl?: string 
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

// Expanded Mock Data for the Demo
export const INITIAL_IMAGE_NODES: ImageGraphNode[] = [
  // --- IMAGES ---
  { id: "img-1", label: "Coffee Mug", type: "image", imageUrl: "/images/mug.png", hitCount: 1250, lastUpdated: "2026-04-10" },
  { id: "img-2", label: "Basic T-Shirt", type: "image", imageUrl: "/images/tshirt.jpg", hitCount: 3420, lastUpdated: "2026-04-12" },
  { id: "img-3", label: "Desk Lamp", type: "image", imageUrl: "/images/lamp.png", hitCount: 890, lastUpdated: "2026-04-14" },
  { id: "img-4", label: "Wireless Earbuds", type: "image", imageUrl: "/images/earbuds.png", hitCount: 5600, lastUpdated: "2026-04-14" },
  { id: "img-5", label: "Running Shoes", type: "image", imageUrl: "/images/shoes.png", hitCount: 2100, lastUpdated: "2026-04-13" },
  { id: "img-6", label: "Yoga Mat", type: "image", imageUrl: "/images/yogamat.png", hitCount: 1150, lastUpdated: "2026-04-11" },
  { id: "img-7", label: "Smart Watch", type: "image", imageUrl: "/images/watch.png", hitCount: 4200, lastUpdated: "2026-04-14" },
  
  // --- KEYWORDS ---
  { id: "kw-ceramic", label: "ceramic", type: "keyword", hitCount: 500, lastUpdated: "2026-04-10" },
  { id: "kw-drinkware", label: "drinkware", type: "keyword", hitCount: 800, lastUpdated: "2026-04-10" },
  { id: "kw-white", label: "white", type: "keyword", hitCount: 4200, lastUpdated: "2026-04-12" },
  { id: "kw-black", label: "black", type: "keyword", hitCount: 5100, lastUpdated: "2026-04-14" },
  { id: "kw-apparel", label: "apparel", type: "keyword", hitCount: 2100, lastUpdated: "2026-04-12" },
  { id: "kw-cotton", label: "cotton", type: "keyword", hitCount: 1800, lastUpdated: "2026-04-12" },
  { id: "kw-furniture", label: "furniture", type: "keyword", hitCount: 300, lastUpdated: "2026-04-14" },
  { id: "kw-lighting", label: "lighting", type: "keyword", hitCount: 450, lastUpdated: "2026-04-14" },
  { id: "kw-electronics", label: "electronics", type: "keyword", hitCount: 9800, lastUpdated: "2026-04-14" },
  { id: "kw-audio", label: "audio", type: "keyword", hitCount: 3200, lastUpdated: "2026-04-14" },
  { id: "kw-fitness", label: "fitness", type: "keyword", hitCount: 4500, lastUpdated: "2026-04-13" },
  { id: "kw-footwear", label: "footwear", type: "keyword", hitCount: 1900, lastUpdated: "2026-04-13" },
  { id: "kw-accessories", label: "accessories", type: "keyword", hitCount: 6700, lastUpdated: "2026-04-14" },
  { id: "kw-minimalist", label: "minimalist", type: "keyword", hitCount: 8900, lastUpdated: "2026-04-14" },
]

export const INITIAL_IMAGE_EDGES: ImageGraphEdge[] = [
  // Mug connections
  { id: "e1", source: "img-1", target: "kw-ceramic" },
  { id: "e2", source: "img-1", target: "kw-drinkware" },
  { id: "e3", source: "img-1", target: "kw-black" },
  { id: "e-m-min", source: "img-1", target: "kw-minimalist" },
  
  // T-Shirt connections
  { id: "e4", source: "img-2", target: "kw-apparel" },
  { id: "e5", source: "img-2", target: "kw-cotton" },
  { id: "e6", source: "img-2", target: "kw-white" },
  { id: "e-t-min", source: "img-2", target: "kw-minimalist" },
  
  // Lamp connections
  { id: "e7", source: "img-3", target: "kw-furniture" },
  { id: "e8", source: "img-3", target: "kw-lighting" },
  { id: "e9", source: "img-3", target: "kw-white" },
  { id: "e-l-min", source: "img-3", target: "kw-minimalist" },

  // Earbuds connections
  { id: "e10", source: "img-4", target: "kw-electronics" },
  { id: "e11", source: "img-4", target: "kw-audio" },
  { id: "e12", source: "img-4", target: "kw-accessories" },
  { id: "e13", source: "img-4", target: "kw-white" },

  // Shoes connections
  { id: "e14", source: "img-5", target: "kw-fitness" },
  { id: "e15", source: "img-5", target: "kw-footwear" },
  { id: "e16", source: "img-5", target: "kw-apparel" },
  { id: "e17", source: "img-5", target: "kw-black" },

  // Yoga Mat connections
  { id: "e18", source: "img-6", target: "kw-fitness" },
  { id: "e19", source: "img-6", target: "kw-accessories" },
  { id: "e20", source: "img-6", target: "kw-black" },

  // Smart Watch connections
  { id: "e21", source: "img-7", target: "kw-electronics" },
  { id: "e22", source: "img-7", target: "kw-fitness" },
  { id: "e23", source: "img-7", target: "kw-accessories" },
  { id: "e24", source: "img-7", target: "kw-black" },
  { id: "e25", source: "img-7", target: "kw-minimalist" },
]

export function initImageSimNodes(nodes: ImageGraphNode[], width: number, height: number): SimImageNode[] {
  const cx = width / 2
  const cy = height / 2

  const images = nodes.filter(n => n.type === "image")
  const imgPos = new Map<string, { x: number; y: number }>()
  
  // Arrange images in a wider circle to accommodate more nodes
  images.forEach((img, i) => {
    const angle = (i / images.length) * 2 * Math.PI - Math.PI / 2
    imgPos.set(img.id, {
      x: cx + 300 * Math.cos(angle), // Increased radius
      y: cy + 240 * Math.sin(angle), // Increased radius
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
      x: cx + (Math.random() - 0.5) * 150, 
      y: cy + (Math.random() - 0.5) * 150, 
      vx: 0, 
      vy: 0, 
      pinned: false 
    }
  })
}
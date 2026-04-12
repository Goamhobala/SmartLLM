"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Upload, Plus, X, Edit2, Trash2, FileText, Loader2, ZoomIn, ZoomOut, Maximize2, Check, Globe, ChevronUp, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  KBNode, KBEdge, KBProject, SimNode, CATEGORY_META,
  PAYFLOW_NODES, PAYFLOW_EDGES, initSimNodes,
} from "@/lib/kb-graph-data"
import { useKBStore, setKBState, addRagDomain, removeRagDomain } from "@/lib/kb-store"

// ─── Simulation constants ────────────────────────────────────────────────────
const REPULSION_CAT  = 22000
const REPULSION_INT  = 5000
const SPRING_K       = 0.055
const SPRING_HIER    = 130
const SPRING_REL     = 260
const GRAVITY        = 0.0008
const DAMPING        = 0.82
const ALPHA_DECAY    = 0.992
const MIN_ALPHA      = 0.002
const SIM_W          = 900
const SIM_H          = 620

function simTick(nodes: SimNode[], edges: KBEdge[], alpha: number): SimNode[] {
  const out = nodes.map(n => ({ ...n }))
  const n = out.length

  // Repulsion between every pair
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = out[i], b = out[j]
      const dx = (a.x - b.x) || 0.001
      const dy = (a.y - b.y) || 0.001
      const d2 = dx * dx + dy * dy + 1
      const d  = Math.sqrt(d2)
      const r  = (a.type === "category" || b.type === "category") ? REPULSION_CAT : REPULSION_INT
      const f  = (r / d2) * alpha
      if (!a.pinned) { a.vx += (dx / d) * f; a.vy += (dy / d) * f }
      if (!b.pinned) { b.vx -= (dx / d) * f; b.vy -= (dy / d) * f }
    }
  }

  // Spring forces along edges
  const map = new Map(out.map(nd => [nd.id, nd]))
  for (const e of edges) {
    const s = map.get(e.source), t = map.get(e.target)
    if (!s || !t) continue
    const dx = (t.x - s.x) || 0.001
    const dy = (t.y - s.y) || 0.001
    const d  = Math.sqrt(dx * dx + dy * dy) + 0.001
    const rest = e.type === "hierarchy" ? SPRING_HIER : SPRING_REL
    const f  = (d - rest) * SPRING_K * alpha
    if (!s.pinned) { s.vx += (dx / d) * f; s.vy += (dy / d) * f }
    if (!t.pinned) { t.vx -= (dx / d) * f; t.vy -= (dy / d) * f }
  }

  // Centre gravity + damping + bounds
  const cx = SIM_W / 2, cy = SIM_H / 2
  for (const nd of out) {
    if (nd.pinned) continue
    nd.vx += (cx - nd.x) * GRAVITY * alpha
    nd.vy += (cy - nd.y) * GRAVITY * alpha
    nd.vx *= DAMPING
    nd.vy *= DAMPING
    nd.x = Math.max(24, Math.min(SIM_W - 24, nd.x + nd.vx))
    nd.y = Math.max(24, Math.min(SIM_H - 24, nd.y + nd.vy))
  }
  return out
}

// ─── HoverTooltip ────────────────────────────────────────────────────────────
function HoverTooltip({
  node,
  svgRef,
  tx, ty, ts,
}: {
  node: SimNode
  svgRef: React.RefObject<SVGSVGElement | null>
  tx: number; ty: number; ts: number
}) {
  const rect = svgRef.current?.getBoundingClientRect()
  if (!rect) return null
  const r  = node.type === "category" ? 30 : 18
  const sx = node.x * ts + tx + rect.left
  const sy = node.y * ts + ty + rect.top
  // Flip left if near right edge
  const flipLeft = sx + 260 > window.innerWidth
  const meta = CATEGORY_META[node.category]
  const totalHits = node.hitCount.toLocaleString()

  return (
    <div
      style={{
        position: "fixed",
        left: flipLeft ? sx - r * ts - 12 : sx + r * ts + 12,
        top: sy,
        transform: "translateY(-50%)",
        zIndex: 100,
        pointerEvents: "none",
        maxWidth: 260,
        minWidth: 200,
      }}
      className="bg-card border border-border rounded-xl shadow-xl p-3.5"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="font-semibold text-sm text-foreground leading-tight">{node.label}</p>
        {node.type === "intent" && (
          node.status === "approved"
            ? <Badge className="shrink-0 border-transparent bg-emerald-500/10 text-emerald-600 text-[10px] px-1.5 py-0">Approved</Badge>
            : <Badge className="shrink-0 border-transparent bg-amber-500/10 text-amber-600 text-[10px] px-1.5 py-0">Pending</Badge>
        )}
      </div>

      {node.type === "category" ? (
        <p className="text-xs text-muted-foreground">{node.answer}</p>
      ) : (
        <>
          <div className="flex gap-4 mb-2">
            <div>
              <p className="text-[10px] text-muted-foreground">Hit Count</p>
              <p className="text-sm font-bold" style={{ color: meta?.color }}>{totalHits}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Category</p>
              <p className="text-xs font-medium text-foreground">{meta?.label ?? node.category}</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">{node.answer}</p>
          {node.exampleQueries.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground mb-1">Example queries</p>
              <div className="flex flex-wrap gap-1">
                {node.exampleQueries.slice(0, 3).map(q => (
                  <span key={q} className="rounded-full bg-secondary text-[10px] px-2 py-0.5 text-muted-foreground">{q}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── NodeSidebar ─────────────────────────────────────────────────────────────
function NodeSidebar({
  node,
  categories,
  onClose,
  onDelete,
  onSave,
}: {
  node: SimNode
  categories: SimNode[]
  onClose: () => void
  onDelete: (id: string) => void
  onSave: (updated: KBNode) => void
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<KBNode>(node)
  const [queries, setQueries] = useState<string[]>(node.exampleQueries.length ? node.exampleQueries : [""])

  useEffect(() => {
    setEditing(false)
    setForm(node)
    setQueries(node.exampleQueries.length ? node.exampleQueries : [""])
  }, [node.id])  // eslint-disable-line react-hooks/exhaustive-deps

  const meta = CATEGORY_META[node.category]

  const handleSave = () => {
    onSave({ ...form, exampleQueries: queries.filter(q => q.trim()) })
    setEditing(false)
  }

  const handleToggleStatus = () => {
    const newStatus = form.status === "approved" ? "pending" : "approved"
    onSave({ ...form, status: newStatus, exampleQueries: queries.filter(q => q.trim()) })
  }

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: meta?.color ?? "#94a3b8" }} />
          <p className="font-semibold text-sm text-foreground truncate">{node.label}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!editing && node.type === "intent" && (
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground transition-colors">
              <Edit2 className="size-3.5" />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground transition-colors">
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {editing ? (
          /* Edit form */
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Label</label>
              <input
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Answer</label>
              <textarea
                rows={4}
                value={form.answer}
                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as "approved" | "pending" }))}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Example Queries</label>
              <div className="mt-1 space-y-1.5">
                {queries.map((q, i) => (
                  <div key={i} className="flex gap-1">
                    <input
                      value={q}
                      onChange={e => {
                        const next = [...queries]
                        next[i] = e.target.value
                        setQueries(next)
                      }}
                      className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="Example query…"
                    />
                    <button
                      onClick={() => setQueries(queries.filter((_, j) => j !== i))}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setQueries([...queries, ""])}
                  className="text-xs text-primary hover:underline"
                >
                  + Add query
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* View mode */
          <>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{node.hitCount.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Total Hits</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                {node.status === "approved"
                  ? <Badge className="border-transparent bg-emerald-500/10 text-emerald-600">Approved</Badge>
                  : <Badge className="border-transparent bg-amber-500/10 text-amber-600">Pending Review</Badge>}
                <p className="text-[10px] text-muted-foreground mt-1">Updated {node.lastUpdated}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Verified Answer</p>
              <p className="text-sm text-foreground leading-relaxed">{node.answer}</p>
            </div>

            {node.exampleQueries.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Example Queries</p>
                <div className="flex flex-wrap gap-1.5">
                  {node.exampleQueries.map(q => (
                    <span
                      key={q}
                      className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                      style={{ backgroundColor: meta?.bg, color: meta?.color }}
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3 flex gap-2 justify-center">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Check className="size-3.5" />
              Save Changes
            </button>
            <button
              onClick={() => { setEditing(false); setForm(node); setQueries(node.exampleQueries.length ? node.exampleQueries : [""]) }}
              className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-2 w-full justify-center">
            {node.type === "intent" && (
              <button
                onClick={handleToggleStatus}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full justify-center ${
                  form.status === "approved"
                    ? "border border-amber-500/30 text-amber-600 hover:bg-amber-500/5"
                    : "border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/5"
                }`}
              >
                <Check className="size-3.5" />
                {form.status === "approved" ? "Mark for Review" : "Approve Knowledge"}
              </button>
            )}
            <button
              onClick={() => onDelete(node.id)}
              className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors w-full justify-center"
            >
              <Trash2 className="size-3.5" />
              {node.type === "category" ? "Delete Category & All Intents" : "Delete Node"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── AddNodePanel ─────────────────────────────────────────────────────────────
function AddNodePanel({
  categories,
  onClose,
  onAdd,
}: {
  categories: SimNode[]
  onClose: () => void
  onAdd: (node: KBNode) => void
}) {
  const [form, setForm] = useState({
    label: "",
    category: categories[0]?.id ?? "",
    answer: "",
    status: "approved" as "approved" | "pending",
  })
  const [queries, setQueries] = useState([""])

  const handleSubmit = () => {
    if (!form.label.trim() || !form.answer.trim()) return
    onAdd({
      id: `node-${Date.now()}`,
      label: form.label.trim(),
      type: "intent",
      category: form.category,
      answer: form.answer.trim(),
      exampleQueries: queries.filter(q => q.trim()),
      status: form.status,
      hitCount: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
    })
  }

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col overflow-hidden shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="font-semibold text-sm text-foreground">Add Knowledge Node</p>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground transition-colors">
          <X className="size-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Intent Label *</label>
          <input
            value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            placeholder="e.g. Account Recovery"
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Category *</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Verified Answer *</label>
          <textarea
            rows={4}
            value={form.answer}
            onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
            placeholder="The verified response for this intent…"
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as "approved" | "pending" }))}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="approved">Approved</option>
            <option value="pending">Pending Review</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Example Queries</label>
          <div className="mt-1 space-y-1.5">
            {queries.map((q, i) => (
              <div key={i} className="flex gap-1">
                <input
                  value={q}
                  onChange={e => {
                    const next = [...queries]
                    next[i] = e.target.value
                    setQueries(next)
                  }}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Example query…"
                />
                <button
                  onClick={() => setQueries(queries.filter((_, j) => j !== i))}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            <button onClick={() => setQueries([...queries, ""])} className="text-xs text-primary hover:underline">
              + Add query
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <button
          onClick={handleSubmit}
          disabled={!form.label.trim() || !form.answer.trim()}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="size-3.5" />
          Add to Graph
        </button>
      </div>
    </div>
  )
}

// ─── RagDomainPanel ───────────────────────────────────────────────────────────
// Manages the whitelist of domains the RAG tier is allowed to retrieve from.
// Adding a domain here does NOT add a node to the graph — it only tells the
// routing pipeline where to pull context. Answers the RAG tier generates from
// real customer queries get surfaced as pending KB nodes automatically.
function RagDomainPanel({
  onClose,
}: {
  onClose: () => void
}) {
  const { ragDomains } = useKBStore()
  const [url, setUrl]   = useState("")
  const [desc, setDesc] = useState("")

  const handleAdd = () => {
    const trimmed = url.trim()
    if (!trimmed) return
    addRagDomain(trimmed, desc.trim())
    setUrl("")
    setDesc("")
  }

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Globe className="size-3.5 text-cyan-600" />
          <p className="font-semibold text-sm text-foreground">RAG Domain Whitelist</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground transition-colors">
          <X className="size-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Explainer */}
        <div className="rounded-lg bg-cyan-500/8 border border-cyan-500/20 px-3 py-2.5 space-y-1">
          <p className="text-xs font-medium text-cyan-700">Tier 2 — RAG-Enhanced Routing</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            When a query doesn't match the KB, the gateway checks these domains. If the query is in-domain, it retrieves relevant context and routes to a cheap model. Answers get surfaced here as pending nodes — approve them to grow the KB and cut future costs.
          </p>
        </div>

        {/* Current whitelist */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Whitelisted Domains ({ragDomains.length})</p>
          <div className="space-y-2">
            {ragDomains.map(d => (
              <div key={d.id} className="flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Globe className="size-3 text-cyan-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-medium text-foreground truncate">{d.url}</p>
                  {d.description && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{d.description}</p>
                  )}
                </div>
                <button
                  onClick={() => removeRagDomain(d.id)}
                  className="p-0.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            {ragDomains.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No domains whitelisted yet.</p>
            )}
          </div>
        </div>

        {/* Add new domain */}
        <div className="pt-2 border-t border-border space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Add Domain</p>
          <div>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="e.g. developers.payflow.co.za"
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground font-mono focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <textarea
              rows={2}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="What content does this domain cover? (optional)"
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!url.trim()}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="size-3.5" />
            Add to Whitelist
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Upload stages ───────────────────────────────────────────────────────────
const UPLOAD_STAGES = [
  { text: "Parsing payflow-customer-support-faq.docx…", pct: 12 },
  { text: "Extracting Q&A pairs with LLM…",             pct: 40 },
  { text: "Generating semantic embeddings…",             pct: 68 },
  { text: "Building knowledge graph…",                   pct: 90 },
]

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function KnowledgeGraphPage() {
  // ── Project state ─────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<KBProject[]>(() => [
    { id: "payflow", name: "PayFlow", nodes: PAYFLOW_NODES, edges: PAYFLOW_EDGES, createdAt: "2026-03-01" },
  ])
  const [activeProjectId, setActiveProjectId] = useState("payflow")
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const projectsRef        = useRef<KBProject[]>(projects)
  const activeProjectIdRef = useRef(activeProjectId)

  useEffect(() => { projectsRef.current = projects },              [projects])
  useEffect(() => { activeProjectIdRef.current = activeProjectId }, [activeProjectId])

  // ── Shared KB store ───────────────────────────────────────────────────────
  const kbStore = useKBStore()

  // ── Graph state ───────────────────────────────────────────────────────────
  const [nodes, setNodes] = useState<SimNode[]>(() => initSimNodes(kbStore.nodes))
  const [edges, setEdges] = useState<KBEdge[]>(kbStore.edges)
  const [hovered, setHovered]   = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isAddingDomain, setIsAddingDomain] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(true)
  const [selectedForApproval, setSelectedForApproval] = useState<Set<string>>(new Set())
  const [uploadState, setUploadState] = useState<"idle" | "processing" | "done">("idle")
  const [uploadStageIdx, setUploadStageIdx] = useState(0)
  // Pan / zoom
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const [ts, setTs] = useState(1)

  // Refs
  const nodesRef  = useRef<SimNode[]>(nodes)
  const edgesRef  = useRef<KBEdge[]>(edges)
  const animRef   = useRef(0)
  const alphaRef  = useRef(1)
  const tickCount = useRef(0)
  const dragRef   = useRef<{ id: string } | null>(null)
  const panRef    = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const txRef     = useRef(tx)
  const tyRef     = useRef(ty)
  const tsRef     = useRef(ts)
  const svgRef    = useRef<SVGSVGElement>(null)
  const initialized = useRef(false)

  // Keep refs in sync
  useEffect(() => { nodesRef.current = nodes }, [nodes])
  useEffect(() => { edgesRef.current = edges }, [edges])
  useEffect(() => { txRef.current = tx }, [tx])
  useEffect(() => { tyRef.current = ty }, [ty])
  useEffect(() => { tsRef.current = ts }, [ts])

  // ── Sync new nodes/edges arriving from the shared store ──────────────────
  // (e.g. RAG-discovered entries added by the dashboard demo buttons)
  useEffect(() => {
    const knownIds = new Set(nodesRef.current.map(n => n.id))
    const incoming = kbStore.nodes.filter(n => !knownIds.has(n.id))
    if (incoming.length === 0) return

    const newSimNodes: SimNode[] = incoming.map(node => {
      const catNode = nodesRef.current.find(n => n.id === node.category)
      return {
        ...node,
        x: catNode ? catNode.x + (Math.random() - 0.5) * 120 : SIM_W / 2,
        y: catNode ? catNode.y + (Math.random() - 0.5) * 120 : SIM_H / 2,
        vx: 0, vy: 0, pinned: false,
      }
    })

    const knownEdgeIds = new Set(edgesRef.current.map(e => e.id))
    const newEdges = kbStore.edges.filter(e => !knownEdgeIds.has(e.id))

    nodesRef.current = [...nodesRef.current, ...newSimNodes]
    edgesRef.current = [...edgesRef.current, ...newEdges]
    setNodes([...nodesRef.current])
    setEdges([...edgesRef.current])
    startSim(0.4)
  }, [kbStore.nodes, kbStore.edges])  // eslint-disable-line react-hooks/exhaustive-deps

  // Centre the graph on first render
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const el = svgRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setTx((rect.width  - SIM_W) / 2)
    setTy((rect.height - SIM_H) / 2)
  }, [])

  const startSim = useCallback((initialAlpha = 1) => {
    cancelAnimationFrame(animRef.current)
    alphaRef.current = initialAlpha
    tickCount.current = 0

    const loop = () => {
      if (alphaRef.current < MIN_ALPHA) return
      const updated = simTick(nodesRef.current, edgesRef.current, alphaRef.current)
      nodesRef.current = updated
      alphaRef.current *= ALPHA_DECAY
      tickCount.current++
      if (tickCount.current % 2 === 0) setNodes([...updated])
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
  }, [])

  useEffect(() => {
    startSim()
    return () => cancelAnimationFrame(animRef.current)
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploadState("processing")
    setUploadStageIdx(0)

    const delays = [0, 900, 1900, 2700]
    delays.forEach((d, i) => setTimeout(() => setUploadStageIdx(i), d))

    setTimeout(() => {
      const simN = initSimNodes(PAYFLOW_NODES)
      nodesRef.current = simN
      edgesRef.current = PAYFLOW_EDGES
      setNodes(simN)
      setEdges(PAYFLOW_EDGES)
      setSelected(null)
      setUploadState("done")
      startSim()
    }, 3400)

    e.target.value = ""
  }, [startSim])

  // ── Zoom ─────────────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const factor  = e.deltaY < 0 ? 1.12 : 0.89
    const newScale = Math.max(0.25, Math.min(3.5, tsRef.current * factor))
    const ratio    = newScale / tsRef.current
    setTs(newScale)
    setTx(mx - (mx - txRef.current) * ratio)
    setTy(my - (my - tyRef.current) * ratio)
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toLocal = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: (clientX - rect.left - txRef.current) / tsRef.current,
      y: (clientY - rect.top  - tyRef.current) / tsRef.current,
    }
  }

  // ── Mouse events ──────────────────────────────────────────────────────────
  const onBgMouseDown = (e: React.MouseEvent) => {
    panRef.current = { sx: e.clientX, sy: e.clientY, ox: txRef.current, oy: tyRef.current }
  }

  const onNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    cancelAnimationFrame(animRef.current)
    alphaRef.current = 0
    dragRef.current = { id }
    nodesRef.current = nodesRef.current.map(n =>
      n.id === id ? { ...n, pinned: true } : n
    )
  }

  const onSvgMouseMove = useCallback((e: React.MouseEvent) => {
    if (panRef.current) {
      const dx = e.clientX - panRef.current.sx
      const dy = e.clientY - panRef.current.sy
      setTx(panRef.current.ox + dx)
      setTy(panRef.current.oy + dy)
    }
    if (dragRef.current) {
      const { x, y } = toLocal(e.clientX, e.clientY)
      nodesRef.current = nodesRef.current.map(n =>
        n.id === dragRef.current!.id ? { ...n, x, y, vx: 0, vy: 0, pinned: true } : n
      )
      setNodes([...nodesRef.current])
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const onSvgMouseUp = () => {
    panRef.current = null
    if (dragRef.current) {
      const id = dragRef.current.id
      dragRef.current = null
      nodesRef.current = nodesRef.current.map(n =>
        n.id === id ? { ...n, pinned: false } : n
      )
      setNodes([...nodesRef.current])
      startSim(0.4)
    }
  }

  const onNodeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSelected(prev => prev === id ? null : id)
    setIsAdding(false)
    setIsAddingDomain(false)
  }

  const fitToView = () => {
    const el = svgRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setTx((rect.width  - SIM_W) / 2)
    setTy((rect.height - SIM_H) / 2)
    setTs(1)
  }

  // ── Project management ────────────────────────────────────────────────────
  const switchProject = useCallback((targetId: string) => {
    if (targetId === activeProjectIdRef.current) return
    // Snapshot current sim state back into projects
    const currentKBNodes: KBNode[] = nodesRef.current.map(({ x, y, vx, vy, pinned, ...n }) => n)
    setProjects(ps => ps.map(p =>
      p.id === activeProjectIdRef.current
        ? { ...p, nodes: currentKBNodes, edges: [...edgesRef.current] }
        : p
    ))
    // Load target project
    const target = projectsRef.current.find(p => p.id === targetId)
    if (!target) return
    cancelAnimationFrame(animRef.current)
    const simN = initSimNodes(target.nodes)
    nodesRef.current = simN
    edgesRef.current = [...target.edges]
    setNodes(simN)
    setEdges([...target.edges])
    setActiveProjectId(targetId)
    setSelected(null)
    setIsAdding(false)
    setIsAddingDomain(false)
    startSim(0.8)
    setTimeout(fitToView, 0)
  }, [startSim])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateProject = useCallback(() => {
    const name = newProjectName.trim()
    if (!name) return
    const id = `proj-${Date.now()}`
    // Save current project first
    const currentKBNodes: KBNode[] = nodesRef.current.map(({ x, y, vx, vy, pinned, ...n }) => n)
    setProjects(ps => [
      ...ps.map(p => p.id === activeProjectIdRef.current
        ? { ...p, nodes: currentKBNodes, edges: [...edgesRef.current] }
        : p
      ),
      { id, name, nodes: [], edges: [], createdAt: new Date().toISOString().split("T")[0] },
    ])
    cancelAnimationFrame(animRef.current)
    nodesRef.current = []
    edgesRef.current = []
    setNodes([])
    setEdges([])
    setActiveProjectId(id)
    setSelected(null)
    setIsAdding(false)
    setIsAddingDomain(false)
    setShowNewProjectDialog(false)
    setNewProjectName("")
  }, [newProjectName])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteProject = useCallback((id: string) => {
    const remaining = projectsRef.current.filter(p => p.id !== id)
    if (remaining.length === 0) return
    setProjects(remaining)
    if (id === activeProjectIdRef.current) {
      const next = remaining[0]
      cancelAnimationFrame(animRef.current)
      const simN = initSimNodes(next.nodes)
      nodesRef.current = simN
      edgesRef.current = [...next.edges]
      setNodes(simN)
      setEdges([...next.edges])
      setActiveProjectId(next.id)
      setSelected(null)
      setIsAdding(false)
      setIsAddingDomain(false)
      startSim(0.8)
      setTimeout(fitToView, 0)
    }
  }, [startSim])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    const target = nodesRef.current.find(n => n.id === id)
    if (!target) return
    let nextNodes: SimNode[]
    let nextEdges: KBEdge[]
    if (target.type === "category") {
      const toRemove = new Set(
        nodesRef.current.filter(n => n.category === id).map(n => n.id)
      )
      toRemove.add(id)
      nextNodes = nodesRef.current.filter(n => !toRemove.has(n.id))
      nextEdges = edgesRef.current.filter(e => !toRemove.has(e.source) && !toRemove.has(e.target))
    } else {
      nextNodes = nodesRef.current.filter(n => n.id !== id)
      nextEdges = edgesRef.current.filter(e => e.source !== id && e.target !== id)
    }
    nodesRef.current = nextNodes
    edgesRef.current = nextEdges
    setNodes(nextNodes)
    setEdges(nextEdges)
    setSelected(null)
    setKBState(nextNodes.map(({ x, y, vx, vy, pinned, ...n }) => n), nextEdges)
    startSim(0.3)
  }

  const handleSave = (updated: KBNode) => {
    nodesRef.current = nodesRef.current.map(n =>
      n.id === updated.id ? { ...n, ...updated } : n
    )
    setNodes([...nodesRef.current])
    setKBState(nodesRef.current.map(({ x, y, vx, vy, pinned, ...n }) => n), edgesRef.current)
  }

  const handleAdd = (newNode: KBNode) => {
    const catNode = nodesRef.current.find(n => n.id === newNode.category)
    const spawnX  = catNode ? catNode.x + (Math.random() - 0.5) * 120 : SIM_W / 2
    const spawnY  = catNode ? catNode.y + (Math.random() - 0.5) * 120 : SIM_H / 2
    const simNode: SimNode = { ...newNode, x: spawnX, y: spawnY, vx: 0, vy: 0, pinned: false }
    const newEdge: KBEdge  = { id: `h-${Date.now()}`, source: newNode.category, target: newNode.id, type: "hierarchy" }
    nodesRef.current = [...nodesRef.current, simNode]
    edgesRef.current = [...edgesRef.current, newEdge]
    setNodes([...nodesRef.current])
    setEdges([...edgesRef.current])
    setIsAdding(false)
    setIsAddingDomain(false)
    setSelected(newNode.id)
    setKBState(nodesRef.current.map(({ x, y, vx, vy, pinned, ...n }) => n), edgesRef.current)
    startSim(0.6)
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedNode  = nodes.find(n => n.id === selected)
  const hoveredNode   = nodes.find(n => n.id === hovered)
  const categories    = nodes.filter(n => n.type === "category")
  const intentCount   = nodes.filter(n => n.type === "intent").length
  const hierCount     = edges.filter(e => e.type === "hierarchy").length
  const relCount      = edges.filter(e => e.type === "related").length
  const isSidebarOpen = (selected && selectedNode) || isAdding || isAddingDomain
  const currentStage  = UPLOAD_STAGES[uploadStageIdx]

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Knowledge Graph</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {intentCount} intents · {hierCount} hierarchy edges · {relCount} semantic links
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setIsAdding(true); setIsAddingDomain(false); setSelected(null) }}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
          >
            <Plus className="size-4" />
            Add Node
          </button>
          <button
            onClick={() => { setIsAddingDomain(true); setIsAdding(false); setSelected(null) }}
            className="flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/8 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-500/15 transition-colors"
          >
            <Globe className="size-4" />
            Add Domain
          </button>
          <label className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
            <Upload className="size-4" />
            Upload Document
            <input type="file" accept=".docx,.pdf,.txt" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      {/* ── Project Bar ── */}
      <div className="flex items-center gap-2 px-8 py-2 border-b border-border bg-secondary/20 shrink-0 overflow-x-auto">
        <span className="text-xs font-medium text-muted-foreground shrink-0 mr-1">Project:</span>
        {projects.map(p => (
          <div
            key={p.id}
            className={`group flex items-center gap-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              p.id === activeProjectId
                ? "bg-primary text-primary-foreground pl-3 pr-2 py-1"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary pl-3 pr-2 py-1 cursor-pointer"
            }`}
          >
            <button onClick={() => switchProject(p.id)} className="leading-none">{p.name}</button>
            {projects.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); setDeleteConfirm(p.id) }}
                className={`ml-0.5 rounded-full p-0.5 transition-colors ${
                  p.id === activeProjectId
                    ? "opacity-60 hover:opacity-100 hover:bg-primary-foreground/20"
                    : "opacity-0 group-hover:opacity-60 hover:opacity-100! hover:text-destructive"
                }`}
              >
                <X className="size-2.5" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setShowNewProjectDialog(true)}
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground border border-dashed border-border hover:border-primary hover:text-primary transition-colors shrink-0"
        >
          <Plus className="size-3" />
          New Project
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Graph */}
        <div className="relative flex-1 overflow-hidden">
          <svg
            ref={svgRef}
            className="w-full h-full select-none"
            style={{ cursor: panRef.current ? "grabbing" : "grab" }}
            onWheel={handleWheel}
            onMouseDown={onBgMouseDown}
            onMouseMove={onSvgMouseMove}
            onMouseUp={onSvgMouseUp}
            onMouseLeave={onSvgMouseUp}
          >
            <defs>
              <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" opacity="0.45" />
              </marker>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.18" />
              </filter>
              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Background hit area */}
            <rect width="100%" height="100%" fill="transparent" />

            <g transform={`translate(${tx},${ty}) scale(${ts})`}>
              {/* Edges */}
              {edges.map(edge => {
                const s = nodes.find(n => n.id === edge.source)
                const t = nodes.find(n => n.id === edge.target)
                if (!s || !t) return null
                const meta = CATEGORY_META[s.category]
                return (
                  <line
                    key={edge.id}
                    x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                    stroke={edge.type === "hierarchy" ? (meta?.color ?? "#94a3b8") : "#94a3b8"}
                    strokeWidth={edge.type === "hierarchy" ? 1.5 : 1}
                    strokeDasharray={edge.type === "related" ? "5 4" : undefined}
                    opacity={edge.type === "hierarchy" ? 0.35 : 0.2}
                    markerEnd={edge.type === "related" ? "url(#arr)" : undefined}
                  />
                )
              })}

              {/* Nodes */}
              {nodes.map(node => {
                const meta     = CATEGORY_META[node.category]
                const isHov    = hovered  === node.id
                const isSel    = selected === node.id
                const r        = node.type === "category" ? 30 : 18
                const arcPct   = node.type === "intent" && node.hitCount > 0
                  ? Math.min(node.hitCount / 3500, 1)
                  : 0
                const arcLen   = arcPct * 2 * Math.PI * r

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x},${node.y})`}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={e => onNodeClick(e, node.id)}
                    onMouseDown={e => onNodeMouseDown(e, node.id)}
                  >
                    {/* Selection halo */}
                    {isSel && (
                      <circle r={r + 7} fill={meta?.color ?? "#94a3b8"} opacity={0.12} />
                    )}
                    {(isHov || isSel) && (
                      <circle r={r + 4} fill="none" stroke={meta?.color ?? "#94a3b8"} strokeWidth={1.5} opacity={0.45} />
                    )}

                    {/* Body */}
                    <circle
                      r={r}
                      fill={node.type === "category" ? (meta?.color ?? "#94a3b8") : (meta?.bg ?? "#f1f5f9")}
                      stroke={meta?.color ?? "#94a3b8"}
                      strokeWidth={node.type === "category" ? 0 : 1.5}
                      filter={node.type === "category" ? "url(#shadow)" : undefined}
                    />

                    {/* Hit-rate arc for intent nodes */}
                    {arcPct > 0 && (
                      <circle
                        r={r}
                        fill="none"
                        stroke={meta?.color ?? "#94a3b8"}
                        strokeWidth={2.5}
                        strokeDasharray={`${arcLen} ${2 * Math.PI * r}`}
                        strokeLinecap="round"
                        transform="rotate(-90)"
                        opacity={0.6}
                      />
                    )}

                    {/* Pending dot */}
                    {node.type === "intent" && node.status === "pending" && (
                      <circle cx={r - 2} cy={-r + 2} r={4.5} fill="#f59e0b" stroke="white" strokeWidth={1.5} />
                    )}

                    {/* Category initials */}
                    {node.type === "category" && (
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight="700"
                        fill="white"
                        style={{ userSelect: "none", pointerEvents: "none" }}
                      >
                        {node.label.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </text>
                    )}

                    {/* Label */}
                    <text
                      textAnchor="middle"
                      y={r + 13}
                      fontSize={node.type === "category" ? 10 : 9}
                      fontWeight={node.type === "category" ? "600" : "400"}
                      fill={node.type === "category" ? (meta?.color ?? "#64748b") : "#64748b"}
                      style={{ userSelect: "none", pointerEvents: "none" }}
                    >
                      {node.label.length > 17 ? node.label.slice(0, 16) + "…" : node.label}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>

          {/* Hover tooltip */}
          {hoveredNode && !dragRef.current && !panRef.current && (
            <HoverTooltip node={hoveredNode} svgRef={svgRef} tx={tx} ty={ty} ts={ts} />
          )}

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1">
            {[
              { icon: <ZoomIn  className="size-4 text-muted-foreground" />, action: () => { const s = Math.min(3.5, tsRef.current * 1.2); setTs(s) } },
              { icon: <ZoomOut className="size-4 text-muted-foreground" />, action: () => { const s = Math.max(0.25, tsRef.current * 0.8); setTs(s) } },
              { icon: <Maximize2 className="size-4 text-muted-foreground" />, action: fitToView },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                className="size-8 rounded bg-card border border-border flex items-center justify-center hover:bg-secondary/50 transition-colors shadow-sm"
              >
                {btn.icon}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-xl border border-border p-3 space-y-1.5">
            {Object.entries(CATEGORY_META).map(([id, meta]) => (
              <div key={id} className="flex items-center gap-2">
                <div className="size-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                <span className="text-[11px] text-muted-foreground">{meta.label}</span>
              </div>
            ))}
            <div className="border-t border-border pt-1.5 mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-5 border-t border-muted-foreground/40" style={{ borderWidth: 1.5 }} />
                <span className="text-[11px] text-muted-foreground">Hierarchy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 border-t border-dashed border-muted-foreground/40" />
                <span className="text-[11px] text-muted-foreground">Semantic link</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full border border-amber-400 bg-amber-400/20" />
                <span className="text-[11px] text-muted-foreground">Pending review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {isSidebarOpen && (
          selected && selectedNode ? (
            <NodeSidebar
              node={selectedNode}
              categories={categories}
              onClose={() => setSelected(null)}
              onDelete={handleDelete}
              onSave={handleSave}
            />
          ) : isAdding ? (
            <AddNodePanel
              categories={categories}
              onClose={() => setIsAdding(false)}
              onAdd={handleAdd}
            />
          ) : isAddingDomain ? (
            <RagDomainPanel
              onClose={() => setIsAddingDomain(false)}
            />
          ) : null
        )}
      </div>

      {/* Upload overlay */}
      {uploadState === "processing" && (
        <div className="fixed inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-8 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="size-7 text-primary" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Loader2 className="size-4 text-primary animate-spin" />
                <h3 className="font-semibold text-foreground">Processing Document</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{currentStage?.text}</p>
              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary rounded-full h-1.5 transition-all duration-500 ease-out"
                  style={{ width: `${currentStage?.pct ?? 5}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{currentStage?.pct ?? 5}% complete</p>
            </div>
          </div>
        </div>
      )}

      {/* ── New Project Dialog ── */}
      {showNewProjectDialog && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-80">
            <h3 className="font-semibold text-foreground mb-1">New Project</h3>
            <p className="text-xs text-muted-foreground mb-4">Create an empty knowledge graph for a new product or team.</p>
            <input
              autoFocus
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleCreateProject(); if (e.key === "Escape") { setShowNewProjectDialog(false); setNewProjectName("") } }}
              placeholder="e.g. Acme Support, Internal IT…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="size-3.5" />
                Create
              </button>
              <button
                onClick={() => { setShowNewProjectDialog(false); setNewProjectName("") }}
                className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Project Confirmation ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-80">
            <h3 className="font-semibold text-foreground mb-1">Delete Project?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              <span className="font-medium text-foreground">{projects.find(p => p.id === deleteConfirm)?.name}</span> and all its knowledge nodes will be permanently removed.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { handleDeleteProject(deleteConfirm); setDeleteConfirm(null) }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload success toast */}
      {uploadState === "done" && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-xl px-5 py-3 flex items-center gap-3 z-50"
          style={{ animation: "fadeInUp 0.3s ease-out" }}
        >
          <div className="size-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Check className="size-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Knowledge graph built</p>
            <p className="text-xs text-muted-foreground">
              {intentCount} intents extracted from payflow-customer-support-faq.docx
            </p>
          </div>
          <button onClick={() => setUploadState("idle")} className="ml-2 p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}

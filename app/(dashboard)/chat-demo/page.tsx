"use client"

import { useReducer, useCallback, useRef } from "react"
import { dashboardReducer, initialState, type DemoAction } from "@/lib/dashboard-store"
import { DemoControls } from "@/components/dashboard/demo-controls"
import { ChatPanel } from "@/components/chat/chat-panel"
import { DollarSign, Zap, Database, TrendingDown } from "lucide-react"

const panels = [
  {
    id: "support-1",
    title: "Support Agent A",
    description: "Customer support - West Coast",
    accentColor: "bg-primary",
    iconColor: "bg-primary-foreground/20",
  },
  {
    id: "support-2",
    title: "Support Agent B",
    description: "Customer support - East Coast",
    accentColor: "bg-accent",
    iconColor: "bg-accent-foreground/20",
  },
  {
    id: "sales-1",
    title: "Sales Assistant",
    description: "Pre-sales inquiries",
    accentColor: "bg-emerald-700",
    iconColor: "bg-emerald-900/30",
  },
  {
    id: "internal",
    title: "Internal Helpdesk",
    description: "Employee questions",
    accentColor: "bg-amber-700",
    iconColor: "bg-amber-900/30",
  },
]

export default function ChatDemoPage() {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)
  const statsRef = useRef({ kbHits: 0, llmRoutes: 0, cacheHits: 0, totalCost: 0, totalSaved: 0 })

  // Track when a chat panel logs a request, update the dashboard metrics
  const handleRequestLogged = useCallback(
    (entry: { query: string; route: "kb" | "llm" | "cache"; model: string; latency: number; cost: number }) => {
      // Map the chat request to dashboard actions
      if (entry.route === "kb") {
        // Find matching KB action
        const normalized = entry.query.toLowerCase()
        if (normalized.includes("password") || normalized.includes("reset")) {
          dispatch({ type: "KB_HIT_PASSWORD" })
        } else if (normalized.includes("cancel") || normalized.includes("subscription")) {
          dispatch({ type: "KB_HIT_CANCEL" })
        } else if (normalized.includes("login") || normalized.includes("forgot")) {
          dispatch({ type: "KB_HIT_LOGIN" })
        } else {
          dispatch({ type: "KB_HIT_PASSWORD" }) // default KB action
        }
      } else if (entry.route === "llm") {
        const normalized = entry.query.toLowerCase()
        if (normalized.includes("zapier") || normalized.includes("integrat")) {
          dispatch({ type: "LLM_ROUTE_ZAPIER" })
        } else {
          dispatch({ type: "LLM_ROUTE_DISCOUNT" })
        }
      } else if (entry.route === "cache") {
        dispatch({ type: "IMAGE_CACHE_HIT" })
      }

      // Update local stats
      statsRef.current = {
        kbHits: statsRef.current.kbHits + (entry.route === "kb" ? 1 : 0),
        llmRoutes: statsRef.current.llmRoutes + (entry.route === "llm" ? 1 : 0),
        cacheHits: statsRef.current.cacheHits + (entry.route === "cache" ? 1 : 0),
        totalCost: statsRef.current.totalCost + entry.cost,
        totalSaved: statsRef.current.totalSaved + (entry.route === "cache" ? 0.0016 : entry.route === "kb" ? 0.0016 - entry.cost : 0),
      }
    },
    []
  )

  const totalRequests = state.totalRequests
  const costSaved = state.costWithout - state.costWith
  const savingsPercent = state.costWithout > 0 ? ((costSaved / state.costWithout) * 100).toFixed(0) : "0"

  const handleDemoDispatch = useCallback((action: DemoAction) => {
    dispatch(action)
  }, [])

  return (
    <div className="flex h-screen flex-col bg-background">
      <DemoControls dispatch={handleDemoDispatch} />

      {/* Compact stats bar */}
      <div className="shrink-0 border-b border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-foreground">Multi-Agent Chat Demo</h1>
            <p className="text-xs text-muted-foreground">
              4 agents, one shared cache. Ask the same question across panels to see cache hits.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="size-3.5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] leading-none text-muted-foreground">Requests</p>
                <p className="text-base font-bold text-foreground">{totalRequests}</p>
              </div>
            </div>

            <div className="h-8 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Database className="size-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] leading-none text-muted-foreground">Cache Hits</p>
                <p className="text-base font-bold text-emerald-600">{state.cacheHits}</p>
              </div>
            </div>

            <div className="h-8 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10">
                <DollarSign className="size-3.5 text-sky-600" />
              </div>
              <div>
                <p className="text-[10px] leading-none text-muted-foreground">Saved</p>
                <p className="text-base font-bold text-sky-600">${costSaved.toFixed(4)}</p>
              </div>
            </div>

            <div className="h-8 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
                <TrendingDown className="size-3.5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] leading-none text-muted-foreground">Savings</p>
                <p className="text-base font-bold text-amber-600">{savingsPercent}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2x2 Chat grid -- min-h-0 enables proper flex overflow scrolling */}
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-4 overflow-hidden p-4">
        {panels.map((panel) => (
          <ChatPanel
            key={panel.id}
            id={panel.id}
            title={panel.title}
            description={panel.description}
            accentColor={panel.accentColor}
            iconColor={panel.iconColor}
            onRequestLogged={handleRequestLogged}
          />
        ))}
      </div>
    </div>
  )
}

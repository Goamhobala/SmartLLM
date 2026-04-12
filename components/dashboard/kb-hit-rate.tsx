"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface KBHitRateProps {
  kbHits: number
  llmRoutes: number
  cacheHits: number
}

export function KBHitRate({ kbHits, llmRoutes, cacheHits }: KBHitRateProps) {
  const total = kbHits + llmRoutes + cacheHits
  const kbPct = total > 0 ? Math.round((kbHits / total) * 100) : 0
  const cachePct = total > 0 ? Math.round((cacheHits / total) * 100) : 0

  const data = total > 0
    ? [
        { name: "KB Hits", value: kbHits, color: "#059669" },
        { name: "LLM Routes", value: llmRoutes, color: "#d97706" },
        { name: "Cache Hits", value: cacheHits, color: "#0284c7" },
      ]
    : [{ name: "No Data", value: 1, color: "#e5e7eb" }]

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">KB Hit Rate</h3>
      <p className="mt-1 text-xs text-muted-foreground">Percentage of requests served from knowledge base</p>
      <div className="mt-4 flex items-center gap-6">
        <div className="relative size-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={total > 0 ? 3 : 0}
                dataKey="value"
                animationDuration={500}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{kbPct + cachePct}%</span>
            <span className="text-xs text-muted-foreground">intercepted</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-emerald-600" />
            <span className="text-xs text-muted-foreground">KB Hits</span>
            <span className="ml-auto text-xs font-semibold text-foreground">{kbHits}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-amber-600" />
            <span className="text-xs text-muted-foreground">LLM Routes</span>
            <span className="ml-auto text-xs font-semibold text-foreground">{llmRoutes}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-sky-600" />
            <span className="text-xs text-muted-foreground">Cache Hits</span>
            <span className="ml-auto text-xs font-semibold text-foreground">{cacheHits}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

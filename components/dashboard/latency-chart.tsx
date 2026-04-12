"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

interface LatencyChartProps {
  kbLatencies: number[]
  llmLatencies: number[]
}

export function LatencyChart({ kbLatencies, llmLatencies }: LatencyChartProps) {
  const avgKb = kbLatencies.length > 0
    ? Math.round(kbLatencies.reduce((a, b) => a + b, 0) / kbLatencies.length)
    : 0
  const avgLlm = llmLatencies.length > 0
    ? Math.round(llmLatencies.reduce((a, b) => a + b, 0) / llmLatencies.length)
    : 0

  const data = [
    { name: "KB + Llama 3.2", latency: avgKb, fill: "#059669" },
    { name: "GPT-4.1 Mini", latency: avgLlm, fill: "#d97706" },
  ]

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">Average Latency</h3>
      <p className="mt-1 text-xs text-muted-foreground">Response time comparison (ms)</p>
      <div className="mt-4 h-48">
        {avgKb === 0 && avgLlm === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Trigger demo events to see latency data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(0.90 0.01 240)" />
              <XAxis type="number" domain={[0, 1000]} tick={{ fontSize: 11, fill: "oklch(0.50 0.02 240)" }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "oklch(0.50 0.02 240)" }} />
              <Tooltip
                formatter={(value: number) => [`${value}ms`, "Avg Latency"]}
                contentStyle={{ borderRadius: "8px", border: "1px solid oklch(0.90 0.01 240)", fontSize: "12px" }}
              />
              <Bar dataKey="latency" radius={[0, 6, 6, 0]} animationDuration={500} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {(avgKb > 0 || avgLlm > 0) && (
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>KB avg: <strong className="text-emerald-600">{avgKb}ms</strong></span>
          <span>LLM avg: <strong className="text-amber-600">{avgLlm}ms</strong></span>
          {avgLlm > 0 && avgKb > 0 && (
            <span className="font-semibold text-emerald-600">{Math.round(avgLlm / avgKb)}x faster</span>
          )}
        </div>
      )}
    </div>
  )
}

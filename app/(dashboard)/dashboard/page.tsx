"use client"

import { useReducer } from "react"
import { dashboardReducer, initialState } from "@/lib/dashboard-store"
import { DemoControls } from "@/components/dashboard/demo-controls"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { KBHitRate } from "@/components/dashboard/kb-hit-rate"
import { LatencyChart } from "@/components/dashboard/latency-chart"
import { RequestLog } from "@/components/dashboard/request-log"

export default function DashboardPage() {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)

  return (
    <div className="min-h-screen bg-background">
      <DemoControls dispatch={dispatch} />

      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time metrics for your Smart LLM Gateway usage.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Metric cards */}
          <MetricCards
            totalRequests={state.totalRequests}
            costWithout={state.costWithout}
            costWith={state.costWith}
          />

          {/* Charts row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <KBHitRate
              kbHits={state.kbHits}
              llmRoutes={state.llmRoutes}
              cacheHits={state.cacheHits}
            />
            <LatencyChart
              kbLatencies={state.kbLatencies}
              llmLatencies={state.llmLatencies}
            />
          </div>

          {/* Request Log */}
          <RequestLog requests={state.requests} />
        </div>
      </div>
    </div>
  )
}

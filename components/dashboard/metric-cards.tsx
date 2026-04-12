"use client"

import { Activity, DollarSign, TrendingDown, Sparkles } from "lucide-react"
import { AnimatedCounter } from "./animated-counter"

interface MetricCardsProps {
  totalRequests: number
  costWithout: number
  costWith: number
}

export function MetricCards({ totalRequests, costWithout, costWith }: MetricCardsProps) {
  const saved = costWithout - costWith
  const savedPct = costWithout > 0 ? (saved / costWithout) * 100 : 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Requests */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
            <Activity className="size-5 text-accent" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Requests</p>
            <AnimatedCounter value={totalRequests} className="text-2xl font-bold text-foreground" />
          </div>
        </div>
      </div>

      {/* Cost Without Gateway */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
            <DollarSign className="size-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Cost Without Gateway</p>
            <AnimatedCounter value={costWithout} prefix="$" decimals={5} className="text-2xl font-bold text-red-500" />
          </div>
        </div>
      </div>

      {/* Cost With Gateway */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <TrendingDown className="size-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Cost With Gateway</p>
            <AnimatedCounter value={costWith} prefix="$" decimals={5} className="text-2xl font-bold text-emerald-500" />
          </div>
        </div>
      </div>

      {/* You Saved */}
      <div className="rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/20">
            <Sparkles className="size-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-600">You Saved</p>
            <div className="flex items-baseline gap-2">
              <AnimatedCounter value={saved} prefix="$" decimals={5} className="text-2xl font-bold text-emerald-600" />
              {costWithout > 0 && (
                <AnimatedCounter value={savedPct} suffix="%" decimals={1} className="text-sm font-semibold text-emerald-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

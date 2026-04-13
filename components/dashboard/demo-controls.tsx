"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Zap } from "lucide-react"
import type { DemoAction } from "@/lib/dashboard-store"

interface DemoControlsProps {
  dispatch: (action: DemoAction) => void
}

const buttons: { label: string; action: DemoAction; color: string }[] = [
  { label: "KB Hit: Password Reset", action: { type: "KB_HIT_PASSWORD" }, color: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  { label: "KB Hit: Forgot Login", action: { type: "KB_HIT_LOGIN" }, color: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  { label: "KB Hit: Cancel Account", action: { type: "KB_HIT_CANCEL" }, color: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  { label: "LLM Route: RAG forum lookup", action: { type: "LLM_ROUTE_RAG_FORUM" }, color: "bg-amber-600 hover:bg-amber-700 text-white" },
  { label: "LLM Route: Bulk Discount", action: { type: "LLM_ROUTE_DISCOUNT" }, color: "bg-amber-600 hover:bg-amber-700 text-white" },
  { label: "Image Cache Hit", action: { type: "IMAGE_CACHE_HIT" }, color: "bg-sky-600 hover:bg-sky-700 text-white" },
  { label: "Bulk: 50000 KB Hits", action: { type: "BULK_50000_KB" }, color: "bg-indigo-600 hover:bg-indigo-700 text-white" },
  { label: "Reset Dashboard", action: { type: "RESET" }, color: "bg-red-600 hover:bg-red-700 text-white" },
]

export function DemoControls({ dispatch }: DemoControlsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed right-6 top-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card/90 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-card"
      >
        <Zap className="size-3.5 text-accent" />
        Demo Controls
        {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
      </button>

      {isOpen && (
        <div className="mt-2 w-64 rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-sm">
          <div className="grid gap-1.5">
            {buttons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => dispatch(btn.action)}
                className={`rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${btn.color}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

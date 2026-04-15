"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, ArrowRight } from "lucide-react"

interface Slide {
  tag: string
  title: string
  subtitle: string
  bullets: { icon: string; text: string }[]
  visual: React.ReactNode
}

const slides: Slide[] = [
  {
    tag: "Overview",
    title: "One gateway.\nAll your AI calls.",
    subtitle: "Smart LLM Gateway sits between your app and any language model — routing, caching, and optimising every query automatically.",
    bullets: [
      { icon: "⚡", text: "Drop-in replacement — change one URL" },
      { icon: "📉", text: "Up to 68% cost reduction via semantic caching" },
      { icon: "🛡️", text: "RAG-verified answers — dramatically lower hallucination" },
    ],
    visual: (
      <div className="flex flex-col items-center gap-3 w-full">
        {[
          { label: "Your App", sub: "api.openai.com", dim: true },
          { label: "Smart LLM Gateway", sub: "gateway.smartllm.io", highlight: true },
          { label: "LLM Provider", sub: "GPT-4 / Llama / Claude", dim: true },
        ].map((row, i) => (
          <div key={i} className="flex flex-col items-center w-full">
            <div className={`w-full max-w-xs rounded-xl px-5 py-3 border text-center transition-all ${
              row.highlight
                ? "border-accent/60 bg-accent/10"
                : "border-border/40 bg-secondary/30"
            }`}>
              <p className={`text-sm font-semibold ${row.highlight ? "text-accent" : "text-foreground"}`}>{row.label}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{row.sub}</p>
            </div>
            {i < 2 && (
              <div className="flex flex-col items-center my-1">
                <div className="w-px h-4 bg-border/60" />
                <ChevronRight className="rotate-90 size-3 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "Routing Logic",
    title: "KB hit or LLM?\nDecided in milliseconds.",
    subtitle: "Every query is checked against your verified Knowledge Base first. Only novel queries reach the LLM — saving you money on every repeat question. Research shows semantic caching cuts API calls by up to 68%.",
    bullets: [
      { icon: "🗄️", text: "KB Hit → Llama 3.2 3B at R0.00056" },
      { icon: "🤖", text: "No match → Gemini 2.5 Flash Lite (best cost/quality for RAG)" },
      { icon: "🔁", text: "Image cache → R0.00 on repeat renders" },
    ],
    visual: (
      <div className="w-full max-w-xs">
        <div className="rounded-xl border border-border/40 bg-secondary/30 px-5 py-3 text-sm font-mono text-center text-foreground mb-3">
          Incoming query
        </div>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-px h-5 bg-border/60" />
            <div className="rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-center w-full">
              <p className="text-xs font-semibold text-green-600">KB Hit</p>
              <p className="text-xs text-muted-foreground mt-0.5">95ms · R0.00056</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-px h-5 bg-border/60" />
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-center w-full">
              <p className="text-xs font-semibold text-amber-600">LLM Route</p>
              <p className="text-xs text-muted-foreground mt-0.5">820ms · R0.0056</p>
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-border/40 bg-secondary/30 px-5 py-3 text-xs text-center text-muted-foreground">
          Response returned to your app
        </div>
      </div>
    ),
  },
  {
    tag: "Cost Savings",
    title: "Watch your savings\nstack up in real time.",
    subtitle: "The dashboard tracks total spend with and without the gateway — so you can see the rand impact of every routed query.",
    bullets: [
      { icon: "💰", text: "Without gateway: every query at full LLM price" },
      { icon: "✅", text: "With gateway: KB hits are 50× cheaper on average" },
      { icon: "📊", text: "Savings meter updates with each event" },
    ],
    visual: (
      <div className="w-full max-w-xs space-y-3">
        {[
          { label: "Without Gateway", value: "R29.60", per: "per 1,000 queries", color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" },
          { label: "With Gateway (60% KB)", value: "R12.40", per: "per 1,000 queries", color: "text-green-600", bg: "bg-green-500/10 border-green-500/30" },
        ].map((r) => (
          <div key={r.label} className={`rounded-xl border px-5 py-4 ${r.bg}`}>
            <p className="text-xs text-muted-foreground">{r.label}</p>
            <p className={`text-2xl font-bold mt-1 ${r.color}`}>{r.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{r.per}</p>
          </div>
        ))}
        <div className="rounded-xl border border-accent/30 bg-accent/10 px-5 py-3 text-center">
          <p className="text-xs text-muted-foreground">You save</p>
          <p className="text-xl font-bold text-accent">58%</p>
        </div>
      </div>
    ),
  },
  {
    tag: "Dashboard",
    title: "Your metrics,\nlive and animated.",
    subtitle: "The dashboard gives you a real-time view of every request — latency, cost, KB hit rate, and a full request log with animated rows.",
    bullets: [
      { icon: "📡", text: "KB Hit Rate gauge updates live" },
      { icon: "📈", text: "Latency chart compares KB vs LLM" },
      { icon: "🗒️", text: "Request log with fade-in new rows" },
    ],
    visual: (
      <div className="w-full max-w-xs space-y-2">
        {[
          { label: "KB Hit Rate", value: "64%", bar: 64, color: "bg-accent" },
          { label: "Avg KB Latency", value: "94ms", bar: 15, color: "bg-green-500" },
          { label: "Avg LLM Latency", value: "870ms", bar: 87, color: "bg-amber-500" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border/40 bg-secondary/30 px-4 py-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">{m.label}</span>
              <span className="text-sm font-semibold text-foreground">{m.value}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border/50">
              <div className={`h-1.5 rounded-full ${m.color}`} style={{ width: `${m.bar}%` }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "Demo Controls",
    title: "Simulate anything\nwith one click.",
    subtitle: "The Demo Control Panel lets you trigger realistic scenarios — KB hits, LLM routes, image caching, and bulk runs — to showcase the system live.",
    bullets: [
      { icon: "🟢", text: "KB Hit buttons — common Q&A answered instantly" },
      { icon: "🟡", text: "LLM Route buttons — novel queries routed out" },
      { icon: "🖼️", text: "Image Cache Hit — see R0.74 saved per render" },
    ],
    visual: (
      <div className="w-full max-w-xs space-y-2">
        {[
          { label: "KB Hit: Password Reset", type: "kb" },
          { label: "LLM Route: Zapier", type: "llm" },
          { label: "Image Cache Hit", type: "img" },
          { label: "Bulk: 50 KB Hits", type: "bulk" },
        ].map((b) => (
          <div key={b.label} className={`rounded-lg border px-4 py-2.5 flex items-center gap-3 ${
            b.type === "kb" ? "border-green-500/30 bg-green-500/8" :
            b.type === "llm" ? "border-amber-500/30 bg-amber-500/8" :
            b.type === "img" ? "border-blue-500/30 bg-blue-500/8" :
            "border-purple-500/30 bg-purple-500/8"
          }`}>
            <span className="size-2 rounded-full shrink-0 ${
              b.type === 'kb' ? 'bg-green-500' : ''
            }" style={{
              background: b.type === "kb" ? "#22c55e" : b.type === "llm" ? "#f59e0b" : b.type === "img" ? "#3b82f6" : "#a855f7"
            }} />
            <span className="text-xs font-medium text-foreground">{b.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "All Set",
    title: "You're ready\nto explore.",
    subtitle: "Head to the dashboard and press any Demo Control button to see the system in action. Numbers animate up, rows slide in, savings tick up.",
    bullets: [
      { icon: "🎯", text: "Hit KB buttons to build up the hit rate" },
      { icon: "💸", text: "Watch cost savings widen in real time" },
      { icon: "🔄", text: "Reset anytime to start fresh for a demo" },
    ],
    visual: (
      <div className="flex flex-col items-center justify-center gap-5 py-4">
        <div className="relative flex size-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full opacity-20 animate-ping"
            style={{ background: "oklch(0.55 0.14 240)" }} />
          <div className="relative flex size-20 items-center justify-center rounded-full border-2"
            style={{ borderColor: "oklch(0.55 0.14 240)", background: "oklch(0.55 0.14 240 / 0.12)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.14 240)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Smart LLM Gateway</p>
          <p className="text-xs text-muted-foreground mt-1">Intelligent routing · Live metrics · RAG-verified answers</p>
        </div>
      </div>
    ),
  },
]

interface OnboardingCarouselProps {
  onComplete: () => void
}

export function OnboardingCarousel({ onComplete }: OnboardingCarouselProps) {
  const [current, setCurrent] = useState(0)
  const slide = slides[current]
  const isLast = current === slides.length - 1

  const next = () => isLast ? onComplete() : setCurrent(current + 1)
  const prev = () => current > 0 && setCurrent(current - 1)

  return (
    <div className="fixed inset-0 z-50 bg-background flex">
      {/* Left — slide content */}
      <div className="flex flex-col justify-between w-full lg:w-1/2 px-12 py-12">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-foreground">Smart LLM Gateway</span>
        </div>

        {/* Slide body */}
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <div className="mb-6">
            <span className="inline-block rounded-full px-3 py-1 text-xs font-medium border"
              style={{
                background: "oklch(0.55 0.14 240 / 0.10)",
                borderColor: "oklch(0.55 0.14 240 / 0.30)",
                color: "oklch(0.45 0.12 240)"
              }}>
              {slide.tag}
            </span>
          </div>

          <h2 className="text-3xl font-bold text-foreground leading-tight whitespace-pre-line mb-4 tracking-tight">
            {slide.title}
          </h2>

          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            {slide.subtitle}
          </p>

          <ul className="space-y-3">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 text-base leading-snug">{b.icon}</span>
                <span className="text-sm text-foreground leading-snug">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === current ? 24 : 6,
                  background: i === current ? "oklch(0.55 0.14 240)" : "oklch(0.85 0.01 240)",
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {current > 0 && (
              <button
                onClick={prev}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
            )}
            <Button onClick={next} className="gap-2 px-5">
              {isLast ? "Open Dashboard" : "Next"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right — visual panel */}
      <div
        className="hidden lg:flex flex-col items-center justify-center w-1/2 relative overflow-hidden"
        style={{ background: "oklch(0.97 0.005 240)" }}
      >
        {/* Subtle grid */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ob-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.35 0.08 240)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ob-grid)" />
        </svg>

        {/* Step counter */}
        <div className="absolute top-10 right-10 text-xs font-mono text-muted-foreground">
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>

        {/* Visual */}
        <div className="relative z-10 w-full max-w-sm px-8 flex flex-col items-center">
          {slide.visual}
        </div>
      </div>
    </div>
  )
}

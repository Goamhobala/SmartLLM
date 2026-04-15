import { MessageSquareText, ImageIcon, Zap, ShieldCheck, BarChart3, Layers } from "lucide-react"

const products = [
  {
    id: "text",
    icon: MessageSquareText,
    accent: "primary",
    badge: "Text Interceptor",
    headline: "Answer smarter.\nNot just faster.",
    description:
      "Your knowledge base handles 50–68% of queries at a fraction of the cost. Novel queries route to Gemini 2.5 Flash Lite — the best cost-to-quality model for RAG — and land in your review queue. RAG grounding keeps hallucination rates low.",
    stats: [
      { value: "68%", label: "query deflection" },
      { value: "95ms", label: "avg KB latency" },
      { value: "~0×", label: "hallucination rate" },
    ],
    chips: [
      { icon: Layers, label: "Knowledge Base" },
      { icon: Zap, label: "Smart Routing" },
      { icon: ShieldCheck, label: "Review Queue" },
    ],
    gradient: "from-[#1A5276]/10 via-transparent to-transparent",
    chipBg: "bg-primary/10 text-primary",
    borderAccent: "hover:border-primary/40",
    statColor: "text-primary",
  },
  {
    id: "image",
    icon: ImageIcon,
    accent: "accent",
    badge: "Image Interceptor",
    headline: "First request costs.\nEvery repeat is free.",
    description:
      "Semantically similar image requests return cached results instantly. Same visual output, zero latency, zero cost — on every repeat render after the first.",
    stats: [
      { value: "12ms", label: "cache hit latency" },
      { value: "R0.00", label: "cost on cache hit" },
      { value: "100%", label: "visual fidelity" },
    ],
    chips: [
      { icon: BarChart3, label: "Semantic Cache" },
      { icon: Zap, label: "Zero Latency" },
      { icon: ShieldCheck, label: "Zero Cost" },
    ],
    gradient: "from-[#2E86C1]/10 via-transparent to-transparent",
    chipBg: "bg-accent/10 text-accent",
    borderAccent: "hover:border-accent/40",
    statColor: "text-accent",
  },
]

export function Products() {
  return (
    <section id="products" className="relative overflow-hidden bg-secondary/40 px-6 py-28">
      {/* Subtle background grid */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="prod-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#prod-grid)" />
      </svg>

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" />
            Two products. One integration.
          </span>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Intercept. Cache. Save.
          </h2>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            A single gateway that handles both text and image AI calls — routing intelligently, caching aggressively, and surfacing every saving in real time.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {products.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.id}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-xl ${p.borderAccent}`}
              >
                {/* Gradient blob top-left */}
                <div className={`pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br ${p.gradient} blur-2xl`} />

                <div className="relative p-8">
                  {/* Icon + badge row */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className={`flex size-12 items-center justify-center rounded-xl ${p.chipBg}`}>
                      <Icon className="size-6" />
                    </div>
                    <span className={`rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-semibold text-muted-foreground`}>
                      {p.badge}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="mb-3 whitespace-pre-line text-2xl font-bold leading-tight tracking-tight text-foreground">
                    {p.headline}
                  </h3>

                  {/* Description */}
                  <p className="mb-8 leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>

                  {/* Stats row */}
                  <div className="mb-8 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-secondary/40">
                    {p.stats.map((s) => (
                      <div key={s.label} className="px-4 py-3 text-center">
                        <p className={`text-xl font-bold tabular-nums ${p.statColor}`}>{s.value}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chips */}
                  <div className="flex flex-wrap gap-2">
                    {p.chips.map((c) => {
                      const ChipIcon = c.icon
                      return (
                        <span
                          key={c.label}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${p.chipBg}`}
                        >
                          <ChipIcon className="size-3" />
                          {c.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

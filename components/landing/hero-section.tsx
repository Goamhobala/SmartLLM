import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.90_0.04_240)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_oklch(0.92_0.03_200)_0%,_transparent_50%)]" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <span className="inline-block size-2 rounded-full bg-accent" />
          Now in Public Beta
        </div>
        <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
          Stop Overpaying
          <br />
          <span className="text-accent">for AI.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          Our gateway cuts LLM costs by up to 68% and dramatically reduces hallucination with RAG-verified answers. Change one line of code.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            Get Started Free
          </Link>
          <a
            href="#pricing"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-8 text-base font-medium text-foreground transition-colors hover:bg-secondary"
          >
            See Pricing
          </a>
        </div>
        <div className="mx-auto mt-16 max-w-xl rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="mb-2 text-xs font-medium text-muted-foreground">One line of code:</p>
          <code className="block rounded-md bg-secondary px-4 py-3 text-left font-mono text-sm text-foreground">
            <span className="text-muted-foreground">{'// Before:'}</span>{' '}
            <span className="text-accent">api.openai.com</span>
            <br />
            <span className="text-muted-foreground">{'// After: '}</span>{' '}
            <span className="text-accent">gateway.smartllm.io</span>
          </code>
        </div>

        {/* Research credibility strip */}
        <div className="mx-auto mt-10 max-w-3xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground text-center">Backed by research</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                stat: "Up to 68%",
                desc: "reduction in API calls via semantic caching",
                source: "Regmi & Pun, arXiv 2024",
              },
              {
                stat: "40% of issues",
                desc: "resolved by AI without human agents by 2027",
                source: "Gartner, 2024",
              },
              {
                stat: "Significant↓",
                desc: "hallucination rate when RAG is applied to LLM responses",
                source: "Nishisako et al., PubMed 2025",
              },
            ].map((r) => (
              <div key={r.stat} className="rounded-lg border border-border/60 bg-card px-4 py-3 text-center">
                <p className="text-lg font-bold text-accent">{r.stat}</p>
                <p className="mt-1 text-xs text-foreground leading-snug">{r.desc}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{r.source}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

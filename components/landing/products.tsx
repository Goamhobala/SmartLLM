import { MessageSquareText, ImageIcon } from "lucide-react"

export function Products() {
  return (
    <section id="products" className="bg-secondary/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Two Products, One Gateway
          </h2>
          <p className="mt-4 text-muted-foreground">
            Intercept, verify, and cache — for both text and image APIs.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {/* Text Interceptor */}
          <div className="rounded-xl border border-border bg-card p-8 transition-all hover:shadow-md">
            <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquareText className="size-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Text Interceptor</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Verified facts, human tone. Your knowledge base answers 50–65% of queries at 99% lower cost. Novel queries route to a full LLM and get flagged for your review.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Knowledge Base</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Smart Routing</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Review Queue</span>
            </div>
          </div>

          {/* Image Interceptor */}
          <div className="rounded-xl border border-border bg-card p-8 transition-all hover:shadow-md">
            <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-accent/10">
              <ImageIcon className="size-7 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Image Interceptor</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Semantically similar image requests return cached results instantly. Zero cost, millisecond latency.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">Semantic Cache</span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">Zero Latency</span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">Zero Cost</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

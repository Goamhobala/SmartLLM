import { Upload, Code, TrendingDown } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload your docs",
    description: "We generate a knowledge base from your FAQs and help articles.",
    step: "01",
  },
  {
    icon: Code,
    title: "Change your API URL",
    description: "Point your app to our gateway. One line of code.",
    step: "02",
  },
  {
    icon: TrendingDown,
    title: "Save money instantly",
    description: "Verified answers from your knowledge base. Novel queries routed to the cheapest capable model.",
    step: "03",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground">
            Three steps to dramatically reduce your AI costs.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.step} className="group relative rounded-xl border border-border bg-card p-8 transition-all hover:border-accent/30 hover:shadow-md">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-accent/10">
                  <step.icon className="size-6 text-accent" />
                </div>
                <span className="text-sm font-bold text-accent">{step.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

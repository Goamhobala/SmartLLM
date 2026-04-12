"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Sparkles, Loader2, Zap } from "lucide-react"

export default function ImageDemoPage() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    imageSrc: string
    model: string
    cost: string
    time: string
    isCached: boolean
  } | null>(null)
  const generationCount = useRef(0)

  async function handleGenerate() {
    if (!prompt.trim() || isLoading) return

    generationCount.current += 1
    const isFirstGeneration = generationCount.current === 1

    if (isFirstGeneration) {
      setIsLoading(true)
      setResult(null)
      // Simulate DALL-E latency
      await new Promise((resolve) => setTimeout(resolve, 4200))
      setIsLoading(false)
      setResult({
        imageSrc: "/images/white-tshirt-product.jpg",
        model: "DALL-E 3",
        cost: "$0.04",
        time: "4.2s",
        isCached: false,
      })
    } else {
      setResult(null)
      // Instant cache hit
      await new Promise((resolve) => setTimeout(resolve, 50))
      setResult({
        imageSrc: "/images/white-tshirt-product.jpg",
        model: "Cache (Semantic Match)",
        cost: "$0.00",
        time: "12ms",
        isCached: true,
      })
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(0.13_0.02_260)]">
      <div className="mx-auto max-w-3xl px-8 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[oklch(0.30_0.03_260)] bg-[oklch(0.18_0.02_260)] px-4 py-1.5 text-xs text-[oklch(0.70_0.02_260)]">
            <Sparkles className="size-3" />
            Demo Client Application
          </div>
          <h1 className="text-3xl font-bold text-[oklch(0.95_0.005_260)]">
            AI Image Generator
          </h1>
          <p className="mt-2 text-sm text-[oklch(0.60_0.02_260)]">
            Powered by Smart LLM Gateway&apos;s Image Interceptor
          </p>
        </div>

        {/* Input */}
        <div className="mb-8 flex gap-3">
          <input
            type="text"
            placeholder="e.g. White cotton t-shirt on clean surface, studio lighting..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            className="h-12 flex-1 rounded-lg border border-[oklch(0.30_0.03_260)] bg-[oklch(0.18_0.02_260)] px-4 text-sm text-[oklch(0.95_0.005_260)] placeholder:text-[oklch(0.45_0.02_260)] focus:border-[oklch(0.55_0.14_240)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.55_0.14_240)]"
          />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="flex h-12 items-center gap-2 rounded-lg bg-[oklch(0.55_0.14_240)] px-6 text-sm font-medium text-white transition-colors hover:bg-[oklch(0.50_0.14_240)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Zap className="size-4" />
            )}
            Generate
          </button>
        </div>

        {/* Result */}
        <div className="overflow-hidden rounded-xl border border-[oklch(0.30_0.03_260)] bg-[oklch(0.18_0.02_260)]">
          {isLoading && (
            <div className="flex h-80 flex-col items-center justify-center gap-4">
              <Loader2 className="size-8 animate-spin text-[oklch(0.55_0.14_240)]" />
              <div className="text-center">
                <p className="text-sm font-medium text-[oklch(0.80_0.005_260)]">Generating image...</p>
                <p className="mt-1 text-xs text-[oklch(0.50_0.02_260)]">Sending request to DALL-E 3</p>
              </div>
            </div>
          )}

          {!isLoading && !result && (
            <div className="flex h-80 flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[oklch(0.22_0.03_260)]">
                <Sparkles className="size-7 text-[oklch(0.50_0.02_260)]" />
              </div>
              <p className="text-sm text-[oklch(0.50_0.02_260)]">
                Enter a prompt and click Generate to create an image
              </p>
            </div>
          )}

          {!isLoading && result && (
            <div>
              <div className="relative aspect-video w-full">
                <Image
                  src={result.imageSrc}
                  alt="Generated image"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className={`flex items-center justify-between px-4 py-3 ${
                result.isCached
                  ? "bg-emerald-500/10 border-t border-emerald-500/20"
                  : "border-t border-[oklch(0.30_0.03_260)]"
              }`}>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-[oklch(0.60_0.02_260)]">
                    Model: <strong className="text-[oklch(0.85_0.005_260)]">{result.model}</strong>
                  </span>
                  <span className="text-[oklch(0.60_0.02_260)]">
                    Cost: <strong className={result.isCached ? "text-emerald-400" : "text-[oklch(0.85_0.005_260)]"}>{result.cost}</strong>
                  </span>
                  <span className="text-[oklch(0.60_0.02_260)]">
                    Time: <strong className={result.isCached ? "text-emerald-400" : "text-[oklch(0.85_0.005_260)]"}>{result.time}</strong>
                  </span>
                </div>
                {result.isCached && (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                    Cache Hit — $0.04 saved
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Explainer */}
        <div className="mt-6 rounded-lg border border-[oklch(0.25_0.03_260)] bg-[oklch(0.16_0.02_260)] p-4">
          <p className="text-xs leading-relaxed text-[oklch(0.55_0.02_260)]">
            <strong className="text-[oklch(0.75_0.005_260)]">How it works:</strong> The first generation routes to DALL-E 3 (~4s, $0.04). Subsequent semantically similar prompts (e.g. &quot;white tee product shot&quot;) return cached results instantly (12ms, $0.00). Perfect for e-commerce catalogs generating multiple variations.
          </p>
        </div>
      </div>
    </div>
  )
}

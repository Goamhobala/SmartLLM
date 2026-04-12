"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Bot, User, Zap, Clock, DollarSign, Database, Loader2, Sparkles } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// Each KB entry has multiple rephrasings -- the gateway returns semantically identical
// but linguistically different answers to demonstrate that the KB + small-model pipeline
// rewrites content rather than parrot-copying it verbatim.
const KB_RESPONSES: Record<string, { variants: string[]; latency: number; cost: number }> = {
  "how do i reset my password": {
    variants: [
      "To reset your password, go to Settings > Security > Change Password. You'll receive a verification email. Click the link and set your new password. If you don't receive the email within 5 minutes, check your spam folder.",
      "Head over to your Settings, then Security, and select Change Password. We'll send you a verification email -- follow the link to create a new password. Make sure to check spam if it doesn't arrive within a few minutes.",
      "You can change your password under Settings > Security > Change Password. A verification link will be sent to your inbox. Click it, choose a new password, and you're all set. Didn't get the email? Try your spam folder.",
      "Navigate to Settings, open Security, and hit Change Password. An email with a verification link will arrive shortly -- use it to set your new password. If it takes more than 5 minutes, peek in your spam.",
    ],
    latency: 95,
    cost: 0.00003,
  },
  "how do i cancel my subscription": {
    variants: [
      "To cancel your subscription, navigate to Settings > Billing > Manage Plan and click 'Cancel Subscription'. Your access will continue until the end of your current billing period. You can reactivate anytime.",
      "Go to Settings, then Billing, and select Manage Plan. From there, click Cancel Subscription. You'll keep access through the remainder of your billing cycle, and you're free to reactivate whenever you'd like.",
      "You can cancel by visiting Settings > Billing > Manage Plan and hitting the Cancel Subscription button. Don't worry -- you'll still have access until your current period ends, and reactivating is always an option.",
      "Open your Settings, head to Billing, and choose Manage Plan. Click Cancel Subscription and your plan will end at the close of your current billing period. Feel free to come back anytime.",
    ],
    latency: 88,
    cost: 0.00003,
  },
  "what payment methods do you accept": {
    variants: [
      "We accept Visa, Mastercard, American Express, and PayPal. For enterprise plans, we also support wire transfers and purchase orders. All payments are processed securely through Stripe.",
      "You can pay with Visa, Mastercard, Amex, or PayPal. Enterprise customers also have the option of wire transfers and purchase orders. Everything is handled securely via Stripe.",
      "We support all major cards -- Visa, Mastercard, and American Express -- plus PayPal. On enterprise plans, wire transfers and POs are available too. Stripe handles all payment processing for security.",
      "Our accepted payment methods include Visa, Mastercard, American Express, and PayPal. If you're on an enterprise plan, we can also process wire transfers and purchase orders. Stripe powers all transactions securely.",
    ],
    latency: 92,
    cost: 0.00003,
  },
  "how do i export my data": {
    variants: [
      "Go to Settings > Data > Export. Select the data types you want (messages, files, contacts) and choose your format (CSV, JSON, or PDF). The export will be emailed to you within 24 hours.",
      "Head to Settings, then Data, and click Export. Pick which data you need -- messages, files, or contacts -- and your preferred format (CSV, JSON, PDF). You'll get the file by email within 24 hours.",
      "Under Settings > Data > Export, you can choose what to include (messages, files, contacts) and the format you want it in. We support CSV, JSON, and PDF. Expect the download link in your inbox within a day.",
      "Visit the Export section in Settings > Data. Choose your data types and output format -- we offer CSV, JSON, and PDF. Once submitted, the export is emailed to you, usually within 24 hours.",
    ],
    latency: 105,
    cost: 0.00003,
  },
  "what are your business hours": {
    variants: [
      "Our support team is available Monday through Friday, 9 AM to 6 PM EST. For urgent issues, our AI assistant is available 24/7 and can resolve most common questions instantly.",
      "We're here Monday to Friday, 9 AM -- 6 PM EST. Outside those hours, our AI assistant runs around the clock and handles most common inquiries right away.",
      "Support is staffed Mon-Fri from 9 AM to 6 PM Eastern. Need help outside those times? Our AI assistant is always on and can answer the majority of questions instantly.",
      "Our human support team works weekdays, 9 AM to 6 PM EST. But our AI assistant never sleeps -- it's available 24/7 and resolves most common questions in seconds.",
    ],
    latency: 80,
    cost: 0.00003,
  },
  "do you have a mobile app": {
    variants: [
      "Yes! Our mobile app is available on both iOS (App Store) and Android (Google Play). It supports all core features including messaging, file sharing, and push notifications.",
      "Absolutely -- you can download our app from the App Store for iOS or Google Play for Android. All the key features are there: messaging, file sharing, push notifications, and more.",
      "We sure do! Find us on both the App Store and Google Play. The mobile app includes messaging, file sharing, and push notifications -- everything you need on the go.",
      "Yes, we have apps for iOS and Android. Grab it from the App Store or Google Play. You'll get full access to messaging, file sharing, and real-time push notifications.",
    ],
    latency: 78,
    cost: 0.00003,
  },
}

// Queries that need LLM routing
const LLM_RESPONSES: Record<string, { variants: string[]; latency: number; cost: number }> = {
  "do you integrate with zapier": {
    variants: [
      "We don't have a native Zapier integration yet, but it's on our Q3 roadmap. In the meantime, you can use our REST API to build custom workflows. Our API docs are at docs.example.com/api. Several customers have built Zapier-like automations using our webhooks feature.",
      "A native Zapier connector is planned for Q3. Until then, our REST API and webhooks make it straightforward to build similar automations yourself. Check out docs.example.com/api for details -- quite a few teams are already doing this successfully.",
      "Zapier integration isn't available natively yet, though it's coming in Q3. For now, you can accomplish the same thing through our REST API and webhook system. Documentation is at docs.example.com/api.",
    ],
    latency: 820,
    cost: 0.0016,
  },
  "can i get a bulk discount for my team": {
    variants: [
      "Absolutely! For teams of 10+, we offer volume discounts starting at 15% off. For 50+ seats, discounts can reach up to 40%. I'd recommend reaching out to our sales team at sales@example.com for a custom quote tailored to your team's needs.",
      "Yes -- we have tiered volume pricing. Teams of 10 or more get at least 15% off, and at 50+ seats the discount can go as high as 40%. Drop a line to sales@example.com and they'll put together a custom quote for you.",
      "Definitely! Volume discounts start at 15% for 10+ users and scale up to 40% for 50+ seats. For an exact quote tailored to your team size, contact our sales team at sales@example.com.",
    ],
    latency: 910,
    cost: 0.0018,
  },
  "what makes you different from competitors": {
    variants: [
      "Great question! Our key differentiators are: 1) Smart routing that cuts LLM costs by 40-60%, 2) Built-in knowledge base with hallucination verification, 3) Sub-100ms response times for cached queries, and 4) Enterprise-grade security with SOC 2 compliance. We're the only platform that combines all four.",
      "Four things set us apart: intelligent routing that reduces LLM spend by 40-60%, a knowledge base with built-in hallucination checks, cached responses in under 100ms, and SOC 2-certified security. No other platform brings all four together in one product.",
      "What makes us unique is the combination of smart cost-saving routing (40-60% savings), integrated KB with hallucination verification, sub-100ms cache performance, and enterprise security (SOC 2). Each feature exists elsewhere individually, but we're the only ones offering them all.",
    ],
    latency: 780,
    cost: 0.0015,
  },
}

// Default fallback for unrecognized queries
const FALLBACK_VARIANTS = [
  "That's a great question! Let me look into that for you. Based on our documentation, I'd recommend checking our help center at help.example.com for detailed guides, or I can connect you with a support specialist who can assist further.",
  "Good question! I've checked our docs and the best next step would be to visit help.example.com for in-depth guides. Alternatively, I can loop in a support specialist to help you out.",
  "Interesting question! Our help center at help.example.com has comprehensive guides that should cover this. If you'd prefer, I can also connect you directly with a specialist.",
]
const FALLBACK_RESPONSE = { latency: 650, cost: 0.0012 }

// Pick a random variant from an array
function pickVariant(variants: string[]): string {
  return variants[Math.floor(Math.random() * variants.length)]
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  meta?: {
    route: "kb" | "llm" | "cache"
    model: string
    latency: number
    cost: number
    cached: boolean
  }
}

interface ChatPanelProps {
  id: string
  title: string
  description: string
  accentColor: string
  iconColor: string
  onRequestLogged?: (entry: {
    query: string
    route: "kb" | "llm" | "cache"
    model: string
    latency: number
    cost: number
  }) => void
}

// Shared cache across all panels
const responseCache = new Map<string, { answer: string; route: "kb" | "llm"; model: string }>()

let msgCounter = 0

export function ChatPanel({ id, title, description, accentColor, iconColor, onRequestLogged }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector("[data-slot='scroll-area-viewport']")
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const normalizeQuery = (q: string) => q.toLowerCase().replace(/[?!.,]/g, "").trim()

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `msg-${++msgCounter}`,
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const normalized = normalizeQuery(input)

    // Check cross-panel cache first
    const cached = responseCache.get(normalized)
    if (cached) {
      // Cache hit - instant response
      await simulateDelay(45)
      const assistantMessage: ChatMessage = {
        id: `msg-${++msgCounter}`,
        role: "assistant",
        content: cached.answer,
        meta: {
          route: "cache",
          model: `Cache (${cached.model})`,
          latency: 12,
          cost: 0,
          cached: true,
        },
      }
      setMessages((prev) => [...prev, assistantMessage])
      onRequestLogged?.({
        query: input.trim(),
        route: "cache",
        model: `Cache (${cached.model})`,
        latency: 12,
        cost: 0,
      })
      setIsLoading(false)
      return
    }

    // Check KB -- pick a random variant so each response reads differently
    const kbMatch = KB_RESPONSES[normalized]
    if (kbMatch) {
      const answer = pickVariant(kbMatch.variants)
      await simulateDelay(kbMatch.latency)
      responseCache.set(normalized, { answer, route: "kb", model: "Llama 3.2 3B" })
      const assistantMessage: ChatMessage = {
        id: `msg-${++msgCounter}`,
        role: "assistant",
        content: answer,
        meta: {
          route: "kb",
          model: "KB -> Llama 3.2 3B",
          latency: kbMatch.latency,
          cost: kbMatch.cost,
          cached: false,
        },
      }
      setMessages((prev) => [...prev, assistantMessage])
      onRequestLogged?.({
        query: input.trim(),
        route: "kb",
        model: "KB -> Llama 3.2 3B",
        latency: kbMatch.latency,
        cost: kbMatch.cost,
      })
      setIsLoading(false)
      return
    }

    // Check LLM routes
    const llmMatch = LLM_RESPONSES[normalized]
    if (llmMatch) {
      const answer = pickVariant(llmMatch.variants)
      await simulateDelay(llmMatch.latency)
      responseCache.set(normalized, { answer, route: "llm", model: "GPT-4.1 Mini" })
      const assistantMessage: ChatMessage = {
        id: `msg-${++msgCounter}`,
        role: "assistant",
        content: answer,
        meta: {
          route: "llm",
          model: "GPT-4.1 Mini",
          latency: llmMatch.latency,
          cost: llmMatch.cost,
          cached: false,
        },
      }
      setMessages((prev) => [...prev, assistantMessage])
      onRequestLogged?.({
        query: input.trim(),
        route: "llm",
        model: "GPT-4.1 Mini",
        latency: llmMatch.latency,
        cost: llmMatch.cost,
      })
      setIsLoading(false)
      return
    }

    // Fallback
    const fallbackAnswer = pickVariant(FALLBACK_VARIANTS)
    await simulateDelay(FALLBACK_RESPONSE.latency)
    responseCache.set(normalized, { answer: fallbackAnswer, route: "llm", model: "GPT-4.1 Mini" })
    const assistantMessage: ChatMessage = {
      id: `msg-${++msgCounter}`,
      role: "assistant",
      content: fallbackAnswer,
      meta: {
        route: "llm",
        model: "GPT-4.1 Mini",
        latency: FALLBACK_RESPONSE.latency,
        cost: FALLBACK_RESPONSE.cost,
        cached: false,
      },
    }
    setMessages((prev) => [...prev, assistantMessage])
    onRequestLogged?.({
      query: input.trim(),
      route: "llm",
      model: "GPT-4.1 Mini",
      latency: FALLBACK_RESPONSE.latency,
      cost: FALLBACK_RESPONSE.cost,
    })
    setIsLoading(false)
  }

  const suggestedQueries = [
    "How do I reset my password?",
    "Do you integrate with Zapier?",
    "How do I cancel my subscription?",
    "Can I get a bulk discount for my team?",
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className={cn("flex shrink-0 items-center gap-3 border-b border-border px-5 py-3", accentColor)}>
        <div className={cn("flex size-8 items-center justify-center rounded-lg", iconColor)}>
          <Bot className="size-4 text-card" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-card">{title}</h3>
          <p className="truncate text-xs text-card/70">{description}</p>
        </div>
      </div>

      {/* Messages -- min-h-0 is critical for flex scroll overflow */}
      <div className="relative min-h-0 flex-1">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="flex flex-col gap-4 p-5">
            {messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
                <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                  <Sparkles className="size-5 text-muted-foreground" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Ask a question to see smart routing in action
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedQueries.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q)
                        inputRef.current?.focus()
                      }}
                      className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Bot className="size-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  {msg.meta && (
                    <div
                      className={cn(
                        "mt-2.5 flex flex-wrap items-center gap-2.5 border-t pt-2 text-[11px]",
                        msg.role === "user"
                          ? "border-primary-foreground/20 text-primary-foreground/70"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      <span className="flex items-center gap-1">
                        {msg.meta.cached ? (
                          <Database className="size-3.5" />
                        ) : msg.meta.route === "kb" ? (
                          <Zap className="size-3.5" />
                        ) : (
                          <Sparkles className="size-3.5" />
                        )}
                        {msg.meta.model}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {msg.meta.latency}ms
                      </span>
                      <span
                        className={cn(
                          "flex items-center gap-1 font-semibold",
                          msg.meta.cached
                            ? "text-emerald-600"
                            : msg.meta.route === "kb"
                              ? "text-emerald-600"
                              : ""
                        )}
                      >
                        <DollarSign className="size-3.5" />
                        {msg.meta.cost === 0 ? "FREE" : `$${msg.meta.cost.toFixed(5)}`}
                      </span>
                      {msg.meta.cached && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          CACHE HIT
                        </span>
                      )}
                      {!msg.meta.cached && msg.meta.route === "kb" && (
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                          KB MATCH
                        </span>
                      )}
                      {!msg.meta.cached && msg.meta.route === "llm" && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          LLM ROUTE
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="size-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="size-4 text-primary-foreground" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Routing query...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="size-4" />
            <span className="sr-only">Send message</span>
          </button>
        </form>
      </div>
    </div>
  )
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.min(ms, 1200)))
}

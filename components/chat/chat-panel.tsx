"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Send, Bot, User, Zap, Clock, DollarSign, Database,
  Loader2, Sparkles, Globe, UserCheck, ShieldAlert,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Semantic key map — multiple phrasings collapse to one canonical cache key
// ---------------------------------------------------------------------------
const SEMANTIC_KEYS: Record<string, string> = {
  "what are payflows fees":                "payflow-fees",
  "what is the fee structure like":        "payflow-fees",
  "what is payflows fee structure":        "payflow-fees",
  "how much does payflow cost":            "payflow-fees",
  "how much does payflow charge":          "payflow-fees",
  "are there any fees on payflow":         "payflow-fees",
  "what fees does payflow charge":         "payflow-fees",
}

// ---------------------------------------------------------------------------
// KB responses — canonical intent key → answer variants
// ---------------------------------------------------------------------------
const KB_RESPONSES: Record<string, { variants: string[]; latency: number; cost: number }> = {
  "payflow-fees": {
    variants: [
      "Here's a full breakdown of PayFlow's fees:\n\n• PayFlow-to-PayFlow transfers: Free\n• Bank withdrawals (any SA bank): R5 flat fee\n• Card top-ups: 1.5% of the top-up amount\n• Bill payments (all supported billers): Free\n• International transfers via PayFlow Global: 2.5% + R15 flat fee\n\nThere are no monthly account fees on any tier.",
      "PayFlow's fee structure is straightforward:\n\n• P2P wallet transfers: Always free\n• Withdrawing to a SA bank account: R5 flat fee\n• Topping up via card: 1.5% of the amount\n• Bill payments to any supported biller: Free\n• International transfers via PayFlow Global: 2.5% + R15\n\nNo monthly or annual subscription fees for any account tier.",
      "PayFlow charges as follows:\n\n• Sending to another PayFlow user: R0 — always free\n• Bank payout (any SA bank): R5 per withdrawal\n• Card top-up: 1.5% of amount\n• Bill payments: R0\n• International via PayFlow Global: 2.5% + R15 flat\n\nZero monthly fees — Basic, Verified, Premium, and Business accounts all included.",
    ],
    latency: 91,
    cost: 0.00003,
  },
  "how do i reset my password": {
    variants: [
      "Tap 'Forgot Password' on the PayFlow login screen. Enter the email or phone number linked to your account. You'll receive a 6-digit OTP valid for 10 minutes. After entering the OTP, create a new password with at least 8 characters, one uppercase letter, and one number. No OTP? Check your spam folder or request a new one after 60 seconds.",
      "On the login screen, hit Forgot Password. Enter your registered email or phone and PayFlow will send a 6-digit OTP valid for 10 minutes. Use it to set a new password — 8+ characters, 1 uppercase, 1 number. Didn't get it? Check spam or wait 60 seconds to request again.",
      "Select Forgot Password at login and enter your registered contact. A 6-digit OTP arrives valid for 10 minutes. Set your new password (8+ characters, 1 uppercase, 1 number). Didn't get the code? Check spam or request a new one after 60 seconds.",
    ],
    latency: 88,
    cost: 0.00003,
  },
  "how do i send money": {
    variants: [
      "Open the PayFlow app and tap Send. Enter the recipient's PayFlow username, mobile number, or scan their QR code. Enter the amount and confirm with your 5-digit transaction PIN. PayFlow-to-PayFlow transfers are instant and free.",
      "Tap Send in the app. You can enter the recipient's PayFlow username, mobile number, or scan their QR code. Confirm the amount and enter your 5-digit PIN. PayFlow-to-PayFlow transfers are instant and cost nothing.",
    ],
    latency: 85,
    cost: 0.00003,
  },
  "what are the transfer limits": {
    variants: [
      "Daily transfer limits depend on your verification tier:\n\n• Basic (email only): R1,000/day\n• Verified (ID uploaded): R10,000/day\n• Premium (ID + proof of address): R50,000/day\n• Business accounts: R200,000/day\n\nTo upgrade, go to Settings → Verification and submit the required documents. Upgrades are processed within 24 hours on business days.",
    ],
    latency: 95,
    cost: 0.00003,
  },
  "how do i lock my wallet": {
    variants: [
      "You can lock your PayFlow wallet immediately two ways:\n\n1. In the app: Settings → Security → Lock Wallet\n2. SMS the word LOCK to 33210\n\nOnce locked, no transactions can be made until you unlock it. For fraud emergencies, call our 24/7 hotline: 0800-PAY-FLOW (0800-729-3569) option 3.",
    ],
    latency: 82,
    cost: 0.00003,
  },
  "suspicious activity on my account": {
    variants: [
      "If you notice suspicious activity on your PayFlow account, act immediately:\n\n1. Lock your wallet: Settings → Security → Lock Wallet, or SMS 'LOCK' to 33210\n2. Call the fraud team: 0800-PAY-FLOW (0800-729-3569), option 3 — available 24/7\n3. Never share your PIN, OTP, or password with anyone — PayFlow will never ask for these\n\nOur fraud team investigates within 4 hours.",
    ],
    latency: 93,
    cost: 0.00003,
  },
  "how do i close my account": {
    variants: [
      "Go to Settings → Account → Close Account. First withdraw your remaining balance to a linked bank account — closure can't proceed while you have funds. Outstanding disputes must also be resolved first.\n\nClosure is processed within 5 business days. Your transaction history is retained for 90 days for FICA compliance, then permanently deleted. This action is irreversible.",
    ],
    latency: 97,
    cost: 0.00003,
  },
}

// ---------------------------------------------------------------------------
// RAG responses — web search on whitelisted domains
// ---------------------------------------------------------------------------
const RAG_RESPONSES: Record<string, {
  searchDomain: string
  searchDomainLabel: string
  searchStages: string[]
  variants: string[]
  latency: number
  cost: number
}> = {
  "how do i use the newest payflow api": {
    searchDomain: "developers.payflow.co.za",
    searchDomainLabel: "PayFlow Developer Portal",
    searchStages: [
      "Searching developers.payflow.co.za...",
      "Indexing API reference & changelog...",
      "Synthesizing response...",
    ],
    variants: [
      "Based on the latest PayFlow Developer Documentation, here's how to get started:\n\nAuthentication\nGenerate your API key in the merchant dashboard under Settings → API.\n\nCore Endpoints\n• POST /v1/payments — Initiate a payment\n• GET /v1/balance — Query wallet balance\n• POST /v1/refunds — Process a refund\n• Webhooks — Real-time transaction event delivery\n\nRate Limits\n• Standard plan: 100 requests/minute\n• Enterprise plan: 1,000 requests/minute\n\nFull SDK docs, code samples, and changelog at developers.payflow.co.za\n\nSource: PayFlow Developer Portal · Retrieved from whitelisted domain",
    ],
    latency: 1650,
    cost: 0.0028,
  },
  "how do i use the payflow api": {
    searchDomain: "developers.payflow.co.za",
    searchDomainLabel: "PayFlow Developer Portal",
    searchStages: [
      "Searching developers.payflow.co.za...",
      "Indexing API reference & changelog...",
      "Synthesizing response...",
    ],
    variants: [
      "Based on the latest PayFlow Developer Documentation, here's how to get started:\n\nAuthentication\nGenerate your API key in the merchant dashboard under Settings → API.\n\nCore Endpoints\n• POST /v1/payments — Initiate a payment\n• GET /v1/balance — Query wallet balance\n• POST /v1/refunds — Process a refund\n• Webhooks — Real-time transaction event delivery\n\nRate Limits\n• Standard plan: 100 requests/minute\n• Enterprise plan: 1,000 requests/minute\n\nFull SDK docs, code samples, and changelog at developers.payflow.co.za\n\nSource: PayFlow Developer Portal · Retrieved from whitelisted domain",
    ],
    latency: 1650,
    cost: 0.0028,
  },
}

// ---------------------------------------------------------------------------
// Escalation scenarios — hand off to a live human agent
// ---------------------------------------------------------------------------
const ESCALATION_ENTRY = {
  botReply: "This sounds like a serious security incident — I'm treating it as urgent priority.\n\nWhile I connect you to a PayFlow security specialist, please do this immediately:\n\nLock your wallet now: go to Settings → Security → Lock Wallet, or SMS the word LOCK to 33210.\n\nConnecting you to our 24/7 fraud and account recovery team now...",
  agentName: "Sarah · Security Team",
  agentReply: "Hi, I'm Sarah from PayFlow's Security Team. I've flagged your account as high priority. Let's get you secured immediately.\n\nFirst: have you been able to lock your wallet yet? And can you confirm the registered email address on your account so I can pull up your case? (Please never share your PIN or OTP — not even with me.)",
  cost: 0.0,
}

const ESCALATION_TRIGGERS = new Set([
  "i was hacked by somebody i need help getting my account back",
  "i was hacked i need help getting my account back",
  "someone hacked my account",
  "my account was hacked",
  "i think my account was hacked help",
])

// ---------------------------------------------------------------------------
// LLM fallback for novel queries not in KB
// ---------------------------------------------------------------------------
const LLM_RESPONSES: Record<string, { variants: string[]; latency: number; cost: number }> = {
  "do you offer volume discounts for businesses": {
    variants: [
      "Yes! PayFlow Business accounts processing more than R500,000/month qualify for volume discounts. Contact bizdev@payflow.co.za for a custom pricing quote tailored to your transaction volume.",
      "Volume discounts are available for high-throughput business accounts processing over R500k/month. Reach out to bizdev@payflow.co.za and the business development team will put together a custom rate for you.",
    ],
    latency: 860,
    cost: 0.0016,
  },
  "can i integrate payflow with my ecommerce platform": {
    variants: [
      "PayFlow's REST API supports integration with any platform that can make HTTP requests. We support payment initiation, balance queries, transaction webhooks, and refund processing. API keys are generated in the merchant dashboard under Settings → API. Full docs at developers.payflow.co.za.",
    ],
    latency: 790,
    cost: 0.0014,
  },
}

const FALLBACK_VARIANTS = [
  "I don't have a verified answer for that in PayFlow's knowledge base. For detailed assistance, please contact PayFlow support:\n\n• In-app chat: 24/7, average response under 5 minutes\n• Phone: 0800-PAY-FLOW (0800-729-3569)\n• Email: support@payflow.co.za",
  "That falls outside what I have verified answers for. I'd recommend reaching out to PayFlow support directly — in-app chat is available 24/7 with an average response time under 5 minutes.",
]
const FALLBACK_RESPONSE = { latency: 680, cost: 0.0012 }

function pickVariant(variants: string[]): string {
  return variants[Math.floor(Math.random() * variants.length)]
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system" | "agent"
  content: string
  meta?: {
    route: "kb" | "llm" | "cache" | "rag" | "escalate"
    model: string
    latency: number
    cost: number
    cached: boolean
    ragDomain?: string
    agentName?: string
  }
}

interface ChatPanelProps {
  id: string
  title: string
  description: string
  accentColor: string
  iconColor: string
  suggestedQueries?: string[]
  onRequestLogged?: (entry: {
    query: string
    route: "kb" | "llm" | "cache"
    model: string
    latency: number
    cost: number
  }) => void
}

// Shared cross-panel cache — keyed by canonical semantic key
const responseCache = new Map<string, { answer: string; route: "kb" | "llm"; model: string }>()

let msgCounter = 0

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ChatPanel({
  id: _id,
  title,
  description,
  accentColor,
  iconColor,
  suggestedQueries,
  onRequestLogged,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState("Routing query...")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const defaultSuggested = suggestedQueries ?? [
    "What are PayFlow's fees?",
    "How do I reset my password?",
    "What are the transfer limits?",
    "How do I lock my wallet?",
  ]

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector("[data-slot='scroll-area-viewport']")
      if (viewport) viewport.scrollTop = viewport.scrollHeight
    }
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const normalizeQuery = (q: string) =>
    q.toLowerCase().replace(/[?!.,'"]/g, "").trim()

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const queryText = input.trim()
    const userMessage: ChatMessage = { id: `msg-${++msgCounter}`, role: "user", content: queryText }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setLoadingLabel("Routing query...")

    const normalized = normalizeQuery(queryText)
    const semanticKey = SEMANTIC_KEYS[normalized] ?? normalized

    // ── 1. Escalation (not cached) ──────────────────────────────────────────
    const isEscalation =
      ESCALATION_TRIGGERS.has(normalized) ||
      (normalized.includes("hacked") && normalized.includes("account"))

    if (isEscalation) {
      await simulateDelay(1000)
      const botMsg: ChatMessage = {
        id: `msg-${++msgCounter}`,
        role: "assistant",
        content: ESCALATION_ENTRY.botReply,
        meta: { route: "escalate", model: "SmartLLM Router", latency: 220, cost: 0, cached: false },
      }
      setMessages((prev) => [...prev, botMsg])
      setLoadingLabel("Connecting to live agent...")

      await simulateDelay(4800)

      const systemMsg: ChatMessage = {
        id: `msg-${++msgCounter}`,
        role: "system",
        content: `${ESCALATION_ENTRY.agentName} has joined the conversation`,
      }
      setMessages((prev) => [...prev, systemMsg])

      await simulateDelay(700)

      const agentMsg: ChatMessage = {
        id: `msg-${++msgCounter}`,
        role: "agent",
        content: ESCALATION_ENTRY.agentReply,
        meta: {
          route: "escalate",
          model: "Live Agent",
          latency: 0,
          cost: 0,
          cached: false,
          agentName: ESCALATION_ENTRY.agentName,
        },
      }
      setMessages((prev) => [...prev, agentMsg])
      setIsLoading(false)
      setLoadingLabel("Routing query...")
      return
    }

    // ── 2. Cross-panel cache ────────────────────────────────────────────────
    const cached = responseCache.get(semanticKey)
    if (cached) {
      await simulateDelay(35)
      const msg: ChatMessage = {
        id: `msg-${++msgCounter}`,
        role: "assistant",
        content: cached.answer,
        meta: { route: "cache", model: `Cache (${cached.model})`, latency: 12, cost: 0, cached: true },
      }
      setMessages((prev) => [...prev, msg])
      onRequestLogged?.({ query: queryText, route: "cache", model: `Cache (${cached.model})`, latency: 12, cost: 0 })
      setIsLoading(false)
      setLoadingLabel("Routing query...")
      return
    }

    // ── 3. RAG ──────────────────────────────────────────────────────────────
    const ragMatch = RAG_RESPONSES[normalized]
    if (ragMatch) {
      const stageDuration = Math.floor((ragMatch.latency - 200) / ragMatch.searchStages.length)
      await simulateDelay(150)
      for (const stage of ragMatch.searchStages) {
        setLoadingLabel(stage)
        await simulateDelay(stageDuration)
      }
      const answer = pickVariant(ragMatch.variants)
      const msg: ChatMessage = {
        id: `msg-${++msgCounter}`,
        role: "assistant",
        content: answer,
        meta: {
          route: "rag",
          model: "RAG → GPT-4.1 Mini",
          latency: ragMatch.latency,
          cost: ragMatch.cost,
          cached: false,
          ragDomain: ragMatch.searchDomain,
        },
      }
      setMessages((prev) => [...prev, msg])
      onRequestLogged?.({ query: queryText, route: "llm", model: "GPT-4.1 Mini", latency: ragMatch.latency, cost: ragMatch.cost })
      setIsLoading(false)
      setLoadingLabel("Routing query...")
      return
    }

    // ── 4. KB ───────────────────────────────────────────────────────────────
    const kbMatch = KB_RESPONSES[semanticKey]
    if (kbMatch) {
      const answer = pickVariant(kbMatch.variants)
      await simulateDelay(kbMatch.latency)
      responseCache.set(semanticKey, { answer, route: "kb", model: "Llama 3.2 3B" })
      const msg: ChatMessage = {
        id: `msg-${++msgCounter}`,
        role: "assistant",
        content: answer,
        meta: { route: "kb", model: "KB → Llama 3.2 3B", latency: kbMatch.latency, cost: kbMatch.cost, cached: false },
      }
      setMessages((prev) => [...prev, msg])
      onRequestLogged?.({ query: queryText, route: "kb", model: "KB → Llama 3.2 3B", latency: kbMatch.latency, cost: kbMatch.cost })
      setIsLoading(false)
      setLoadingLabel("Routing query...")
      return
    }

    // ── 5. LLM route ────────────────────────────────────────────────────────
    const llmMatch = LLM_RESPONSES[normalized]
    if (llmMatch) {
      const answer = pickVariant(llmMatch.variants)
      await simulateDelay(llmMatch.latency)
      responseCache.set(semanticKey, { answer, route: "llm", model: "GPT-4.1 Mini" })
      const msg: ChatMessage = {
        id: `msg-${++msgCounter}`,
        role: "assistant",
        content: answer,
        meta: { route: "llm", model: "GPT-4.1 Mini", latency: llmMatch.latency, cost: llmMatch.cost, cached: false },
      }
      setMessages((prev) => [...prev, msg])
      onRequestLogged?.({ query: queryText, route: "llm", model: "GPT-4.1 Mini", latency: llmMatch.latency, cost: llmMatch.cost })
      setIsLoading(false)
      setLoadingLabel("Routing query...")
      return
    }

    // ── 6. Fallback ─────────────────────────────────────────────────────────
    const fallbackAnswer = pickVariant(FALLBACK_VARIANTS)
    await simulateDelay(FALLBACK_RESPONSE.latency)
    responseCache.set(semanticKey, { answer: fallbackAnswer, route: "llm", model: "GPT-4.1 Mini" })
    const fallbackMsg: ChatMessage = {
      id: `msg-${++msgCounter}`,
      role: "assistant",
      content: fallbackAnswer,
      meta: { route: "llm", model: "GPT-4.1 Mini", latency: FALLBACK_RESPONSE.latency, cost: FALLBACK_RESPONSE.cost, cached: false },
    }
    setMessages((prev) => [...prev, fallbackMsg])
    onRequestLogged?.({ query: queryText, route: "llm", model: "GPT-4.1 Mini", latency: FALLBACK_RESPONSE.latency, cost: FALLBACK_RESPONSE.cost })
    setIsLoading(false)
    setLoadingLabel("Routing query...")
  }

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

      {/* Messages */}
      <div className="relative min-h-0 flex-1">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="flex flex-col gap-4 p-5">
            {messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
                <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                  <Sparkles className="size-5 text-muted-foreground" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Ask a question to see smart routing in action
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {defaultSuggested.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); inputRef.current?.focus() }}
                      className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              // System divider
              if (msg.role === "system") {
                return (
                  <div key={msg.id} className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-border" />
                    <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
                      {msg.content}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )
              }

              // Live agent message
              if (msg.role === "agent") {
                return (
                  <div key={msg.id} className="flex gap-2.5">
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-600">
                      <span className="text-[11px] font-bold text-white">
                        {msg.meta?.agentName?.charAt(0) ?? "A"}
                      </span>
                    </div>
                    <div className="max-w-[85%] rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-foreground">
                      {msg.meta?.agentName && (
                        <p className="mb-1.5 text-[11px] font-semibold text-emerald-700">
                          {msg.meta.agentName}
                        </p>
                      )}
                      <p className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</p>
                      <div className="mt-2.5 flex items-center gap-1.5 border-t border-emerald-200 pt-2 text-[11px] font-semibold text-emerald-700">
                        <UserCheck className="size-3.5" />
                        LIVE AGENT
                      </div>
                    </div>
                  </div>
                )
              }

              // User and assistant messages
              return (
                <div
                  key={msg.id}
                  className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                      msg.meta?.route === "escalate" ? "bg-amber-500" : "bg-primary",
                    )}>
                      {msg.meta?.route === "escalate"
                        ? <ShieldAlert className="size-4 text-white" />
                        : <Bot className="size-4 text-primary-foreground" />
                      }
                    </div>
                  )}

                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}>
                    <p className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</p>

                    {msg.meta && (
                      <div className={cn(
                        "mt-2.5 flex flex-wrap items-center gap-2.5 border-t pt-2 text-[11px]",
                        msg.role === "user"
                          ? "border-primary-foreground/20 text-primary-foreground/70"
                          : "border-border text-muted-foreground",
                      )}>
                        <span className="flex items-center gap-1">
                          {msg.meta.cached ? <Database className="size-3.5" />
                            : msg.meta.route === "kb" ? <Zap className="size-3.5" />
                            : msg.meta.route === "rag" ? <Globe className="size-3.5" />
                            : msg.meta.route === "escalate" ? <ShieldAlert className="size-3.5" />
                            : <Sparkles className="size-3.5" />}
                          {msg.meta.model}
                        </span>

                        {msg.meta.latency > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {msg.meta.latency}ms
                          </span>
                        )}

                        <span className={cn(
                          "flex items-center gap-1 font-semibold",
                          (msg.meta.cached || msg.meta.route === "kb") ? "text-emerald-600" : "",
                        )}>
                          <DollarSign className="size-3.5" />
                          {msg.meta.cost === 0 ? "FREE" : `R${msg.meta.cost.toFixed(5)}`}
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
                        {msg.meta.route === "rag" && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                            RAG · {msg.meta.ragDomain}
                          </span>
                        )}
                        {msg.meta.route === "escalate" && !msg.meta.agentName && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            ESCALATING
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
              )
            })}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="size-4 text-primary-foreground" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{loadingLabel}</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend() }}
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
  return new Promise((resolve) => setTimeout(resolve, Math.min(ms, 5000)))
}

"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Image as ImageIcon, Sparkles, Loader2, Zap, Tag, CheckCircle2, ShieldCheck, Database } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  imageUrl?: string
  isCached?: boolean
  cost?: number
  latency?: number
  keywords?: string[]
}

export default function ImageDemoPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      role: "assistant",
      content: "Welcome to the Product Studio! Describe the product you want to generate an image for (e.g., 'a black ceramic coffee mug on a modern desk').",
    }
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  
  // State for the right-hand interceptor panel
  const [activeAnalysis, setActiveAnalysis] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Track if we've already generated the "mug" to trigger a cache hit the second time
  const hasCachedMug = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || isGenerating) return

    const userText = input.trim()
    setInput("")
    
    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: userText }
    setMessages(prev => [...prev, userMsg])
    setIsGenerating(true)
    setActiveAnalysis(null)

    // Check if the user is asking for the mug
    const isMugQuery = userText.toLowerCase().includes("mug") || userText.toLowerCase().includes("coffee")

    if (isMugQuery && hasCachedMug.current) {
      // CACHE HIT SCENARIO
      await new Promise(resolve => setTimeout(resolve, 150)) // 150ms network delay
      
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: "I found a semantic match in your product cache! Here is the image:",
        imageUrl: "/images/mug.jpg", // Use the same image you saved for the interceptor
        isCached: true,
        cost: 0.00,
        latency: 12,
        keywords: ["black", "mug", "ceramic", "office", "modern"]
      }
      
      setMessages(prev => [...prev, botMsg])
      setActiveAnalysis(botMsg)
      setIsGenerating(false)
      
    } else {
      // FULL GENERATION SCENARIO
      // Wait 3 seconds to simulate DALL-E/Midjourney
      await new Promise(resolve => setTimeout(resolve, 3500)) 
      
      const keywords = isMugQuery 
        ? ["black", "mug", "ceramic", "office", "modern"]
        : ["product", "studio", "lighting", "clean", "ecommerce"]

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: "I've generated a new lifestyle shot for your product.",
        imageUrl: isMugQuery ? "/images/mug.jpg" : "/images/tshirt.jpg", 
        isCached: false,
        cost: 0.04,
        latency: 3540,
        keywords: keywords
      }

      if (isMugQuery) hasCachedMug.current = true

      setMessages(prev => [...prev, botMsg])
      setActiveAnalysis(botMsg)
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background pt-16 lg:pt-0 overflow-hidden">
      
      {/* LEFT PANEL: Chat Interface */}
      <div className="flex w-full flex-col border-r border-border lg:w-1/2">
        <div className="border-b border-border bg-card p-4 shadow-sm">
          <h1 className="text-lg font-bold text-foreground">Product Image Generator</h1>
          <p className="text-xs text-muted-foreground">Ask the AI to create lifestyle shots for your storefront.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent/20 text-accent"
              )}>
                {msg.role === "user" ? <span className="text-xs font-bold">ME</span> : <Sparkles className="size-4" />}
              </div>
              
              <div className={cn("flex flex-col max-w-[80%]", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn(
                  "rounded-2xl px-4 py-3 text-sm",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
                )}>
                  {msg.content}
                </div>
                
                {msg.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                    <div className="relative flex aspect-square w-64 flex-col items-center justify-center bg-muted/50">
                      <img 
                        src={msg.imageUrl} 
                        alt="Generated product" 
                        className="absolute inset-0 h-full w-full object-cover" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isGenerating && (
            <div className="flex gap-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-accent/20 text-accent">
                <Loader2 className="size-4 animate-spin" />
              </div>
              <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                Synthesizing image and analyzing semantics...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border bg-card p-4">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., A sleek black ceramic mug on a wooden desk..."
              disabled={isGenerating}
              className="w-full rounded-full border border-input bg-background py-3 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="absolute right-2 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="size-4 -ml-0.5" />
            </button>
          </form>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setInput("A black coffee mug in a modern office")} className="text-[10px] rounded-full border border-border bg-muted px-2 py-1 hover:bg-secondary transition-colors">Try: "A black coffee mug in a modern office"</button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: The SmartLLM Interceptor View */}
      <div className="hidden w-1/2 flex-col bg-muted/30 lg:flex">
        <div className="border-b border-border bg-card/50 p-4 backdrop-blur-sm flex items-center gap-2">
          <ShieldCheck className="size-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-foreground">SmartLLM Image Interceptor</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {!activeAnalysis ? (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
              <Database className="size-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground">Awaiting Generation Request</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                When a seller requests an image, the interceptor scans the semantic meaning to route it to the cache or the LLM.
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto space-y-6">
              
              {/* Status Header */}
              <div className={cn(
                "rounded-xl border p-4 flex items-center justify-between",
                activeAnalysis.isCached ? "bg-emerald-500/10 border-emerald-500/30" : "bg-card border-border"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex size-10 rounded-full items-center justify-center",
                    activeAnalysis.isCached ? "bg-emerald-500/20 text-emerald-600" : "bg-primary/10 text-primary"
                  )}>
                    {activeAnalysis.isCached ? <Zap className="size-5" /> : <Loader2 className="size-5" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Routing Status</p>
                    <p className={cn("text-lg font-bold", activeAnalysis.isCached ? "text-emerald-600" : "text-foreground")}>
                      {activeAnalysis.isCached ? "Semantic Cache Hit" : "Full LLM Generation"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs font-medium text-muted-foreground">Latency</p>
                  <p className={cn("mt-1 text-2xl font-bold", activeAnalysis.isCached ? "text-emerald-600" : "text-foreground")}>
                    {activeAnalysis.latency}ms
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs font-medium text-muted-foreground">API Cost</p>
                  <p className={cn("mt-1 text-2xl font-bold", activeAnalysis.isCached ? "text-emerald-600" : "text-foreground")}>
                    ${activeAnalysis.cost?.toFixed(3)}
                  </p>
                </div>
              </div>

              {/* Keyword Extraction Mapping */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="size-4 text-accent" />
                  <h3 className="text-sm font-semibold text-foreground">Semantic Knowledge Mapping</h3>
                </div>
                
                <p className="text-xs text-muted-foreground mb-4">
                  {activeAnalysis.isCached 
                    ? "Image retrieved by matching the following semantic intents in the database:" 
                    : "The following conceptual tags were extracted and saved to your Image Graph:"}
                </p>

                <div className="flex flex-wrap gap-2">
                  {activeAnalysis.keywords?.map((kw, i) => (
                    <div 
                      key={kw} 
                      className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground animate-in zoom-in"
                      style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                    >
                      <CheckCircle2 className="size-3 text-emerald-500" />
                      {kw}
                    </div>
                  ))}
                </div>

                {!activeAnalysis.isCached && (
                  <div className="mt-6 border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Added to cache</span>
                    <span className="font-mono">{new Date().toISOString().split('T')[0]}</span>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
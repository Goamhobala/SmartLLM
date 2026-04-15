"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOCK_USERS } from "@/lib/auth-store"

interface LoginModalProps {
  onLoginSuccess: (user: { name: string; email: string }) => void
}

export function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const [isEmail, setIsEmail] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSSO = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    onLoginSuccess(MOCK_USERS[0])
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    const user = MOCK_USERS.find((u) => u.email === email) ?? MOCK_USERS[0]
    onLoginSuccess(user)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden"
        style={{ background: "oklch(0.22 0.05 240)" }}
      >
        {/* Grid pattern */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="login-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-grid)" />
        </svg>

        {/* Glow blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, oklch(0.55 0.14 240), transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, oklch(0.45 0.12 200), transparent 70%)" }} />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg"
              style={{ background: "oklch(0.55 0.14 240)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">Smart LLM Gateway</span>
          </div>
        </div>

        {/* Center quote */}
        <div className="relative z-10 px-10 pb-4">
          <p className="text-4xl font-bold leading-tight text-white mb-4">
            Stop overpaying<br />
            <span style={{ color: "oklch(0.70 0.14 240)" }}>for AI.</span>
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.70 0.06 240)" }}>
            Slash LLM costs by 40–60% with intelligent routing.<br />
            Zero hallucination. One line of code.
          </p>
        </div>

        {/* Stat badges */}
        <div className="relative z-10 px-10 pb-12 flex gap-3">
          {[
            { value: "40–60%", label: "Cost reduction" },
            { value: "95ms", label: "Avg KB latency" },
            { value: "0", label: "Hallucinations" },
          ].map((s) => (
            <div key={s.label} className="flex-1 rounded-xl px-4 py-3 border"
              style={{ background: "oklch(0.28 0.06 240)", borderColor: "oklch(0.35 0.07 240)" }}>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "oklch(0.60 0.05 240)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-8">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-base font-semibold text-foreground">Smart LLM Gateway</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {isEmail ? "Sign in with email" : "Welcome back"}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isEmail
                ? "Enter your credentials to continue."
                : "Sign in to your dashboard."}
            </p>
          </div>

          {!isEmail ? (
            <div className="space-y-3">
              <Button
                onClick={handleGoogleSSO}
                disabled={isLoading}
                variant="outline"
                className="w-full h-11 gap-3 font-medium border-border/80"
              >
                {isLoading ? (
                  <span className="size-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                ) : (
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">or</span>
                </div>
              </div>

              <Button
                onClick={() => setIsEmail(true)}
                variant="outline"
                className="w-full h-11 font-medium border-border/80"
              >
                Continue with Email
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-2">
                Demo environment — all sign-ins are simulated.
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={!email || !password || isLoading}
                className="w-full h-11 font-medium mt-2"
              >
                {isLoading ? (
                  <span className="size-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>

              <button
                type="button"
                onClick={() => { setIsEmail(false); setEmail(""); setPassword("") }}
                disabled={isLoading}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center pt-1"
              >
                ← Other sign-in options
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

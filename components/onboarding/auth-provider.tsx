"use client"

import { createContext, useContext, useState } from "react"
import { AuthState, initialAuthState } from "@/lib/auth-store"

interface AuthContextType {
  auth: AuthState
  login: (user: { name: string; email: string }) => void
  completeOnboarding: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(initialAuthState)

  const login = (user: { name: string; email: string }) => {
    setAuth((prev) => ({ ...prev, isLoggedIn: true, user }))
  }

  const completeOnboarding = () => {
    setAuth((prev) => ({ ...prev, hasSeenOnboarding: true }))
  }

  const logout = () => {
    setAuth(initialAuthState)
  }

  return (
    <AuthContext.Provider value={{ auth, login, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

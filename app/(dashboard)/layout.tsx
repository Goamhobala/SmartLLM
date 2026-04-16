"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { LoginModal } from "@/components/onboarding/login-modal"
import { OnboardingCarousel } from "@/components/onboarding/onboarding-carousel"
import { useAuth } from "@/components/onboarding/auth-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { auth, login, completeOnboarding } = useAuth()

  // Show login if not logged in
  if (!auth.isLoggedIn) {
    return <LoginModal onLoginSuccess={login} />
  }

  // Show onboarding carousel if not completed
  if (!auth.hasSeenOnboarding) {
    return <OnboardingCarousel onComplete={completeOnboarding} />
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 pl-64">
        {children}
      </main>
    </div>
  )
}

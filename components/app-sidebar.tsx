"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, ImageIcon, MessageSquare, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat-demo", label: "Chat Demo", icon: MessageSquare },
  { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/image-demo", label: "Image Demo", icon: ImageIcon },
  { href: "/image-interceptor", label: "Image Knowledge Base", icon: ImageIcon },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sidebar-primary-foreground">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-sidebar-foreground">Smart LLM Gateway</span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
          Navigation
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>
    </aside>
  )
}

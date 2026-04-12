export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-foreground">Smart LLM Gateway</span>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
          <a href="#" className="transition-colors hover:text-foreground">Terms</a>
          <a href="#" className="transition-colors hover:text-foreground">Documentation</a>
          <a href="#" className="transition-colors hover:text-foreground">Contact</a>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; 2026 Smart LLM Gateway. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

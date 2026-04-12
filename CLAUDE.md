# CLAUDE.md

## Project

Smart LLM Gateway — a demo frontend for a B2B SaaS pitch (New Venture Planning course). This is NOT a production app. There is no real backend. All data is hardcoded or mocked. The goal is to look like a production-ready product during a live projector demo.

The app was scaffolded with v0 and may need manual adjustments.

## Stack

* Next.js (App Router)
* TypeScript
* Tailwind CSS (utility classes only, no custom Tailwind config unless necessary)
* shadcn/ui components
* No backend, no database, no API calls, no authentication

## Commands

* `npm run dev` — start dev server
* `npm run build` — production build (run this before the demo to catch errors)
* `npm run lint` — lint check

## Key Directories

* `app/` — Next.js app router pages
* `components/` — reusable React components
* `components/ui/` — shadcn/ui primitives (do not edit these directly)
* `lib/` — utilities, mock data, types
* `public/` — static assets (demo images go here)

## Pages

There are 4 pages. The Landing Page is standalone (no sidebar). The other 3 share a sidebar layout.

* `/` — Landing/marketing page (hero, how it works, pricing tiers)
* `/dashboard` — Real-time metrics dashboard with demo control panel
* `/knowledge-base` — Searchable table of verified intent–answer pairs
* `/image-demo` — Dummy AI image generator app (demonstrates image caching)

## Architecture & Data Flow

All dashboard data lives in React state. There is no backend.

The Dashboard page has a **Demo Control Panel** — a collapsible panel with buttons that simulate events. Each button press:

1. Adds a row to the request log (stored in state)
2. Updates cost tickers, KB hit rate, and latency chart
3. All number changes should animate smoothly (counting up, not jumping)

The Knowledge Base page is static — pre-populated with 12-15 hardcoded entries. No demo triggers needed.

The Image Demo page has hardcoded behaviour: first "Generate" click shows a spinner for 4-5 seconds then displays a pre-loaded image. Second click returns the image instantly. This simulates cache hit vs cache miss.

## Design

* Colour scheme: primary #1A5276, accent #2E86C1, success green for savings
* Use shadcn/ui components everywhere
* The Dashboard is the centrepiece — it must look polished
* The Image Demo page should feel like a separate product (slightly different visual treatment, maybe darker) to signal "this is the customer's app, not ours"
* Optimised for laptop screen projected onto a wall. Don't worry about mobile.

## Conventions

* Keep all mock/hardcoded data in `lib/` files, not scattered in components
* Use TypeScript interfaces for all data shapes (RequestLog, KnowledgeBaseEntry, etc.)
* Use `"use client"` only on components that need interactivity
* Smooth number animations on all counters and tickers — use a counting animation, never jump from 0 to a value
* New request log rows should animate in (fade/slide) at the top of the table

## Demo Control Buttons (Dashboard)

These are the trigger buttons in the demo control panel. Each one simulates a specific scenario:

1. **"KB Hit: Password Reset"** — Query: "How do I reset my password?" → KB match → Llama 3.2 3B → Verified → $0.00003 → 95ms
2. **"KB Hit: Forgot Login"** — Query: "I forgot my login info, help?" → KB match → Llama 3.2 3B → Verified → $0.00003 → 102ms
3. **"KB Hit: Cancel Account"** — Query: "How can I cancel my subscription?" → KB match → Llama 3.2 3B → Verified → $0.00003 → 88ms
4. **"LLM Route: Zapier"** — Query: "Do you integrate with Zapier?" → No match → GPT-4.1 Mini → Review → $0.0016 → 820ms
5. **"LLM Route: Bulk Discount"** — Query: "Can I get a bulk discount for my team?" → No match → GPT-4.1 Mini → Review → $0.0018 → 910ms
6. **"Image Cache Hit"** — Query: "Sunset over futuristic city" → Cache hit → $0.00 → 12ms. "Without Gateway" adds $0.04.
7. **"Bulk: 50 KB Hits"** — Batch-simulates 50 KB hits. Animates counters up smoothly.
8. **"Reset"** — Clears all dashboard data back to zero.

For each KB hit: "Without Gateway" cost += $0.0016 (GPT-4.1 Mini price). For each LLM route: both "Without Gateway" and "With Gateway" cost += the same amount (no saving on novel queries).

## Avoid

* No localStorage or sessionStorage (not supported in this environment)
* No API calls or fetch requests
* No `any` types
* No placeholder "lorem ipsum" text — all copy should read like a real SaaS product
* Don't over-engineer. This is a demo. If something works with hardcoded data, leave it hardcoded.

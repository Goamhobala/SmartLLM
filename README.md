# Smart LLM Gateway

An intelligent API middleware that sits between enterprise applications and LLM providers. Routes queries through a three-tier hierarchical system — verified knowledge base, RAG-enhanced reference search, and human escalation — to deliver accurate responses at a fraction of the cost.

> "LLMs hallucinate. Scripts feel robotic. We solved both."

## What This Is

This is a **demo frontend** for a New Venture Planning course final exam pitch. The backend is not fully functional — all dashboard data is hardcoded or mocked. The goal is to visually demonstrate how the product works during a live projector presentation.

The fictional client used in the demo is **PayFlow**, a South African digital wallet and payments app.

## How the Product Works

```
User query arrives
       │
       ▼
  Embed query (text-embedding-3-small, $0.02/M)
       │
       ▼
  Search Tier 1: Knowledge Base (pgvector, ~10ms)
      / \
     /   \
    ▼     ▼
 ≥0.85  <0.85
   │      │
   ▼      ▼
Tier 1   Search Tier 2: Crawled Index
KB hit         / \
   │          /   \
   ▼         ▼     ▼
Rewrite    Match   No match
Llama 8B     │        │
$0.02/M      ▼        ▼
   │      Tier 2    Tier 3
   │      RAG       Human
   │      Gemini    Agent
   │      $0.10/M
   │         │
   ▼         ▼
  Response delivered
             │
             ▼
  Customer reviews flagged responses
             │
             ▼
  Approved → promoted to Tier 1 KB

  ┌─────────────────────────────┐
  │  Nightly crawl (02:00)      │
  │  Crawl domains → Chunk →    │
  │  Embed → Update Tier 2      │
  └─────────────────────────────┘
```

### Three Tiers

| Tier | Source | Model | Cost/query | Latency | Hallucination |
|------|--------|-------|------------|---------|---------------|
| 1. Knowledge Base | Human-verified entries | Llama 3.1 8B (rewrite) | $0.000005 | ~100ms | Zero |
| 2. RAG (crawled index) | Whitelisted domains | Gemini 2.5 Flash-Lite | $0.0003 | ~500ms | Low (flagged) |
| 3. Human escalation | Support agent | N/A | N/A | N/A | N/A |

### The Flywheel

The knowledge base grows over time. Tier 2 responses that are reviewed and approved by the client get promoted to Tier 1. This means:

- Month 1: ~40% KB hit rate → ~50% savings
- Month 6: ~70% KB hit rate → ~75% savings
- Month 12: ~80% KB hit rate → ~82% savings

The system gets cheaper the longer it is used.

## Pages

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Marketing page with pricing tiers |
| Dashboard | `/dashboard` | Real-time cost, latency, request log, KB hit rate |
| Knowledge Base | `/knowledge-base` | Searchable table of verified intent–answer pairs |
| Image Demo | `/image-demo` | Dummy AI image generator (demonstrates image caching) |

The Landing Page is standalone (no sidebar). The other three pages share a sidebar layout.

### Dashboard Demo Controls

The dashboard has a collapsible control panel with buttons that simulate events during the live pitch. Each button adds data to the dashboard with smooth animations:

| Button | Simulates |
|--------|-----------|
| KB Hit: Password Reset | "How do I reset my password?" → KB match → verified |
| KB Hit: Forgot Login | "I forgot my login info, help?" → KB match → verified |
| KB Hit: Cancel Account | "How can I cancel my subscription?" → KB match → verified |
| LLM Route: Zapier | "Do you integrate with Zapier?" → No match → GPT-4.1 Mini |
| LLM Route: Bulk Discount | "Can I get a bulk discount?" → No match → GPT-4.1 Mini |
| Image Cache Hit | "Sunset over futuristic city" → Cached image → $0.00 |
| Bulk: 50 KB Hits | Batch-simulates 50 KB hits (runs up the savings counter) |
| Reset | Clears all data back to zero |

## Tech Stack

| Component | Tool |
|-----------|------|
| Frontend | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Hosting | Vercel (Hobby plan, free) |
| Database (production) | Supabase + pgvector |
| Embeddings (production) | OpenAI text-embedding-3-small |
| Tier 1 rewrite (production) | Llama 3.1 8B via Groq/Novita ($0.02/M) |
| Tier 2 RAG (production) | Gemini 2.5 Flash-Lite ($0.10/$0.40/M) |

For the demo, there is no backend. All data is hardcoded or stored in React state.

## Cost Breakdown

### Demo

| Service | Cost |
|---------|------|
| Vercel Hobby | $0 |
| Supabase Free | $0 |
| LLM APIs | $0 (mocked) |
| **Total** | **$0/month** |

### Production (one customer, 50K queries/day)

| Service | Monthly Cost |
|---------|-------------|
| Vercel Pro | $20 |
| Supabase Pro | $25–75 |
| Embeddings | ~$1 |
| Tier 1 SLM rewrites | ~$2.50 |
| Tier 2 RAG | ~$56–130 |
| **Total infra** | **~$105–235/month** |
| Customer saves | ~$2,165–2,295/month |
| We charge (20% of savings) | ~$430–460/month |
| **Gross margin** | **~50–75%** |

## Project Structure

```
├── app/
│   ├── page.tsx                  # Landing page
│   ├── dashboard/page.tsx        # Dashboard with demo controls
│   ├── knowledge-base/page.tsx   # KB viewer
│   └── image-demo/page.tsx       # Dummy image generator
├── components/
│   ├── ui/                       # shadcn/ui primitives (do not edit)
│   └── ...                       # App components
├── lib/
│   ├── mock-data.ts              # All hardcoded data lives here
│   ├── store.ts                  # Shared state (KB entries, request log)
│   └── types.ts                  # TypeScript interfaces
├── public/
│   └── ...                       # Demo images (product photos, etc.)
├── CLAUDE.md                     # Claude Code instructions
└── README.md
```

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Script

1. Open the **landing page** — show pricing tiers, explain the product
2. Show the **PayFlow FAQ document** (printed or on screen) — "the client uploads this"
3. Flip to the **Knowledge Base** page — "our system generates this"
4. Open the **Dashboard** — everything at zero
5. Click demo buttons one by one:
   - KB Hit: Password Reset → point out verified status, cost, latency
   - KB Hit: Forgot Login → "same KB entry, different wording, still verified"
   - LLM Route: Zapier → "this one wasn't in the KB — flagged for review, 50x more expensive"
   - Flip to KB page → new pending entry appeared
6. Click **Bulk: 50 KB Hits** → savings ticker races up
7. Open **Image Demo** → generate image (slow), generate again (instant)
8. Return to dashboard → show total savings

## Key Academic Sources

| Claim | Source |
|-------|--------|
| 68.8% cache hit rate achievable | Regmi & Pun, 2024 (arXiv:2411.05276) |
| 40–60% AI ticket deflection | Gartner 2024; Pylon 2025 |
| RAG significantly reduces hallucination | Ayala & Bechard, NAACL 2024; Nishisako et al., JMIR 2025 |
| 64–128 token chunks optimal for fact-based QA | arXiv:2505.21700 (2025) |
| 31% of LLM queries are semantically similar | Introl/GPTCache research, 2025 |

## Team

New Venture Planning — Final Exam Pitch, 2026.

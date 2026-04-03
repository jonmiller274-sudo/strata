# Strata — Interactive Strategy Document Builder

## Project Identity

- **What:** SaaS tool that turns structured strategic content into polished, interactive HTML documents — in 30 minutes instead of a full day
- **For whom:** VP Sales/Growth at Series B-C startups (primary wedge), expanding to CEOs and indie consultants
- **Stack:** Next.js 16+ (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Vercel
- **Repo:** https://github.com/jonmiller274-sudo/strata (private)
- **Deployed:** https://strata-lake-delta.vercel.app (note: `strata-docs.vercel.app` alias blocked by Vercel team SSO)
- **Status:** Phase 1 COMPLETE — rendering engine, AI structuring, creation flow, landing page, deployed
- **Vercel deploy:** `NODE_ENV=production vercel --prod` then `vercel alias <deploy-url> strata-docs.vercel.app` (GitHub auto-deploy not connected)

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build (must pass before every commit)
npm run lint     # Linting
```

---

## Orchestration System

**Read `~/.claude/personal-orchestration.md` at the start of every session.** It defines:
- 6 on-demand advisors (Product, Tech, Design, Growth, Research, Skeptic)
- Workflow protocols (brainstorm > plan > build > review > ship)
- Subagent dispatch rules (heavy lifting to subagents, code changes in main session)
- Multi-session coordination (orchestrator mode, commit reports, status boards)

---

## The Product

### The Problem
Executives need to communicate multi-dimensional strategies — personas, timelines, competitive landscapes, pricing tiers, supporting evidence. Two bad options exist:
1. **Compress into slides** — lose depth, interactivity, non-linear navigation
2. **Build custom HTML** — spend a full day in AI coding tools for a single document

No existing tool combines: non-linear navigation + progressive disclosure + animated timelines + data-rich layouts + AI content generation + shareable URL + no-code creation.

### The Output IS the Product
The document is the deliverable. It's consumed asynchronously by CEOs, board members, and investors who won't sit through 60 slides. It must be self-navigating and self-convincing without its author present.

### Quality Bar
Every Strata-generated document must pass the **executive embarrassment test**: would a Series B CEO present this to their board without heavy editing? If the answer is no, the product doesn't work.

---

## Target ICP

### Primary Wedge: VP Sales/Growth at Series B-C Startups
- **Why first:** Highest frequency use case (weekly proposal refreshes, QBRs). Creates "check your stats" daily habit via viewer analytics. Trojan horse into CEO/CFO — when VP Sales presents a stunning interactive QBR to the CEO, the CEO says "can I use this for our board deck?"
- **Price sensitivity:** Not price-sensitive at $79-99/month. Direct budget authority under $5K without procurement.
- **Viral loop:** Competitor's VP Sales sees the proposal, signs up. Closed loop — viewer IS the buyer archetype.

### Secondary: CEO at Series B-C Startups
- **Use cases:** Board decks quarterly, investor updates monthly, all-hands narratives
- **Reach via:** VP Sales trojan horse

### Tertiary: Independent Consultants
- **Why later:** Defensible niche (beneath Gamma's radar), but weaker viral loop
- **Reach via:** LinkedIn, ProductHunt, community seeding

### Positioning
NOT "better Gamma." Different tool for a different job:
- Gamma = "fast first draft"
- Strata = "the artifact that represents you when you're not in the room"

Differentiate on **workflow depth and output quality**, not speed.

---

## Competitive Landscape

| Competitor | Why They Won't Solve This |
|-----------|--------------------------|
| **Gamma** ($2.1B, 70M users) | Optimized for speed, not depth. Card-based layout can't do non-linear nav + progressive disclosure. Won't build for 0.1% of users. |
| **Notion** (Presentation Mode) | No shareable links, no animations, no custom viz. Block-based architecture = interactivity is a bolt-on. |
| **Tome** | Failed at $300M valuation. Sunsetted presentations. Proves general-purpose AI presentation tools can't monetize. |
| **Shorthand** ($60-$1750/mo) | Editorial/marketing focused, not data-rich strategy docs. No pricing tier viz or animated timelines. |

### The Moat
1. **Opinionated defaults** — strong choices about what good strategy communication looks like
2. **Workflow depth** — understands the PROCESS of building a board deck, not just the output
3. **Founder credibility** — Jon IS the persona, built from lived experience
4. **Niche community** — too small for Gamma to care, big enough for $1-5M ARR

---

## MVP Build Plan (16 weeks)

### Phase 1: Weeks 1-4 — Output-First (Ship the Magic)
Build a web app that takes structured input and outputs a shareable interactive HTML document. No editor, no drag-and-drop, no accounts. Just: paste content > choose section types > get a URL.

**Core section types (building blocks):**
1. Expandable card grids — personas, case studies, competitor profiles
2. Animated step-through timelines — journeys, roadmaps, 30/60/90 plans
3. Tier/comparison tables — pricing, feature matrices
4. Metric dashboard blocks — KPI cards with animated counters
5. Rich text with collapsible detail — exec summary that expands into evidence
6. Data visualization blocks — charts, graphs, market maps
7. Navigation sidebar — section jumping, non-linear browsing, progress indicators

**Critical design requirements:**
- Dark and light theme options
- Sidebar navigation with section jumping (non-linear)
- Progressive disclosure: summary by default, detail on expand
- "Made with Strata" attribution + "Create your own" CTA
- Shareable via URL (no login to view)
- Mobile-responsive
- Must pass the executive embarrassment test

### Phase 2: Weeks 5-10 — Analytics (The Retention Hook)
- Viewer analytics: who opened, which sections, time spent, device, forwards
- Creates "check your stats" daily habit
- Basic accounts (email signup to see analytics)
- This is the feature that makes a document feel like a product, not a file

### Phase 3: Weeks 11-16 — Creation Experience
- Structured form-based editor (NOT blank canvas, NOT drag-and-drop)
- Opinionated inputs: "How many personas? Paste your timeline milestones."
- AI generates finished document from structured inputs
- Template library: Board Deck, Investor Update, Sales Proposal, QBR, Product Roadmap
- Basic customization: colors, logo, fonts

### What to Cut Entirely in V1
- Real-time collaboration
- Version history
- Custom CSS/JavaScript
- API integrations
- PDF export
- Template marketplace
- White-labeling
- Free tier (14-day trial only, with watermark)

---

## Pricing

| Tier | Price | Includes |
|------|-------|----------|
| Solo | $79/month | 1 creator, up to 10 active documents, viewer analytics, basic brand |
| Team | $199/month (5 seats) | Unlimited documents, team collaboration, advanced analytics, full brand kit |

14-day free trial with full functionality. "Made with Strata" watermark on trial docs (removed on paid). The watermark IS the acquisition channel.

No free tier. No $29 tier. Higher price filters for real pain.

---

## The $1M ARR Math

At $79/month solo + $199/month team (60% team, 40% solo mix):
- ~900 paying accounts needed
- Timeline: 20-24 months from first line of code

| Milestone | Timeline | Monthly Revenue |
|-----------|----------|----------------|
| MVP live (output-only) | Month 3 | $0 |
| First 10 paying customers | Month 5-6 | $500-1,000 |
| Self-serve launch | Month 8-10 | $2,000-4,000 |
| 100 paying customers | Month 14-18 | $6,000-8,000 |
| $100K ARR | Month 18-22 | $8,300 |

---

## GTM Channels (PLG, no enterprise sales)

1. **"Made with Strata" attribution** on every shared document — primary viral loop
2. **VC portfolio newsletters** — warm intro to 3-5 investors who recommend to portfolio CEOs
3. **LinkedIn organic** — "startup growth" and "revenue leader" content verticals
4. **Slack communities** — Pavilion, Chief community, Lenny's community, On Deck
5. **ProductHunt** — 3 launches across Year 1
6. **YC forums / Bookface** — one genuine founder post = 50-100 signups in 48 hours

---

## Key Risks

1. **Highest-risk assumption:** Do executives actually navigate interactive documents non-linearly when consuming them cold? Must validate with real users immediately.
2. **Retention is existential.** Strategy docs are quarterly. VP Sales proposals are the highest-frequency wedge. Viewer analytics create the daily "check your stats" habit.
3. **Gamma overlap on startup exec ICP.** Must position as "different job" not "better deck."
4. **Support cliff at 200 users.** Budget for knowledge base and structured onboarding from day one.
5. **15-hour constraint.** Protect: building, shipping, customer conversations. Outsource everything else.

---

## Research Package

Full research documents are at: `/Users/JonMiller/Downloads/strata-research-package/`
- `claude-code-prompt.md` — main build prompt
- `interactive-strategy-documents-market-validation.pplx.md` — market research
- `strategic-debate-synthesis.pplx.md` — 3-lens debate (VC, Operator, Acquirer)
- `bootstrapper-debate-synthesis.pplx.md` — bootstrapper-scale reframe
- `lens-*.md` — individual perspective analyses
- `icp-reassess-*.md` — ICP shift evaluations
- `competitive-landscape.png` — market positioning chart

---

## Tech Stack Details

- **Framework:** Next.js 16.2.1 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (CSS variables via `@theme inline`)
- **Animations:** Framer Motion 12
- **AI:** Anthropic Claude (Sonnet for speed, Opus for quality) via Anthropic SDK
- **Hosting:** Vercel
- **Database:** Supabase (`xqmrfhfgrzwrypdwupvh` — `artifacts` table with JSON sections)
- **Auth:** Supabase Auth (Phase 2+)

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL     # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY    # Server-side Supabase key (never expose to client)
OPENAI_API_KEY               # GPT-4.1-mini for AI structuring
NEXT_PUBLIC_APP_URL           # Production URL (https://strata-docs.vercel.app)
```

### Key Architecture Notes
- Landing page is `"use client"` (Framer Motion animations)
- Demo artifact at `/demo` is hardcoded (no DB dependency)
- AI structuring at `/api/ai/structure` uses `json_object` response format
- Slug pages fetch from Supabase `artifacts` table with `is_published = true`
- Build script forces `NODE_ENV=production` (Jon's shell sets it to development)

Keep infrastructure boring. Ship in 4 weeks.

---

## Post-Build Review Process (Mandatory for Major Features)

After completing a major feature build (multi-commit, multi-file, or multi-session work), run both reviews in parallel before pushing or deploying:

### 1. Codex CLI Review (bugs, security, code quality)
Run via subagent from project root:
```bash
# Standard review against the base commit
codex review --base <last-known-good-commit>

# Adversarial security review (especially for auth, upload, API endpoints)
codex review --base <last-known-good-commit> "Focus on security vulnerabilities, auth bypasses, injection risks, race conditions, file upload vulnerabilities, and edge cases that could cause data loss or break in production"
```

### 2. Committee Review (product, design, UX, architecture)
Run via `superpowers:code-reviewer` subagent. The committee reviews all new code against the design doc from four lenses:
- **Product Advisor** — Does implementation match the plan? Will users find and use features?
- **Design Advisor** — Visual consistency, hover states, transitions, intuitive UX?
- **Tech Advisor** — Code quality, error handling, state management, edge cases?
- **Skeptic** — What's most likely to break? What will users complain about first?

### 3. Synthesize and Act
Combine findings from both reviews into a single report. Fix critical issues before pushing. Flag non-critical issues as follow-up tasks.

**Only push and deploy after both reviews pass.**

---

*Last updated: 2026-03-31*

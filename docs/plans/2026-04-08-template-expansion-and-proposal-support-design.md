# Template Expansion & Proposal Support — Design Doc

**Date:** 2026-04-08
**Source:** Dogfooding session — Jon built an Axon × Nexar partnership proposal using Strata
**Status:** DRAFT — awaiting Jon's approval before implementation

---

## The Problem

Strata's creation flow has 4 templates: Platform Vision, Customer Journey, GTM Strategy, Product Roadmap. These are all **internal strategy narrative** document types. When a VP Sales (our primary ICP) lands on the template picker, they don't see their use case and bounce.

The 8 existing section types (rich-text, expandable-cards, timeline, tier-table, metric-dashboard, data-viz, hub-mockup, guided-journey) are designed for **exploration** (progressive disclosure, drill-down). Proposals and sales decks need sections designed for **impact** (bold stats, comparisons, visual punch).

### Evidence: Dogfooding Results

Jon uploaded a real Axon × Nexar partnership proposal PDF and ran it through the "Platform Vision" template. The AI generated an 8-section artifact. Findings:

| Original PDF Element | Strata Rendered As | Problem |
|---|---|---|
| LPR Coverage comparison (4/4 vs 1/4 with checkmarks) | Hub-mockup ecosystem diagram | Wrong section type — lost the competitive comparison entirely |
| "40%+ / 0 / 2M+" hero stat blocks | Expandable cards with metrics buried inside | No visual impact — stats should dominate, not hide |
| Revenue Model (Invest → Generate → Compound) | Metric dashboard showing "$3000K", "4 coverage", "42 cheaper" | Formatting errors + wrong visual treatment |
| "THE ASK" ($3M billboard) | Buried in narrative paragraph | Completely lost — this is the single most important element |
| "Nexar → / ← Axon" bilateral layout | Two expandable cards side by side | Functional but no branding, no visual differentiation |
| "WHY NOW" urgency section | "Competitive Landscape" expandable cards | Wrong framing — read as market analysis, not urgency |
| Nexar branding (colors, logo) | None | Generic dark cards with no visual identity |

### Root Cause

Two compounding problems:
1. **Template framing** — "Platform Vision" coached the AI to think like an internal strategist, not a persuader. The template controls the AI's interpretation of content.
2. **Section type gaps** — Even with perfect AI interpretation, the building blocks can't represent comparison tables, hero stats, or CTA blocks.

---

## Jon's Key Insight

> "Strata needs to span from providing a narrative-style, interactive story for an investor audience, to a very concise and punchy partnership proposal. The VP of Sales is constantly context-switching from board decks to proposals. The architecture isn't flexible enough."

> "In a perfect world, I could upload this PDF. The back-end system understands the design elements and replicates it in Strata format. When people upload polished documents, they just want to put them into Strata format because it's more shareable and interactive."

---

## Plan

### Phase 1: Template Expansion + New Section Types (This Week)

#### 1A. Expand Template Library

Replace the current 4 narrow templates with a broader set that covers the full range of executive communication:

**Proposed templates:**

| Template | Description | Target User | Content Density |
|---|---|---|---|
| **Partnership Proposal** | Convince a partner to invest in a joint initiative | BD/Sales leaders | Punchy, persuasive |
| **Sales Proposal** | Pitch a product/service to a prospective customer | Sales reps, AEs | Punchy, persuasive |
| **Investor Deck** | Raise funding or update existing investors | Founders, CFOs | Narrative + data |
| **Board Deck** | Quarterly board update or strategic review | CEOs, C-suite | Narrative + data |
| **QBR / Business Review** | Quarterly performance review with key metrics | VP Sales, CS leaders | Data-heavy, scorecard |
| **Product Roadmap** | Communicate what's being built and why | Product leaders | Timeline-focused |
| **Go-to-Market Strategy** | Map acquisition, conversion, and expansion | Growth/Marketing | Narrative + data |
| **Team / Company Update** | All-hands, team update, or internal memo | Any leader | Narrative, light |

**What changes per template:**
- Display label + description on the picker
- AI structuring prompt guidance (which section types to prefer, content density rules, tone)
- Default section order suggestions
- Placeholder content examples

**Content density rules by template type:**
- **Persuasive templates** (proposals, sales): "Prefer short declarative statements. Use hero stats and comparison matrices. Minimize prose. Every section should have a clear takeaway in the first sentence."
- **Narrative templates** (investor, board, update): "Use progressive disclosure. Lead with executive summary, expand into evidence. Use callouts for key quotes."
- **Data templates** (QBR, roadmap): "Lead with metrics. Use dashboards and timelines. Narrative supports data, not the other way around."

**Implementation:** ~30 min per template. Add union member to `TemplateType`, label, description, and prompt block in `structure.ts`.

#### 1B. New Section Types (3 new blocks)

**1. Comparison Matrix** (`comparison-matrix`)
- Rows with feature/capability labels
- 2+ columns for parties being compared
- Cells: checkmark, dash, text, or numeric value
- Optional header row with party names/logos
- Optional "verdict" or "score" row (e.g., "4/4 vs 1/4")
- Use cases: competitive scorecard, feature comparison, vendor evaluation

**2. Hero Stats Row** (`hero-stats`)
- 2-4 large bold numbers displayed horizontally
- Each stat: big number + short label + optional sublabel
- No cards, no expand, no progressive disclosure — pure visual impact
- Optional color per stat
- Use cases: "40%+ face deactivation / 0 competitors / 2M+ drivers unserved"

**3. CTA / Ask Block** (`call-to-action`)
- Full-width, high-contrast, centered
- Primary line: one number or one sentence (large)
- Secondary line: supporting context (smaller)
- Optional bullet list of key terms
- Use cases: "THE ASK: $3M — 10,000 cameras — 2-3 pilot cities"

**Implementation per section type (~2-3 days each):**
- TypeScript types in `artifact.ts`
- Viewer component in `components/viewer/`
- Editor component in `components/editor/`
- Schema + examples in `lib/ai/prompts/structure.ts`

#### 1C. Template Picker Redesign

Current: flat 2×2 grid of 4 cards.
With 8 templates, this becomes overwhelming.

**Proposed:** Intent-based entry point:
- "What are you creating?" → grouped options
  - **Persuade** (proposals, sales pitches) → Partnership Proposal, Sales Proposal
  - **Report** (reviews, updates) → QBR, Board Deck, Team Update
  - **Plan** (strategy, roadmap) → GTM Strategy, Product Roadmap
  - **Raise** (funding, investors) → Investor Deck

Or simpler: just a clean list with good descriptions, sorted by popularity.

### Phase 2: "Convert to Interactive" Mode (Weeks 2-3)

A new creation path: upload a polished PDF → Strata preserves the design structure → outputs an interactive artifact that mirrors the original.

**How it works:**
1. User uploads PDF
2. System renders each page as an image
3. Claude Vision analyzes page screenshots + extracted text together
4. AI identifies design patterns (stat blocks, comparison tables, bilateral layouts, hero CTAs, branded sections)
5. AI maps patterns to Strata section types
6. Outputs artifact JSON that mirrors the original structure and density
7. User reviews and edits in the existing editor

**Key difference from current flow:**
- Current: AI **reinterprets** content through a template lens
- New: AI **preserves** the author's design intent and maps it to Strata's building blocks

**Skeptic's valid concern:** If the output is only 60% faithful, users have a direct comparison and the gap is MORE visible. Mitigation: build the new section types first (Phase 1) so the building blocks can actually represent what polished PDFs look like. Don't ship Phase 2 until Phase 1 blocks are proven.

### Phase 3: Branding Support (Week 3-4)

- Upload company logo
- Set brand colors (primary, secondary, accent)
- Colors applied to section accents, card borders, stat highlights
- Logo appears in sidebar header and/or watermark area
- Per-party branding in bilateral sections (Nexar blue, Axon yellow)

---

## Friction / Bugs Found During Dogfooding

| Finding | Type | Severity |
|---|---|---|
| No "Partnership Proposal" template (or any proposal template) | Feature gap | High |
| Publish redirects to auth, loses all artifact state | Bug | Critical |
| No "preview as viewer" mode — Step 3 shows artifact in cramped 70vh box | Friction | High |
| Metric dashboard: "$3000K" instead of "$3M" | Bug (AI data) | Medium |
| Metric dashboard: "4 coverage" nonsensical | Bug (AI data) | Medium |
| No branding/company colors anywhere | Feature gap | Medium |
| Preview scroll container hard to navigate | Friction | Low |
| Sidebar nav in preview doesn't scroll content reliably | Bug | Medium |

---

## Success Criteria

1. A VP Sales lands on the template picker and sees their use case in <5 seconds
2. A partnership proposal uploaded to Strata produces output that the author would send without heavy editing
3. The "executive embarrassment test" passes for proposals AND strategy docs
4. New section types (comparison matrix, hero stats, CTA) render with visual impact comparable to a polished PDF

---

## What's NOT in Scope

- Real-time collaboration
- Custom CSS/JavaScript
- Template marketplace
- PDF export (ironic — we're going PDF → interactive, not the reverse)
- White-labeling beyond basic brand colors/logo

---

*Committee reviewed: Product, Tech, Design, Growth, Skeptic — all aligned on phased approach.*

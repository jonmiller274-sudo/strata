# Landing Page — "You've Done This Before" Competitive Section

**Date:** 2026-04-06
**Status:** Approved by Jon
**Location:** New section on landing page (`src/app/page.tsx`), inserted after the hero and before the existing feature showcase

---

## The Concept

An emotionally-driven competitive comparison that starts from the user's pain (not a feature grid). Four beats with cinematic structure: setup, tension, turn, reveal.

**Target audience:** VP Sales/Growth at Series B-C startups who have tried Google Slides, Google Docs, Canva, Gamma, Notion, and/or ChatGPT to create strategy documents — and felt the gap every time.

**Goal:** Answer "why can't I just use [tool I already have]?" with emotional recognition, not a feature checklist.

---

## Beat 1: "You've Done This Before" — Pain Cards

### Headline
"You've done this before."

- Appears alone on screen, centered, full viewport
- Fade-in on scroll
- Sets the tone: empathetic, knowing, not salesy

### Pain Cards (6 cards, staggered reveal)

Cards appear one at a time on scroll with 200ms stagger. Each card is a dark container with subtle left border (muted color — not brand accent). Icon is a generic Lucide icon suggesting the tool, NOT the actual logo.

**Card 1 — Google Slides (most universal)**
> You built a 47-slide Google Slides deck for the board. Three people skimmed it. Nobody made it past slide 20.

**Card 2 — Google Docs**
> You wrote a 12-page strategy doc in Google Docs. Your CEO said "can you just give me the summary?"

**Card 3 — Canva (the "make it pretty" escalation)**
> You made it beautiful in Canva. But it's still slides. Still one direction. Still linear.

**Card 4 — Gamma (the "try AI" escalation)**
> You tried Gamma and thought "close — but this still feels like a presentation, not a document."

**Card 5 — Notion (the "try web publishing" escalation)**
> You published a Notion page. Your investor said "this looks like an internal wiki."

**Card 6 — ChatGPT (the "build it yourself" nuclear option)**
> You asked ChatGPT to build something interactive. You spent 3 hours fixing CSS. Then it broke on mobile.

### Design Details
- Cards are left-aligned, max-width ~700px, centered on page
- Typography: slightly italic or quote-like — inner monologue, not marketing copy
- Icons: Lucide icons only (Presentation for Slides, FileText for Docs, Palette for Canva, Sparkles for Gamma, BookOpen for Notion, MessageSquare for ChatGPT)
- Left border color: muted gray or dim version of each tool's brand color (subtle, not loud)
- Framer Motion: `fadeInUp` with stagger, triggered by scroll intersection
- Ordering is intentional — escalation of effort from "easy default" to "DIY desperation"

---

## Beat 2: "The Problem Was Never the Tool" — The Reframe

### Copy
"The problem was never the tool. It was the format."

### Design Details
- Full viewport height section, vertically and horizontally centered
- Fade-in on scroll, slightly slower animation than pain cards (600ms vs 400ms)
- Larger font size than pain cards — this is the section's thesis statement
- Thin/light font weight — elegant, not shouting
- No container, no card, no border — just text on background
- Generous whitespace above and below — let it breathe

### Why This Works
Reframes the problem. Every pain card blamed a tool. This line says the formats themselves (slides, PDFs, wiki pages) are the constraint. This is the category-creation moment — not selling a better tool, selling a new format.

---

## Beat 3: The Reveal — Live Embedded Artifact

### Copy
"Strata is a new format for strategy."
"Interactive. Self-navigating. Built to be explored without you in the room."

### The Embedded Artifact
An actual working Strata document rendered inline on the landing page — NOT a screenshot, NOT a video. A real interactive artifact with:
- Working sidebar navigation (click to jump between sections)
- Expandable persona cards (click to reveal detail)
- Animated timeline (scroll/click through phases)
- Metric dashboard with animated counters
- Dark theme matching the landing page

### Implementation Options
1. **Inline component** (preferred): Render the demo artifact's sections directly as React components within the landing page. Same components the viewer uses, fed demo data. No iframe.
2. **Contained iframe**: Embed `/demo` in a sized iframe. Simpler but less performant and harder to style consistently.

### Design Details
- Container: subtle glowing accent border — the ONLY element in this section with color accent. Everything before was muted. This is the color moment.
- Size: ~100% width, ~600px height on desktop. Shows enough to see sidebar + content area with cards, timeline, and metrics all visible at once.
- Caption below: "This is a real Strata document. Click around." — small text, understated, confident.
- Must load fast. Preload or use a content-shaped skeleton. A loading spinner here kills the moment.
- On mobile: full-width, taller aspect ratio (~80vh). Sidebar collapses to top nav or is hidden with a "Navigate" button.

---

## Beat 4: The Contrast — Slides vs. Strata

### Layout
Two columns side by side. Left is "Slides & PDFs" (muted, faded). Right is "Strata" (accent-colored, sharp).

### Copy Pairs (one per line, horizontally aligned)

| Slides & PDFs | Strata |
|---------------|--------|
| Linear | Non-linear |
| One direction | Explore any section |
| Static | Interactive |
| Presenter required | Self-navigating |
| Emailed as a file | Shared as a link |
| Hope they read it | Know they read it |

### Design Details
- Left column: `text-white/40` or similar muted treatment
- Right column: accent color text, full opacity, slightly bolder weight
- Each pair animates in together on scroll (left fades in from left, right fades in from right)
- Maximum 6 pairs — do not add more. Tight is better.
- "Know they read it" is the last pair — teases viewer analytics without over-promising (analytics is Phase 2)

### CTA
"Start creating — your first document is free"

- Primary accent-colored button — the FIRST accent button in this entire section
- Everything before was text-only. The button is the visual payoff.
- Links to `/create`

---

## Full Flow (Visual Summary)

```
[Scroll down from hero]

       "You've done this before."
              (pause)

   [Card] Google Slides — 47 slides, nobody read it
   [Card] Google Docs — CEO wanted the summary
   [Card] Canva — beautiful but still linear
   [Card] Gamma — close but still slides
   [Card] Notion — looks like a wiki
   [Card] ChatGPT — 3 hours fixing CSS

              (pause)

  "The problem was never the tool.
        It was the format."

              (pause)

  "Strata is a new format for strategy."

   ┌─────────────────────────────────┐
   │  LIVE INTERACTIVE ARTIFACT      │
   │  (click around — it's real)     │
   └─────────────────────────────────┘

     Slides & PDFs    vs.    Strata
     Linear                  Non-linear
     Static                  Interactive
     Presenter required      Self-navigating
     Hope they read it       Know they read it

        [ Start creating — free ]
```

---

## Emotional Arc

| Beat | Visitor Feels | Design Signal |
|------|--------------|---------------|
| "You've done this before." | Recognition — "they get me" | Empathetic, no selling |
| 6 pain cards | Escalating frustration — "I've tried all of these" | Staggered reveal builds tension |
| "It was the format." | Reframe — "oh... that's the insight" | Full viewport, slow fade, weight |
| Live artifact | Wonder — "wait, what IS this?" | Only color accent, interactive |
| Contrast pairs | Clarity — "I see exactly why" | Side-by-side, scannable |
| CTA | Action — "let me try" | First accent button, earned |

---

## Technical Notes

- This entire section is `"use client"` (Framer Motion animations)
- Pain cards use `motion.div` with `whileInView` + stagger
- Reframe line uses `motion.p` with slower `fadeIn`
- Embedded artifact: reuse existing viewer components from `src/components/viewer/`
- Contrast section: CSS grid, 2 columns, responsive (stacks on mobile)
- All animations should respect `prefers-reduced-motion`
- No new dependencies needed — Framer Motion + Lucide already in the project

---

## What This Replaces

The existing landing page has a "Section Types" showcase and a "How It Works" stepper. This new section goes ABOVE those — it's the emotional hook that makes the visitor care enough to look at features. The existing sections become supporting evidence, not the lead.

**Insertion point:** After the hero section, before the current section types grid.

---

## Decisions (Resolved 2026-04-06)

1. **Mini-artifact with 5 sections.** Purpose-built `landing-demo` with QBR/sales proposal content. Sections: Executive Summary (rich text expand/collapse), Persona Cards (clickable grid), Timeline (animated), Metrics Dashboard (animated counters), Tier Table (comparison).
2. **Name all tools explicitly.** Google Slides, Google Docs, Canva, Gamma, Notion, ChatGPT — all by name. No hedging.
3. **Keep "Know they read it."** Sell the vision. Analytics is Phase 2 and it's coming.

---

*Approved by Jon on 2026-04-06. All open questions resolved. Ready for implementation.*

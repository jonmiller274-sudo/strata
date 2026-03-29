# Investor Deck Recreation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Faithfully recreate the Nexar PLG Investor Deck as a Strata document with no compromise on content or visual quality.

**Architecture:** Extend Strata's artifact model with beats layout, progress bar nav, and custom palette. Enhance 4 existing section types and add 1 new section type (Guided Journey). Then create the investor deck content as a hardcoded route at `/investor-deck`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion 12, Lucide icons

**Source reference:** `/Users/JonMiller/nexar-plg-investor/public/index.html` (67KB static HTML)

**Design doc:** `docs/plans/2026-03-29-investor-deck-recreation-design.md`

---

## Parallelization Map

```
Task 1 (Foundation: types)
    ├── Task 2 (Beats layout)     ─┐
    ├── Task 3 (Progress bar nav)  │
    ├── Task 4 (Custom palette)    │── All parallel after Task 1
    ├── Task 5 (Timeline enhance)  │
    ├── Task 6 (Guided Journey)    │  ← LARGEST
    ├── Task 7 (Comparison mode)   │
    ├── Task 8 (Staircase chart)   │
    ├── Task 9 (Layers chart)      │
    └── Task 10 (Rich Text tag)   ─┘
            │
    Task 11 (Investor deck content + route) ← depends on ALL above
            │
    Task 12 (Integration + polish)
```

---

## Task 1: Foundation — Update TypeScript Types

**Files:**
- Modify: `src/types/artifact.ts`

This is the contract everything else builds against. Must be done first.

**Step 1: Update Artifact and ArtifactBranding interfaces**

In `src/types/artifact.ts`, update:

```typescript
export interface Artifact {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author_name?: string;
  theme: "dark" | "light";
  layout_mode?: "continuous" | "beats";      // NEW
  nav_style?: "sidebar" | "progress-bar";    // NEW
  branding?: ArtifactBranding;
  sections: Section[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArtifactBranding {
  primary_color?: string;
  logo_url?: string;
  palette?: {                               // NEW
    accent1?: string;
    accent2?: string;
    accent3?: string;
    accent4?: string;
    accent5?: string;
  };
}
```

**Step 2: Add `guided-journey` to SectionType union and Section union**

```typescript
export type SectionType =
  | "rich-text"
  | "expandable-cards"
  | "timeline"
  | "tier-table"
  | "metric-dashboard"
  | "data-viz"
  | "hub-mockup"
  | "guided-journey";          // NEW

export type Section =
  | RichTextSection
  | ExpandableCardGridSection
  | TimelineSection
  | TierTableSection
  | MetricDashboardSection
  | DataVizSection
  | HubMockupSection
  | GuidedJourneySection;      // NEW
```

**Step 3: Add GuidedJourneySection interface**

```typescript
// ===== 8. Guided Journey (Interactive Timeline + Counters) =====
export interface GuidedJourneySection extends SectionBase {
  type: "guided-journey";
  content: {
    phases: JourneyPhase[];
    counters: JourneyCounter[];
    events: JourneyEvent[];
    autoplay?: boolean;
    interval_ms?: number; // default 3000
  };
}

export interface JourneyPhase {
  id: string;
  name: string;
  color: string; // hex
  day_range: string; // "Days 0–14"
}

export interface JourneyCounter {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string; // Lucide icon name
  prefix?: string; // "$"
  suffix?: string;
  start_value: number;
  color?: string; // hex
}

export interface JourneyEvent {
  id: string;
  day: number;
  label: string;
  title: string;
  description: string;
  phase_id: string;
  personas?: string[];
  product?: string;
  trigger?: {
    label: string;
    text: string;
  };
  spend_delta?: string; // "+$120"
  counter_values: Record<string, number>; // counter_id → value
}
```

**Step 4: Enhance TimelineSection with evidence and pivot**

```typescript
export interface TimelineSection extends SectionBase {
  type: "timeline";
  content: {
    orientation?: "vertical" | "horizontal";
    steps: TimelineStep[];
    evidence?: {                    // NEW
      text: string;
      border_color?: string;       // hex, defaults to coral/danger
    };
    pivot?: string;                 // NEW — bold closing question
  };
}
```

**Step 5: Enhance TierTableSection with mode and kicker**

```typescript
export interface TierTableSection extends SectionBase {
  type: "tier-table";
  content: {
    mode?: "pricing" | "comparison";    // NEW — defaults to "pricing"
    highlight_column?: number;
    columns: TierColumn[];
    kicker?: string;                     // NEW — closing statement
  };
}
```

**Step 6: Add staircase and layers to DataVizSection**

```typescript
export interface DataVizSection extends SectionBase {
  type: "data-viz";
  content: {
    chart_type: "bar" | "line" | "pie" | "funnel" | "custom-svg" | "staircase" | "layers"; // UPDATED
    data: Array<Record<string, string | number>>;
    x_key?: string;
    y_key?: string;
    description?: string;
    callout?: string;               // NEW — for layers chart
  };
}
```

**Step 7: Add tag to RichTextSection**

```typescript
export interface RichTextSection extends SectionBase {
  type: "rich-text";
  content: {
    summary: string;
    detail?: string;
    callout?: {
      type: "insight" | "warning" | "quote";
      text: string;
    };
    tag?: {                          // NEW
      label: string;
      color?: string;                // hex
    };
  };
}
```

**Step 8: Verify build**

```bash
cd /Users/JonMiller/strata && NODE_ENV=production npm run build
```

Expected: Clean build (types are not consumed by new code yet).

**Step 9: Commit**

```bash
git add src/types/artifact.ts
git commit -m "feat: extend artifact types for beats layout, guided journey, and section enhancements"
```

---

## Task 2: Beats Layout Mode

**Files:**
- Modify: `src/components/viewer/ArtifactViewer.tsx`
- Modify: `src/components/viewer/SectionRenderer.tsx`
- Modify: `src/app/globals.css`

**What to build:**
- When `artifact.layout_mode === "beats"`, ArtifactViewer renders sections as full-viewport beats with scroll-snap
- Each beat: `min-height: 100vh`, `scroll-snap-align: start`, flex column centered, padded
- Beat label above content: "Beat 01 / 05" in monospace
- Scroll hint arrow at bottom of each beat (animated bounce)
- Noise texture overlay (CSS pseudo-element)
- Keyboard nav: ArrowDown/Right/Space = next beat, ArrowUp/Left = previous
- No sidebar margin in beats mode (`lg:ml-0` instead of `lg:ml-[var(--sidebar-width)]`)
- Header hidden (title shown in progress bar or first beat)

**Key implementation detail:** ArtifactViewer checks `artifact.layout_mode` and conditionally renders either the current continuous layout or the new beats layout. Do NOT break the existing continuous mode.

**CSS additions to globals.css:**
```css
/* Beats mode */
.beats-container {
  scroll-snap-type: y mandatory;
  overflow-y: auto;
  height: 100vh;
}

.beat-section {
  min-height: 100vh;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 80px 60px;
  position: relative;
}

@media (max-width: 768px) {
  .beat-section {
    padding: 60px 24px 40px;
  }
}

/* Noise texture overlay */
.beat-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}

.beat-section > * {
  position: relative;
  z-index: 1;
}

/* Scroll hint bounce */
@keyframes bounce-hint {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(8px); }
}

.scroll-hint {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--color-muted-foreground);
  font-size: 20px;
  animation: bounce-hint 2.2s ease-in-out infinite;
  cursor: pointer;
}
```

**Verify:** `NODE_ENV=production npm run build` passes.

**Commit:** `feat: add beats layout mode with scroll-snap, beat labels, and keyboard nav`

---

## Task 3: Progress Bar Navigation

**Files:**
- Create: `src/components/viewer/ProgressBarNav.tsx`
- Modify: `src/components/viewer/ArtifactViewer.tsx` (conditional nav rendering)

**What to build:**
- Fixed top bar, full width, z-50
- One segment per section with 3px gap between segments
- States: inactive (`bg-border`), active (gradient `accent1→accent2` or default gradient), visited (accent1 at 55% opacity)
- Clickable: scrolls to section on click
- Wordmark in top-left: artifact title + subtitle separated by divider
- Uses IntersectionObserver (same pattern as SidebarNav) to track active section
- Tracks visited sections in a Set

**ArtifactViewer changes:**
```typescript
// Conditional navigation
{artifact.nav_style === "progress-bar" ? (
  <ProgressBarNav items={sidebarItems} title={artifact.title} subtitle={artifact.subtitle} />
) : (
  <SidebarNav items={sidebarItems} title={artifact.title} subtitle={artifact.subtitle} />
)}
```

**Verify:** `NODE_ENV=production npm run build` passes.

**Commit:** `feat: add progress bar navigation with segment tracking and wordmark`

---

## Task 4: Custom Palette CSS Injection

**Files:**
- Modify: `src/components/viewer/ArtifactViewer.tsx`

**What to build:**
- If `artifact.branding?.palette` exists, inject CSS custom properties on the wrapper div
- Properties: `--palette-accent1` through `--palette-accent5`
- Section components can reference these with `style={{ color: 'var(--palette-accent1)' }}` or inline styles
- Fallback to default theme colors when palette is not set

**Implementation in ArtifactViewer:**
```typescript
const paletteStyle = artifact.branding?.palette ? {
  '--palette-accent1': artifact.branding.palette.accent1 ?? 'var(--color-accent)',
  '--palette-accent2': artifact.branding.palette.accent2 ?? 'var(--color-accent)',
  '--palette-accent3': artifact.branding.palette.accent3 ?? 'var(--color-warning)',
  '--palette-accent4': artifact.branding.palette.accent4 ?? 'var(--color-danger)',
  '--palette-accent5': artifact.branding.palette.accent5 ?? 'var(--color-success)',
} as React.CSSProperties : {};

return (
  <div className="min-h-screen bg-background text-foreground" style={paletteStyle}>
    ...
  </div>
);
```

**Verify:** `NODE_ENV=production npm run build` passes.

**Commit:** `feat: inject custom palette CSS variables from artifact branding`

---

## Task 5: Timeline Section Enhancement

**Files:**
- Modify: `src/components/viewer/sections/AnimatedTimeline.tsx`

**What to build:**
- After the timeline steps, render optional `evidence` block: a bordered quote with italic text
- After evidence, render optional `pivot`: a large bold statement in accent color
- Evidence uses `border_color` (default coral) for left border
- Pivot text uses display font styling, larger size

**Add after the steps map in AnimatedTimeline:**
```typescript
{/* Evidence quote */}
{section.content.evidence && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="mt-8 border-l-4 pl-5 py-3"
    style={{ borderColor: section.content.evidence.border_color ?? 'var(--palette-accent4, var(--color-danger))' }}
  >
    <p className="text-sm italic text-muted leading-relaxed">
      {section.content.evidence.text}
    </p>
  </motion.div>
)}

{/* Pivot question */}
{section.content.pivot && (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    viewport={{ once: true }}
    className="mt-10"
  >
    <p className="text-2xl md:text-3xl font-bold leading-snug"
       style={{ color: 'var(--palette-accent1, var(--color-accent))' }}>
      {section.content.pivot}
    </p>
  </motion.div>
)}
```

**Verify:** `NODE_ENV=production npm run build` passes.

**Commit:** `feat: add evidence quote and pivot statement to timeline section`

---

## Task 6: Guided Journey Section (LARGEST)

**Files:**
- Create: `src/components/viewer/sections/GuidedJourney.tsx`
- Modify: `src/components/viewer/SectionRenderer.tsx` (add to component map)

**This is the most complex component. Key features:**

### Counter Row (top)
- Grid of counter cards (2-col mobile, 4-col desktop)
- Each counter: icon, animated number, sublabel
- Numbers animate with easing when event changes (NOT on scroll — on event selection)
- Pop scale effect on update (`scale(1.05)` → `scale(1)` over 300ms)
- Colored top border on each counter card matching counter color

### Phase Badges (between counters and timeline)
- Horizontal row of phase badges
- Each badge: phase name + day range
- Colored with phase color

### Timeline Track (middle)
- Horizontal row of clickable nodes
- Each node: day number + short label below
- Active node has glowing ring in phase color
- Visited nodes are dimmed
- Connected by a line that fills with phase color as you progress

### Detail Panel (bottom)
- Day badge (colored by phase)
- Title (large)
- Personas as small badges
- Product badge
- Description paragraph
- Trigger box (left-bordered, monospace label, body text)
- Spend delta (if present)

### Controls
- Play button (auto-advance every `interval_ms`, default 3000)
- Pause button
- Reset button (return to event 0)
- Controls row above the timeline

### State management
```typescript
const [activeIndex, setActiveIndex] = useState(0);
const [isPlaying, setIsPlaying] = useState(content.autoplay ?? true);
const [visited, setVisited] = useState<Set<number>>(new Set([0]));

// Auto-advance effect
useEffect(() => {
  if (!isPlaying) return;
  const timer = setInterval(() => {
    setActiveIndex(prev => {
      const next = prev < events.length - 1 ? prev + 1 : prev;
      if (next === events.length - 1) setIsPlaying(false);
      setVisited(v => new Set([...v, next]));
      return next;
    });
  }, content.interval_ms ?? 3000);
  return () => clearInterval(timer);
}, [isPlaying, events.length, content.interval_ms]);
```

### Animated counter logic
- Store previous counter values in a ref
- When activeIndex changes, animate from previous to new values
- Use `requestAnimationFrame` with easing (same pattern as MetricDashboard's AnimatedCounter but driven by state change, not scroll)

### SectionRenderer update
Add to `SECTION_COMPONENTS` map:
```typescript
import { GuidedJourney } from "./sections/GuidedJourney";

"guided-journey": GuidedJourney as React.ComponentType<{ section: never }>,
```

**Verify:** `NODE_ENV=production npm run build` passes.

**Commit:** `feat: add guided journey section with interactive timeline, animated counters, and autoplay`

---

## Task 7: Tier Table Comparison Mode

**Files:**
- Modify: `src/components/viewer/sections/TierTable.tsx`

**What to build:**
- When `section.content.mode === "comparison"`, render a different layout:
- Two columns side by side (full width on mobile)
- Each column has a header (name + description) and a list of features
- Features show ✓ (green) or ✗ (coral/red) based on `included` boolean
- Features with `included: true` get green icon + bolder text
- Features with `included: false` get coral icon + muted text
- Optional `kicker` at bottom: centered box with gradient background and bold text

**Implementation approach:**
```typescript
export function TierTable({ section }: { section: TierTableSection }) {
  const isComparison = section.content.mode === "comparison";

  if (isComparison) {
    return <ComparisonView section={section} />;
  }

  // ...existing pricing view
}
```

Create a `ComparisonView` function component within the same file.

**Verify:** `NODE_ENV=production npm run build` passes.

**Commit:** `feat: add comparison mode to tier table with kicker support`

---

## Task 8: Data Viz — Staircase Chart

**Files:**
- Modify: `src/components/viewer/sections/DataVisualization.tsx`

**What to build:**
- New `StaircaseChart` component within DataVisualization.tsx
- Each step is an ascending block (wider and taller than the previous)
- Block shows: label (left), amount (right), description (below)
- Each block colored with its own `color` field from data
- Animated: blocks appear sequentially with stagger

**Data shape expected:**
```typescript
// data items when chart_type === "staircase":
{ label: "Self-Serve Month 1", amount: "$500–2.5K", description: "BADAS + Atlas credits", color: "#2fd8c8" }
```

**Step heights:** Each block is 20% taller than the previous (base ~60px, growing to ~120px for 4 items).

**Verify:** `NODE_ENV=production npm run build` passes.

**Commit:** `feat: add staircase chart type to data visualization`

---

## Task 9: Data Viz — Layers Chart

**Files:**
- Modify: `src/components/viewer/sections/DataVisualization.tsx`

**What to build:**
- New `LayersChart` component within DataVisualization.tsx
- Stacked horizontal bars, each wider than the previous (value compounding)
- Each layer: label on left, price on right, colored bar
- Bars grow wider from top to bottom (first = narrowest, last = widest)
- Animated: bars expand sequentially
- Optional `callout` text below in an amber-tinted box

**Data shape expected:**
```typescript
// data items when chart_type === "layers":
{ label: "Raw Clip (Archive)", price: "$5–8", color: "#4d5870" }
{ label: "+ BADAS Scoring", price: "$10–15", color: "#f06460" }
```

**Verify:** `NODE_ENV=production npm run build` passes.

**Commit:** `feat: add layers chart type to data visualization`

---

## Task 10: Rich Text Tag Enhancement

**Files:**
- Modify: `src/components/viewer/sections/RichTextCollapsible.tsx`

**What to build:**
- If `content.tag` exists, render a small badge above the section title
- Badge: small rounded pill with colored background (10% opacity) and colored text
- Uses `tag.color` or falls back to accent1

**Add before the h2 in RichTextCollapsible:**
```typescript
{content.tag && (
  <span
    className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
    style={{
      color: content.tag.color ?? 'var(--palette-accent1, var(--color-accent))',
      backgroundColor: `${content.tag.color ?? 'var(--palette-accent1, var(--color-accent))'}15`,
    }}
  >
    {content.tag.label}
  </span>
)}
```

**Verify:** `NODE_ENV=production npm run build` passes.

**Commit:** `feat: add tag badge to rich text section`

---

## Task 11: Investor Deck Content + Route

**Files:**
- Create: `src/app/investor-deck/page.tsx`
- Create: `src/lib/content/investor-deck.ts`

**What to build:**
- Hardcoded artifact data (not from Supabase) with all 5 beats
- Route at `/investor-deck` that renders `ArtifactViewer` with this data
- All content extracted from source HTML (`/Users/JonMiller/nexar-plg-investor/public/index.html`)

**investor-deck.ts:** Export a complete `Artifact` object with:
- `layout_mode: "beats"`
- `nav_style: "progress-bar"`
- `branding.palette`: `{ accent1: "#2fd8c8", accent2: "#7c6df0", accent3: "#f0b429", accent4: "#f06460", accent5: "#36d399" }`
- 8 sections mapping to the 5 beats (Beat 4 has 3 sections: metrics + staircase + layers)

**Section mapping:**
1. Timeline (The Problem) — 6 steps + evidence + pivot
2. Guided Journey (The Journey) — 4 counters, 8 events, 2 phases
3. Tier Table comparison (The Punchline) — 2 columns + kicker
4. Metric Dashboard (The Economics — metrics) — 3 cards
5. Data Viz staircase (The Economics — revenue) — 4 steps
6. Data Viz layers (The Economics — margins) — 4 layers + callout
7. Rich Text with tag (The Evidence — proof case) — May Mobility story
8. Expandable Card Grid (The Evidence — signals) — 6 customer cards

**page.tsx:**
```typescript
import { ArtifactViewer } from "@/components/viewer/ArtifactViewer";
import { investorDeckArtifact } from "@/lib/content/investor-deck";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nexar PLG Go-to-Market — Strata",
  description: "The 30-day customer journey that replaces 12 months of enterprise sales.",
};

export default function InvestorDeckPage() {
  return <ArtifactViewer artifact={investorDeckArtifact} />;
}
```

**Verify:** `NODE_ENV=production npm run build` passes. Dev server at `/investor-deck` renders all 5 beats.

**Commit:** `feat: add investor deck content and hardcoded route`

---

## Task 12: Integration, Polish, and Verification

**Files:** Various — based on issues found

**Steps:**
1. Run dev server: `npm run dev`
2. Navigate to `http://localhost:3000/investor-deck`
3. Verify each beat renders correctly:
   - Beat 1: Timeline with 6 steps, evidence quote in coral border, pivot in teal
   - Beat 2: 4 counters animate, 8 timeline nodes clickable, detail panel updates, autoplay works
   - Beat 3: Two-column comparison with ✓/✗ icons, kicker box at bottom
   - Beat 4: 3 metric cards, revenue staircase, enrichment layers with callout
   - Beat 5: Proof case with tag badge, 6 customer cards, closing quote
4. Verify progress bar: segments highlight on scroll, clickable
5. Verify keyboard nav: arrow keys move between beats
6. Verify mobile responsiveness: test at 375px width
7. Fix any visual issues, animation timing, spacing
8. Run production build: `NODE_ENV=production npm run build`
9. Commit polish fixes

**Commit:** `fix: polish investor deck visual details and responsive layout`

---

## Key References

| File | What's there |
|------|-------------|
| `src/types/artifact.ts` | All type definitions |
| `src/components/viewer/ArtifactViewer.tsx` | Root viewer — modify for beats/nav/palette |
| `src/components/viewer/SectionRenderer.tsx` | Section routing — add guided-journey |
| `src/components/viewer/SidebarNav.tsx` | Existing nav — reference for IntersectionObserver pattern |
| `src/components/viewer/sections/AnimatedTimeline.tsx` | Timeline — enhance |
| `src/components/viewer/sections/TierTable.tsx` | Tier table — add comparison mode |
| `src/components/viewer/sections/DataVisualization.tsx` | Data viz — add staircase + layers |
| `src/components/viewer/sections/RichTextCollapsible.tsx` | Rich text — add tag |
| `src/components/viewer/sections/MetricDashboard.tsx` | Metric cards — reference for counter animation |
| `src/app/globals.css` | Theme variables + animations |
| `/Users/JonMiller/nexar-plg-investor/public/index.html` | Source content to extract |

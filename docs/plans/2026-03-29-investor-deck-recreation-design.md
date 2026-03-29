---
title: Investor Deck Faithful Recreation in Strata
date: 2026-03-29
status: approved
---

# Investor Deck Recreation — Design Spec

## Goal

Faithfully recreate the Nexar PLG Investor Deck (currently a custom 67KB static HTML page) as a Strata document. No compromise on content fidelity or visual impact. This drives feature development that makes Strata capable of rendering premium, cinematic strategy presentations.

## Source

- Local: `/Users/JonMiller/nexar-plg-investor/public/index.html`
- Deployed: `https://nexar-plg-investor-*.vercel.app/` (401 — auth required)
- 5 full-viewport "beats" with scroll-snap, progress bar nav, custom color palette, interactive timeline with animated counters

## Document-Level Changes

### 1. Layout Mode
Add `layout_mode` to artifact model: `"continuous"` (default, current) vs `"beats"` (full-viewport scroll-snap sections).

In beats mode:
- Each section renders as a full-viewport beat with `min-height: 100vh` and `scroll-snap-align: start`
- Beat label shows section index ("Beat 01 / 05")
- Scroll hint arrow at bottom of each beat
- Subtle noise texture overlay

### 2. Navigation Style
Add `nav_style` to artifact model: `"sidebar"` (default, current) vs `"progress-bar"` (top segmented bar).

Progress bar:
- Fixed to top, full width
- One segment per section, clickable
- States: inactive (gray), active (gradient), visited (dimmed)
- No sidebar rendered in this mode

### 3. Custom Color Palette
Add optional `palette` to artifact branding:
```typescript
palette?: {
  accent1?: string; // Primary accent (teal in investor deck)
  accent2?: string; // Secondary accent (purple)
  accent3?: string; // Tertiary (amber)
  accent4?: string; // Quaternary (coral)
  accent5?: string; // Quinary (green)
}
```
Injected as CSS custom properties. Section components reference these instead of hardcoded colors.

## Section Changes

### Timeline Enhancement (Beat 1)
Add to Timeline section content:
- `evidence?: { text: string; border_color?: string }` — quote block below timeline steps
- `pivot?: string` — bold closing statement/question below evidence

### New Section: Guided Journey (Beat 2)
Purpose-built interactive storytelling section. Reusable for any multi-step journey with live counters.

```typescript
interface GuidedJourneySection {
  type: "guided-journey";
  id: string;
  title: string;
  subtitle?: string;
  content: {
    phases: Array<{
      id: string;
      name: string;
      color: string; // hex
      dayRange: string; // display label: "Days 0–14"
    }>;
    counters: Array<{
      id: string;
      label: string;
      icon?: string;
      prefix?: string; // "$"
      suffix?: string; // "%"
      start_value: number;
      color?: string;
    }>;
    events: Array<{
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
      counter_values: Record<string, number>; // counter_id → value at this event
    }>;
    autoplay?: boolean;
    interval_ms?: number; // default 3000
  };
}
```

Component features:
- Play/pause/reset controls
- Clickable timeline nodes (colored by phase)
- Animated counters that update on event change (easing over 600ms)
- Detail panel with day badge, title, personas, product, description, trigger box
- Phase badges above timeline
- Auto-advances when autoplay is true

### Tier Table: Comparison Mode (Beat 3)
Add `mode` field: `"pricing"` (default, current) vs `"comparison"`.

In comparison mode:
- Two columns with heading and subtitle each
- Items have `icon: "check" | "cross"` indicator instead of `included: boolean`
- Optional `kicker` field at bottom (bold closing statement in gradient box)

### Data Viz: Staircase Chart (Beat 4)
Add `"staircase"` to `chart_type` enum.

```typescript
// When chart_type === "staircase"
data: Array<{
  label: string;      // "Self-Serve Month 1"
  amount: string;     // "$500–2.5K"
  description: string; // "BADAS + Atlas credits"
  color: string;      // hex
}>
```
Renders as ascending blocks, each taller than the last, with label and amount.

### Data Viz: Layers Chart (Beat 4)
Add `"layers"` to `chart_type` enum.

```typescript
// When chart_type === "layers"
data: Array<{
  label: string;     // "+ BADAS Scoring"
  price: string;     // "$10–15"
  color: string;     // hex
}>
callout?: string; // text box below the layers
```
Renders as stacked horizontal bars that grow wider, showing value compounding.

### Rich Text: Tag Field (Beat 5)
Add optional `tag` to Rich Text content:
```typescript
tag?: {
  label: string;   // "Proof Case — March 2026"
  color?: string;  // hex, defaults to accent1
}
```
Renders as a small badge above the section title.

## Beat-to-Section Mapping

| Beat | Sections Used |
|------|--------------|
| 1. The Problem | Enhanced Timeline (6 steps + evidence + pivot) |
| 2. The Journey | Guided Journey (new — 4 counters, 8 events, 2 phases) |
| 3. The Punchline | Tier Table in comparison mode + kicker |
| 4. The Economics | Metric Dashboard (3 cards) + Data Viz staircase + Data Viz layers |
| 5. The Evidence | Rich Text with tag (proof case) + Expandable Card Grid (6 customers) + Rich Text quote callout |

## Implementation Order

1. **Foundation** — Update TypeScript types (artifact model + all section types)
2. **Parallel** — All section components + document-level features
3. **Content** — Create the investor deck JSON data
4. **Polish** — Visual tuning, animations, responsive

## Color Palette (from source)

| Name | Hex | Usage |
|------|-----|-------|
| Teal | #2fd8c8 | Primary accent, phase 1 |
| Purple | #7c6df0 | Secondary accent, phase 2 |
| Amber | #f0b429 | Economics, warnings |
| Coral | #f06460 | Problems, urgency |
| Green | #36d399 | Success, positive metrics |

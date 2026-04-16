# Visual Quality Rubric (VQR)

> **Immutable scoring reference.** This document defines how the Visual Eval Harness scores section screenshots. Changes to this rubric require a calibration session with golden baselines — never edit casually.

---

## Visual Quality Score (VQS)

Each section screenshot is scored 0-100 across 6 dimensions. The VQS is the weighted average.

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| **Layout Integrity** | 25% | No overlapping elements, correct alignment, proper spacing between items, responsive grid behavior |
| **Text Readability** | 20% | Text is legible, proper font sizes, sufficient contrast, no truncation/overflow, correct hierarchy |
| **Visual Consistency** | 20% | Matches design system (colors, borders, radii, opacity), consistent with other sections of same type |
| **Information Hierarchy** | 15% | Clear primary/secondary/tertiary content levels, progressive disclosure works, scannable layout |
| **Completeness** | 10% | All expected content rendered (no empty cards, missing labels, placeholder text, broken images) |
| **Polish** | 10% | Hover states implied, smooth edges, proper padding, professional feel, no visual artifacts |

---

## Scoring Scale

| Score | Label | Meaning |
|-------|-------|---------|
| 90-100 | **Excellent** | Board-ready. A Series B CEO would present this without edits. |
| 75-89 | **Good** | Functional and professional. Minor polish needed. |
| 60-74 | **Acceptable** | Usable but noticeably rough. Would trigger quality concerns. |
| 40-59 | **Poor** | Visible bugs or layout issues. Would embarrass the author. |
| 0-39 | **Broken** | Unusable. Major rendering failures, overlapping text, missing content. |

### Thresholds
- **Ship threshold:** VQS >= 75 (all sections must pass for artifact to be "production ready")
- **Quality Engineer trigger:** VQS < 60 (auto-file rubric item for sections below this)
- **Regression alarm:** VQS drops > 10 points from golden baseline

---

## Per-Dimension Scoring Guide

### 1. Layout Integrity (25%)

**100 — Perfect:**
- All elements properly aligned to grid
- Consistent spacing (gap-4/gap-6 per design system)
- Cards in grids are equal height
- No overflow or overlap
- Responsive at 1280px viewport

**75 — Minor issues:**
- Slightly uneven spacing in one area
- One card slightly taller than siblings
- Alignment off by a few pixels

**50 — Noticeable problems:**
- Elements overlapping partially
- Grid breaks to unexpected number of columns
- Large uneven gaps between items

**25 — Broken layout:**
- Content overflows container
- Elements stacked when should be side-by-side
- Major alignment failures

**0 — Unusable:**
- Content invisible or off-screen
- Complete layout collapse

### 2. Text Readability (20%)

**100 — Perfect:**
- All text legible at normal zoom
- Proper font size hierarchy (titles > body > labels)
- Sufficient contrast (WCAG AA minimum)
- No truncation of important content
- Line lengths comfortable (45-75 characters)

**75 — Minor issues:**
- One text element slightly small
- Minor contrast issue in secondary text
- Slightly long line lengths

**50 — Noticeable problems:**
- Text too small to read comfortably
- Important text truncated with ellipsis
- Poor contrast makes text hard to read

**25 — Hard to read:**
- Multiple text elements unreadable
- Severe truncation losing meaning
- Text overlapping other text

**0 — Unreadable:**
- Text invisible or illegible

### 3. Visual Consistency (20%)

**100 — Perfect:**
- Colors match design system tokens exactly
- Border radii consistent (rounded-xl for cards, rounded-lg for inner)
- Opacity system correct (white/5, white/10, etc.)
- Accent colors used correctly (indigo for UI, teal for emphasis)

**75 — Minor deviations:**
- One element uses slightly wrong border radius
- Minor color inconsistency in hover state
- Opacity slightly off on one element

**50 — Noticeable inconsistency:**
- Mix of design system and non-system colors
- Inconsistent border treatments
- Wrong accent color used

**25 — Poor consistency:**
- Multiple design system violations
- Elements look like they belong to different apps
- Random colors or styles

**0 — No consistency:**
- Complete disregard for design system

### 4. Information Hierarchy (15%)

**100 — Perfect:**
- Clear visual distinction between title, body, and metadata
- Primary content draws the eye first
- Progressive disclosure works (summary visible, detail expandable)
- Section title clearly labels the content

**75 — Minor issues:**
- Hierarchy mostly clear but one level blends
- Summary could be more scannable
- Labels slightly unclear

**50 — Unclear hierarchy:**
- Hard to tell what's most important
- Too much content at same visual weight
- Navigation unclear

**25 — Confusing:**
- All content looks the same priority
- Title doesn't describe content
- User would struggle to scan

**0 — No hierarchy:**
- Content is a wall of undifferentiated text

### 5. Completeness (10%)

**100 — All content rendered:**
- Every field from the data model is displayed
- No empty cards or placeholder text
- All labels and values present
- Icons/images loaded correctly

**75 — Minor gaps:**
- One optional field missing display
- Minor placeholder text visible

**50 — Noticeable gaps:**
- Empty cards in a grid
- "undefined" or "null" visible
- Missing labels on values

**25 — Incomplete:**
- Multiple empty or broken elements
- Critical data not rendered

**0 — Missing content:**
- Section appears empty or broken

### 6. Polish (10%)

**100 — Polished:**
- Professional, refined appearance
- Consistent spacing and padding
- Smooth visual treatment
- Would look at home in a paid SaaS product

**75 — Nearly polished:**
- One minor rough edge
- Slightly inconsistent padding
- Professional but not premium

**50 — Rough:**
- Multiple rough edges visible
- Inconsistent padding/margins
- Looks like a prototype

**25 — Unfinished:**
- Clearly unpolished
- Jarring visual elements
- Feels like a side project

**0 — Amateur:**
- Would not be shown to clients

---

## Section-Specific Expectations

Each section type has specific rendering expectations. Score against these in addition to the general dimensions.

### rich-text
- Collapsible sections expand/collapse correctly
- Markdown rendered with proper formatting
- Code blocks styled distinctly
- Links visually distinct

### expandable-cards
- Grid layout: 2-3 columns depending on card count
- Cards equal height within a row
- Expand/collapse animation smooth
- Card content doesn't overflow

### timeline
- Steps connected by visual line/connector
- Active/completed/future states visually distinct
- Timeline reads left-to-right or top-to-bottom consistently
- Step labels readable

### tier-table
- Columns aligned, rows consistent height
- Header row distinct from data rows
- Recommended/highlighted tier visually emphasized
- Price values prominent

### metric-dashboard
- KPI cards in a grid (2-4 per row)
- Values large and prominent
- Delta/change indicators color-coded (green up, red down)
- Labels smaller than values

### data-viz
- Chart renders at correct aspect ratio
- Axes labeled
- Legend visible and correct
- Data points distinguishable

### hub-mockup
- Central hub node connected to satellite nodes
- Connection lines visible
- Node labels readable
- Layout balanced

### guided-journey
- Steps in sequence
- Current/active step highlighted
- Completed steps visually marked
- Step descriptions readable

### comparison-matrix
- Column headers aligned with data
- Row labels visible
- Check/cross indicators clear
- Scrollable if too wide

### hero-stats
- Large stat values prominent
- Stat labels below values
- Grid layout balanced
- Background treatment consistent

### call-to-action
- CTA button prominent and centered
- Supporting text readable
- Visual treatment draws attention
- Sufficient padding around content

---

## Eval Output Format

The scorer outputs JSON for each section:

```json
{
  "section_id": "abc123",
  "section_type": "expandable-cards",
  "vqs": 82,
  "dimensions": {
    "layout_integrity": 90,
    "text_readability": 85,
    "visual_consistency": 80,
    "information_hierarchy": 75,
    "completeness": 85,
    "polish": 70
  },
  "issues": [
    {
      "dimension": "information_hierarchy",
      "severity": "minor",
      "description": "Card titles and descriptions are similar visual weight — titles should be bolder"
    },
    {
      "dimension": "polish",
      "severity": "minor",
      "description": "Bottom padding on last card is tighter than top padding on first card"
    }
  ],
  "passed": true
}
```

---

## Calibration Process

1. **Golden baselines** — Maintain a set of known-good screenshots with pre-assigned VQS scores
2. **Weekly calibration** — Score goldens and compare to assigned scores. If drift > 5 points, investigate prompt changes
3. **New section types** — Must add golden baselines before the type can be evaluated
4. **Rubric updates** — Require re-scoring all goldens to verify no regression in scoring consistency

---

*Version 1.0 — Created 2026-04-15*

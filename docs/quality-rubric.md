# Strata Editor Quality Rubric

**Phase 1 Status: COMPLETE (2026-04-15)**
22 of 24 items done. Remaining: QR-13 (type selector polish, Tier 1), QR-15 (ARIA audit, Tier 0), QR-24 (Hub Diagram, Tier 3 — blocked on design decision). Quality Engineer agent handles QR-13 and QR-15 automatically. Focus has shifted to features — see `docs/features/hardcoded-features-audit.md`.

The autonomous agent works through this list top-to-bottom. Each item has a measurable pass/fail test. Mark items DONE by moving them to the Completed section at the bottom.

Reference: `docs/design-system.md` for correct patterns.

---

## Tier System

Every rubric item has a **Tier** (0-3) that determines how its PR is handled:

- **Tier 0** — Tokens only. Typos, text sizes, border opacity, spacing, ARIA labels, unused imports, lint fixes, CSS variable unification. No behavior change possible. **Auto-merges instantly.**
- **Tier 1** — Visual polish with no behavior change. Component pattern unification, loading states, empty states, error states, animations, color consistency, hover/focus states, transitions. **Auto-merges after 15 min if no veto.**
- **Tier 2** — Anything touching copy, user flows, new interactions, visible UX behavior, anything opinionated. **Held for Jon's review (2h window, then parks).**
- **Tier 3** — Architecture, data model, new pages, structural redesigns, new dependencies. **Never auto-merges.** The agent should REFUSE these and add them to `docs/pending-planning.md` instead.

**When in doubt, pick the HIGHER tier (safer).**

---

## Priority 1: Visual Consistency (systematic, no taste required)

### ~~QR-03: Unify error message pattern~~ DONE
- **Status:** DONE — PR #3

### ~~QR-04: Unify button patterns to 3 types~~ DONE
- **Status:** DONE — PR #15. Fixed Apply (SectionEditorPanel), Keep (AddSection), Add Selected (MultiSectionReview) — all changed from non-standard green to Primary accent. TopBar publish toggle uses green as a status indicator (published=live), which is intentional semantic colour; left as-is (would require Tier 2 design decision).

### ~~QR-05: Add transition-colors to all buttons~~ DONE
- **Status:** DONE — PR #4

### ~~QR-21: Palette consistency audit — charts and active states should use Velocity palette~~ DONE
- **Status:** DONE — PR #10

---

## Priority 2: Interaction Completeness (4-state rule)

### ~~QR-06: Delete confirmation is too fragile~~ DONE
- **Status:** DONE — PR opened 2026-04-04. Replaced 2s timeout with persistent "Confirm delete?" pill (Escape to cancel).

### ~~QR-07: Add loading states to Upload tab~~ DONE
- **Status:** DONE — PR #13

### ~~QR-08: Add empty state to AI chat panel~~ DONE
- **Status:** DONE — PR opened 2026-04-04. Enhanced empty state with accent icon container, section-type-specific prompt suggestions as full-width clickable rows; bottom chip strip hidden until conversation starts.

### ~~QR-09: Add section duplicate action~~ DONE
- **Status:** DONE — PR opened 2026-04-04. Copy icon on each section row (hidden until hover); creates deep copy with new ID and "(Copy)" title suffix, inserted immediately below.

### ~~QR-10: Keyboard shortcut discoverability~~ DONE
- **Status:** DONE — PR opened 2026-04-04. `?` key triggers overlay listing all 5 shortcuts; Escape or `?` again dismisses it; overlay blocked when focus is in input/textarea.

---

## Priority 3: Visual Hierarchy & Polish

### ~~QR-11: Split view visual hierarchy~~ DONE
- **Status:** DONE — PR #12

### ~~QR-12: Consistent hover states on sidebar items~~ DONE
- **Status:** DONE — PR #11

### QR-13: Type selector dropdown polish
- **Tier:** 1
- **What:** Type selector error appears as toast above dropdown but disappears when dropdown closes. Make error persist for 5s regardless of dropdown state. Also add loading skeleton during type conversion.
- **Files:** `src/components/editor/TypeSelectorDropdown.tsx`
- **Test:** Trigger type change error — close dropdown — error still visible for 5s
- **Status:** OPEN

### ~~QR-22: Timeline dots should show status differentiation~~ DONE
- **Status:** DONE — Already implemented in AnimatedTimeline.tsx via STATUS_STYLES object (accent dot + ArrowRight for current, success dot + Check for completed, card dot + Circle for upcoming). Rubric pre-dated the implementation.

### ~~QR-23: Metric dashboard layout should handle 4-item case gracefully~~ DONE
- **Status:** DONE — PR #9

### QR-24: Hub Diagram visual upgrade — currently just boxes + text list
- **Tier:** 3
- **What:** The `HubMockup` component renders a central node + surrounding nodes as boxes with a text list of connections below. It should be a visual hub-and-spoke diagram with SVG connector lines between the center node and the surrounding nodes. This is the weakest visual section and needs redesign.
- **Files:** `src/components/viewer/sections/HubMockup.tsx`
- **Test:** /demo Section 7 "Go-to-Market Architecture" — nodes should be visually connected via lines/curves, not a text list.
- **Status:** BLOCKED — needs design direction from planning session before building
- **Note:** Do NOT work this item autonomously. Requires planning session with Jon.

---

## Priority 4: Accessibility

### ~~QR-14: ARIA live regions for dynamic content~~ DONE
- **Status:** DONE — PR #QR-14. Added `aria-live="polite"` to save status in TopBar, message list in AiChatPanel, and all 6 error message containers in editor components.

### QR-15: ARIA labels on all icon-only buttons
- **Tier:** 0
- **What:** Every button that contains only an icon (no text) must have `aria-label`. Audit all editor components.
- **Files:** All files in `src/components/editor/`
- **Test:** `grep -r "className=.*w-[34].*h-[34]" src/components/editor/ | grep "<button"` — every match has `aria-label`
- **Status:** OPEN

---

## Priority 5: Viewer Quality (investor-facing surface)

### ~~QR-17: Add loading skeleton to artifact page~~ DONE
- **Status:** DONE — PR created 2026-04-05. Created `src/app/[slug]/loading.tsx` — Next.js App Router loading.tsx convention shows a pulsing skeleton (sidebar nav placeholder + 3 content blocks) while the RSC page.tsx renders. Dark theme, CSS animate-pulse, staggered delays.

### ~~QR-18: Graceful 404 for missing artifacts~~ DONE
- **Status:** DONE — PR opened 2026-04-04. Created `src/app/[slug]/not-found.tsx` — branded dark-theme 404 with "This document doesn't exist" heading and "Create your own" CTA to sharestrata.com. `page.tsx` unchanged.

### ~~QR-19: Generate og:image for social sharing~~ DONE
- **Status:** DONE — PR opened 2026-04-04. `opengraph-image.tsx` already existed and is well-implemented. Fixed one bug: it was using `getArtifactForEdit` (no `is_published` filter) instead of `getArtifactBySlug` (public-only). OG metadata (`title`, `description`, `openGraph`, `twitter`) is set in `generateMetadata` in `page.tsx`.

### ~~QR-20: Mobile-friendly beats navigation~~ DONE
- **Status:** DONE — PR opened 2026-04-04. Progress bar hidden on mobile (`hidden sm:flex`). Floating `X / Y` pill with prev/next arrows shown at bottom of screen on mobile only (`sm:hidden`). Desktop unchanged.

---

## Priority 6: Landing Page Sync

### QR-16: Update landing page to reflect current editor capabilities
- **Tier:** 3
- **What:** Landing page must show: all 8 section types, split view editor, AI chat co-editor, paste/upload ingestion, drag-drop reorder, type changing. Audit `src/app/page.tsx` and update any outdated sections.
- **Files:** `src/app/page.tsx`
- **Test:** Every major editor capability is represented on the landing page
- **Status:** OPEN
- **Note:** `src/app/page.tsx` is brand-voice-sensitive and off-limits to the autonomous agent. Park this in pending-planning for a planning session with Jon.

---

## Completed
(Agent moves items here after fix is merged)

- **QR-01: Kill non-standard text sizes** — PR #1, merged 2026-04-04
- **QR-02: Normalize border opacity to white/10 default** — PR #2, merged 2026-04-04
- **QR-04: Unify button patterns to 3 types** — PR #15, 2026-04-04

---

*This rubric is the agent's work queue. Items are worked top-to-bottom within each priority level. Jon can reprioritize during planning sessions.*

### QR-25: raw-hex in src/components/editor/EditableHubMockup.tsx:75
- **What:** Raw hex color in JSX — use CSS variable tokens from globals.css (per design-system.md Colors section)
- **Files:** src/components/editor/EditableHubMockup.tsx:75
- **Test:** Find the line `color: "#6366f1",` is replaced with the correct pattern
- **Priority:** 1
- **Tier:** 0
- **Status:** OPEN

### QR-26: raw-hex in src/components/editor/EditableHubMockup.tsx:340
- **What:** Raw hex color in JSX — use CSS variable tokens from globals.css (per design-system.md Colors section)
- **Files:** src/components/editor/EditableHubMockup.tsx:340
- **Test:** Find the line `value={node.color || "#6366f1"}` is replaced with the correct pattern
- **Priority:** 1
- **Tier:** 0
- **Status:** OPEN

### QR-27: raw-hex in src/components/editor/DocumentSettings.tsx:7
- **What:** Raw hex color in JSX — use CSS variable tokens from globals.css (per design-system.md Colors section)
- **Files:** src/components/editor/DocumentSettings.tsx:7
- **Test:** Find the line `const DEFAULT_PRIMARY = "#6366f1";` is replaced with the correct pattern
- **Priority:** 1
- **Tier:** 0
- **Status:** OPEN

### QR-28: raw-hex in src/components/editor/DocumentSettings.tsx:8
- **What:** Raw hex color in JSX — use CSS variable tokens from globals.css (per design-system.md Colors section)
- **Files:** src/components/editor/DocumentSettings.tsx:8
- **Test:** Find the line `const DEFAULT_SECONDARY = "#f59e0b";` is replaced with the correct pattern
- **Priority:** 1
- **Tier:** 0
- **Status:** OPEN

### QR-29: raw-hex in src/components/editor/EditableGuidedJourney.tsx:111
- **What:** Raw hex color in JSX — use CSS variable tokens from globals.css (per design-system.md Colors section)
- **Files:** src/components/editor/EditableGuidedJourney.tsx:111
- **Test:** Find the line `color: "#6366f1",` is replaced with the correct pattern
- **Priority:** 1
- **Tier:** 0
- **Status:** OPEN

### QR-30: raw-hex in src/components/viewer/sections/FlywheelDiagram.tsx:6
- **What:** Raw hex color in JSX — use CSS variable tokens from globals.css (per design-system.md Colors section)
- **Files:** src/components/viewer/sections/FlywheelDiagram.tsx:6
- **Test:** Find the line `{ label: "Discover\nBADAS", color: "#FF6B6B" },` is replaced with the correct pattern
- **Priority:** 1
- **Tier:** 0
- **Status:** OPEN

### QR-31: raw-hex in src/components/viewer/sections/FlywheelDiagram.tsx:7
- **What:** Raw hex color in JSX — use CSS variable tokens from globals.css (per design-system.md Colors section)
- **Files:** src/components/viewer/sections/FlywheelDiagram.tsx:7
- **Test:** Find the line `{ label: "Gaps\nexposed", color: "#F7B731" },` is replaced with the correct pattern
- **Priority:** 1
- **Tier:** 0
- **Status:** OPEN

### QR-32: raw-hex in src/components/viewer/sections/FlywheelDiagram.tsx:8
- **What:** Raw hex color in JSX — use CSS variable tokens from globals.css (per design-system.md Colors section)
- **Files:** src/components/viewer/sections/FlywheelDiagram.tsx:8
- **Test:** Find the line `{ label: "Buy\ndata", color: "#4ECDC4" },` is replaced with the correct pattern
- **Priority:** 1
- **Tier:** 0
- **Status:** OPEN

### QR-33: raw-hex in src/components/viewer/sections/FlywheelDiagram.tsx:9
- **What:** Raw hex color in JSX — use CSS variable tokens from globals.css (per design-system.md Colors section)
- **Files:** src/components/viewer/sections/FlywheelDiagram.tsx:9
- **Test:** Find the line `{ label: "More gaps\nfound", color: "#FF6B6B" },` is replaced with the correct pattern
- **Priority:** 1
- **Tier:** 0
- **Status:** OPEN

### QR-34: raw-hex in src/components/viewer/sections/FlywheelDiagram.tsx:10
- **What:** Raw hex color in JSX — use CSS variable tokens from globals.css (per design-system.md Colors section)
- **Files:** src/components/viewer/sections/FlywheelDiagram.tsx:10
- **Test:** Find the line `{ label: "Enrich\ndata", color: "#6C5CE7" },` is replaced with the correct pattern
- **Priority:** 1
- **Tier:** 0
- **Status:** OPEN


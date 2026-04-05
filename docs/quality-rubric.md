# Strata Editor Quality Rubric

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

### QR-03: Unify error message pattern
- **Tier:** 1
- **What:** All error displays must use the standard error pill: `text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2`. Replace any inline red text, raw `text-red-400` without background, or other error formats.
- **Files:** All editor components showing errors
- **Test:** Every `text-red-400` in editor components is inside a `bg-red-500/10` container
- **Status:** IN PROGRESS

### ~~QR-04: Unify button patterns to 3 types~~ DONE
- **Status:** DONE — PR #15. Fixed Apply (SectionEditorPanel), Keep (AddSection), Add Selected (MultiSectionReview) — all changed from non-standard green to Primary accent. TopBar publish toggle uses green as a status indicator (published=live), which is intentional semantic colour; left as-is (would require Tier 2 design decision).

### ~~QR-05: Add transition-colors to all buttons~~ DONE
- **Status:** DONE — PR #5

### ~~QR-21: Palette consistency audit — charts and active states should use Velocity palette~~ DONE
- **Status:** DONE — PR #10

---

## Priority 2: Interaction Completeness (4-state rule)

### QR-06: Delete confirmation is too fragile
- **Tier:** 2
- **What:** Current delete uses a 2-second timeout that resets if you hover away. Replace with a proper confirmation: click delete → button changes to "Confirm delete?" (red, stays until clicked or Escape)
- **Files:** `src/components/editor/SortableSectionList.tsx`
- **Test:** Click delete, wait 10 seconds — "Confirm?" still visible. Press Escape — cancels. Click confirm — deletes.
- **Status:** OPEN

### ~~QR-07: Add loading states to Upload tab~~ DONE
- **Status:** DONE — PR #13

### QR-08: Add empty state to AI chat panel
- **Tier:** 2
- **What:** Current empty state is just text. Add: Sparkles icon (already there), 2-3 contextual quick-start prompts based on current section type, subtle visual treatment
- **Files:** `src/components/editor/AiChatPanel.tsx`
- **Test:** Open AI tab with no messages — see icon + quick-start suggestions
- **Status:** OPEN

### QR-09: Add section duplicate action
- **Tier:** 2
- **What:** Each section in the sidebar list should have a "Duplicate" action (copy icon) alongside delete. Creates exact copy with new ID, inserted below.
- **Files:** `src/components/editor/SortableSectionList.tsx`, parent editor component
- **Test:** Click duplicate on any section — new identical section appears below with "(Copy)" suffix on title
- **Status:** OPEN

### QR-10: Keyboard shortcut discoverability
- **Tier:** 2
- **What:** Add a keyboard shortcut hint overlay (triggered by `?` key in split view). Shows: Cmd+E (zoom), Cmd+Arrow (navigate), Escape (back), ? (this help).
- **Files:** `src/components/editor/SplitViewLayout.tsx` (new overlay)
- **Test:** Press `?` in split view — see shortcut overlay. Press Escape or `?` again — dismiss.
- **Status:** OPEN

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

### QR-14: ARIA live regions for dynamic content
- **Tier:** 0
- **What:** Add `aria-live="polite"` to: save status indicator, AI chat message list, error messages, loading states
- **Files:** `TopBar.tsx` (save status), `AiChatPanel.tsx` (messages), all error containers
- **Test:** Screen reader announces save status changes and new chat messages
- **Status:** OPEN

### QR-15: ARIA labels on all icon-only buttons
- **Tier:** 0
- **What:** Every button that contains only an icon (no text) must have `aria-label`. Audit all editor components.
- **Files:** All files in `src/components/editor/`
- **Test:** `grep -r "className=.*w-[34].*h-[34]" src/components/editor/ | grep "<button"` — every match has `aria-label`
- **Status:** OPEN

---

## Priority 5: Viewer Quality (investor-facing surface)

### QR-17: Add loading skeleton to artifact page
- **Tier:** 1
- **What:** Show a content skeleton (pulsing gray blocks for title, subtitle, and section placeholders) while Supabase fetch completes. Currently the page is blank for 1-2 seconds.
- **Files:** `src/app/[slug]/page.tsx` or the viewer layout component
- **Test:** Hard-refresh an artifact page — see skeleton animation, then smooth transition to content (no blank flash)
- **Status:** OPEN

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

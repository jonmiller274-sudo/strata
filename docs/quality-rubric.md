# Strata Editor Quality Rubric

The autonomous agent works through this list top-to-bottom. Each item has a measurable pass/fail test. Mark items DONE by moving them to the Completed section at the bottom.

Reference: `docs/design-system.md` for correct patterns.

---

## Priority 1: Visual Consistency (systematic, no taste required)

### QR-01: Kill non-standard text sizes
- **What:** Replace all `text-[11px]` with `text-xs` and all `text-[9px]` with `text-[10px]`
- **Files:** All files in `src/components/editor/`
- **Test:** `grep -r "text-\[11px\]\|text-\[9px\]" src/components/editor/` returns 0 results
- **Status:** OPEN

### QR-02: Normalize border opacity to white/10 default
- **What:** Replace `border-white/15` with `border-white/10` everywhere in editor
- **Files:** `src/components/editor/AddSectionUpload.tsx` and any others
- **Test:** `grep -r "border-white/15" src/components/editor/` returns 0 results
- **Status:** OPEN

### QR-03: Unify error message pattern
- **What:** All error displays must use the standard error pill: `text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2`. Replace any inline red text, raw `text-red-400` without background, or other error formats.
- **Files:** All editor components showing errors
- **Test:** Every `text-red-400` in editor components is inside a `bg-red-500/10` container
- **Status:** OPEN

### QR-04: Unify button patterns to 3 types
- **What:** Audit every `<button>` in editor components. Each must match one of: Primary (accent), Secondary (white/10), or Destructive (red-500/10). Fix any that don't match.
- **Files:** All files in `src/components/editor/`
- **Test:** Manual audit — every button matches one of the 3 patterns in design-system.md
- **Status:** OPEN

### QR-05: Add transition-colors to all buttons
- **What:** Every `<button>` with a hover state must have `transition-colors`
- **Files:** All files in `src/components/editor/`
- **Test:** `grep -r "hover:bg-" src/components/editor/ | grep -v "transition"` returns 0 results for buttons
- **Status:** OPEN

---

## Priority 2: Interaction Completeness (4-state rule)

### QR-06: Delete confirmation is too fragile
- **What:** Current delete uses a 2-second timeout that resets if you hover away. Replace with a proper confirmation: click delete → button changes to "Confirm delete?" (red, stays until clicked or Escape)
- **Files:** `src/components/editor/SortableSectionList.tsx`
- **Test:** Click delete, wait 10 seconds — "Confirm?" still visible. Press Escape — cancels. Click confirm — deletes.
- **Status:** OPEN

### QR-07: Add loading states to Upload tab
- **What:** Upload tab should show: (1) file name while processing, (2) progress stage text that updates ("Extracting text..." → "Structuring content..."), (3) file size
- **Files:** `src/components/editor/AddSectionUpload.tsx`
- **Test:** Upload a PDF — see filename, size, and stage text update during processing
- **Status:** OPEN

### QR-08: Add empty state to AI chat panel
- **What:** Current empty state is just text. Add: Sparkles icon (already there), 2-3 contextual quick-start prompts based on current section type, subtle visual treatment
- **Files:** `src/components/editor/AiChatPanel.tsx`
- **Test:** Open AI tab with no messages — see icon + quick-start suggestions
- **Status:** OPEN

### QR-09: Add section duplicate action
- **What:** Each section in the sidebar list should have a "Duplicate" action (copy icon) alongside delete. Creates exact copy with new ID, inserted below.
- **Files:** `src/components/editor/SortableSectionList.tsx`, parent editor component
- **Test:** Click duplicate on any section — new identical section appears below with "(Copy)" suffix on title
- **Status:** OPEN

### QR-10: Keyboard shortcut discoverability
- **What:** Add a keyboard shortcut hint overlay (triggered by `?` key in split view). Shows: Cmd+E (zoom), Cmd+Arrow (navigate), Escape (back), ? (this help).
- **Files:** `src/components/editor/SplitViewLayout.tsx` (new overlay)
- **Test:** Press `?` in split view — see shortcut overlay. Press Escape or `?` again — dismiss.
- **Status:** OPEN

---

## Priority 3: Visual Hierarchy & Polish

### QR-11: Split view visual hierarchy
- **What:** Editor panel (left) should feel like the primary workspace. Preview panel (right) should feel like a reference. Add subtle visual differentiation: editor gets full-opacity background, preview gets slightly muted (`bg-background/50` — already partially done).
- **Files:** `src/components/editor/SplitViewLayout.tsx`, `SectionPreviewPanel.tsx`
- **Test:** Visual check — editor panel clearly feels "primary," preview clearly feels "secondary"
- **Status:** OPEN

### QR-12: Consistent hover states on sidebar items
- **What:** All sidebar section items should have: hover bg-white/5, selected bg-accent/5 + left border accent, smooth transition
- **Files:** `src/components/editor/SortableSectionList.tsx`, `SidebarRail.tsx`
- **Test:** Hover over sidebar items — consistent highlight. Selected item has accent indicator.
- **Status:** OPEN

### QR-13: Type selector dropdown polish
- **What:** Type selector error appears as toast above dropdown but disappears when dropdown closes. Make error persist for 5s regardless of dropdown state. Also add loading skeleton during type conversion.
- **Files:** `src/components/editor/TypeSelectorDropdown.tsx`
- **Test:** Trigger type change error — close dropdown — error still visible for 5s
- **Status:** OPEN

---

## Priority 4: Accessibility

### QR-14: ARIA live regions for dynamic content
- **What:** Add `aria-live="polite"` to: save status indicator, AI chat message list, error messages, loading states
- **Files:** `TopBar.tsx` (save status), `AiChatPanel.tsx` (messages), all error containers
- **Test:** Screen reader announces save status changes and new chat messages
- **Status:** OPEN

### QR-15: ARIA labels on all icon-only buttons
- **What:** Every button that contains only an icon (no text) must have `aria-label`. Audit all editor components.
- **Files:** All files in `src/components/editor/`
- **Test:** `grep -r "className=.*w-[34].*h-[34]" src/components/editor/ | grep "<button"` — every match has `aria-label`
- **Status:** OPEN

---

## Priority 5: Viewer Quality (investor-facing surface)

### QR-17: Add loading skeleton to artifact page
- **What:** Show a content skeleton (pulsing gray blocks for title, subtitle, and section placeholders) while Supabase fetch completes. Currently the page is blank for 1-2 seconds.
- **Files:** `src/app/[slug]/page.tsx` or the viewer layout component
- **Test:** Hard-refresh an artifact page — see skeleton animation, then smooth transition to content (no blank flash)
- **Status:** OPEN

### QR-18: Graceful 404 for missing artifacts
- **What:** Instead of Next.js default notFound(), show a branded 404 page with "This document doesn't exist" message and a CTA to visit sharestrata.com
- **Files:** `src/app/[slug]/page.tsx`, create `src/app/[slug]/not-found.tsx`
- **Test:** Visit `/nonexistent-slug` → see branded error page, not blank or generic 404
- **Status:** OPEN

### QR-19: Generate og:image for social sharing
- **What:** Add dynamic Open Graph meta tags (title, description, image) so shared artifact links show a rich preview in Slack, email, Twitter. Use Next.js `generateMetadata` with the artifact title/subtitle.
- **Files:** `src/app/[slug]/page.tsx` (metadata), optionally `src/app/[slug]/opengraph-image.tsx`
- **Test:** Share an artifact link in Slack → see title, description, and preview image
- **Status:** OPEN

### QR-20: Mobile-friendly beats navigation
- **What:** Progress bar nav is unreadable on mobile (3px height, no labels). On mobile, replace with a floating "Beat 3 of 7" pill with prev/next arrows, or switch to sidebar nav.
- **Files:** `src/components/viewer/ProgressBarNav.tsx` or equivalent
- **Test:** View beats artifact on iPhone → can navigate all sections easily
- **Status:** OPEN

---

## Priority 6: Landing Page Sync

### QR-16: Update landing page to reflect current editor capabilities
- **What:** Landing page must show: all 8 section types, split view editor, AI chat co-editor, paste/upload ingestion, drag-drop reorder, type changing. Audit `src/app/page.tsx` and update any outdated sections.
- **Files:** `src/app/page.tsx`
- **Test:** Every major editor capability is represented on the landing page
- **Status:** OPEN

---

## Completed
(Agent moves items here after fix is merged)

---

*This rubric is the agent's work queue. Items are worked top-to-bottom within each priority level. Jon can reprioritize during planning sessions.*

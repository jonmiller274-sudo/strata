# Strata Editing Experience — Design Document

**Date:** 2026-03-29
**Status:** Approved
**Author:** Jon Miller + Claude (brainstorm session with Product Advisor & Skeptic)

---

## Summary

Build an in-app editing experience for Strata documents. Users click "Edit" on any artifact they own, land in a side-by-side editor with a lightweight section list on the left and a click-to-edit live preview on the right. AI assists at the section level (not field level) via a chip + free text command bar with a preview-before-apply safety flow.

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Editor layout | Lightweight section list + editable preview | Skeptic: forms become CMS admin panels. The document IS the product. |
| Editing model | Click-to-edit inline on the preview | Edit where you're looking, not in a sidebar form |
| AI scope | Section-level, not field-level | Clean mental model: right panel = content, left panel = structure + AI |
| Add Section | Two-step C: describe → confirm type → generate | Most "Strata" approach. Type picker as fallback for power users. |
| AI command | Chips + free text with preview-before-apply | Chips for 80% cases, free text for 20%. Never auto-replace content. |
| Entry point | Edit button on viewer (author only) | Dashboard comes later. Edit button is the fast path. |
| Save model | Auto-save drafts, explicit publish toggle | No manual save friction. Publish when ready. |

---

## 1. Editor Architecture & Layout

**URL:** `/edit/[slug]` — entered via "Edit" button on the viewer (visible to author only)

**Layout:** Two-panel, full viewport.

### Left Panel (~300px)

- **Document header** — title, subtitle (editable inline), section count, last edited timestamp
- **Section list** — draggable items showing section name + type badge. Click to select. Drag to reorder. Selecting a section scrolls the preview to it and highlights it.
- **AI command** — expands inline below the selected section. Four chips + free text input. Results go through Apply/Discard/See original flow.
- **"+ Add Section" button** — at bottom of list. Opens two-step C flow.
- **Document settings** — gear icon in header. Opens: layout mode, nav style, palette, theme.

### Right Panel (remaining width)

- **Preview header** — "Live Preview" label + view toggles (Beats / Continuous / Mobile)
- **Rendered document** — the actual ArtifactViewer output with click-to-edit enabled. Selected section has subtle highlight outline; others slightly dimmed.

### Top Bar

- Back arrow (→ viewer)
- Document title
- "Saved" / "Saving..." indicator
- "Preview ↗" (opens viewer in new tab)
- Publish/Unpublish toggle

---

## 2. Click-to-Edit Inline Editing

The preview panel renders the document exactly as viewers see it, but every text element is clickable.

### Interaction

- **Hover** — subtle cursor change and faint border on any text element
- **Click** — transforms element into inline text input/textarea, sized to match the rendered element. Text stays in place visually.
- **Click away / Escape** — commits the change. Preview re-renders immediately.

### What's Editable Inline (Right Panel — Content)

- All text: titles, subtitles, descriptions, card bodies, metric labels, timeline step names, tier names, feature lists, callout text
- Numeric values: metric numbers, prices, percentages

### What's Edited in Left Panel (Structure + AI)

- Structural controls: column count, chart type, orientation, number of items
- Visual controls: icon picker, accent colors, highlight column
- Add/remove sub-items: "+ Add card," "+ Add timeline step," "+ Add tier"
- Section-level AI command

**Mental model:** Right panel = content. Left panel = structure and AI.

---

## 3. AI Command Flow

When a section is selected, an AI command area expands below it in the left panel.

### States

**1. Idle** — Four chips: `More concise` · `More detailed` · `Simplify language` · `More persuasive`. Below: text input "Describe what to change..."

**2. User acts** — Clicks a chip (auto-submits) or types custom instruction + Enter. Examples: "Add a competitor called Waymo," "Reframe for insurers," "Cut the third card."

**3. Loading** — Chips/input collapse. Progress indicator on section item ("Rewriting..."). Preview section shows subtle shimmer overlay. ~2-4 seconds.

**4. Review** — Preview shows AI's new version. Sticky bar on section: **"AI suggestion — [Apply] [Discard] [See original]"**
- **See original** — toggles to pre-edit version for comparison
- **Apply** — commits changes, stores previous version for one-level undo
- **Discard** — restores original, no changes

**5. After Apply** — "Undo AI edit" link appears briefly (5-10 seconds or until next action).

### Cost & Guardrails

- GPT-4.1-mini for rewrites (~$0.005-0.01 per call)
- AI receives full section data + document title/subtitle for context (NOT other sections)
- Token usage logged per call
- AI cannot change section type or add/remove sub-items (unless explicitly asked via free text, still goes through review)

### Future Upgrades

- Contextual chips per section type (GuidedJourney: `Condense to 5 events`, TierTable: `Simplify feature names`)
- Per-field accept/reject in review flow (based on discard rate data)

---

## 4. Add Section Flow

"+ Add Section" button at bottom of section list.

### Two-Step C Flow

**Step 1 — Describe or pick.**
- Text input: "Describe what you want to add..."
- Below: 8 section type cards (2×4 grid) with thumbnails + one-line descriptions
- Typing a description → AI suggests type (Step 2)
- Clicking a type card → skips to Step 2 with type pre-selected

**Step 2 — Confirm type, then generate.**
- If described: AI responds fast (~500ms): **"I'll create a Tier Table — [Generate] [Change type ▾]"**
- "Change type" opens the type picker as fallback
- User clicks **Generate** → AI creates full section content (2-4 seconds)

**Step 3 — Review.**
- New section appears at bottom of list + preview
- Review bar: **"New section — [Keep] [Discard] [Regenerate]"**
- **Keep** — committed to document. Drag to reposition.
- **Discard** — removed entirely
- **Regenerate** — same type, new content

New sections always insert at the bottom. Drag to reorder.

---

## 5. Document Settings & Save/Publish

### Settings (gear icon → expandable panel, preview stays visible)

- **Layout mode** — Beats / Continuous (preview updates live)
- **Nav style** — Progress bar / Sidebar (Beats always uses progress bar)
- **Theme** — Dark / Light
- **Palette** — 5 accent color pickers with hex input
- **Title & subtitle** — also editable inline in left panel header

### Save Behavior

- **Auto-save drafts** — every edit auto-saves to Supabase within 2 seconds of last change. "Saved" / "Saving..." indicator in top bar.
- **Publish toggle** — in top bar. Published = visible at `/{slug}`. Unpublished = only accessible via `/edit/[slug]`.
- **"Preview ↗"** — opens viewer in new tab (works for unpublished via temporary URL)

### Data Model Changes

- Add `author_id` field to artifacts (for edit button visibility + access control)
- Use existing `is_published` field (unpublished = draft)
- `updated_at` already exists in schema

---

## 6. Entry Points & Navigation

### Getting In

- **From viewer** — "Edit" button in top-right at `/{slug}` (visible to author via `author_id` check). Navigates to `/edit/[slug]`.
- **Direct URL** — `/edit/[slug]` is bookmarkable. Non-author or missing artifact → redirect to viewer or 404.

### Getting Out

- **Back arrow** — returns to `/{slug}`. Auto-save means no "unsaved changes" warning.
- **"Preview ↗"** — new tab, editor stays open.
- **Browser back** — works naturally (standard Next.js routes).

### Not Building Yet (Future — Dashboard)

- `/dashboard` listing all artifacts
- Create from dashboard
- Delete / duplicate artifacts

---

## Technical Notes

### New Pages/Routes

- `/edit/[slug]/page.tsx` — the editor page
- `/api/ai/rewrite/route.ts` — section-level AI rewrite endpoint
- `/api/ai/suggest-type/route.ts` — fast type suggestion for Add Section step 1

### Key Components to Build

- `EditorLayout` — two-panel shell
- `SectionList` — draggable section list with selection, AI command expansion
- `EditablePreview` — ArtifactViewer wrapper with click-to-edit overlay
- `AiCommand` — chips + free text + review flow
- `AddSection` — two-step C flow (describe/pick → confirm → generate)
- `DocumentSettings` — expandable settings panel
- `InlineEditor` — generic wrapper that makes any text element click-to-edit

### Dependencies

- `@dnd-kit/core` or `react-beautiful-dnd` — drag-to-reorder sections
- Existing: `framer-motion`, `lucide-react`, OpenAI client, Supabase client

---

## Advisor Input Summary

### Product Advisor Contributions
- 80% of edits are "fix the AI's homework" — surgical, not structural
- Four generic chips to start, expand based on usage data
- AI command in left panel, manual editing in right panel (physical separation = clear mental model)
- Preview-before-apply is non-negotiable
- Success metric: 70%+ AI apply rate

### Skeptic Contributions
- Challenged forms-based editing → led to click-to-edit on preview (adopted)
- Identified "wrong section type" risk in Add Section → led to two-step confirmation (adopted)
- Identified "AI destroys good content" risk → led to review/undo flow (adopted)
- Recommended contextual chips per section type (deferred to v1.5)
- Recommended per-field accept/reject (deferred to v1.5, based on discard rate data)

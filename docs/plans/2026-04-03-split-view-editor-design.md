# Split View Editor — Design Document

**Date:** 2026-04-03
**Status:** Validated (brainstorm complete)
**Priority:** Critical — blocks editing workflow for investor presentation

---

## Problem

Users can't see the final rendered output while editing. The editor shows form fields and editable components, but these look nothing like what the audience sees in the viewer. To check the actual output, users must switch tabs and refresh the viewer URL. This context-switching kills editing flow, especially during refinement.

## Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Panel layout | Sidebar rail (48px) + editor (~50%) + preview (~50%) | Laptop-optimized. Sidebar collapses to free space for two meaningful panels |
| Preview scope | Focused single-section, with zoom-out toggle | Full document is too small at ~50% laptop width. Focused preview is readable; zoom-out available for context |
| When split view activates | On section selection (not always-on) | Overview mode stays unchanged. Split view appears when you need it |
| Text update speed | Instant (per keystroke) | The "wow moment" — type and watch it render. Structural changes debounced ~500ms |
| Zoom-out behavior | Same panel, content swaps. Click section to navigate | No modals, no new tabs. Click a section in zoom-out to jump to it |
| Mobile (<1024px) | No split view. "Preview" bottom sheet instead | Not enough width for two panels on mobile |

---

## Layout Architecture

### State 1: Overview (no section selected)

Exactly the current editor. Full sidebar, all sections visible as editable blocks. No changes.

### State 2: Split View (section selected)

```
┌──────┬──────────────────────┬──────────────────────┐
│ Rail │     Editor Panel     │    Preview Panel      │
│ 48px │       ~50%           │       ~50%            │
│      │                      │                       │
│  1   │  Section Title [___] │  ┌─────────────────┐  │
│  2   │  Subtitle [________] │  │  Rendered card   │  │
│  3   │                      │  │  grid exactly    │  │
│  4   │  Card 1:             │  │  as viewer sees  │  │
│  5●  │  Title [___]         │  │  it              │  │
│  6   │  Description [____]  │  │                  │  │
│  7   │  ...                 │  └─────────────────┘  │
│  8   │                      │                       │
│  9   │                      │   [Full Document]     │
└──────┴──────────────────────┴──────────────────────┘
```

- **Rail (48px):** Section numbers with type icons, stacked vertically. Active section highlighted. Click to jump. Top button expands full sidebar as overlay.
- **Editor panel (~50%):** Form fields for selected section. Scrollable. Reuses existing `EditableSectionRenderer` components.
- **Preview panel (~50%):** Selected section rendered using viewer's `SectionRenderer`. Identical to what the audience sees. "Full Document" button in corner for zoom-out.

### State 3: Zoom Out (full document preview)

Same layout. Preview panel swaps to show full rendered document scrolled to current section. Current section highlighted with accent border. Click any section in preview to jump to it (both panels update, zooms back to focused mode).

---

## Component Architecture

### New Components

| Component | Responsibility |
|-----------|---------------|
| `SplitViewLayout` | Orchestrator. Replaces main area of EditorLayout when section is selected. Manages two-panel grid and state transitions |
| `SidebarRail` | Thin 48px vertical bar. Section numbers + type icons. Click to navigate. Top button expands full sidebar overlay |
| `SectionEditorPanel` | Left panel. Wraps existing `EditableSectionRenderer` in scrollable container. No new editing logic |
| `SectionPreviewPanel` | Right panel. Renders single section using viewer's `SectionRenderer`. Zoom-out button in corner |
| `DocumentPreviewPanel` | Zoom-out version. Stripped-down `ArtifactViewer` (no sidebar nav, no header chrome). Click-to-navigate wired up |

### Unchanged Components

- All `Editable*` components — render inside `SectionEditorPanel` instead of inline
- All viewer `SectionRenderer` components — used as-is in preview panel
- `useEditor` hook — no state management changes
- `useAutoSave` hook — no save behavior changes
- `TopBar` — unchanged (gains "Preview" toggle on mobile only)

### Key Modification: `EditorLayout.tsx`

Only significant file change:

```
EditorLayout
├── TopBar (unchanged)
├── IF no section selected:
│   ├── Sidebar (unchanged)
│   └── Overview area (unchanged)
├── IF section selected:
│   ├── SidebarRail (48px)
│   ├── SplitViewLayout
│   │   ├── SectionEditorPanel (left ~50%)
│   │   └── SectionPreviewPanel OR DocumentPreviewPanel (right ~50%)
│   └── Sidebar overlay (when rail header clicked)
```

### Data Flow (unchanged)

User types → `EditableSectionRenderer` calls `editor.updateSectionField()` → React state updates → both panels re-render from same state → `useAutoSave` persists to Supabase.

Preview panel is just another consumer of the same state. No new data layer.

---

## Interaction Details

### Entering Split View
- Click any section in overview or sidebar rail
- Full sidebar animates 300px → 48px rail (~300ms ease-out)
- Overview fades out (~150ms), two panels fade in with slight x-offset (~300ms, staggered 50ms)

### Navigating Between Sections
- Rail click or `Cmd+Up` / `Cmd+Down` keyboard shortcuts
- Both panels crossfade content (~200ms). No layout transition
- Rail active indicator slides vertically (spring animation)

### Expanding Full Sidebar
- Click rail header (hamburger icon)
- Sidebar slides out over editor panel as overlay (~250ms)
- Semi-transparent backdrop (black 30%). Click outside or `Esc` to close

### Zoom Out / Zoom In
- Trigger: "Full Document" button or `Cmd+E`
- Preview panel crossfades (~250ms) to full document, scrolled to current section
- Current section gets accent-colored border (pulse once, then steady)
- Click any section in zoom-out to jump there and zoom back in
- `Esc` also zooms back in

### Exiting Split View
- Click active section number in rail (deselects) or `Esc` when not zoomed out
- Preview panel slides out, overview fades back in

### Mobile (< 1024px)
- No split view. Editor works as today
- "Preview" button in TopBar opens rendered section as bottom sheet (~60% height)
- Spring animation with slight bounce. Swipe down to dismiss

---

## Animations & Performance

### Animation Principles
- All transitions use `transform` and `opacity` only — no layout-triggering properties
- Every animation should feel fast and intentional, not decorative
- If any animation makes the editor feel sluggish on a laptop, cut it
- Target: snappy 150-300ms transitions

### Performance Guardrails
- Preview panel uses `React.memo` with shallow comparison to avoid re-renders during rapid typing
- `will-change: transform` on panels during active transitions, removed after
- Text field updates: instant (no debounce)
- Structural changes (add/remove cards, reorder): debounced ~500ms

---

## Implementation Notes

### Files to Create
- `src/components/editor/SplitViewLayout.tsx`
- `src/components/editor/SidebarRail.tsx`
- `src/components/editor/SectionEditorPanel.tsx`
- `src/components/editor/SectionPreviewPanel.tsx`
- `src/components/editor/DocumentPreviewPanel.tsx`

### Files to Modify
- `src/components/editor/EditorLayout.tsx` — main restructure (conditional rendering based on selection state)
- `src/components/editor/TopBar.tsx` — add mobile "Preview" button

### Files Unchanged
- All `Editable*` components
- All viewer section components
- `useEditor.ts`, `useAutoSave.ts`, `useAiChat.ts`
- `SectionRenderer.tsx`, `ArtifactViewer.tsx`

### No Database Changes
No Supabase schema changes needed. This is a pure frontend layout restructure.

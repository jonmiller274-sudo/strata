# Editor Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Strata editor from a bolted-on preview editor into a professional, AI-native editing experience with conversational AI, flexible section editing, brand customization, and full editability across all 8 section types.

**Architecture:** Three independent work streams on separate git branches, merged sequentially into main. Each stream is self-contained — no cross-stream file conflicts. Stream 1 restructures the editor shell (sidebar + AI). Stream 2 adds structural editing to sections. Stream 3 adds brand customization. Smaller items (visual affordances, section previews) fold into the stream that touches those files.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase (storage for logos), Claude Sonnet 4.6 (AI co-editor), existing `generateJSON` utility.

**Design Doc:** `docs/plans/2026-03-31-editor-overhaul-design.md`

---

## Dependency Graph

```
Stream 1 (sidebar + AI co-editor + visual affordances)
  ├── Task 1.1: Sidebar layout restructure
  ├── Task 1.2: AI chat panel component
  ├── Task 1.3: Conversational AI API endpoint
  ├── Task 1.4: Wire chat panel into editor
  ├── Task 1.5: Visual affordances (hover states, edit hints)
  └── Task 1.6: Add Section with previews

Stream 2 (section structure editing + all 8 types editable)
  ├── Task 2.1: Item management primitives (add/remove/reorder)
  ├── Task 2.2: Expandable cards — add/remove cards
  ├── Task 2.3: Timeline — add/remove steps
  ├── Task 2.4: Metric dashboard — add/remove metrics
  ├── Task 2.5: Tier table — add/remove columns and features
  ├── Task 2.6: EditableGuidedJourney component
  ├── Task 2.7: EditableDataViz component
  └── Task 2.8: EditableHubMockup component

Stream 3 (brand customization)
  ├── Task 3.1: Logo upload (Supabase Storage)
  ├── Task 3.2: Brand color picker (primary + secondary)
  ├── Task 3.3: Apply brand to viewer rendering
  └── Task 3.4: Brand settings in Document Settings panel
```

**Streams 1, 2, and 3 can run in parallel.** No shared files between streams.

---

## Stream 1: Sidebar + AI Co-Editor + Polish

**Branch:** `editor/sidebar-ai-chat`

**Key files this stream owns:**
- `src/components/editor/EditorLayout.tsx` (restructure)
- `src/components/editor/AiCommand.tsx` (replace with chat)
- `src/components/editor/DocumentAiCommand.tsx` (replace with chat)
- `src/components/editor/AiChatPanel.tsx` (NEW)
- `src/components/editor/SortableSectionList.tsx` (minor — section metadata)
- `src/components/editor/AddSection.tsx` (previews)
- `src/components/editor/InlineEditor.tsx` (hover states)
- `src/app/api/ai/chat/route.ts` (NEW — conversational endpoint)
- `src/hooks/useAiChat.ts` (NEW — chat state management)

---

### Task 1.1: Sidebar Layout Restructure

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx`
- Modify: `src/components/editor/SortableSectionList.tsx`

**What to build:**
Restructure the left sidebar from a cramped 300px stack into a tabbed/collapsible panel system:

- Widen sidebar to 360px
- Three clear zones:
  1. **Top bar:** Document title (editable) + back button
  2. **Main panel:** Tabbed — "Sections" tab (section list) | "AI" tab (chat panel) | "Settings" tab (document settings)
  3. **Footer:** Add Section button (always visible)
- Only one tab active at a time — no more Settings + AI + Add Section all open simultaneously
- Section list items show type icon + title + item count badge (e.g., "Card Grid — 6 cards")
- Section titles no longer truncate — wrap to 2 lines max

**Step 1:** Refactor EditorLayout.tsx — extract top bar, add tab state (sections/ai/settings), render active panel only.

**Step 2:** Update SortableSectionList — add item count badges per section type. Count logic: cards.length for expandable-cards, steps.length for timeline, metrics.length for metric-dashboard, events.length for guided-journey, columns.length for tier-table, nodes.length for hub-mockup, "—" for rich-text and data-viz.

**Step 3:** Move DocumentSettings into the "Settings" tab instead of a floating overlay.

**Step 4:** Run `npm run build` — verify zero errors.

**Step 5:** Commit: `feat(editor): restructure sidebar with tabbed panel layout`

---

### Task 1.2: AI Chat Panel Component

**Files:**
- Create: `src/components/editor/AiChatPanel.tsx`
- Create: `src/hooks/useAiChat.ts`

**What to build:**
A persistent chat interface for AI editing — the replacement for AiCommand.tsx and DocumentAiCommand.tsx.

**useAiChat hook — state:**
```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  // If the AI produced a section/document suggestion:
  suggestion?: {
    type: "section" | "document";
    sectionId?: string;
    data: any; // The rewritten section or document
    status: "pending" | "applied" | "discarded";
  };
}

interface AiChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  scope: "section" | "document"; // What the AI is editing
  activeSectionId: string | null;
}
```

**AiChatPanel component:**
- Message list with scrollable history (assistant messages + user messages)
- Input bar at bottom with send button (Enter to send, Shift+Enter for newline)
- Scope indicator at top: "Editing: [Section Title]" or "Editing: Entire Document"
- When AI returns a suggestion: inline Apply/Discard buttons on that message
- Quick action chips ABOVE the input (contextual to section type):
  - Rich text: "More concise" | "More persuasive" | "Add evidence"
  - Timeline: "Add a step" | "Reorder chronologically" | "Add more detail"
  - Cards: "Add a card" | "Merge similar cards" | "Make summaries punchier"
  - Journey: "Add an event" | "Compress timeline" | "Adjust metrics"
  - Generic: "More concise" | "More detailed" | "Simplify" | "More persuasive"
- Typing indicator while AI is generating

**Step 1:** Create useAiChat hook with message state, addMessage, clearHistory, setScope.

**Step 2:** Create AiChatPanel component with message rendering, input, scope indicator.

**Step 3:** Add contextual quick-action chips based on selected section type.

**Step 4:** Run `npm run build` — verify zero errors.

**Step 5:** Commit: `feat(editor): add AI chat panel component and hook`

---

### Task 1.3: Conversational AI API Endpoint

**Files:**
- Create: `src/app/api/ai/chat/route.ts`

**What to build:**
A new API endpoint that supports multi-turn conversation for editing. Unlike the existing one-shot endpoints, this accepts message history.

**Request:**
```typescript
{
  messages: { role: "user" | "assistant"; content: string }[];
  context: {
    scope: "section" | "document";
    section?: Section;         // Current section (if scope = section)
    artifact?: { title, subtitle, sections[] }; // Full doc (if scope = document)
  };
}
```

**Response:**
```typescript
{
  message: string;           // AI's response text (may include explanation)
  suggestion?: {             // Present if AI made an edit
    type: "section" | "document";
    data: Section | { title, subtitle, sections[] };
  };
  usage: { input_tokens, output_tokens };
}
```

**System prompt design:**
- AI is a co-editor, not a vending machine
- It can ask clarifying questions ("Do you want me to make the whole section more concise, or just the first paragraph?")
- When it makes changes, it returns the suggestion in a structured JSON block
- It preserves section id and type (same validation as existing rewrite endpoints)
- Uses `generateJSON` utility with task type `"rewrite"` (Sonnet 4.6)

**Key difference from existing endpoints:** The AI doesn't HAVE to return a rewrite. It can just respond with a text message (ask a question, confirm understanding, suggest an approach). The `suggestion` field is optional.

**Step 1:** Create the route with message history support, context injection, and optional suggestion parsing.

**Step 2:** Add system prompt that instructs conversational behavior — the AI should ask questions when instructions are ambiguous.

**Step 3:** Validate suggestions (preserve section id/type) same as existing rewrite route.

**Step 4:** Run `npm run build` — verify zero errors.

**Step 5:** Commit: `feat(api): add conversational AI chat endpoint`

---

### Task 1.4: Wire Chat Panel into Editor

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx`
- Modify: `src/components/editor/AiChatPanel.tsx`
- Delete: `src/components/editor/AiCommand.tsx` (replaced by chat)
- Delete: `src/components/editor/DocumentAiCommand.tsx` (replaced by chat)

**What to build:**
Connect the chat panel to the editor state and the new API endpoint.

**Step 1:** In EditorLayout, render AiChatPanel inside the "AI" tab. Pass selected section, artifact, and update handlers.

**Step 2:** Wire useAiChat to call `/api/ai/chat` with message history + context.

**Step 3:** When AI returns a suggestion, show diff preview in the main preview panel (same pattern as existing AiCommand — opacity toggle between original and suggestion).

**Step 4:** When user clicks "Apply," call useEditor.updateSection or useEditor.updateArtifact to apply changes.

**Step 5:** Remove AiCommand.tsx and DocumentAiCommand.tsx — all AI editing now flows through the chat panel.

**Step 6:** Update top bar — remove "AI Edit" button. AI lives in the sidebar tab now.

**Step 7:** Run `npm run build` — verify zero errors.

**Step 8:** Commit: `feat(editor): wire AI chat panel into editor, remove old AI commands`

---

### Task 1.5: Visual Affordances

**Files:**
- Modify: `src/components/editor/InlineEditor.tsx`
- Modify: `src/components/editor/EditableSectionRenderer.tsx`

**What to build:**
Make it obvious what's editable and what's not.

**Step 1:** InlineEditor hover state — on hover, show a subtle blue outline + edit cursor (`cursor-text`). Current: white/5 background on hover. New: ring-1 ring-blue-500/30 + cursor-text.

**Step 2:** Non-editable sections (data-viz, hub-mockup, guided-journey) — show a subtle "AI-only editing" badge overlay in the editor. Small label: "Edit via AI chat" with a sparkle icon.

**Step 3:** First-time hint — when a user first enters the editor, pulse the first editable text field once with a "click to edit" tooltip. Use localStorage to track if hint has been shown.

**Step 4:** Run `npm run build` — verify zero errors.

**Step 5:** Commit: `feat(editor): add visual affordances for editable fields`

---

### Task 1.6: Add Section with Previews

**Files:**
- Modify: `src/components/editor/AddSection.tsx`
- Create: `src/components/editor/SectionTypePreview.tsx` (NEW — mini preview thumbnails)

**What to build:**
Replace the 2x4 grid of text labels with visual previews of each section type.

**Step 1:** Create SectionTypePreview component — renders a tiny (120x80px) static preview of each section type. These are simplified, illustrative versions (not real data). For journey, show a mini animated timeline dots bar.

**Step 2:** Update AddSection grid — each cell shows the preview thumbnail + type name + one-line description.

**Step 3:** Hover state on each type card — slight scale-up + highlight border.

**Step 4:** Run `npm run build` — verify zero errors.

**Step 5:** Commit: `feat(editor): add visual previews to section type picker`

---

## Stream 2: Section Structure Editing + All 8 Types Editable

**Branch:** `editor/section-structure-editing`

**Key files this stream owns:**
- `src/components/editor/EditableSectionRenderer.tsx` (add new cases)
- `src/components/editor/EditableCardGrid.tsx` (add/remove cards)
- `src/components/editor/EditableTimeline.tsx` (add/remove steps)
- `src/components/editor/EditableMetricDashboard.tsx` (add/remove metrics)
- `src/components/editor/EditableTierTable.tsx` (add/remove columns)
- `src/components/editor/EditableGuidedJourney.tsx` (NEW)
- `src/components/editor/EditableDataViz.tsx` (NEW)
- `src/components/editor/EditableHubMockup.tsx` (NEW)
- `src/components/editor/ItemManager.tsx` (NEW — shared add/remove/reorder primitives)

---

### Task 2.1: Item Management Primitives

**Files:**
- Create: `src/components/editor/ItemManager.tsx`

**What to build:**
A shared component for add/remove/reorder operations within any section type. Prevents duplicating this logic across 6+ editable components.

```typescript
interface ItemManagerProps<T> {
  items: T[];
  onAdd: () => void;           // Adds a new blank item
  onRemove: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  addLabel: string;            // "Add card" | "Add step" | "Add metric"
  minItems?: number;           // Minimum items (can't remove below this)
  maxItems?: number;           // Maximum items
}
```

- Uses @dnd-kit for drag reorder (already a dependency)
- Each item row has: drag handle (left) + content (center) + delete button (right)
- "Add" button at bottom of list
- Respects min/max item counts (disable remove/add when at limits)

**Step 1:** Create ItemManager with @dnd-kit sortable, add button, remove buttons.

**Step 2:** Run `npm run build` — verify zero errors.

**Step 3:** Commit: `feat(editor): add shared ItemManager component for section item CRUD`

---

### Task 2.2: Expandable Cards — Add/Remove

**Files:**
- Modify: `src/components/editor/EditableCardGrid.tsx`

**Step 1:** Wrap card list with ItemManager. Each card renders its inline editors (title, summary, detail) inside the ItemManager's renderItem.

**Step 2:** onAdd creates a blank card: `{ id: nanoid(), title: "New Card", summary: "Click to edit", detail: "", tags: [] }`.

**Step 3:** onRemove splices the card from content.cards array via onFieldChange.

**Step 4:** onReorder updates card order via onFieldChange.

**Step 5:** Run `npm run build` — verify zero errors.

**Step 6:** Commit: `feat(editor): add/remove/reorder cards in expandable-cards sections`

---

### Task 2.3: Timeline — Add/Remove Steps

**Files:**
- Modify: `src/components/editor/EditableTimeline.tsx`

**Same pattern as 2.2** — wrap steps with ItemManager. Blank step: `{ id: nanoid(), label: "New Step", title: "Step Title", description: "Click to edit", status: "upcoming" }`.

**Commit:** `feat(editor): add/remove/reorder steps in timeline sections`

---

### Task 2.4: Metric Dashboard — Add/Remove Metrics

**Files:**
- Modify: `src/components/editor/EditableMetricDashboard.tsx`

**Same pattern** — wrap metrics with ItemManager. Blank metric: `{ id: nanoid(), label: "New Metric", value: "0", description: "Click to edit" }`.

**Commit:** `feat(editor): add/remove/reorder metrics in dashboard sections`

---

### Task 2.5: Tier Table — Add/Remove Columns and Features

**Files:**
- Modify: `src/components/editor/EditableTierTable.tsx`

**Two levels of item management:**
1. Column-level ItemManager (add/remove pricing tiers)
2. Feature-level ItemManager within each column (add/remove feature rows)

Blank column: `{ name: "New Tier", price: "$0", price_period: "month", description: "", features: [], is_highlighted: false }`.
Blank feature: `{ name: "New Feature", included: true }`.

**Commit:** `feat(editor): add/remove columns and features in tier-table sections`

---

### Task 2.6: EditableGuidedJourney Component

**Files:**
- Create: `src/components/editor/EditableGuidedJourney.tsx`
- Modify: `src/components/editor/EditableSectionRenderer.tsx` (add case)

**What to build:**
The journey editor — the most complex editable component. Three sub-sections:

1. **Phases panel** — ItemManager for phases. Each phase: name (inline edit), color (color picker), day range (inline edit).

2. **Events panel** — ItemManager for events. Each event: day number (inline edit), title (inline edit), description (inline edit/textarea), phase assignment (dropdown of phase names), persona tags (inline edit), product tag (inline edit).

3. **Animated metrics** are AI-managed in V1 — show them as read-only cards with a note: "Metrics update automatically based on your events. Use AI chat to adjust."

**Preview:** The journey animation plays in the right preview panel. Edits update the preview in real-time.

**Step 1:** Create EditableGuidedJourney with three collapsible sub-panels (Phases, Events, Metrics).

**Step 2:** Phases panel — ItemManager with color pickers and inline editors.

**Step 3:** Events panel — ItemManager with day/title/description inline editors + phase dropdown.

**Step 4:** Metrics display — read-only cards with "AI-managed" badge.

**Step 5:** Register in EditableSectionRenderer.tsx — add `case "guided-journey"` routing to the new component.

**Step 6:** Run `npm run build` — verify zero errors.

**Step 7:** Commit: `feat(editor): add EditableGuidedJourney component`

---

### Task 2.7: EditableDataViz Component

**Files:**
- Create: `src/components/editor/EditableDataViz.tsx`
- Modify: `src/components/editor/EditableSectionRenderer.tsx` (add case)

**What to build:**
Basic editing for chart sections:
- Title/subtitle inline editing
- Chart type selector (dropdown: bar, line, pie, funnel)
- Data table — ItemManager for data points. Each row: label (inline) + value (inline number input)
- Description (inline textarea)

**Commit:** `feat(editor): add EditableDataViz component`

---

### Task 2.8: EditableHubMockup Component

**Files:**
- Create: `src/components/editor/EditableHubMockup.tsx`
- Modify: `src/components/editor/EditableSectionRenderer.tsx` (add case)

**What to build:**
- Center node: label (inline) + description (inline) + color picker
- Surrounding nodes: ItemManager. Each node: label + description + color picker
- Connections: ItemManager. Each connection: from (dropdown) + to (dropdown) + label (inline)

**Commit:** `feat(editor): add EditableHubMockup component`

---

## Stream 3: Brand Customization

**Branch:** `editor/brand-customization`

**Key files this stream owns:**
- `src/components/editor/BrandSettings.tsx` (NEW)
- `src/components/editor/LogoUpload.tsx` (NEW)
- `src/components/viewer/ArtifactViewer.tsx` (apply brand colors)
- `src/components/viewer/ViewerNav.tsx` (show logo)
- `src/types/artifact.ts` (extend Artifact type with brand fields)
- `src/lib/supabase/storage.ts` (NEW — logo upload helper)
- Supabase migration: add brand columns to artifacts table

---

### Task 3.1: Extend Data Model + Supabase Migration

**Files:**
- Modify: `src/types/artifact.ts`
- Create: Supabase migration (via CLI or dashboard)

**Add to Artifact type:**
```typescript
brand?: {
  logo_url?: string;       // Supabase Storage URL
  primary_color?: string;  // Hex, e.g., "#2563EB"
  secondary_color?: string; // Hex
};
```

**Supabase:** Add `brand` JSONB column to `artifacts` table (nullable, default null). Create a `logos` storage bucket (public read, authenticated write).

**Commit:** `feat(brand): extend artifact data model with brand fields`

---

### Task 3.2: Logo Upload Component

**Files:**
- Create: `src/components/editor/LogoUpload.tsx`
- Create: `src/lib/supabase/storage.ts`

**What to build:**
- Drag-and-drop or click-to-upload logo
- Accepts PNG, SVG, JPEG (max 500KB)
- Uploads to Supabase Storage `logos` bucket
- Returns public URL, stored in artifact.brand.logo_url
- Shows preview of uploaded logo with "Remove" option

**Commit:** `feat(brand): add logo upload component with Supabase Storage`

---

### Task 3.3: Brand Color Picker

**Files:**
- Create: `src/components/editor/BrandSettings.tsx`

**What to build:**
- Replace the current 5 abstract "Accent Colors" pickers with:
  - **Primary brand color** — one color picker with hex input
  - **Secondary brand color** — one color picker with hex input
- Live preview — colors apply to viewer immediately via CSS custom properties
- "Reset to defaults" button

**Commit:** `feat(brand): add brand color picker replacing accent colors`

---

### Task 3.4: Apply Brand to Viewer + Settings Integration

**Files:**
- Modify: `src/components/viewer/ArtifactViewer.tsx`
- Modify: `src/components/viewer/ViewerNav.tsx`
- Modify: `src/components/editor/EditorLayout.tsx` (integrate BrandSettings into Settings tab)

**What to build:**
- Viewer reads `artifact.brand` and sets CSS custom properties (`--brand-primary`, `--brand-secondary`)
- Logo appears in ViewerNav header (left of document title)
- Accent colors throughout the viewer derive from brand primary/secondary
- Editor's Settings tab includes BrandSettings (logo + colors)

**Commit:** `feat(brand): apply brand colors and logo to viewer rendering`

---

## Merge Strategy

1. Each stream works on its own branch
2. When a stream is complete: `npm run build` passes, manual QA of the changes
3. Merge order: **Stream 2 first** (section editing — no layout changes), then **Stream 3** (brand — minimal overlap), then **Stream 1 last** (sidebar restructure — most invasive)
4. Resolve any merge conflicts in Stream 1 merge (it touches EditorLayout which other streams may modify minimally)

---

## Verification (After All Streams Merged)

1. `npm run build` passes with zero errors
2. Create a new artifact — AI structuring works (Opus)
3. Edit a section via AI chat — conversational flow works, apply/discard works
4. Add a card to card grid, step to timeline, metric to dashboard — item management works
5. Edit a journey section — phases, events editable, animation plays correctly
6. Upload a logo + set brand colors — appears in viewer preview
7. Add a new section — type picker shows visual previews
8. Hover over editable text — shows edit affordance
9. Check all 8 section types are editable in editor
10. Deploy to production: `NODE_ENV=production vercel --prod`

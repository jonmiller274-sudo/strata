# Committee Review Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 14 issues identified by the Product/Growth/Design committee review (4 P0, 7 P1, 3 P2).

**Architecture:** Four independent streams that can run as parallel sub-agents. Each stream touches different files with no overlap. Streams A-D can execute simultaneously.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion

**Dev server:** `cd /Users/JonMiller/strata && npm run dev` (runs on port 3001 if 3000 is taken)

**Editor URL:** `http://localhost:3001/edit/investor-deck?key=b5d6f6d81e78120a`

**Viewer URL:** `http://localhost:3001/investor-deck`

**Verification:** Every task ends with `npm run build` passing. Visual tasks also require Puppeteer screenshot verification.

---

## Stream A: Editor UX Fixes (5 tasks)

Touches: `EditorLayout.tsx`, `AddSection.tsx`, `EditableGuidedJourney.tsx`, `InlineEditor.tsx`

### Task A1: Fix Add Section Panel Overlay (P0)

**Problem:** The Add Section panel expands upward inside the sidebar footer, covering 5 of 7 sections. Users can't navigate sections while choosing a new type.

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx` (lines 260-270)
- Modify: `src/components/editor/AddSection.tsx` (entire component)

**Step 1: Refactor AddSection to full-sidebar takeover mode**

Currently the Add Section lives in a `p-2 border-t` footer. Change it so clicking "Add Section" replaces the section list entirely (a new UI state), with a "Back to sections" button.

In `EditorLayout.tsx`, add state:
```typescript
const [showAddSection, setShowAddSection] = useState(false);
```

Replace the sidebar content rendering. When `showAddSection` is true, render the AddSection panel full-height inside the sidebar instead of the section list. When false, render the normal section list + the "Add Section" button at the bottom.

The sidebar tabs (Sections/AI/Settings) should still be visible above. Only the content area below the tabs changes.

**Step 2: Update AddSection.tsx**

Remove the inline expand behavior. The component should now render at full sidebar width/height since it owns the entire content area. Add a "Back" button at the top:
```tsx
<button onClick={onCancel} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
  <ArrowLeft className="w-3 h-3" /> Back to sections
</button>
```

Add `onCancel` prop to AddSection component interface. Wire it to `setShowAddSection(false)` in EditorLayout.

When a section is successfully added (the existing `onAdd` callback fires), also call `onCancel` to return to the section list.

**Step 3: Verify via Puppeteer**

Navigate to editor, click "Add Section". The section type picker should fill the sidebar content area without overlapping anything. Click "Back to sections" to return. Tabs should remain accessible throughout.

**Step 4: Run build**
```bash
npm run build
```

**Step 5: Commit**
```bash
git add src/components/editor/EditorLayout.tsx src/components/editor/AddSection.tsx
git commit -m "fix(editor): convert Add Section to full-sidebar takeover to prevent overlay overlap"
```

---

### Task A2: Fix Journey Editor Label/Value Collision (P0)

**Problem:** Labels like DAY, TITLE, DESCRIPTION collide with field values — "TITLEBADAS Found on Hugging Face" with zero whitespace.

**Files:**
- Modify: `src/components/editor/EditableGuidedJourney.tsx` (lines 226-345)

**Step 1: Add spacing to all label elements**

Find every `<label>` element in the EventsEditor section (approximately 8 labels: Day, Title, Phase, Label, Description, Product, Spend, plus any in PhasesEditor).

Change every label from:
```tsx
<label className="text-[10px] text-muted-foreground uppercase tracking-wider">
```
To:
```tsx
<label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
```

The `block` ensures the label takes its own line. The `mb-1` (4px) creates visual separation from the field value below.

**Step 2: Verify via Puppeteer**

Navigate to editor, select the first Journey section. Screenshot. Labels should now be clearly separated from their values — "DAY" on one line, "0" below it with a small gap. Same for TITLE, DESCRIPTION, LABEL, PHASE, PRODUCT, SPEND.

**Step 3: Run build**
```bash
npm run build
```

**Step 4: Commit**
```bash
git add src/components/editor/EditableGuidedJourney.tsx
git commit -m "fix(editor): add spacing between field labels and values in Journey editor"
```

---

### Task A3: Fix Hover Ring Hardcoded Blue (P1)

**Problem:** `InlineEditor.tsx` line 58 uses `hover:ring-blue-500/30` instead of the brand accent color.

**Files:**
- Modify: `src/components/editor/InlineEditor.tsx` (line 58)

**Step 1: Replace hardcoded blue with accent color**

In `InlineEditor.tsx`, line 58, change:
```tsx
className={`cursor-text rounded transition-all hover:ring-1 hover:ring-blue-500/30 hover:bg-blue-500/5 ${
```
To:
```tsx
className={`cursor-text rounded transition-all hover:ring-1 hover:ring-accent/30 hover:bg-accent/5 ${
```

Note: `--color-accent` is defined in `globals.css` as the theme accent color. Tailwind v4's `ring-accent` maps to this variable. Verify this works by checking that `ring-accent` is a valid utility — if not, use `hover:ring-[var(--color-accent)]/30` and `hover:bg-[var(--color-accent)]/5`.

**Step 2: Verify**

Navigate to editor. Hover over an editable text field. The ring should match the accent color (indigo by default), not blue. If the user has set a custom brand color, the ring should still use the system accent (this is acceptable per the Design Advisor — editor uses system accent, viewer uses brand colors).

**Step 3: Run build and commit**
```bash
npm run build
git add src/components/editor/InlineEditor.tsx
git commit -m "fix(editor): use accent color for hover ring instead of hardcoded blue"
```

---

### Task A4: Clear Chat History on Section Switch (P1)

**Problem:** When clicking a different section in the sidebar, the AI chat retains conversation from the previous section.

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx` (lines 49-55)
- Reference: `src/hooks/useAiChat.ts` (line 89, `clearHistory` method)

**Step 1: Add clearHistory call to section selection effect**

In `EditorLayout.tsx`, the existing effect at lines 49-55 handles scrolling when `selectedSectionId` changes. Add a chat history clear to this effect (or create a new adjacent effect).

First, check how `chat` (from `useAiChat`) is accessible in EditorLayout. Look for the chat instance. If the chat hook is used in `AiChatPanel` and not directly in EditorLayout, you may need to lift `clearHistory` up or use a ref.

The simplest approach: In the `useEffect` that watches `editor.selectedSectionId`, also call the chat's `clearHistory()`. The chat hook exposes `clearHistory` as a callback (line 89 of `useAiChat.ts`).

If `chat` is not directly available in EditorLayout, create a `chatRef` or use the editor store to expose a `clearChat` method.

**Step 2: Verify**

Open AI tab, type a test message in the chat for section 1. Switch to section 2. The chat should be empty. Switch back to section 1 — chat should also be empty (history is not preserved per-section in this MVP).

**Step 3: Run build and commit**
```bash
npm run build
git add src/components/editor/EditorLayout.tsx
git commit -m "fix(editor): clear AI chat history when switching between sections"
```

---

### Task A5: Fix Responsive Sidebar at <1024px (P1)

**Problem:** Sidebar is hardcoded to `w-[360px]` with no responsive breakpoint. At 768px, it consumes 47% of the screen.

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx` (line ~179, sidebar width)

**Step 1: Add responsive sidebar width**

Change the sidebar width from:
```tsx
<aside className="w-[360px] ...">
```
To:
```tsx
<aside className="w-[280px] lg:w-[360px] ...">
```

This gives 280px on tablets (768-1024px) and 360px on desktop (1024px+). At 768px viewport, this leaves 488px for content instead of 408px.

For viewports below 768px (mobile), the sidebar should collapse entirely. Add:
```tsx
<aside className="hidden md:flex md:w-[280px] lg:w-[360px] ...">
```

And add a mobile toggle button to the top bar (a hamburger icon that shows/hides the sidebar). This can be a simple state toggle.

**Step 2: Verify via Puppeteer**

Take screenshots at 1440px, 1024px, and 768px widths. At 1024px, sidebar should be 280px. At 768px, sidebar should be 280px. Content should not have field collisions.

**Step 3: Run build and commit**
```bash
npm run build
git add src/components/editor/EditorLayout.tsx
git commit -m "fix(editor): add responsive sidebar width and mobile collapse"
```

---

## Stream B: AI & Data Fixes (4 tasks)

Touches: `api/ai/chat/route.ts`, `EditableDataViz.tsx`, `EditableHubMockup.tsx`, `EditableSectionRenderer.tsx`

### Task B1: Fix AI Context Injection (P0)

**Problem:** Document context is appended to the FIRST user message. After the first exchange, the AI works with stale content.

**Files:**
- Modify: `src/app/api/ai/chat/route.ts` (lines 105-110)

**Step 1: Change context injection from first to last message**

In `route.ts`, find the context injection code (around line 106):
```typescript
const apiMessages = messages.map((m, i) => {
  if (i === 0 && m.role === "user") {
    return { ...m, content: m.content + contextSuffix };
  }
  return m;
});
```

Change `i === 0` to inject into the LAST user message:
```typescript
const lastUserIndex = messages.reduce((last, m, i) => m.role === "user" ? i : last, -1);
const apiMessages = messages.map((m, i) => {
  if (i === lastUserIndex && m.role === "user") {
    return { ...m, content: m.content + contextSuffix };
  }
  return m;
});
```

This ensures the AI always sees the current document content with the most recent user request, not stale content from the first message.

**Step 2: Verify**

Use curl or the AI chat panel to send 2+ messages. The second message should still have full document context (check via console.log or by asking the AI to reference specific content).

**Step 3: Run build and commit**
```bash
npm run build
git add src/app/api/ai/chat/route.ts
git commit -m "fix(ai): inject document context into last user message, not first"
```

---

### Task B2: Fix Chart Editor Values Showing "0" (P1)

**Problem:** All chart data point values display "0" in the editor because `Number()` coercion fails on string values like "$8" or "$5-8 per clip".

**Files:**
- Modify: `src/components/editor/EditableDataViz.tsx` (around line 99)

**Step 1: Investigate the actual data format**

Read the artifact data for the "Enrichment Margin Chain" section to understand what the `yKey` field actually contains. The viewer renders correct values ("$5-8 per clip"), so the data is there — the editor just can't display it.

Check: Is the value stored as a string like "$5-8 per clip" rather than a number? If so, the editor's `<input type="number">` can't display it.

**Step 2: Switch from number input to text input**

If the data values are strings (which is likely for rich labels like "$5-8 per clip"), change the value input from:
```tsx
<input type="number" value={Number(point[yKey]) || 0} ... />
```
To:
```tsx
<input type="text" value={point[yKey] || ""}
  onChange={(e) => onFieldChange(`content.data.${i}.${yKey}`, e.target.value)}
  className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-right" />
```

This allows both numeric values (42) and rich string values ("$5-8 per clip") to display correctly. The viewer already handles string rendering, so no viewer changes needed.

**Step 3: Verify via Puppeteer**

Navigate to editor, select the "Enrichment Margin Chain" Chart section. Values should now show the actual content instead of "0".

**Step 4: Run build and commit**
```bash
npm run build
git add src/components/editor/EditableDataViz.tsx
git commit -m "fix(editor): display actual chart values instead of Number() coercion to 0"
```

---

### Task B3: Fix Index-Based Keys in DataViz, HubMockup, and TierTable (P1)

**Problem:** `getItemId` uses `dp-${i}`, `conn-${i}`, `col-${i}` — causes stale rendering on drag reorder.

**Files:**
- Modify: `src/components/editor/EditableDataViz.tsx` (line 79)
- Modify: `src/components/editor/EditableHubMockup.tsx` (line 88)
- Modify: `src/components/editor/EditableSectionRenderer.tsx` (line ~431)

**Step 1: Generate content-derived IDs**

For **EditableDataViz.tsx** line 79, change:
```tsx
getItemId={(_, i) => `dp-${i}`}
```
To:
```tsx
getItemId={(point, i) => `dp-${point.label || point[xKey] || i}`}
```

For **EditableHubMockup.tsx** line 88, change:
```tsx
getItemId={(_, i) => `conn-${i}`}
```
To:
```tsx
getItemId={(conn, i) => `conn-${conn.from}-${conn.to}-${i}`}
```

For **EditableSectionRenderer.tsx** line ~431, change:
```tsx
getItemId={(_, i) => `col-${i}`}
```
To:
```tsx
getItemId={(col, i) => `col-${col.name || col.title || i}`}
```

**Step 2: Run build and commit**
```bash
npm run build
git add src/components/editor/EditableDataViz.tsx src/components/editor/EditableHubMockup.tsx src/components/editor/EditableSectionRenderer.tsx
git commit -m "fix(editor): use content-derived keys instead of index-based keys for drag reorder"
```

---

### Task B4: Fix Duplicate Phase Prefix in Viewer (P1)

**Problem:** Phase pills show "Phase 1: Phase 1: Self-Serve Discovery" — the prefix is in both the render code and the data.

**Files:**
- Modify: `src/components/viewer/sections/GuidedJourney.tsx` (line 192)

**Step 1: Strip existing "Phase N:" prefix from data before rendering**

At line 192, change:
```tsx
Phase {i + 1}: {phase.name}
```
To:
```tsx
{phase.name.replace(/^Phase\s+\d+:\s*/i, '') ? `Phase ${i + 1}: ${phase.name.replace(/^Phase\s+\d+:\s*/i, '')}` : `Phase ${i + 1}`}
```

Or more readably, extract a helper:
```tsx
const cleanPhaseName = (name: string) => name.replace(/^Phase\s+\d+:\s*/i, '');
```

Then use:
```tsx
Phase {i + 1}: {cleanPhaseName(phase.name)}
```

This strips "Phase 1: " from the beginning of `phase.name` if it exists, preventing duplication. If the name doesn't have the prefix, it renders normally.

**Step 2: Verify via Puppeteer**

Navigate to the artifact viewer (/investor-deck), go to Beat 1. Phase pills should read "Phase 1: Self-Serve Discovery" (not "Phase 1: Phase 1: Self-Serve Discovery").

**Step 3: Run build and commit**
```bash
npm run build
git add src/components/viewer/sections/GuidedJourney.tsx
git commit -m "fix(viewer): remove duplicate Phase prefix in journey phase pills"
```

---

## Stream C: Viewer Fixes (3 tasks)

Touches: `RichTextCollapsible.tsx`, `ProgressBarNav.tsx`, shared utility

### Task C1: Fix Raw Markdown Rendering in Viewer (P0)

**Problem:** `**bold**` markdown shows as raw asterisks in Rich Text sections. The TierTable already has a working bold parser (`FeatureName`).

**Files:**
- Create: `src/components/viewer/FormattedText.tsx`
- Modify: `src/components/viewer/sections/RichTextCollapsible.tsx` (lines 55-65)
- Modify: `src/components/viewer/sections/TierTable.tsx` (lines 8-22, extract helper)

**Step 1: Create shared FormattedText component**

Extract the `FeatureName` pattern from `TierTable.tsx` into a reusable component:

```tsx
// src/components/viewer/FormattedText.tsx
"use client";

interface FormattedTextProps {
  text: string;
  className?: string;
}

export function FormattedText({ text, className }: FormattedTextProps) {
  // Split on **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
```

**Step 2: Use FormattedText in RichTextCollapsible**

In `RichTextCollapsible.tsx`, import and use FormattedText for the summary text (lines 58-60):

Change:
```tsx
<div className="mt-6 text-lg leading-relaxed text-foreground/90 whitespace-pre-line">
  {content.summary}
</div>
```
To:
```tsx
<div className="mt-6 text-lg leading-relaxed text-foreground/90 whitespace-pre-line">
  <FormattedText text={content.summary} />
</div>
```

Also apply to `content.detail` if it exists (check the component for where detail text is rendered).

Also apply to `content.callout?.text` if rendered as raw text.

**Step 3: Update TierTable to use shared component**

In `TierTable.tsx`, replace the local `FeatureName` function with an import:
```tsx
import { FormattedText } from "../FormattedText";
```

Replace `<FeatureName text={...} />` with `<FormattedText text={...} />`. Delete the local `FeatureName` function.

**Step 4: Verify via Puppeteer**

Navigate to artifact viewer, go to Beat 6 ("This Isn't a Hypothetical"). "Engineer A", "283 safety events", and "52% precision" should render as **bold text**, not raw `**asterisks**`.

**Step 5: Run build and commit**
```bash
npm run build
git add src/components/viewer/FormattedText.tsx src/components/viewer/sections/RichTextCollapsible.tsx src/components/viewer/sections/TierTable.tsx
git commit -m "fix(viewer): render markdown bold in Rich Text sections using shared FormattedText component"
```

---

### Task C2: Fix Mobile Header Overlap in Viewer (P1)

**Problem:** On mobile (375px), the artifact title + subtitle wraps across 3-4 lines and overlaps with beat content.

**Files:**
- Modify: `src/components/viewer/ProgressBarNav.tsx` (lines 114-153)

**Step 1: Hide subtitle on mobile**

In `ProgressBarNav.tsx`, the subtitle is rendered after the title with a "/" separator. Wrap the subtitle in a responsive container that hides on small screens:

Change the subtitle section (around line 135-145) to add a `hidden sm:inline` class:
```tsx
{subtitle && (
  <span className="hidden sm:inline">
    <span style={{margin: "0 8px", color: "var(--color-muted-foreground)", fontSize: "11px"}}>
      /
    </span>
    <span style={{fontSize: "11px", color: "var(--color-muted-foreground)"}}>
      {subtitle}
    </span>
  </span>
)}
```

This hides the subtitle + separator below 640px (sm breakpoint), preventing multi-line wrapping.

**Step 2: Verify via Puppeteer**

Take screenshots at 375x812 (iPhone). The header should show only the title, no subtitle. Beat content should not be overlapped.

**Step 3: Run build and commit**
```bash
npm run build
git add src/components/viewer/ProgressBarNav.tsx
git commit -m "fix(viewer): hide subtitle on mobile to prevent header overlap"
```

---

### Task C3: Add Persistent "Powered by Strata" Watermark (P2)

**Problem:** Zero Strata branding visible during 99% of the viewing experience. The "Made with Strata" footer only appears at the very end.

**Files:**
- Modify: `src/components/viewer/ArtifactViewer.tsx` (lines 96-179, beats layout)
- Modify: `src/components/viewer/StrataFooter.tsx` (line 25, link destination)

**Step 1: Add a persistent watermark to the beats container**

In `ArtifactViewer.tsx`, inside the beats layout section (after the ProgressBarNav, before the `<main>` tag), add a fixed-position watermark:

```tsx
{/* Persistent watermark — free tier only */}
{(!artifact.plan_tier || artifact.plan_tier === "free") && (
  <a
    href="https://sharestrata.com?ref=artifact"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5 opacity-50 hover:opacity-80 transition-opacity"
  >
    <Layers className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
    <span className="text-[11px] font-medium" style={{ color: "var(--color-muted-foreground)" }}>
      Strata
    </span>
  </a>
)}
```

Import `Layers` from `lucide-react` at the top of the file.

**Step 2: Fix "Create your own" link destination**

In `StrataFooter.tsx`, line 25, change:
```tsx
<a href="/create" ...>
```
To:
```tsx
<a href="/?ref=artifact" ...>
```

**Step 3: Make "Made with Strata" text clickable**

In `StrataFooter.tsx`, wrap the left-side content in a link:
```tsx
<a href="https://sharestrata.com?ref=artifact" target="_blank" rel="noopener noreferrer"
   className="flex items-center gap-2 text-footer-text hover:text-foreground transition-colors">
  <Layers className="h-4 w-4" />
  <span className="text-sm">Made with Strata</span>
</a>
```

**Step 4: Verify via Puppeteer**

Navigate to artifact viewer. On every beat, a small "Strata" watermark should be visible in the bottom-left. It should link to sharestrata.com. At the final footer, both "Made with Strata" and "Create your own" should be clickable links.

**Step 5: Run build and commit**
```bash
npm run build
git add src/components/viewer/ArtifactViewer.tsx src/components/viewer/StrataFooter.tsx
git commit -m "feat(viewer): add persistent Strata watermark and fix viral loop links"
```

---

## Stream D: Editor Polish (2 tasks)

These are lower priority but improve perceived quality.

### Task D1: Add Tab Switch Animation (P2 — Design)

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx` (tab content rendering)

**Step 1: Wrap tab content in AnimatePresence**

Import `AnimatePresence` and `motion` from `framer-motion`. Wrap the tab content area:

```tsx
import { AnimatePresence, motion } from "framer-motion";

// In the sidebar content area:
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
    className="flex-1 overflow-y-auto"
  >
    {activeTab === "sections" && <SectionList ... />}
    {activeTab === "ai" && <AiChatPanel ... />}
    {activeTab === "settings" && <DocumentSettings ... />}
  </motion.div>
</AnimatePresence>
```

**Step 2: Run build and commit**
```bash
npm run build
git add src/components/editor/EditorLayout.tsx
git commit -m "feat(editor): add subtle fade animation on tab switches"
```

---

### Task D2: Fix FirstEditHint Animation (P2 — Design)

**Files:**
- Modify: `src/components/editor/FirstEditHint.tsx` (line 25)

**Step 1: Replace animate-pulse with fade-in + auto-dismiss**

Change `animate-pulse` to a one-time `animate-fade-in` (defined in globals.css):
```tsx
// Old:
className="... animate-pulse ..."

// New:
className="... animate-fade-in ..."
```

Also add auto-dismiss after 5 seconds by updating the component's useEffect to set a timer that hides it.

**Step 2: Run build and commit**
```bash
npm run build
git add src/components/editor/FirstEditHint.tsx
git commit -m "fix(editor): replace pulsing hint with one-time fade-in animation"
```

---

## Execution Summary

| Stream | Tasks | Priority | Files Touched | Can Parallel? |
|--------|-------|----------|---------------|---------------|
| A | A1-A5 | P0+P1 | EditorLayout, AddSection, EditableGuidedJourney, InlineEditor | Yes |
| B | B1-B4 | P0+P1 | route.ts, EditableDataViz, EditableHubMockup, EditableSectionRenderer, GuidedJourney (viewer) | Yes |
| C | C1-C3 | P0+P1+P2 | FormattedText (new), RichTextCollapsible, TierTable, ProgressBarNav, ArtifactViewer, StrataFooter | Yes |
| D | D1-D2 | P2 | EditorLayout (different section than A), FirstEditHint | Yes (after A1 merges if touching same EditorLayout area) |

**Total: 14 tasks across 4 streams**

**Recommended execution order within each stream:**
- Stream A: A1 → A2 → A3 → A4 → A5
- Stream B: B1 → B2 → B3 → B4
- Stream C: C1 → C2 → C3
- Stream D: D1 → D2

**Note on Stream D:** Task D1 modifies `EditorLayout.tsx` which is also modified by A1, A4, A5. If running in parallel, D1 should wait until Stream A completes, or use a separate section of the file. The tab content animation (D1) and the Add Section takeover (A1) touch different parts of EditorLayout, so they can technically coexist if careful.

**Final verification after all streams merge:**
1. `npm run build` — zero errors
2. Puppeteer walkthrough of editor (all tabs, all section types, Add Section flow)
3. Puppeteer walkthrough of viewer (all 7 beats at 1440px and 375px)
4. Check: no overlay overlaps, no raw markdown, no label collisions
5. Check: Strata watermark visible on every beat
6. Check: phase pills not duplicated

---

*Committee review source: Product Advisor, Growth Advisor, Design Advisor — 2026-04-01*
*Plan author: Claude (Tech Lead)*

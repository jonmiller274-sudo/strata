# Strata Editing Experience — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an in-app editing experience where users click "Edit" on any artifact they own, land in a two-panel editor with a section list on the left and a click-to-edit live preview on the right, with section-level AI assistance.

**Architecture:** Two-panel editor at `/edit/[slug]`. Left panel (~300px) has section list with drag reorder, AI commands, and Add Section. Right panel renders the document via a modified ArtifactViewer with click-to-edit inline editing. Auto-save to Supabase with debounce. AI rewrites via OpenAI GPT-4.1-mini. No auth gating in this phase — anyone with the edit URL can edit.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion 12, @dnd-kit (new — drag reorder), OpenAI GPT-4.1-mini, Supabase

**Design Doc:** `docs/plans/2026-03-29-editing-experience-design.md` — all UX decisions are locked there.

---

## Existing Code Reference

These files are critical context. Read them before modifying anything nearby.

| File | Role | Lines |
|------|------|-------|
| `src/types/artifact.ts` | All type definitions (8 section types, Artifact, branding) | 282 |
| `src/components/viewer/ArtifactViewer.tsx` | Main viewer — beats + continuous layouts | 233 |
| `src/components/viewer/SectionRenderer.tsx` | Section type → component dispatch | 44 |
| `src/components/viewer/sections/*.tsx` | 8 section components (RichText, Cards, Timeline, etc.) | ~1500 total |
| `src/lib/artifacts/actions.ts` | Server actions: `createArtifact`, `getArtifactBySlug` | 53 |
| `src/lib/supabase.ts` | Supabase client singleton | 17 |
| `src/lib/ai/client.ts` | OpenAI client wrapper | ~20 |
| `src/lib/ai/prompts/structure.ts` | AI structuring prompt + section schema | 173 |
| `src/app/api/ai/structure/route.ts` | POST endpoint for AI structuring | 86 |
| `src/app/[slug]/page.tsx` | Viewer route — fetches published artifact | 42 |
| `src/app/create/page.tsx` | 3-step creation flow | 362 |

---

## Phase Overview

| Phase | Tasks | What Ships |
|-------|-------|-----------|
| **1. Data Layer & Editor Shell** | 1–5 | `/edit/[slug]` route, two-panel layout, artifact fetching/updating |
| **2. Section List & Reorder** | 6–9 | Clickable section list, selection, drag-to-reorder, delete |
| **3. Inline Editing on Preview** | 10–14 | Click-to-edit text in preview, InlineEditor component |
| **4. AI Command Flow** | 15–19 | Section rewrite API, chips + free text, preview-before-apply |
| **5. Add Section** | 20–23 | Type suggestion API, two-step add flow, review bar |
| **6. Auto-Save & Publish** | 24–26 | Debounced auto-save, publish toggle, preview link |
| **7. Document Settings & Entry Point** | 27–30 | Settings panel, edit button on viewer, final polish |

---

## Phase 1: Data Layer & Editor Shell

### Task 1: Add server actions for editing

**Files:**
- Modify: `src/lib/artifacts/actions.ts`

**Why:** The editor needs to (a) fetch artifacts regardless of publish status, and (b) update artifacts. Currently only `createArtifact` and `getArtifactBySlug` (published only) exist.

**Step 1: Add `getArtifactForEdit` function**

Add below the existing `getArtifactBySlug`:

```typescript
export async function getArtifactForEdit(
  slug: string
): Promise<Artifact | null> {
  const { data, error } = await getSupabase()
    .from("artifacts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Artifact;
}
```

**Step 2: Add `updateArtifact` function**

```typescript
interface UpdateArtifactInput {
  title?: string;
  subtitle?: string;
  author_name?: string;
  theme?: "dark" | "light";
  layout_mode?: "continuous" | "beats";
  nav_style?: "sidebar" | "progress-bar";
  branding?: ArtifactBranding;
  sections?: Section[];
  is_published?: boolean;
}

export async function updateArtifact(
  slug: string,
  input: UpdateArtifactInput
): Promise<{ success: boolean } | { error: string }> {
  const { error } = await getSupabase()
    .from("artifacts")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) {
    console.error("[updateArtifact]", error);
    return { error: error.message };
  }

  return { success: true };
}
```

Add `ArtifactBranding` to the import from `@/types/artifact`.

**Step 3: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 4: Commit**

```
feat: add getArtifactForEdit and updateArtifact server actions
```

---

### Task 2: Create the editor route and page shell

**Files:**
- Create: `src/app/edit/[slug]/page.tsx`

**Step 1: Create the editor page**

This is a server component that fetches the artifact and passes it to the client editor.

```typescript
import { notFound } from "next/navigation";
import { getArtifactForEdit } from "@/lib/artifacts/actions";
import { EditorLayout } from "@/components/editor/EditorLayout";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditPage({ params }: Props) {
  const { slug } = await params;
  const artifact = await getArtifactForEdit(slug);

  if (!artifact) {
    notFound();
  }

  return <EditorLayout initialArtifact={artifact} />;
}
```

**Step 2: Create a minimal EditorLayout placeholder**

Create `src/components/editor/EditorLayout.tsx`:

```typescript
"use client";

import type { Artifact } from "@/types/artifact";

export function EditorLayout({ initialArtifact }: { initialArtifact: Artifact }) {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <div className="h-12 border-b border-white/10 flex items-center px-4">
        <span className="text-sm font-medium">{initialArtifact.title}</span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[300px] border-r border-white/10 p-4">
          <p className="text-sm text-muted">Section list placeholder</p>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <p className="text-sm text-muted">Preview placeholder</p>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Verify**

Run: `npm run build`
Then run dev server, navigate to `/edit/<any-existing-slug>`. Should see the two-panel shell with the artifact title.

**Step 4: Commit**

```
feat: add /edit/[slug] route with EditorLayout shell
```

---

### Task 3: Build the useEditor hook

**Files:**
- Create: `src/hooks/useEditor.ts`

**Why:** Central state management for the editor. All section mutations, selection, and save status flow through this hook.

**Step 1: Create the hook**

```typescript
"use client";

import { useState, useCallback } from "react";
import type { Artifact, Section } from "@/types/artifact";

export type SaveStatus = "saved" | "saving" | "unsaved";

export interface EditorState {
  artifact: Artifact;
  selectedSectionId: string | null;
  saveStatus: SaveStatus;
}

export function useEditor(initialArtifact: Artifact) {
  const [artifact, setArtifact] = useState<Artifact>(initialArtifact);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  const markUnsaved = useCallback(() => setSaveStatus("unsaved"), []);

  // Update a top-level artifact field (title, subtitle, theme, etc.)
  const updateArtifactField = useCallback(
    <K extends keyof Artifact>(field: K, value: Artifact[K]) => {
      setArtifact((prev) => ({ ...prev, [field]: value }));
      markUnsaved();
    },
    [markUnsaved]
  );

  // Replace an entire section by ID
  const updateSection = useCallback(
    (sectionId: string, updater: (s: Section) => Section) => {
      setArtifact((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId ? updater(s) : s
        ),
      }));
      markUnsaved();
    },
    [markUnsaved]
  );

  // Update a specific text field within a section's content.
  // path format: "title", "subtitle", "content.summary", "content.cards.0.title"
  const updateSectionField = useCallback(
    (sectionId: string, path: string, value: string) => {
      setArtifact((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.id !== sectionId) return s;
          const clone = JSON.parse(JSON.stringify(s));
          setNestedValue(clone, path, value);
          return clone;
        }),
      }));
      markUnsaved();
    },
    [markUnsaved]
  );

  // Reorder sections by moving from one index to another
  const reorderSections = useCallback(
    (fromIndex: number, toIndex: number) => {
      setArtifact((prev) => {
        const sections = [...prev.sections];
        const [moved] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, moved);
        return { ...prev, sections };
      });
      markUnsaved();
    },
    [markUnsaved]
  );

  // Delete a section by ID
  const deleteSection = useCallback(
    (sectionId: string) => {
      setArtifact((prev) => ({
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sectionId),
      }));
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(null);
      }
      markUnsaved();
    },
    [selectedSectionId, markUnsaved]
  );

  // Add a new section at a specific position (defaults to end)
  const addSection = useCallback(
    (section: Section, position?: number) => {
      setArtifact((prev) => {
        const sections = [...prev.sections];
        const idx = position ?? sections.length;
        sections.splice(idx, 0, section);
        return { ...prev, sections };
      });
      markUnsaved();
    },
    [markUnsaved]
  );

  return {
    artifact,
    selectedSectionId,
    setSelectedSectionId,
    saveStatus,
    setSaveStatus,
    updateArtifactField,
    updateSection,
    updateSectionField,
    reorderSections,
    deleteSection,
    addSection,
  };
}

// Helper: set a value at a dot-notation path on an object.
// Supports array indices: "content.cards.0.title"
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const next = current[key];
    if (next && typeof next === "object") {
      current = next as Record<string, unknown>;
    } else {
      return; // Path doesn't exist, bail
    }
  }
  current[keys[keys.length - 1]] = value;
}
```

**Step 2: Verify build**

Run: `npm run build`

**Step 3: Commit**

```
feat: add useEditor hook with section CRUD and field updates
```

---

### Task 4: Build the TopBar component

**Files:**
- Create: `src/components/editor/TopBar.tsx`
- Modify: `src/components/editor/EditorLayout.tsx`

**Step 1: Create TopBar**

```typescript
"use client";

import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { SaveStatus } from "@/hooks/useEditor";

interface TopBarProps {
  slug: string;
  title: string;
  saveStatus: SaveStatus;
  isPublished: boolean;
  onPublishToggle: () => void;
}

export function TopBar({
  slug,
  title,
  saveStatus,
  isPublished,
  onPublishToggle,
}: TopBarProps) {
  return (
    <div className="h-12 border-b border-white/10 flex items-center px-4 gap-4 shrink-0">
      {/* Back to viewer */}
      <Link
        href={`/${slug}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back</span>
      </Link>

      {/* Title */}
      <span className="text-sm font-medium truncate flex-1">{title}</span>

      {/* Save status */}
      <span className="text-xs text-muted-foreground">
        {saveStatus === "saved" && "Saved"}
        {saveStatus === "saving" && "Saving..."}
        {saveStatus === "unsaved" && "Unsaved changes"}
      </span>

      {/* Preview in new tab */}
      <a
        href={`/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Preview <ExternalLink className="w-3 h-3" />
      </a>

      {/* Publish toggle */}
      <button
        onClick={onPublishToggle}
        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
          isPublished
            ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
            : "bg-white/10 text-muted-foreground hover:bg-white/20"
        }`}
      >
        {isPublished ? "Published" : "Draft"}
      </button>
    </div>
  );
}
```

**Step 2: Wire TopBar into EditorLayout**

Replace the placeholder header in `EditorLayout.tsx`:

```typescript
"use client";

import type { Artifact } from "@/types/artifact";
import { useEditor } from "@/hooks/useEditor";
import { TopBar } from "./TopBar";

export function EditorLayout({ initialArtifact }: { initialArtifact: Artifact }) {
  const editor = useEditor(initialArtifact);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <TopBar
        slug={editor.artifact.slug}
        title={editor.artifact.title}
        saveStatus={editor.saveStatus}
        isPublished={editor.artifact.is_published}
        onPublishToggle={() =>
          editor.updateArtifactField("is_published", !editor.artifact.is_published)
        }
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[300px] border-r border-white/10 p-4 overflow-y-auto">
          <p className="text-sm text-muted">Section list — Task 6</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <p className="text-sm text-muted p-4">Preview — Task 10</p>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Verify build + visual check**

Run: `npm run build` then dev server. Navigate to `/edit/<slug>`. Verify TopBar renders with back arrow, title, save status, preview link, publish toggle.

**Step 4: Commit**

```
feat: add TopBar with save status, publish toggle, and preview link
```

---

### Task 5: Render the live preview in the right panel

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx`

**Why:** The right panel should show the actual rendered document (continuous mode, no sidebar nav) so users see real-time changes.

**Step 1: Import and render ArtifactViewer in the right panel**

Replace the preview placeholder in `EditorLayout.tsx`:

```typescript
import { SectionRenderer } from "@/components/viewer/SectionRenderer";
```

Replace the right panel `<div>` content with:

```tsx
<div className="flex-1 overflow-y-auto" id="editor-preview">
  <div className="mx-auto max-w-4xl px-6 py-12">
    {/* Document header in preview */}
    <header className="mb-12">
      <h1 className="text-3xl font-bold tracking-tight">
        {editor.artifact.title}
      </h1>
      {editor.artifact.subtitle && (
        <p className="mt-2 text-lg text-muted">{editor.artifact.subtitle}</p>
      )}
    </header>
    {/* Sections */}
    <div className="space-y-16">
      {editor.artifact.sections.map((section) => (
        <div
          key={section.id}
          id={`preview-${section.id}`}
          className={`transition-opacity duration-200 ${
            editor.selectedSectionId && editor.selectedSectionId !== section.id
              ? "opacity-50"
              : "opacity-100"
          }`}
          onClick={() => editor.setSelectedSectionId(section.id)}
        >
          <SectionRenderer section={section} />
        </div>
      ))}
    </div>
  </div>
</div>
```

Also apply palette CSS variables to the outer wrapper (copy pattern from ArtifactViewer):

```tsx
const paletteStyle: React.CSSProperties = editor.artifact.branding?.palette
  ? ({
      "--palette-accent1": editor.artifact.branding.palette.accent1 ?? "var(--color-accent)",
      "--palette-accent2": editor.artifact.branding.palette.accent2 ?? "var(--color-accent)",
      "--palette-accent3": editor.artifact.branding.palette.accent3 ?? "var(--color-warning)",
      "--palette-accent4": editor.artifact.branding.palette.accent4 ?? "var(--color-danger)",
      "--palette-accent5": editor.artifact.branding.palette.accent5 ?? "var(--color-success)",
    } as React.CSSProperties)
  : {};
```

Apply `style={paletteStyle}` to the outer `h-screen` div.

**Step 2: Verify**

Run dev server. Navigate to `/edit/<slug>`. The right panel should show the full rendered document. Clicking a section should dim the others.

**Step 3: Commit**

```
feat: render live preview in editor right panel with section selection
```

---

## Phase 2: Section List & Reorder

### Task 6: Build the SectionList component

**Files:**
- Create: `src/components/editor/SectionList.tsx`
- Modify: `src/components/editor/EditorLayout.tsx`

**Step 1: Create SectionList**

```typescript
"use client";

import type { Section, SectionType } from "@/types/artifact";
import { GripVertical, Trash2 } from "lucide-react";

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  "rich-text": "Rich Text",
  "expandable-cards": "Cards",
  "timeline": "Timeline",
  "tier-table": "Tier Table",
  "metric-dashboard": "Metrics",
  "data-viz": "Chart",
  "hub-mockup": "Hub",
  "guided-journey": "Journey",
};

interface SectionListProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SectionList({
  sections,
  selectedSectionId,
  onSelect,
  onDelete,
}: SectionListProps) {
  return (
    <div className="space-y-1">
      {sections.map((section) => {
        const isSelected = section.id === selectedSectionId;
        return (
          <div
            key={section.id}
            onClick={() => onSelect(section.id)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              isSelected
                ? "bg-white/10 text-foreground"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <GripVertical className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 shrink-0 cursor-grab" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{section.title}</p>
              <p className="text-xs opacity-60">{SECTION_TYPE_LABELS[section.type]}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(section.id);
              }}
              className="opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-red-400 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

**Step 2: Wire into EditorLayout**

Replace the left panel placeholder:

```tsx
import { SectionList } from "./SectionList";

// In the left panel div:
<div className="w-[300px] border-r border-white/10 overflow-y-auto flex flex-col">
  {/* Left panel header */}
  <div className="p-4 border-b border-white/10">
    <h2 className="text-sm font-semibold">Sections</h2>
    <p className="text-xs text-muted-foreground mt-0.5">
      {editor.artifact.sections.length} sections
    </p>
  </div>

  {/* Section list */}
  <div className="flex-1 overflow-y-auto p-2">
    <SectionList
      sections={editor.artifact.sections}
      selectedSectionId={editor.selectedSectionId}
      onSelect={editor.setSelectedSectionId}
      onDelete={editor.deleteSection}
    />
  </div>
</div>
```

**Step 3: Verify**

Click sections in the left list. The section should highlight in the list AND the preview should dim non-selected sections. Delete button should appear on hover.

**Step 4: Commit**

```
feat: add SectionList with selection and delete
```

---

### Task 7: Scroll preview to selected section

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx`

**Why:** When a section is selected in the left panel, the preview should scroll to show it.

**Step 1: Add scroll-to-section effect**

Add a `useEffect` in `EditorLayout` that scrolls the preview when selection changes:

```typescript
import { useEffect } from "react";

// Inside EditorLayout component:
useEffect(() => {
  if (!editor.selectedSectionId) return;
  const el = document.getElementById(`preview-${editor.selectedSectionId}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}, [editor.selectedSectionId]);
```

**Step 2: Verify**

Select different sections in the list. Preview should smoothly scroll to each one.

**Step 3: Commit**

```
feat: scroll preview to selected section
```

---

### Task 8: Install @dnd-kit and add drag-to-reorder

**Files:**
- Modify: `package.json` (via npm install)
- Create: `src/components/editor/SortableSectionList.tsx`
- Modify: `src/components/editor/EditorLayout.tsx`

**Step 1: Install @dnd-kit**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Step 2: Create SortableSectionList**

Replace the static `SectionList` with a sortable version using `@dnd-kit/sortable`:

```typescript
"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Section, SectionType } from "@/types/artifact";
import { GripVertical, Trash2 } from "lucide-react";

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  "rich-text": "Rich Text",
  "expandable-cards": "Cards",
  timeline: "Timeline",
  "tier-table": "Tier Table",
  "metric-dashboard": "Metrics",
  "data-viz": "Chart",
  "hub-mockup": "Hub",
  "guided-journey": "Journey",
};

interface SortableSectionListProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

function SortableItem({
  section,
  isSelected,
  onSelect,
  onDelete,
}: {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "bg-white/10 text-foreground"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-50 shrink-0 cursor-grab touch-none"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{section.title}</p>
        <p className="text-xs opacity-60">
          {SECTION_TYPE_LABELS[section.type]}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-red-400 transition-opacity"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function SortableSectionList({
  sections,
  selectedSectionId,
  onSelect,
  onDelete,
  onReorder,
}: SortableSectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    onReorder(oldIndex, newIndex);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1">
          {sections.map((section) => (
            <SortableItem
              key={section.id}
              section={section}
              isSelected={section.id === selectedSectionId}
              onSelect={() => onSelect(section.id)}
              onDelete={() => onDelete(section.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

**Step 3: Update EditorLayout to use SortableSectionList**

Replace the `SectionList` import and usage with `SortableSectionList`, passing `onReorder={editor.reorderSections}`.

**Step 4: Delete the old `SectionList.tsx` file** (it's fully replaced)

**Step 5: Verify**

Drag sections in the list. Preview order should update in real time. Build should pass.

**Step 6: Commit**

```
feat: add drag-to-reorder sections with @dnd-kit
```

---

### Task 9: Delete confirmation

**Files:**
- Modify: `src/components/editor/SortableSectionList.tsx`

**Why:** Accidental deletion is destructive. Add a simple "click once to arm, click again to confirm" pattern.

**Step 1: Add confirm state to SortableItem**

```typescript
import { useState } from "react";

// Inside SortableItem, add:
const [confirmDelete, setConfirmDelete] = useState(false);

// Replace the delete button:
<button
  onClick={(e) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      // Auto-reset after 2 seconds
      setTimeout(() => setConfirmDelete(false), 2000);
    }
  }}
  className={`transition-opacity ${
    confirmDelete
      ? "opacity-100 text-red-400"
      : "opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-red-400"
  }`}
>
  <Trash2 className="w-3.5 h-3.5" />
  {confirmDelete && <span className="text-xs ml-1">confirm?</span>}
</button>
```

**Step 2: Verify**

Click delete icon once — it turns red and shows "confirm?". Click again within 2 seconds — section deletes. Wait 2 seconds without clicking — resets.

**Step 3: Commit**

```
feat: add delete confirmation to section list items
```

---

## Phase 3: Inline Editing on Preview

### Task 10: Build the InlineEditor component

**Files:**
- Create: `src/components/editor/InlineEditor.tsx`

**Why:** This is the core editing primitive. Wraps any text element to make it click-to-edit. Used throughout all section types.

**Step 1: Create InlineEditor**

```typescript
"use client";

import { useState, useRef, useEffect } from "react";

interface InlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
}

export function InlineEditor({
  value,
  onChange,
  multiline = false,
  className = "",
  placeholder = "Click to edit...",
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync external value changes
  useEffect(() => {
    if (!isEditing) setDraft(value);
  }, [value, isEditing]);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const commit = () => {
    setIsEditing(false);
    if (draft !== value) {
      onChange(draft);
    }
  };

  const cancel = () => {
    setIsEditing(false);
    setDraft(value);
  };

  if (!isEditing) {
    return (
      <span
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className={`cursor-text rounded transition-all hover:ring-1 hover:ring-white/20 hover:bg-white/5 ${
          !value ? "text-muted-foreground italic" : ""
        } ${className}`}
      >
        {value || placeholder}
      </span>
    );
  }

  const sharedProps = {
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft(e.target.value),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Escape") cancel();
      if (e.key === "Enter" && !multiline) commit();
    },
    className: `bg-white/10 rounded px-1 -mx-1 outline-none ring-1 ring-accent/50 ${className}`,
  };

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        rows={3}
        {...sharedProps}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      {...sharedProps}
    />
  );
}
```

**Step 2: Verify build**

Run: `npm run build`

**Step 3: Commit**

```
feat: add InlineEditor component for click-to-edit text
```

---

### Task 11: Create EditableSectionRenderer

**Files:**
- Create: `src/components/editor/EditableSectionRenderer.tsx`

**Why:** Wraps the viewer's SectionRenderer to add inline editing capabilities. Each section gets editable title/subtitle, and section-type-specific field editing will be added incrementally.

**Step 1: Create the component**

This component renders the section title and subtitle as InlineEditors, then renders the section content below. For MVP, the section content itself remains read-only — full inline content editing is added per-section-type in Tasks 12–14.

```typescript
"use client";

import type { Section } from "@/types/artifact";
import { SectionRenderer } from "@/components/viewer/SectionRenderer";
import { InlineEditor } from "./InlineEditor";

interface EditableSectionRendererProps {
  section: Section;
  onFieldChange: (path: string, value: string) => void;
}

export function EditableSectionRenderer({
  section,
  onFieldChange,
}: EditableSectionRendererProps) {
  return (
    <div>
      {/* Editable title */}
      <h2 className="text-2xl font-bold tracking-tight mb-2">
        <InlineEditor
          value={section.title}
          onChange={(v) => onFieldChange("title", v)}
        />
      </h2>

      {/* Editable subtitle */}
      {section.subtitle !== undefined && (
        <p className="text-muted mb-6">
          <InlineEditor
            value={section.subtitle || ""}
            onChange={(v) => onFieldChange("subtitle", v)}
            placeholder="Add subtitle..."
          />
        </p>
      )}

      {/* Section content — rendered via existing viewer components */}
      <SectionRenderer section={section} />
    </div>
  );
}
```

**Step 2: Wire into EditorLayout preview**

Replace the `SectionRenderer` usage in the preview with `EditableSectionRenderer`:

```tsx
import { EditableSectionRenderer } from "./EditableSectionRenderer";

// In the sections map:
{editor.artifact.sections.map((section) => (
  <div
    key={section.id}
    id={`preview-${section.id}`}
    className={`transition-opacity duration-200 ${
      editor.selectedSectionId && editor.selectedSectionId !== section.id
        ? "opacity-50"
        : "opacity-100"
    }`}
    onClick={() => editor.setSelectedSectionId(section.id)}
  >
    <EditableSectionRenderer
      section={section}
      onFieldChange={(path, value) =>
        editor.updateSectionField(section.id, path, value)
      }
    />
  </div>
))}
```

**Step 3: Verify**

Click on a section title in the preview. It should become an inline input. Edit the title, click away. The title should update in both the preview and the section list.

**Step 4: Commit**

```
feat: add EditableSectionRenderer with inline title/subtitle editing
```

---

### Task 12: Add inline editing for RichText section content

**Files:**
- Modify: `src/components/editor/EditableSectionRenderer.tsx`

**Why:** RichText is the most common section type. Making `content.summary`, `content.detail`, and `content.callout.text` editable covers a lot of editing use cases.

**Step 1: Add type-specific content editing**

Expand `EditableSectionRenderer` to handle rich-text content fields:

```typescript
import type { Section, RichTextSection } from "@/types/artifact";

// Add a helper to render editable content based on section type:
function EditableContent({
  section,
  onFieldChange,
}: {
  section: Section;
  onFieldChange: (path: string, value: string) => void;
}) {
  switch (section.type) {
    case "rich-text":
      return <EditableRichText section={section} onFieldChange={onFieldChange} />;
    default:
      // Fallback: render read-only via SectionRenderer
      return <SectionRenderer section={section} />;
  }
}

function EditableRichText({
  section,
  onFieldChange,
}: {
  section: RichTextSection;
  onFieldChange: (path: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="text-foreground/90 leading-relaxed">
        <InlineEditor
          value={section.content.summary}
          onChange={(v) => onFieldChange("content.summary", v)}
          multiline
        />
      </div>

      {/* Detail (collapsible in viewer, always visible in editor) */}
      {section.content.detail && (
        <div className="text-foreground/70 leading-relaxed border-l-2 border-white/10 pl-4">
          <InlineEditor
            value={section.content.detail}
            onChange={(v) => onFieldChange("content.detail", v)}
            multiline
          />
        </div>
      )}

      {/* Callout */}
      {section.content.callout && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <InlineEditor
            value={section.content.callout.text}
            onChange={(v) => onFieldChange("content.callout.text", v)}
            multiline
          />
        </div>
      )}
    </div>
  );
}
```

Replace the `<SectionRenderer>` call in the main component with `<EditableContent>`.

**Step 2: Verify**

Navigate to an artifact with a rich-text section. Click the summary text — should become editable. Edit and blur — should save.

**Step 3: Commit**

```
feat: add inline editing for rich-text section content
```

---

### Task 13: Add inline editing for Cards and Metrics sections

**Files:**
- Modify: `src/components/editor/EditableSectionRenderer.tsx`

**Step 1: Add EditableCardGrid**

```typescript
function EditableCardGrid({
  section,
  onFieldChange,
}: {
  section: ExpandableCardGridSection;
  onFieldChange: (path: string, value: string) => void;
}) {
  const cols = section.content.columns ?? 3;
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
      {section.content.cards.map((card, i) => (
        <div key={card.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="font-semibold mb-2">
            <InlineEditor
              value={card.title}
              onChange={(v) => onFieldChange(`content.cards.${i}.title`, v)}
            />
          </h3>
          <div className="text-sm text-foreground/70">
            <InlineEditor
              value={card.summary}
              onChange={(v) => onFieldChange(`content.cards.${i}.summary`, v)}
              multiline
            />
          </div>
          {card.detail && (
            <div className="text-sm text-foreground/50 mt-2 border-t border-white/10 pt-2">
              <InlineEditor
                value={card.detail}
                onChange={(v) => onFieldChange(`content.cards.${i}.detail`, v)}
                multiline
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Add EditableMetricDashboard**

```typescript
function EditableMetricDashboard({
  section,
  onFieldChange,
}: {
  section: MetricDashboardSection;
  onFieldChange: (path: string, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {section.content.metrics.map((metric, i) => (
        <div key={metric.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-sm text-muted-foreground mb-1">
            <InlineEditor
              value={metric.label}
              onChange={(v) => onFieldChange(`content.metrics.${i}.label`, v)}
            />
          </p>
          <p className="text-2xl font-bold">
            <InlineEditor
              value={metric.value}
              onChange={(v) => onFieldChange(`content.metrics.${i}.value`, v)}
            />
          </p>
          {metric.description && (
            <p className="text-xs text-muted-foreground mt-1">
              <InlineEditor
                value={metric.description}
                onChange={(v) => onFieldChange(`content.metrics.${i}.description`, v)}
              />
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
```

**Step 3: Register in the switch statement**

```typescript
case "expandable-cards":
  return <EditableCardGrid section={section} onFieldChange={onFieldChange} />;
case "metric-dashboard":
  return <EditableMetricDashboard section={section} onFieldChange={onFieldChange} />;
```

Add the type imports: `ExpandableCardGridSection`, `MetricDashboardSection`.

**Step 4: Verify**

Test editing card titles, metric values. Changes should reflect immediately.

**Step 5: Commit**

```
feat: add inline editing for expandable-cards and metric-dashboard sections
```

---

### Task 14: Add inline editing for remaining section types

**Files:**
- Modify: `src/components/editor/EditableSectionRenderer.tsx`

**Step 1: Add EditableTimeline**

Key editable fields: `steps[i].label`, `steps[i].title`, `steps[i].description`, `content.pivot`, `content.evidence.text`.

Use the same pattern as Cards — render a simplified layout with InlineEditor on each text field. Fall back to SectionRenderer for visual fidelity where inline editing isn't practical.

**Step 2: Add EditableTierTable**

Key editable fields: `columns[i].name`, `columns[i].price`, `columns[i].description`, `columns[i].features[j].name`.

**Step 3: For DataViz, HubMockup, and GuidedJourney** — keep using `SectionRenderer` (read-only) for MVP. These have complex visual layouts where inline editing doesn't map cleanly. Users can edit them via AI commands (Phase 4) or future structural controls.

Register the new components in the switch statement. The `default` case remains `<SectionRenderer>`.

**Step 4: Verify build + test each type**

Run: `npm run build`. Test with an artifact that has timeline and tier-table sections.

**Step 5: Commit**

```
feat: add inline editing for timeline and tier-table sections
```

---

## Phase 4: AI Command Flow

### Task 15: Create the AI rewrite API endpoint

**Files:**
- Create: `src/app/api/ai/rewrite/route.ts`
- Create: `src/lib/ai/prompts/rewrite.ts`

**Step 1: Create the rewrite prompt**

```typescript
// src/lib/ai/prompts/rewrite.ts

import type { SectionType } from "@/types/artifact";

export function buildRewritePrompt(sectionType: SectionType): string {
  return `You are a strategic communication editor. You receive a section of a strategy document and an instruction for how to change it.

## RULES
- Return ONLY the updated section content as valid JSON — no markdown, no explanation, no code fences.
- Preserve the section structure exactly (same keys, same arrays, same types).
- Only modify text content — do NOT change the section type, add/remove items, or alter structural fields unless the instruction explicitly asks for it.
- Write at executive level — concise, specific, confident.
- If the instruction says "more concise", reduce word count by ~30-50%.
- If the instruction says "more detailed", expand with relevant specifics.
- If the instruction says "simplify language", replace jargon with plain English.
- If the instruction says "more persuasive", strengthen the narrative and add impact framing.

## OUTPUT FORMAT
Return the complete section object as JSON. Include all fields (id, type, title, subtitle, content).
The section type is "${sectionType}".`;
}
```

**Step 2: Create the API route**

```typescript
// src/app/api/ai/rewrite/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/ai/client";
import { buildRewritePrompt } from "@/lib/ai/prompts/rewrite";
import type { Section } from "@/types/artifact";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, instruction } = body as {
      section: Section;
      instruction: string;
    };

    if (!section || !instruction) {
      return NextResponse.json(
        { error: "section and instruction are required" },
        { status: 400 }
      );
    }

    const client = getOpenAIClient();
    const systemPrompt = buildRewritePrompt(section.type);

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the current section:\n\n${JSON.stringify(section, null, 2)}\n\nInstruction: ${instruction}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const message = response.choices[0]?.message;
    if (!message?.content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    const rewrittenSection = JSON.parse(message.content) as Section;

    // Log cost
    const usage = response.usage;
    if (usage) {
      const inputCost = (usage.prompt_tokens / 1_000_000) * 0.4;
      const outputCost = (usage.completion_tokens / 1_000_000) * 1.6;
      console.log(
        `[AI Rewrite] model=gpt-4.1-mini input=${usage.prompt_tokens} output=${usage.completion_tokens} cost=$${(inputCost + outputCost).toFixed(4)}`
      );
    }

    return NextResponse.json({
      section: rewrittenSection,
      usage: usage
        ? {
            input_tokens: usage.prompt_tokens,
            output_tokens: usage.completion_tokens,
          }
        : undefined,
    });
  } catch (error) {
    console.error("[AI Rewrite] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

**Step 3: Verify build**

Run: `npm run build`

**Step 4: Commit**

```
feat: add /api/ai/rewrite endpoint for section-level AI editing
```

---

### Task 16: Build the AiCommand component

**Files:**
- Create: `src/components/editor/AiCommand.tsx`

**Step 1: Create the component**

Renders below the selected section in the left panel. Shows 4 chips + free text input.

```typescript
"use client";

import { useState } from "react";
import type { Section } from "@/types/artifact";
import { Sparkles, Loader2 } from "lucide-react";

const CHIPS = [
  { label: "More concise", instruction: "Make this more concise" },
  { label: "More detailed", instruction: "Add more detail and specifics" },
  { label: "Simplify language", instruction: "Simplify the language for a broader audience" },
  { label: "More persuasive", instruction: "Make this more persuasive and impactful" },
];

type AiCommandStatus = "idle" | "loading" | "review";

interface AiCommandProps {
  section: Section;
  onApply: (rewrittenSection: Section) => void;
}

export function AiCommand({ section, onApply }: AiCommandProps) {
  const [status, setStatus] = useState<AiCommandStatus>("idle");
  const [customInstruction, setCustomInstruction] = useState("");
  const [suggestion, setSuggestion] = useState<Section | null>(null);
  const [original] = useState<Section>(section);
  const [showOriginal, setShowOriginal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRewrite = async (instruction: string) => {
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, instruction }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Rewrite failed");
      }

      const data = await res.json();
      setSuggestion(data.section);
      setStatus("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("idle");
    }
  };

  const handleApply = () => {
    if (suggestion) {
      onApply(suggestion);
    }
    setStatus("idle");
    setSuggestion(null);
    setCustomInstruction("");
  };

  const handleDiscard = () => {
    setStatus("idle");
    setSuggestion(null);
    setCustomInstruction("");
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Rewriting...
        </div>
      </div>
    );
  }

  // Review state
  if (status === "review" && suggestion) {
    return (
      <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
        <p className="text-xs font-medium text-accent mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          AI suggestion ready
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="px-3 py-1 rounded text-xs font-medium bg-accent text-white hover:bg-accent/80"
          >
            Apply
          </button>
          <button
            onClick={handleDiscard}
            className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20"
          >
            Discard
          </button>
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20"
          >
            {showOriginal ? "See suggestion" : "See original"}
          </button>
        </div>
      </div>
    );
  }

  // Idle state
  return (
    <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" />
        AI Edit
      </p>

      {/* Chips */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => handleRewrite(chip.instruction)}
            className="px-2.5 py-1 rounded-full text-xs bg-white/10 text-muted-foreground hover:bg-white/20 hover:text-foreground transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Free text input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInstruction}
          onChange={(e) => setCustomInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && customInstruction.trim()) {
              handleRewrite(customInstruction.trim());
            }
          }}
          placeholder="Describe what to change..."
          className="flex-1 bg-white/10 rounded px-2 py-1 text-xs outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-accent/50"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`

**Step 3: Commit**

```
feat: add AiCommand component with chips, free text, and review flow
```

---

### Task 17: Wire AiCommand into the section list

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx`

**Step 1: Show AiCommand below the selected section in the left panel**

After the `SortableSectionList`, add:

```tsx
import { AiCommand } from "./AiCommand";

// Inside the left panel, after SortableSectionList:
{editor.selectedSectionId && (() => {
  const selectedSection = editor.artifact.sections.find(
    (s) => s.id === editor.selectedSectionId
  );
  if (!selectedSection) return null;
  return (
    <div className="px-2 pb-4">
      <AiCommand
        key={editor.selectedSectionId}
        section={selectedSection}
        onApply={(rewritten) =>
          editor.updateSection(editor.selectedSectionId!, () => rewritten)
        }
      />
    </div>
  );
})()}
```

Note: The `key` prop forces a fresh AiCommand when selection changes.

**Step 2: Verify**

Select a section. AI Command should appear below the section list. Click a chip — should call the API, show loading, then show Apply/Discard. Apply should update the preview.

**Step 3: Commit**

```
feat: wire AiCommand into editor for selected sections
```

---

### Task 18: Add shimmer overlay on preview during AI rewrite

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx`
- Modify: `src/components/editor/AiCommand.tsx`

**Why:** Design doc specifies a shimmer overlay on the section being rewritten.

**Step 1: Lift AI status to EditorLayout**

Add `aiSectionId` state to track which section is being rewritten. Pass it down to AiCommand as a callback.

In `EditorLayout`:

```typescript
const [aiLoadingSectionId, setAiLoadingSectionId] = useState<string | null>(null);
```

Pass to AiCommand:

```tsx
<AiCommand
  ...
  onLoadingChange={(loading) =>
    setAiLoadingSectionId(loading ? editor.selectedSectionId : null)
  }
/>
```

**Step 2: Add shimmer in preview**

In the preview sections map, add conditional shimmer:

```tsx
<div
  key={section.id}
  id={`preview-${section.id}`}
  className={`relative transition-opacity duration-200 ${
    editor.selectedSectionId && editor.selectedSectionId !== section.id
      ? "opacity-50"
      : "opacity-100"
  }`}
  ...
>
  <EditableSectionRenderer ... />
  {aiLoadingSectionId === section.id && (
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse rounded-lg" />
  )}
</div>
```

**Step 3: Update AiCommand props**

Add `onLoadingChange?: (loading: boolean) => void` to the props interface. Call it when status changes to/from "loading".

**Step 4: Verify**

Click a chip. The section in the preview should have a shimmer overlay during loading.

**Step 5: Commit**

```
feat: add shimmer overlay on preview during AI rewrite
```

---

### Task 19: Show AI suggestion in preview with toggle

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx`
- Modify: `src/components/editor/AiCommand.tsx`

**Why:** During review state, the preview should show the AI's suggested version. "See original" should toggle back.

**Step 1: Lift suggestion state to EditorLayout**

Add state for the AI suggestion:

```typescript
const [aiSuggestion, setAiSuggestion] = useState<{ sectionId: string; section: Section } | null>(null);
const [showAiOriginal, setShowAiOriginal] = useState(false);
```

**Step 2: Override section in preview when suggestion exists**

In the sections map, check if this section has an active suggestion:

```typescript
const displaySection =
  aiSuggestion?.sectionId === section.id && !showAiOriginal
    ? aiSuggestion.section
    : section;
```

Use `displaySection` instead of `section` when rendering `EditableSectionRenderer`.

**Step 3: Pass suggestion handlers to AiCommand**

```tsx
<AiCommand
  ...
  onSuggestion={(suggestion) =>
    setAiSuggestion({ sectionId: editor.selectedSectionId!, section: suggestion })
  }
  onToggleOriginal={() => setShowAiOriginal(!showAiOriginal)}
  onClearSuggestion={() => {
    setAiSuggestion(null);
    setShowAiOriginal(false);
  }}
/>
```

**Step 4: Update AiCommand to use these callbacks**

Instead of managing suggestion state internally, delegate to the parent via these callbacks.

**Step 5: Verify**

Run AI rewrite. Preview should show the suggestion. "See original" toggles between old and new. Apply commits the suggestion. Discard restores original.

**Step 6: Commit**

```
feat: show AI suggestion in preview with toggle between original and new
```

---

## Phase 5: Add Section

### Task 20: Create the AI type suggestion endpoint

**Files:**
- Create: `src/app/api/ai/suggest-type/route.ts`

**Step 1: Create the endpoint**

Given a text description, suggests the best section type. Fast (~500ms) because it's a simple classification.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/ai/client";
import type { SectionType } from "@/types/artifact";

const VALID_TYPES: SectionType[] = [
  "rich-text",
  "expandable-cards",
  "timeline",
  "tier-table",
  "metric-dashboard",
  "data-viz",
  "hub-mockup",
  "guided-journey",
];

export async function POST(req: NextRequest) {
  try {
    const { description } = (await req.json()) as { description: string };

    if (!description) {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 }
      );
    }

    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      max_tokens: 100,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You classify section descriptions into section types for a strategy document builder.

Valid types: ${VALID_TYPES.join(", ")}

Type descriptions:
- rich-text: Text content with optional expandable detail and callouts
- expandable-cards: Grid of cards (personas, competitors, features)
- timeline: Step-by-step progression (roadmaps, journeys, plans)
- tier-table: Comparison or pricing tables
- metric-dashboard: KPI cards with numbers and trends
- data-viz: Charts and data visualizations
- hub-mockup: Hub-and-spoke diagrams showing connections
- guided-journey: Interactive day-by-day journey with counters

Return ONLY a JSON object: { "type": "<type>", "confidence": <0-1> }`,
        },
        { role: "user", content: description },
      ],
      response_format: { type: "json_object" },
    });

    const message = response.choices[0]?.message;
    if (!message?.content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    const result = JSON.parse(message.content);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[AI Suggest Type] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

**Step 2: Verify build**

Run: `npm run build`

**Step 3: Commit**

```
feat: add /api/ai/suggest-type endpoint for Add Section flow
```

---

### Task 21: Build the AddSection component — Step 1 (describe or pick)

**Files:**
- Create: `src/components/editor/AddSection.tsx`

**Step 1: Create AddSection with the two-step flow**

```typescript
"use client";

import { useState } from "react";
import type { Section, SectionType } from "@/types/artifact";
import { Plus, Loader2, X } from "lucide-react";

const SECTION_TYPES: { type: SectionType; label: string; description: string }[] = [
  { type: "rich-text", label: "Rich Text", description: "Text with expandable details" },
  { type: "expandable-cards", label: "Card Grid", description: "Grid of expandable cards" },
  { type: "timeline", label: "Timeline", description: "Step-by-step progression" },
  { type: "tier-table", label: "Tier Table", description: "Pricing or comparison table" },
  { type: "metric-dashboard", label: "Metrics", description: "KPI dashboard cards" },
  { type: "data-viz", label: "Chart", description: "Data visualization" },
  { type: "hub-mockup", label: "Hub Diagram", description: "Hub-and-spoke connections" },
  { type: "guided-journey", label: "Journey", description: "Interactive guided journey" },
];

type AddSectionStep = "closed" | "describe" | "confirm" | "generating" | "review";

interface AddSectionProps {
  documentTitle: string;
  documentSubtitle?: string;
  onAdd: (section: Section) => void;
}

export function AddSection({ documentTitle, documentSubtitle, onAdd }: AddSectionProps) {
  const [step, setStep] = useState<AddSectionStep>("closed");
  const [description, setDescription] = useState("");
  const [suggestedType, setSuggestedType] = useState<SectionType | null>(null);
  const [generatedSection, setGeneratedSection] = useState<Section | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep("closed");
    setDescription("");
    setSuggestedType(null);
    setGeneratedSection(null);
    setError(null);
  };

  // Step 1 → Step 2: Describe and get type suggestion
  const handleDescribe = async () => {
    if (!description.trim()) return;
    setStep("confirm");
    setError(null);

    try {
      const res = await fetch("/api/ai/suggest-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });

      if (!res.ok) throw new Error("Failed to suggest type");
      const data = await res.json();
      setSuggestedType(data.type);
    } catch {
      // Fallback: let user pick manually
      setSuggestedType(null);
    }
  };

  // Step 2: Pick type directly
  const handlePickType = (type: SectionType) => {
    setSuggestedType(type);
    setStep("confirm");
  };

  // Step 2 → Step 3: Generate section content
  const handleGenerate = async (type: SectionType) => {
    setStep("generating");
    setError(null);

    try {
      const res = await fetch("/api/ai/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Document: ${documentTitle}${documentSubtitle ? ` — ${documentSubtitle}` : ""}\n\nGenerate a single "${type}" section for: ${description || type}`,
          templateType: "platform-vision", // Generic template for single section
        }),
      });

      if (!res.ok) throw new Error("Failed to generate section");
      const data = await res.json();

      // AI returns an artifact with sections — take the first one
      const section = data.artifact?.sections?.[0];
      if (!section) throw new Error("No section generated");

      setGeneratedSection(section);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setStep("confirm");
    }
  };

  // Closed state — just the button
  if (step === "closed") {
    return (
      <button
        onClick={() => setStep("describe")}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 text-sm text-muted-foreground hover:border-white/40 hover:text-foreground transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Section
      </button>
    );
  }

  return (
    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
      {/* Close button */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-medium">Add Section</p>
        <button onClick={reset} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Step 1: Describe */}
      {step === "describe" && (
        <>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDescribe()}
            placeholder="Describe what you want to add..."
            autoFocus
            className="w-full bg-white/10 rounded px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-accent/50 mb-3"
          />
          <p className="text-xs text-muted-foreground mb-2">Or pick a type:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {SECTION_TYPES.map((st) => (
              <button
                key={st.type}
                onClick={() => handlePickType(st.type)}
                className="text-left px-2 py-1.5 rounded text-xs bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="font-medium">{st.label}</span>
                <span className="block text-muted-foreground text-[10px]">{st.description}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 2: Confirm type */}
      {step === "confirm" && (
        <div>
          {suggestedType ? (
            <>
              <p className="text-sm mb-2">
                I&apos;ll create a <span className="font-medium text-accent">
                  {SECTION_TYPES.find((t) => t.type === suggestedType)?.label}
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleGenerate(suggestedType)}
                  className="px-3 py-1 rounded text-xs font-medium bg-accent text-white hover:bg-accent/80"
                >
                  Generate
                </button>
                <button
                  onClick={() => {
                    setSuggestedType(null);
                    setStep("describe");
                  }}
                  className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20"
                >
                  Change type
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Pick a section type above</p>
          )}
        </div>
      )}

      {/* Step 3: Generating */}
      {step === "generating" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating section...
        </div>
      )}

      {/* Step 4: Review */}
      {step === "review" && generatedSection && (
        <div>
          <p className="text-sm mb-2">
            <span className="font-medium">{generatedSection.title}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { onAdd(generatedSection); reset(); }}
              className="px-3 py-1 rounded text-xs font-medium bg-green-600/20 text-green-400 hover:bg-green-600/30"
            >
              Keep
            </button>
            <button
              onClick={reset}
              className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20"
            >
              Discard
            </button>
            <button
              onClick={() => suggestedType && handleGenerate(suggestedType)}
              className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`

**Step 3: Commit**

```
feat: add AddSection component with describe/pick/generate/review flow
```

---

### Task 22: Wire AddSection into EditorLayout

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx`

**Step 1: Add the AddSection button below the section list**

```tsx
import { AddSection } from "./AddSection";

// In the left panel, after SortableSectionList and AiCommand:
<div className="p-2 border-t border-white/10">
  <AddSection
    documentTitle={editor.artifact.title}
    documentSubtitle={editor.artifact.subtitle}
    onAdd={(section) => editor.addSection(section)}
  />
</div>
```

**Step 2: Verify end-to-end**

1. Click "+ Add Section"
2. Type a description → AI suggests a type
3. Click Generate → section appears in review
4. Click Keep → section added to bottom of list and preview

**Step 3: Commit**

```
feat: wire AddSection into editor layout
```

---

## Phase 6: Auto-Save & Publish

### Task 23: Create the useAutoSave hook

**Files:**
- Create: `src/hooks/useAutoSave.ts`

**Why:** Auto-save every edit to Supabase with a 2-second debounce. No manual save button.

**Step 1: Create the hook**

```typescript
"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Artifact } from "@/types/artifact";
import { updateArtifact } from "@/lib/artifacts/actions";
import type { SaveStatus } from "./useEditor";

export function useAutoSave(
  artifact: Artifact,
  saveStatus: SaveStatus,
  setSaveStatus: (status: SaveStatus) => void,
  debounceMs: number = 2000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>(JSON.stringify(artifact));

  const save = useCallback(async () => {
    const current = JSON.stringify(artifact);
    if (current === lastSavedRef.current) return;

    setSaveStatus("saving");

    const result = await updateArtifact(artifact.slug, {
      title: artifact.title,
      subtitle: artifact.subtitle,
      author_name: artifact.author_name,
      theme: artifact.theme,
      layout_mode: artifact.layout_mode,
      nav_style: artifact.nav_style,
      branding: artifact.branding,
      sections: artifact.sections,
      is_published: artifact.is_published,
    });

    if ("error" in result) {
      console.error("[AutoSave] Failed:", result.error);
      setSaveStatus("unsaved");
    } else {
      lastSavedRef.current = current;
      setSaveStatus("saved");
    }
  }, [artifact, setSaveStatus]);

  // Debounced save on changes
  useEffect(() => {
    if (saveStatus !== "unsaved") return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(save, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [saveStatus, save, debounceMs]);

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Can't reliably async save on unmount, but the debounce should have caught it
    };
  }, []);

  return { save }; // Expose manual save for edge cases
}
```

**Step 2: Wire into EditorLayout**

```typescript
import { useAutoSave } from "@/hooks/useAutoSave";

// Inside EditorLayout:
const autoSave = useAutoSave(
  editor.artifact,
  editor.saveStatus,
  editor.setSaveStatus
);
```

That's it — the hook handles everything via the `saveStatus` state from `useEditor`.

**Step 3: Verify**

Edit something in the preview. "Unsaved changes" should appear in TopBar. After 2 seconds, "Saving..." then "Saved". Check Supabase dashboard to confirm the update persisted.

**Step 4: Commit**

```
feat: add auto-save with 2-second debounce
```

---

### Task 24: Make publish toggle save immediately

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx`

**Why:** Publishing/unpublishing should take effect immediately, not wait for debounce.

**Step 1: Update the publish toggle handler**

```typescript
const handlePublishToggle = async () => {
  editor.updateArtifactField("is_published", !editor.artifact.is_published);
  // Save immediately — don't wait for debounce
  await autoSave.save();
};
```

Pass `handlePublishToggle` to TopBar's `onPublishToggle` prop.

**Step 2: Verify**

Toggle publish. Check the artifact at `/<slug>` — should be visible when published, 404 when unpublished.

**Step 3: Commit**

```
feat: publish toggle saves immediately without debounce wait
```

---

### Task 25: Add document title/subtitle inline editing in the preview header

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx`

**Why:** The preview header shows title and subtitle — these should be editable inline.

**Step 1: Replace plain text with InlineEditors**

In the preview header section:

```tsx
import { InlineEditor } from "./InlineEditor";

<header className="mb-12">
  <h1 className="text-3xl font-bold tracking-tight">
    <InlineEditor
      value={editor.artifact.title}
      onChange={(v) => editor.updateArtifactField("title", v)}
    />
  </h1>
  <p className="mt-2 text-lg text-muted">
    <InlineEditor
      value={editor.artifact.subtitle || ""}
      onChange={(v) => editor.updateArtifactField("subtitle", v)}
      placeholder="Add subtitle..."
    />
  </p>
</header>
```

**Step 2: Verify**

Click the title in the preview. Edit it. The TopBar title and section list should reflect the change. Auto-save should persist it.

**Step 3: Commit**

```
feat: add inline editing for document title and subtitle
```

---

## Phase 7: Document Settings & Entry Point

### Task 26: Build the DocumentSettings panel

**Files:**
- Create: `src/components/editor/DocumentSettings.tsx`
- Modify: `src/components/editor/EditorLayout.tsx`

**Step 1: Create DocumentSettings**

```typescript
"use client";

import type { Artifact } from "@/types/artifact";
import { Settings, X } from "lucide-react";
import { useState } from "react";

interface DocumentSettingsProps {
  artifact: Artifact;
  onUpdate: <K extends keyof Artifact>(field: K, value: Artifact[K]) => void;
}

export function DocumentSettings({ artifact, onUpdate }: DocumentSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
        Settings
      </button>
    );
  }

  return (
    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-medium">Document Settings</p>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Layout mode */}
      <div className="mb-3">
        <label className="text-xs text-muted-foreground block mb-1">Layout</label>
        <div className="flex gap-2">
          {(["continuous", "beats"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onUpdate("layout_mode", mode)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                (artifact.layout_mode ?? "continuous") === mode
                  ? "bg-accent/20 text-accent"
                  : "bg-white/10 text-muted-foreground hover:bg-white/20"
              }`}
            >
              {mode === "continuous" ? "Continuous" : "Beats"}
            </button>
          ))}
        </div>
      </div>

      {/* Nav style */}
      <div className="mb-3">
        <label className="text-xs text-muted-foreground block mb-1">Navigation</label>
        <div className="flex gap-2">
          {(["sidebar", "progress-bar"] as const).map((style) => (
            <button
              key={style}
              onClick={() => onUpdate("nav_style", style)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                (artifact.nav_style ?? "sidebar") === style
                  ? "bg-accent/20 text-accent"
                  : "bg-white/10 text-muted-foreground hover:bg-white/20"
              }`}
            >
              {style === "sidebar" ? "Sidebar" : "Progress Bar"}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="mb-3">
        <label className="text-xs text-muted-foreground block mb-1">Theme</label>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => onUpdate("theme", theme)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                artifact.theme === theme
                  ? "bg-accent/20 text-accent"
                  : "bg-white/10 text-muted-foreground hover:bg-white/20"
              }`}
            >
              {theme === "dark" ? "Dark" : "Light"}
            </button>
          ))}
        </div>
      </div>

      {/* Palette colors */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Accent Colors</label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((n) => {
            const key = `accent${n}` as keyof NonNullable<NonNullable<Artifact["branding"]>["palette"]>;
            const color = artifact.branding?.palette?.[key] ?? "#6366f1";
            return (
              <input
                key={n}
                type="color"
                value={color}
                onChange={(e) => {
                  const palette = { ...artifact.branding?.palette, [key]: e.target.value };
                  onUpdate("branding", { ...artifact.branding, palette });
                }}
                className="w-8 h-8 rounded cursor-pointer border border-white/20"
                title={`Accent ${n}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add to left panel header in EditorLayout**

```tsx
import { DocumentSettings } from "./DocumentSettings";

// In the left panel header div:
<div className="p-4 border-b border-white/10">
  <div className="flex justify-between items-center">
    <h2 className="text-sm font-semibold">Sections</h2>
    <DocumentSettings
      artifact={editor.artifact}
      onUpdate={editor.updateArtifactField}
    />
  </div>
  <p className="text-xs text-muted-foreground mt-0.5">
    {editor.artifact.sections.length} sections
  </p>
</div>
```

**Step 3: Verify**

Click Settings gear. Toggle layout mode, nav style, theme, and palette colors. Preview should update live (palette colors apply via CSS variables). Auto-save should persist changes.

**Step 4: Commit**

```
feat: add DocumentSettings panel with layout, theme, and palette controls
```

---

### Task 27: Add "Edit" button on the viewer page

**Files:**
- Modify: `src/app/[slug]/page.tsx`

**Why:** This is the entry point to the editor. Design doc says: "Edit button in top-right at /{slug}."

Since there's no auth yet, the edit button is visible to everyone. Auth gating (author_id check) is a Phase 2 concern.

**Step 1: Add an edit link to the viewer page**

```typescript
import Link from "next/link";
import { Pencil } from "lucide-react";

// Inside the page component, add a floating edit button:
return (
  <div className="relative">
    <Link
      href={`/edit/${slug}`}
      className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur text-sm text-foreground hover:bg-white/20 transition-colors border border-white/10"
    >
      <Pencil className="w-3.5 h-3.5" />
      Edit
    </Link>
    <ArtifactViewer artifact={artifact} />
  </div>
);
```

**Step 2: Verify**

Navigate to `/<slug>`. Edit button should appear in top-right. Click it → navigates to `/edit/<slug>`.

**Step 3: Commit**

```
feat: add Edit button on viewer page linking to /edit/[slug]
```

---

### Task 28: Handle the "Preview ↗" button for unpublished drafts

**Files:**
- Modify: `src/components/editor/TopBar.tsx`
- Modify: `src/app/[slug]/page.tsx`

**Why:** The design doc says Preview should work for unpublished docs. Currently, `getArtifactBySlug` filters on `is_published = true`.

**Step 1: Add a preview query parameter**

In `src/app/[slug]/page.tsx`, check for a `?preview=true` query param. If present, use `getArtifactForEdit` instead of `getArtifactBySlug`:

```typescript
import { getArtifactBySlug, getArtifactForEdit } from "@/lib/artifacts/actions";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export default async function ArtifactPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;

  const artifact = preview === "true"
    ? await getArtifactForEdit(slug)
    : await getArtifactBySlug(slug);

  if (!artifact) {
    notFound();
  }

  // ... rest of page
}
```

**Step 2: Update TopBar preview link**

```tsx
<a
  href={`/${slug}?preview=true`}
  target="_blank"
  rel="noopener noreferrer"
  ...
>
```

**Step 3: Verify**

Create or toggle an artifact to unpublished. Click "Preview ↗" in the editor. Should open in new tab and render the document even though it's unpublished.

**Step 4: Commit**

```
feat: support preview of unpublished drafts via ?preview=true
```

---

### Task 29: Final build verification and cleanup

**Files:**
- All files created/modified in this plan

**Step 1: Run full build**

```bash
npm run build
```

Must pass with zero errors. Fix any TypeScript issues.

**Step 2: Run lint**

```bash
npm run lint
```

Fix any lint warnings.

**Step 3: Manual smoke test**

1. Navigate to an existing artifact → see "Edit" button
2. Click Edit → editor loads with two-panel layout
3. Section list shows all sections with type badges
4. Drag to reorder sections → preview updates
5. Click a section → preview scrolls to it, others dim
6. Click section title in preview → inline editor appears
7. Edit and blur → change persists
8. Click AI chip → loading shimmer → review flow → Apply/Discard
9. Add Section → describe → confirm type → generate → Keep
10. Toggle publish → check viewer
11. Change settings (theme, layout, palette) → preview updates
12. Wait 2 seconds after edit → "Saved" indicator

**Step 4: Commit all remaining changes**

```
feat: complete editing experience — inline editing, AI commands, auto-save
```

---

## New Files Created (Summary)

```
src/app/edit/[slug]/page.tsx              — Editor route (server component)
src/components/editor/EditorLayout.tsx     — Two-panel editor shell
src/components/editor/TopBar.tsx           — Header with save/publish/preview
src/components/editor/SortableSectionList.tsx — Draggable section list
src/components/editor/EditableSectionRenderer.tsx — Preview with inline editing
src/components/editor/InlineEditor.tsx     — Click-to-edit text primitive
src/components/editor/AiCommand.tsx        — AI chips + free text + review
src/components/editor/AddSection.tsx       — Two-step add section flow
src/components/editor/DocumentSettings.tsx — Layout/theme/palette controls
src/hooks/useEditor.ts                    — Editor state management
src/hooks/useAutoSave.ts                  — Debounced auto-save to Supabase
src/app/api/ai/rewrite/route.ts           — Section rewrite API
src/app/api/ai/suggest-type/route.ts      — Type suggestion API
src/lib/ai/prompts/rewrite.ts             — Rewrite system prompt
```

## Modified Files (Summary)

```
src/lib/artifacts/actions.ts              — Add getArtifactForEdit + updateArtifact
src/app/[slug]/page.tsx                   — Add Edit button + preview query param
```

## New Dependencies

```
@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

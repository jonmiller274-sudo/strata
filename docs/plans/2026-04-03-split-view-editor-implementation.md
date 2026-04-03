# Split View Editor — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a split-view editing experience where selecting a section shows the editor on the left and a live preview on the right, so users can see exactly what their audience will see while editing.

**Architecture:** When `selectedSectionId` is set, the full sidebar collapses to a 48px rail and the main area splits into an editor panel (left ~50%) and a preview panel (right ~50%). The preview panel reuses the viewer's `SectionRenderer` — no new data layer. A zoom-out toggle swaps the preview to show the full document. Mobile gets a bottom-sheet preview instead of split view.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion 12, Lucide icons

**Design Doc:** `docs/plans/2026-04-03-split-view-editor-design.md`

---

## Key Files Reference

| File | Role |
|------|------|
| `src/components/editor/EditorLayout.tsx` (687 lines) | Root editor — sidebar + preview area |
| `src/components/editor/EditableSectionRenderer.tsx` | Routes section type to editable component |
| `src/components/viewer/SectionRenderer.tsx` | Routes section type to read-only viewer component |
| `src/components/viewer/ArtifactViewer.tsx` | Full document viewer (beats + continuous modes) |
| `src/components/editor/TopBar.tsx` (57 lines) | Top bar with save status, preview link, publish toggle |
| `src/components/editor/SortableSectionList.tsx` | Sidebar section list with drag-reorder |
| `src/hooks/useEditor.ts` | Editor state: `artifact`, `selectedSectionId`, CRUD actions |
| `src/hooks/useAutoSave.ts` | Auto-save to Supabase on state change |
| `src/types/artifact.ts` | `Section`, `SectionType`, `Artifact` types |

## Verification

This project has no test infrastructure. Verification at each step:
```bash
cd /Users/JonMiller/strata && npm run build
```
Must exit 0 with no TypeScript errors.

---

## Task 1: Create SidebarRail Component

**Files:**
- Create: `src/components/editor/SidebarRail.tsx`

The thin 48px vertical bar that replaces the full sidebar when a section is selected. Shows section numbers with type icons.

**Step 1: Create the component file**

```tsx
// src/components/editor/SidebarRail.tsx
"use client";

import { motion } from "framer-motion";
import type { Section, SectionType } from "@/types/artifact";
import {
  FileText,
  LayoutGrid,
  Clock,
  Table2,
  BarChart3,
  LineChart,
  Network,
  Route,
  Menu,
  type LucideIcon,
} from "lucide-react";

const SECTION_TYPE_ICONS: Record<SectionType, LucideIcon> = {
  "rich-text": FileText,
  "expandable-cards": LayoutGrid,
  timeline: Clock,
  "tier-table": Table2,
  "metric-dashboard": BarChart3,
  "data-viz": LineChart,
  "hub-mockup": Network,
  "guided-journey": Route,
};

interface SidebarRailProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onExpandSidebar: () => void;
}

export function SidebarRail({
  sections,
  selectedSectionId,
  onSelectSection,
  onExpandSidebar,
}: SidebarRailProps) {
  const selectedIndex = sections.findIndex((s) => s.id === selectedSectionId);

  return (
    <div className="w-12 border-r border-white/10 flex flex-col shrink-0 bg-background">
      {/* Expand sidebar button */}
      <button
        onClick={onExpandSidebar}
        className="h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border-b border-white/10"
        aria-label="Expand sidebar"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto py-1">
        <div className="relative">
          {/* Active indicator — slides vertically */}
          {selectedIndex >= 0 && (
            <motion.div
              className="absolute left-0 w-full h-10 bg-accent/10 border-r-2 border-accent"
              initial={false}
              animate={{ y: selectedIndex * 40 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}

          {sections.map((section, index) => {
            const Icon = SECTION_TYPE_ICONS[section.type];
            const isActive = section.id === selectedSectionId;

            return (
              <button
                key={section.id}
                onClick={() => {
                  // Click active section to deselect (exit split view)
                  if (isActive) {
                    onSelectSection("");
                  } else {
                    onSelectSection(section.id);
                  }
                }}
                className={`relative w-full h-10 flex items-center justify-center transition-colors ${
                  isActive
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={`Section ${index + 1}: ${section.title || section.type}`}
                title={section.title || `Section ${index + 1}`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-medium leading-none">
                    {index + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd /Users/JonMiller/strata && npm run build`
Expected: Exit 0, no errors

**Step 3: Commit**

```bash
git add src/components/editor/SidebarRail.tsx
git commit -m "feat: add SidebarRail component for split view editor"
```

---

## Task 2: Create SectionEditorPanel Component

**Files:**
- Create: `src/components/editor/SectionEditorPanel.tsx`

Left panel of split view. Wraps the existing `EditableSectionRenderer` in a scrollable container with a section header.

**Step 1: Create the component file**

```tsx
// src/components/editor/SectionEditorPanel.tsx
"use client";

import { useRef, useEffect } from "react";
import type { Section } from "@/types/artifact";
import { SECTION_TYPE_LABELS } from "@/types/artifact";
import { EditableSectionRenderer } from "./EditableSectionRenderer";

interface SectionEditorPanelProps {
  section: Section;
  sectionIndex: number;
  onFieldChange: (sectionId: string, path: string, value: unknown) => void;
  onReplaceSection: (sectionId: string, updated: Section) => void;
}

export function SectionEditorPanel({
  section,
  sectionIndex,
  onFieldChange,
  onReplaceSection,
}: SectionEditorPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top when switching sections
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [section.id]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="px-6 py-6">
        {/* Section header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-medium text-muted-foreground bg-white/5 px-2 py-1 rounded">
            {sectionIndex + 1}
          </span>
          <span className="text-xs text-muted-foreground">
            {SECTION_TYPE_LABELS[section.type]}
          </span>
        </div>

        {/* Editable section content */}
        <EditableSectionRenderer
          section={section}
          isSelected={true}
          onFieldChange={(path, value) => onFieldChange(section.id, path, value)}
          onReplaceSection={(updated) => onReplaceSection(section.id, updated)}
        />
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd /Users/JonMiller/strata && npm run build`
Expected: Exit 0, no errors

**Step 3: Commit**

```bash
git add src/components/editor/SectionEditorPanel.tsx
git commit -m "feat: add SectionEditorPanel for split view editor"
```

---

## Task 3: Create SectionPreviewPanel Component

**Files:**
- Create: `src/components/editor/SectionPreviewPanel.tsx`

Right panel of split view. Renders the selected section using the viewer's `SectionRenderer` — exactly what the audience sees. Includes a zoom-out toggle button.

**Step 1: Create the component file**

```tsx
// src/components/editor/SectionPreviewPanel.tsx
"use client";

import React, { memo, useRef, useEffect } from "react";
import type { Section, Artifact } from "@/types/artifact";
import { SectionRenderer } from "@/components/viewer/SectionRenderer";
import { Maximize2, Minimize2 } from "lucide-react";

interface SectionPreviewPanelProps {
  section: Section;
  artifact: Artifact;
  isZoomedOut: boolean;
  onToggleZoom: () => void;
  onSelectSection: (id: string) => void;
}

// Memoize to avoid re-renders during rapid typing in the editor panel.
// Shallow comparison on section object — React state updates create new refs
// on every change, so this relies on the parent passing the same section ref
// when nothing changed.
const MemoizedSectionRenderer = memo(SectionRenderer);

export function SectionPreviewPanel({
  section,
  artifact,
  isZoomedOut,
  onToggleZoom,
  onSelectSection,
}: SectionPreviewPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to current section in zoom-out mode
  useEffect(() => {
    if (isZoomedOut && scrollRef.current) {
      const el = scrollRef.current.querySelector(`#preview-section-${section.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [isZoomedOut, section.id]);

  return (
    <div className="flex-1 flex flex-col border-l border-white/10 bg-background/50">
      {/* Panel header */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <span className="text-xs text-muted-foreground font-medium">
          {isZoomedOut ? "Full Document" : "Preview"}
        </span>
        <button
          onClick={onToggleZoom}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={isZoomedOut ? "Zoom in to section" : "Zoom out to full document"}
          title={isZoomedOut ? "Zoom in (Esc)" : "Full document (⌘E)"}
        >
          {isZoomedOut ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Preview content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isZoomedOut ? (
          /* Zoom-out: full document with all sections */
          <div className="px-6 py-8 space-y-12">
            <header className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">{artifact.title}</h1>
              {artifact.subtitle && (
                <p className="mt-1 text-sm text-muted">{artifact.subtitle}</p>
              )}
            </header>
            {artifact.sections.map((s) => (
              <div
                key={s.id}
                id={`preview-section-${s.id}`}
                className={`rounded-lg p-4 cursor-pointer transition-all ${
                  s.id === section.id
                    ? "ring-2 ring-accent/60 bg-accent/5"
                    : "hover:bg-white/[0.02] opacity-60 hover:opacity-80"
                }`}
                onClick={() => {
                  onSelectSection(s.id);
                  onToggleZoom();
                }}
              >
                <MemoizedSectionRenderer section={s} />
              </div>
            ))}
          </div>
        ) : (
          /* Focused: single section preview */
          <div className="px-6 py-8">
            <MemoizedSectionRenderer section={section} />
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd /Users/JonMiller/strata && npm run build`
Expected: Exit 0, no errors

**Step 3: Commit**

```bash
git add src/components/editor/SectionPreviewPanel.tsx
git commit -m "feat: add SectionPreviewPanel with zoom-out toggle"
```

---

## Task 4: Create SplitViewLayout Component

**Files:**
- Create: `src/components/editor/SplitViewLayout.tsx`

Orchestrator component that arranges SidebarRail + SectionEditorPanel + SectionPreviewPanel. Manages zoom state and sidebar overlay.

**Step 1: Create the component file**

```tsx
// src/components/editor/SplitViewLayout.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Section, Artifact } from "@/types/artifact";
import { SidebarRail } from "./SidebarRail";
import { SectionEditorPanel } from "./SectionEditorPanel";
import { SectionPreviewPanel } from "./SectionPreviewPanel";
import { SortableSectionList } from "./SortableSectionList";
import { AddSection } from "./AddSection";
import { AiChatPanel } from "./AiChatPanel";
import { DocumentSettings } from "./DocumentSettings";
import { InlineEditor } from "./InlineEditor";
import type { ChatMessage, ChatScope } from "@/hooks/useAiChat";
import type { SidebarTab } from "./EditorLayout";
import {
  ArrowLeft,
  ImageIcon,
  List,
  Plus,
  Sparkles,
  SlidersHorizontal,
  X as XIcon,
} from "lucide-react";
import Link from "next/link";

const TABS: { id: SidebarTab; label: string; icon: typeof List }[] = [
  { id: "sections", label: "Sections", icon: List },
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
];

interface SplitViewLayoutProps {
  artifact: Artifact;
  selectedSection: Section;
  selectedSectionIndex: number;
  onSelectSection: (id: string) => void;
  onFieldChange: (sectionId: string, path: string, value: unknown) => void;
  onReplaceSection: (sectionId: string, updated: Section) => void;
  // Sidebar overlay props
  onDeleteSection: (id: string) => void;
  onReorderSections: (from: number, to: number) => void;
  onAddSection: (section: Section, position?: number) => void;
  onUpdateArtifactField: <K extends keyof Artifact>(field: K, value: Artifact[K]) => void;
  // AI chat props
  chatMessages: ChatMessage[];
  chatIsLoading: boolean;
  chatScope: ChatScope;
  chatActiveSectionId: string | null;
  onChatSend: (content: string) => void;
  onChatApply: (messageId: string) => void;
  onChatDiscard: (messageId: string) => void;
  onChatClear: () => void;
  // Image upload
  isProcessingImage: boolean;
  onTriggerImageUpload: () => void;
}

export function SplitViewLayout({
  artifact,
  selectedSection,
  selectedSectionIndex,
  onSelectSection,
  onFieldChange,
  onReplaceSection,
  onDeleteSection,
  onReorderSections,
  onAddSection,
  onUpdateArtifactField,
  chatMessages,
  chatIsLoading,
  chatScope,
  chatActiveSectionId,
  onChatSend,
  onChatApply,
  onChatDiscard,
  onChatClear,
  isProcessingImage,
  onTriggerImageUpload,
}: SplitViewLayoutProps) {
  const [isZoomedOut, setIsZoomedOut] = useState(false);
  const [sidebarOverlayOpen, setSidebarOverlayOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>("sections");
  const [showAddSection, setShowAddSection] = useState(false);

  // Close zoom-out when section changes
  useEffect(() => {
    setIsZoomedOut(false);
  }, [selectedSection.id]);

  const handleToggleZoom = useCallback(() => {
    setIsZoomedOut((v) => !v);
  }, []);

  const handleExpandSidebar = useCallback(() => {
    setSidebarOverlayOpen(true);
  }, []);

  const handleCloseSidebarOverlay = useCallback(() => {
    setSidebarOverlayOpen(false);
    setShowAddSection(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+E — toggle zoom
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        handleToggleZoom();
        return;
      }

      // Escape — zoom in, or close sidebar overlay, or exit split view
      if (e.key === "Escape") {
        if (sidebarOverlayOpen) {
          handleCloseSidebarOverlay();
          return;
        }
        if (isZoomedOut) {
          setIsZoomedOut(false);
          return;
        }
        // Exit split view (deselect section)
        onSelectSection("");
        return;
      }

      // Cmd+ArrowUp / Cmd+ArrowDown — navigate sections
      if ((e.metaKey || e.ctrlKey) && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        const sections = artifact.sections;
        const currentIndex = sections.findIndex((s) => s.id === selectedSection.id);
        if (currentIndex < 0) return;

        const nextIndex =
          e.key === "ArrowUp"
            ? Math.max(0, currentIndex - 1)
            : Math.min(sections.length - 1, currentIndex + 1);

        if (nextIndex !== currentIndex) {
          onSelectSection(sections[nextIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    artifact.sections,
    selectedSection.id,
    isZoomedOut,
    sidebarOverlayOpen,
    onSelectSection,
    handleToggleZoom,
    handleCloseSidebarOverlay,
  ]);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Sidebar Rail */}
      <SidebarRail
        sections={artifact.sections}
        selectedSectionId={selectedSection.id}
        onSelectSection={onSelectSection}
        onExpandSidebar={handleExpandSidebar}
      />

      {/* Editor Panel (left ~50%) */}
      <div className="flex-1 min-w-0">
        <SectionEditorPanel
          section={selectedSection}
          sectionIndex={selectedSectionIndex}
          onFieldChange={onFieldChange}
          onReplaceSection={onReplaceSection}
        />
      </div>

      {/* Preview Panel (right ~50%) */}
      <div className="flex-1 min-w-0">
        <SectionPreviewPanel
          section={selectedSection}
          artifact={artifact}
          isZoomedOut={isZoomedOut}
          onToggleZoom={handleToggleZoom}
          onSelectSection={onSelectSection}
        />
      </div>

      {/* Sidebar overlay — slides out from rail */}
      <AnimatePresence>
        {sidebarOverlayOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/30 z-20"
              onClick={handleCloseSidebarOverlay}
            />

            {/* Sidebar panel */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 48 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-0 bottom-0 left-0 w-[280px] lg:w-[320px] bg-background border-r border-white/10 z-30 flex flex-col"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/${artifact.slug}`}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                  <div className="flex-1 min-w-0 text-sm font-semibold">
                    <InlineEditor
                      value={artifact.title}
                      onChange={(v) => onUpdateArtifactField("title", v)}
                    />
                  </div>
                  <button
                    onClick={handleCloseSidebarOverlay}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {artifact.sections.length} section{artifact.sections.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                      activeTab === tab.id
                        ? "text-foreground border-b-2 border-accent"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {activeTab === "sections" && showAddSection ? (
                  <AddSection
                    documentTitle={artifact.title}
                    documentSubtitle={artifact.subtitle}
                    onAdd={(section) => {
                      onAddSection(section);
                      setShowAddSection(false);
                    }}
                    onCancel={() => setShowAddSection(false)}
                  />
                ) : activeTab === "sections" ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-2">
                      <SortableSectionList
                        sections={artifact.sections}
                        selectedSectionId={selectedSection.id}
                        onSelect={(id) => {
                          onSelectSection(id);
                          handleCloseSidebarOverlay();
                        }}
                        onDelete={onDeleteSection}
                        onReorder={onReorderSections}
                      />
                    </div>
                    <div className="p-2 border-t border-white/10 space-y-2">
                      <button
                        onClick={() => setShowAddSection(true)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 text-sm text-muted-foreground hover:border-white/40 hover:text-foreground transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Section
                      </button>
                      <button
                        onClick={() => {
                          onTriggerImageUpload();
                          handleCloseSidebarOverlay();
                        }}
                        disabled={isProcessingImage}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 text-sm text-muted-foreground hover:border-white/40 hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        <ImageIcon className="w-4 h-4" />
                        {isProcessingImage ? "Processing..." : "Add from Image"}
                      </button>
                    </div>
                  </>
                ) : null}

                {activeTab === "ai" && (
                  <AiChatPanel
                    messages={chatMessages}
                    isLoading={chatIsLoading}
                    scope={chatScope}
                    activeSectionId={chatActiveSectionId}
                    activeSectionTitle={selectedSection.title}
                    activeSectionType={selectedSection.type}
                    onSend={onChatSend}
                    onApplySuggestion={onChatApply}
                    onDiscardSuggestion={onChatDiscard}
                    onClearHistory={onChatClear}
                  />
                )}

                {activeTab === "settings" && (
                  <div className="flex-1 overflow-y-auto">
                    <DocumentSettings
                      artifact={artifact}
                      onUpdate={onUpdateArtifactField}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd /Users/JonMiller/strata && npm run build`
Expected: Will likely fail — `SidebarTab` type is not exported from `EditorLayout.tsx` yet, and `ChatMessage`/`ChatScope` types need checking. These will be fixed in Task 5 when integrating.

**Workaround for this step:** Define `SidebarTab` locally in this file instead of importing:

Replace the `import type { SidebarTab } from "./EditorLayout";` line with:
```tsx
type SidebarTab = "sections" | "ai" | "settings";
```

And check that `ChatMessage` and `ChatScope` are exported from `useAiChat.ts`. If not, import them directly:
```tsx
import type { ChatMessage } from "@/hooks/useAiChat";
```

Verify `ChatScope` is exported — if it's not a named export, define it locally:
```tsx
type ChatScope = "section" | "document";
```

After fixes, run build again. Expected: Exit 0.

**Step 3: Commit**

```bash
git add src/components/editor/SplitViewLayout.tsx
git commit -m "feat: add SplitViewLayout orchestrator with keyboard shortcuts"
```

---

## Task 5: Export Required Types from Existing Files

**Files:**
- Modify: `src/hooks/useAiChat.ts` — ensure `ChatMessage` and `ChatScope` types are exported
- Modify: `src/hooks/useEditor.ts` — ensure `SaveStatus` type is exported (already is per TopBar import)

**Step 1: Check and export types from useAiChat.ts**

Read `src/hooks/useAiChat.ts` and verify these types are exported:
- `ChatMessage` (used by SplitViewLayout)
- `ChatScope` (used by SplitViewLayout)

If `ChatScope` is not a named type, it may be inline. In that case, extract it:

```tsx
export type ChatScope = "section" | "document";
```

**Step 2: Verify build**

Run: `cd /Users/JonMiller/strata && npm run build`
Expected: Exit 0

**Step 3: Commit (if changes were needed)**

```bash
git add src/hooks/useAiChat.ts
git commit -m "refactor: export ChatMessage and ChatScope types from useAiChat"
```

---

## Task 6: Integrate Split View into EditorLayout

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx` — main restructure

This is the biggest change. The layout becomes conditional:
- **No section selected:** Render current sidebar + overview (unchanged)
- **Section selected (desktop):** Render `SplitViewLayout` instead
- **Section selected (mobile):** Keep current behavior (handled in Task 7)

**Step 1: Add imports to EditorLayout.tsx**

At the top of the file (after existing imports), add:
```tsx
import { SplitViewLayout } from "./SplitViewLayout";
```

**Step 2: Export the SidebarTab type**

Change line 20 from:
```tsx
type SidebarTab = "sections" | "ai" | "settings";
```
to:
```tsx
export type SidebarTab = "sections" | "ai" | "settings";
```

**Step 3: Add `fileInputRef` trigger function**

After the `handleFileInputChange` callback (~line 203), add:
```tsx
const triggerImageUpload = useCallback(() => {
  fileInputRef.current?.click();
}, []);
```

**Step 4: Restructure the main layout JSX**

The key change is in the `return` statement. The `flex-1 flex overflow-hidden` container (line 363) becomes conditional.

Replace the content between `</div>` (after TopBar, ~line 362) and the final `</div></div>` (lines 683-685) with:

```tsx
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop split view — when section is selected and screen is wide enough */}
        {editor.selectedSectionId && selectedSection ? (
          <div className="hidden lg:flex flex-1">
            <SplitViewLayout
              artifact={editor.artifact}
              selectedSection={selectedSection}
              selectedSectionIndex={editor.artifact.sections.findIndex(
                (s) => s.id === editor.selectedSectionId
              )}
              onSelectSection={(id) => {
                if (id === "") {
                  editor.setSelectedSectionId(null);
                } else {
                  editor.setSelectedSectionId(id);
                }
              }}
              onFieldChange={(sectionId, path, value) =>
                editor.updateSectionField(sectionId, path, value)
              }
              onReplaceSection={(sectionId, updated) =>
                editor.updateSection(sectionId, () => updated)
              }
              onDeleteSection={editor.deleteSection}
              onReorderSections={editor.reorderSections}
              onAddSection={editor.addSection}
              onUpdateArtifactField={editor.updateArtifactField}
              chatMessages={chat.messages}
              chatIsLoading={chat.isLoading}
              chatScope={chat.scope}
              chatActiveSectionId={chat.activeSectionId}
              onChatSend={handleSendMessage}
              onChatApply={handleApplySuggestion}
              onChatDiscard={handleDiscardSuggestion}
              onChatClear={handleClearHistory}
              isProcessingImage={isProcessingImage}
              onTriggerImageUpload={triggerImageUpload}
            />
          </div>
        ) : null}

        {/* Original layout — shown when no section selected, OR on mobile/tablet */}
        <div
          className={`flex-1 flex ${
            editor.selectedSectionId && selectedSection ? "lg:hidden" : ""
          }`}
        >
          {/* EXISTING SIDEBAR CODE — keep exactly as-is (lines 364-483) */}
          {/* ... all existing sidebar JSX ... */}

          {/* EXISTING PREVIEW AREA — keep exactly as-is (lines 485-682) */}
          {/* ... all existing preview area JSX ... */}
        </div>
      </div>
```

**Important:** Do NOT delete the existing sidebar + preview code. Wrap it in the conditional `<div>` that hides on `lg:` screens when split view is active. The existing code continues to serve:
1. Overview mode (no section selected) on all screen sizes
2. Mobile/tablet editing (section selected on small screens)

**Step 5: Ensure the hidden file input is outside the conditional**

The `<input ref={fileInputRef} type="file" ...>` must be rendered regardless of which view is shown. Move it to just inside the outermost `<div>` if it isn't already accessible from both views.

**Step 6: Verify build**

Run: `cd /Users/JonMiller/strata && npm run build`
Expected: Exit 0

**Step 7: Commit**

```bash
git add src/components/editor/EditorLayout.tsx
git commit -m "feat: integrate split view layout into EditorLayout"
```

---

## Task 7: Add Mobile Preview Bottom Sheet

**Files:**
- Modify: `src/components/editor/TopBar.tsx` — add mobile "Preview" button
- Create: `src/components/editor/MobilePreviewSheet.tsx` — bottom sheet component

**Step 1: Create MobilePreviewSheet component**

```tsx
// src/components/editor/MobilePreviewSheet.tsx
"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Section } from "@/types/artifact";
import { SectionRenderer } from "@/components/viewer/SectionRenderer";
import { X as XIcon } from "lucide-react";

interface MobilePreviewSheetProps {
  section: Section | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MobilePreviewSheet({
  section,
  isOpen,
  onClose,
}: MobilePreviewSheetProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && section && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 h-[60vh] bg-background border-t border-white/10 rounded-t-2xl z-50 flex flex-col lg:hidden"
          >
            {/* Handle bar */}
            <div className="flex items-center justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10">
              <span className="text-sm font-medium">Preview</span>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <SectionRenderer section={section} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

**Step 2: Add Preview button to TopBar**

Modify `src/components/editor/TopBar.tsx` to accept an optional mobile preview callback:

```tsx
// Updated TopBar props
interface TopBarProps {
  slug: string;
  saveStatus: SaveStatus;
  isPublished: boolean;
  onPublishToggle: () => void;
  onMobilePreview?: () => void; // New — only shown on mobile when section is selected
}
```

Add the button before the existing "Preview" link in the JSX:

```tsx
{/* Mobile preview button — only on small screens when section selected */}
{onMobilePreview && (
  <button
    onClick={onMobilePreview}
    className="lg:hidden flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
  >
    Preview
  </button>
)}
```

**Step 3: Wire MobilePreviewSheet into EditorLayout**

In `EditorLayout.tsx`, add state and render the sheet:

```tsx
const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
```

Pass to TopBar:
```tsx
onMobilePreview={
  editor.selectedSectionId && selectedSection
    ? () => setMobilePreviewOpen(true)
    : undefined
}
```

Render sheet at the end of the component (before closing `</div>`):
```tsx
<MobilePreviewSheet
  section={selectedSection}
  isOpen={mobilePreviewOpen}
  onClose={() => setMobilePreviewOpen(false)}
/>
```

**Step 4: Verify build**

Run: `cd /Users/JonMiller/strata && npm run build`
Expected: Exit 0

**Step 5: Commit**

```bash
git add src/components/editor/MobilePreviewSheet.tsx src/components/editor/TopBar.tsx src/components/editor/EditorLayout.tsx
git commit -m "feat: add mobile preview bottom sheet with swipe-to-dismiss"
```

---

## Task 8: Add Entry/Exit Animations

**Files:**
- Modify: `src/components/editor/EditorLayout.tsx` — animate transitions between overview and split view

**Step 1: Add Framer Motion transitions to the conditional rendering**

Wrap the split view / overview conditional in `AnimatePresence`:

For the split view entering:
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
  className="hidden lg:flex flex-1"
>
  <SplitViewLayout ... />
</motion.div>
```

For the overview area, add matching exit animation:
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.15 }}
  className={`flex-1 flex ${...}`}
>
  {/* existing sidebar + preview */}
</motion.div>
```

**Step 2: Verify build**

Run: `cd /Users/JonMiller/strata && npm run build`
Expected: Exit 0

**Step 3: Commit**

```bash
git add src/components/editor/EditorLayout.tsx
git commit -m "feat: add enter/exit animations for split view transitions"
```

---

## Task 9: Polish and Edge Cases

**Files:**
- Modify: `src/components/editor/SplitViewLayout.tsx` — handle edge cases
- Modify: `src/components/editor/EditorLayout.tsx` — palette style propagation

**Step 1: Propagate palette CSS to split view**

The `paletteStyle` CSS custom properties are set on the root div in `EditorLayout.tsx`. Since `SplitViewLayout` renders inside this div, the CSS variables cascade down automatically. **No change needed** — just verify palette colors render correctly in the preview panel.

**Step 2: Handle section deletion in split view**

If the user deletes the currently selected section via the sidebar overlay, the split view should exit. In `EditorLayout.tsx`, the existing `selectedSection` computed value will become `null`, which already triggers the overview mode. **No change needed.**

**Step 3: Handle pending AI suggestions in split view**

The `pendingSuggestion` state in `EditorLayout` needs to flow to the editor panel. The `EditableSectionRenderer` inside `SectionEditorPanel` should receive the suggested section data when a pending suggestion exists.

In `EditorLayout.tsx`, update the `selectedSection` passed to `SplitViewLayout`:

```tsx
// Compute the display version of the selected section (with AI suggestion overlay)
const displaySelectedSection = (() => {
  if (!selectedSection) return null;
  if (pendingSuggestion?.type === "section" && pendingSuggestion.sectionData?.id === selectedSection.id) {
    return pendingSuggestion.sectionData;
  }
  return selectedSection;
})();
```

Pass `displaySelectedSection` to `SplitViewLayout` as the `selectedSection` prop for the preview panel, while keeping the original `selectedSection` for the editor panel. This may require splitting the prop into `editorSection` and `previewSection` in `SplitViewLayout`.

**Step 4: Verify build**

Run: `cd /Users/JonMiller/strata && npm run build`
Expected: Exit 0

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: handle AI suggestions and edge cases in split view"
```

---

## Task 10: Visual QA and Final Verification

**Step 1: Start dev server**

```bash
cd /Users/JonMiller/strata && npm run dev
```

**Step 2: Manual QA checklist**

Open `http://localhost:3001/edit/investor-deck?key=b5d6f6d81e78120a` and verify:

- [ ] Overview mode (no section selected) looks identical to before
- [ ] Clicking a section activates split view on desktop (>= 1024px)
- [ ] Sidebar collapses to 48px rail with section type icons
- [ ] Editor panel shows the editable section form
- [ ] Preview panel shows the rendered section (viewer-style)
- [ ] Typing in editor updates preview in real-time
- [ ] Rail click navigates between sections
- [ ] Cmd+Up / Cmd+Down navigates sections
- [ ] Cmd+E toggles zoom-out
- [ ] Zoom-out shows full document with current section highlighted
- [ ] Clicking a section in zoom-out navigates and zooms in
- [ ] Escape exits zoom → then exits split view
- [ ] Rail hamburger menu opens sidebar overlay
- [ ] Sidebar overlay has all tabs (Sections, AI, Settings)
- [ ] Clicking X or backdrop closes sidebar overlay
- [ ] Mobile (< 1024px) shows original layout with no split view
- [ ] Mobile "Preview" button in TopBar opens bottom sheet
- [ ] Bottom sheet renders section correctly
- [ ] Swipe down dismisses bottom sheet
- [ ] Auto-save continues working in split view
- [ ] Palette colors render correctly in preview panel

**Step 3: Production build**

```bash
cd /Users/JonMiller/strata && npm run build
```
Expected: Exit 0

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete split view editor with preview, zoom-out, and mobile support"
```

---

## Summary

| Task | Component | New/Modified | Estimated Complexity |
|------|-----------|-------------|---------------------|
| 1 | SidebarRail | New | Simple |
| 2 | SectionEditorPanel | New | Simple |
| 3 | SectionPreviewPanel | New | Medium |
| 4 | SplitViewLayout | New | Complex |
| 5 | Type exports | Modified | Trivial |
| 6 | EditorLayout integration | Modified | Complex |
| 7 | Mobile preview sheet | New + Modified | Medium |
| 8 | Animations | Modified | Simple |
| 9 | Edge cases | Modified | Medium |
| 10 | QA + verification | — | Manual |

**Total new files:** 4 (`SidebarRail`, `SectionEditorPanel`, `SectionPreviewPanel`, `MobilePreviewSheet`)
**Total new orchestrator:** 1 (`SplitViewLayout`)
**Modified files:** 3 (`EditorLayout.tsx`, `TopBar.tsx`, `useAiChat.ts`)
**Database changes:** None
**New dependencies:** None

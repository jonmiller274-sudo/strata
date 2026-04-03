"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Section, Artifact } from "@/types/artifact";
import type { ChatMessage, ChatScope } from "@/hooks/useAiChat";
import { SidebarRail } from "./SidebarRail";
import { SectionEditorPanel } from "./SectionEditorPanel";
import { SectionPreviewPanel } from "./SectionPreviewPanel";
import { SortableSectionList } from "./SortableSectionList";
import { AddSection } from "./AddSection";
import { AiChatPanel } from "./AiChatPanel";
import { DocumentSettings } from "./DocumentSettings";
import { InlineEditor } from "./InlineEditor";
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

type SidebarTab = "sections" | "ai" | "settings";

const TABS: { id: SidebarTab; label: string; icon: typeof List }[] = [
  { id: "sections", label: "Sections", icon: List },
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
];

interface SplitViewLayoutProps {
  artifact: Artifact;
  selectedSection: Section;
  previewSection?: Section; // With AI suggestion overlay, if any
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
  previewSection,
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
  const [insertAtPosition, setInsertAtPosition] = useState<number | null>(null);

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
    setInsertAtPosition(null);
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
          section={previewSection ?? selectedSection}
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
                      onAddSection(section, insertAtPosition ?? undefined);
                      setShowAddSection(false);
                      setInsertAtPosition(null);
                    }}
                    onCancel={() => { setShowAddSection(false); setInsertAtPosition(null); }}
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
                        onInsertAt={(pos) => {
                          setInsertAtPosition(pos);
                          setShowAddSection(true);
                        }}
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

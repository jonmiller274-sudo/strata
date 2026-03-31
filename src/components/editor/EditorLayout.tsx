"use client";

import { useEffect, useState, useRef } from "react";
import type { Artifact, Section } from "@/types/artifact";
import { useEditor } from "@/hooks/useEditor";
import { useAutoSave } from "@/hooks/useAutoSave";
import { TopBar } from "./TopBar";
import { SortableSectionList } from "./SortableSectionList";
import { EditableSectionRenderer } from "./EditableSectionRenderer";
import { AiCommand } from "./AiCommand";
import { AddSection } from "./AddSection";
import { InlineEditor } from "./InlineEditor";
import { DocumentSettings } from "./DocumentSettings";
import { DocumentAiCommand, type DocumentAiSuggestion } from "./DocumentAiCommand";
import { ArrowLeft, List, Sparkles, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

type SidebarTab = "sections" | "ai" | "settings";

const TABS: { id: SidebarTab; label: string; icon: typeof List }[] = [
  { id: "sections", label: "Sections", icon: List },
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
];

export function EditorLayout({ initialArtifact }: { initialArtifact: Artifact }) {
  const editor = useEditor(initialArtifact);
  const [aiLoadingSectionId, setAiLoadingSectionId] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{ sectionId: string; section: Section } | null>(null);
  const [showAiOriginal, setShowAiOriginal] = useState(false);
  const autoSave = useAutoSave(editor.artifact, editor.saveStatus, editor.setSaveStatus);
  const [activeTab, setActiveTab] = useState<SidebarTab>("sections");

  // Document-level AI state
  const [docAiSuggestion, setDocAiSuggestion] = useState<DocumentAiSuggestion | null>(null);
  const [showDocAiOriginal, setShowDocAiOriginal] = useState(false);
  const originalArtifactRef = useRef<Artifact | null>(null);

  useEffect(() => {
    if (!editor.selectedSectionId) return;
    const el = document.getElementById(`preview-${editor.selectedSectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editor.selectedSectionId]);

  const paletteStyle: React.CSSProperties = editor.artifact.branding?.palette
    ? ({
        "--palette-accent1": editor.artifact.branding.palette.accent1 ?? "var(--color-accent)",
        "--palette-accent2": editor.artifact.branding.palette.accent2 ?? "var(--color-accent)",
        "--palette-accent3": editor.artifact.branding.palette.accent3 ?? "var(--color-warning)",
        "--palette-accent4": editor.artifact.branding.palette.accent4 ?? "var(--color-danger)",
        "--palette-accent5": editor.artifact.branding.palette.accent5 ?? "var(--color-success)",
      } as React.CSSProperties)
    : {};

  const selectedSection = editor.selectedSectionId
    ? editor.artifact.sections.find((s) => s.id === editor.selectedSectionId) ?? null
    : null;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground" style={paletteStyle}>
      <TopBar
        slug={editor.artifact.slug}
        saveStatus={editor.saveStatus}
        isPublished={editor.artifact.is_published}
        onPublishToggle={async () => {
          editor.updateArtifactField("is_published", !editor.artifact.is_published);
          await autoSave.save();
        }}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* ---- Sidebar (360px) ---- */}
        <div className="w-[360px] border-r border-white/10 flex flex-col shrink-0">
          {/* Zone 1: Top bar — back + editable title */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/${editor.artifact.slug}`}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex-1 min-w-0 text-sm font-semibold">
                <InlineEditor
                  value={editor.artifact.title}
                  onChange={(v) => editor.updateArtifactField("title", v)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              {editor.artifact.sections.length} section{editor.artifact.sections.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Tab bar */}
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

          {/* Zone 2: Main panel — tab content */}
          <div className="flex-1 overflow-y-auto">
            {/* Sections tab */}
            {activeTab === "sections" && (
              <div className="p-2">
                <SortableSectionList
                  sections={editor.artifact.sections}
                  selectedSectionId={editor.selectedSectionId}
                  onSelect={editor.setSelectedSectionId}
                  onDelete={editor.deleteSection}
                  onReorder={editor.reorderSections}
                />
              </div>
            )}

            {/* AI tab — existing AI commands (replaced by chat panel in Task 1.4) */}
            {activeTab === "ai" && (
              <div className="p-3 space-y-4">
                {/* Document-level AI */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Document AI</p>
                  <DocumentAiCommand
                    artifact={editor.artifact}
                    onSuggestion={(suggestion) => {
                      originalArtifactRef.current = { ...editor.artifact };
                      setDocAiSuggestion(suggestion);
                      setShowDocAiOriginal(false);
                    }}
                    onApply={(suggestion) => {
                      editor.mergeArtifact({
                        title: suggestion.title,
                        subtitle: suggestion.subtitle,
                        sections: suggestion.sections,
                      });
                      setDocAiSuggestion(null);
                      setShowDocAiOriginal(false);
                      originalArtifactRef.current = null;
                    }}
                    onToggleOriginal={() => setShowDocAiOriginal((prev) => !prev)}
                    onClearSuggestion={() => {
                      setDocAiSuggestion(null);
                      setShowDocAiOriginal(false);
                      originalArtifactRef.current = null;
                    }}
                  />
                </div>

                {/* Section-level AI */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Section AI</p>
                  {selectedSection ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Editing: <span className="text-foreground font-medium">{selectedSection.title}</span>
                      </p>
                      <AiCommand
                        key={editor.selectedSectionId}
                        section={selectedSection}
                        onApply={(rewritten) =>
                          editor.updateSection(editor.selectedSectionId!, () => rewritten)
                        }
                        onLoadingChange={(loading) =>
                          setAiLoadingSectionId(loading ? editor.selectedSectionId : null)
                        }
                        onSuggestion={(suggestion) =>
                          setAiSuggestion({ sectionId: editor.selectedSectionId!, section: suggestion })
                        }
                        onToggleOriginal={() => setShowAiOriginal(!showAiOriginal)}
                        onClearSuggestion={() => {
                          setAiSuggestion(null);
                          setShowAiOriginal(false);
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      Select a section to use AI editing
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Settings tab */}
            {activeTab === "settings" && (
              <DocumentSettings
                artifact={editor.artifact}
                onUpdate={editor.updateArtifactField}
              />
            )}
          </div>

          {/* Zone 3: Footer — Add Section (always visible) */}
          <div className="p-2 border-t border-white/10">
            <AddSection
              documentTitle={editor.artifact.title}
              documentSubtitle={editor.artifact.subtitle}
              onAdd={(section) => editor.addSection(section)}
            />
          </div>
        </div>

        {/* ---- Preview panel ---- */}
        <div className="flex-1 overflow-y-auto" id="editor-preview">
          <div className="mx-auto max-w-4xl px-6 py-12">
            {/* Document header in preview */}
            <header className="mb-12">
              <h1 className="text-3xl font-bold tracking-tight">
                {docAiSuggestion && !showDocAiOriginal ? (
                  docAiSuggestion.title
                ) : (
                  <InlineEditor
                    value={editor.artifact.title}
                    onChange={(v) => editor.updateArtifactField("title", v)}
                  />
                )}
              </h1>
              <p className="mt-2 text-lg text-muted">
                {docAiSuggestion && !showDocAiOriginal ? (
                  docAiSuggestion.subtitle || ""
                ) : (
                  <InlineEditor
                    value={editor.artifact.subtitle || ""}
                    onChange={(v) => editor.updateArtifactField("subtitle", v)}
                    placeholder="Add subtitle..."
                  />
                )}
              </p>
            </header>
            {/* Sections */}
            <div className="space-y-16">
              {editor.artifact.sections.map((section, index) => {
                const docSuggestionSection =
                  docAiSuggestion && !showDocAiOriginal
                    ? docAiSuggestion.sections[index]
                    : null;

                const displaySection =
                  docSuggestionSection ??
                  (aiSuggestion?.sectionId === section.id && !showAiOriginal
                    ? aiSuggestion.section
                    : section);

                return (
                  <div
                    key={section.id}
                    id={`preview-${section.id}`}
                    className={`relative transition-opacity duration-200 ${
                      editor.selectedSectionId && editor.selectedSectionId !== section.id
                        ? "opacity-50"
                        : "opacity-100"
                    }`}
                    onClick={() => editor.setSelectedSectionId(section.id)}
                  >
                    <EditableSectionRenderer
                      section={displaySection}
                      onFieldChange={(path, value) =>
                        editor.updateSectionField(section.id, path, value)
                      }
                    />
                    {aiLoadingSectionId === section.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse rounded-lg" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

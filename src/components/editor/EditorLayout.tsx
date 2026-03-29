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

export function EditorLayout({ initialArtifact }: { initialArtifact: Artifact }) {
  const editor = useEditor(initialArtifact);
  const [aiLoadingSectionId, setAiLoadingSectionId] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{ sectionId: string; section: Section } | null>(null);
  const [showAiOriginal, setShowAiOriginal] = useState(false);
  const autoSave = useAutoSave(editor.artifact, editor.saveStatus, editor.setSaveStatus);

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

  return (
    <div className="h-screen flex flex-col bg-background text-foreground" style={paletteStyle}>
      <TopBar
        slug={editor.artifact.slug}
        title={docAiSuggestion && !showDocAiOriginal ? docAiSuggestion.title : editor.artifact.title}
        saveStatus={editor.saveStatus}
        isPublished={editor.artifact.is_published}
        onPublishToggle={async () => {
          editor.updateArtifactField("is_published", !editor.artifact.is_published);
          // Save immediately — don't wait for debounce
          await autoSave.save();
        }}
        documentAiSlot={
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
        }
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[300px] border-r border-white/10 overflow-y-auto flex flex-col">
          {/* Left panel header */}
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

          {/* Section list */}
          <div className="flex-1 overflow-y-auto p-2">
            <SortableSectionList
              sections={editor.artifact.sections}
              selectedSectionId={editor.selectedSectionId}
              onSelect={editor.setSelectedSectionId}
              onDelete={editor.deleteSection}
              onReorder={editor.reorderSections}
            />
          </div>

          {/* AI Command for selected section */}
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
            );
          })()}

          {/* Add Section */}
          <div className="p-2 border-t border-white/10">
            <AddSection
              documentTitle={editor.artifact.title}
              documentSubtitle={editor.artifact.subtitle}
              onAdd={(section) => editor.addSection(section)}
            />
          </div>
        </div>
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
                // Document-level AI suggestion takes precedence over section-level
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

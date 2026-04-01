"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Artifact, Section } from "@/types/artifact";
import { useEditor } from "@/hooks/useEditor";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useAiChat, type ChatSuggestion } from "@/hooks/useAiChat";
import { TopBar } from "./TopBar";
import { SortableSectionList } from "./SortableSectionList";
import { EditableSectionRenderer } from "./EditableSectionRenderer";
import { AiChatPanel } from "./AiChatPanel";
import { AddSection } from "./AddSection";
import { InlineEditor } from "./InlineEditor";
import { DocumentSettings } from "./DocumentSettings";
import { FirstEditHint } from "./FirstEditHint";
import { ArrowLeft, List, Menu, Plus, Sparkles, SlidersHorizontal, X as XIcon } from "lucide-react";
import Link from "next/link";

type SidebarTab = "sections" | "ai" | "settings";

const TABS: { id: SidebarTab; label: string; icon: typeof List }[] = [
  { id: "sections", label: "Sections", icon: List },
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
];

interface PendingSuggestion {
  messageId: string;
  type: "section" | "document";
  sectionData?: Section;
  documentData?: { title: string; subtitle?: string; sections: Section[] };
}

export function EditorLayout({ initialArtifact }: { initialArtifact: Artifact }) {
  const editor = useEditor(initialArtifact);
  const autoSave = useAutoSave(editor.artifact, editor.saveStatus, editor.setSaveStatus);
  const chat = useAiChat();
  const [activeTab, setActiveTab] = useState<SidebarTab>("sections");
  const [showAddSection, setShowAddSection] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<PendingSuggestion | null>(null);

  useEffect(() => {
    if (!editor.selectedSectionId) return;
    const el = document.getElementById(`preview-${editor.selectedSectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editor.selectedSectionId]);

  useEffect(() => {
    if (editor.selectedSectionId) {
      chat.setScopeAndSection("section", editor.selectedSectionId);
    } else {
      chat.setScopeAndSection("document", null);
    }
    chat.clearHistory();
    setPendingSuggestion(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSendMessage = useCallback(
    async (content: string) => {
      chat.addUserMessage(content);
      chat.setIsLoading(true);

      const existingMessages = chat.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const apiMessages = [...existingMessages, { role: "user" as const, content }];

      const context =
        editor.selectedSectionId && selectedSection
          ? { scope: "section" as const, section: selectedSection }
          : {
              scope: "document" as const,
              artifact: {
                title: editor.artifact.title,
                subtitle: editor.artifact.subtitle,
                sections: editor.artifact.sections,
              },
            };

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, context }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Request failed (${res.status})`);
        }

        const data = await res.json();

        if (data.suggestion) {
          const suggestion: ChatSuggestion = {
            type: data.suggestion.type,
            sectionId: editor.selectedSectionId ?? undefined,
            data: data.suggestion.data,
            status: "pending",
          };
          const msg = chat.addAssistantMessage(data.message, suggestion);

          if (suggestion.type === "section") {
            setPendingSuggestion({
              messageId: msg.id,
              type: "section",
              sectionData: data.suggestion.data as Section,
            });
          } else {
            setPendingSuggestion({
              messageId: msg.id,
              type: "document",
              documentData: data.suggestion.data as PendingSuggestion["documentData"],
            });
          }
        } else {
          chat.addAssistantMessage(data.message);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        chat.addAssistantMessage(`Sorry, something went wrong: ${errorMsg}`);
      } finally {
        chat.setIsLoading(false);
      }
    },
    [chat, editor, selectedSection]
  );

  const handleApplySuggestion = useCallback(
    (messageId: string) => {
      if (!pendingSuggestion || pendingSuggestion.messageId !== messageId) return;

      if (pendingSuggestion.type === "section" && pendingSuggestion.sectionData) {
        const sectionData = pendingSuggestion.sectionData;
        editor.updateSection(sectionData.id, () => sectionData);
      } else if (pendingSuggestion.type === "document" && pendingSuggestion.documentData) {
        editor.mergeArtifact(pendingSuggestion.documentData);
      }

      chat.updateSuggestionStatus(messageId, "applied");
      setPendingSuggestion(null);
    },
    [pendingSuggestion, editor, chat]
  );

  const handleDiscardSuggestion = useCallback(
    (messageId: string) => {
      chat.updateSuggestionStatus(messageId, "discarded");
      if (pendingSuggestion?.messageId === messageId) {
        setPendingSuggestion(null);
      }
    },
    [pendingSuggestion, chat]
  );

  const handleClearHistory = useCallback(() => {
    chat.clearHistory();
    setPendingSuggestion(null);
  }, [chat]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground" style={paletteStyle}>
      <div className="relative">
        <TopBar
          slug={editor.artifact.slug}
          saveStatus={editor.saveStatus}
          isPublished={editor.artifact.is_published}
          onPublishToggle={async () => {
            editor.updateArtifactField("is_published", !editor.artifact.is_published);
            await autoSave.save();
          }}
        />
        {/* Mobile sidebar toggle — visible below md breakpoint */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <XIcon className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div
          className={`w-[280px] lg:w-[360px] border-r border-white/10 flex flex-col shrink-0 ${
            sidebarOpen ? "flex" : "hidden"
          } md:flex`}
        >
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

          <div className="flex-1 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-y-auto flex flex-col"
              >
                {activeTab === "sections" && showAddSection ? (
                  <AddSection
                    documentTitle={editor.artifact.title}
                    documentSubtitle={editor.artifact.subtitle}
                    onAdd={(section) => {
                      editor.addSection(section);
                      setShowAddSection(false);
                    }}
                    onCancel={() => setShowAddSection(false)}
                  />
                ) : activeTab === "sections" ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-2">
                      <SortableSectionList
                        sections={editor.artifact.sections}
                        selectedSectionId={editor.selectedSectionId}
                        onSelect={editor.setSelectedSectionId}
                        onDelete={editor.deleteSection}
                        onReorder={editor.reorderSections}
                      />
                    </div>
                    <div className="p-2 border-t border-white/10">
                      <button
                        onClick={() => setShowAddSection(true)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 text-sm text-muted-foreground hover:border-white/40 hover:text-foreground transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Section
                      </button>
                    </div>
                  </>
                ) : null}

                {activeTab === "ai" && (
                  <AiChatPanel
                    messages={chat.messages}
                    isLoading={chat.isLoading}
                    scope={chat.scope}
                    activeSectionId={chat.activeSectionId}
                    activeSectionTitle={selectedSection?.title ?? null}
                    activeSectionType={selectedSection?.type ?? null}
                    onSend={handleSendMessage}
                    onApplySuggestion={handleApplySuggestion}
                    onDiscardSuggestion={handleDiscardSuggestion}
                    onClearHistory={handleClearHistory}
                  />
                )}

                {activeTab === "settings" && (
                  <div className="flex-1 overflow-y-auto">
                    <DocumentSettings
                      artifact={editor.artifact}
                      onUpdate={editor.updateArtifactField}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" id="editor-preview">
          <div className="mx-auto max-w-4xl px-6 py-12">
            <header className="mb-12">
              <div className="relative"><FirstEditHint /><h1 className="text-3xl font-bold tracking-tight">
                {pendingSuggestion?.type === "document" && pendingSuggestion.documentData ? (
                  pendingSuggestion.documentData.title
                ) : (
                  <InlineEditor
                    value={editor.artifact.title}
                    onChange={(v) => editor.updateArtifactField("title", v)}
                  />
                )}
              </h1></div>
              <p className="mt-2 text-lg text-muted">
                {pendingSuggestion?.type === "document" && pendingSuggestion.documentData ? (
                  pendingSuggestion.documentData.subtitle || ""
                ) : (
                  <InlineEditor
                    value={editor.artifact.subtitle || ""}
                    onChange={(v) => editor.updateArtifactField("subtitle", v)}
                    placeholder="Add subtitle..."
                  />
                )}
              </p>
            </header>
            <div className="space-y-16">
              {editor.artifact.sections.map((section, index) => {
                const docSuggestionSection =
                  pendingSuggestion?.type === "document" && pendingSuggestion.documentData
                    ? pendingSuggestion.documentData.sections[index]
                    : null;

                const sectionSuggestion =
                  pendingSuggestion?.type === "section" &&
                  pendingSuggestion.sectionData?.id === section.id
                    ? pendingSuggestion.sectionData
                    : null;

                const displaySection = docSuggestionSection ?? sectionSuggestion ?? section;

                return (
                  <div
                    key={section.id}
                    id={`preview-${section.id}`}
                    className={`relative transition-opacity duration-200 rounded-xl ${
                      editor.selectedSectionId && editor.selectedSectionId !== section.id
                        ? "opacity-75"
                        : editor.selectedSectionId === section.id
                        ? "opacity-100 ring-1 ring-accent/50"
                        : "opacity-100"
                    }`}
                    onClick={() => editor.setSelectedSectionId(section.id)}
                  >
                    <EditableSectionRenderer
                      section={displaySection}
                      isSelected={editor.selectedSectionId === section.id}
                      onFieldChange={(path, value) =>
                        editor.updateSectionField(section.id, path, value)
                      }
                    />
                    {chat.isLoading && editor.selectedSectionId === section.id && (
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

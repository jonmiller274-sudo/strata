"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { SplitViewLayout } from "./SplitViewLayout";
import { MobilePreviewSheet } from "./MobilePreviewSheet";
import { ArrowLeft, ImageIcon, List, Loader2, Menu, Plus, Sparkles, SlidersHorizontal, X as XIcon } from "lucide-react";
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

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export function EditorLayout({ initialArtifact }: { initialArtifact: Artifact }) {
  const editor = useEditor(initialArtifact);
  const autoSave = useAutoSave(editor.artifact, editor.saveStatus, editor.setSaveStatus);
  const chat = useAiChat();
  const [activeTab, setActiveTab] = useState<SidebarTab>("sections");
  const [showAddSection, setShowAddSection] = useState(false);
  const [insertAtPosition, setInsertAtPosition] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<PendingSuggestion | null>(null);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // --- Image drop zone state ---
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [pendingImageIndex, setPendingImageIndex] = useState<number | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const processImageFile = useCallback(
    async (file: File, insertIndex: number) => {
      // Guard: only one image at a time
      if (isProcessingImage) return;

      // Validate type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setImageError("Only PNG, JPEG, and WebP images are supported.");
        return;
      }
      // Validate size
      if (file.size > MAX_IMAGE_SIZE) {
        setImageError("Image must be under 5MB.");
        return;
      }

      setImageError(null);
      setIsProcessingImage(true);
      setPendingImageIndex(insertIndex);

      // Set up abort controller for cancellation
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Show preview while uploading
      const previewUrl = URL.createObjectURL(file);
      setPendingImagePreview(previewUrl);

      // Generate a section ID upfront so we can use it for the storage path
      const sectionId = `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      try {
        // Upload image to Supabase Storage via our API route
        const urlKey = new URLSearchParams(window.location.search).get("key");
        const apiUrl = urlKey
          ? `/api/upload/image?key=${encodeURIComponent(urlKey)}`
          : "/api/upload/image";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("artifactId", editor.artifact.id);
        formData.append("sectionId", sectionId);

        const res = await fetch(apiUrl, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed (${res.status})`);
        }

        const { url: imageUrl } = await res.json();

        // Create a rich-text section with the image URL and empty content
        const newSection: Section = {
          id: sectionId,
          type: "rich-text",
          title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          subtitle: "",
          image_url: imageUrl,
          content: {
            summary: "",
          },
        };

        editor.addSection(newSection, insertIndex);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // User cancelled — silently ignore
        } else {
          const msg = err instanceof Error ? err.message : "Failed to upload image";
          setImageError(msg);
        }
      } finally {
        URL.revokeObjectURL(previewUrl);
        abortControllerRef.current = null;
        setIsProcessingImage(false);
        setPendingImageIndex(null);
        setPendingImagePreview(null);
      }
    },
    [editor, isProcessingImage]
  );

  const getDropIndex = useCallback(
    (clientY: number) => {
      const sections = editor.artifact.sections;
      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(`preview-${sections[i].id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (clientY < rect.top + rect.height / 2) return i;
        }
      }
      return sections.length;
    },
    [editor.artifact.sections]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setDropTargetIndex(getDropIndex(e.clientY));
    },
    [getDropIndex]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if leaving the container entirely
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    const currentTarget = e.currentTarget as HTMLElement;
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      setDropTargetIndex(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDropTargetIndex(null);

      if (isProcessingImage) return;

      const insertIndex = dropTargetIndex ?? editor.artifact.sections.length;
      const file = e.dataTransfer.files[0];
      if (file) {
        processImageFile(file, insertIndex);
      }
    },
    [dropTargetIndex, editor.artifact.sections.length, processImageFile, isProcessingImage]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processImageFile(file, editor.artifact.sections.length);
      }
      // Reset so same file can be re-selected
      e.target.value = "";
    },
    [editor.artifact.sections.length, processImageFile]
  );

  const triggerImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

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

  // Version of selected section with AI suggestion overlaid (for preview panel)
  const previewSelectedSection = (() => {
    if (!selectedSection) return null;
    if (
      pendingSuggestion?.type === "section" &&
      pendingSuggestion.sectionData?.id === selectedSection.id
    ) {
      return pendingSuggestion.sectionData;
    }
    return selectedSection;
  })();

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
          onMobilePreview={
            editor.selectedSectionId && selectedSection
              ? () => setMobilePreviewOpen(true)
              : undefined
          }
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
        {/* Desktop split view — when section is selected and screen is wide enough */}
        {editor.selectedSectionId && selectedSection ? (
          <motion.div
            key="split-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:flex flex-1"
          >
            <SplitViewLayout
              artifact={editor.artifact}
              selectedSection={selectedSection}
              previewSection={previewSelectedSection ?? undefined}
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
          </motion.div>
        ) : null}

        {/* Original layout — shown when no section selected, OR on mobile/tablet */}
        <div
          className={`flex-1 flex ${
            editor.selectedSectionId && selectedSection ? "lg:hidden" : ""
          }`}
        >
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
                      editor.addSection(section, insertAtPosition ?? undefined);
                      setShowAddSection(false);
                      setInsertAtPosition(null);
                    }}
                    onCancel={() => { setShowAddSection(false); setInsertAtPosition(null); }}
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
                        onClick={() => fileInputRef.current?.click()}
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

        <div
          className={`flex-1 overflow-y-auto relative ${
            dropTargetIndex !== null ? "ring-2 ring-accent/30 ring-inset" : ""
          }`}
          id="editor-preview"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Hidden file input for "Add from Image" button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* Image error toast */}
          {imageError && (
            <div className="sticky top-0 z-20 mx-auto max-w-4xl px-6 pt-3">
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
                <span className="flex-1">{imageError}</span>
                <button onClick={() => setImageError(null)} className="text-red-400/60 hover:text-red-400">
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

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
                  <div key={section.id}>
                    {/* Drop indicator line — shown before this section */}
                    {dropTargetIndex === index && (
                      <div className="flex items-center gap-2 py-2">
                        <div className="flex-1 h-0.5 bg-accent rounded-full" />
                        <span className="text-xs text-accent font-medium whitespace-nowrap">
                          <ImageIcon className="w-3 h-3 inline mr-1" />
                          Drop image here
                        </span>
                        <div className="flex-1 h-0.5 bg-accent rounded-full" />
                      </div>
                    )}

                    {/* Image processing placeholder — shown at this position */}
                    {isProcessingImage && pendingImageIndex === index && (
                      <div className="relative rounded-xl border border-dashed border-accent/40 bg-accent/5 p-8 mb-8 overflow-hidden">
                        {pendingImagePreview && (
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-10"
                            style={{ backgroundImage: `url(${pendingImagePreview})` }}
                          />
                        )}
                        <div className="relative flex flex-col items-center gap-3 text-center">
                          <Loader2 className="w-6 h-6 text-accent animate-spin" />
                          <p className="text-sm text-muted-foreground">Uploading image...</p>
                          <button
                            onClick={() => {
                              abortControllerRef.current?.abort();
                              abortControllerRef.current = null;
                              setIsProcessingImage(false);
                              setPendingImageIndex(null);
                              setPendingImagePreview(null);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                        {/* Shimmer animation */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                      </div>
                    )}

                    <div
                      id={`preview-${section.id}`}
                      className={`relative transition-opacity duration-200 rounded-xl p-6 ${
                        index > 0 ? "border-t border-white/[0.06] pt-10" : ""
                      } ${
                        editor.selectedSectionId && editor.selectedSectionId !== section.id
                          ? "opacity-75"
                          : editor.selectedSectionId === section.id
                          ? "opacity-100 ring-1 ring-accent/50 bg-white/[0.02]"
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
                        onReplaceSection={(updated) =>
                          editor.updateSection(section.id, () => updated)
                        }
                      />
                      {chat.isLoading && editor.selectedSectionId === section.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse rounded-lg" />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Drop indicator at end of sections */}
              {dropTargetIndex === editor.artifact.sections.length && (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex-1 h-0.5 bg-accent rounded-full" />
                  <span className="text-xs text-accent font-medium whitespace-nowrap">
                    <ImageIcon className="w-3 h-3 inline mr-1" />
                    Drop image here
                  </span>
                  <div className="flex-1 h-0.5 bg-accent rounded-full" />
                </div>
              )}

              {/* Image processing placeholder at end */}
              {isProcessingImage && pendingImageIndex === editor.artifact.sections.length && (
                <div className="relative rounded-xl border border-dashed border-accent/40 bg-accent/5 p-8 overflow-hidden">
                  {pendingImagePreview && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-10"
                      style={{ backgroundImage: `url(${pendingImagePreview})` }}
                    />
                  )}
                  <div className="relative flex flex-col items-center gap-3 text-center">
                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading image...</p>
                    <button
                      onClick={() => {
                        setIsProcessingImage(false);
                        setPendingImageIndex(null);
                        setPendingImagePreview(null);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                </div>
              )}

              {/* Persistent drop hint — always visible when not processing */}
              {!isProcessingImage && dropTargetIndex === null && (
                <div
                  className="mt-8 flex items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 py-6 cursor-pointer transition-colors group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  <span className="text-sm text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                    Drop a screenshot here or click to add a section from an image
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>{/* close original layout wrapper */}
      </div>

      {/* Mobile preview bottom sheet */}
      <MobilePreviewSheet
        section={selectedSection}
        isOpen={mobilePreviewOpen}
        onClose={() => setMobilePreviewOpen(false)}
      />
    </div>
  );
}

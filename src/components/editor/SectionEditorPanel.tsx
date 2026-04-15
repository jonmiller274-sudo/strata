"use client";

import { useState, useRef, useEffect } from "react";
import type { Section } from "@/types/artifact";
import { SECTION_TYPE_LABELS } from "@/types/artifact";
import { EditableSectionRenderer } from "./EditableSectionRenderer";
import { TypeSelectorDropdown } from "./TypeSelectorDropdown";
import { Sparkles, Loader2 } from "lucide-react";

interface SectionEditorPanelProps {
  section: Section;
  sectionIndex: number;
  onFieldChange: (sectionId: string, path: string, value: unknown) => void;
  onReplaceSection: (sectionId: string, updated: Section) => void;
  onPendingPreview?: (section: Section | null) => void;
}

export function SectionEditorPanel({
  section,
  sectionIndex,
  onFieldChange,
  onReplaceSection,
  onPendingPreview,
}: SectionEditorPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pendingRemap, setPendingRemap] = useState<Section | null>(null);
  const [isRemapping, setIsRemapping] = useState(false);

  // Scroll to top when switching sections
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [section.id]);

  // Clear pending remap when section changes
  useEffect(() => {
    setPendingRemap(null);
    onPendingPreview?.(null);
  }, [section.id, onPendingPreview]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="px-6 py-6">
        {/* Section header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-medium text-muted-foreground bg-white/5 px-2 py-1 rounded">
            {sectionIndex + 1}
          </span>
          <TypeSelectorDropdown
            section={section}
            onTypeChange={(remapped) => {
              setPendingRemap(remapped);
              onPendingPreview?.(remapped);
            }}
            onLoadingChange={setIsRemapping}
          />
        </div>

        {/* Confirm/cancel bar for pending type change */}
        {pendingRemap && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <Sparkles className="w-4 h-4 text-accent shrink-0" />
            <span className="text-xs text-foreground flex-1">
              Preview: <strong>{SECTION_TYPE_LABELS[pendingRemap.type]}</strong>
            </span>
            <button
              onClick={() => {
                onReplaceSection(section.id, pendingRemap);
                setPendingRemap(null);
                onPendingPreview?.(null);
              }}
              className="px-3 py-1 rounded text-xs font-medium bg-accent text-white hover:bg-accent/80 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setPendingRemap(null);
                onPendingPreview?.(null);
              }}
              className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Editable section content */}
        {isRemapping ? (
          <div className="space-y-3 animate-pulse" aria-label="Converting section type" aria-busy="true">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Remapping content...</span>
            </div>
            <div className="h-6 bg-white/5 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-full" />
            <div className="h-4 bg-white/5 rounded w-5/6" />
            <div className="h-4 bg-white/5 rounded w-4/5" />
            <div className="h-20 bg-white/5 rounded w-full mt-4" />
            <div className="h-4 bg-white/5 rounded w-2/3" />
            <div className="h-4 bg-white/5 rounded w-3/4" />
          </div>
        ) : (
          <EditableSectionRenderer
            section={section}
            isSelected={true}
            onFieldChange={(path, value) => onFieldChange(section.id, path, value)}
            onReplaceSection={(updated) => onReplaceSection(section.id, updated)}
          />
        )}
      </div>
    </div>
  );
}

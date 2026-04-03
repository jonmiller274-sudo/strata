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

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
          title={isZoomedOut ? "Zoom in (Esc)" : "Full document (\u2318E)"}
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
                    : "hover:bg-white/5 opacity-60 hover:opacity-80"
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

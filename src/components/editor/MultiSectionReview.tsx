"use client";

import { useState } from "react";
import type { Section } from "@/types/artifact";
import { SECTION_TYPE_LABELS } from "@/types/artifact";
import { ArrowLeft, Check, RefreshCw } from "lucide-react";

function getSectionPreview(section: Section): string {
  const c = section.content;
  if ("summary" in c && typeof c.summary === "string") return c.summary;
  if ("cards" in c && Array.isArray(c.cards) && c.cards[0]?.summary) return c.cards[0].summary;
  if ("steps" in c && Array.isArray(c.steps) && c.steps[0]?.description) return c.steps[0].description;
  if ("metrics" in c && Array.isArray(c.metrics) && c.metrics[0]?.label) return c.metrics.map((m: { label: string }) => m.label).join(", ");
  if ("events" in c && Array.isArray(c.events) && c.events[0]?.description) return c.events[0].description;
  if ("description" in c && typeof c.description === "string") return c.description;
  return "";
}

interface MultiSectionReviewProps {
  sections: Section[];
  onConfirm: (selected: Section[]) => void;
  onCancel: () => void;
  onRegenerate: () => void;
}

export function MultiSectionReview({
  sections,
  onConfirm,
  onCancel,
  onRegenerate,
}: MultiSectionReviewProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(sections.map((s) => s.id))
  );

  const toggleSection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === sections.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sections.map((s) => s.id)));
    }
  };

  const selectedCount = selected.size;
  const allSelected = selectedCount === sections.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to sections
        </button>
      </div>

      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <p className="text-sm font-medium">
          AI generated {sections.length} sections
        </p>
        <button
          onClick={toggleAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto py-2">
        {sections.map((section) => {
          const isSelected = selected.has(section.id);
          const preview = getSectionPreview(section);
          return (
            <button
              key={section.id}
              onClick={() => toggleSection(section.id)}
              className={`w-full text-left px-4 py-3 flex gap-3 transition-colors ${
                isSelected
                  ? "bg-white/5"
                  : "opacity-50"
              } hover:bg-white/10`}
            >
              <div
                className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "bg-accent border-accent text-white"
                    : "border-white/20"
                }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">
                  {section.title}
                </p>
                <span className="text-[10px] font-medium text-accent/70 uppercase tracking-wide">
                  {SECTION_TYPE_LABELS[section.type]}
                </span>
                {preview && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {preview.slice(0, 120)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <button
          onClick={() =>
            onConfirm(sections.filter((s) => selected.has(s.id)))
          }
          disabled={selectedCount === 0}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Add {selectedCount} Selected
        </button>
        <button
          onClick={onRegenerate}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Regenerate
        </button>
      </div>
    </div>
  );
}

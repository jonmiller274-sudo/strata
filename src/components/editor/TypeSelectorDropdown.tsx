"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import type { Section, SectionType } from "@/types/artifact";
import { SECTION_TYPE_LABELS } from "@/types/artifact";
import { SectionTypePreview } from "./SectionTypePreview";

const ALL_TYPES: SectionType[] = [
  "rich-text",
  "expandable-cards",
  "timeline",
  "tier-table",
  "metric-dashboard",
  "data-viz",
  "hub-mockup",
  "guided-journey",
  "comparison-matrix",
  "hero-stats",
  "call-to-action",
];

interface TypeSelectorDropdownProps {
  section: Section;
  onTypeChange: (remappedSection: Section) => void;
}

export function TypeSelectorDropdown({
  section,
  onTypeChange,
}: TypeSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingType, setPendingType] = useState<SectionType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Close on Escape (capture phase to prevent split-view exit)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [isOpen]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleSelectType = useCallback(
    async (targetType: SectionType) => {
      setIsOpen(false);
      setIsLoading(true);
      setPendingType(targetType);
      setError(null);

      try {
        const res = await fetch("/api/ai/remap-section", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, targetType }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          let errMsg = errData.error || `Remap failed (${res.status})`;
          if (errMsg.includes("credit balance")) {
            errMsg = "AI service credits depleted";
          } else if (
            errMsg.includes("rate limit") ||
            errMsg.includes("rate_limit")
          ) {
            errMsg = "AI service is busy — try again in a moment";
          } else if (errMsg.includes("overloaded")) {
            errMsg = "AI service is temporarily overloaded";
          }
          throw new Error(errMsg);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("AI service timed out — please try again");
        }

        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error("AI service timed out — please try again");
        }
        onTypeChange(data.section as Section);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to remap section";
        setError(msg);
      } finally {
        setIsLoading(false);
        setPendingType(null);
      }
    },
    [section, onTypeChange]
  );

  const otherTypes = ALL_TYPES.filter((t) => t !== section.type);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => !isLoading && setIsOpen((v) => !v)}
        disabled={isLoading}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Converting to {SECTION_TYPE_LABELS[pendingType!]}...</span>
          </>
        ) : (
          <>
            <span>{SECTION_TYPE_LABELS[section.type]}</span>
            <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>

      {/* Error toast */}
      {error && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400 max-w-[240px]">
          {error}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 w-[240px] bg-background border border-white/10 rounded-lg shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Change to...
            </span>
          </div>
          <div className="max-h-[320px] overflow-y-auto py-1">
            {otherTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleSelectType(type)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-12 h-7 rounded overflow-hidden shrink-0">
                  <SectionTypePreview type={type} />
                </div>
                <span className="text-xs font-medium">
                  {SECTION_TYPE_LABELS[type]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

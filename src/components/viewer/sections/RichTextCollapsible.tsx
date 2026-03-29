"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lightbulb, AlertTriangle, Quote } from "lucide-react";
import type { RichTextSection } from "@/types/artifact";
import { cn } from "@/lib/utils/cn";

const CALLOUT_STYLES = {
  insight: {
    icon: Lightbulb,
    bg: "bg-accent-muted",
    border: "border-accent",
    text: "text-accent",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning/10",
    border: "border-warning",
    text: "text-warning",
  },
  quote: {
    icon: Quote,
    bg: "bg-card",
    border: "border-muted",
    text: "text-muted",
  },
};

export function RichTextCollapsible({
  section,
}: {
  section: RichTextSection;
}) {
  const [expanded, setExpanded] = useState(false);
  const { content } = section;
  const hasDetail = !!content.detail;

  return (
    <div>
      {content.tag && (
        <span
          className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{
            color: content.tag.color || "var(--palette-accent1, var(--color-accent))",
            backgroundColor: `color-mix(in srgb, ${content.tag.color || "var(--palette-accent1, var(--color-accent))"} 12%, transparent)`,
          }}
        >
          {content.tag.label}
        </span>
      )}
      <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
      {section.subtitle && (
        <p className="mt-2 text-muted">{section.subtitle}</p>
      )}

      {/* Summary — always visible */}
      <div className="mt-6 text-lg leading-relaxed text-foreground/90 whitespace-pre-line">
        {content.summary}
      </div>

      {/* Callout */}
      {content.callout && (
        <div
          className={cn(
            "mt-6 flex items-start gap-3 rounded-xl border-l-4 px-5 py-4",
            CALLOUT_STYLES[content.callout.type].bg,
            CALLOUT_STYLES[content.callout.type].border
          )}
        >
          {(() => {
            const Icon = CALLOUT_STYLES[content.callout.type].icon;
            return (
              <Icon
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0",
                  CALLOUT_STYLES[content.callout.type].text
                )}
              />
            );
          })()}
          <p className="text-sm leading-relaxed text-foreground/80">
            {content.callout.text}
          </p>
        </div>
      )}

      {/* Expandable detail */}
      {hasDetail && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-6 flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                expanded && "rotate-180"
              )}
            />
            {expanded ? "Show less" : "Read more"}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-xl bg-surface p-6 text-foreground/80 leading-relaxed whitespace-pre-line">
                  {content.detail}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

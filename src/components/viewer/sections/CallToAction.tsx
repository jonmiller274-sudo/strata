"use client";

import { motion } from "framer-motion";
import type { CallToActionSection } from "@/types/artifact";
import { cn } from "@/lib/utils/cn";

export function CallToAction({ section }: { section: CallToActionSection }) {
  const { headline, value, value_context, items, style } = section.content;
  const isBold = style === "bold";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "w-full rounded-2xl px-8 py-12 text-center",
        isBold
          ? "bg-accent/10 border border-accent/30"
          : "bg-card border border-border"
      )}
    >
      {/* Optional large value — displayed above headline */}
      {value && (
        <div className="mb-4">
          <span
            className={cn(
              "text-5xl md:text-6xl font-bold tabular-nums leading-none",
              isBold ? "text-accent" : "text-foreground"
            )}
          >
            {value}
          </span>
          {value_context && (
            <p className="mt-2 text-sm text-muted">{value_context}</p>
          )}
        </div>
      )}

      {/* Headline */}
      <h2
        className={cn(
          "text-xl md:text-2xl font-bold leading-snug",
          isBold ? "text-foreground" : "text-foreground"
        )}
      >
        {headline}
      </h2>

      {/* Optional items list — rendered as dots-separated inline on desktop, stacked on mobile */}
      {items && items.length > 0 && (
        <div className="mt-5">
          {/* Desktop: inline with separator dots */}
          <ul className="hidden sm:flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span className="text-sm text-muted">{item}</span>
                {idx < items.length - 1 && (
                  <span
                    className={cn(
                      "text-xs select-none",
                      isBold ? "text-accent/50" : "text-muted/50"
                    )}
                    aria-hidden
                  >
                    ·
                  </span>
                )}
              </li>
            ))}
          </ul>
          {/* Mobile: stacked */}
          <ul className="sm:hidden space-y-1.5">
            {items.map((item, idx) => (
              <li key={idx} className="text-sm text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

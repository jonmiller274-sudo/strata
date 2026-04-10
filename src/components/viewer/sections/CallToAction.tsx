"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { CallToActionSection } from "@/types/artifact";
import { cn } from "@/lib/utils/cn";

// "The Ask" variant — dark elevated treatment for proposals and deal terms
// Dark theme: elevated surface (white/6%) with teal left border
// Light theme: dark gradient background with white text (CSS in globals.css)
function TheAskVariant({ section }: { section: CallToActionSection }) {
  const { headline, value, value_context, items } = section.content;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-50px" }}
      className="cta-the-ask w-full rounded-2xl px-8 py-10 md:px-12 md:py-14"
    >
      {/* Large value — the unmissable number */}
      {value && (
        <div className="mb-8 text-center">
          <span className="text-5xl md:text-7xl font-extrabold tabular-nums leading-none text-accent-secondary">
            {value}
          </span>
          {value_context && (
            <p className="mt-3 text-sm font-medium text-accent-secondary/70 cta-ask-muted">
              {value_context}
            </p>
          )}
        </div>
      )}

      {/* Headline */}
      <h2 className="text-xl md:text-2xl font-bold leading-snug text-center text-foreground cta-ask-text">
        {headline}
      </h2>

      {/* Deal terms — vertical list with teal checkmarks */}
      {items && items.length > 0 && (
        <ul className="mt-6 space-y-3 max-w-md mx-auto">
          {items.map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + idx * 0.07 }}
              viewport={{ once: true }}
              className="flex items-start gap-3"
            >
              <Check className="h-4 w-4 mt-0.5 shrink-0 text-accent-secondary" />
              <span className="text-sm text-foreground/90 cta-ask-text">
                {item}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

// Standard CTA (bold or subtle)
function StandardVariant({ section }: { section: CallToActionSection }) {
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
      <h2 className="text-xl md:text-2xl font-bold leading-snug text-foreground">
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

export function CallToAction({ section }: { section: CallToActionSection }) {
  if (section.content.style === "the-ask") {
    return <TheAskVariant section={section} />;
  }
  return <StandardVariant section={section} />;
}

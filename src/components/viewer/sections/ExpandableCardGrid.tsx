"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ExpandableCardGridSection, ExpandableCard } from "@/types/artifact";
import { cn } from "@/lib/utils/cn";

function Card({ card, index }: { card: ExpandableCard; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "group cursor-pointer rounded-2xl border border-border bg-card p-6 transition-all duration-200",
        "hover:border-accent/30 hover:bg-card-hover",
        expanded && "border-accent/40 bg-card-hover"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{card.title}</h3>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            {card.summary}
          </p>
        </div>
        {card.detail && (
          <ChevronDown
            className={cn(
              "ml-4 mt-1 h-5 w-5 shrink-0 text-muted transition-transform duration-200",
              expanded && "rotate-180 text-accent"
            )}
          />
        )}
      </div>

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent-muted px-2.5 py-0.5 text-xs font-medium text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Metric */}
      {card.metric && (
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums text-accent">
            {card.metric.value}
          </span>
          <span className="text-xs text-muted">{card.metric.label}</span>
        </div>
      )}

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && card.detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-border pt-4 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {card.detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ExpandableCardGrid({
  section,
}: {
  section: ExpandableCardGridSection;
}) {
  const columns = section.content.columns ?? 2;
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
      {section.subtitle && (
        <p className="mt-2 text-muted">{section.subtitle}</p>
      )}

      <div className={cn("mt-8 grid gap-4", gridCols[columns])}>
        {section.content.cards.map((card, index) => (
          <Card key={card.id} card={card} index={index} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { TierTableSection, TierColumn, TierFeature } from "@/types/artifact";
import { cn } from "@/lib/utils/cn";
import { FormattedText } from "../FormattedText";

// Column accent colors for comparison mode
const COMPARISON_ACCENT = [
  "var(--palette-accent4, var(--color-danger))",
  "var(--palette-accent1, var(--color-accent))",
];

function ComparisonColumn({
  column,
  index,
}: {
  column: TierColumn;
  index: number;
}) {
  const accentColor = COMPARISON_ACCENT[index] ?? COMPARISON_ACCENT[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      viewport={{ once: true, margin: "-50px" }}
      className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Colored top accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />

      <div className="p-6 flex flex-col flex-1">
        <h3
          className="text-xl font-bold"
          style={{ color: accentColor }}
        >
          {column.name}
        </h3>
        {column.description && (
          <p className="mt-1 text-sm text-muted">{column.description}</p>
        )}

        <ul className="mt-6 flex-1 space-y-3">
          {column.features.map((feature: TierFeature) => {
            const included =
              typeof feature.included === "boolean"
                ? feature.included
                : true; // string values treated as present

            return (
              <li key={feature.name} className="flex items-start gap-3 text-sm">
                {included ? (
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-success"
                  />
                ) : (
                  <X
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: "var(--palette-accent4, var(--color-danger))" }}
                  />
                )}
                <span
                  className={cn(
                    included ? "font-medium text-foreground/90" : "text-muted-foreground"
                  )}
                >
                  <FormattedText text={feature.name} />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
}

function ComparisonView({ section }: { section: TierTableSection }) {
  const { columns, kicker } = section.content;

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
      {section.subtitle && (
        <p className="mt-2 text-muted">{section.subtitle}</p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {columns.map((column, index) => (
          <ComparisonColumn key={column.name} column={column} index={index} />
        ))}
      </div>

      {kicker && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mt-8 rounded-2xl p-6 text-center"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--palette-accent4, var(--color-danger)) 12%, transparent), color-mix(in srgb, var(--palette-accent1, var(--color-accent)) 12%, transparent))",
            border: "1px solid color-mix(in srgb, var(--palette-accent1, var(--color-accent)) 25%, transparent)",
          }}
        >
          <p
            className="text-lg font-bold italic"
            style={{ color: "var(--palette-accent1, var(--color-accent))" }}
          >
            {kicker}
          </p>
        </motion.div>
      )}
    </div>
  );
}

function TierCard({
  column,
  index,
}: {
  column: TierColumn;
  index: number;
}) {
  const highlighted = column.is_highlighted ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "relative flex flex-col rounded-2xl border p-6",
        highlighted
          ? "border-accent bg-accent-muted shadow-lg shadow-accent/10"
          : "border-border bg-card"
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-white">
          Recommended
        </div>
      )}

      <h3 className="text-xl font-bold">{column.name}</h3>
      {column.description && (
        <p className="mt-1 text-sm text-muted">{column.description}</p>
      )}

      {column.price && (
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl font-bold tabular-nums">
            {column.price}
          </span>
          {column.price_period && (
            <span className="text-sm text-muted">/{column.price_period}</span>
          )}
        </div>
      )}

      {column.cta && (
        <button
          className={cn(
            "mt-6 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors",
            highlighted
              ? "bg-accent text-white hover:bg-accent-hover"
              : "bg-card-hover text-foreground hover:bg-border"
          )}
        >
          {column.cta}
        </button>
      )}

      <ul className="mt-6 flex-1 space-y-3 border-t border-border pt-6">
        {column.features.map((feature) => (
          <li key={feature.name} className="flex items-start gap-3 text-sm">
            {typeof feature.included === "boolean" ? (
              feature.included ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )
            ) : (
              <span className="mt-0.5 text-xs font-semibold text-accent shrink-0">
                {feature.included}
              </span>
            )}
            <span
              className={cn(
                typeof feature.included === "boolean" && !feature.included
                  ? "text-muted-foreground"
                  : "text-foreground/90"
              )}
            >
              {feature.name}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function TierTable({
  section,
}: {
  section: TierTableSection;
}) {
  if (section.content.mode === "comparison") {
    return <ComparisonView section={section} />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
      {section.subtitle && (
        <p className="mt-2 text-muted">{section.subtitle}</p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {section.content.columns.map((column, index) => (
          <TierCard key={column.name} column={column} index={index} />
        ))}
      </div>
    </div>
  );
}

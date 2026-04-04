"use client";

import { motion } from "framer-motion";
import type { DataVizSection } from "@/types/artifact";

// ===== Staircase Chart =====
// Ascending horizontal bars — each step is wider and taller than the previous,
// creating a staircase-up-right visual for showing value tiers or growth stages.

interface StaircaseItem {
  label: string;
  amount: string;
  description?: string;
  color?: string;
}

function StaircaseChart({ data }: { data: Array<Record<string, string | number>> }) {
  const items = data as unknown as StaircaseItem[];
  const count = items.length;

  // Widen each step linearly from ~40% to 100%
  const minWidthPct = 40;
  const widthStep = count > 1 ? (100 - minWidthPct) / (count - 1) : 0;

  // Heights: start at 60px, add 15px per step
  const baseHeight = 60;
  const heightStep = 15;

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const widthPct = minWidthPct + index * widthStep;
        const heightPx = baseHeight + index * heightStep;
        const color = item.color ?? "var(--color-accent)";

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: index * 0.15, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col gap-1"
          >
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${widthPct}%` }}
              transition={{ duration: 0.55, delay: index * 0.15 + 0.05, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative flex items-center justify-between rounded-lg px-4"
              style={{
                backgroundColor: color,
                opacity: 0.85,
                height: `${heightPx}px`,
                minWidth: "120px",
              }}
            >
              <span className="text-sm font-semibold text-white leading-tight pr-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                {item.label}
              </span>
              <span className="text-sm font-bold text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                {item.amount}
              </span>
            </motion.div>
            {item.description && (
              <p className="text-xs text-muted leading-snug pl-1">
                {item.description}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ===== Layers Chart =====
// Stacked horizontal bars, each wider than the previous, illustrating value
// compounding as each layer is added on top of the previous.

interface LayersItem {
  label: string;
  price: string;
  color?: string;
}

function renderCalloutText(text: string) {
  // Split on **...** and alternate between plain and bold segments
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function LayersChart({ data }: { data: Array<Record<string, string | number>> }) {
  const items = data as unknown as LayersItem[];
  const count = items.length;

  // Widen each layer linearly from ~30% to 100%
  const minWidthPct = 30;
  const widthStep = count > 1 ? (100 - minWidthPct) / (count - 1) : 0;

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const widthPct = minWidthPct + index * widthStep;
        const color = item.color ?? "var(--color-accent)";

        return (
          <motion.div
            key={index}
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: `${widthPct}%`, opacity: 1 }}
            transition={{ duration: 0.55, delay: index * 0.15, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex items-center justify-between rounded-lg px-4"
            style={{
              backgroundColor: color,
              height: "48px",
              minWidth: "80px",
            }}
          >
            <span className="text-sm font-medium text-white truncate pr-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
              {item.label}
            </span>
            <span className="text-sm font-bold text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
              {item.price}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function BarChart({
  data,
  xKey,
  yKey,
}: {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
}) {
  const maxValue = Math.max(
    ...data.map((d) => Number(d[yKey]) || 0)
  );

  return (
    <div className="flex items-end gap-3 h-64">
      {data.map((item, index) => {
        const value = Number(item[yKey]) || 0;
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

        return (
          <div
            key={index}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <span className="text-xs font-medium tabular-nums text-muted">
              {item[yKey]}
            </span>
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${height}%` }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="w-full rounded-t-lg min-h-[4px]"
              style={{ backgroundColor: "var(--palette-accent1, var(--color-accent))" }}
            />
            <span className="text-xs text-muted-foreground text-center truncate w-full">
              {item[xKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FunnelChart({
  data,
  xKey,
  yKey,
}: {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
}) {
  const maxValue = Math.max(
    ...data.map((d) => Number(d[yKey]) || 0)
  );

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const value = Number(item[yKey]) || 0;
        const width = maxValue > 0 ? (value / maxValue) * 100 : 0;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-foreground/90">
                {item[xKey]}
              </span>
              <span className="text-sm font-medium tabular-nums text-muted">
                {item[yKey]}
              </span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-lg bg-surface">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${width}%` }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full rounded-lg"
                style={{ backgroundColor: "var(--palette-accent1, var(--color-accent))", opacity: 1 - index * 0.12 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function DataVisualization({
  section,
}: {
  section: DataVizSection;
}) {
  const { content } = section;
  const xKey = content.x_key ?? "label";
  const yKey = content.y_key ?? "value";

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
      {section.subtitle && (
        <p className="mt-2 text-muted">{section.subtitle}</p>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        {content.chart_type === "bar" && (
          <BarChart data={content.data} xKey={xKey} yKey={yKey} />
        )}
        {content.chart_type === "funnel" && (
          <FunnelChart data={content.data} xKey={xKey} yKey={yKey} />
        )}
        {content.chart_type === "staircase" && (
          <StaircaseChart data={content.data} />
        )}
        {content.chart_type === "layers" && (
          <LayersChart data={content.data} />
        )}
        {(content.chart_type === "line" ||
          content.chart_type === "pie" ||
          content.chart_type === "custom-svg") && (
          <div className="flex h-64 items-center justify-center text-muted">
            <p>{content.chart_type} chart — coming soon</p>
          </div>
        )}
      </div>

      {content.callout && (
        <div
          className="mt-4 border-l-4 pl-4 py-3 rounded-r-lg"
          style={{
            borderColor: "var(--palette-accent3, var(--color-warning, #f0b429))",
            backgroundColor: "var(--palette-accent3-subtle, rgba(240,180,41,0.08))",
          }}
        >
          <p className="text-sm text-foreground/80 leading-relaxed">
            {renderCalloutText(content.callout)}
          </p>
        </div>
      )}

      {content.description && (
        <p className="mt-4 text-sm text-muted leading-relaxed">
          {content.description}
        </p>
      )}
    </div>
  );
}

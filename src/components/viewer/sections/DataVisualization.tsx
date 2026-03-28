"use client";

import { motion } from "framer-motion";
import type { DataVizSection } from "@/types/artifact";

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
              className="w-full rounded-t-lg bg-accent min-h-[4px]"
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
                className="h-full rounded-lg bg-accent"
                style={{ opacity: 1 - index * 0.12 }}
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
        {(content.chart_type === "line" ||
          content.chart_type === "pie" ||
          content.chart_type === "custom-svg") && (
          <div className="flex h-64 items-center justify-center text-muted">
            <p>{content.chart_type} chart — coming soon</p>
          </div>
        )}
      </div>

      {content.description && (
        <p className="mt-4 text-sm text-muted leading-relaxed">
          {content.description}
        </p>
      )}
    </div>
  );
}

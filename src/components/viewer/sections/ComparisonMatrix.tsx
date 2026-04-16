"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { ComparisonMatrixSection } from "@/types/artifact";
import { cn } from "@/lib/utils/cn";

function CellValue({ value }: { value: boolean | string | number }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-4 w-4 text-success mx-auto" strokeWidth={3} />
    ) : (
      <X className="h-4 w-4 text-danger/50 mx-auto" strokeWidth={2.5} />
    );
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
}

// Desktop table layout
function DesktopTable({ section }: { section: ComparisonMatrixSection }) {
  const { columns, rows, verdict } = section.content;

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {/* Row label column header */}
            <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-muted w-40" />
            {columns.map((col, colIdx) => (
              <motion.th
                key={col.id}
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: colIdx * 0.08 }}
                viewport={{ once: true, margin: "-50px" }}
                className={cn(
                  "pb-3 px-4 text-center text-sm font-bold",
                  col.highlight
                    ? "text-accent"
                    : "text-foreground"
                )}
              >
                <span
                  className={cn(
                    col.highlight &&
                      "inline-block rounded-md px-2 py-0.5 bg-accent/10 border border-accent/30"
                  )}
                >
                  {col.label}
                </span>
              </motion.th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <motion.tr
              key={row.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: rowIdx * 0.07 }}
              viewport={{ once: true, margin: "-50px" }}
              className="border-t border-border"
            >
              <td className="py-3 pr-4">
                <p className="text-sm font-medium text-foreground">{row.label}</p>
                {row.description && (
                  <p className="mt-0.5 text-xs text-muted">{row.description}</p>
                )}
              </td>
              {columns.map((col, colIdx) => (
                <td
                  key={col.id}
                  className={cn(
                    "py-3 px-4 text-center",
                    col.highlight && "bg-accent/5 border-x border-accent/20"
                  )}
                >
                  <CellValue value={row.values[colIdx] ?? false} />
                </td>
              ))}
            </motion.tr>
          ))}

          {verdict && (
            <tr className="border-t-2 border-border bg-card-hover">
              <td className="py-3 pr-4 text-xs font-medium uppercase tracking-wide text-muted">
                {verdict.label}
              </td>
              {columns.map((col, colIdx) => (
                <td
                  key={col.id}
                  className={cn(
                    "py-3 px-4 text-center",
                    col.highlight && "bg-accent/10 border-x border-accent/30"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-bold",
                      col.highlight ? "text-accent" : "text-foreground"
                    )}
                  >
                    {verdict.values[colIdx] ?? ""}
                  </span>
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Mobile stacked layout — one card per row, columns as labeled values
function MobileStacked({ section }: { section: ComparisonMatrixSection }) {
  const { columns, rows, verdict } = section.content;

  return (
    <div className="md:hidden space-y-4">
      {rows.map((row, rowIdx) => (
        <motion.div
          key={row.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: rowIdx * 0.08 }}
          viewport={{ once: true, margin: "-50px" }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <p className="text-sm font-medium text-foreground">{row.label}</p>
          {row.description && (
            <p className="mt-0.5 text-xs text-muted">{row.description}</p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {columns.map((col, colIdx) => (
              <div
                key={col.id}
                className={cn(
                  "rounded-lg p-2 text-center",
                  col.highlight
                    ? "bg-accent/10 border border-accent/25"
                    : "bg-card-hover"
                )}
              >
                <p
                  className={cn(
                    "mb-1 text-xs font-medium",
                    col.highlight ? "text-accent" : "text-muted"
                  )}
                >
                  {col.label}
                </p>
                <CellValue value={row.values[colIdx] ?? false} />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {verdict && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: rows.length * 0.08 }}
          viewport={{ once: true, margin: "-50px" }}
          className="rounded-xl border border-border bg-card-hover p-4"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
            {verdict.label}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {columns.map((col, colIdx) => (
              <div
                key={col.id}
                className={cn(
                  "rounded-lg p-2 text-center",
                  col.highlight
                    ? "bg-accent/10 border border-accent/25"
                    : "bg-card"
                )}
              >
                <p
                  className={cn(
                    "mb-0.5 text-xs font-medium",
                    col.highlight ? "text-accent" : "text-muted"
                  )}
                >
                  {col.label}
                </p>
                <span
                  className={cn(
                    "text-sm font-bold",
                    col.highlight ? "text-accent" : "text-foreground"
                  )}
                >
                  {verdict.values[colIdx] ?? ""}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function ComparisonMatrix({
  section,
}: {
  section: ComparisonMatrixSection;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
      {section.subtitle && (
        <p className="mt-2 text-muted">{section.subtitle}</p>
      )}

      <div className="mt-8">
        <DesktopTable section={section} />
        <MobileStacked section={section} />
      </div>
    </div>
  );
}

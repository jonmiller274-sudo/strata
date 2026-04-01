"use client";

import type { DataVizSection } from "@/types/artifact";
import { InlineEditor } from "./InlineEditor";
import { ItemManager } from "./ItemManager";

const CHART_TYPES = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "pie", label: "Pie" },
  { value: "funnel", label: "Funnel" },
  { value: "staircase", label: "Staircase" },
  { value: "layers", label: "Layers" },
] as const;

interface EditableDataVizProps {
  section: DataVizSection;
  onFieldChange: (path: string, value: unknown) => void;
}

export function EditableDataViz({
  section,
  onFieldChange,
}: EditableDataVizProps) {
  const data = section.content.data;
  const xKey = section.content.x_key || "label";
  const yKey = section.content.y_key || "value";

  const handleAddDataPoint = () => {
    const newPoint: Record<string, string | number> = {
      [xKey]: "New Item",
      [yKey]: 0,
    };
    onFieldChange("content.data", [...data, newPoint]);
  };

  const handleRemoveDataPoint = (index: number) => {
    onFieldChange(
      "content.data",
      data.filter((_, i) => i !== index)
    );
  };

  const handleReorderDataPoints = (from: number, to: number) => {
    const updated = [...data];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onFieldChange("content.data", updated);
  };

  return (
    <div className="space-y-4">
      {/* Chart type selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Chart type:</label>
        <select
          value={section.content.chart_type}
          onChange={(e) =>
            onFieldChange("content.chart_type", e.target.value)
          }
          className="bg-white/10 rounded px-2 py-1 text-sm outline-none ring-1 ring-white/10 focus:ring-accent/50"
        >
          {CHART_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value}>
              {ct.label}
            </option>
          ))}
        </select>
      </div>

      {/* Data table */}
      <div>
        <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground uppercase tracking-wider">
          <span className="flex-1 pl-8">{xKey}</span>
          <span className="w-24">{yKey}</span>
        </div>
        <ItemManager
          items={data}
          getItemId={(_, i) => `dp-${i}`}
          onAdd={handleAddDataPoint}
          onRemove={handleRemoveDataPoint}
          onReorder={handleReorderDataPoints}
          addLabel="Add data point"
          minItems={1}
          renderItem={(point, i) => (
            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <div className="flex-1">
                <InlineEditor
                  value={String(point[xKey] ?? "")}
                  onChange={(v) =>
                    onFieldChange(`content.data.${i}.${xKey}`, v)
                  }
                  placeholder="Label"
                />
              </div>
              <div className="w-24">
                <input
                  type="text"
                  value={point[yKey] || ""}
                  onChange={(e) =>
                    onFieldChange(
                      `content.data.${i}.${yKey}`,
                      e.target.value
                    )
                  }
                  className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-right"
                />
              </div>
            </div>
          )}
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
          Description
        </label>
        <InlineEditor
          value={section.content.description || ""}
          onChange={(v) => onFieldChange("content.description", v)}
          multiline
          placeholder="Add chart description..."
        />
      </div>

      {/* Callout */}
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
          Callout
        </label>
        <InlineEditor
          value={section.content.callout || ""}
          onChange={(v) => onFieldChange("content.callout", v)}
          multiline
          placeholder="Add callout text (supports **bold**)..."
        />
      </div>
    </div>
  );
}

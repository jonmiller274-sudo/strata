"use client";

import type {
  Section,
  RichTextSection,
  ExpandableCardGridSection,
  MetricDashboardSection,
  TimelineSection,
  TierTableSection,
} from "@/types/artifact";
import { SectionRenderer } from "@/components/viewer/SectionRenderer";
import { InlineEditor } from "./InlineEditor";
import { ItemManager } from "./ItemManager";

interface EditableSectionRendererProps {
  section: Section;
  onFieldChange: (path: string, value: unknown) => void;
}

export function EditableSectionRenderer({
  section,
  onFieldChange,
}: EditableSectionRendererProps) {
  // Check if this section type has a custom editable renderer.
  // Custom renderers handle their own layout, so we add editable title/subtitle.
  // Section types that fall through to SectionRenderer already render their own
  // title internally, so we skip the extra title to avoid duplication.
  const hasCustomRenderer = [
    "rich-text",
    "expandable-cards",
    "metric-dashboard",
    "timeline",
    "tier-table",
  ].includes(section.type);

  if (!hasCustomRenderer) {
    // Fallback: use the viewer's SectionRenderer as-is (no duplication)
    return <SectionRenderer section={section} />;
  }

  return (
    <div>
      {/* Editable title */}
      <h2 className="text-2xl font-bold tracking-tight mb-2">
        <InlineEditor
          value={section.title}
          onChange={(v) => onFieldChange("title", v)}
        />
      </h2>

      {/* Editable subtitle */}
      {section.subtitle !== undefined && (
        <p className="text-muted mb-6">
          <InlineEditor
            value={section.subtitle || ""}
            onChange={(v) => onFieldChange("subtitle", v)}
            placeholder="Add subtitle..."
          />
        </p>
      )}

      {/* Section content */}
      <EditableContent section={section} onFieldChange={onFieldChange} />
    </div>
  );
}

function EditableContent({
  section,
  onFieldChange,
}: {
  section: Section;
  onFieldChange: (path: string, value: unknown) => void;
}) {
  switch (section.type) {
    case "rich-text":
      return <EditableRichText section={section} onFieldChange={onFieldChange} />;
    case "expandable-cards":
      return <EditableCardGrid section={section} onFieldChange={onFieldChange} />;
    case "metric-dashboard":
      return <EditableMetricDashboard section={section} onFieldChange={onFieldChange} />;
    case "timeline":
      return <EditableTimeline section={section} onFieldChange={onFieldChange} />;
    case "tier-table":
      return <EditableTierTable section={section} onFieldChange={onFieldChange} />;
    default:
      return <SectionRenderer section={section} />;
  }
}

function EditableRichText({
  section,
  onFieldChange,
}: {
  section: RichTextSection;
  onFieldChange: (path: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="text-foreground/90 leading-relaxed">
        <InlineEditor
          value={section.content.summary}
          onChange={(v) => onFieldChange("content.summary", v)}
          multiline
        />
      </div>

      {/* Detail (collapsible in viewer, always visible in editor) */}
      {section.content.detail && (
        <div className="text-foreground/70 leading-relaxed border-l-2 border-white/10 pl-4">
          <InlineEditor
            value={section.content.detail}
            onChange={(v) => onFieldChange("content.detail", v)}
            multiline
          />
        </div>
      )}

      {/* Callout */}
      {section.content.callout && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <InlineEditor
            value={section.content.callout.text}
            onChange={(v) => onFieldChange("content.callout.text", v)}
            multiline
          />
        </div>
      )}
    </div>
  );
}

function EditableCardGrid({
  section,
  onFieldChange,
}: {
  section: ExpandableCardGridSection;
  onFieldChange: (path: string, value: unknown) => void;
}) {
  const cards = section.content.cards;

  const handleAdd = () => {
    const newCard = {
      id: crypto.randomUUID(),
      title: "New Card",
      summary: "Click to edit",
      detail: "",
      tags: [],
    };
    onFieldChange("content.cards", [...cards, newCard]);
  };

  const handleRemove = (index: number) => {
    onFieldChange("content.cards", cards.filter((_, i) => i !== index));
  };

  const handleReorder = (from: number, to: number) => {
    const updated = [...cards];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onFieldChange("content.cards", updated);
  };

  return (
    <ItemManager
      items={cards}
      getItemId={(card) => card.id}
      onAdd={handleAdd}
      onRemove={handleRemove}
      onReorder={handleReorder}
      addLabel="Add card"
      minItems={1}
      renderItem={(card, i) => (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="font-semibold mb-2">
            <InlineEditor
              value={card.title}
              onChange={(v) => onFieldChange(`content.cards.${i}.title`, v)}
            />
          </h3>
          <div className="text-sm text-foreground/70">
            <InlineEditor
              value={card.summary}
              onChange={(v) => onFieldChange(`content.cards.${i}.summary`, v)}
              multiline
            />
          </div>
          {card.detail !== undefined && (
            <div className="text-sm text-foreground/50 mt-2 border-t border-white/10 pt-2">
              <InlineEditor
                value={card.detail || ""}
                onChange={(v) => onFieldChange(`content.cards.${i}.detail`, v)}
                multiline
                placeholder="Add detail..."
              />
            </div>
          )}
        </div>
      )}
    />
  );
}

function EditableMetricDashboard({
  section,
  onFieldChange,
}: {
  section: MetricDashboardSection;
  onFieldChange: (path: string, value: unknown) => void;
}) {
  const metrics = section.content.metrics;

  const handleAdd = () => {
    const newMetric = {
      id: crypto.randomUUID(),
      label: "New Metric",
      value: "0",
      description: "Click to edit",
    };
    onFieldChange("content.metrics", [...metrics, newMetric]);
  };

  const handleRemove = (index: number) => {
    onFieldChange("content.metrics", metrics.filter((_, i) => i !== index));
  };

  const handleReorder = (from: number, to: number) => {
    const updated = [...metrics];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onFieldChange("content.metrics", updated);
  };

  return (
    <ItemManager
      items={metrics}
      getItemId={(metric) => metric.id}
      onAdd={handleAdd}
      onRemove={handleRemove}
      onReorder={handleReorder}
      addLabel="Add metric"
      minItems={1}
      renderItem={(metric, i) => (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-sm text-muted-foreground mb-1">
            <InlineEditor
              value={metric.label}
              onChange={(v) => onFieldChange(`content.metrics.${i}.label`, v)}
            />
          </p>
          <p className="text-2xl font-bold">
            <InlineEditor
              value={metric.value}
              onChange={(v) => onFieldChange(`content.metrics.${i}.value`, v)}
            />
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <InlineEditor
              value={metric.description || ""}
              onChange={(v) => onFieldChange(`content.metrics.${i}.description`, v)}
              placeholder="Add description..."
            />
          </p>
        </div>
      )}
    />
  );
}

function EditableTimeline({
  section,
  onFieldChange,
}: {
  section: TimelineSection;
  onFieldChange: (path: string, value: unknown) => void;
}) {
  const steps = section.content.steps;

  const handleAdd = () => {
    const newStep = {
      id: crypto.randomUUID(),
      label: "New Step",
      title: "Step Title",
      description: "Click to edit",
      status: "upcoming" as const,
    };
    onFieldChange("content.steps", [...steps, newStep]);
  };

  const handleRemove = (index: number) => {
    onFieldChange("content.steps", steps.filter((_, i) => i !== index));
  };

  const handleReorder = (from: number, to: number) => {
    const updated = [...steps];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onFieldChange("content.steps", updated);
  };

  return (
    <div className="space-y-4">
      <ItemManager
        items={steps}
        getItemId={(step) => step.id}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onReorder={handleReorder}
        addLabel="Add step"
        minItems={1}
        renderItem={(step, i) => (
          <div className="flex gap-4 items-start">
            <div className="w-20 shrink-0 text-xs font-mono text-muted-foreground pt-1">
              <InlineEditor
                value={step.label}
                onChange={(v) => onFieldChange(`content.steps.${i}.label`, v)}
              />
            </div>
            <div className="flex-1 bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="font-semibold mb-1">
                <InlineEditor
                  value={step.title}
                  onChange={(v) => onFieldChange(`content.steps.${i}.title`, v)}
                />
              </h4>
              <div className="text-sm text-foreground/70">
                <InlineEditor
                  value={step.description}
                  onChange={(v) => onFieldChange(`content.steps.${i}.description`, v)}
                  multiline
                />
              </div>
            </div>
          </div>
        )}
      />

      {/* Evidence */}
      {section.content.evidence && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 mt-4">
          <InlineEditor
            value={section.content.evidence.text}
            onChange={(v) => onFieldChange("content.evidence.text", v)}
            multiline
          />
        </div>
      )}

      {/* Pivot */}
      {section.content.pivot && (
        <p className="text-lg font-semibold mt-4">
          <InlineEditor
            value={section.content.pivot}
            onChange={(v) => onFieldChange("content.pivot", v)}
          />
        </p>
      )}
    </div>
  );
}

function EditableTierTable({
  section,
  onFieldChange,
}: {
  section: TierTableSection;
  onFieldChange: (path: string, value: unknown) => void;
}) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${Math.min(section.content.columns.length, 4)}, minmax(0, 1fr))`,
      }}
    >
      {section.content.columns.map((col, i) => (
        <div
          key={col.name}
          className={`bg-white/5 rounded-lg p-4 border ${
            col.is_highlighted ? "border-accent/50" : "border-white/10"
          }`}
        >
          <h4 className="font-semibold mb-1">
            <InlineEditor
              value={col.name}
              onChange={(v) => onFieldChange(`content.columns.${i}.name`, v)}
            />
          </h4>
          {col.price && (
            <p className="text-2xl font-bold mb-1">
              <InlineEditor
                value={col.price}
                onChange={(v) => onFieldChange(`content.columns.${i}.price`, v)}
              />
            </p>
          )}
          {col.description && (
            <p className="text-sm text-muted-foreground mb-3">
              <InlineEditor
                value={col.description}
                onChange={(v) => onFieldChange(`content.columns.${i}.description`, v)}
              />
            </p>
          )}
          <ul className="space-y-1">
            {col.features.map((feat, j) => (
              <li key={feat.name} className="text-sm flex items-center gap-2">
                <span className="text-xs">{feat.included ? "+" : "-"}</span>
                <InlineEditor
                  value={feat.name}
                  onChange={(v) => onFieldChange(`content.columns.${i}.features.${j}.name`, v)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { ImageIcon, Sparkles, Loader2, X as XIcon } from "lucide-react";
import type {
  Section,
  RichTextSection,
  ExpandableCardGridSection,
  MetricDashboardSection,
  TimelineSection,
  TierTableSection,
  GuidedJourneySection,
} from "@/types/artifact";
import { SECTION_TYPE_LABELS } from "@/types/artifact";
import { SectionRenderer } from "@/components/viewer/SectionRenderer";
import { InlineEditor } from "./InlineEditor";
import { ItemManager } from "./ItemManager";
import { EditableGuidedJourney } from "./EditableGuidedJourney";
import { EditableDataViz } from "./EditableDataViz";
import { EditableHubMockup } from "./EditableHubMockup";

interface EditableSectionRendererProps {
  section: Section;
  isSelected?: boolean;
  onFieldChange: (path: string, value: unknown) => void;
  onReplaceSection?: (updated: Section) => void;
}

export function EditableSectionRenderer({
  section,
  isSelected = false,
  onFieldChange,
  onReplaceSection,
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
    "guided-journey",
    "data-viz",
    "hub-mockup",
  ].includes(section.type);

  if (!hasCustomRenderer) {
    // Fallback: use the viewer's SectionRenderer as-is (no duplication)
    return <SectionRenderer section={section} />;
  }

  return (
    <div>
      {/* Section type badge */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase bg-accent/10 text-accent/80 border border-accent/20">
          {SECTION_TYPE_LABELS[section.type]}
        </span>
        {section.image_url && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase bg-blue-500/10 text-blue-400/80 border border-blue-500/20">
            <ImageIcon className="w-3 h-3" />
            Image
          </span>
        )}
      </div>

      {/* Image preview + actions (when section has an uploaded image) */}
      {section.image_url && (
        <SectionImagePreview
          section={section}
          onFieldChange={onFieldChange}
          onReplaceSection={onReplaceSection}
        />
      )}

      {/* Editable title */}
      <h2 className="text-2xl font-bold tracking-tight mb-2">
        <InlineEditor
          value={section.title}
          onChange={(v) => onFieldChange("title", v)}
        />
      </h2>

      {/* Editable subtitle — always visible so users can add one to any section */}
      <p className="text-muted mb-6">
        <InlineEditor
          value={section.subtitle || ""}
          onChange={(v) => onFieldChange("subtitle", v)}
          placeholder="Add subtitle..."
        />
      </p>

      {/* Section content */}
      <EditableContent section={section} isSelected={isSelected} onFieldChange={onFieldChange} />
    </div>
  );
}

/** Image preview with Extract Structure and Remove buttons */
function SectionImagePreview({
  section,
  onFieldChange,
  onReplaceSection,
}: {
  section: Section;
  onFieldChange: (path: string, value: unknown) => void;
  onReplaceSection?: (updated: Section) => void;
}) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const handleExtractStructure = useCallback(async () => {
    if (!section.image_url || isExtracting || !onReplaceSection) return;

    setIsExtracting(true);
    setExtractError(null);

    try {
      // Fetch the image and convert to base64
      const imgRes = await fetch(section.image_url);
      const blob = await imgRes.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          resolve(dataUrl.split(",")[1]);
        };
        reader.readAsDataURL(blob);
      });

      const mimeType = blob.type as "image/png" | "image/jpeg" | "image/webp";

      // Call the vision API
      const urlKey = new URLSearchParams(window.location.search).get("key");
      const apiUrl = urlKey
        ? `/api/ai/vision-to-section?key=${encodeURIComponent(urlKey)}`
        : "/api/ai/vision-to-section";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          context: { title: section.title },
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      const aiSection = data.section as Section;

      // Replace the section content but keep original id, image_url, and title if AI didn't improve it
      onReplaceSection({
        ...aiSection,
        id: section.id,
        image_url: section.image_url,
        title: aiSection.title || section.title,
        subtitle: aiSection.subtitle || section.subtitle,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        setExtractError("Timed out. Try a simpler image.");
      } else {
        setExtractError(err instanceof Error ? err.message : "Failed to extract structure");
      }
    } finally {
      setIsExtracting(false);
    }
  }, [section, isExtracting, onReplaceSection]);

  // Check if this section has meaningful content (not just the image)
  const hasContent =
    section.type !== "rich-text" ||
    !!(section as RichTextSection).content.summary?.trim();

  return (
    <div className="mb-4 rounded-lg border border-white/10 overflow-hidden">
      <img
        src={section.image_url}
        alt={section.title || "Section image"}
        style={{
          display: "block",
          /* Use intrinsic width up to container max — never upscale.
             On retina Macs, screenshots are captured at 2x device pixels.
             Displaying at natural CSS width means 1 source pixel = 1 CSS pixel
             = 2 physical pixels, which is perfectly sharp. Forcing width: 100%
             would upscale small screenshots and cause blurriness. */
          maxWidth: "100%",
          width: "auto",
          height: "auto",
        } as React.CSSProperties}
      />
      <div className="flex items-center gap-2 p-2 bg-white/5">
        {!hasContent && onReplaceSection && (
          <button
            onClick={handleExtractStructure}
            disabled={isExtracting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
          >
            {isExtracting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {isExtracting ? "Extracting..." : "Extract structure"}
          </button>
        )}
        <button
          onClick={() => onFieldChange("image_url", undefined)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-red-400 transition-colors ml-auto"
        >
          <XIcon className="w-3 h-3" />
          Remove image
        </button>
      </div>
      {extractError && (
        <div className="px-3 py-2 text-xs text-red-400 bg-red-500/5 border-t border-red-500/10">
          {extractError}
        </div>
      )}
    </div>
  );
}

function EditableContent({
  section,
  isSelected,
  onFieldChange,
}: {
  section: Section;
  isSelected: boolean;
  onFieldChange: (path: string, value: unknown) => void;
}) {
  switch (section.type) {
    case "rich-text":
      return <EditableRichText section={section} isSelected={isSelected} onFieldChange={onFieldChange} />;
    case "expandable-cards":
      return <EditableCardGrid section={section} onFieldChange={onFieldChange} />;
    case "metric-dashboard":
      return <EditableMetricDashboard section={section} onFieldChange={onFieldChange} />;
    case "timeline":
      return <EditableTimeline section={section} onFieldChange={onFieldChange} />;
    case "tier-table":
      return <EditableTierTable section={section} onFieldChange={onFieldChange} />;
    case "guided-journey":
      return <EditableGuidedJourney section={section} onFieldChange={onFieldChange} />;
    case "data-viz":
      return <EditableDataViz section={section} onFieldChange={onFieldChange} />;
    case "hub-mockup":
      return <EditableHubMockup section={section} onFieldChange={onFieldChange} />;
    default:
      return <SectionRenderer section={section} />;
  }
}

function EditableRichText({
  section,
  isSelected,
  onFieldChange,
}: {
  section: RichTextSection;
  isSelected: boolean;
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
          renderFormatted
        />
        {isSelected && (
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            Supports **bold** formatting
          </p>
        )}
      </div>

      {/* Detail (collapsible in viewer, always visible in editor) */}
      {section.content.detail && (
        <div className="text-foreground/70 leading-relaxed border-l-2 border-white/10 pl-4">
          <InlineEditor
            value={section.content.detail}
            onChange={(v) => onFieldChange("content.detail", v)}
            multiline
            renderFormatted
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
            renderFormatted
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
  const displayMode = section.content.display_mode ?? "expandable";
  const callout = section.content.callout;

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
    <div className="space-y-4">
      {/* Display mode toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Display:</span>
        {(["expandable", "open"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onFieldChange("content.display_mode", mode)}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              displayMode === mode
                ? "bg-accent/20 text-accent"
                : "bg-white/10 text-muted-foreground hover:bg-white/20"
            }`}
          >
            {mode === "expandable" ? "Expandable" : "Always Open"}
          </button>
        ))}
      </div>

      <ItemManager
        items={cards}
        getItemId={(card) => card.id}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onReorder={handleReorder}
        addLabel="Add card"
        minItems={1}
        renderItem={(card, i) => (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-2">
            {/* Card style toggle */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Style:</span>
              {(["default", "quote"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => onFieldChange(`content.cards.${i}.style`, s)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                    (card.style ?? "default") === s
                      ? "bg-accent/20 text-accent"
                      : "bg-white/10 text-muted-foreground hover:bg-white/20"
                  }`}
                >
                  {s === "default" ? "Default" : "Quote"}
                </button>
              ))}
            </div>

            <h3 className="font-semibold">
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
              <div className="text-sm text-foreground/50 border-t border-white/10 pt-2">
                <InlineEditor
                  value={card.detail || ""}
                  onChange={(v) => onFieldChange(`content.cards.${i}.detail`, v)}
                  multiline
                  placeholder="Add detail..."
                />
              </div>
            )}

            {/* Tags editor */}
            <div className="pt-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={(card.tags ?? []).join(", ")}
                onChange={(e) => {
                  const raw = e.target.value;
                  const tags = raw
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                  onFieldChange(`content.cards.${i}.tags`, tags);
                }}
                placeholder="e.g. Series B, SaaS, B2B"
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Metric editor */}
            <div className="pt-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">
                Metric
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={card.metric?.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    onFieldChange(`content.cards.${i}.metric`, val ? { value: val, label: card.metric?.label ?? "" } : undefined);
                  }}
                  placeholder="Value (e.g. $2.1B)"
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20"
                />
                <input
                  type="text"
                  value={card.metric?.label ?? ""}
                  onChange={(e) => {
                    const lbl = e.target.value;
                    if (card.metric?.value) {
                      onFieldChange(`content.cards.${i}.metric`, { value: card.metric.value, label: lbl });
                    }
                  }}
                  placeholder="Label (e.g. Valuation)"
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20"
                />
              </div>
            </div>
          </div>
        )}
      />

      {/* Callout editor */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <label className="text-xs text-muted-foreground block mb-2">Callout (synthesis block below cards)</label>
        {callout ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              {(["insight", "warning", "quote"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onFieldChange("content.callout", { ...callout, type: t })}
                  className={`px-2.5 py-1 rounded text-xs transition-colors capitalize ${
                    callout.type === t
                      ? "bg-accent/20 text-accent"
                      : "bg-white/10 text-muted-foreground hover:bg-white/20"
                  }`}
                >
                  {t}
                </button>
              ))}
              <button
                onClick={() => onFieldChange("content.callout", undefined)}
                className="ml-auto text-xs text-muted-foreground hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
            <textarea
              value={callout.text}
              onChange={(e) => onFieldChange("content.callout", { ...callout, text: e.target.value })}
              rows={3}
              placeholder="Key insight tying cards together..."
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 resize-none"
            />
          </div>
        ) : (
          <button
            onClick={() => onFieldChange("content.callout", { type: "insight", text: "" })}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            + Add callout
          </button>
        )}
      </div>
    </div>
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
  const columns = section.content.columns;

  const handleAddColumn = () => {
    const newCol = {
      name: "New Tier",
      price: "$0",
      price_period: "month",
      description: "",
      features: [],
      is_highlighted: false,
    };
    onFieldChange("content.columns", [...columns, newCol]);
  };

  const handleRemoveColumn = (index: number) => {
    onFieldChange("content.columns", columns.filter((_, i) => i !== index));
  };

  const handleReorderColumns = (from: number, to: number) => {
    const updated = [...columns];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onFieldChange("content.columns", updated);
  };

  const handleAddFeature = (colIndex: number) => {
    const newFeature = { name: "New Feature", included: true };
    const updatedFeatures = [...columns[colIndex].features, newFeature];
    onFieldChange(`content.columns.${colIndex}.features`, updatedFeatures);
  };

  const handleRemoveFeature = (colIndex: number, featIndex: number) => {
    const updatedFeatures = columns[colIndex].features.filter((_, i) => i !== featIndex);
    onFieldChange(`content.columns.${colIndex}.features`, updatedFeatures);
  };

  const handleToggleIncluded = (colIndex: number, featIndex: number) => {
    const current = columns[colIndex].features[featIndex].included;
    onFieldChange(
      `content.columns.${colIndex}.features.${featIndex}.included`,
      typeof current === "boolean" ? !current : true
    );
  };

  return (
    <ItemManager
      items={columns}
      getItemId={(col, i) => `col-${col.name || i}`}
      onAdd={handleAddColumn}
      onRemove={handleRemoveColumn}
      onReorder={handleReorderColumns}
      addLabel="Add tier"
      minItems={1}
      maxItems={5}
      renderItem={(col, i) => (
        <div
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
          <p className="text-2xl font-bold mb-1">
            <InlineEditor
              value={col.price || ""}
              onChange={(v) => onFieldChange(`content.columns.${i}.price`, v)}
              placeholder="$0"
            />
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            <InlineEditor
              value={col.description || ""}
              onChange={(v) => onFieldChange(`content.columns.${i}.description`, v)}
              placeholder="Add description..."
            />
          </p>
          <ul className="space-y-1">
            {col.features.map((feat, j) => (
              <li key={`${feat.name}-${j}`} className="group/feat text-sm flex items-center gap-2">
                <button
                  onClick={() => handleToggleIncluded(i, j)}
                  className="text-xs w-4 text-center hover:text-accent transition-colors"
                >
                  {feat.included ? "+" : "−"}
                </button>
                <span className="flex-1">
                  <InlineEditor
                    value={feat.name}
                    onChange={(v) => onFieldChange(`content.columns.${i}.features.${j}.name`, v)}
                  />
                </span>
                <button
                  onClick={() => handleRemoveFeature(i, j)}
                  className="opacity-0 group-hover/feat:opacity-50 hover:!opacity-100 hover:text-red-400 transition-opacity text-xs"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleAddFeature(i)}
            className="text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
          >
            + Add feature
          </button>
        </div>
      )}
    />
  );
}

"use client";

import type { GuidedJourneySection } from "@/types/artifact";
import { InlineEditor } from "./InlineEditor";
import { ItemManager } from "./ItemManager";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";

interface EditableGuidedJourneyProps {
  section: GuidedJourneySection;
  onFieldChange: (path: string, value: unknown) => void;
}

export function EditableGuidedJourney({
  section,
  onFieldChange,
}: EditableGuidedJourneyProps) {
  const [openPanel, setOpenPanel] = useState<"phases" | "events" | "metrics">(
    "events"
  );

  return (
    <div className="space-y-3">
      {/* Phases panel */}
      <CollapsiblePanel
        title="Phases"
        count={section.content.phases.length}
        isOpen={openPanel === "phases"}
        onToggle={() =>
          setOpenPanel(openPanel === "phases" ? "events" : "phases")
        }
      >
        <PhasesEditor section={section} onFieldChange={onFieldChange} />
      </CollapsiblePanel>

      {/* Events panel */}
      <CollapsiblePanel
        title="Events"
        count={section.content.events.length}
        isOpen={openPanel === "events"}
        onToggle={() =>
          setOpenPanel(openPanel === "events" ? "phases" : "events")
        }
      >
        <EventsEditor section={section} onFieldChange={onFieldChange} />
      </CollapsiblePanel>

      {/* Metrics panel (read-only) */}
      <CollapsiblePanel
        title="Animated Metrics"
        count={section.content.counters.length}
        isOpen={openPanel === "metrics"}
        onToggle={() =>
          setOpenPanel(openPanel === "metrics" ? "events" : "metrics")
        }
      >
        <MetricsDisplay section={section} />
      </CollapsiblePanel>
    </div>
  );
}

function CollapsiblePanel({
  title,
  count,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        {title}
        <span className="text-xs text-muted-foreground ml-auto">
          {count} {count === 1 ? "item" : "items"}
        </span>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
}

function PhasesEditor({
  section,
  onFieldChange,
}: {
  section: GuidedJourneySection;
  onFieldChange: (path: string, value: unknown) => void;
}) {
  const phases = section.content.phases;

  const handleAdd = () => {
    const newPhase = {
      id: crypto.randomUUID(),
      name: "New Phase",
      color: "#6366f1",
      day_range: "Days 0–30",
    };
    onFieldChange("content.phases", [...phases, newPhase]);
  };

  const handleRemove = (index: number) => {
    onFieldChange(
      "content.phases",
      phases.filter((_, i) => i !== index)
    );
  };

  const handleReorder = (from: number, to: number) => {
    const updated = [...phases];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onFieldChange("content.phases", updated);
  };

  return (
    <ItemManager
      items={phases}
      getItemId={(phase) => phase.id}
      onAdd={handleAdd}
      onRemove={handleRemove}
      onReorder={handleReorder}
      addLabel="Add phase"
      minItems={1}
      renderItem={(phase, i) => (
        <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
          <input
            type="color"
            value={phase.color}
            onChange={(e) =>
              onFieldChange(`content.phases.${i}.color`, e.target.value)
            }
            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
          />
          <div className="flex-1 min-w-0">
            <InlineEditor
              value={phase.name}
              onChange={(v) =>
                onFieldChange(`content.phases.${i}.name`, v)
              }
            />
          </div>
          <div className="text-xs text-muted-foreground shrink-0">
            <InlineEditor
              value={phase.day_range}
              onChange={(v) =>
                onFieldChange(`content.phases.${i}.day_range`, v)
              }
              placeholder="Days 0–30"
            />
          </div>
        </div>
      )}
    />
  );
}

function EventsEditor({
  section,
  onFieldChange,
}: {
  section: GuidedJourneySection;
  onFieldChange: (path: string, value: unknown) => void;
}) {
  const events = section.content.events;
  const phases = section.content.phases;

  const handleAdd = () => {
    const newEvent = {
      id: crypto.randomUUID(),
      day: events.length > 0 ? events[events.length - 1].day + 1 : 0,
      label: "New Event",
      title: "Event Title",
      description: "Click to edit",
      phase_id: phases[0]?.id || "",
      personas: [],
      product: "",
      counter_values: {},
    };
    onFieldChange("content.events", [...events, newEvent]);
  };

  const handleRemove = (index: number) => {
    onFieldChange(
      "content.events",
      events.filter((_, i) => i !== index)
    );
  };

  const handleReorder = (from: number, to: number) => {
    const updated = [...events];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onFieldChange("content.events", updated);
  };

  return (
    <ItemManager
      items={events}
      getItemId={(event) => event.id}
      onAdd={handleAdd}
      onRemove={handleRemove}
      onReorder={handleReorder}
      addLabel="Add event"
      minItems={1}
      renderItem={(event, i) => {
        const phase = phases.find((p) => p.id === event.phase_id);
        return (
          <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-2">
            <div className="flex items-center gap-3">
              {/* Day number */}
              <div className="w-14 shrink-0">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Day
                </label>
                <input
                  type="number"
                  value={event.day}
                  onChange={(e) =>
                    onFieldChange(
                      `content.events.${i}.day`,
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full bg-white/10 rounded px-1.5 py-0.5 text-sm outline-none ring-1 ring-white/10 focus:ring-accent/50"
                />
              </div>
              {/* Title */}
              <div className="flex-1 min-w-0">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Title
                </label>
                <InlineEditor
                  value={event.title}
                  onChange={(v) =>
                    onFieldChange(`content.events.${i}.title`, v)
                  }
                />
              </div>
              {/* Phase dropdown */}
              <div className="shrink-0">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Phase
                </label>
                <select
                  value={event.phase_id}
                  onChange={(e) =>
                    onFieldChange(
                      `content.events.${i}.phase_id`,
                      e.target.value
                    )
                  }
                  className="block bg-white/10 rounded px-1.5 py-0.5 text-sm outline-none ring-1 ring-white/10 focus:ring-accent/50"
                  style={{
                    borderLeft: phase
                      ? `3px solid ${phase.color}`
                      : undefined,
                  }}
                >
                  {phases.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Label */}
            <div className="flex gap-3">
              <div className="w-14 shrink-0">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Label
                </label>
                <InlineEditor
                  value={event.label}
                  onChange={(v) =>
                    onFieldChange(`content.events.${i}.label`, v)
                  }
                  className="text-xs"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Description
                </label>
                <InlineEditor
                  value={event.description}
                  onChange={(v) =>
                    onFieldChange(`content.events.${i}.description`, v)
                  }
                  multiline
                  className="text-sm"
                />
              </div>
            </div>
            {/* Optional tags */}
            <div className="flex gap-3 text-xs">
              {event.product !== undefined && (
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Product
                  </label>
                  <InlineEditor
                    value={event.product || ""}
                    onChange={(v) =>
                      onFieldChange(`content.events.${i}.product`, v)
                    }
                    placeholder="Product tag"
                    className="text-xs"
                  />
                </div>
              )}
              {event.spend_delta !== undefined && (
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Spend
                  </label>
                  <InlineEditor
                    value={event.spend_delta || ""}
                    onChange={(v) =>
                      onFieldChange(
                        `content.events.${i}.spend_delta`,
                        v
                      )
                    }
                    placeholder="+$0"
                    className="text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}

function MetricsDisplay({
  section,
}: {
  section: GuidedJourneySection;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Sparkles className="w-3.5 h-3.5" />
        Metrics update automatically based on your events. Use AI chat to
        adjust.
      </div>
      <div className="grid grid-cols-2 gap-2">
        {section.content.counters.map((counter) => (
          <div
            key={counter.id}
            className="bg-white/5 rounded-lg p-3 border border-white/10"
          >
            <p className="text-xs text-muted-foreground">{counter.label}</p>
            <p className="text-lg font-bold">
              {counter.prefix}
              {counter.start_value}
              {counter.suffix}
            </p>
            {counter.sublabel && (
              <p className="text-[10px] text-muted-foreground">
                {counter.sublabel}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

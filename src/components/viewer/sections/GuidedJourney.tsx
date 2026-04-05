"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Users,
  DollarSign,
  Monitor,
  Building2,
  BarChart2,
  Zap,
  Globe,
  Layers,
} from "lucide-react";
import type {
  GuidedJourneySection,
  JourneyCounter,
  JourneyEvent,
  JourneyPhase,
} from "@/types/artifact";
import { cn } from "@/lib/utils/cn";

// ─── Icon mapping ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  users: Users,
  people: Users,
  dollar: DollarSign,
  money: DollarSign,
  spend: DollarSign,
  monitor: Monitor,
  screen: Monitor,
  building: Building2,
  team: Building2,
  teams: Building2,
  bar: BarChart2,
  chart: BarChart2,
  zap: Zap,
  globe: Globe,
  layers: Layers,
};

function resolveIcon(iconName?: string): React.ElementType {
  if (!iconName) return Users;
  const key = iconName.toLowerCase();
  return ICON_MAP[key] ?? Users;
}

// ─── Counter animation hook ───────────────────────────────────────────────────

function useAnimatedCounters(
  events: JourneyEvent[],
  activeIndex: number
): Record<string, number> {
  const prevValues = useRef<Record<string, number>>({});
  const [displayValues, setDisplayValues] = useState<Record<string, number>>(
    () => {
      const initial: Record<string, number> = {};
      if (events.length > 0) {
        for (const [k, v] of Object.entries(events[0].counter_values)) {
          initial[k] = v;
        }
      }
      return initial;
    }
  );
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!events[activeIndex]) return;

    const targets = events[activeIndex].counter_values;
    const starts = { ...prevValues.current };
    const startTime = performance.now();
    const duration = 600;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const current: Record<string, number> = {};
      for (const [key, target] of Object.entries(targets)) {
        const start = starts[key] ?? 0;
        current[key] = Math.round(start + (target - start) * eased);
      }
      setDisplayValues(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevValues.current = { ...targets };
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [activeIndex, events]);

  return displayValues;
}

// ─── Counter card ─────────────────────────────────────────────────────────────

function CounterCard({
  counter,
  displayValue,
  index,
}: {
  counter: JourneyCounter;
  displayValue: number;
  index: number;
}) {
  const Icon = resolveIcon(counter.icon);
  const color = counter.color ?? "var(--palette-accent1, #2fd8c8)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      viewport={{ once: true, margin: "-40px" }}
      className="relative rounded-xl border border-border bg-card p-4 overflow-hidden"
    >
      {/* Colored top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{ backgroundColor: color }}
      />

      {/* Icon row */}
      <div className="mt-1 flex items-center gap-2 mb-3">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md"
          style={{
            backgroundColor: color + "22",
            color: color,
          }}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        {counter.sublabel && (
          <span className="text-xs text-muted line-clamp-2">{counter.sublabel}</span>
        )}
      </div>

      {/* Animated value */}
      <div
        className="text-2xl font-bold tabular-nums tracking-tight"
        style={{ color }}
      >
        {counter.prefix ?? ""}
        {displayValue.toLocaleString()}
        {counter.suffix ?? ""}
      </div>

      {/* Label */}
      <div className="mt-1 text-xs text-muted">{counter.label}</div>
    </motion.div>
  );
}

// ─── Phase badge row ──────────────────────────────────────────────────────────

function cleanPhaseName(name: string): string {
  return name.replace(/^Phase\s+\d+:\s*/i, "");
}

function PhaseBadges({ phases }: { phases: JourneyPhase[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {phases.map((phase, i) => (
        <span
          key={phase.id}
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: phase.color + "26",
            color: phase.color,
          }}
        >
          Phase {i + 1}: {cleanPhaseName(phase.name)}{" "}
          <span className="ml-1 opacity-70">({phase.day_range})</span>
        </span>
      ))}
    </div>
  );
}

// ─── Timeline track ───────────────────────────────────────────────────────────

function TimelineTrack({
  events,
  phases,
  activeIndex,
  visited,
  onSelect,
}: {
  events: JourneyEvent[];
  phases: JourneyPhase[];
  activeIndex: number;
  visited: Set<number>;
  onSelect: (index: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);
  const phaseMap = Object.fromEntries(phases.map((p) => [p.id, p]));

  // Auto-scroll active node into view — skip on initial mount
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (!trackRef.current) return;
    const activeNode = trackRef.current.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`
    );
    if (activeNode) {
      activeNode.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeIndex]);

  // Position dots proportionally by day value, not by index
  const minDay = events.length > 0 ? Math.min(...events.map((e) => e.day)) : 0;
  const maxDay = events.length > 0 ? Math.max(...events.map((e) => e.day)) : 1;
  const daySpan = maxDay - minDay || 1;

  const getDayPct = (day: number) => ((day - minDay) / daySpan) * 100;
  const progressPct = events.length > 1 ? getDayPct(events[activeIndex].day) : 0;

  return (
    <div className="relative">
      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="overflow-x-auto pb-4"
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="px-6 pt-2" style={{ minWidth: "600px" }}>
          <div className="relative" style={{ height: "80px" }}>
            {/* Base rail */}
            <div className="absolute left-0 right-0 top-[20px] h-[2px] bg-border" />

            {/* Progress fill — proportional to day value */}
            <div
              className="absolute left-0 top-[20px] h-[2px] transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                backgroundColor:
                  events[activeIndex]
                    ? phaseMap[events[activeIndex].phase_id]?.color ??
                      "var(--palette-accent1, #2fd8c8)"
                    : "var(--palette-accent1, #2fd8c8)",
              }}
            />

            {/* Nodes — absolutely positioned by day */}
            {events.map((event, i) => {
              const phase = phaseMap[event.phase_id];
              const color =
                phase?.color ?? "var(--palette-accent1, #2fd8c8)";
              const isActive = i === activeIndex;
              const isVisited = visited.has(i) && !isActive;
              const leftPct = getDayPct(event.day);

              return (
                <button
                  key={event.id}
                  data-index={i}
                  onClick={() => onSelect(i)}
                  className="group absolute flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
                  style={{
                    left: `${leftPct}%`,
                    top: 0,
                    transform: "translateX(-50%)",
                  }}
                  aria-label={`${event.label}: ${event.title}`}
                  aria-current={isActive ? "true" : undefined}
                >
                {/* Dot */}
                <div
                  className={cn(
                    "transition-all duration-300 rounded-full flex items-center justify-center",
                    isActive ? "w-4 h-4" : "w-3 h-3"
                  )}
                  style={{
                    backgroundColor: isActive
                      ? color
                      : isVisited
                        ? color + "8C"
                        : "transparent",
                    borderWidth: isActive ? 0 : "2px",
                    borderStyle: "solid",
                    borderColor: isVisited ? color + "8C" : color + "50",
                    ...(isActive
                      ? {
                          boxShadow: `0 0 0 2px var(--background, #0e0e12), 0 0 0 4px ${color}`,
                        }
                      : {}),
                  }}
                />

                {/* Day / label */}
                {/^(Mo|Day|Week|Month|Year|Q\d)/i.test(event.label) ? (
                  <span
                    className={cn(
                      "mt-2 text-[10px] font-mono tabular-nums transition-colors whitespace-nowrap",
                      isActive
                        ? "font-bold"
                        : isVisited
                          ? "text-muted"
                          : "text-muted opacity-60"
                    )}
                    style={isActive ? { color } : {}}
                  >
                    {event.label}
                  </span>
                ) : (
                  <>
                    <span
                      className={cn(
                        "mt-2 text-[10px] font-mono tabular-nums transition-colors whitespace-nowrap",
                        isActive
                          ? "font-bold"
                          : isVisited
                            ? "text-muted"
                            : "text-muted opacity-60"
                      )}
                      style={isActive ? { color } : {}}
                    >
                      Day {event.day}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 max-w-[80px] text-center text-[9px] leading-tight transition-colors whitespace-nowrap",
                        isActive
                          ? "font-semibold"
                          : "text-muted opacity-50"
                      )}
                      style={isActive ? { color } : {}}
                    >
                      {event.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  event,
  phase,
}: {
  event: JourneyEvent;
  phase: JourneyPhase | undefined;
}) {
  const color = phase?.color ?? "var(--palette-accent1, #2fd8c8)";

  return (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border bg-card p-5"
      style={{ borderColor: color + "40" }}
    >
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-start gap-3">
        {/* Day pill */}
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: color + "22", color }}
        >
          {/^(Mo|Day|Week|Month|Year|Q\d)/i.test(event.label)
            ? event.label
            : `Day ${event.day}`}
        </span>

        {/* Persona badges */}
        {event.personas?.map((p) => (
          <span
            key={p}
            className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted"
          >
            {p}
          </span>
        ))}

        {/* Product badge */}
        {event.product && (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: "var(--palette-accent2, #7c6df0)" + "22",
              color: "var(--palette-accent2, #7c6df0)",
            }}
          >
            {event.product}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold leading-snug mb-2">{event.title}</h3>

      {/* Description */}
      <p className="text-sm text-muted leading-relaxed">{event.description}</p>

      {/* Trigger box */}
      {event.trigger && (
        <div
          className="mt-4 rounded-r-lg border-l-2 bg-card p-3"
          style={{
            borderLeftColor: color,
            backgroundColor: color + "0D",
          }}
        >
          <div
            className="mb-1 text-[10px] font-mono font-semibold uppercase tracking-widest"
            style={{ color }}
          >
            {event.trigger.label}
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {event.trigger.text}
          </p>
        </div>
      )}

      {/* Spend delta */}
      {event.spend_delta && (
        <div
          className="mt-3 text-xs font-semibold"
          style={{ color: "var(--palette-accent2, #7c6df0)" }}
        >
          {event.spend_delta} self-serve spend this event
        </div>
      )}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GuidedJourney({
  section,
}: {
  section: GuidedJourneySection;
}) {
  const { content } = section;
  const { phases, counters, events } = content;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));

  const displayValues = useAnimatedCounters(events, activeIndex);

  const phaseMap = Object.fromEntries(phases.map((p) => [p.id, p]));
  const activeEvent = events[activeIndex];
  const activePhase = activeEvent ? phaseMap[activeEvent.phase_id] : undefined;

  // Auto-advance
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev < events.length - 1 ? prev + 1 : prev;
        if (next === events.length - 1) setIsPlaying(false);
        setVisited((v) => new Set([...v, next]));
        return next;
      });
    }, content.interval_ms ?? 3000);
    return () => clearInterval(timer);
  }, [isPlaying, events.length, content.interval_ms]);

  const handleSelect = useCallback(
    (index: number) => {
      setActiveIndex(index);
      setVisited((v) => new Set([...v, index]));
      setIsPlaying(false);
    },
    []
  );

  const handlePlay = () => {
    if (activeIndex === events.length - 1) {
      // Reset then play
      setActiveIndex(0);
      setVisited(new Set([0]));
    }
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);

  const handleReset = () => {
    setIsPlaying(false);
    setActiveIndex(0);
    setVisited(new Set([0]));
  };

  if (!events.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-60px" }}
    >
      {/* Section header + controls row */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
          {section.subtitle && (
            <p className="mt-1.5 text-muted text-sm">{section.subtitle}</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePlay}
            disabled={isPlaying}
            aria-label="Play journey"
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              isPlaying
                ? "opacity-50 cursor-not-allowed bg-card border border-border text-muted"
                : "bg-[var(--palette-accent1,#2fd8c8)] text-background hover:opacity-90"
            )}
          >
            <Play className="h-3 w-3" />
            Play
          </button>
          <button
            onClick={handlePause}
            disabled={!isPlaying}
            aria-label="Pause journey"
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-all",
              !isPlaying
                ? "opacity-40 cursor-not-allowed text-muted"
                : "hover:bg-card text-foreground"
            )}
          >
            <Pause className="h-3 w-3" />
            Pause
          </button>
          <button
            onClick={handleReset}
            aria-label="Reset journey"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-card text-foreground transition-all"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Counter cards */}
      {counters.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {counters.map((counter, i) => (
            <CounterCard
              key={counter.id}
              counter={counter}
              displayValue={displayValues[counter.id] ?? counter.start_value}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Phase badges */}
      {phases.length > 0 && (
        <div className="mb-5">
          <PhaseBadges phases={phases} />
        </div>
      )}

      {/* Timeline track */}
      <div className="mb-5 rounded-xl border border-border bg-card px-4 py-4">
        <TimelineTrack
          events={events}
          phases={phases}
          activeIndex={activeIndex}
          visited={visited}
          onSelect={handleSelect}
        />
      </div>

      {/* Detail panel */}
      {activeEvent && (
        <DetailPanel event={activeEvent} phase={activePhase} />
      )}
    </motion.div>
  );
}

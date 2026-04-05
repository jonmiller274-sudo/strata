"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Artifact } from "@/types/artifact";
import { SidebarNav } from "./SidebarNav";
import { ProgressBarNav } from "./ProgressBarNav";
import { SectionRenderer } from "./SectionRenderer";
import { StrataFooter } from "./StrataFooter";
import { ChevronDown, Layers } from "lucide-react";

export function ArtifactViewer({
  artifact,
  isDemoPage = false,
}: {
  artifact: Artifact;
  isDemoPage?: boolean;
}) {
  const isBeatMode = artifact.layout_mode === "beats";

  const sidebarItems = artifact.sections.map((section) => ({
    id: section.id,
    title: section.title,
  }));

  // Refs for each beat section — used for keyboard navigation
  const beatRefs = useRef<(HTMLElement | null)[]>([]);
  // Ref for the scroll container itself — passed to ProgressBarNav
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  // Hide watermark when near bottom (prevents overlap with footer)
  const [hideWatermark, setHideWatermark] = useState(false);

  // Reset scroll to top on mount (prevents browser restoring mid-page position)
  useEffect(() => {
    if (!isBeatMode) return;
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo(0, 0);
    }
  }, [isBeatMode]);

  // Keyboard navigation for beats mode
  const getActiveBeatIndex = useCallback(() => {
    // Find the beat that occupies the most of the viewport
    let bestIndex = 0;
    let bestRatio = 0;
    beatRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const visible =
        Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      const ratio = visible / viewportHeight;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestIndex = i;
      }
    });
    return bestIndex;
  }, []);

  useEffect(() => {
    if (!isBeatMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys when user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowRight" ||
        e.key === " "
      ) {
        e.preventDefault();
        const current = getActiveBeatIndex();
        const next = Math.min(current + 1, beatRefs.current.length - 1);
        beatRefs.current[next]?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const current = getActiveBeatIndex();
        const prev = Math.max(current - 1, 0);
        beatRefs.current[prev]?.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Attach to the scroll container if available, otherwise window
    const container = scrollContainerRef.current ?? window;
    // scrollIntoView works relative to the viewport, so window keydown is fine
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBeatMode, getActiveBeatIndex]);

  // Build palette CSS custom properties if branding.palette is present
  const paletteStyle: React.CSSProperties = artifact.branding?.palette
    ? ({
        "--palette-accent1":
          artifact.branding.palette.accent1 ?? "var(--color-accent)",
        "--palette-accent2":
          artifact.branding.palette.accent2 ?? "var(--color-accent)",
        "--palette-accent3":
          artifact.branding.palette.accent3 ?? "var(--color-warning)",
        "--palette-accent4":
          artifact.branding.palette.accent4 ?? "var(--color-danger)",
        "--palette-accent5":
          artifact.branding.palette.accent5 ?? "var(--color-success)",
      } as React.CSSProperties)
    : {};

  // ===== BEATS LAYOUT =====
  if (isBeatMode) {
    return (
      <div
        data-theme={artifact.theme ?? "dark"}
        className="min-h-screen bg-background text-foreground"
        style={paletteStyle}
      >
        {/* Progress bar nav (or sidebar fallback) */}
        {artifact.nav_style === "progress-bar" ? (
          <ProgressBarNav
            items={sidebarItems}
            title={artifact.title}
            subtitle={artifact.subtitle}
            scrollContainerRef={scrollContainerRef}
          />
        ) : (
          <SidebarNav
            items={sidebarItems}
            title={artifact.title}
            subtitle={artifact.subtitle}
            logoUrl={artifact.branding?.logo_url}
          />
        )}

        {/* Scroll-snap container */}
        <main
          className={`beats-container${artifact.nav_style !== "progress-bar" ? " lg:ml-[var(--sidebar-width)]" : ""}`}
          ref={(el) => {
            scrollContainerRef.current = el;
          }}
          onScroll={(e) => {
            const el = e.currentTarget;
            const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
            setHideWatermark(atBottom);
          }}
        >
          {artifact.sections.map((section, index) => {
            const isLast = index === artifact.sections.length - 1;
            const beatNumber = String(index + 1).padStart(2, "0");
            const totalBeats = String(artifact.sections.length).padStart(
              2,
              "0"
            );

            return (
              <section
                key={section.id}
                id={section.id}
                className="beat-section"
                ref={(el) => {
                  beatRefs.current[index] = el;
                }}
              >
                {/* Beat label */}
                <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Beat {beatNumber} / {totalBeats}
                </p>

                {/* Section content — constrained width */}
                <div className="max-w-[900px] w-full">
                  <SectionRenderer section={section} />
                </div>

                {/* Scroll hint arrow — hidden on last beat */}
                {!isLast && (
                  <div
                    aria-hidden="true"
                    className="absolute bottom-8 left-1/2 text-muted-foreground"
                    style={{ animation: "bounce-hint 2s ease-in-out infinite" }}
                  >
                    <ChevronDown className="w-5 h-5 opacity-50" />
                  </div>
                )}
              </section>
            );
          })}

          <StrataFooter planTier={artifact.plan_tier} isDemoPage={isDemoPage} />
        </main>

        {/* Persistent watermark — free tier only */}
        {(!artifact.plan_tier || artifact.plan_tier === "free") && (
          <a
            href="https://sharestrata.com/discover?ref=artifact-watermark"
            target="_blank"
            rel="noopener noreferrer"
            className={`fixed bottom-4 left-2 sm:left-4 z-40 flex items-center gap-1.5 px-2 py-1 rounded-full bg-card border border-border shadow-sm transition-opacity ${hideWatermark ? "opacity-0 pointer-events-none" : "opacity-80 hover:opacity-100"}`}
          >
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Strata
            </span>
          </a>
        )}
      </div>
    );
  }

  // ===== CONTINUOUS LAYOUT (default) =====
  return (
    <div
      data-theme={artifact.theme ?? "dark"}
      className="min-h-screen bg-background text-foreground"
      style={paletteStyle}
    >
      {/* Nav — sidebar by default, progress-bar if specified */}
      {artifact.nav_style === "progress-bar" ? (
        <ProgressBarNav
          items={sidebarItems}
          title={artifact.title}
          subtitle={artifact.subtitle}
        />
      ) : (
        <SidebarNav
          items={sidebarItems}
          title={artifact.title}
          subtitle={artifact.subtitle}
          logoUrl={artifact.branding?.logo_url}
        />
      )}

      {/* Main content area */}
      <main className="lg:ml-[var(--sidebar-width)]">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-12 lg:py-16">
          {/* Header — visible on mobile only (desktop shows in sidebar) */}
          <header className="mb-12 lg:hidden">
            <h1 className="text-3xl font-bold tracking-tight">
              {artifact.title}
            </h1>
            {artifact.subtitle && (
              <p className="mt-2 text-lg text-muted">{artifact.subtitle}</p>
            )}
            {artifact.author_name && (
              <p className="mt-4 text-sm text-muted-foreground">
                By {artifact.author_name}
              </p>
            )}
          </header>

          {/* Sections */}
          <div className="space-y-16">
            {artifact.sections.map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))}
          </div>
        </div>

        <StrataFooter planTier={artifact.plan_tier} isDemoPage={isDemoPage} />
      </main>
    </div>
  );
}

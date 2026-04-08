"use client";

import type { Section } from "@/types/artifact";
import { RichTextCollapsible } from "./sections/RichTextCollapsible";
import { ExpandableCardGrid } from "./sections/ExpandableCardGrid";
import { AnimatedTimeline } from "./sections/AnimatedTimeline";
import { TierTable } from "./sections/TierTable";
import { MetricDashboard } from "./sections/MetricDashboard";
import { DataVisualization } from "./sections/DataVisualization";
import { HubMockup } from "./sections/HubMockup";
import { GuidedJourney } from "./sections/GuidedJourney";
import { ComparisonMatrix } from "./sections/ComparisonMatrix";
import { HeroStats } from "./sections/HeroStats";
import { CallToAction } from "./sections/CallToAction";

const SECTION_COMPONENTS: Record<
  Section["type"],
  React.ComponentType<{ section: never }>
> = {
  "rich-text": RichTextCollapsible as React.ComponentType<{ section: never }>,
  "expandable-cards": ExpandableCardGrid as React.ComponentType<{
    section: never;
  }>,
  timeline: AnimatedTimeline as React.ComponentType<{ section: never }>,
  "tier-table": TierTable as React.ComponentType<{ section: never }>,
  "metric-dashboard": MetricDashboard as React.ComponentType<{
    section: never;
  }>,
  "data-viz": DataVisualization as React.ComponentType<{ section: never }>,
  "hub-mockup": HubMockup as React.ComponentType<{ section: never }>,
  "guided-journey": GuidedJourney as React.ComponentType<{ section: never }>,
  "comparison-matrix": ComparisonMatrix as React.ComponentType<{ section: never }>,
  "hero-stats": HeroStats as React.ComponentType<{ section: never }>,
  "call-to-action": CallToAction as React.ComponentType<{ section: never }>,
};

export function SectionRenderer({ section }: { section: Section }) {
  const Component = SECTION_COMPONENTS[section.type];

  if (!Component) {
    return null;
  }

  return (
    <section id={section.id} className="scroll-mt-8">
      {/* Render uploaded image at full resolution when present.
          Uses max-width: 100% so it scales down in narrow containers but
          never scales UP (preserving native pixel density on retina displays).
          image-rendering: -webkit-optimize-contrast keeps browser from
          applying blurry bilinear interpolation during any downscaling. */}
      {section.image_url && (
        <div className="mb-6 rounded-xl overflow-hidden border border-white/10">
          <img
            src={section.image_url}
            alt={section.title || "Section image"}
            // block + max-w-full: intrinsic width up to container max — never upscale.
            // On retina Macs screenshots are 2x device pixels; displaying at natural
            // CSS width keeps 1 source pixel = 1 CSS pixel = 2 physical pixels (sharp).
            // Forcing w-full would upscale small screenshots and cause blurriness.
            className="block max-w-full w-auto h-auto"
          />
        </div>
      )}
      <Component section={section as never} />
    </section>
  );
}

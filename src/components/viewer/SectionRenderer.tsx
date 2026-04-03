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
        </div>
      )}
      <Component section={section as never} />
    </section>
  );
}

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
      <Component section={section as never} />
    </section>
  );
}

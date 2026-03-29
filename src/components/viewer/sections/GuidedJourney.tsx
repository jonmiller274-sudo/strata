"use client";

import type { GuidedJourneySection } from "@/types/artifact";

export function GuidedJourney({
  section,
}: {
  section: GuidedJourneySection;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
      {section.subtitle && (
        <p className="mt-2 text-muted">{section.subtitle}</p>
      )}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <p className="text-muted">Guided Journey — implementation in progress</p>
      </div>
    </div>
  );
}

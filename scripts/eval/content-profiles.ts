/**
 * content-profiles.ts — Content diversity profiles for test artifact generation.
 *
 * Each profile defines a content pattern that exercises different rendering
 * edge cases. The generator creates artifacts with these profiles applied
 * across all section types to ensure comprehensive coverage.
 */

export interface ContentProfile {
  id: string;
  label: string;
  description: string;
  /** Approximate word count per text field */
  textLength: "minimal" | "short" | "medium" | "long" | "very-long";
  /** Number of items in arrays (cards, timeline steps, metrics, etc.) */
  itemCount: "few" | "normal" | "many";
  /** Whether to include optional fields */
  includeOptionals: boolean;
  /** Whether values are extreme (large numbers, long titles, etc.) */
  extremeValues: boolean;
  /** Theme to render with */
  theme: "dark" | "light";
}

export const CONTENT_PROFILES: ContentProfile[] = [
  {
    id: "baseline",
    label: "Baseline (Golden)",
    description: "Ideal content — balanced length, normal count, all optionals. The reference standard.",
    textLength: "medium",
    itemCount: "normal",
    includeOptionals: true,
    extremeValues: false,
    theme: "dark",
  },
  {
    id: "minimal",
    label: "Minimal Content",
    description: "Shortest possible content — tests empty state handling and minimum viable rendering.",
    textLength: "minimal",
    itemCount: "few",
    includeOptionals: false,
    extremeValues: false,
    theme: "dark",
  },
  {
    id: "overflow",
    label: "Overflow Stress",
    description: "Very long text, many items, extreme values — tests text overflow, grid wrapping, large numbers.",
    textLength: "very-long",
    itemCount: "many",
    includeOptionals: true,
    extremeValues: true,
    theme: "dark",
  },
  {
    id: "light-theme",
    label: "Light Theme",
    description: "Baseline content in light theme — tests color contrast and theming.",
    textLength: "medium",
    itemCount: "normal",
    includeOptionals: true,
    extremeValues: false,
    theme: "light",
  },
  {
    id: "data-heavy",
    label: "Data-Heavy",
    description: "Many metrics, large tables, dense charts — tests data-rich section rendering.",
    textLength: "short",
    itemCount: "many",
    includeOptionals: true,
    extremeValues: true,
    theme: "dark",
  },
];

// How profiles map to item counts
export function getItemCount(profile: ContentProfile): number {
  switch (profile.itemCount) {
    case "few": return 2;
    case "normal": return 4;
    case "many": return 8;
  }
}

// How profiles map to text lengths
export function getTextLength(profile: ContentProfile): { summary: number; detail: number; title: number } {
  switch (profile.textLength) {
    case "minimal": return { summary: 10, detail: 0, title: 3 };
    case "short": return { summary: 30, detail: 20, title: 5 };
    case "medium": return { summary: 60, detail: 80, title: 8 };
    case "long": return { summary: 120, detail: 200, title: 12 };
    case "very-long": return { summary: 250, detail: 400, title: 20 };
  }
}

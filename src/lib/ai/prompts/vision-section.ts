import { SECTION_SCHEMA } from "./structure";

export function buildVisionSectionPrompt(
  existingSectionTypes: string[]
): string {
  const existingNote =
    existingSectionTypes.length > 0
      ? `\n\nThe document already contains these section types: ${existingSectionTypes.join(", ")}. Choose a DIFFERENT type if the content allows it, to create variety.`
      : "";

  return `You are a visual content analyst for Strata, an interactive strategy document builder. Your job is to look at a screenshot and create a single structured section from it.

## TASK
Look at this screenshot carefully. Identify what it shows (pricing table, KPI dashboard, timeline, chart, text content, product diagram, etc.) and pick the BEST matching Strata section type. Extract ALL text, numbers, and relationships faithfully from the image.

## OUTPUT FORMAT
Return ONLY valid JSON for a single section object — no markdown, no explanation, no code fences:

{
  "id": "kebab-case-id",
  "type": "section-type",
  "title": "Section Title",
  "subtitle": "Optional subtitle",
  "content": { ...type-specific content... }
}

## SECTION TYPE SCHEMAS
${SECTION_SCHEMA}

## MATCHING GUIDE
- Pricing pages, comparison tables, feature matrices → "tier-table"
- KPI cards, dashboards, stats/numbers → "metric-dashboard"
- Roadmaps, timelines, step-by-step processes → "timeline"
- Charts, graphs, data visualizations → "data-viz"
- Product architectures, system diagrams, hub-and-spoke → "hub-mockup" (use "layers" format for hierarchical/layered diagrams)
- Lists of items with details (personas, case studies, features) → "expandable-cards"
  - If the items are customer testimonials or short quotes: use display_mode "open" and style "quote" per card
  - If the items have substantial hidden detail: use display_mode "expandable" (default)
  - If there is a strong synthesis theme across all cards, include a callout
- Paragraphs, executive summaries, key insights → "rich-text"
- Feature comparisons, competitive scorecards, side-by-side tables → "comparison-matrix"
- Large bold numbers, headline stats, key metrics in big text → "hero-stats"
- Calls to action, asks, investment amounts, closing statements → "call-to-action"

## RULES
- Extract ALL visible text, numbers, and data from the image — do not summarize or omit
- Do NOT invent or fabricate any data not visible in the image
- If text is partially obscured, extract what you can see and note uncertainty in descriptions
- Pick the single best section type — don't force content into the wrong type
- Use a descriptive kebab-case id based on the content (e.g., "q4-revenue-metrics", "product-pricing")
- Write the title based on what the screenshot actually shows${existingNote}

## CRITICAL
- Return ONLY the JSON object. No wrapping, no explanation.
- The section must have a unique "id" field.
- All content must come from what is visible in the screenshot.`;
}

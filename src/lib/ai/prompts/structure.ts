import type { TemplateType } from "@/types/artifact";

const SECTION_SCHEMA = `
Each section must have:
- "id": a unique kebab-case string (e.g., "market-overview")
- "type": one of "rich-text", "expandable-cards", "timeline", "tier-table", "metric-dashboard", "data-viz", "hub-mockup"
- "title": section heading shown in sidebar nav
- "subtitle": optional brief description
- "content": type-specific content object (see below)

SECTION TYPE SCHEMAS:

1. "rich-text" content:
{
  "summary": "Main text visible by default (2-4 paragraphs, separated by \\n\\n)",
  "detail": "Optional expanded text revealed on click (deeper evidence, data)",
  "callout": { "type": "insight" | "warning" | "quote", "text": "Key insight" }
}

2. "expandable-cards" content:
{
  "columns": 2 | 3 | 4,
  "cards": [
    {
      "id": "unique-id",
      "title": "Card Title",
      "summary": "1-2 sentence summary shown by default",
      "detail": "Optional expanded detail text",
      "tags": ["Tag1", "Tag2"],
      "metric": { "value": "$2.1B", "label": "Valuation" }
    }
  ]
}

3. "timeline" content:
{
  "steps": [
    {
      "id": "step-id",
      "label": "Day 1" or "Week 2" or "Q1 2026",
      "title": "Step Title",
      "description": "What happens at this stage",
      "status": "completed" | "current" | "upcoming"
    }
  ]
}

4. "tier-table" content:
{
  "columns": [
    {
      "name": "Tier Name",
      "price": "$79",
      "price_period": "month",
      "description": "Short description",
      "cta": "Button text",
      "is_highlighted": true,
      "features": [
        { "name": "Feature name", "included": true | false | "Custom value" }
      ]
    }
  ]
}

5. "metric-dashboard" content:
{
  "metrics": [
    {
      "id": "metric-id",
      "label": "Metric Label",
      "value": "$1M",
      "numeric_value": 900,
      "prefix": "$",
      "suffix": "%",
      "description": "Brief context for this metric",
      "change": { "direction": "up" | "down" | "neutral", "value": "+15%" }
    }
  ]
}
Note: only set numeric_value for numbers under 10000 that should animate. For formatted values like "$1M", just use the value string.

6. "data-viz" content:
{
  "chart_type": "bar" | "funnel",
  "data": [{ "label": "Category", "value": 42 }],
  "x_key": "label",
  "y_key": "value",
  "description": "Chart description"
}

7. "hub-mockup" content:
{
  "center": { "id": "center-id", "label": "Central Hub", "description": "Core element", "color": "#6366f1" },
  "nodes": [
    { "id": "node-id", "label": "Node Name", "description": "Node description", "color": "#hex" }
  ],
  "connections": [
    { "from": "center-id", "to": "node-id", "label": "Relationship" }
  ],
  "description": "Overall description"
}
`;

const TEMPLATE_GUIDANCE: Record<TemplateType, string> = {
  "platform-vision": `Create a Platform Vision artifact. Suggested sections:
1. rich-text: Executive overview of the platform vision
2. hub-mockup: How products/capabilities connect in the platform
3. expandable-cards: Individual product/capability deep-dives
4. timeline: Platform evolution roadmap
5. metric-dashboard: Key platform metrics and targets
6. rich-text: Strategic rationale and market positioning`,

  "customer-journey": `Create a Customer Journey artifact. Suggested sections:
1. rich-text: Journey overview and key insight
2. timeline: Step-by-step customer journey (the core of this artifact)
3. expandable-cards: Persona profiles or touchpoint details
4. metric-dashboard: Conversion metrics at each stage
5. data-viz: Funnel visualization
6. rich-text: Key learnings and next steps`,

  "gtm-strategy": `Create a Go-to-Market Strategy artifact. Suggested sections:
1. rich-text: Market thesis and positioning
2. expandable-cards: Target segments/ICPs
3. timeline: GTM rollout plan
4. data-viz: Market sizing or channel performance
5. tier-table: Pricing strategy
6. metric-dashboard: GTM targets and KPIs
7. rich-text: Competitive differentiation`,

  "product-roadmap": `Create a Product Roadmap artifact. Suggested sections:
1. rich-text: Product vision and strategy
2. timeline: Multi-quarter build plan with milestones
3. expandable-cards: Feature/initiative deep-dives
4. hub-mockup: How features connect to the overall product
5. metric-dashboard: Success metrics and targets
6. rich-text: What we're cutting and why`,
};

export function buildStructurePrompt(templateType: TemplateType): string {
  return `You are a strategic communication specialist. Your job is to take raw content and structure it into a polished interactive artifact.

## OUTPUT FORMAT
Return ONLY valid JSON matching this schema — no markdown, no explanation, no code fences:

{
  "title": "Artifact Title",
  "subtitle": "One-line subtitle",
  "sections": [ ...section objects... ]
}

## SECTION TYPE SCHEMAS
${SECTION_SCHEMA}

## TEMPLATE GUIDANCE
${TEMPLATE_GUIDANCE[templateType]}

## QUALITY RULES
- Write at executive level — concise, specific, confident
- Use progressive disclosure: summary first, detail on expand
- Include real numbers and specifics from the user's content — don't invent data
- Each section title should be scannable and meaningful in a sidebar nav
- Aim for 5-8 sections total
- Use varied section types — don't repeat the same type consecutively
- Callouts should highlight genuine insights, not just restate the text
- For timelines, include 4-8 steps with clear progression
- For cards, include 3-8 items with substantive content
- For metrics, include 3-6 KPIs with descriptions

## CRITICAL
- Return ONLY the JSON object. No wrapping, no explanation.
- Every section must have a unique "id" field.
- All content must come from what the user provided — enhance and structure, but don't fabricate facts or numbers.`;
}

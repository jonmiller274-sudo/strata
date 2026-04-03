import type { TemplateType } from "@/types/artifact";

export const SECTION_SCHEMA = `
Each section must have:
- "id": a unique kebab-case string (e.g., "market-overview")
- "type": one of "rich-text", "expandable-cards", "timeline", "tier-table", "metric-dashboard", "data-viz", "hub-mockup", "guided-journey"
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
  "display_mode": "expandable" | "open",
  "cards": [
    {
      "id": "unique-id",
      "title": "Card Title",
      "summary": "1-2 sentence summary shown by default",
      "detail": "Optional expanded detail text",
      "tags": ["Tag1", "Tag2"],
      "metric": { "value": "$2.1B", "label": "Valuation" },
      "style": "default" | "quote"
    }
  ],
  "callout": { "type": "insight" | "warning" | "quote", "text": "Synthesis statement tying cards together" }
}
Use display_mode "open" for testimonials, customer quotes, or short reference cards where all content should be visible at once. Use "expandable" (default) when cards have detail text worth hiding behind a click.
Set style "quote" on individual cards that are testimonials or direct customer quotes — these render with italic text and a left accent border instead of a top border.
Include a callout when there is a strong synthesis insight or theme that ties all the cards together.
Omit display_mode, style, and callout when not applicable — they are all optional.

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

For HIERARCHICAL diagrams (org charts, architecture layers, flow-down structures), use "layers":
{
  "center": { "id": "top-id", "label": "Top Node", "description": "Root element" },
  "nodes": [],
  "layers": [
    { "label": "Level Name", "nodes": [{ "id": "n1", "label": "Node", "description": "Desc" }] },
    { "label": "Next Level", "nodes": [{ "id": "n2", "label": "Node 2", "description": "Desc" }] }
  ],
  "description": "Overall description"
}

For FLAT hub-and-spoke diagrams (one center with surrounding items), use the classic format:
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

IMPORTANT: If the image shows a TOP-DOWN HIERARCHY (Company > Division > Product > etc.), ALWAYS use "layers". Each hierarchy level = one layer. Order top to bottom.

8. "guided-journey" content:
{
  "phases": [
    { "id": "phase-1", "name": "Phase Name", "color": "#6366f1", "day_range": "Days 0–14" }
  ],
  "counters": [
    { "id": "counter-1", "label": "Counter Label", "sublabel": "Optional", "icon": "Users", "prefix": "$", "suffix": "", "start_value": 0, "color": "#6366f1" }
  ],
  "events": [
    {
      "id": "event-1",
      "day": 1,
      "label": "Week 1",
      "title": "Event Title",
      "description": "What happens at this event (markdown)",
      "phase_id": "phase-1",
      "personas": ["Persona Name"],
      "product": "Product Name",
      "trigger": { "label": "Trigger Label", "text": "How this gets triggered" },
      "spend_delta": "+$500",
      "counter_values": { "counter-1": 100 }
    }
  ],
  "autoplay": true,
  "interval_ms": 3000
}
Note: guided-journey is an interactive animated timeline with counters that update per event. Each event belongs to a phase and sets counter values. Phases define color-coded segments. Counters animate between values as the user steps through events. Use for customer journeys, revenue expansion stories, adoption paths.
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

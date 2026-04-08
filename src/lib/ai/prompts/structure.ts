import type { TemplateType } from "@/types/artifact";

export const SECTION_SCHEMA = `
Each section must have:
- "id": a unique kebab-case string (e.g., "market-overview")
- "type": one of "rich-text", "expandable-cards", "timeline", "tier-table", "metric-dashboard", "data-viz", "hub-mockup", "guided-journey", "comparison-matrix", "hero-stats", "call-to-action"
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

9. "comparison-matrix" content:
{
  "columns": [{ "id": "unique-id", "label": "Column Name", "highlight": true }],
  "rows": [
    { "id": "row-id", "label": "Feature Name", "description": "Optional detail", "values": [true, false, "Custom text"] }
  ],
  "verdict": { "label": "Score", "values": ["4/4", "1/4"] }
}
Notes: values array must match columns order. true=checkmark, false=dash. Use for competitive scorecards, feature comparisons, vendor evaluations.

10. "hero-stats" content:
{
  "stats": [
    { "id": "stat-id", "value": "40%+", "label": "face deactivation", "sublabel": "Optional context", "color": "#hex" }
  ],
  "layout": "row"
}
Notes: 2-4 stats maximum. Values are display strings (NOT numbers). Use for bold headline numbers that need maximum visual impact. Do NOT use metric-dashboard when you need pure visual punch.

11. "call-to-action" content:
{
  "headline": "The key ask or takeaway in one sentence",
  "value": "$3M",
  "value_context": "Less than 0.04% of annual bookings",
  "items": ["10,000 cameras", "Rideshare drivers first", "2-3 pilot cities"],
  "style": "bold"
}
Notes: Use as the closing section for proposals, pitches, and asks. Keep headline to one line. The value should be unmissable. style: "bold" for proposals, "subtle" for softer CTAs.
`;

const TEMPLATE_GUIDANCE: Record<TemplateType, string> = {
  "partnership-proposal": `Create a Partnership Proposal artifact.
TONE: Persuasive and concise. Short declarative statements. Minimize prose. Every section should have a clear takeaway.
Suggested sections:
1. rich-text: Brief partnership thesis — why now, why together (2-3 paragraphs MAX)
2. hero-stats: 2-4 headline numbers that justify the partnership
3. comparison-matrix: Side-by-side capabilities or competitive coverage
4. expandable-cards: What each party brings (2 cards, one per partner)
5. timeline: Partnership rollout or pilot milestones
6. metric-dashboard: Investment model and projected returns
7. call-to-action: The specific ask — investment, commitment, next step`,

  "sales-proposal": `Create a Sales Proposal artifact.
TONE: Persuasive and evidence-based. Lead with the customer's problem, then your solution. Punchy, not narrative.
Suggested sections:
1. rich-text: Customer problem and proposed solution (concise)
2. hero-stats: Key proof points (ROI, time saved, cost reduction)
3. comparison-matrix: Your solution vs alternatives or status quo
4. expandable-cards: Solution components or product capabilities
5. metric-dashboard: Pricing and expected outcomes
6. timeline: Implementation timeline
7. call-to-action: Next steps and pricing summary`,

  "investor-deck": `Create an Investor Deck artifact.
TONE: Narrative with data support. Tell the story of the opportunity, backed by metrics.
Suggested sections:
1. rich-text: Vision and market thesis
2. hero-stats: Traction metrics (ARR, users, growth rate)
3. expandable-cards: Product or market segments
4. data-viz: Market sizing or growth charts
5. hub-mockup: Platform architecture or ecosystem
6. timeline: Milestones achieved and roadmap ahead
7. metric-dashboard: Key financials and targets
8. call-to-action: The raise — amount, use of funds, terms`,

  "board-deck": `Create a Board Deck artifact.
TONE: Strategic and analytical. Progressive disclosure — summary first, detail on expand.
Suggested sections:
1. rich-text: Executive summary with key decisions needed
2. metric-dashboard: Quarterly KPIs and performance vs targets
3. data-viz: Revenue, growth, or pipeline charts
4. expandable-cards: Strategic initiatives status
5. timeline: Key milestones and upcoming priorities
6. rich-text: Risks, asks, and discussion topics`,

  "qbr": `Create a QBR / Business Review artifact.
TONE: Data-forward. Lead with metrics, support with narrative. Scorecard style.
Suggested sections:
1. hero-stats: Top-line performance numbers
2. metric-dashboard: Detailed KPIs with change indicators
3. data-viz: Trend charts (revenue, pipeline, conversion)
4. expandable-cards: Account highlights or deal reviews
5. comparison-matrix: Performance vs targets or vs prior quarter
6. timeline: Action items and next quarter priorities
7. rich-text: Key learnings and strategic adjustments`,

  "team-update": `Create a Team / Company Update artifact.
TONE: Clear and motivating. Narrative with highlights. Accessible to all levels.
Suggested sections:
1. rich-text: What happened and why it matters
2. hero-stats: Key wins or milestones (2-3 numbers)
3. expandable-cards: Team or project highlights
4. timeline: What's coming next
5. rich-text: Shoutouts, asks, or closing thoughts`,

  "gtm-strategy": `Create a Go-to-Market Strategy artifact.
TONE: Analytical with narrative framing. Data-backed positioning.
Suggested sections:
1. rich-text: Market thesis and positioning
2. expandable-cards: Target segments or ICPs
3. hero-stats: Market size and opportunity metrics
4. timeline: GTM rollout plan with milestones
5. data-viz: Market sizing or channel performance
6. tier-table: Pricing strategy
7. metric-dashboard: GTM targets and KPIs
8. comparison-matrix: Competitive positioning`,

  "product-roadmap": `Create a Product Roadmap artifact.
TONE: Clear and structured. Timeline-driven. Balance vision with specifics.
Suggested sections:
1. rich-text: Product vision and strategy context
2. timeline: Multi-quarter build plan with milestones
3. expandable-cards: Feature or initiative deep-dives
4. hub-mockup: How features connect to the overall product
5. metric-dashboard: Success metrics and targets
6. hero-stats: Key product metrics or adoption numbers`,
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

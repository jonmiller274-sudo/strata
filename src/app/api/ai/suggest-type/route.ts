import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/generate";
import type { SectionType } from "@/types/artifact";

export const maxDuration = 60;

const VALID_TYPES: SectionType[] = [
  "rich-text",
  "expandable-cards",
  "timeline",
  "tier-table",
  "metric-dashboard",
  "data-viz",
  "hub-mockup",
  "guided-journey",
  "comparison-matrix",
  "hero-stats",
  "call-to-action",
];

export async function POST(req: NextRequest) {
  try {
    const { description } = (await req.json()) as { description: string };

    if (!description) {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You classify section descriptions into section types for a strategy document builder.

Valid types: ${VALID_TYPES.join(", ")}

Type descriptions:
- rich-text: Text content with optional expandable detail and callouts
- expandable-cards: Grid of cards (personas, competitors, features)
- timeline: Step-by-step progression (roadmaps, journeys, plans)
- tier-table: Comparison or pricing tables
- metric-dashboard: KPI cards with numbers and trends
- data-viz: Charts and data visualizations
- hub-mockup: Hub-and-spoke diagrams showing connections
- guided-journey: Interactive day-by-day journey with counters
- comparison-matrix: Side-by-side comparison table with checkmarks for competitive scorecards
- hero-stats: 2-4 large bold headline numbers for maximum visual impact
- call-to-action: Full-width ask block with a bold number or sentence

Return ONLY a JSON object: { "type": "<type>", "confidence": <0-1> }`;

    const result = await generateJSON("suggest-type", systemPrompt, description, {
      maxTokens: 100,
      temperature: 0,
    });

    let parsed: { type: string; confidence: number };
    try {
      parsed = JSON.parse(result.content);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 502 }
      );
    }

    // Validate the type is one we recognize
    if (!VALID_TYPES.includes(parsed.type as SectionType)) {
      parsed.type = "rich-text"; // Safe fallback
      parsed.confidence = 0;
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[AI Suggest Type] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

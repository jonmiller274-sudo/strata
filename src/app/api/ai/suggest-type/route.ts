import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/ai/client";
import type { SectionType } from "@/types/artifact";

const VALID_TYPES: SectionType[] = [
  "rich-text",
  "expandable-cards",
  "timeline",
  "tier-table",
  "metric-dashboard",
  "data-viz",
  "hub-mockup",
  "guided-journey",
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

    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      max_tokens: 100,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You classify section descriptions into section types for a strategy document builder.

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

Return ONLY a JSON object: { "type": "<type>", "confidence": <0-1> }`,
        },
        { role: "user", content: description },
      ],
      response_format: { type: "json_object" },
    });

    const message = response.choices[0]?.message;
    if (!message?.content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    let result: { type: string; confidence: number };
    try {
      result = JSON.parse(message.content);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 502 }
      );
    }

    // Validate the type is one we recognize
    if (!VALID_TYPES.includes(result.type as SectionType)) {
      result.type = "rich-text"; // Safe fallback
      result.confidence = 0;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[AI Suggest Type] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

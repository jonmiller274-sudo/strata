import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/generate";
import { buildRemapPrompt } from "@/lib/ai/prompts/remap-section";
import type { Section, SectionType } from "@/types/artifact";

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
];

function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) return text.slice(start, end + 1);
  return text;
}

// Minimal validation that content has required top-level fields for each type
function validateContentShape(
  type: SectionType,
  content: Record<string, unknown>
): string | null {
  if (!content || typeof content !== "object") return "missing content object";
  switch (type) {
    case "rich-text":
      if (typeof content.summary !== "string") return "rich-text requires content.summary";
      break;
    case "expandable-cards":
      if (!Array.isArray(content.cards)) return "expandable-cards requires content.cards array";
      break;
    case "timeline":
      if (!Array.isArray(content.steps)) return "timeline requires content.steps array";
      break;
    case "tier-table":
      if (!Array.isArray(content.columns)) return "tier-table requires content.columns array";
      break;
    case "metric-dashboard":
      if (!Array.isArray(content.metrics)) return "metric-dashboard requires content.metrics array";
      break;
    case "data-viz":
      if (!Array.isArray(content.data)) return "data-viz requires content.data array";
      break;
    case "hub-mockup":
      if (!content.center || typeof content.center !== "object") return "hub-mockup requires content.center";
      break;
    case "guided-journey":
      if (!Array.isArray(content.events)) return "guided-journey requires content.events array";
      if (!Array.isArray(content.phases)) return "guided-journey requires content.phases array";
      if (!Array.isArray(content.counters)) return "guided-journey requires content.counters array";
      break;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { section, targetType } = (await req.json()) as {
      section: Section;
      targetType: SectionType;
    };

    if (!section || !targetType) {
      return NextResponse.json(
        { error: "section and targetType are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(targetType)) {
      return NextResponse.json(
        { error: `Invalid target type: ${targetType}` },
        { status: 400 }
      );
    }

    if (section.type === targetType) {
      return NextResponse.json(
        { error: "Target type is the same as current type" },
        { status: 400 }
      );
    }

    const systemPrompt = buildRemapPrompt(targetType);
    const userMessage = `Here is the current section to remap:\n\n${JSON.stringify(section, null, 2)}`;

    const result = await generateJSON("remap-section", systemPrompt, userMessage, {
      maxTokens: 4000,
      temperature: 0.5,
    });

    let remapped: Section;
    try {
      remapped = JSON.parse(extractJSON(result.content)) as Section;
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 502 }
      );
    }

    // Enforce identity preservation server-side
    remapped.id = section.id;
    remapped.title = section.title;
    remapped.subtitle = section.subtitle;
    if (section.image_url) {
      remapped.image_url = section.image_url;
    }

    // Validate the AI produced the requested type
    if (remapped.type !== targetType) {
      return NextResponse.json(
        { error: "AI produced wrong section type — try again" },
        { status: 502 }
      );
    }

    // Validate content has required top-level fields for the target type
    const contentError = validateContentShape(targetType, remapped.content);
    if (contentError) {
      return NextResponse.json(
        { error: `AI produced malformed content: ${contentError}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      section: remapped,
      usage: {
        input_tokens: result.usage.inputTokens,
        output_tokens: result.usage.outputTokens,
        cost: result.usage.cost,
      },
    });
  } catch (error) {
    console.error("[AI Remap Section] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

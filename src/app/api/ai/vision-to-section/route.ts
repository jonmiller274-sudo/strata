import { NextRequest, NextResponse } from "next/server";
import { generateVision } from "@/lib/ai/generate";
import type { ImageMediaType } from "@/lib/ai/generate";
import { buildVisionSectionPrompt } from "@/lib/ai/prompts/vision-section";
import { createClient } from "@/lib/supabase/server";
import type { SectionType } from "@/types/artifact";

export const maxDuration = 60;

const ALLOWED_MIME_TYPES: ImageMediaType[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

// 5MB raw image = ~6.67MB base64 (4/3 encoding ratio)
const MAX_BASE64_LENGTH = Math.ceil((5 * 1024 * 1024 * 4) / 3);

const VALID_SECTION_TYPES: SectionType[] = [
  "rich-text", "expandable-cards", "timeline", "tier-table",
  "metric-dashboard", "data-viz", "hub-mockup", "guided-journey",
];

/** Strip markdown fences or surrounding text from AI response before JSON.parse */
function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) return text.slice(start, end + 1);
  return text;
}

export async function POST(req: NextRequest) {
  try {
    // Auth gate — allow Supabase session OR edit key
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const editKey = process.env.STRATA_EDIT_KEY?.trim();
    const url = new URL(req.url);
    const keyParam = url.searchParams.get("key");
    const hasValidKey = editKey && keyParam === editKey;
    if (!user && !hasValidKey) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { imageBase64, mimeType, context } = body as {
      imageBase64: string;
      mimeType: ImageMediaType;
      context?: {
        title?: string;
        existingSectionTypes?: string[];
      };
    };

    // Validate required fields
    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "imageBase64 and mimeType are required" },
        { status: 400 }
      );
    }

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported image type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate size
    if (imageBase64.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { error: "Image too large. Maximum 5MB." },
        { status: 400 }
      );
    }

    // Validate and sanitize context
    const existingSectionTypes = (context?.existingSectionTypes ?? [])
      .filter((t: string) => VALID_SECTION_TYPES.includes(t as SectionType))
      .slice(0, 20);
    const systemPrompt = buildVisionSectionPrompt(existingSectionTypes);

    const safeTitle = (context?.title ?? "").slice(0, 200).replace(/[`"]/g, "");
    const contextNote = safeTitle
      ? `This screenshot is being added to a document titled "${safeTitle}".`
      : "Analyze this screenshot and create a structured section from it.";

    const userMessage = `${contextNote} Extract all visible content into a single Strata section. Return ONLY the JSON object.`;

    const result = await generateVision(
      "vision-section",
      systemPrompt,
      userMessage,
      imageBase64,
      mimeType,
      { maxTokens: 4_000, temperature: 0.3 }
    );

    const section = JSON.parse(extractJSON(result.content));

    // Validate response shape
    if (!section || typeof section !== "object" || !section.type || !section.content) {
      return NextResponse.json(
        { error: "AI returned an invalid section structure. Please try again." },
        { status: 502 }
      );
    }

    // Validate section type is a known type
    if (!VALID_SECTION_TYPES.includes(section.type as SectionType)) {
      // Fall back to rich-text if AI returned an unknown type
      section.type = "rich-text";
      if (typeof section.content !== "object" || !section.content.summary) {
        section.content = { summary: JSON.stringify(section.content) };
      }
    }

    // Ensure section has a unique id (deduplicate against existing sections)
    if (!section.id || typeof section.id !== "string") {
      section.id = `vision-${Date.now()}`;
    }
    // Client sends section types, not IDs — can't check collisions server-side.
    // Add timestamp suffix to guarantee uniqueness.
    section.id = `${section.id}-${Date.now().toString(36)}`;

    return NextResponse.json({
      section,
      usage: {
        input_tokens: result.usage.inputTokens,
        output_tokens: result.usage.outputTokens,
        cost: result.usage.cost,
      },
    });
  } catch (error) {
    console.error("[AI Vision] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

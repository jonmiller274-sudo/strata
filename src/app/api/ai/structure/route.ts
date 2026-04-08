import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/generate";
import { buildStructurePrompt } from "@/lib/ai/prompts/structure";
import type { TemplateType } from "@/types/artifact";

export const maxDuration = 60;

/** Strip markdown fences or surrounding text from AI response before JSON.parse */
function extractJSON(text: string): string {
  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Find first { to last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) return text.slice(start, end + 1);
  return text;
}

/**
 * Normalize AI output into a consistent artifact shape.
 * The AI might return:
 * 1. A full artifact: { title, subtitle, sections: [...] }
 * 2. A single section: { id, type, title, content, ... }
 * 3. A wrapper with a single section: { section: { ... } }
 * 4. An array of sections: [{ ... }]
 *
 * This function always returns { title, subtitle, sections: [...] }.
 */
function normalizeArtifact(parsed: Record<string, unknown>): {
  title: string;
  subtitle?: string;
  sections: Record<string, unknown>[];
} {
  // Case 1: Standard artifact shape — has a sections array
  if (Array.isArray(parsed.sections) && parsed.sections.length > 0) {
    return parsed as { title: string; subtitle?: string; sections: Record<string, unknown>[] };
  }

  // Case 2: AI returned a single section object (has "type" and "content" fields)
  if (parsed.type && parsed.content && typeof parsed.type === "string") {
    return {
      title: (parsed.title as string) || "Generated Section",
      subtitle: parsed.subtitle as string | undefined,
      sections: [parsed],
    };
  }

  // Case 3: Wrapped in a "section" key
  if (parsed.section && typeof parsed.section === "object") {
    return {
      title: (parsed.title as string) || "Generated Section",
      subtitle: parsed.subtitle as string | undefined,
      sections: [parsed.section as Record<string, unknown>],
    };
  }

  // Case 4: AI returned an array at the top level (unlikely but defensive)
  if (Array.isArray(parsed)) {
    return {
      title: "Generated",
      sections: parsed,
    };
  }

  // Fallback: return as-is and let the caller handle the missing sections
  return parsed as { title: string; subtitle?: string; sections: Record<string, unknown>[] };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, templateType } = body as {
      content: string;
      templateType: TemplateType;
    };

    if (!content || !templateType) {
      return NextResponse.json(
        { error: "content and templateType are required" },
        { status: 400 }
      );
    }

    if (content.length > 50000) {
      return NextResponse.json(
        { error: "Content too long. Maximum 50,000 characters." },
        { status: 400 }
      );
    }

    const systemPrompt = buildStructurePrompt(templateType);
    const userMessage = `Here is the raw content to structure into an interactive ${templateType.replace(/-/g, " ")} artifact:\n\n${content}`;

    // Scale output tokens with input size — large PDFs need more room
    const maxTokens = content.length > 10_000 ? 16_000 : 8_000;

    const result = await generateJSON("structure", systemPrompt, userMessage, {
      maxTokens,
      temperature: 0.7,
    });

    const raw = JSON.parse(extractJSON(result.content));
    const artifact = normalizeArtifact(raw);

    return NextResponse.json({
      artifact,
      usage: {
        input_tokens: result.usage.inputTokens,
        output_tokens: result.usage.outputTokens,
      },
    });
  } catch (error) {
    console.error("[AI Structure] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

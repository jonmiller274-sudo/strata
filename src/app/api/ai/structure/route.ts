import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/generate";
import { buildStructurePrompt } from "@/lib/ai/prompts/structure";
import type { TemplateType } from "@/types/artifact";

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

    const artifact = JSON.parse(extractJSON(result.content));

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

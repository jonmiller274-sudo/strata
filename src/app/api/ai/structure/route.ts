import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/generate";
import { buildStructurePrompt } from "@/lib/ai/prompts/structure";
import type { TemplateType } from "@/types/artifact";

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

    const result = await generateJSON("structure", systemPrompt, userMessage, {
      maxTokens: 8000,
      temperature: 0.7,
    });

    const artifact = JSON.parse(result.content);

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

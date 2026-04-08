import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/generate";
import { buildRewritePrompt } from "@/lib/ai/prompts/rewrite";
import type { Section } from "@/types/artifact";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, instruction } = body as {
      section: Section;
      instruction: string;
    };

    if (!section || !instruction) {
      return NextResponse.json(
        { error: "section and instruction are required" },
        { status: 400 }
      );
    }

    const systemPrompt = buildRewritePrompt(section.type);
    const userMessage = `Here is the current section:\n\n${JSON.stringify(section, null, 2)}\n\nInstruction: ${instruction}`;

    const result = await generateJSON("rewrite", systemPrompt, userMessage, {
      maxTokens: 4000,
      temperature: 0.7,
    });

    let rewrittenSection: Section;
    try {
      rewrittenSection = JSON.parse(result.content) as Section;
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 502 }
      );
    }

    // Validate the AI preserved the section identity and type
    if (rewrittenSection.id !== section.id || rewrittenSection.type !== section.type) {
      return NextResponse.json(
        { error: "AI changed section id or type — discarding response" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      section: rewrittenSection,
      usage: {
        input_tokens: result.usage.inputTokens,
        output_tokens: result.usage.outputTokens,
      },
    });
  } catch (error) {
    console.error("[AI Rewrite] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

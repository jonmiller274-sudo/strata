import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/ai/client";
import { buildRewritePrompt } from "@/lib/ai/prompts/rewrite";
import type { Section } from "@/types/artifact";

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

    const client = getOpenAIClient();
    const systemPrompt = buildRewritePrompt(section.type);

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the current section:\n\n${JSON.stringify(section, null, 2)}\n\nInstruction: ${instruction}`,
        },
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

    let rewrittenSection: Section;
    try {
      rewrittenSection = JSON.parse(message.content) as Section;
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

    // Log cost
    const usage = response.usage;
    if (usage) {
      const inputCost = (usage.prompt_tokens / 1_000_000) * 0.4;
      const outputCost = (usage.completion_tokens / 1_000_000) * 1.6;
      console.log(
        `[AI Rewrite] model=gpt-4.1-mini input=${usage.prompt_tokens} output=${usage.completion_tokens} cost=$${(inputCost + outputCost).toFixed(4)}`
      );
    }

    return NextResponse.json({
      section: rewrittenSection,
      usage: usage
        ? {
            input_tokens: usage.prompt_tokens,
            output_tokens: usage.completion_tokens,
          }
        : undefined,
    });
  } catch (error) {
    console.error("[AI Rewrite] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

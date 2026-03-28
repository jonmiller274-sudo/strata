import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/client";
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

    const client = getAnthropicClient();
    const systemPrompt = buildStructurePrompt(templateType);

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here is the raw content to structure into an interactive ${templateType.replace("-", " ")} artifact:\n\n${content}`,
        },
      ],
    });

    // Extract text from response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let artifact;
    try {
      // Strip any markdown code fences if present
      let jsonText = textBlock.text.trim();
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      artifact = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        {
          error: "Failed to parse AI response as JSON",
          raw: textBlock.text.slice(0, 500),
        },
        { status: 500 }
      );
    }

    // Log usage for cost tracking
    console.log(
      `[AI Structure] model=${message.model} input_tokens=${message.usage.input_tokens} output_tokens=${message.usage.output_tokens}`
    );

    return NextResponse.json({
      artifact,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("[AI Structure] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

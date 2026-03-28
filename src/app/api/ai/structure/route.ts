import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/ai/client";
import { buildStructurePrompt } from "@/lib/ai/prompts/structure";
import type { TemplateType } from "@/types/artifact";

// JSON Schema for OpenAI Structured Outputs — guarantees valid output
const ARTIFACT_RESPONSE_SCHEMA = {
  name: "artifact",
  strict: true,
  schema: {
    type: "object",
    required: ["title", "subtitle", "sections"],
    additionalProperties: false,
    properties: {
      title: { type: "string", description: "Artifact title" },
      subtitle: {
        type: ["string", "null"],
        description: "One-line subtitle",
      },
      sections: {
        type: "array",
        description: "Ordered array of sections",
        items: {
          type: "object",
          required: ["id", "type", "title", "content"],
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            type: {
              type: "string",
              enum: [
                "rich-text",
                "expandable-cards",
                "timeline",
                "tier-table",
                "metric-dashboard",
                "data-viz",
                "hub-mockup",
              ],
            },
            title: { type: "string" },
            subtitle: { type: ["string", "null"] },
            content: {
              type: "object",
              description:
                "Type-specific content. Shape depends on section type.",
              additionalProperties: true,
            },
          },
        },
      },
    },
  },
} as const;

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

    const client = getOpenAIClient();
    const systemPrompt = buildStructurePrompt(templateType);

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the raw content to structure into an interactive ${templateType.replace(/-/g, " ")} artifact:\n\n${content}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: ARTIFACT_RESPONSE_SCHEMA,
      },
    });

    const message = response.choices[0]?.message;
    if (!message?.content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Structured Outputs guarantees valid JSON — parse directly
    const artifact = JSON.parse(message.content);

    // Log usage for cost tracking
    const usage = response.usage;
    if (usage) {
      const inputCost = (usage.prompt_tokens / 1_000_000) * 0.4;
      const outputCost = (usage.completion_tokens / 1_000_000) * 1.6;
      console.log(
        `[AI Structure] model=gpt-4.1-mini input=${usage.prompt_tokens} output=${usage.completion_tokens} cost=$${(inputCost + outputCost).toFixed(4)}`
      );
    }

    return NextResponse.json({
      artifact,
      usage: usage
        ? {
            input_tokens: usage.prompt_tokens,
            output_tokens: usage.completion_tokens,
          }
        : undefined,
    });
  } catch (error) {
    console.error("[AI Structure] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/ai/client";
import { buildDocumentRewritePrompt } from "@/lib/ai/prompts/rewrite-document";
import type { Artifact, Section } from "@/types/artifact";

interface RewriteDocumentRequest {
  artifact: Pick<Artifact, "title" | "subtitle" | "sections">;
  instruction: string;
}

interface RewriteDocumentResponse {
  title: string;
  subtitle?: string;
  sections: Section[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { artifact, instruction } = body as RewriteDocumentRequest;

    if (!artifact || !instruction) {
      return NextResponse.json(
        { error: "artifact and instruction are required" },
        { status: 400 }
      );
    }

    if (!artifact.sections || !Array.isArray(artifact.sections) || artifact.sections.length === 0) {
      return NextResponse.json(
        { error: "artifact must have at least one section" },
        { status: 400 }
      );
    }

    const client = getOpenAIClient();
    const systemPrompt = buildDocumentRewritePrompt();

    // Build the payload — send title, subtitle, and all sections
    const documentPayload = {
      title: artifact.title,
      subtitle: artifact.subtitle || "",
      sections: artifact.sections,
    };

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      max_tokens: 16000,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the full document:\n\n${JSON.stringify(documentPayload, null, 2)}\n\nInstruction: ${instruction}`,
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

    let rewritten: RewriteDocumentResponse;
    try {
      rewritten = JSON.parse(message.content) as RewriteDocumentResponse;
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 502 }
      );
    }

    // Validate section count preserved
    if (!rewritten.sections || rewritten.sections.length !== artifact.sections.length) {
      return NextResponse.json(
        {
          error: `AI changed section count (expected ${artifact.sections.length}, got ${rewritten.sections?.length ?? 0}) — discarding response`,
        },
        { status: 502 }
      );
    }

    // Validate each section preserved its id and type
    for (let i = 0; i < artifact.sections.length; i++) {
      const original = artifact.sections[i];
      const updated = rewritten.sections[i];
      if (updated.id !== original.id || updated.type !== original.type) {
        return NextResponse.json(
          {
            error: `AI changed section id or type at index ${i} (expected id="${original.id}" type="${original.type}", got id="${updated.id}" type="${updated.type}") — discarding response`,
          },
          { status: 502 }
        );
      }
    }

    // Log cost
    const usage = response.usage;
    if (usage) {
      const inputCost = (usage.prompt_tokens / 1_000_000) * 0.4;
      const outputCost = (usage.completion_tokens / 1_000_000) * 1.6;
      console.log(
        `[AI Document Rewrite] model=gpt-4.1-mini input=${usage.prompt_tokens} output=${usage.completion_tokens} cost=$${(inputCost + outputCost).toFixed(4)}`
      );
    }

    return NextResponse.json({
      title: rewritten.title,
      subtitle: rewritten.subtitle,
      sections: rewritten.sections,
      usage: usage
        ? {
            input_tokens: usage.prompt_tokens,
            output_tokens: usage.completion_tokens,
          }
        : undefined,
    });
  } catch (error) {
    console.error("[AI Document Rewrite] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

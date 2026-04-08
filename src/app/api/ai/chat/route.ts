import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/anthropic-client";
import { createClient } from "@/lib/supabase/server";
import type { Section } from "@/types/artifact";

export const maxDuration = 60;

// Uses Sonnet 4 for editing — same model as rewrite endpoints
const CHAT_MODEL = "claude-sonnet-4-20250514";
const INPUT_PRICE_PER_1M = 3;
const OUTPUT_PRICE_PER_1M = 15;

interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  context: {
    scope: "section" | "document";
    section?: Section;
    artifact?: { title: string; subtitle?: string; sections: Section[] };
  };
}

const SYSTEM_PROMPT = `You are an AI co-editor for Strata, a tool that creates interactive strategy documents. You help users refine their content through conversation.

## YOUR ROLE
- You are a collaborative editor, NOT a vending machine. Have a conversation.
- When instructions are ambiguous, ASK clarifying questions before making changes.
- When you understand what the user wants, make the edit and explain what you changed.
- You can suggest improvements, ask about intent, or propose alternatives.

## RESPONSE FORMAT
You MUST respond with valid JSON in this exact format:

{
  "message": "Your conversational response explaining what you did, asking a question, or suggesting an approach.",
  "suggestion": null
}

When you have an edit to propose, include the suggestion:

For section-scope edits:
{
  "message": "Here's what I changed: ...",
  "suggestion": {
    "type": "section",
    "data": { <the complete rewritten section object> }
  }
}

For document-scope edits:
{
  "message": "Here's what I changed across the document: ...",
  "suggestion": {
    "type": "document",
    "data": { "title": "...", "subtitle": "...", "sections": [...] }
  }
}

## EDITING RULES
- When editing a section: preserve the section's "id" and "type" fields exactly.
- When editing a document: preserve every section's "id" and "type", and keep the same number of sections.
- Only modify text content and values — don't change structural fields unless explicitly asked.
- Write at executive level — concise, specific, confident.
- The "suggestion" field is null when you're just conversing (asking questions, confirming intent, explaining).
- The "suggestion" field contains data ONLY when you're proposing a concrete edit.

## CONTEXT
The user is editing a strategy document. You'll receive the current content as context.`;

function buildContextMessage(context: ChatRequest["context"]): string {
  if (context.scope === "section" && context.section) {
    return `\n\n[CURRENT SECTION BEING EDITED]\n${JSON.stringify(context.section, null, 2)}`;
  }
  if (context.scope === "document" && context.artifact) {
    return `\n\n[CURRENT DOCUMENT]\nTitle: ${context.artifact.title}\nSubtitle: ${context.artifact.subtitle || "(none)"}\nSections (${context.artifact.sections.length}):\n${JSON.stringify(context.artifact.sections, null, 2)}`;
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await req.json()) as ChatRequest;
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required and must not be empty" },
        { status: 400 }
      );
    }

    if (!context?.scope) {
      return NextResponse.json(
        { error: "context with scope is required" },
        { status: 400 }
      );
    }

    // Inject current content context into the LAST user message so the AI
    // always has fresh document state, not just the state from the first turn.
    const contextSuffix = buildContextMessage(context);
    const lastUserIndex = messages.reduce(
      (last, m, i) => (m.role === "user" ? i : last),
      -1
    );
    const apiMessages = messages.map((m, i) => {
      if (i === lastUserIndex && m.role === "user") {
        return { ...m, content: m.content + contextSuffix };
      }
      return m;
    });

    // Call Anthropic directly with multi-turn message history
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: CHAT_MODEL,
      max_tokens: 8000,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cost =
      (inputTokens / 1_000_000) * INPUT_PRICE_PER_1M +
      (outputTokens / 1_000_000) * OUTPUT_PRICE_PER_1M;

    console.log(
      `[AI chat] model=${CHAT_MODEL} input=${inputTokens} output=${outputTokens} cost=$${cost.toFixed(4)}`
    );

    // Parse the JSON response
    let parsed: { message: string; suggestion?: { type: string; data: unknown } | null };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      // If the AI didn't return valid JSON, treat the whole thing as a text message
      parsed = { message: textBlock.text, suggestion: null };
    }

    // Validate suggestion if present
    const suggestion = parsed.suggestion;
    if (suggestion?.data) {
      if (context.scope === "section" && context.section && suggestion.type === "section") {
        const suggested = suggestion.data as Section;
        if (suggested.id !== context.section.id || suggested.type !== context.section.type) {
          parsed.suggestion = null;
          parsed.message += "\n\n(Note: I tried to make an edit but it would have changed the section structure. Please try again with more specific instructions.)";
        }
      }

      if (context.scope === "document" && context.artifact && suggestion.type === "document") {
        const suggested = suggestion.data as { sections: Section[] };
        if (suggested.sections?.length !== context.artifact.sections.length) {
          parsed.suggestion = null;
          parsed.message += "\n\n(Note: I tried to make an edit but it would have changed the number of sections. Please try again with more specific instructions.)";
        }
      }
    }

    return NextResponse.json({
      message: parsed.message || "I'm not sure how to help with that. Could you clarify?",
      suggestion: parsed.suggestion ?? null,
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      },
    });
  } catch (error) {
    console.error("[AI Chat] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

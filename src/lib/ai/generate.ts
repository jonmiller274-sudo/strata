import { getAnthropicClient } from "./anthropic-client";
import { getOpenAIClient } from "./client";

// --- Model routing ---

type AITask =
  | "structure"
  | "rewrite"
  | "rewrite-document"
  | "suggest-type"
  | "journey-generate"
  | "journey-refine";

type Provider = "anthropic" | "openai";

interface ModelConfig {
  provider: Provider;
  model: string;
  inputPricePer1M: number;
  outputPricePer1M: number;
}

const MODEL_ROUTING: Record<AITask, ModelConfig> = {
  // First impressions — best model
  structure: {
    provider: "anthropic",
    model: "claude-opus-4-20250514",
    inputPricePer1M: 15,
    outputPricePer1M: 75,
  },
  // Creative quality
  rewrite: {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    inputPricePer1M: 3,
    outputPricePer1M: 15,
  },
  "rewrite-document": {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    inputPricePer1M: 3,
    outputPricePer1M: 15,
  },
  // Utility — fast and cheap
  "suggest-type": {
    provider: "openai",
    model: "gpt-4.1-mini",
    inputPricePer1M: 0.4,
    outputPricePer1M: 1.6,
  },
  // Journey — best model (endpoints added later)
  "journey-generate": {
    provider: "anthropic",
    model: "claude-opus-4-20250514",
    inputPricePer1M: 15,
    outputPricePer1M: 75,
  },
  "journey-refine": {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    inputPricePer1M: 3,
    outputPricePer1M: 15,
  },
};

// --- Usage tracking ---

export interface AIUsage {
  inputTokens: number;
  outputTokens: number;
  model: string;
  cost: number;
}

// --- Main function ---

export async function generateJSON(
  task: AITask,
  systemPrompt: string,
  userMessage: string,
  options: { maxTokens: number; temperature: number }
): Promise<{ content: string; usage: AIUsage }> {
  const config = MODEL_ROUTING[task];

  if (config.provider === "anthropic") {
    return callAnthropic(task, config, systemPrompt, userMessage, options);
  } else {
    return callOpenAI(task, config, systemPrompt, userMessage, options);
  }
}

// --- Anthropic ---

async function callAnthropic(
  task: AITask,
  config: ModelConfig,
  systemPrompt: string,
  userMessage: string,
  options: { maxTokens: number; temperature: number }
): Promise<{ content: string; usage: AIUsage }> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: config.model,
    max_tokens: options.maxTokens,
    temperature: options.temperature,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Anthropic");
  }

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cost =
    (inputTokens / 1_000_000) * config.inputPricePer1M +
    (outputTokens / 1_000_000) * config.outputPricePer1M;

  console.log(
    `[AI ${task}] model=${config.model} input=${inputTokens} output=${outputTokens} cost=$${cost.toFixed(4)}`
  );

  return {
    content: textBlock.text,
    usage: { inputTokens, outputTokens, model: config.model, cost },
  };
}

// --- OpenAI ---

async function callOpenAI(
  task: AITask,
  config: ModelConfig,
  systemPrompt: string,
  userMessage: string,
  options: { maxTokens: number; temperature: number }
): Promise<{ content: string; usage: AIUsage }> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: config.model,
    max_tokens: options.maxTokens,
    temperature: options.temperature,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
  });

  const message = response.choices[0]?.message;
  if (!message?.content) {
    throw new Error("No response from OpenAI");
  }

  const inputTokens = response.usage?.prompt_tokens ?? 0;
  const outputTokens = response.usage?.completion_tokens ?? 0;
  const cost =
    (inputTokens / 1_000_000) * config.inputPricePer1M +
    (outputTokens / 1_000_000) * config.outputPricePer1M;

  console.log(
    `[AI ${task}] model=${config.model} input=${inputTokens} output=${outputTokens} cost=$${cost.toFixed(4)}`
  );

  return {
    content: message.content,
    usage: { inputTokens, outputTokens, model: config.model, cost },
  };
}

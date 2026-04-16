import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

let client: Anthropic | null = null;

/** Read ANTHROPIC_API_KEY directly from .env.local as a fallback.
 *  Claude Desktop sets ANTHROPIC_API_KEY="" in the environment,
 *  which prevents Next.js dotenv from overwriting it. */
function getApiKey(): string | undefined {
  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey) return envKey;

  try {
    const content = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    return match?.[1]?.trim();
  } catch {
    return undefined;
  }
}

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set. Add it to .env.local");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

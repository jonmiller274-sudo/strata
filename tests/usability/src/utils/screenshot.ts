import type { Page } from "playwright";
import * as path from "node:path";
import * as fs from "node:fs";

const OUTPUT_DIR = path.resolve(__dirname, "../../output/screenshots");

/**
 * Captures a full-page screenshot with a standardized filename.
 * Naming: {scenario_id}_{step_number}_{description}.png
 */
export interface ScreenshotCapture {
  capture: (step: number, description: string) => Promise<string>;
  paths: string[];
}

export function createScreenshotCapture(
  page: Page,
  scenarioId: string
): ScreenshotCapture {
  const paths: string[] = [];

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  async function capture(step: number, description: string): Promise<string> {
    const sanitized = description
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const stepStr = String(step).padStart(2, "0");
    const filename = `${scenarioId}_${stepStr}_${sanitized}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    await page.screenshot({ path: filepath, fullPage: true });
    paths.push(filepath);
    return filepath;
  }

  return { capture, paths };
}

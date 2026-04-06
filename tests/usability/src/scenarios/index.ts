import type { Page } from "playwright";
import type { Persona } from "../personas/index.js";
import type { ScreenshotCapture } from "../utils/screenshot.js";
import type { FindingCollector } from "../utils/findings.js";

// ── Types ───────────────────────────────────────────────────────────────────

export interface ScenarioConfig {
  id: string;
  name: string;
  persona: string;
  description: string;
  priority: 1 | 2 | 3;
  estimatedMinutes: number;
}

export type ScenarioFn = (
  page: Page,
  persona: Persona,
  capture: ScreenshotCapture,
  report: FindingCollector
) => Promise<void>;

export interface ScenarioModule {
  config: ScenarioConfig;
  run: ScenarioFn;
}

// ── Registry ────────────────────────────────────────────────────────────────

import * as landingToCreate from "./landing-to-create.js";
import * as demoExploration from "./demo-exploration.js";
import * as createWithPdf from "./create-with-pdf.js";
import * as mobileLanding from "./mobile-landing.js";
import * as mobileArtifact from "./mobile-artifact.js";

export const SCENARIOS: Record<string, ScenarioModule> = {
  "landing-to-create": landingToCreate,
  "demo-exploration": demoExploration,
  "create-with-pdf": createWithPdf,
  "mobile-landing": mobileLanding,
  "mobile-artifact": mobileArtifact,
};

export function getScenario(id: string): ScenarioModule {
  const scenario = SCENARIOS[id];
  if (!scenario) {
    throw new Error(
      `Unknown scenario: ${id}. Available: ${Object.keys(SCENARIOS).join(", ")}`
    );
  }
  return scenario;
}

export function getAllScenarioIds(): string[] {
  return Object.keys(SCENARIOS);
}

export function getPriority1Ids(): string[] {
  return Object.entries(SCENARIOS)
    .filter(([, mod]) => mod.config.priority === 1)
    .map(([id]) => id);
}

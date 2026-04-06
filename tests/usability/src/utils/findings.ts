import { v4 as uuidv4 } from "uuid";
import * as path from "node:path";
import * as fs from "node:fs";

const FINDINGS_DIR = path.resolve(__dirname, "../../output/findings");

// ── Interfaces ──────────────────────────────────────────────────────────────

export type Severity = "critical" | "high" | "medium" | "low";

export type FindingCategory =
  | "bug"
  | "friction"
  | "missing"
  | "confusing"
  | "slow"
  | "broken-layout";

export interface UsabilityFinding {
  id: string;
  timestamp: string;
  severity: Severity;
  persona: string;
  scenario: string;
  step: number;
  step_description: string;
  category: FindingCategory;
  description: string;
  expected: string;
  actual: string;
  screenshot_path: string;
  url: string;
  viewport: { width: number; height: number };
  elapsed_ms?: number;
  recommendation?: string;
}

export interface UsabilityReport {
  run_id: string;
  run_date: string;
  target_url: string;
  scenarios_run: string[];
  total_steps: number;
  findings: UsabilityFinding[];
  screenshots: string[];
  duration_ms: number;
}

// ── FindingCollector ────────────────────────────────────────────────────────

export class FindingCollector {
  private findings: UsabilityFinding[] = [];
  private stepCount = 0;

  constructor(
    private scenarioId: string,
    private personaId: string,
    private viewport: { width: number; height: number }
  ) {}

  /**
   * Report a usability finding.
   */
  addFinding(params: {
    severity: Severity;
    step: number;
    step_description: string;
    category: FindingCategory;
    description: string;
    expected: string;
    actual: string;
    screenshot_path: string;
    url: string;
    elapsed_ms?: number;
    recommendation?: string;
  }): void {
    this.findings.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      severity: params.severity,
      persona: this.personaId,
      scenario: this.scenarioId,
      step: params.step,
      step_description: params.step_description,
      category: params.category,
      description: params.description,
      expected: params.expected,
      actual: params.actual,
      screenshot_path: params.screenshot_path,
      url: params.url,
      viewport: this.viewport,
      elapsed_ms: params.elapsed_ms,
      recommendation: params.recommendation,
    });
  }

  incrementSteps(): void {
    this.stepCount++;
  }

  getFindings(): UsabilityFinding[] {
    return [...this.findings];
  }

  getStepCount(): number {
    return this.stepCount;
  }
}

// ── Report writer ───────────────────────────────────────────────────────────

export function writeReport(report: UsabilityReport): string {
  fs.mkdirSync(FINDINGS_DIR, { recursive: true });

  const date = new Date().toISOString().split("T")[0];
  const filename = `${date}-${report.run_id}.json`;
  const filepath = path.join(FINDINGS_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(report, null, 2), "utf-8");
  return filepath;
}

/**
 * Read the most recent findings report from the output directory.
 */
export function readLatestReport(): UsabilityReport | null {
  if (!fs.existsSync(FINDINGS_DIR)) return null;

  const files = fs
    .readdirSync(FINDINGS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) return null;

  const content = fs.readFileSync(
    path.join(FINDINGS_DIR, files[0]),
    "utf-8"
  );
  return JSON.parse(content) as UsabilityReport;
}

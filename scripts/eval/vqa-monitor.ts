/**
 * vqa-monitor.ts — Visual QA Agent: Continuous Monitoring
 *
 * Runs the full eval pipeline against published artifacts and test fixtures,
 * detects regressions against golden baselines, and files GitHub issues
 * for sections that drop below threshold.
 *
 * Usage:
 *   npx tsx scripts/eval/vqa-monitor.ts                  Full monitoring run
 *   npx tsx scripts/eval/vqa-monitor.ts --demo-only      Only check demo artifact
 *   npx tsx scripts/eval/vqa-monitor.ts --dry-run        Score but don't file issues
 *
 * Output:
 *   - docs/vqa/YYYY-MM-DD.md (daily VQS report)
 *   - scripts/eval/screenshots/golden-baselines.json (updated baselines)
 *   - GitHub issues for regressions and failures
 *
 * Requires: Dev server running at localhost:3000, ANTHROPIC_API_KEY
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const REPO = "jonmiller274-sudo/strata";
const SCREENSHOT_DIR = path.join(__dirname, "screenshots");
const BASELINES_PATH = path.join(SCREENSHOT_DIR, "golden-baselines.json");
const VQA_REPORTS_DIR = path.join(__dirname, "../../docs/vqa");
const COORDINATION_LOG = path.join(__dirname, "../../docs/agents/coordination-log.md");
const VQS_INDEX = path.join(__dirname, "../../docs/agents/vqa/vqs-index.md");
const REGRESSION_THRESHOLD = 10; // VQS drop of 10+ triggers regression alert
const FAILURE_THRESHOLD = 75;    // VQS below 75 triggers failure issue

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectionScore {
  slug: string;
  sectionId: string;
  sectionType: string;
  sectionIndex: number;
  vqs: number;
  dimensions: Record<string, number>;
  issues: Array<{ dimension: string; severity: string; description: string }>;
  passed: boolean;
  reasoning: string;
}

interface EvalResult {
  timestamp: string;
  model: string;
  total_sections: number;
  average_vqs: number;
  passing_sections: number;
  failing_sections: number;
  sections: SectionScore[];
  cost_estimate_usd: number;
}

interface Baseline {
  sectionId: string;
  sectionType: string;
  vqs: number;
  recorded_at: string;
}

interface GoldenBaselines {
  updated_at: string;
  baselines: Record<string, Baseline>; // key: slug/sectionId
}

interface Regression {
  sectionId: string;
  sectionType: string;
  slug: string;
  baseline_vqs: number;
  current_vqs: number;
  delta: number;
}

interface Failure {
  sectionId: string;
  sectionType: string;
  slug: string;
  vqs: number;
  issues: Array<{ dimension: string; severity: string; description: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd: string): string {
  return execSync(cmd, { encoding: "utf-8", cwd: path.join(__dirname, "../..") }).trim();
}

function runSilent(cmd: string): void {
  execSync(cmd, { stdio: "pipe", cwd: path.join(__dirname, "../..") });
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function nowET(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/New_York",
  });
}

// ---------------------------------------------------------------------------
// Baseline management
// ---------------------------------------------------------------------------

function loadBaselines(): GoldenBaselines {
  if (fs.existsSync(BASELINES_PATH)) {
    return JSON.parse(fs.readFileSync(BASELINES_PATH, "utf-8"));
  }
  return { updated_at: new Date().toISOString(), baselines: {} };
}

function saveBaselines(baselines: GoldenBaselines): void {
  baselines.updated_at = new Date().toISOString();
  fs.writeFileSync(BASELINES_PATH, JSON.stringify(baselines, null, 2));
}

function detectRegressions(
  scores: SectionScore[],
  baselines: GoldenBaselines
): Regression[] {
  const regressions: Regression[] = [];

  for (const score of scores) {
    const key = `${score.slug}/${score.sectionId}`;
    const baseline = baselines.baselines[key];

    if (baseline && baseline.vqs - score.vqs >= REGRESSION_THRESHOLD) {
      regressions.push({
        sectionId: score.sectionId,
        sectionType: score.sectionType,
        slug: score.slug,
        baseline_vqs: baseline.vqs,
        current_vqs: score.vqs,
        delta: score.vqs - baseline.vqs,
      });
    }
  }

  return regressions;
}

function updateBaselines(
  scores: SectionScore[],
  baselines: GoldenBaselines
): number {
  let updated = 0;

  for (const score of scores) {
    const key = `${score.slug}/${score.sectionId}`;
    const existing = baselines.baselines[key];

    // Update baseline if: no existing baseline, or score improved
    if (!existing || score.vqs > existing.vqs) {
      baselines.baselines[key] = {
        sectionId: score.sectionId,
        sectionType: score.sectionType,
        vqs: score.vqs,
        recorded_at: new Date().toISOString(),
      };
      updated++;
    }
  }

  return updated;
}

// ---------------------------------------------------------------------------
// Issue filing
// ---------------------------------------------------------------------------

function fileRegressionIssue(reg: Regression, dryRun: boolean): string | null {
  const title = `[VQA Regression] ${reg.sectionType} "${reg.sectionId}" dropped ${Math.abs(reg.delta)} points`;
  const body = `## Visual Quality Regression Detected

| Field | Value |
|-------|-------|
| Section | \`${reg.sectionId}\` |
| Type | ${reg.sectionType} |
| Artifact | ${reg.slug} |
| Baseline VQS | ${reg.baseline_vqs} |
| Current VQS | ${reg.current_vqs} |
| Delta | ${reg.delta} |

### Action Required
The Quality Engineer should investigate this regression and open a fix PR.

### How to Reproduce
\`\`\`bash
npm run dev &
sleep 6
npx tsx scripts/eval/screenshot-sections.ts --demo
npx tsx scripts/eval/visual-eval.ts --threshold ${FAILURE_THRESHOLD}
\`\`\`

---
*Filed by Visual QA Agent*`;

  if (dryRun) {
    console.log(`  [DRY RUN] Would file issue: ${title}`);
    return null;
  }

  const result = run(
    `gh issue create --repo ${REPO} --title ${JSON.stringify(title)} --body ${JSON.stringify(body)} --label "quality,vqa-regression"`
  );
  return result;
}

function fileFailureIssue(failure: Failure, dryRun: boolean): string | null {
  const issueList = failure.issues
    .map((i) => `- [${i.severity}] **${i.dimension}**: ${i.description}`)
    .join("\n");

  const title = `[VQA Failure] ${failure.sectionType} "${failure.sectionId}" below ship threshold (VQS ${failure.vqs})`;
  const body = `## Visual Quality Below Ship Threshold

| Field | Value |
|-------|-------|
| Section | \`${failure.sectionId}\` |
| Type | ${failure.sectionType} |
| Artifact | ${failure.slug} |
| VQS | ${failure.vqs} (threshold: ${FAILURE_THRESHOLD}) |

### Issues Found
${issueList}

### Action Required
The Quality Engineer should fix these issues and verify VQS >= ${FAILURE_THRESHOLD}.

---
*Filed by Visual QA Agent*`;

  if (dryRun) {
    console.log(`  [DRY RUN] Would file issue: ${title}`);
    return null;
  }

  const result = run(
    `gh issue create --repo ${REPO} --title ${JSON.stringify(title)} --body ${JSON.stringify(body)} --label "quality,vqa-failure"`
  );
  return result;
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

function generateReport(
  scores: EvalResult,
  regressions: Regression[],
  failures: Failure[],
  baselinesUpdated: number
): string {
  const date = today();

  let report = `# VQA Report — ${date}\n\n`;
  report += `## Summary\n`;
  report += `| Metric | Value |\n|--------|-------|\n`;
  report += `| Sections scored | ${scores.total_sections} |\n`;
  report += `| Average VQS | ${scores.average_vqs} |\n`;
  report += `| Passing (>= ${FAILURE_THRESHOLD}) | ${scores.passing_sections} |\n`;
  report += `| Failing (< ${FAILURE_THRESHOLD}) | ${scores.failing_sections} |\n`;
  report += `| Regressions | ${regressions.length} |\n`;
  report += `| Baselines updated | ${baselinesUpdated} |\n`;
  report += `| API cost | ~$${scores.cost_estimate_usd} |\n\n`;

  if (regressions.length > 0) {
    report += `## Regressions\n`;
    report += `| Section | Type | Baseline | Current | Delta |\n`;
    report += `|---------|------|----------|---------|-------|\n`;
    for (const r of regressions) {
      report += `| ${r.sectionId} | ${r.sectionType} | ${r.baseline_vqs} | ${r.current_vqs} | ${r.delta} |\n`;
    }
    report += `\n`;
  }

  if (failures.length > 0) {
    report += `## Failures\n`;
    for (const f of failures) {
      report += `### ${f.sectionType} — ${f.sectionId} (VQS ${f.vqs})\n`;
      for (const i of f.issues) {
        report += `- [${i.severity}] **${i.dimension}**: ${i.description}\n`;
      }
      report += `\n`;
    }
  }

  report += `## Per-Section Scores\n`;
  report += `| Section | Type | VQS | Status |\n`;
  report += `|---------|------|-----|--------|\n`;
  for (const s of scores.sections.sort((a, b) => a.vqs - b.vqs)) {
    const status = s.passed ? "PASS" : "FAIL";
    report += `| ${s.sectionId} | ${s.sectionType} | ${s.vqs} | ${status} |\n`;
  }

  report += `\n---\n*Generated by Visual QA Agent at ${new Date().toISOString()}*\n`;

  return report;
}

// ---------------------------------------------------------------------------
// Coordination log entry
// ---------------------------------------------------------------------------

function appendCoordinationLog(
  regressions: number,
  failures: number,
  sections: number,
  avgVqs: number
): void {
  if (!fs.existsSync(COORDINATION_LOG)) return;

  const entry = `- ${nowET()} | vqa | VQS Report → docs/vqa/${today()}.md (${regressions} regressions, ${failures} failures, ${sections} sections scored, avg VQS ${avgVqs})\n`;

  const content = fs.readFileSync(COORDINATION_LOG, "utf-8");
  const todayHeader = `## ${today()}`;

  if (content.includes(todayHeader)) {
    // Append under today's section
    const updated = content.replace(todayHeader, `${todayHeader}\n${entry}`);
    fs.writeFileSync(COORDINATION_LOG, updated);
  } else {
    // Create today's section at the top (after the first line/title)
    const lines = content.split("\n");
    const titleEnd = lines.findIndex((l, i) => i > 0 && l.startsWith("## "));
    const insertAt = titleEnd === -1 ? 2 : titleEnd;
    lines.splice(insertAt, 0, `\n${todayHeader}\n${entry}`);
    fs.writeFileSync(COORDINATION_LOG, lines.join("\n"));
  }
}

// ---------------------------------------------------------------------------
// VQS index entry
// ---------------------------------------------------------------------------

function appendVqsIndex(
  avgVqs: number,
  regressions: number,
  sections: number
): void {
  const entry = `| ${today()} | [Report](../../docs/vqa/${today()}.md) | ${avgVqs} | ${sections} | ${regressions} |\n`;

  if (!fs.existsSync(VQS_INDEX)) {
    const header = `# VQS Index\n\n| Date | Report | Avg VQS | Sections | Regressions |\n|------|--------|---------|----------|-------------|\n`;
    fs.writeFileSync(VQS_INDEX, header + entry);
  } else {
    fs.appendFileSync(VQS_INDEX, entry);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const demoOnly = args.includes("--demo-only");
  const dryRun = args.includes("--dry-run");

  console.log("Visual QA Agent — Monitoring Run");
  console.log("=".repeat(50));

  // Step 1: Screenshot
  console.log("\nStep 1: Capturing screenshots...");
  if (demoOnly) {
    runSilent("npx tsx scripts/eval/screenshot-sections.ts --demo");
  } else {
    // Generate fixtures first, then screenshot fixtures + demo
    runSilent("npx tsx scripts/eval/generate-fixtures.ts --profile baseline");
    runSilent("npx tsx scripts/eval/screenshot-sections.ts --demo");
    runSilent(
      "npx tsx scripts/eval/screenshot-sections.ts --url http://localhost:3000/eval/eval-baseline-all"
    );
  }
  console.log("  Screenshots captured.");

  // Step 2: Score
  console.log("\nStep 2: Scoring with Claude Vision...");
  runSilent("npx tsx scripts/eval/visual-eval.ts");

  const scoresPath = path.join(SCREENSHOT_DIR, "scores.json");
  if (!fs.existsSync(scoresPath)) {
    console.error("Scoring failed — no scores.json produced.");
    process.exit(1);
  }

  const scores: EvalResult = JSON.parse(
    fs.readFileSync(scoresPath, "utf-8")
  );
  console.log(`  ${scores.total_sections} sections scored. Avg VQS: ${scores.average_vqs}`);

  // Step 3: Compare against baselines
  console.log("\nStep 3: Comparing against golden baselines...");
  const baselines = loadBaselines();
  const regressions = detectRegressions(scores.sections, baselines);
  const baselinesUpdated = updateBaselines(scores.sections, baselines);
  saveBaselines(baselines);

  console.log(`  ${regressions.length} regressions detected.`);
  console.log(`  ${baselinesUpdated} baselines updated (improvements).`);

  // Step 4: Identify failures
  const failures: Failure[] = scores.sections
    .filter((s) => !s.passed)
    .map((s) => ({
      sectionId: s.sectionId,
      sectionType: s.sectionType,
      slug: s.slug,
      vqs: s.vqs,
      issues: s.issues,
    }));

  // Step 5: File issues
  if (regressions.length > 0 || failures.length > 0) {
    console.log("\nStep 4: Filing issues...");

    // Check for existing open VQA issues to avoid duplicates
    let existingIssues: string[] = [];
    try {
      const existing = run(
        `gh issue list --repo ${REPO} --label vqa-regression,vqa-failure --state open --json title --jq '.[].title'`
      );
      existingIssues = existing.split("\n").filter(Boolean);
    } catch {
      // If gh fails, proceed without dedup
    }

    for (const reg of regressions) {
      const titlePrefix = `[VQA Regression] ${reg.sectionType} "${reg.sectionId}"`;
      if (existingIssues.some((t) => t.startsWith(titlePrefix))) {
        console.log(`  Skipping duplicate regression issue for ${reg.sectionId}`);
        continue;
      }
      fileRegressionIssue(reg, dryRun);
    }

    for (const fail of failures) {
      const titlePrefix = `[VQA Failure] ${fail.sectionType} "${fail.sectionId}"`;
      if (existingIssues.some((t) => t.startsWith(titlePrefix))) {
        console.log(`  Skipping duplicate failure issue for ${fail.sectionId}`);
        continue;
      }
      fileFailureIssue(fail, dryRun);
    }
  }

  // Step 6: Generate report
  console.log("\nStep 5: Generating report...");
  fs.mkdirSync(VQA_REPORTS_DIR, { recursive: true });
  const report = generateReport(scores, regressions, failures, baselinesUpdated);
  const reportPath = path.join(VQA_REPORTS_DIR, `${today()}.md`);
  fs.writeFileSync(reportPath, report);
  console.log(`  Report written to ${reportPath}`);

  // Step 7: Update coordination log and VQS index
  appendCoordinationLog(
    regressions.length,
    failures.length,
    scores.total_sections,
    scores.average_vqs
  );
  appendVqsIndex(scores.average_vqs, regressions.length, scores.total_sections);

  // Summary
  console.log(`\n${"=".repeat(50)}`);
  console.log("VQA MONITORING COMPLETE");
  console.log("=".repeat(50));
  console.log(`Sections:    ${scores.total_sections}`);
  console.log(`Avg VQS:     ${scores.average_vqs}`);
  console.log(`Regressions: ${regressions.length}`);
  console.log(`Failures:    ${failures.length}`);
  console.log(`Baselines:   ${baselinesUpdated} updated`);
  console.log(`Cost:        ~$${scores.cost_estimate_usd}`);
  console.log(`Report:      ${reportPath}`);
}

main().catch((err) => {
  console.error("VQA Monitor failed:", err);
  process.exit(1);
});

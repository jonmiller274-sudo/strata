/**
 * GitHub Issue Creator
 *
 * Reads the latest findings JSON and creates a GitHub Issue
 * with a formatted markdown summary following the Evening Briefing template.
 *
 * Requires:
 *   - GH_TOKEN env var (or gh CLI already authenticated)
 *   - gh CLI installed
 */

import { execSync } from "node:child_process";
import { readLatestReport, type UsabilityFinding, type Severity } from "./utils/findings.js";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

const SEVERITY_EMOJI: Record<Severity, string> = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🔵",
};

function formatFinding(finding: UsabilityFinding, index: number): string {
  const lines: string[] = [];
  lines.push(
    `### ${SEVERITY_EMOJI[finding.severity]} ${index + 1}. ${finding.description}`
  );
  lines.push("");
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| **Severity** | \`${finding.severity.toUpperCase()}\` |`);
  lines.push(`| **Scenario** | ${finding.scenario} |`);
  lines.push(`| **Persona** | ${finding.persona} |`);
  lines.push(`| **Step** | ${finding.step} — ${finding.step_description} |`);
  lines.push(`| **Category** | ${finding.category} |`);
  lines.push(
    `| **Viewport** | ${finding.viewport.width}x${finding.viewport.height} |`
  );
  lines.push(`| **URL** | \`${finding.url}\` |`);
  if (finding.elapsed_ms) {
    lines.push(`| **Duration** | ${Math.round(finding.elapsed_ms / 1000)}s |`);
  }
  lines.push("");
  lines.push(`**Expected:** ${finding.expected}`);
  lines.push("");
  lines.push(`**Actual:** ${finding.actual}`);

  if (finding.recommendation) {
    lines.push("");
    lines.push(`**Recommendation:** ${finding.recommendation}`);
  }

  if (finding.screenshot_path) {
    const filename = finding.screenshot_path.split("/").pop();
    lines.push("");
    lines.push(
      `*Screenshot:* \`${filename}\` (see workflow artifacts)`
    );
  }

  return lines.join("\n");
}

function buildIssueBody(report: ReturnType<typeof readLatestReport>): string {
  if (!report) return "No report data available.";

  const lines: string[] = [];

  // Header summary
  lines.push("## Usability Test Report");
  lines.push("");
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| **Run ID** | \`${report.run_id}\` |`);
  lines.push(`| **Date** | ${report.run_date} |`);
  lines.push(`| **Target** | ${report.target_url} |`);
  lines.push(`| **Scenarios** | ${report.scenarios_run.join(", ")} |`);
  lines.push(`| **Steps Executed** | ${report.total_steps} |`);
  lines.push(`| **Duration** | ${Math.round(report.duration_ms / 1000)}s |`);
  lines.push(`| **Screenshots** | ${report.screenshots.length} |`);
  lines.push("");

  // Severity summary
  const bySeverity: Record<Severity, UsabilityFinding[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
  };
  for (const f of report.findings) {
    bySeverity[f.severity].push(f);
  }

  lines.push("### Severity Summary");
  lines.push("");
  lines.push(
    `| ${SEVERITY_EMOJI.critical} Critical | ${SEVERITY_EMOJI.high} High | ${SEVERITY_EMOJI.medium} Medium | ${SEVERITY_EMOJI.low} Low | **Total** |`
  );
  lines.push(`|----------|------|--------|-----|-----------|`);
  lines.push(
    `| ${bySeverity.critical.length} | ${bySeverity.high.length} | ${bySeverity.medium.length} | ${bySeverity.low.length} | **${report.findings.length}** |`
  );
  lines.push("");

  if (report.findings.length === 0) {
    lines.push("### All Clear");
    lines.push("");
    lines.push(
      "No usability issues found in today's scenarios. All steps completed successfully."
    );
    lines.push("");
    lines.push("---");
    lines.push(
      "*Automated usability test run by the Strata Usability Tester agent.*"
    );
    return lines.join("\n");
  }

  // Findings grouped by severity
  let findingIndex = 0;
  for (const severity of SEVERITY_ORDER) {
    const findings = bySeverity[severity];
    if (findings.length === 0) continue;

    lines.push(`---`);
    lines.push("");
    lines.push(
      `## ${SEVERITY_EMOJI[severity]} ${severity.toUpperCase()} (${findings.length})`
    );
    lines.push("");

    for (const finding of findings) {
      lines.push(formatFinding(finding, findingIndex));
      lines.push("");
      findingIndex++;
    }
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "*Automated usability test run by the Strata Usability Tester agent. " +
      "Screenshots are available as workflow artifacts.*"
  );

  return lines.join("\n");
}

function main(): void {
  const report = readLatestReport();

  if (!report) {
    console.log("No findings report found — nothing to file.");
    process.exit(0);
  }

  const findingCount = report.findings.length;
  const date = report.run_date;

  const title =
    findingCount > 0
      ? `Usability Test — ${date} — ${findingCount} finding${findingCount === 1 ? "" : "s"}`
      : `Usability Test — ${date} — All Clear`;

  const labels = "usability-test,discovery";
  const body = buildIssueBody(report);

  console.log(`Creating GitHub Issue: "${title}"`);
  console.log(`  Findings: ${findingCount}`);
  console.log(`  Labels: ${labels}`);

  try {
    // Ensure labels exist (create if missing, ignore errors if they already exist)
    try {
      execSync(`gh label create "usability-test" --color "1d76db" --description "Automated usability test findings" --force`, {
        stdio: "pipe",
      });
    } catch {
      // Label may already exist — that's fine
    }
    try {
      execSync(`gh label create "discovery" --color "d876e3" --description "Discovery and research findings" --force`, {
        stdio: "pipe",
      });
    } catch {
      // Label may already exist
    }

    // Create the issue using gh CLI
    // Write body to a temp file to avoid shell escaping issues
    const tempBodyPath = "/tmp/usability-issue-body.md";
    const fs = require("node:fs");
    fs.writeFileSync(tempBodyPath, body, "utf-8");

    const result = execSync(
      `gh issue create --title "${title}" --label "${labels}" --body-file "${tempBodyPath}"`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    );

    console.log(`  Issue created: ${result.trim()}`);

    // Clean up temp file
    try {
      fs.unlinkSync(tempBodyPath);
    } catch {
      // Non-critical
    }
  } catch (err) {
    console.error("Failed to create GitHub Issue:", err);
    console.log("\nIssue body (for manual creation):\n");
    console.log(`Title: ${title}`);
    console.log(`Labels: ${labels}`);
    console.log(`\n${body}`);
    process.exit(1);
  }
}

main();

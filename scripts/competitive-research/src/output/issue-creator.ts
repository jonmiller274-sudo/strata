import { execSync } from "child_process";
import type { CheckResult } from "../self-audit/checks.js";
import type { MarketMonitorResult } from "../market-monitor/index.js";

export function createSelfAuditIssue(
  repo: string,
  date: string,
  results: CheckResult[]
): void {
  const gaps = results.filter((r) => r.status !== "pass");
  const passes = results.filter((r) => r.status === "pass");

  const title = `Competitive Self-Audit — ${date} — ${gaps.length} gap${gaps.length !== 1 ? "s" : ""} found`;

  let body = `# Competitive Self-Audit — ${date}\n\n`;
  body += `**Checks run:** ${results.length}\n`;
  body += `**Passed:** ${passes.length}\n`;
  body += `**Gaps:** ${gaps.length}\n\n`;

  if (gaps.length > 0) {
    body += `## Gaps Found\n\n`;
    body += `| ID | Capability | Claim | Status | Detail |\n`;
    body += `|----|-----------|-------|--------|--------|\n`;
    for (const r of gaps) {
      body += `| ${r.id} | ${r.capability} | ${r.claim} | ${r.status} | ${r.detail} |\n`;
    }
    body += `\n`;
  }

  if (passes.length > 0) {
    body += `## Passed\n\n`;
    body += `| ID | Capability | Detail |\n`;
    body += `|----|-----------|--------|\n`;
    for (const r of passes) {
      body += `| ${r.id} | ${r.capability} | ${r.detail} |\n`;
    }
  }

  try {
    execSync(
      `gh issue create --repo ${repo} --title "${title}" --label competitive-research --label self-audit --body "${body.replace(/"/g, '\\"')}"`,
      { encoding: "utf-8", stdio: "pipe" }
    );
    console.log(`GitHub Issue created: ${title}`);
  } catch (err) {
    // Try with body-file if the body is too long for CLI args
    const { writeFileSync } = require("fs");
    const tmpPath = "/tmp/competitive-self-audit-body.md";
    writeFileSync(tmpPath, body, "utf-8");
    try {
      execSync(
        `gh issue create --repo ${repo} --title "${title}" --label competitive-research --label self-audit --body-file "${tmpPath}"`,
        { encoding: "utf-8", stdio: "pipe" }
      );
      console.log(`GitHub Issue created (via file): ${title}`);
    } catch (err2) {
      console.error("Failed to create self-audit Issue:", err2);
    }
  }
}

export function createMarketMonitorIssue(
  repo: string,
  date: string,
  result: MarketMonitorResult
): void {
  const hasChanges = result.changesFound.length > 0;
  const title = hasChanges
    ? `Competitive Monitor — ${date} — ${result.changesFound.length} change${result.changesFound.length !== 1 ? "s" : ""} detected`
    : `Competitive Monitor — ${date} — no changes`;

  let body = `# Competitive Monitor — ${date}\n\n`;
  body += `**Competitors checked:** ${result.competitorsChecked}\n`;
  body += `**Changes found:** ${result.changesFound.length}\n`;
  body += `**Errors:** ${result.errors.length}\n\n`;

  if (result.changesFound.length > 0) {
    body += `## Changes Detected\n\n`;
    for (const change of result.changesFound) {
      body += `### ${change.competitor} (${change.page})\n`;
      body += `**Type:** ${change.changeType}\n`;
      body += `**Summary:** ${change.summary}\n\n`;
    }
  }

  if (result.errors.length > 0) {
    body += `## Errors\n\n`;
    for (const error of result.errors) {
      body += `- ${error}\n`;
    }
  }

  if (!hasChanges && result.errors.length === 0) {
    body += `No changes detected across ${result.competitorsChecked} competitors.\n`;
  }

  const { writeFileSync } = require("fs");
  const tmpPath = "/tmp/competitive-monitor-body.md";
  writeFileSync(tmpPath, body, "utf-8");

  try {
    execSync(
      `gh issue create --repo ${repo} --title "${title}" --label competitive-research --label market-monitor --body-file "${tmpPath}"`,
      { encoding: "utf-8", stdio: "pipe" }
    );
    console.log(`GitHub Issue created: ${title}`);
  } catch (err) {
    console.error("Failed to create market monitor Issue:", err);
  }
}

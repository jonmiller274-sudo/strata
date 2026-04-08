#!/usr/bin/env node

/**
 * Competitive Researcher Runner
 *
 * Two modes:
 *   self-audit    — Playwright tests Strata against the feature matrix (weekly)
 *   market-monitor — Fetch competitor pages, diff for changes (monthly)
 *
 * Environment variables:
 *   MODE        — "self-audit" | "market-monitor" | "both" (default: "self-audit")
 *   TARGET_URL  — URL to test (default: https://sharestrata.com)
 *   REPO        — GitHub repo (default: jonmiller274-sudo/strata)
 *   REPO_ROOT   — Repo root path (default: cwd)
 *   GH_TOKEN    — GitHub token (set by GitHub Actions)
 */

import { runSelfAudit } from "./self-audit/index.js";
import { runMarketMonitor } from "./market-monitor/index.js";
import {
  createSelfAuditIssue,
  createMarketMonitorIssue,
} from "./output/issue-creator.js";
import { appendToCoordinationLog } from "./output/coordination-logger.js";
import {
  updateScratchpad,
  updateFeatureMatrix,
} from "./output/scratchpad-updater.js";

function getDate(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

async function main() {
  const mode = process.env.MODE || "self-audit";
  const targetUrl = process.env.TARGET_URL || "https://sharestrata.com";
  const repo = process.env.REPO || "jonmiller274-sudo/strata";
  const repoRoot = process.env.REPO_ROOT || process.cwd();
  const date = getDate();

  console.log(`Competitive Researcher starting — ${date}`);
  console.log(`Mode: ${mode}`);
  console.log(`Target: ${targetUrl}`);
  console.log(`Repo: ${repo}`);

  if (mode === "self-audit" || mode === "both") {
    console.log("\n--- Self-Audit Mode ---\n");

    const screenshotDir = `${repoRoot}/scripts/competitive-research/output/screenshots`;
    const results = await runSelfAudit(targetUrl, repoRoot, screenshotDir);

    const gaps = results.filter((r) => r.status !== "pass");

    // Create GitHub Issue
    createSelfAuditIssue(repo, date, results);

    // Update coordination log
    appendToCoordinationLog(
      repoRoot,
      date,
      `Self-audit: ${results.length} checks, ${gaps.length} gaps → GitHub Issue`
    );

    // Update scratchpad rotation log
    updateScratchpad(
      repoRoot,
      date,
      "self-audit",
      results.map((r) => r.id),
      gaps.length
    );

    // Update feature matrix statuses
    updateFeatureMatrix(repoRoot, results);

    console.log(
      `\nSelf-audit complete: ${results.length} checks, ${gaps.length} gaps.`
    );
  }

  if (mode === "market-monitor" || mode === "both") {
    console.log("\n--- Market Monitor Mode ---\n");

    const result = await runMarketMonitor(repoRoot);

    // Create GitHub Issue
    createMarketMonitorIssue(repo, date, result);

    // Update coordination log
    appendToCoordinationLog(
      repoRoot,
      date,
      `Market monitor: ${result.competitorsChecked} competitors, ${result.changesFound.length} changes → GitHub Issue`
    );

    // Update scratchpad
    updateScratchpad(
      repoRoot,
      date,
      "market-monitor",
      [],
      result.changesFound.length
    );

    console.log(
      `\nMarket monitor complete: ${result.competitorsChecked} competitors, ${result.changesFound.length} changes.`
    );
  }

  console.log("\nCompetitive Researcher complete.");
}

main().catch((err) => {
  console.error("Competitive Researcher failed:", err);
  process.exit(1);
});

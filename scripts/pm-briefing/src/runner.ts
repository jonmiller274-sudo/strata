#!/usr/bin/env node

/**
 * PM Agent Runner — Evening Product Briefing
 *
 * Collects data from all agent sources, synthesizes into a briefing,
 * writes the file, creates a GitHub Issue, and updates the coordination log.
 *
 * Environment variables:
 *   GH_TOKEN   — GitHub token (set by GitHub Actions)
 *   REPO       — GitHub repo in owner/repo format (default: jonmiller274-sudo/strata)
 *   REPO_ROOT  — Absolute path to repo root (default: process.cwd())
 */

import {
  collectUsability,
  collectQuality,
  collectCoordination,
  collectCompetitive,
  collectPendingPlanning,
  collectOpenPRs,
} from "./collectors/index.js";
import {
  isQuiet,
  generateQuietBriefing,
  generateFullBriefing,
  type AllData,
} from "./synthesizer.js";
import { writeBriefing } from "./output/briefing-writer.js";
import { createIssue } from "./output/issue-creator.js";
import { appendToCoordinationLog } from "./output/coordination-logger.js";
import { updateBriefingsIndex } from "./output/index-updater.js";

function getDate(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  }); // YYYY-MM-DD format
}

async function main() {
  const repo = process.env.REPO || "jonmiller274-sudo/strata";
  const repoRoot = process.env.REPO_ROOT || process.cwd();
  const date = getDate();

  console.log(`PM Agent starting — ${date}`);
  console.log(`Repo: ${repo}`);
  console.log(`Root: ${repoRoot}`);

  // Step 1-6: Collect all data
  console.log("\nCollecting data...");

  const usability = collectUsability(repo);
  console.log(`  Usability: ${usability.totalFindings} open findings`);

  const quality = collectQuality(repoRoot);
  console.log(`  Quality: ${quality.openItems} open items`);

  const coordination = collectCoordination(repoRoot);
  console.log(`  Coordination: ${coordination.entriesThisWeek} entries this week`);

  const competitive = collectCompetitive(repo);
  console.log(`  Competitive: ${competitive.lastSelfAudit ? "active" : "not yet active"}`);

  const pending = collectPendingPlanning(repoRoot);
  console.log(`  Pending: ${pending.totalCount} decisions`);

  const openPRs = collectOpenPRs(repo);
  console.log(`  Open PRs: ${openPRs.total} total, ${openPRs.reviewQueue} awaiting review`);

  const allData: AllData = {
    usability,
    quality,
    coordination,
    competitive,
    pending,
    openPRs,
    date,
  };

  // Step 7: Quiet mode check
  const quiet = isQuiet(allData);
  console.log(`\nMode: ${quiet ? "QUIET" : "FULL"}`);

  // Step 8: Generate briefing
  const briefingContent = quiet
    ? generateQuietBriefing(allData)
    : generateFullBriefing(allData);

  // Step 9: Write briefing file
  const briefingPath = writeBriefing(repoRoot, date, briefingContent);

  // Step 10: Create GitHub Issue
  createIssue(repo, date, briefingPath, quiet);

  // Step 11: Update coordination log
  const summary = quiet
    ? `Product Briefing → docs/briefings/${date}.md (quiet — no new activity)`
    : `Product Briefing → docs/briefings/${date}.md (${usability.newThisWeek} usability, ${quality.openItems} quality open, ${openPRs.total} PRs)`;
  appendToCoordinationLog(repoRoot, date, summary);

  // Step 12: Update briefings index
  const tldr = quiet
    ? "No new activity"
    : briefingContent.split("\n").find((l) => l.length > 10 && !l.startsWith("#") && !l.startsWith("##"))?.trim() || "See briefing";
  updateBriefingsIndex(repoRoot, date, tldr);

  console.log("\nPM Agent complete.");
}

main().catch((err) => {
  console.error("PM Agent failed:", err);
  process.exit(1);
});

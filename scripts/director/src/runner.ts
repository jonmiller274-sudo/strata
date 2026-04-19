#!/usr/bin/env node

/**
 * Director Agent Runner — Daily Morning Digest
 *
 * Summarizes the last 24 hours of autonomous agent activity into a markdown
 * digest. Creates a GitHub issue, appends to the coordination log, updates
 * the digests index.
 *
 * Migrated from Mac-based Claude Code scheduled task to GitHub Actions.
 * No AI model calls — pure data gathering and markdown assembly.
 *
 * Environment variables:
 *   GH_TOKEN   — GitHub token (set by GitHub Actions)
 *   REPO       — GitHub repo in owner/repo format (default: jonmiller274-sudo/strata)
 *   REPO_ROOT  — Absolute path to repo root (default: process.cwd())
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const REPO = process.env.REPO || "jonmiller274-sudo/strata";
const REPO_ROOT = process.env.REPO_ROOT || process.cwd();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDateET(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function sh(cmd: string, opts: { cwd?: string } = {}): string {
  try {
    return execSync(cmd, {
      encoding: "utf-8",
      cwd: opts.cwd || REPO_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (err) {
    const e = err as { stdout?: Buffer | string; stderr?: Buffer | string };
    const out = typeof e.stdout === "string" ? e.stdout : (e.stdout?.toString() ?? "");
    return out.trim();
  }
}

function readFileIfExists(p: string): string {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "";
}

interface PRInfo {
  number: number;
  title: string;
  author: { login: string };
  url: string;
  labels: Array<{ name: string }>;
  mergedAt?: string;
  createdAt?: string;
}

function withinLastHours(isoTimestamp: string | undefined, hours: number): boolean {
  if (!isoTimestamp) return false;
  const then = new Date(isoTimestamp).getTime();
  const now = Date.now();
  return now - then <= hours * 3600 * 1000;
}

function getTier(pr: PRInfo): string {
  for (const l of pr.labels) {
    if (l.name.startsWith("tier-")) return l.name;
  }
  return "untiered";
}

// ---------------------------------------------------------------------------
// Collectors
// ---------------------------------------------------------------------------

function collectMergedPRs(): PRInfo[] {
  const out = sh(
    `gh pr list --repo ${REPO} --state merged --limit 50 --json number,title,mergedAt,author,url,labels`
  );
  const all: PRInfo[] = out ? JSON.parse(out) : [];
  return all.filter((pr) => withinLastHours(pr.mergedAt, 24));
}

function collectOpenPRs(): PRInfo[] {
  const out = sh(
    `gh pr list --repo ${REPO} --state open --limit 50 --json number,title,createdAt,author,url,labels`
  );
  return out ? JSON.parse(out) : [];
}

function collectRubricStats(): {
  open: number;
  completedThisWeek: number;
  oldestOpenItem: string;
} {
  const rubricPath = path.join(REPO_ROOT, "docs/quality-rubric.md");
  const content = readFileIfExists(rubricPath);
  if (!content) return { open: 0, completedThisWeek: 0, oldestOpenItem: "unknown" };

  // Count OPEN status markers
  const openMatches = content.match(/\*\*Status:\*\*\s+OPEN/g) || [];

  // Count items completed in the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const doneMatches = content.matchAll(/\*\*Status:\*\*\s+DONE\s*\((\d{4}-\d{2}-\d{2})/g);
  let completedThisWeek = 0;
  for (const m of doneMatches) {
    if (new Date(m[1]) >= sevenDaysAgo) completedThisWeek++;
  }

  // Find oldest open item — first QR-XX header above an OPEN status
  const lines = content.split("\n");
  let oldestOpen = "unknown";
  for (let i = 0; i < lines.length; i++) {
    if (/\*\*Status:\*\*\s+OPEN/.test(lines[i])) {
      // Look backwards for the nearest ### QR-XX header
      for (let j = i; j >= 0; j--) {
        const h = lines[j].match(/^###\s+(QR-\d+.*)/);
        if (h) {
          oldestOpen = h[1].trim();
          break;
        }
      }
      break;
    }
  }

  return { open: openMatches.length, completedThisWeek, oldestOpenItem: oldestOpen };
}

function collectPendingPlanning(): { total: number; titles: string[] } {
  const p = path.join(REPO_ROOT, "docs/pending-planning.md");
  const content = readFileIfExists(p);
  if (!content) return { total: 0, titles: [] };

  // Count items under headings "## Awaiting Design Decision", etc.
  const sections = content.split(/^##\s+Awaiting/m).slice(1);
  let total = 0;
  const titles: string[] = [];
  for (const sec of sections) {
    const items = sec.split("\n").filter((l) => /^-\s+/.test(l));
    total += items.length;
    for (const i of items.slice(0, 3)) {
      titles.push(i.replace(/^-\s+/, "").split(":")[0].trim());
    }
  }
  return { total, titles };
}

function readVQAData(): {
  latestAvgVqs: number | null;
  regressions: number;
  failures: number;
  sectionsScored: number;
  sevenDayTrend: "up" | "down" | "stable" | "insufficient-data";
} {
  const indexPath = path.join(REPO_ROOT, "docs/agents/vqa/vqs-index.md");
  const content = readFileIfExists(indexPath);
  if (!content) {
    return {
      latestAvgVqs: null,
      regressions: 0,
      failures: 0,
      sectionsScored: 0,
      sevenDayTrend: "insufficient-data",
    };
  }

  // Parse rows: | date | report-link | avg-vqs | sections | regressions |
  const rows = content.split("\n").filter((l) => /^\|\s+\d{4}-\d{2}-\d{2}/.test(l));
  if (rows.length === 0) {
    return {
      latestAvgVqs: null,
      regressions: 0,
      failures: 0,
      sectionsScored: 0,
      sevenDayTrend: "insufficient-data",
    };
  }

  // Most recent row is last
  const latestRow = rows[rows.length - 1];
  const cells = latestRow.split("|").map((c) => c.trim()).filter(Boolean);
  // cells = [date, report, vqs, sections, regressions]
  const latestVqs = parseInt(cells[2], 10) || null;
  const sections = parseInt(cells[3], 10) || 0;
  const regressions = parseInt(cells[4], 10) || 0;

  // 7-day trend — compare latest to avg of prior 7 rows
  let trend: "up" | "down" | "stable" | "insufficient-data" = "insufficient-data";
  if (rows.length >= 3 && latestVqs !== null) {
    const priorRows = rows.slice(-8, -1);
    if (priorRows.length > 0) {
      const priorAvg =
        priorRows.reduce((sum, r) => {
          const c = r.split("|").map((x) => x.trim()).filter(Boolean);
          return sum + (parseInt(c[2], 10) || 0);
        }, 0) / priorRows.length;
      const delta = latestVqs - priorAvg;
      if (delta > 2) trend = "up";
      else if (delta < -2) trend = "down";
      else trend = "stable";
    }
  }

  // Count today's failures from most recent VQA report
  const today = getDateET();
  const reportPath = path.join(REPO_ROOT, `docs/vqa/${today}.md`);
  let failures = 0;
  if (fs.existsSync(reportPath)) {
    const report = fs.readFileSync(reportPath, "utf-8");
    const failMatch = report.match(/Failing\s+\(<\s*\d+\)\s+\|\s+(\d+)/);
    failures = failMatch ? parseInt(failMatch[1], 10) : 0;
  }

  return {
    latestAvgVqs: latestVqs,
    regressions,
    failures,
    sectionsScored: sections,
    sevenDayTrend: trend,
  };
}

// ---------------------------------------------------------------------------
// Digest assembly
// ---------------------------------------------------------------------------

function assembleDigest(): string {
  const date = getDateET();
  const merged = collectMergedPRs();
  const open = collectOpenPRs();
  const rubric = collectRubricStats();
  const pending = collectPendingPlanning();
  const vqa = readVQAData();

  // Tier breakdown
  const mergedByTier: Record<string, PRInfo[]> = {};
  for (const pr of merged) {
    const t = getTier(pr);
    (mergedByTier[t] = mergedByTier[t] || []).push(pr);
  }
  const tier0Merged = (mergedByTier["tier-0"] || []).length;
  const tier1Merged = (mergedByTier["tier-1"] || []).length;

  const tier2Open = open.filter((pr) => getTier(pr) === "tier-2");
  const untiered = merged.filter((pr) => getTier(pr) === "untiered");

  // Reverts
  const reverts = merged.filter((pr) => /^revert|^revert:/i.test(pr.title));

  let out = `# Strata Daily — ${date}\n\n`;

  out += `## Last 24h\n\n`;
  out += `- Auto-merged: ${merged.length} PRs (Tier 0: ${tier0Merged}, Tier 1: ${tier1Merged})\n`;
  if (tier2Open.length === 0) {
    out += `- Your review: 0 PRs (Tier 2) — none\n`;
  } else {
    out += `- Your review: ${tier2Open.length} PRs (Tier 2):\n`;
    for (const pr of tier2Open) out += `  - [#${pr.number}](${pr.url}) ${pr.title}\n`;
  }
  out += `- Planning queue: ${pending.total} items — see \`docs/pending-planning.md\`\n`;
  if (reverts.length === 0) {
    out += `- Reverted: 0 PRs — none\n`;
  } else {
    out += `- Reverted: ${reverts.length} PRs:\n`;
    for (const pr of reverts) out += `  - [#${pr.number}](${pr.url}) ${pr.title}\n`;
  }
  if (untiered.length > 0) {
    out += `- Untiered merged PRs (flag): ${untiered.map((p) => `#${p.number}`).join(", ")}\n`;
  }

  out += `\n## Visual Quality\n\n`;
  if (vqa.latestAvgVqs === null) {
    out += `- VQA: not yet active\n`;
  } else {
    out += `- Avg VQS: ${vqa.latestAvgVqs} (trend: ${vqa.sevenDayTrend})\n`;
    out += `- Regressions: ${vqa.regressions} ${vqa.regressions === 0 ? "— none" : ""}\n`;
    out += `- Failures: ${vqa.failures} below ship threshold ${vqa.failures === 0 ? "— none" : ""}\n`;
    out += `- Coverage: ${vqa.sectionsScored} sections scored\n`;
  }

  out += `\n## Rubric Health\n\n`;
  out += `- Open items: ${rubric.open}\n`;
  out += `- Completed this week: ${rubric.completedThisWeek}\n`;
  out += `- Oldest open item: ${rubric.oldestOpenItem}\n`;

  out += `\n## Notable\n\n`;
  const notable: string[] = [];
  if (untiered.length > 0) notable.push(`${untiered.length} PR(s) merged without tier labels — check CI enforcement.`);
  if (reverts.length > 0) notable.push(`${reverts.length} revert(s) in the last 24h — investigate root cause.`);
  if (vqa.sevenDayTrend === "down") notable.push(`VQS 7-day trend is down — visual quality is slipping.`);
  if (vqa.failures > 0) notable.push(`${vqa.failures} section(s) below ship threshold — open VQA issues to review.`);
  if (rubric.open > 20) notable.push(`Rubric backlog is large (${rubric.open} items) — consider triaging.`);

  if (notable.length === 0) {
    out += `Quiet night — no warnings.\n`;
  } else {
    for (const n of notable) out += `- ${n}\n`;
  }

  out += `\n## Next Planning Session\n\n`;
  if (pending.total === 0) {
    out += `No blockers — agents are unblocked.\n`;
  } else {
    const top = pending.titles[0] || "oldest planning item";
    out += `Recommend: ${top}\n`;
  }

  return out;
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

function writeDigest(date: string, content: string): string {
  const dir = path.join(REPO_ROOT, "docs/digest");
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, `${date}.md`);
  fs.writeFileSync(p, content);
  console.log(`  Wrote: ${p}`);
  return p;
}

function createIssue(date: string, digestPath: string): void {
  const absPath = path.resolve(digestPath);
  const title = `Daily Digest — ${date}`;
  try {
    execSync(
      `gh issue create --repo ${REPO} --title ${JSON.stringify(title)} --label digest --body-file ${JSON.stringify(absPath)}`,
      { stdio: "inherit" }
    );
  } catch (err) {
    console.error("  Failed to create digest issue:", err);
  }
}

function appendCoordinationLog(date: string, summary: string): void {
  const p = path.join(REPO_ROOT, "docs/agents/coordination-log.md");
  if (!fs.existsSync(p)) return;

  const nowET = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/New_York",
  });
  const entry = `- ${nowET} | director | ${summary}\n`;
  const todayHeader = `## ${date}`;

  let content = fs.readFileSync(p, "utf-8");
  if (content.includes(todayHeader)) {
    content = content.replace(todayHeader, `${todayHeader}\n${entry}`);
    fs.writeFileSync(p, content);
  } else {
    const lines = content.split("\n");
    // Find first ## section (preserving header)
    const insertAt = lines.findIndex((l, i) => i > 0 && l.startsWith("## "));
    const insertIdx = insertAt === -1 ? 2 : insertAt;
    lines.splice(insertIdx, 0, "", todayHeader, entry.trimEnd(), "");
    fs.writeFileSync(p, lines.join("\n"));
  }
  console.log(`  Appended to coordination log`);
}

function updateDigestsIndex(date: string, summary: string): void {
  const p = path.join(REPO_ROOT, "docs/agents/director/digests-index.md");
  const row = `| ${date} | [Digest](../../digest/${date}.md) | ${summary} |\n`;

  if (!fs.existsSync(p)) {
    const header = `# Digests Index\n\n| Date | File | TL;DR |\n|------|------|-------|\n`;
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, header + row);
  } else {
    // Prepend after header table
    const content = fs.readFileSync(p, "utf-8");
    const lines = content.split("\n");
    // Insert row right after "|------|..." separator line
    const sepIdx = lines.findIndex((l) => /^\|[-|\s]+\|$/.test(l));
    if (sepIdx !== -1) {
      lines.splice(sepIdx + 1, 0, row.trimEnd());
      fs.writeFileSync(p, lines.join("\n"));
    } else {
      fs.appendFileSync(p, row);
    }
  }
  console.log(`  Updated digests index`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const date = getDateET();
  console.log(`Director — ${date}`);
  console.log(`Repo: ${REPO}`);
  console.log(`Root: ${REPO_ROOT}`);

  // Guard: don't overwrite today's digest
  const existingPath = path.join(REPO_ROOT, `docs/digest/${date}.md`);
  if (fs.existsSync(existingPath)) {
    console.log(`Today's digest already exists — skipping to avoid duplicates.`);
    return;
  }

  console.log("\nCollecting data...");
  const digest = assembleDigest();
  console.log(`  Digest assembled (${digest.split("\n").length} lines)`);

  console.log("\nWriting outputs...");
  const digestPath = writeDigest(date, digest);

  createIssue(date, digestPath);

  // Summary line for coordination log
  const mergedCount = (digest.match(/Auto-merged:\s+(\d+)/)?.[1] ?? "0");
  const reviewCount = (digest.match(/Your review:\s+(\d+)/)?.[1] ?? "0");
  const planningCount = (digest.match(/Planning queue:\s+(\d+)/)?.[1] ?? "0");
  const revertCount = (digest.match(/Reverted:\s+(\d+)/)?.[1] ?? "0");
  const summary = `Generated daily digest → docs/digest/${date}.md (${mergedCount} merged, ${reviewCount} open review, ${planningCount} Tier 3 planning items, ${revertCount} reverts)`;

  appendCoordinationLog(date, summary);
  updateDigestsIndex(date, summary);

  console.log("\nDirector complete.");
}

main().catch((err) => {
  console.error("Director failed:", err);
  process.exit(1);
});

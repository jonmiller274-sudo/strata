import type { UsabilityData } from "./collectors/usability.js";
import type { QualityData } from "./collectors/quality.js";
import type { CoordinationData } from "./collectors/coordination.js";
import type { CompetitiveData } from "./collectors/competitive.js";
import type { PendingPlanningData } from "./collectors/pending-planning.js";
import type { OpenPRsData } from "./collectors/open-prs.js";

export interface AllData {
  usability: UsabilityData;
  quality: QualityData;
  coordination: CoordinationData;
  competitive: CompetitiveData;
  pending: PendingPlanningData;
  openPRs: OpenPRsData;
  date: string;
}

export function isQuiet(data: AllData): boolean {
  return (
    data.usability.newThisWeek === 0 &&
    !data.coordination.hasActivity &&
    !data.competitive.hasNewFindings
  );
}

export function generateQuietBriefing(data: AllData): string {
  return [
    `# Product Briefing — ${data.date} — No new activity`,
    "",
    "All agents quiet. No new findings, no new PRs, no new competitive changes.",
    "",
    `- Open quality items: ${data.quality.openItems}`,
    `- Open PRs awaiting review: ${data.openPRs.reviewQueue}`,
    `- Pending decisions: ${data.pending.totalCount || "none"}`,
    "",
  ].join("\n");
}

export function generateFullBriefing(data: AllData): string {
  const { usability, quality, coordination, competitive, pending, openPRs } =
    data;

  // Build TL;DR — most important thing first
  const tldr = buildTldr(data);

  // Usability section
  const usabilitySection = [
    "## Usability",
    "",
    `- New findings this week: ${usability.newThisWeek} (${usability.bySeverity.critical} critical, ${usability.bySeverity.high} high, ${usability.bySeverity.medium} medium, ${usability.bySeverity.low} low)`,
    `- Top issue: ${usability.topIssue || "none"}`,
    `- Total open: ${usability.totalFindings}`,
  ].join("\n");

  // Quality section
  const qualitySection = [
    "## Quality",
    "",
    `- Rubric: ${quality.openItems} open, ${quality.completedThisWeek} completed this week, ${quality.totalCompleted} total completed`,
    `- Backlog health: Jon's review queue has ${openPRs.reviewQueue} PRs.${openPRs.oldestPR ? ` Oldest is ${openPRs.oldestPR.daysOld} days old.` : ""}`,
  ].join("\n");

  // Competitive section
  const competitiveSection = [
    "## Competitive",
    "",
    `- Last self-audit: ${competitive.lastSelfAudit ? `${competitive.lastSelfAudit.date} — ${competitive.lastSelfAudit.gapsFound} gaps found` : "not yet active"}`,
    `- Last market monitor: ${competitive.lastMarketMonitor ? `${competitive.lastMarketMonitor.date} — ${competitive.lastMarketMonitor.summary}` : "not yet active"}`,
    `- Gaps to close: ${competitive.topGaps.length > 0 ? competitive.topGaps.join("; ") : "none new"}`,
  ].join("\n");

  // Decisions section
  let decisionsSection: string;
  if (pending.items.length === 0) {
    decisionsSection = [
      "## Decisions Needed",
      "",
      "No decisions blocking agents.",
    ].join("\n");
  } else {
    const items = pending.items
      .map((i) => `- ${i.title} (${i.section})`)
      .join("\n");
    decisionsSection = ["## Decisions Needed", "", items].join("\n");
  }

  // Patterns section
  const patternsSection = [
    "## Patterns",
    "",
    buildPatterns(data),
  ].join("\n");

  // Recommendation
  const recommendation = [
    "## Recommended Next Session",
    "",
    buildRecommendation(data),
  ].join("\n");

  return [
    `# Product Briefing — ${data.date}`,
    "",
    "## TL;DR",
    "",
    tldr,
    "",
    usabilitySection,
    "",
    qualitySection,
    "",
    competitiveSection,
    "",
    decisionsSection,
    "",
    patternsSection,
    "",
    recommendation,
    "",
  ].join("\n");
}

function buildTldr(data: AllData): string {
  const parts: string[] = [];

  if (data.usability.bySeverity.critical > 0) {
    parts.push(
      `${data.usability.bySeverity.critical} critical usability finding(s) need attention.`
    );
  }

  if (data.openPRs.reviewQueue > 3) {
    parts.push(
      `PR review backlog growing: ${data.openPRs.reviewQueue} PRs waiting for review.`
    );
  }

  if (data.pending.totalCount > 0) {
    parts.push(
      `${data.pending.totalCount} decision(s) blocking agent work.`
    );
  }

  if (
    data.competitive.lastSelfAudit &&
    data.competitive.lastSelfAudit.gapsFound > 0
  ) {
    parts.push(
      `Competitive self-audit found ${data.competitive.lastSelfAudit.gapsFound} gaps vs the feature matrix.`
    );
  }

  if (parts.length === 0) {
    parts.push("Quiet day. No action needed.");
  }

  return parts.join(" ");
}

function buildPatterns(data: AllData): string {
  const patterns: string[] = [];

  // Check if usability keeps finding similar categories
  if (data.usability.bySeverity.medium > 3) {
    patterns.push(
      "Multiple medium-severity usability findings accumulating — consider a focused fix session."
    );
  }

  // Check if PR backlog is growing
  if (data.openPRs.total > 10) {
    patterns.push(
      `${data.openPRs.total} open PRs — backlog may be growing faster than review pace.`
    );
  }

  // Check if coordination log shows unbalanced activity
  const agents = Object.entries(data.coordination.byAgent);
  if (agents.length === 1) {
    patterns.push(
      `Only ${agents[0][0]} has been active this week. Other agents may need attention.`
    );
  }

  return patterns.length > 0
    ? patterns.map((p) => `- ${p}`).join("\n")
    : "No patterns this week.";
}

function buildRecommendation(data: AllData): string {
  // Priority order: critical usability > pending decisions > PR backlog > quality items

  if (data.usability.bySeverity.critical > 0) {
    return `Fix the critical usability finding: ${data.usability.topIssue}`;
  }

  if (data.pending.totalCount > 0) {
    return `Unblock agents: review the ${data.pending.totalCount} pending decision(s) in docs/pending-planning.md.`;
  }

  if (data.openPRs.reviewQueue > 5) {
    return `Clear the PR backlog: ${data.openPRs.reviewQueue} PRs are waiting for your review.`;
  }

  if (data.quality.openItems > 0) {
    return `${data.quality.openItems} quality items remain open. Consider re-enabling the Quality Engineer agent to work through them.`;
  }

  return "No action needed. Agents are humming.";
}

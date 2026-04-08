import { execSync } from "child_process";

export interface UsabilityData {
  totalFindings: number;
  bySeverity: { critical: number; high: number; medium: number; low: number };
  topIssue: string | null;
  newThisWeek: number;
  issues: Array<{ number: number; title: string; createdAt: string }>;
}

export function collectUsability(repo: string): UsabilityData {
  const raw = execSync(
    `gh issue list --repo ${repo} --label usability-test --state open --limit 50 --json number,title,createdAt,body`,
    { encoding: "utf-8" }
  );

  const issues: Array<{
    number: number;
    title: string;
    createdAt: string;
    body: string;
  }> = JSON.parse(raw);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentIssues = issues.filter(
    (i) => new Date(i.createdAt) >= sevenDaysAgo
  );

  // Parse severity from issue body — look for severity markers
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  let topIssue: string | null = null;
  let topSeverityRank = 999;

  const severityRank: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  for (const issue of issues) {
    const body = issue.body.toLowerCase();
    let matched = false;
    for (const sev of ["critical", "high", "medium", "low"] as const) {
      if (body.includes(`severity: ${sev}`) || body.includes(`| ${sev} |`)) {
        bySeverity[sev]++;
        if (severityRank[sev] < topSeverityRank) {
          topSeverityRank = severityRank[sev];
          topIssue = `#${issue.number}: ${issue.title}`;
        }
        matched = true;
        break;
      }
    }
    if (!matched) {
      bySeverity.medium++;
      if (topIssue === null) {
        topIssue = `#${issue.number}: ${issue.title}`;
      }
    }
  }

  return {
    totalFindings: issues.length,
    bySeverity,
    topIssue,
    newThisWeek: recentIssues.length,
    issues: issues.map((i) => ({
      number: i.number,
      title: i.title,
      createdAt: i.createdAt,
    })),
  };
}

import { execSync } from "child_process";

export interface CompetitiveData {
  lastSelfAudit: { date: string; gapsFound: number } | null;
  lastMarketMonitor: { date: string; summary: string } | null;
  topGaps: string[];
  hasNewFindings: boolean;
}

export function collectCompetitive(repo: string): CompetitiveData {
  let raw: string;
  try {
    raw = execSync(
      `gh issue list --repo ${repo} --label competitive-research --state all --limit 20 --json number,title,createdAt,body`,
      { encoding: "utf-8" }
    );
  } catch {
    return {
      lastSelfAudit: null,
      lastMarketMonitor: null,
      topGaps: [],
      hasNewFindings: false,
    };
  }

  const issues: Array<{
    number: number;
    title: string;
    createdAt: string;
    body: string;
  }> = JSON.parse(raw);

  if (issues.length === 0) {
    return {
      lastSelfAudit: null,
      lastMarketMonitor: null,
      topGaps: [],
      hasNewFindings: false,
    };
  }

  // Find latest self-audit and market monitor
  let lastSelfAudit: CompetitiveData["lastSelfAudit"] = null;
  let lastMarketMonitor: CompetitiveData["lastMarketMonitor"] = null;
  const topGaps: string[] = [];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  let hasNewFindings = false;

  for (const issue of issues) {
    const title = issue.title.toLowerCase();
    const created = new Date(issue.createdAt);

    if (created >= sevenDaysAgo) {
      hasNewFindings = true;
    }

    if (title.includes("self-audit") && !lastSelfAudit) {
      const gapMatch = issue.title.match(/(\d+)\s*gaps?\s*found/i);
      lastSelfAudit = {
        date: issue.createdAt.split("T")[0],
        gapsFound: gapMatch ? parseInt(gapMatch[1]) : 0,
      };
      // Extract top gaps from body
      const gapLines = issue.body
        .split("\n")
        .filter((l) => l.match(/^[-*]\s/))
        .slice(0, 2);
      topGaps.push(...gapLines.map((l) => l.replace(/^[-*]\s+/, "")));
    }

    if (title.includes("market monitor") && !lastMarketMonitor) {
      lastMarketMonitor = {
        date: issue.createdAt.split("T")[0],
        summary: issue.title.replace(/^Competitive Monitor\s*—?\s*/i, ""),
      };
    }
  }

  return { lastSelfAudit, lastMarketMonitor, topGaps, hasNewFindings };
}

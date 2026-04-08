import { readFileSync } from "fs";
import { join } from "path";

export interface CoordinationData {
  entriesThisWeek: number;
  byAgent: Record<string, number>;
  latestEntries: string[];
  hasActivity: boolean;
}

export function collectCoordination(repoRoot: string): CoordinationData {
  const logPath = join(repoRoot, "docs/agents/coordination-log.md");
  let content: string;
  try {
    content = readFileSync(logPath, "utf-8");
  } catch {
    return {
      entriesThisWeek: 0,
      byAgent: {},
      latestEntries: [],
      hasActivity: false,
    };
  }

  const lines = content.split("\n");
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const byAgent: Record<string, number> = {};
  const recentEntries: string[] = [];
  let currentDate: Date | null = null;

  for (const line of lines) {
    // Match date headers: ## 2026-04-05
    const dateMatch = line.match(/^## (\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      currentDate = new Date(dateMatch[1]);
      continue;
    }

    // Match log entries: - HH:MM | agent-name | ...
    const entryMatch = line.match(/^- \d{2}:\d{2} \| (\S+) \| (.+)/);
    if (entryMatch && currentDate && currentDate >= sevenDaysAgo) {
      const agent = entryMatch[1];
      byAgent[agent] = (byAgent[agent] || 0) + 1;
      recentEntries.push(line.trim());
    }
  }

  return {
    entriesThisWeek: recentEntries.length,
    byAgent,
    latestEntries: recentEntries.slice(0, 10),
    hasActivity: recentEntries.length > 0,
  };
}

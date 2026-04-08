import { readFileSync } from "fs";
import { join } from "path";
import type { Check } from "./checks.js";

/**
 * Select which checks to run this week using rotation.
 * Reads the scratchpad to find which checks ran last, then picks the next batch.
 * Each run does 3-4 checks. Full matrix (~10 checks) covered monthly.
 */
export function selectChecks(
  allChecks: Check[],
  repoRoot: string,
  checksPerRun: number = 4
): Check[] {
  const scratchpadPath = join(
    repoRoot,
    "docs/agents/competitive-researcher/scratchpad.md"
  );

  let lastRunIds: string[] = [];
  try {
    const content = readFileSync(scratchpadPath, "utf-8");
    // Find the most recent rotation log entry and extract check IDs
    const lastEntry = content.match(
      /Checks run: (SA-\d+(?:,\s*SA-\d+)*)/
    );
    if (lastEntry) {
      lastRunIds = lastEntry[1].split(",").map((s) => s.trim());
    }
  } catch {
    // No scratchpad yet — start from the beginning
  }

  if (lastRunIds.length === 0) {
    // First run — take the first batch
    return allChecks.slice(0, checksPerRun);
  }

  // Find the index of the last check that ran
  const lastCheckId = lastRunIds[lastRunIds.length - 1];
  const lastIndex = allChecks.findIndex((c) => c.id === lastCheckId);

  // Start from the next check, wrapping around
  const startIndex = (lastIndex + 1) % allChecks.length;
  const selected: Check[] = [];

  for (let i = 0; i < checksPerRun && i < allChecks.length; i++) {
    const idx = (startIndex + i) % allChecks.length;
    selected.push(allChecks[idx]);
  }

  return selected;
}

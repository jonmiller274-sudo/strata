import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { CheckResult } from "../self-audit/checks.js";

export function updateScratchpad(
  repoRoot: string,
  date: string,
  mode: "self-audit" | "market-monitor",
  checkIds: string[],
  gapsFound: number
): void {
  const path = join(
    repoRoot,
    "docs/agents/competitive-researcher/scratchpad.md"
  );
  let content: string;
  try {
    content = readFileSync(path, "utf-8");
  } catch {
    return;
  }

  if (mode === "self-audit") {
    const entry = `### ${date}\nChecks run: ${checkIds.join(", ")}. Gaps found: ${gapsFound}.`;
    content = content.replace(
      "## Self-Audit Rotation Log\n\n*Append after each self-audit run. Format: date, checks run, findings.*",
      `## Self-Audit Rotation Log\n\n${entry}\n\n*Append after each self-audit run. Format: date, checks run, findings.*`
    );
  } else {
    const entry = `### ${date}\nMarket monitor ran. Changes found: ${gapsFound}.`;
    content = content.replace(
      "## Market Monitor Log\n\n*Append after each market monitor run. Format: date, competitors checked, changes found.*",
      `## Market Monitor Log\n\n${entry}\n\n*Append after each market monitor run. Format: date, competitors checked, changes found.*`
    );
  }

  writeFileSync(path, content, "utf-8");
}

export function updateFeatureMatrix(
  repoRoot: string,
  results: CheckResult[]
): void {
  const path = join(
    repoRoot,
    "docs/agents/competitive-researcher/feature-matrix-snapshot.md"
  );
  let content: string;
  try {
    content = readFileSync(path, "utf-8");
  } catch {
    return;
  }

  for (const result of results) {
    // Update the Status column for this check's row
    const pattern = new RegExp(`(\\| ${result.id} \\|[^|]*\\|[^|]*\\|[^|]*\\|[^|]*\\|)\\s*\\w+\\s*\\|`);
    content = content.replace(pattern, `$1 ${result.status} |`);
  }

  writeFileSync(path, content, "utf-8");
}

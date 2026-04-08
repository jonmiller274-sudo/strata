import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface CompetitorChange {
  competitor: string;
  page: string;
  changeType: "pricing" | "features" | "messaging" | "new-page" | "down";
  summary: string;
  before: string;
  after: string;
}

export interface MarketMonitorResult {
  competitorsChecked: number;
  changesFound: CompetitorChange[];
  errors: string[];
}

interface WatchListEntry {
  competitor: string;
  homepage: string;
  pricing: string;
  notes: string;
}

function parseWatchList(repoRoot: string): WatchListEntry[] {
  const path = join(
    repoRoot,
    "docs/agents/competitive-researcher/watch-list.md"
  );
  const content = readFileSync(path, "utf-8");

  const entries: WatchListEntry[] = [];
  for (const line of content.split("\n")) {
    // Match table rows: | Competitor | https://... | https://... | Notes |
    const match = line.match(
      /^\|\s*([^|]+)\s*\|\s*(https?:\/\/[^|]+)\s*\|\s*(https?:\/\/[^|]+)\s*\|\s*([^|]*)\s*\|$/
    );
    if (match && !match[1].includes("---") && !match[1].includes("Competitor")) {
      entries.push({
        competitor: match[1].trim(),
        homepage: match[2].trim(),
        pricing: match[3].trim(),
        notes: match[4].trim(),
      });
    }
  }

  return entries;
}

async function fetchPageText(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Strata Market Monitor) AppleWebKit/537.36 Chrome/120.0.0.0",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return `[HTTP ${response.status}]`;
    }

    const html = await response.text();

    // Extract meaningful text: strip HTML, normalize whitespace
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Limit to first 5000 chars to keep snapshots manageable
    return text.slice(0, 5000);
  } catch (err) {
    return `[FETCH ERROR: ${err instanceof Error ? err.message : String(err)}]`;
  }
}

function diffTexts(before: string, after: string): string | null {
  if (before === after) return null;

  // Simple diff: find significant differences (ignore minor whitespace changes)
  const beforeNorm = before.replace(/\s+/g, " ").trim();
  const afterNorm = after.replace(/\s+/g, " ").trim();

  if (beforeNorm === afterNorm) return null;

  // Look for pricing changes
  const priceBefore = beforeNorm.match(/\$\d+[\d,.]*/g) || [];
  const priceAfter = afterNorm.match(/\$\d+[\d,.]*/g) || [];

  if (JSON.stringify(priceBefore) !== JSON.stringify(priceAfter)) {
    return `Pricing changed: ${priceBefore.join(", ")} → ${priceAfter.join(", ")}`;
  }

  // Check length difference as proxy for content change
  const lengthDiff = Math.abs(afterNorm.length - beforeNorm.length);
  if (lengthDiff > 200) {
    return `Significant content change (${lengthDiff > 0 ? "+" : ""}${afterNorm.length - beforeNorm.length} chars)`;
  }

  return "Minor content changes detected";
}

export async function runMarketMonitor(
  repoRoot: string
): Promise<MarketMonitorResult> {
  const watchList = parseWatchList(repoRoot);
  const snapshotsDir = join(
    repoRoot,
    "docs/agents/competitive-researcher/snapshots"
  );

  if (!existsSync(snapshotsDir)) {
    mkdirSync(snapshotsDir, { recursive: true });
  }

  const today = new Date().toISOString().split("T")[0];
  const changes: CompetitorChange[] = [];
  const errors: string[] = [];

  for (const entry of watchList) {
    console.log(`  Checking ${entry.competitor}...`);

    for (const [pageType, url] of [
      ["homepage", entry.homepage],
      ["pricing", entry.pricing],
    ] as const) {
      const snapshotName = `${entry.competitor.toLowerCase().replace(/\s+/g, "-")}-${pageType}`;
      const currentPath = join(snapshotsDir, `${snapshotName}-current.txt`);
      const newPath = join(snapshotsDir, `${snapshotName}-${today}.txt`);

      const newText = await fetchPageText(url);

      if (newText.startsWith("[")) {
        errors.push(`${entry.competitor} ${pageType}: ${newText}`);
        continue;
      }

      // Save new snapshot
      writeFileSync(newPath, newText, "utf-8");

      // Compare with previous snapshot
      if (existsSync(currentPath)) {
        const previousText = readFileSync(currentPath, "utf-8");
        const diff = diffTexts(previousText, newText);

        if (diff) {
          const changeType = diff.toLowerCase().includes("pricing")
            ? "pricing"
            : "features";
          changes.push({
            competitor: entry.competitor,
            page: pageType,
            changeType,
            summary: diff,
            before: previousText.slice(0, 500),
            after: newText.slice(0, 500),
          });
          console.log(`    CHANGE on ${pageType}: ${diff}`);
        } else {
          console.log(`    ${pageType}: no changes`);
        }
      } else {
        console.log(`    ${pageType}: first snapshot (no comparison)`);
      }

      // Update current snapshot
      writeFileSync(currentPath, newText, "utf-8");
    }
  }

  return {
    competitorsChecked: watchList.length,
    changesFound: changes,
    errors,
  };
}

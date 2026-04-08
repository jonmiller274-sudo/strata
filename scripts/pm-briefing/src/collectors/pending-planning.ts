import { readFileSync } from "fs";
import { join } from "path";

export interface PendingItem {
  title: string;
  section: string;
}

export interface PendingPlanningData {
  items: PendingItem[];
  totalCount: number;
}

export function collectPendingPlanning(repoRoot: string): PendingPlanningData {
  const path = join(repoRoot, "docs/pending-planning.md");
  let content: string;
  try {
    content = readFileSync(path, "utf-8");
  } catch {
    return { items: [], totalCount: 0 };
  }

  const items: PendingItem[] = [];
  let currentSection = "Unknown";
  let inAwaitingSection = false;

  for (const line of content.split("\n")) {
    // Match section headers: ## Awaiting Design Decision
    const sectionMatch = line.match(/^## (.+)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      inAwaitingSection = currentSection.toLowerCase().includes("awaiting");
      continue;
    }

    // Match item titles: ### QR-24 Hub Diagram visual upgrade
    const itemMatch = line.match(/^### (.+)/);
    if (itemMatch && inAwaitingSection) {
      items.push({
        title: itemMatch[1].trim(),
        section: currentSection,
      });
    }
  }

  return { items, totalCount: items.length };
}

import { readFileSync } from "fs";
import { join } from "path";

export interface QualityData {
  openItems: number;
  completedThisWeek: number;
  totalCompleted: number;
  oldestOpen: string | null;
}

export function collectQuality(repoRoot: string): QualityData {
  const rubricPath = join(repoRoot, "docs/quality-rubric.md");
  const content = readFileSync(rubricPath, "utf-8");

  // Count OPEN items
  const openMatches = content.match(/Status:\s*OPEN/gi);
  const openItems = openMatches ? openMatches.length : 0;

  // Count COMPLETED/DONE items
  const completedMatches = content.match(/Status:\s*(COMPLETED|DONE)/gi);
  const totalCompleted = completedMatches ? completedMatches.length : 0;

  // Find items completed in the last 7 days (look for date patterns near DONE/COMPLETED)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  let completedThisWeek = 0;

  const completedSections = content.match(
    /### QR-\d+:.*?(?=### QR-|\Z)/gs
  );
  if (completedSections) {
    for (const section of completedSections) {
      if (/Status:\s*(COMPLETED|DONE)/i.test(section)) {
        const dateMatch = section.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          const completedDate = new Date(dateMatch[1]);
          if (completedDate >= sevenDaysAgo) {
            completedThisWeek++;
          }
        }
      }
    }
  }

  // Find oldest OPEN item (first one in the file, since they're priority-ordered)
  let oldestOpen: string | null = null;
  const openItemMatch = content.match(/### (QR-\d+:[^\n]+)[\s\S]*?Status:\s*OPEN/i);
  if (openItemMatch) {
    oldestOpen = openItemMatch[1].trim();
  }

  return { openItems, completedThisWeek, totalCompleted, oldestOpen };
}

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export function updateBriefingsIndex(
  repoRoot: string,
  date: string,
  tldr: string
): void {
  const indexPath = join(repoRoot, "docs/agents/pm/briefings-index.md");
  let content: string;
  try {
    content = readFileSync(indexPath, "utf-8");
  } catch {
    content = [
      "# PM Agent — Briefings Index",
      "",
      "Table of contents for evening product briefings.",
      "",
      "| Date | File | TL;DR |",
      "|------|------|-------|",
      "",
    ].join("\n");
  }

  const filename = `${date}.md`;
  // Truncate TL;DR to keep table readable
  const shortTldr =
    tldr.length > 80 ? tldr.slice(0, 77) + "..." : tldr;
  const newRow = `| ${date} | ${filename} | ${shortTldr} |`;

  // Insert after the table header row
  const headerRowPattern = "|------|------|-------|";
  content = content.replace(
    headerRowPattern,
    `${headerRowPattern}\n${newRow}`
  );

  writeFileSync(indexPath, content, "utf-8");
  console.log(`Briefings index updated for ${date}`);
}

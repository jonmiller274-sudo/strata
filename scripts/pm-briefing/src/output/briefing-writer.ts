import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

export function writeBriefing(
  repoRoot: string,
  date: string,
  content: string
): string {
  const dir = join(repoRoot, "docs/briefings");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const filePath = join(dir, `${date}.md`);
  writeFileSync(filePath, content, "utf-8");
  console.log(`Briefing written to ${filePath}`);
  return filePath;
}

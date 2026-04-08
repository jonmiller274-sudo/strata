import { execSync } from "child_process";

export function createIssue(
  repo: string,
  date: string,
  briefingPath: string,
  isQuiet: boolean
): void {
  const title = isQuiet
    ? `Product Briefing — ${date} — No new activity`
    : `Product Briefing — ${date}`;

  try {
    execSync(
      `gh issue create --repo ${repo} --title "${title}" --label pm-briefing --body-file "${briefingPath}"`,
      { encoding: "utf-8", stdio: "pipe" }
    );
    console.log(`GitHub Issue created: ${title}`);
  } catch (err) {
    console.error("Failed to create GitHub Issue:", err);
    // Non-fatal — the briefing file is the primary output
  }
}

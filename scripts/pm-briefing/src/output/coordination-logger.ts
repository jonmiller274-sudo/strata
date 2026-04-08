import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export function appendToCoordinationLog(
  repoRoot: string,
  date: string,
  summary: string
): void {
  const logPath = join(repoRoot, "docs/agents/coordination-log.md");
  let content: string;
  try {
    content = readFileSync(logPath, "utf-8");
  } catch {
    content = "# Coordination Log\n\n";
  }

  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/New_York",
  });

  const entry = `- ${time} | pm | ${summary}`;
  const dateHeader = `## ${date}`;

  if (content.includes(dateHeader)) {
    // Insert entry after the date header
    content = content.replace(
      dateHeader,
      `${dateHeader}\n\n${entry}`
    );
  } else {
    // Create a new date section at the top (after the main heading)
    const firstHeaderEnd = content.indexOf("\n\n");
    if (firstHeaderEnd >= 0) {
      content =
        content.slice(0, firstHeaderEnd + 2) +
        `${dateHeader}\n\n${entry}\n\n` +
        content.slice(firstHeaderEnd + 2);
    } else {
      content += `\n${dateHeader}\n\n${entry}\n`;
    }
  }

  writeFileSync(logPath, content, "utf-8");
  console.log(`Coordination log updated for ${date}`);
}

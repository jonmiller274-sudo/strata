/**
 * llm-judge.ts — LLM Judge for Quality Engineer PRs
 *
 * Reviews QE pull requests for:
 * 1. Scope creep — changes beyond the claimed rubric item
 * 2. Design system compliance — does the fix follow design-system.md
 * 3. Build safety — no regressions introduced
 *
 * Usage (GitHub Action):
 *   npx tsx scripts/eval/llm-judge.ts --pr <number>
 *
 * Usage (local):
 *   npx tsx scripts/eval/llm-judge.ts --pr 42
 *   npx tsx scripts/eval/llm-judge.ts --pr 42 --dry-run
 *
 * Requires: ANTHROPIC_API_KEY, GITHUB_TOKEN
 */

import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MODEL = process.env.JUDGE_MODEL || "claude-sonnet-4-20250514";
const REPO = process.env.GITHUB_REPOSITORY || "jonmiller274-sudo/strata";
const DESIGN_SYSTEM_PATH = path.join(__dirname, "../../docs/design-system.md");
const RUBRIC_PATH = path.join(__dirname, "../../docs/eval/visual-quality-rubric.md");

// ---------------------------------------------------------------------------
// API key resolution
// ---------------------------------------------------------------------------

function getApiKey(): string {
  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey && envKey.length > 10) return envKey;

  const envLocalPath = path.join(__dirname, "../../.env.local");
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, "utf-8");
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match && match[1].length > 10) return match[1].trim();
  }

  throw new Error("ANTHROPIC_API_KEY not found");
}

// ---------------------------------------------------------------------------
// GitHub helpers (using gh CLI)
// ---------------------------------------------------------------------------

function gh(cmd: string): string {
  return execSync(`gh ${cmd}`, { encoding: "utf-8" }).trim();
}

interface PRData {
  number: number;
  title: string;
  body: string;
  labels: string[];
  author: string;
  branch: string;
  diff: string;
  files: string[];
}

function getPRData(prNumber: number): PRData {
  const prJson = gh(
    `pr view ${prNumber} --repo ${REPO} --json title,body,labels,author,headRefName`
  );
  const pr = JSON.parse(prJson);

  const diff = gh(`pr diff ${prNumber} --repo ${REPO}`);
  const filesJson = gh(
    `pr view ${prNumber} --repo ${REPO} --json files`
  );
  const files = JSON.parse(filesJson).files.map(
    (f: { path: string }) => f.path
  );

  return {
    number: prNumber,
    title: pr.title,
    body: pr.body || "",
    labels: pr.labels.map((l: { name: string }) => l.name),
    author: pr.author.login,
    branch: pr.headRefName,
    diff,
    files,
  };
}

// ---------------------------------------------------------------------------
// Judge prompt
// ---------------------------------------------------------------------------

function buildJudgePrompt(pr: PRData, designSystem: string): string {
  return `You are the LLM Judge for Strata, a SaaS product. Your job is to review Quality Engineer PRs for safety before they are merged.

## PR Under Review
- **Title:** ${pr.title}
- **Branch:** ${pr.branch}
- **Labels:** ${pr.labels.join(", ")}
- **Files changed:** ${pr.files.join(", ")}

## PR Description
${pr.body}

## Diff
\`\`\`diff
${pr.diff.slice(0, 15000)}
\`\`\`

## Design System (source of truth)
${designSystem.slice(0, 8000)}

## Your Review Checklist

### 1. Scope Creep (MOST IMPORTANT)
Quality Engineer PRs should fix ONE specific rubric item. Check for:
- Changes to files NOT related to the claimed fix
- "While I was here" improvements that aren't part of the rubric item
- New features, capabilities, or patterns beyond the fix
- Changes to the design system or quality rubric themselves (FORBIDDEN)
- Landing page or marketing copy changes (FORBIDDEN)

### 2. Design System Compliance
Check that the fix follows the design system:
- Correct color tokens (CSS variables, not raw hex)
- Correct opacity system (white/5, white/10, not random values)
- Correct typography scale (no text-[11px] or text-[9px])
- Correct border radii (rounded-xl for cards, rounded-lg for inner)
- Correct spacing patterns

### 3. Regression Risk
- Does the change break existing functionality?
- Are there TypeScript type changes that could cascade?
- Does it modify shared utilities or base components?
- Could it affect other section types?

## Your Response

Respond with ONLY valid JSON:
{
  "verdict": "approve" | "request-changes" | "veto",
  "confidence": <0-100>,
  "scope_creep": {
    "detected": true | false,
    "details": "<what's out of scope, or 'None detected'>"
  },
  "design_system": {
    "compliant": true | false,
    "violations": ["<violation 1>", "..."]
  },
  "regression_risk": "low" | "medium" | "high",
  "summary": "<2-3 sentence review summary>",
  "suggestions": ["<actionable suggestion>", "..."]
}

Verdicts:
- **approve**: Clean fix, in scope, design-system compliant
- **request-changes**: Minor issues that should be fixed (non-blocking)
- **veto**: Scope creep beyond the rubric item, design system violations, or regression risk. The agent should be sent back to try again.

Be calibrated. Most QE PRs are fine — they fix small visual issues. Only veto for genuine scope creep or design system violations. Don't veto for minor style preferences.`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface JudgeResult {
  verdict: "approve" | "request-changes" | "veto";
  confidence: number;
  scope_creep: { detected: boolean; details: string };
  design_system: { compliant: boolean; violations: string[] };
  regression_risk: "low" | "medium" | "high";
  summary: string;
  suggestions: string[];
}

async function main() {
  const args = process.argv.slice(2);
  const prIdx = args.indexOf("--pr");
  const dryRun = args.includes("--dry-run");

  if (prIdx === -1 || !args[prIdx + 1]) {
    console.error("Usage: npx tsx scripts/eval/llm-judge.ts --pr <number> [--dry-run]");
    process.exit(1);
  }

  const prNumber = parseInt(args[prIdx + 1], 10);
  console.log(`Reviewing PR #${prNumber}...`);

  // Fetch PR data
  const pr = getPRData(prNumber);
  console.log(`  Title: ${pr.title}`);
  console.log(`  Files: ${pr.files.length}`);
  console.log(`  Labels: ${pr.labels.join(", ")}`);

  // Skip non-quality PRs
  const isQualityPR =
    pr.branch.startsWith("quality/") ||
    pr.branch.startsWith("discovery/") ||
    pr.labels.some((l) => l.startsWith("tier-"));

  if (!isQualityPR) {
    console.log("Not a quality/agent PR — skipping judge review.");
    process.exit(0);
  }

  // Load design system
  const designSystem = fs.existsSync(DESIGN_SYSTEM_PATH)
    ? fs.readFileSync(DESIGN_SYSTEM_PATH, "utf-8")
    : "Design system document not found.";

  // Build prompt and call Claude
  const prompt = buildJudgePrompt(pr, designSystem);
  const apiKey = getApiKey();
  const client = new Anthropic({ apiKey });

  console.log(`\nCalling Claude (${MODEL})...`);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    console.error("No text response from Claude");
    process.exit(1);
  }

  let jsonStr = textBlock.text.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const result: JudgeResult = JSON.parse(jsonStr);

  // Print results
  const verdictEmoji =
    result.verdict === "approve"
      ? "APPROVED"
      : result.verdict === "request-changes"
        ? "CHANGES REQUESTED"
        : "VETOED";

  console.log(`\n${"=".repeat(50)}`);
  console.log(`VERDICT: ${verdictEmoji} (confidence: ${result.confidence}%)`);
  console.log("=".repeat(50));
  console.log(`\n${result.summary}`);

  if (result.scope_creep.detected) {
    console.log(`\nScope Creep: ${result.scope_creep.details}`);
  }

  if (!result.design_system.compliant) {
    console.log(`\nDesign System Violations:`);
    for (const v of result.design_system.violations) {
      console.log(`  - ${v}`);
    }
  }

  if (result.suggestions.length > 0) {
    console.log(`\nSuggestions:`);
    for (const s of result.suggestions) {
      console.log(`  - ${s}`);
    }
  }

  // Post comment to PR (unless dry run)
  if (!dryRun) {
    const commentBody = formatComment(result, prNumber);
    gh(
      `pr comment ${prNumber} --repo ${REPO} --body ${JSON.stringify(commentBody)}`
    );
    console.log(`\nComment posted to PR #${prNumber}`);

    // If veto, add veto label
    if (result.verdict === "veto") {
      gh(`pr edit ${prNumber} --repo ${REPO} --add-label "veto"`);
      console.log("Veto label added — auto-merge blocked.");
    }
  } else {
    console.log("\n[DRY RUN] Would post comment and apply labels.");
  }
}

function formatComment(result: JudgeResult, prNumber: number): string {
  const icon =
    result.verdict === "approve"
      ? "white_check_mark"
      : result.verdict === "request-changes"
        ? "warning"
        : "no_entry_sign";

  let body = `## :${icon}: LLM Judge Review\n\n`;
  body += `**Verdict:** ${result.verdict.toUpperCase()} (${result.confidence}% confidence)\n`;
  body += `**Regression Risk:** ${result.regression_risk}\n\n`;
  body += `${result.summary}\n`;

  if (result.scope_creep.detected) {
    body += `\n### Scope Creep Detected\n${result.scope_creep.details}\n`;
  }

  if (!result.design_system.compliant) {
    body += `\n### Design System Violations\n`;
    for (const v of result.design_system.violations) {
      body += `- ${v}\n`;
    }
  }

  if (result.suggestions.length > 0) {
    body += `\n### Suggestions\n`;
    for (const s of result.suggestions) {
      body += `- ${s}\n`;
    }
  }

  body += `\n---\n*Reviewed by LLM Judge (${MODEL}) — [Visual Quality Rubric](../docs/eval/visual-quality-rubric.md)*`;

  return body;
}

main().catch((err) => {
  console.error("Judge failed:", err);
  process.exit(1);
});

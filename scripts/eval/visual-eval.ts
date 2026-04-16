/**
 * visual-eval.ts — Visual Eval Harness: Claude Vision Scorer
 *
 * Reads section screenshots from the manifest and scores each one
 * against the Visual Quality Rubric using Claude's vision API.
 *
 * Usage:
 *   npx tsx scripts/eval/visual-eval.ts                    Score all screenshots in manifest
 *   npx tsx scripts/eval/visual-eval.ts --slug <slug>      Score sections for a specific artifact
 *   npx tsx scripts/eval/visual-eval.ts --threshold 60     Only report sections below threshold
 *
 * Output: scripts/eval/screenshots/scores.json
 *
 * Requires: ANTHROPIC_API_KEY in environment or .env.local
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SCREENSHOT_DIR = path.join(__dirname, "screenshots");
const MANIFEST_PATH = path.join(SCREENSHOT_DIR, "manifest.json");
const SCORES_PATH = path.join(SCREENSHOT_DIR, "scores.json");
const RUBRIC_PATH = path.join(__dirname, "../../docs/eval/visual-quality-rubric.md");

// Model selection: Sonnet for speed + cost efficiency, Opus for calibration
const MODEL = process.env.EVAL_MODEL || "claude-sonnet-4-20250514";
const MAX_CONCURRENT = 3; // Limit concurrent API calls

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectionScreenshot {
  slug: string;
  sectionId: string;
  sectionType: string;
  sectionIndex: number;
  filepath: string;
  width: number;
  height: number;
}

interface ScreenshotResult {
  slug: string;
  url: string;
  sections: SectionScreenshot[];
  errors: string[];
  timestamp: string;
}

interface DimensionScores {
  layout_integrity: number;
  text_readability: number;
  visual_consistency: number;
  information_hierarchy: number;
  completeness: number;
  polish: number;
}

interface ScoringIssue {
  dimension: keyof DimensionScores;
  severity: "critical" | "major" | "minor";
  description: string;
}

interface SectionScore {
  slug: string;
  sectionId: string;
  sectionType: string;
  sectionIndex: number;
  vqs: number;
  dimensions: DimensionScores;
  issues: ScoringIssue[];
  passed: boolean;
  reasoning: string;
}

interface EvalResult {
  timestamp: string;
  model: string;
  rubric_version: string;
  total_sections: number;
  average_vqs: number;
  passing_sections: number;
  failing_sections: number;
  sections: SectionScore[];
  cost_estimate_usd: number;
}

// ---------------------------------------------------------------------------
// Rubric loader
// ---------------------------------------------------------------------------

function loadRubric(): string {
  if (!fs.existsSync(RUBRIC_PATH)) {
    throw new Error(`Rubric not found at ${RUBRIC_PATH}`);
  }
  return fs.readFileSync(RUBRIC_PATH, "utf-8");
}

// ---------------------------------------------------------------------------
// API key resolution (matches src/lib/ai/anthropic-client.ts fallback)
// ---------------------------------------------------------------------------

function getApiKey(): string {
  // Check env first
  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey && envKey.length > 10) return envKey;

  // Fallback: read .env.local directly (Claude Desktop sets empty ANTHROPIC_API_KEY)
  const envLocalPath = path.join(__dirname, "../../.env.local");
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, "utf-8");
    const match = envContent.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match && match[1].length > 10) {
      return match[1].trim();
    }
  }

  throw new Error(
    "ANTHROPIC_API_KEY not found in environment or .env.local"
  );
}

// ---------------------------------------------------------------------------
// Scoring prompt
// ---------------------------------------------------------------------------

function buildScoringPrompt(
  rubric: string,
  sectionType: string,
  sectionIndex: number
): string {
  return `You are a Visual Quality Assessor for a SaaS product called Strata.

You will be shown a screenshot of a single section from an interactive strategy document. Score it against the Visual Quality Rubric below.

## Section Context
- Section type: ${sectionType}
- Section index: ${sectionIndex} (0-based position in the document)
- Theme: Dark (dark background with light text)
- Expected viewport: 1280px wide, retina (2x)

## Visual Quality Rubric
${rubric}

## Your Task
Score this section screenshot on each of the 6 dimensions (0-100 each). Then compute the weighted VQS:
- Layout Integrity: 25%
- Text Readability: 20%
- Visual Consistency: 20%
- Information Hierarchy: 15%
- Completeness: 10%
- Polish: 10%

For each dimension where you score below 80, identify the specific issue(s).

Respond with ONLY valid JSON in this exact format:
{
  "layout_integrity": <0-100>,
  "text_readability": <0-100>,
  "visual_consistency": <0-100>,
  "information_hierarchy": <0-100>,
  "completeness": <0-100>,
  "polish": <0-100>,
  "issues": [
    {
      "dimension": "<dimension_name>",
      "severity": "<critical|major|minor>",
      "description": "<specific observation>"
    }
  ],
  "reasoning": "<2-3 sentence summary of overall quality>"
}

Be precise and calibrated. 75 is "good, minor issues." 90+ is "board-ready, no edits needed." Don't grade inflate — a section that "looks fine but has small spacing issues" is a 78, not a 92.`;
}

// ---------------------------------------------------------------------------
// Score a single section
// ---------------------------------------------------------------------------

async function scoreSection(
  client: Anthropic,
  section: SectionScreenshot,
  rubric: string
): Promise<SectionScore> {
  const imageData = fs.readFileSync(section.filepath);
  const base64 = imageData.toString("base64");
  const mediaType = "image/png";

  const prompt = buildScoringPrompt(
    rubric,
    section.sectionType,
    section.sectionIndex
  );

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  // Extract JSON from response
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Parse JSON — handle potential markdown code fences
  let jsonStr = textBlock.text.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(jsonStr);

  // Compute weighted VQS
  const weights = {
    layout_integrity: 0.25,
    text_readability: 0.2,
    visual_consistency: 0.2,
    information_hierarchy: 0.15,
    completeness: 0.1,
    polish: 0.1,
  };

  const vqs = Math.round(
    parsed.layout_integrity * weights.layout_integrity +
      parsed.text_readability * weights.text_readability +
      parsed.visual_consistency * weights.visual_consistency +
      parsed.information_hierarchy * weights.information_hierarchy +
      parsed.completeness * weights.completeness +
      parsed.polish * weights.polish
  );

  return {
    slug: section.slug,
    sectionId: section.sectionId,
    sectionType: section.sectionType,
    sectionIndex: section.sectionIndex,
    vqs,
    dimensions: {
      layout_integrity: parsed.layout_integrity,
      text_readability: parsed.text_readability,
      visual_consistency: parsed.visual_consistency,
      information_hierarchy: parsed.information_hierarchy,
      completeness: parsed.completeness,
      polish: parsed.polish,
    },
    issues: parsed.issues || [],
    passed: vqs >= 75,
    reasoning: parsed.reasoning || "",
  };
}

// ---------------------------------------------------------------------------
// Batch scoring with concurrency limit
// ---------------------------------------------------------------------------

async function scoreBatch(
  client: Anthropic,
  sections: SectionScreenshot[],
  rubric: string
): Promise<SectionScore[]> {
  const results: SectionScore[] = [];
  const errors: Array<{ section: SectionScreenshot; error: string }> = [];

  // Process in batches of MAX_CONCURRENT
  for (let i = 0; i < sections.length; i += MAX_CONCURRENT) {
    const batch = sections.slice(i, i + MAX_CONCURRENT);
    const promises = batch.map(async (section) => {
      try {
        const score = await scoreSection(client, section, rubric);
        return { score, error: null };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(
          `  Error scoring ${section.sectionId}: ${msg}`
        );
        return { score: null, error: msg };
      }
    });

    const batchResults = await Promise.all(promises);

    for (let j = 0; j < batchResults.length; j++) {
      const { score, error } = batchResults[j];
      if (score) {
        results.push(score);
        const icon = score.passed ? "PASS" : "FAIL";
        console.log(
          `  [${icon}] ${score.sectionType} (${score.sectionId}): VQS ${score.vqs}`
        );
      } else {
        errors.push({ section: batch[j], error: error || "Unknown error" });
      }
    }
  }

  if (errors.length > 0) {
    console.log(`\n${errors.length} sections failed to score:`);
    for (const { section, error } of errors) {
      console.log(`  - ${section.sectionId}: ${error}`);
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`
Visual Eval Harness — Claude Vision Scorer

Usage:
  npx tsx scripts/eval/visual-eval.ts                    Score all screenshots in manifest
  npx tsx scripts/eval/visual-eval.ts --slug <slug>      Score sections for a specific artifact
  npx tsx scripts/eval/visual-eval.ts --threshold <n>    Only report sections below threshold (default: 100)

Options:
  --model <model>    Override Claude model (default: claude-sonnet-4-20250514)

Output: scripts/eval/screenshots/scores.json
`);
    process.exit(0);
  }

  // Load manifest
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(
      "No manifest found. Run screenshot-sections.ts first.\n" +
        `Expected: ${MANIFEST_PATH}`
    );
    process.exit(1);
  }

  const manifest: ScreenshotResult[] = JSON.parse(
    fs.readFileSync(MANIFEST_PATH, "utf-8")
  );

  // Filter by slug if specified
  const slugIdx = args.indexOf("--slug");
  const filterSlug = slugIdx !== -1 ? args[slugIdx + 1] : null;

  let allSections: SectionScreenshot[] = [];
  for (const result of manifest) {
    if (filterSlug && result.slug !== filterSlug) continue;
    // Only include sections whose screenshot files still exist
    for (const section of result.sections) {
      if (fs.existsSync(section.filepath)) {
        allSections.push(section);
      }
    }
  }

  if (allSections.length === 0) {
    console.error("No sections to score. Run screenshot-sections.ts first.");
    process.exit(1);
  }

  // Parse threshold
  const threshIdx = args.indexOf("--threshold");
  const threshold = threshIdx !== -1 ? parseInt(args[threshIdx + 1], 10) : 100;

  // Load rubric
  console.log("Loading visual quality rubric...");
  const rubric = loadRubric();

  // Initialize client
  console.log(`Initializing Claude (${MODEL})...`);
  const apiKey = getApiKey();
  const client = new Anthropic({ apiKey });

  // Score all sections
  console.log(`\nScoring ${allSections.length} sections...\n`);
  const scores = await scoreBatch(client, allSections, rubric);

  // Compute summary
  const avgVqs =
    scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.vqs, 0) / scores.length)
      : 0;
  const passing = scores.filter((s) => s.passed).length;
  const failing = scores.filter((s) => !s.passed).length;

  // Rough cost estimate: ~$0.003 per section (Sonnet with image)
  const costEstimate = scores.length * 0.003;

  const evalResult: EvalResult = {
    timestamp: new Date().toISOString(),
    model: MODEL,
    rubric_version: "1.0",
    total_sections: scores.length,
    average_vqs: avgVqs,
    passing_sections: passing,
    failing_sections: failing,
    sections: scores,
    cost_estimate_usd: Math.round(costEstimate * 1000) / 1000,
  };

  // Write scores
  fs.writeFileSync(SCORES_PATH, JSON.stringify(evalResult, null, 2));

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("VISUAL QUALITY EVAL SUMMARY");
  console.log("=".repeat(60));
  console.log(`Model:     ${MODEL}`);
  console.log(`Sections:  ${scores.length}`);
  console.log(`Avg VQS:   ${avgVqs}`);
  console.log(`Passing:   ${passing} (>= 75)`);
  console.log(`Failing:   ${failing} (< 75)`);
  console.log(`Cost:      ~$${costEstimate.toFixed(3)}`);
  console.log(`Output:    ${SCORES_PATH}`);

  // Report sections below threshold
  const belowThreshold = scores
    .filter((s) => s.vqs < threshold)
    .sort((a, b) => a.vqs - b.vqs);

  if (belowThreshold.length > 0) {
    console.log(`\nSections below ${threshold}:`);
    for (const s of belowThreshold) {
      console.log(
        `  ${s.vqs.toString().padStart(3)} | ${s.sectionType.padEnd(20)} | ${s.slug}/${s.sectionId}`
      );
      for (const issue of s.issues) {
        const icon =
          issue.severity === "critical"
            ? "!!!"
            : issue.severity === "major"
              ? " !!"
              : "  !";
        console.log(`       ${icon} [${issue.dimension}] ${issue.description}`);
      }
    }
  }

  // Exit with non-zero if any sections fail
  if (failing > 0) {
    console.log(`\n${failing} section(s) below ship threshold (VQS < 75)`);
    process.exit(1);
  }

  console.log("\nAll sections pass ship threshold.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

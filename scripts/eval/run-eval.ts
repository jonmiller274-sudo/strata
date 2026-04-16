/**
 * run-eval.ts — Full eval pipeline orchestrator
 *
 * Runs the complete visual eval loop:
 * 1. Generate test fixtures (content-profiles × section-types)
 * 2. Screenshot each fixture via Playwright
 * 3. Score each section via Claude Vision
 * 4. Output report with failing sections
 *
 * Usage:
 *   npx tsx scripts/eval/run-eval.ts                    Full eval (all profiles, all sections)
 *   npx tsx scripts/eval/run-eval.ts --profile baseline  Single profile
 *   npx tsx scripts/eval/run-eval.ts --quick             Baseline only, skip scoring sections >=75
 *
 * Requires: Dev server running at localhost:3000
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const SCRIPTS_DIR = __dirname;
const FIXTURES_DIR = path.join(SCRIPTS_DIR, "fixtures");
const SCREENSHOT_DIR = path.join(SCRIPTS_DIR, "screenshots");

function run(cmd: string, label: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`STEP: ${label}`);
  console.log("=".repeat(60));
  try {
    execSync(cmd, { stdio: "inherit", cwd: path.join(SCRIPTS_DIR, "../..") });
  } catch (err) {
    console.error(`Step failed: ${label}`);
    throw err;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const quick = args.includes("--quick");
  const profileFlag = args.includes("--profile")
    ? `--profile ${args[args.indexOf("--profile") + 1]}`
    : quick
      ? "--profile baseline"
      : "";

  const startTime = Date.now();

  // Step 1: Generate fixtures
  run(
    `npx tsx scripts/eval/generate-fixtures.ts ${profileFlag}`,
    "Generate test fixtures"
  );

  // Step 2: Read fixture manifest to get slugs
  const manifestPath = path.join(FIXTURES_DIR, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("No fixture manifest found.");
    process.exit(1);
  }

  // Get all fixture files (the "all sections" ones for full coverage)
  const fixtureFiles = fs
    .readdirSync(FIXTURES_DIR)
    .filter((f) => f.endsWith(".json") && f !== "manifest.json" && f.includes("-all.json"));

  if (fixtureFiles.length === 0) {
    console.error("No fixture files found.");
    process.exit(1);
  }

  console.log(`\nFound ${fixtureFiles.length} fixture artifacts to evaluate.`);

  // Step 3: Screenshot each fixture
  for (const file of fixtureFiles) {
    const slug = file.replace(".json", "");
    run(
      `npx tsx scripts/eval/screenshot-sections.ts --url http://localhost:3000/eval/${slug}`,
      `Screenshot: ${slug}`
    );
  }

  // Step 4: Score all screenshots
  const thresholdFlag = quick ? "--threshold 75" : "";
  run(
    `npx tsx scripts/eval/visual-eval.ts ${thresholdFlag}`,
    "Score with Claude Vision"
  );

  // Step 5: Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const scoresPath = path.join(SCREENSHOT_DIR, "scores.json");

  if (fs.existsSync(scoresPath)) {
    const scores = JSON.parse(fs.readFileSync(scoresPath, "utf-8"));
    console.log(`\n${"=".repeat(60)}`);
    console.log("EVAL COMPLETE");
    console.log("=".repeat(60));
    console.log(`Time:       ${elapsed}s`);
    console.log(`Sections:   ${scores.total_sections}`);
    console.log(`Avg VQS:    ${scores.average_vqs}`);
    console.log(`Passing:    ${scores.passing_sections}`);
    console.log(`Failing:    ${scores.failing_sections}`);
    console.log(`Cost:       ~$${scores.cost_estimate_usd}`);

    if (scores.failing_sections > 0) {
      console.log(`\nFAILING SECTIONS (VQS < 75):`);
      for (const s of scores.sections.filter((s: { passed: boolean }) => !s.passed)) {
        console.log(`  ${s.vqs} | ${s.sectionType.padEnd(20)} | ${s.slug}/${s.sectionId}`);
        for (const issue of s.issues) {
          console.log(`       [${issue.severity}] ${issue.description}`);
        }
      }
    }
  }
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});

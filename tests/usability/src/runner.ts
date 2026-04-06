/**
 * Usability Test Runner
 *
 * Main entry point. Reads configuration from environment variables,
 * selects scenarios to run (explicit list or daily rotation),
 * launches Playwright, runs each scenario, and writes a findings report.
 *
 * Environment variables:
 *   TARGET_URL   — URL to test against (default: https://sharestrata.com)
 *   SCENARIO_IDS — Comma-separated scenario IDs to run (default: daily rotation)
 */

import { chromium } from "playwright";
import { v4 as uuidv4 } from "uuid";
import { getScenario, getAllScenarioIds } from "./scenarios/index.js";
import { getPersona } from "./personas/index.js";
import { createScreenshotCapture } from "./utils/screenshot.js";
import {
  FindingCollector,
  writeReport,
  type UsabilityReport,
  type UsabilityFinding,
} from "./utils/findings.js";
import { getScenariosForToday } from "./utils/rotation.js";

async function main(): Promise<void> {
  const targetUrl = process.env.TARGET_URL || "https://sharestrata.com";
  const scenarioIdsEnv = process.env.SCENARIO_IDS?.trim() || "";
  const runId = uuidv4().slice(0, 8);
  const runDate = new Date().toISOString().split("T")[0];

  console.log(`\n=== Strata Usability Test Runner ===`);
  console.log(`  Run ID:     ${runId}`);
  console.log(`  Date:       ${runDate}`);
  console.log(`  Target URL: ${targetUrl}`);

  // Determine which scenarios to run
  let scenarioIds: string[];
  if (scenarioIdsEnv) {
    scenarioIds = scenarioIdsEnv.split(",").map((s) => s.trim()).filter(Boolean);
    console.log(`  Scenarios:  ${scenarioIds.join(", ")} (explicit)`);
  } else {
    scenarioIds = getScenariosForToday(getAllScenarioIds());
    console.log(`  Scenarios:  ${scenarioIds.join(", ")} (daily rotation)`);
  }

  console.log("");

  // Validate scenario IDs
  for (const id of scenarioIds) {
    getScenario(id); // Throws if unknown
  }

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const runStart = Date.now();

  const allFindings: UsabilityFinding[] = [];
  const allScreenshots: string[] = [];
  const scenariosRun: string[] = [];
  let totalSteps = 0;

  for (const scenarioId of scenarioIds) {
    const scenario = getScenario(scenarioId);
    const persona = getPersona(scenario.config.persona);

    console.log(`--- Running: ${scenario.config.name} (${persona.name}) ---`);

    // Create a fresh browser context with the persona's viewport
    const context = await browser.newContext({
      viewport: persona.viewport,
      userAgent: persona.userAgent,
      baseURL: targetUrl,
      ignoreHTTPSErrors: true,
    });

    // Capture console errors for the page
    const page = await context.newPage();
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(String(err));
    });

    const screenshotHelper = createScreenshotCapture(page, scenarioId);
    const collector = new FindingCollector(
      scenarioId,
      persona.id,
      persona.viewport
    );

    try {
      await scenario.run(page, persona, screenshotHelper, collector);
    } catch (err) {
      // Scenario-level crash — report as critical finding
      console.error(`  CRASH in ${scenarioId}: ${err}`);
      collector.addFinding({
        severity: "critical",
        step: 0,
        step_description: "Scenario execution",
        category: "bug",
        description: `Scenario crashed with unhandled error: ${err}`,
        expected: "Scenario completes without crashing",
        actual: String(err),
        screenshot_path: "",
        url: targetUrl,
      });
    }

    // Report any unhandled console errors as findings
    if (consoleErrors.length > 0) {
      collector.addFinding({
        severity: "high",
        step: 0,
        step_description: "Console error monitoring",
        category: "bug",
        description: `${consoleErrors.length} JavaScript error(s) in console during ${scenarioId}`,
        expected: "No console errors",
        actual: consoleErrors.slice(0, 5).join("\n"),
        screenshot_path: "",
        url: targetUrl,
        recommendation: "Investigate JS errors — they may indicate broken functionality",
      });
    }

    const findings = collector.getFindings();
    allFindings.push(...findings);
    allScreenshots.push(...screenshotHelper.paths);
    totalSteps += collector.getStepCount();
    scenariosRun.push(scenarioId);

    const severity = {
      critical: findings.filter((f) => f.severity === "critical").length,
      high: findings.filter((f) => f.severity === "high").length,
      medium: findings.filter((f) => f.severity === "medium").length,
      low: findings.filter((f) => f.severity === "low").length,
    };

    console.log(
      `  Done. ${collector.getStepCount()} steps, ${findings.length} findings ` +
        `(${severity.critical}C ${severity.high}H ${severity.medium}M ${severity.low}L), ` +
        `${screenshotHelper.paths.length} screenshots`
    );

    await context.close();
  }

  await browser.close();

  const duration = Date.now() - runStart;

  // Write report
  const report: UsabilityReport = {
    run_id: runId,
    run_date: runDate,
    target_url: targetUrl,
    scenarios_run: scenariosRun,
    total_steps: totalSteps,
    findings: allFindings,
    screenshots: allScreenshots,
    duration_ms: duration,
  };

  const reportPath = writeReport(report);

  // Summary
  console.log(`\n=== Run Complete ===`);
  console.log(`  Duration:    ${Math.round(duration / 1000)}s`);
  console.log(`  Scenarios:   ${scenariosRun.length}`);
  console.log(`  Steps:       ${totalSteps}`);
  console.log(`  Findings:    ${allFindings.length}`);
  console.log(`  Screenshots: ${allScreenshots.length}`);
  console.log(`  Report:      ${reportPath}`);
  console.log("");

  // Exit 0 — findings are informational, not failures
  process.exit(0);
}

main().catch((err) => {
  console.error("Runner failed:", err);
  process.exit(1);
});

import { chromium } from "playwright";
import { existsSync, mkdirSync } from "fs";
import { ALL_CHECKS, type CheckResult } from "./checks.js";
import { selectChecks } from "./rotation.js";

export async function runSelfAudit(
  targetUrl: string,
  repoRoot: string,
  screenshotDir: string
): Promise<CheckResult[]> {
  if (!existsSync(screenshotDir)) {
    mkdirSync(screenshotDir, { recursive: true });
  }

  const checksToRun = selectChecks(ALL_CHECKS, repoRoot, 4);
  console.log(
    `Self-audit: running ${checksToRun.length} checks: ${checksToRun.map((c) => c.id).join(", ")}`
  );

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Strata Self-Audit Agent) AppleWebKit/537.36 Chrome/120.0.0.0",
  });
  const page = await context.newPage();

  const results: CheckResult[] = [];

  for (const check of checksToRun) {
    console.log(`  Running ${check.id}: ${check.capability}...`);
    try {
      const result = await check.run(page, targetUrl, screenshotDir);
      results.push(result);
      console.log(`    ${result.status}: ${result.detail}`);
    } catch (err) {
      results.push({
        id: check.id,
        capability: check.capability,
        claim: check.claim,
        status: "fail",
        detail: `Check threw an error: ${err instanceof Error ? err.message : String(err)}`,
        screenshotPath: null,
        url: targetUrl,
      });
      console.log(`    ERROR: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  await browser.close();
  return results;
}

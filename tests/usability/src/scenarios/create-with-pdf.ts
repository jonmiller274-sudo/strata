import type { Page } from "playwright";
import type { Persona } from "../personas/index.js";
import type { ScreenshotCapture } from "../utils/screenshot.js";
import type { FindingCollector } from "../utils/findings.js";
import type { ScenarioConfig, ScenarioFn } from "./index.js";
import * as path from "node:path";
import * as fs from "node:fs";

export const config: ScenarioConfig = {
  id: "create-with-pdf",
  name: "Create with PDF Upload",
  persona: "rushed-exec",
  description:
    "A rushed exec has a PDF deck and wants to turn it into a shareable link fast. " +
    "Tests PDF upload, extraction, AI structuring, and timing the entire flow. " +
    "Known issue: PDF upload may fail on production.",
  priority: 1,
  estimatedMinutes: 4,
};

const FIXTURE_PDF = path.resolve(__dirname, "../../fixtures/sample-strategy.pdf");

export const run: ScenarioFn = async (
  page: Page,
  persona: Persona,
  screenshot: ScreenshotCapture,
  report: FindingCollector
) => {
  const flowStart = Date.now();

  // ── Step 1: Navigate to /create ──────────────────────────────────────────
  report.incrementSteps();
  try {
    await page.goto("/create", { waitUntil: "networkidle", timeout: 30_000 });
    await screenshot.capture(1, "create-page-loaded");
  } catch (err) {
    report.addFinding({
      severity: "critical",
      step: 1,
      step_description: "Navigate to /create",
      category: "bug",
      description: "Create page failed to load",
      expected: "Page loads within 30 seconds",
      actual: String(err),
      screenshot_path: "",
      url: "/create",
    });
    return;
  }

  // ── Step 2: Select "Platform Vision" template ────────────────────────────
  report.incrementSteps();
  try {
    const templateBtn = page.locator(
      'button:has(h3:has-text("Platform Vision"))'
    );
    await templateBtn.waitFor({ state: "visible", timeout: 10_000 });
    await templateBtn.click();
    await screenshot.capture(2, "template-selected-platform-vision");
  } catch (err) {
    const p = await screenshot.capture(2, "template-select-failed");
    report.addFinding({
      severity: "high",
      step: 2,
      step_description: "Select 'Platform Vision' template",
      category: "bug",
      description: "Could not find or click Platform Vision template",
      expected: "Template card visible and clickable",
      actual: String(err),
      screenshot_path: p,
      url: "/create",
    });
    return;
  }

  // ── Step 3: Upload test PDF fixture ──────────────────────────────────────
  report.incrementSteps();

  // Check if fixture PDF exists
  if (!fs.existsSync(FIXTURE_PDF)) {
    report.addFinding({
      severity: "medium",
      step: 3,
      step_description: "Upload test PDF fixture",
      category: "missing",
      description: "Test PDF fixture not found — skipping PDF upload steps",
      expected: `PDF fixture at ${FIXTURE_PDF}`,
      actual: "File does not exist",
      screenshot_path: "",
      url: "/create",
      recommendation: "Ensure fixtures/sample-strategy.pdf is committed to the repo",
    });
    // Fall back to pasting text content instead
    await fallbackToPasteContent(page, persona, screenshot, report, flowStart);
    return;
  }

  try {
    // The file input is hidden, so we set files on it directly
    const fileInput = page.locator('input[type="file"][accept*="pdf"]');
    await fileInput.waitFor({ state: "attached", timeout: 5_000 });
    await fileInput.setInputFiles(FIXTURE_PDF);
    await screenshot.capture(3, "pdf-upload-started");
  } catch (err) {
    const p = await screenshot.capture(3, "pdf-upload-failed");
    report.addFinding({
      severity: "high",
      step: 3,
      step_description: "Upload test PDF fixture",
      category: "bug",
      description: "Could not upload PDF — file input not found or upload failed",
      expected: "PDF file input accepts the fixture file",
      actual: String(err),
      screenshot_path: p,
      url: "/create",
    });
    // Fall back to pasting text
    await fallbackToPasteContent(page, persona, screenshot, report, flowStart);
    return;
  }

  // ── Step 4: Wait for extraction ──────────────────────────────────────────
  report.incrementSteps();
  try {
    // Wait for the loading spinner to appear and then disappear,
    // OR for the extracted text to appear in the textarea
    const extractStart = Date.now();

    // First, check if extraction spinner appears
    await page.waitForTimeout(1_000);
    await screenshot.capture(4, "pdf-extraction-loading");

    // Wait for textarea to have content (extraction complete) or for error
    await page.waitForFunction(
      () => {
        const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
        const error = document.querySelector('[class*="danger"]');
        return (textarea && textarea.value.length > 50) || error;
      },
      { timeout: 30_000 }
    );

    const extractElapsed = Date.now() - extractStart;

    // Check for extraction error
    const errorEl = page.locator('[class*="danger"]').first();
    if (await errorEl.isVisible().catch(() => false)) {
      const errorText = await errorEl.textContent();
      const p = await screenshot.capture(4, "pdf-extraction-error");
      report.addFinding({
        severity: "high",
        step: 4,
        step_description: "Wait for PDF text extraction",
        category: "bug",
        description: "PDF extraction failed with an error",
        expected: "Text extracted from PDF and placed in textarea",
        actual: `Error: ${errorText}`,
        screenshot_path: p,
        url: "/create",
        elapsed_ms: extractElapsed,
        recommendation: "Known production issue — PDF upload fails on sharestrata.com",
      });
      return;
    }

    await screenshot.capture(4, "pdf-extraction-complete");

    if (extractElapsed > 10_000) {
      report.addFinding({
        severity: "medium",
        step: 4,
        step_description: "Wait for PDF text extraction",
        category: "slow",
        description: `PDF extraction took ${Math.round(extractElapsed / 1000)}s`,
        expected: "Extraction within 10 seconds",
        actual: `${Math.round(extractElapsed / 1000)} seconds`,
        screenshot_path: "",
        url: "/create",
        elapsed_ms: extractElapsed,
      });
    }
  } catch (err) {
    const p = await screenshot.capture(4, "pdf-extraction-timeout");
    report.addFinding({
      severity: "high",
      step: 4,
      step_description: "Wait for PDF text extraction",
      category: "slow",
      description: "PDF extraction timed out after 30 seconds",
      expected: "Text extracted within 30 seconds",
      actual: String(err),
      screenshot_path: p,
      url: "/create",
      elapsed_ms: 30_000,
    });
    return;
  }

  // ── Step 5: Verify extracted text in textarea ────────────────────────────
  report.incrementSteps();
  try {
    const textarea = page.locator("textarea");
    const content = await textarea.inputValue();
    await screenshot.capture(5, "extracted-text-visible");

    if (content.length < 50) {
      const p = await screenshot.capture(5, "extracted-text-too-short");
      report.addFinding({
        severity: "medium",
        step: 5,
        step_description: "Extracted text appears in textarea?",
        category: "bug",
        description: `Extracted text is very short (${content.length} chars)`,
        expected: "Substantial text extracted from multi-page PDF",
        actual: `Only ${content.length} characters extracted`,
        screenshot_path: p,
        url: "/create",
      });
    }
  } catch (err) {
    // Non-critical at this point
  }

  // ── Step 6: Click "Structure with AI" ────────────────────────────────────
  report.incrementSteps();
  try {
    const structureBtn = page.locator('button:has-text("Structure with AI")');
    await structureBtn.waitFor({ state: "visible", timeout: 5_000 });

    const aiStart = Date.now();
    await structureBtn.click();
    await screenshot.capture(6, "structure-with-ai-clicked");

    // Wait for preview step
    await page.waitForSelector(
      'h1:has-text("Preview your artifact"), [class*="danger"]',
      { timeout: 60_000 }
    );
    const aiElapsed = Date.now() - aiStart;
    await screenshot.capture(6, "ai-structuring-complete");

    // Check for error
    const errorEl = page.locator('[class*="danger"]').first();
    if (await errorEl.isVisible().catch(() => false)) {
      const errorText = await errorEl.textContent();
      report.addFinding({
        severity: "high",
        step: 6,
        step_description: "Click 'Structure with AI'",
        category: "bug",
        description: "AI structuring returned an error",
        expected: "Structured artifact preview",
        actual: `Error: ${errorText}`,
        screenshot_path: "",
        url: "/create",
        elapsed_ms: aiElapsed,
      });
      return;
    }
  } catch (err) {
    const p = await screenshot.capture(6, "structure-ai-failed");
    report.addFinding({
      severity: "critical",
      step: 6,
      step_description: "Click 'Structure with AI'",
      category: "bug",
      description: "AI structuring failed or timed out",
      expected: "Preview step appears within 60 seconds",
      actual: String(err),
      screenshot_path: p,
      url: "/create",
    });
    return;
  }

  // ── Step 7: Verify preview renders ───────────────────────────────────────
  report.incrementSteps();
  try {
    const preview = page.locator('h1:has-text("Preview your artifact")');
    await preview.waitFor({ state: "visible", timeout: 5_000 });
    await screenshot.capture(7, "preview-from-pdf");
  } catch (err) {
    const p = await screenshot.capture(7, "preview-missing");
    report.addFinding({
      severity: "high",
      step: 7,
      step_description: "Preview renders correctly from PDF content?",
      category: "bug",
      description: "Preview step not visible after AI structuring",
      expected: "Preview with structured artifact",
      actual: String(err),
      screenshot_path: p,
      url: "/create",
    });
  }

  // ── Step 8: Report total elapsed time ────────────────────────────────────
  report.incrementSteps();
  const totalElapsed = Date.now() - flowStart;
  const totalMinutes = Math.round(totalElapsed / 60_000 * 10) / 10;

  if (totalMinutes > 5) {
    report.addFinding({
      severity: "medium",
      step: 8,
      step_description: "Time the entire flow",
      category: "slow",
      description: `Total PDF-to-preview flow took ${totalMinutes} minutes`,
      expected: "Under 5 minutes for rushed exec persona",
      actual: `${totalMinutes} minutes`,
      screenshot_path: "",
      url: "/create",
      elapsed_ms: totalElapsed,
      recommendation:
        "For the rushed-exec persona, any flow over 5 minutes risks abandonment",
    });
  }
};

/**
 * Fallback: if PDF fixture is missing, paste text content and continue the flow.
 */
async function fallbackToPasteContent(
  page: Page,
  _persona: Persona,
  screenshot: ScreenshotCapture,
  report: FindingCollector,
  flowStart: number
): Promise<void> {
  report.incrementSteps();
  try {
    const textarea = page.locator("textarea");
    await textarea.waitFor({ state: "visible", timeout: 5_000 });
    await textarea.fill(
      "Executive Summary: Our platform unifies data from 12 million analyzed sales calls into a single intelligence layer. We serve 847 enterprise customers today and plan to expand into EMEA with a London hub launch in Q3 2026. Target: $4.2M incremental ARR in 18 months."
    );
    await screenshot.capture(3, "fallback-text-pasted");
  } catch {
    return;
  }

  report.incrementSteps();
  try {
    const structureBtn = page.locator('button:has-text("Structure with AI")');
    await structureBtn.click();
    await page.waitForSelector(
      'h1:has-text("Preview your artifact"), [class*="danger"]',
      { timeout: 60_000 }
    );
    await screenshot.capture(4, "fallback-ai-complete");
  } catch {
    return;
  }

  const totalElapsed = Date.now() - flowStart;
  const totalMinutes = Math.round((totalElapsed / 60_000) * 10) / 10;
  if (totalMinutes > 5) {
    report.addFinding({
      severity: "medium",
      step: 5,
      step_description: "Time the entire flow (fallback — text paste)",
      category: "slow",
      description: `Total paste-to-preview flow took ${totalMinutes} minutes`,
      expected: "Under 5 minutes",
      actual: `${totalMinutes} minutes`,
      screenshot_path: "",
      url: "/create",
      elapsed_ms: totalElapsed,
    });
  }
}

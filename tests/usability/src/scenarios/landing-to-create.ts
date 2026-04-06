import type { Page } from "playwright";
import type { Persona } from "../personas/index.js";
import type { ScreenshotCapture } from "../utils/screenshot.js";
import type { FindingCollector } from "../utils/findings.js";
import type { ScenarioConfig, ScenarioFn } from "./index.js";

export const config: ScenarioConfig = {
  id: "landing-to-create",
  name: "Landing Page to Create Flow",
  persona: "first-time-user",
  description:
    "First-time user lands on the site and tries to create their first document. " +
    "Tests the core happy path: hero CTA -> template selection -> content input -> AI structuring -> publish gate.",
  priority: 1,
  estimatedMinutes: 3,
};

export const run: ScenarioFn = async (
  page: Page,
  persona: Persona,
  screenshot: ScreenshotCapture,
  report: FindingCollector
) => {
  const baseUrl = page.context().browser()?.version()
    ? process.env.TARGET_URL || "https://sharestrata.com"
    : process.env.TARGET_URL || "https://sharestrata.com";

  // ── Step 1: Navigate to landing page ─────────────────────────────────────
  report.incrementSteps();
  try {
    await page.goto("/", { waitUntil: "networkidle", timeout: 30_000 });
    await screenshot.capture(1, "landing-page-loaded");
  } catch (err) {
    report.addFinding({
      severity: "critical",
      step: 1,
      step_description: "Navigate to landing page",
      category: "bug",
      description: "Landing page failed to load",
      expected: "Page loads within 30 seconds",
      actual: String(err),
      screenshot_path: "",
      url: "/",
    });
    return; // Cannot continue if landing page doesn't load
  }

  // ── Step 2: Verify hero text is visible ──────────────────────────────────
  report.incrementSteps();
  try {
    const heroHeading = page.locator("h1");
    await heroHeading.waitFor({ state: "visible", timeout: 10_000 });
    const heroText = await heroHeading.textContent();

    if (!heroText || !heroText.includes("Strategy that speaks")) {
      const path = await screenshot.capture(2, "hero-text-unexpected");
      report.addFinding({
        severity: "medium",
        step: 2,
        step_description: "Read hero text — is the value prop clear?",
        category: "confusing",
        description: "Hero heading text does not match expected copy",
        expected: "Heading contains 'Strategy that speaks for itself'",
        actual: `Hero text: "${heroText}"`,
        screenshot_path: path,
        url: "/",
      });
    }
  } catch (err) {
    const path = await screenshot.capture(2, "hero-text-missing");
    report.addFinding({
      severity: "high",
      step: 2,
      step_description: "Read hero text — is the value prop clear?",
      category: "missing",
      description: "Hero heading not visible within 10 seconds",
      expected: "Hero h1 visible with value proposition",
      actual: String(err),
      screenshot_path: path,
      url: "/",
    });
  }

  // ── Step 3: Click "Start creating" hero CTA ─────────────────────────────
  report.incrementSteps();
  try {
    // The hero CTA is a Link with text "Start creating" inside the hero section
    const heroCta = page.locator(
      'section a:has-text("Start creating")'
    ).first();
    await heroCta.waitFor({ state: "visible", timeout: 10_000 });
    await heroCta.click();
    await page.waitForURL("**/create", { timeout: 15_000 });
    await screenshot.capture(3, "create-page-arrived");
  } catch (err) {
    const path = await screenshot.capture(3, "start-creating-cta-failed");
    report.addFinding({
      severity: "high",
      step: 3,
      step_description: "Click 'Start creating' CTA",
      category: "bug",
      description: "Failed to click hero CTA or navigate to /create",
      expected: "Click CTA -> navigate to /create",
      actual: String(err),
      screenshot_path: path,
      url: "/",
    });
    return;
  }

  // ── Step 4: Verify template selection is visible ─────────────────────────
  report.incrementSteps();
  try {
    const heading = page.locator('h1:has-text("Choose a template")');
    await heading.waitFor({ state: "visible", timeout: 10_000 });

    // Check that template buttons are visible (4 templates)
    const templateButtons = page.locator(
      'button:has(h3)'
    );
    const count = await templateButtons.count();
    if (count < 4) {
      const path = await screenshot.capture(4, "templates-incomplete");
      report.addFinding({
        severity: "medium",
        step: 4,
        step_description: "Template options visible?",
        category: "missing",
        description: `Expected 4 template options, found ${count}`,
        expected: "4 template cards (Platform Vision, Customer Journey, GTM Strategy, Product Roadmap)",
        actual: `${count} template cards visible`,
        screenshot_path: path,
        url: "/create",
      });
    }
  } catch (err) {
    const path = await screenshot.capture(4, "template-step-missing");
    report.addFinding({
      severity: "high",
      step: 4,
      step_description: "Template options visible?",
      category: "missing",
      description: "Template selection step not visible",
      expected: "'Choose a template' heading and 4 template cards",
      actual: String(err),
      screenshot_path: path,
      url: "/create",
    });
    return;
  }

  // ── Step 5: Select "Go-to-Market Strategy" template ──────────────────────
  report.incrementSteps();
  try {
    const gtmButton = page.locator(
      'button:has(h3:has-text("Go-to-Market Strategy"))'
    );
    await gtmButton.waitFor({ state: "visible", timeout: 5_000 });
    await gtmButton.click();
    await screenshot.capture(5, "template-selected-gtm");
  } catch (err) {
    const path = await screenshot.capture(5, "template-select-failed");
    report.addFinding({
      severity: "high",
      step: 5,
      step_description: "Select 'Go-to-Market Strategy' template",
      category: "bug",
      description: "Could not find or click the GTM Strategy template button",
      expected: "Click template card -> advance to content step",
      actual: String(err),
      screenshot_path: path,
      url: "/create",
    });
    return;
  }

  // ── Step 6: Verify content input step loaded ─────────────────────────────
  report.incrementSteps();
  try {
    const heading = page.locator('h1:has-text("Paste your content")');
    await heading.waitFor({ state: "visible", timeout: 10_000 });

    // Verify textarea is present
    const textarea = page.locator("textarea");
    await textarea.waitFor({ state: "visible", timeout: 5_000 });
  } catch (err) {
    const path = await screenshot.capture(6, "content-step-missing");
    report.addFinding({
      severity: "high",
      step: 6,
      step_description: "Content input step loaded with correct label?",
      category: "missing",
      description: "Content input step did not load after template selection",
      expected: "'Paste your content' heading and textarea visible",
      actual: String(err),
      screenshot_path: path,
      url: "/create",
    });
    return;
  }

  // ── Step 7: Type sample content ──────────────────────────────────────────
  report.incrementSteps();
  const sampleContent = `Our go-to-market strategy focuses on three core segments: enterprise SaaS companies with 200+ employees, mid-market fintech startups, and product-led growth companies in the Nordics. We plan to open a London hub in Q3, hire 8 sales reps across UK and DACH markets, and target $4.2M in incremental ARR within 18 months. Our competitive advantage is a 3-year data moat of 12 million analyzed calls. Key risks include longer European sales cycles, data residency requirements, and emerging local competitors.`;

  try {
    const textarea = page.locator("textarea");
    await textarea.fill(sampleContent);
    await screenshot.capture(7, "content-typed");
  } catch (err) {
    const path = await screenshot.capture(7, "content-type-failed");
    report.addFinding({
      severity: "medium",
      step: 7,
      step_description: "Type 100 words of sample content",
      category: "bug",
      description: "Could not type content into textarea",
      expected: "Content typed into textarea",
      actual: String(err),
      screenshot_path: path,
      url: "/create",
    });
    return;
  }

  // ── Step 8: Click "Structure with AI" ────────────────────────────────────
  report.incrementSteps();
  try {
    const structureBtn = page.locator(
      'button:has-text("Structure with AI")'
    );
    await structureBtn.waitFor({ state: "visible", timeout: 5_000 });

    // Verify button is enabled (has content)
    const isDisabled = await structureBtn.isDisabled();
    if (isDisabled) {
      const path = await screenshot.capture(8, "structure-button-disabled");
      report.addFinding({
        severity: "high",
        step: 8,
        step_description: "Click 'Structure with AI'",
        category: "bug",
        description: "'Structure with AI' button is disabled even though content is present",
        expected: "Button enabled after content is typed",
        actual: "Button is disabled",
        screenshot_path: path,
        url: "/create",
      });
      return;
    }

    const startTime = Date.now();
    await structureBtn.click();
    await screenshot.capture(8, "structure-ai-clicked");

    // ── Step 9: Wait for AI response (up to 60s) ────────────────────────────
    report.incrementSteps();
    try {
      // Wait for either the preview step heading or an error message
      await page.waitForSelector(
        'h1:has-text("Preview your artifact"), .text-danger, [class*="danger"]',
        { timeout: 60_000 }
      );
      const elapsed = Date.now() - startTime;
      await screenshot.capture(9, "ai-structuring-complete");

      // Check for error
      const errorEl = page.locator('[class*="danger"]').first();
      if (await errorEl.isVisible().catch(() => false)) {
        const errorText = await errorEl.textContent();
        const path = await screenshot.capture(9, "ai-structuring-error");
        report.addFinding({
          severity: "high",
          step: 9,
          step_description: "Wait for AI response",
          category: "bug",
          description: "AI structuring returned an error",
          expected: "Structured artifact preview",
          actual: `Error: ${errorText}`,
          screenshot_path: path,
          url: "/create",
          elapsed_ms: elapsed,
        });
        return;
      }

      // Report timing if slow
      if (elapsed > 10_000) {
        report.addFinding({
          severity: "medium",
          step: 9,
          step_description: "Wait for AI response",
          category: "slow",
          description: `AI structuring took ${Math.round(elapsed / 1000)}s`,
          expected: "AI response within 10 seconds",
          actual: `${Math.round(elapsed / 1000)} seconds`,
          screenshot_path: "",
          url: "/create",
          elapsed_ms: elapsed,
          recommendation: "Consider showing progress indicators or skeleton loading",
        });
      }
    } catch (err) {
      const path = await screenshot.capture(9, "ai-structuring-timeout");
      report.addFinding({
        severity: "critical",
        step: 9,
        step_description: "Wait for AI response",
        category: "slow",
        description: "AI structuring timed out after 60 seconds",
        expected: "AI response within 60 seconds",
        actual: String(err),
        screenshot_path: path,
        url: "/create",
        elapsed_ms: 60_000,
      });
      return;
    }
  } catch (err) {
    const path = await screenshot.capture(8, "structure-button-failed");
    report.addFinding({
      severity: "high",
      step: 8,
      step_description: "Click 'Structure with AI'",
      category: "bug",
      description: "Could not find or click 'Structure with AI' button",
      expected: "Button visible and clickable",
      actual: String(err),
      screenshot_path: path,
      url: "/create",
    });
    return;
  }

  // ── Step 10: Verify preview step ─────────────────────────────────────────
  report.incrementSteps();
  try {
    const previewHeading = page.locator(
      'h1:has-text("Preview your artifact")'
    );
    await previewHeading.waitFor({ state: "visible", timeout: 10_000 });

    // Check that the artifact preview container exists
    const previewContainer = page.locator(
      '.max-h-\\[70vh\\], [class*="overflow-y-auto"]'
    ).first();
    const isVisible = await previewContainer.isVisible().catch(() => false);
    if (!isVisible) {
      const path = await screenshot.capture(10, "preview-container-missing");
      report.addFinding({
        severity: "medium",
        step: 10,
        step_description: "Preview step loaded with structured artifact?",
        category: "missing",
        description: "Preview heading visible but artifact preview container not found",
        expected: "Scrollable artifact preview with structured content",
        actual: "Preview container not visible",
        screenshot_path: path,
        url: "/create",
      });
    }
  } catch (err) {
    const path = await screenshot.capture(10, "preview-step-missing");
    report.addFinding({
      severity: "high",
      step: 10,
      step_description: "Preview step loaded with structured artifact?",
      category: "missing",
      description: "Preview step not visible after AI structuring",
      expected: "'Preview your artifact' heading visible",
      actual: String(err),
      screenshot_path: path,
      url: "/create",
    });
    return;
  }

  // ── Step 11: Click "Publish & get link" ──────────────────────────────────
  report.incrementSteps();
  try {
    const publishBtn = page.locator(
      'button:has-text("Publish & get link")'
    );
    await publishBtn.waitFor({ state: "visible", timeout: 5_000 });
    await publishBtn.click();
    await screenshot.capture(11, "publish-clicked");
  } catch (err) {
    const path = await screenshot.capture(11, "publish-button-missing");
    report.addFinding({
      severity: "high",
      step: 11,
      step_description: "Click 'Publish & get link'",
      category: "missing",
      description: "Publish button not found or not clickable",
      expected: "'Publish & get link' button visible and clickable",
      actual: String(err),
      screenshot_path: path,
      url: "/create",
    });
    return;
  }

  // ── Step 12: Auth modal appears (user not signed in) ─────────────────────
  report.incrementSteps();
  try {
    // The AuthModal should appear since we're not signed in
    // Wait for a dialog/modal to be visible
    await page.waitForTimeout(2_000); // Give modal animation time
    await screenshot.capture(12, "auth-modal-check");

    // Look for the auth modal — it's typically a dialog or overlay with sign-in content
    const modal = page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]').first();
    const modalVisible = await modal.isVisible().catch(() => false);

    if (!modalVisible) {
      // Also check for any overlay or backdrop that might indicate a modal
      const overlay = page.locator('[class*="backdrop"], [class*="overlay"]').first();
      const overlayVisible = await overlay.isVisible().catch(() => false);

      if (!overlayVisible) {
        const path = await screenshot.capture(12, "auth-modal-missing");
        report.addFinding({
          severity: "high",
          step: 12,
          step_description: "Auth modal appears (not signed in)?",
          category: "missing",
          description: "No auth modal appeared after clicking Publish without being signed in",
          expected: "Auth modal prompting sign-in before publishing",
          actual: "No modal or overlay detected",
          screenshot_path: path,
          url: "/create",
          recommendation: "Verify AuthModal component renders correctly when user is not authenticated",
        });
      }
    }
  } catch (err) {
    const path = await screenshot.capture(12, "auth-modal-error");
    report.addFinding({
      severity: "medium",
      step: 12,
      step_description: "Auth modal appears (not signed in)?",
      category: "bug",
      description: "Error checking for auth modal",
      expected: "Auth modal visible",
      actual: String(err),
      screenshot_path: path,
      url: "/create",
    });
  }
};

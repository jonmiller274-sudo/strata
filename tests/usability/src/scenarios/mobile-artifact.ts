import type { Page } from "playwright";
import type { Persona } from "../personas/index.js";
import type { ScreenshotCapture } from "../utils/screenshot.js";
import type { FindingCollector } from "../utils/findings.js";
import type { ScenarioConfig, ScenarioFn } from "./index.js";

export const config: ScenarioConfig = {
  id: "mobile-artifact",
  name: "Mobile Artifact Viewing",
  persona: "mobile-user",
  description:
    "Someone received a Strata link and is viewing it on their phone. " +
    "Tests that the demo artifact (all 8 section types) is usable on mobile.",
  priority: 1,
  estimatedMinutes: 2,
};

export const run: ScenarioFn = async (
  page: Page,
  persona: Persona,
  screenshot: ScreenshotCapture,
  report: FindingCollector
) => {
  // ── Step 1: Navigate directly to /demo on mobile ─────────────────────────
  report.incrementSteps();
  try {
    await page.goto("/demo", { waitUntil: "networkidle", timeout: 30_000 });
    await screenshot.capture(1, "mobile-artifact-loaded");
  } catch (err) {
    report.addFinding({
      severity: "critical",
      step: 1,
      step_description: "Navigate to /demo on mobile",
      category: "bug",
      description: "Demo page failed to load on mobile",
      expected: "Page loads within 30 seconds",
      actual: String(err),
      screenshot_path: "",
      url: "/demo",
    });
    return;
  }

  // ── Step 2: Check sidebar navigation behavior on mobile ──────────────────
  report.incrementSteps();
  try {
    await page.waitForTimeout(2_000); // Let page fully render

    // On mobile, sidebar should either collapse or be hidden
    // Check if sidebar nav exists and how it behaves
    const sidebarNav = page.locator('nav, [class*="sidebar"], [class*="Sidebar"]').first();
    const sidebarVisible = await sidebarNav.isVisible().catch(() => false);

    if (sidebarVisible) {
      const box = await sidebarNav.boundingBox();
      if (box && box.width > persona.viewport.width * 0.5) {
        const p = await screenshot.capture(2, "mobile-sidebar-too-wide");
        report.addFinding({
          severity: "high",
          step: 2,
          step_description: "Sidebar navigation works or collapses on mobile?",
          category: "broken-layout",
          description: `Sidebar takes ${Math.round(box.width)}px — more than half the mobile viewport`,
          expected: "Sidebar collapses or hides on mobile",
          actual: `Sidebar is ${Math.round(box.width)}px wide on ${persona.viewport.width}px viewport`,
          screenshot_path: p,
          url: "/demo",
          recommendation: "Hide sidebar and use a hamburger menu or bottom nav on mobile",
        });
      }
    }

    await screenshot.capture(2, "mobile-sidebar-check");
  } catch {
    // Non-critical
  }

  // ── Step 3-10: Scroll through each section type ──────────────────────────
  const sectionChecks = [
    { id: "the-case-for-emea", name: "Rich Text", step: 3 },
    { id: "market-sizing", name: "Data Viz (Funnel)", step: 4 },
    { id: "first-90-days", name: "Guided Journey", step: 5 },
    { id: "target-segments", name: "Expandable Cards", step: 6 },
    { id: "twelve-month-rollout", name: "Timeline", step: 7 },
    { id: "competitive-landscape", name: "Tier Table", step: 8 },
    { id: "gtm-architecture", name: "Hub Mockup", step: 9 },
    { id: "revenue-model", name: "Metric Dashboard", step: 10 },
  ];

  for (const section of sectionChecks) {
    report.incrementSteps();

    try {
      // Try to scroll to the section
      const el = page.locator(`[id="${section.id}"], [data-section-id="${section.id}"]`).first();
      const exists = (await el.count()) > 0;

      if (exists) {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
      } else {
        // Fallback: scroll down
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(500);
      }

      // Check for horizontal overflow at this section
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      const p = await screenshot.capture(section.step, `mobile-${section.id}`);

      if (hasOverflow) {
        report.addFinding({
          severity: "high",
          step: section.step,
          step_description: `${section.name} section on mobile`,
          category: "broken-layout",
          description: `Horizontal overflow detected at ${section.name} section on mobile`,
          expected: "Section content fits within mobile viewport",
          actual: "Horizontal scrolling detected",
          screenshot_path: p,
          url: "/demo",
          recommendation: `Check ${section.name} component for fixed widths or min-width values`,
        });
      }
    } catch {
      // Continue to next section
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(300);
    }
  }

  // ── Step 11: Test expandable cards on mobile ─────────────────────────────
  const cardStep = 11;
  report.incrementSteps();
  try {
    // Scroll back to expandable cards section
    const cardsEl = page.locator('[id="target-segments"], [data-section-id="target-segments"]').first();
    if ((await cardsEl.count()) > 0) {
      await cardsEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Try to tap the first card
      const firstCard = page.locator('[id="target-segments"] [role="button"], [data-section-id="target-segments"] [role="button"]').first();
      if ((await firstCard.count()) > 0) {
        await firstCard.tap();
        await page.waitForTimeout(500);
        await screenshot.capture(cardStep, "mobile-card-tapped");
      } else {
        // Try generic button/clickable inside the section
        const clickable = page.locator('[id="target-segments"] button').first();
        if ((await clickable.count()) > 0) {
          await clickable.tap();
          await page.waitForTimeout(500);
          await screenshot.capture(cardStep, "mobile-card-expanded");
        }
      }
    }
  } catch {
    // Non-critical
  }

  // ── Step 12: Test guided journey on mobile ───────────────────────────────
  const journeyStep = 12;
  report.incrementSteps();
  try {
    const journeyEl = page.locator('[id="first-90-days"], [data-section-id="first-90-days"]').first();
    if ((await journeyEl.count()) > 0) {
      await journeyEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1_500); // Let autoplay animate
      await screenshot.capture(journeyStep, "mobile-guided-journey");

      // Check if the journey controls are tappable
      const controls = page.locator('[id="first-90-days"] button').first();
      if ((await controls.count()) > 0) {
        const box = await controls.boundingBox();
        if (box && (box.height < 44 || box.width < 44)) {
          const p = await screenshot.capture(journeyStep, "mobile-journey-small-controls");
          report.addFinding({
            severity: "medium",
            step: journeyStep,
            step_description: "Guided journey usable on small screen?",
            category: "friction",
            description: `Journey control button is ${Math.round(box.width)}x${Math.round(box.height)}px — below 44px minimum`,
            expected: "Touch target at least 44x44px",
            actual: `${Math.round(box.width)}x${Math.round(box.height)}px`,
            screenshot_path: p,
            url: "/demo",
          });
        }
      }
    }
  } catch {
    // Non-critical
  }

  // ── Step 13: Check tier table for horizontal cutoff ──────────────────────
  const tierStep = 13;
  report.incrementSteps();
  try {
    const tierEl = page.locator('[id="competitive-landscape"], [data-section-id="competitive-landscape"]').first();
    if ((await tierEl.count()) > 0) {
      await tierEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await screenshot.capture(tierStep, "mobile-tier-table");

      // Check if the table/comparison overflows
      const tierBox = await tierEl.boundingBox();
      if (tierBox && tierBox.width > persona.viewport.width) {
        const p = await screenshot.capture(tierStep, "mobile-tier-table-overflow");
        report.addFinding({
          severity: "high",
          step: tierStep,
          step_description: "Tier table not cut off horizontally?",
          category: "broken-layout",
          description: "Tier table exceeds mobile viewport width",
          expected: "Table content fits or scrolls within viewport",
          actual: `Table is ${Math.round(tierBox.width)}px wide on ${persona.viewport.width}px viewport`,
          screenshot_path: p,
          url: "/demo",
          recommendation: "Consider stacking columns vertically or adding horizontal scroll on mobile",
        });
      }
    }
  } catch {
    // Non-critical
  }
};

import type { Page } from "playwright";
import type { Persona } from "../personas/index.js";
import type { ScreenshotCapture } from "../utils/screenshot.js";
import type { FindingCollector } from "../utils/findings.js";
import type { ScenarioConfig, ScenarioFn } from "./index.js";

export const config: ScenarioConfig = {
  id: "demo-exploration",
  name: "Demo Page Exploration",
  persona: "first-time-user",
  description:
    "First-time user wants to see what a Strata doc looks like before committing. " +
    "Tests the demo artifact — all 8 section types, navigation, interactivity.",
  priority: 1,
  estimatedMinutes: 3,
};

/**
 * The demo page at /demo renders an ArtifactViewer with a hardcoded DEMO_ARTIFACT.
 * It has 8 sections: rich-text, data-viz (funnel), guided-journey, expandable-cards,
 * timeline, tier-table, hub-mockup, metric-dashboard.
 * The artifact uses sidebar navigation (SidebarNav component).
 */
export const run: ScenarioFn = async (
  page: Page,
  persona: Persona,
  screenshot: ScreenshotCapture,
  report: FindingCollector
) => {
  // ── Step 1: Navigate to landing page ─────────────────────────────────────
  report.incrementSteps();
  try {
    await page.goto("/", { waitUntil: "networkidle", timeout: 30_000 });
    await screenshot.capture(1, "landing-page");
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
    return;
  }

  // ── Step 2: Click "See it in action" link ────────────────────────────────
  report.incrementSteps();
  try {
    // In the hero section, there's a "See it in action" link to /demo
    const demoLink = page.locator('a:has-text("See it in action")').first();
    await demoLink.waitFor({ state: "visible", timeout: 10_000 });
    await demoLink.click();
    await page.waitForURL("**/demo", { timeout: 15_000 });
    await screenshot.capture(2, "demo-page-arrived");
  } catch (err) {
    const path = await screenshot.capture(2, "see-it-in-action-failed");
    report.addFinding({
      severity: "high",
      step: 2,
      step_description: "Click 'See it in action' link",
      category: "bug",
      description: "Could not find or click 'See it in action' link, or navigation to /demo failed",
      expected: "Click link -> navigate to /demo",
      actual: String(err),
      screenshot_path: path,
      url: "/",
    });
    return;
  }

  // ── Step 3: Verify demo renders correctly ────────────────────────────────
  report.incrementSteps();
  try {
    // The demo page renders an ArtifactViewer. Check for the artifact title.
    // The demo artifact title is "EMEA Go-to-Market Strategy — Q3 2026"
    await page.waitForTimeout(2_000); // Let animations settle
    const titleEl = page.locator('text=EMEA Go-to-Market Strategy').first();
    const titleVisible = await titleEl.isVisible().catch(() => false);

    if (!titleVisible) {
      const path = await screenshot.capture(3, "demo-title-missing");
      report.addFinding({
        severity: "high",
        step: 3,
        step_description: "Demo renders correctly?",
        category: "bug",
        description: "Demo artifact title not visible",
        expected: "'EMEA Go-to-Market Strategy' visible on page",
        actual: "Title not found",
        screenshot_path: path,
        url: "/demo",
      });
    } else {
      await screenshot.capture(3, "demo-rendered");
    }
  } catch (err) {
    const path = await screenshot.capture(3, "demo-render-error");
    report.addFinding({
      severity: "high",
      step: 3,
      step_description: "Demo renders correctly?",
      category: "bug",
      description: "Error checking demo render",
      expected: "Demo artifact renders with title and sections",
      actual: String(err),
      screenshot_path: path,
      url: "/demo",
    });
  }

  // ── Step 4: Scroll through all 8 sections, screenshot each ───────────────
  // Section IDs from the demo artifact:
  const sectionIds = [
    { id: "the-case-for-emea", name: "Rich Text (Executive Summary)" },
    { id: "market-sizing", name: "Data Viz (Funnel)" },
    { id: "first-90-days", name: "Guided Journey" },
    { id: "target-segments", name: "Expandable Cards" },
    { id: "twelve-month-rollout", name: "Timeline" },
    { id: "competitive-landscape", name: "Tier Table" },
    { id: "gtm-architecture", name: "Hub Mockup" },
    { id: "revenue-model", name: "Metric Dashboard" },
  ];

  for (let i = 0; i < sectionIds.length; i++) {
    const section = sectionIds[i];
    const stepNum = 4 + i;
    report.incrementSteps();

    try {
      // Try to scroll to the section by its ID
      const sectionEl = page.locator(`[id="${section.id}"], [data-section-id="${section.id}"]`).first();
      const exists = await sectionEl.count();

      if (exists > 0) {
        await sectionEl.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500); // Let animations play
        await screenshot.capture(stepNum, `section-${section.id}`);
      } else {
        // Section element not found by ID — try scrolling down progressively
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(500);
        const path = await screenshot.capture(stepNum, `section-${section.id}-scrolled`);
        report.addFinding({
          severity: "low",
          step: stepNum,
          step_description: `Scroll to section: ${section.name}`,
          category: "missing",
          description: `Section element with id="${section.id}" not found in DOM`,
          expected: `Section "${section.name}" rendered with id attribute`,
          actual: "Section ID not found — scrolled to approximate position instead",
          screenshot_path: path,
          url: "/demo",
          recommendation: "Ensure section IDs are set on rendered section containers for navigation",
        });
      }
    } catch (err) {
      await screenshot.capture(stepNum, `section-${section.id}-error`);
    }
  }

  // ── Step 12: Check expandable cards interactivity ────────────────────────
  const expandStep = 12;
  report.incrementSteps();
  try {
    // Scroll to target-segments (expandable cards)
    const cardsSection = page.locator('[id="target-segments"], [data-section-id="target-segments"]').first();
    if ((await cardsSection.count()) > 0) {
      await cardsSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Try to click the first expandable card
      const firstCard = page.locator('[id="target-segments"] button, [data-section-id="target-segments"] button').first();
      if ((await firstCard.count()) > 0) {
        await firstCard.click();
        await page.waitForTimeout(500);
        await screenshot.capture(expandStep, "expandable-card-opened");
      }
    }
  } catch {
    // Non-critical — card interaction is a nice-to-test
  }

  // ── Step 13: Check guided journey interactivity ──────────────────────────
  const journeyStep = 13;
  report.incrementSteps();
  try {
    const journeySection = page.locator('[id="first-90-days"], [data-section-id="first-90-days"]').first();
    if ((await journeySection.count()) > 0) {
      await journeySection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1_000); // Let autoplay animate
      await screenshot.capture(journeyStep, "guided-journey-interaction");
    }
  } catch {
    // Non-critical
  }

  // ── Step 14: Check timeline interactivity ────────────────────────────────
  const timelineStep = 14;
  report.incrementSteps();
  try {
    const timelineSection = page.locator('[id="twelve-month-rollout"], [data-section-id="twelve-month-rollout"]').first();
    if ((await timelineSection.count()) > 0) {
      await timelineSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await screenshot.capture(timelineStep, "timeline-interaction");
    }
  } catch {
    // Non-critical
  }

  // ── Step 15: Check "Made with Strata" attribution ────────────────────────
  const attrStep = 15;
  report.incrementSteps();
  try {
    // Scroll to bottom to find the Strata footer/attribution
    await page.keyboard.press("End");
    await page.waitForTimeout(1_000);

    const attribution = page.locator('text=Made with Strata').first();
    const attrVisible = await attribution.isVisible().catch(() => false);

    if (!attrVisible) {
      // Also check for "Strata" branding in footer area
      const strataFooter = page.locator('text=Create your own').first();
      const footerVisible = await strataFooter.isVisible().catch(() => false);

      if (!footerVisible) {
        const path = await screenshot.capture(attrStep, "attribution-missing");
        report.addFinding({
          severity: "low",
          step: attrStep,
          step_description: "'Made with Strata' attribution visible?",
          category: "missing",
          description: "No 'Made with Strata' attribution or 'Create your own' CTA found",
          expected: "Attribution link visible at bottom of artifact",
          actual: "Neither 'Made with Strata' nor 'Create your own' text found",
          screenshot_path: path,
          url: "/demo",
        });
      }
    } else {
      await screenshot.capture(attrStep, "attribution-visible");
    }
  } catch {
    // Non-critical
  }

  // ── Step 16: Check sidebar navigation works ──────────────────────────────
  const navStep = 16;
  report.incrementSteps();
  try {
    // The SidebarNav renders nav items for each section
    // Try clicking a sidebar nav item to jump to a section
    const navItem = page.locator('nav a, nav button').first();
    if ((await navItem.count()) > 0) {
      await navItem.click();
      await page.waitForTimeout(500);
      await screenshot.capture(navStep, "sidebar-nav-clicked");
    } else {
      const path = await screenshot.capture(navStep, "sidebar-nav-missing");
      report.addFinding({
        severity: "medium",
        step: navStep,
        step_description: "Navigation works?",
        category: "missing",
        description: "No sidebar navigation elements found",
        expected: "Sidebar with clickable section links",
        actual: "No nav links or buttons found",
        screenshot_path: path,
        url: "/demo",
      });
    }
  } catch {
    // Non-critical
  }
};

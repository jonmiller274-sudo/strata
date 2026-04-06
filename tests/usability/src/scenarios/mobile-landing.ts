import type { Page } from "playwright";
import type { Persona } from "../personas/index.js";
import type { ScreenshotCapture } from "../utils/screenshot.js";
import type { FindingCollector } from "../utils/findings.js";
import type { ScenarioConfig, ScenarioFn } from "./index.js";

export const config: ScenarioConfig = {
  id: "mobile-landing",
  name: "Mobile Landing Page",
  persona: "mobile-user",
  description:
    "Someone on their phone browsing the site. Tests that the landing page " +
    "is usable on mobile: readable text, tappable CTAs, proper layout.",
  priority: 1,
  estimatedMinutes: 2,
};

/** Minimum touch target size per Apple HIG */
const MIN_TOUCH_TARGET = 44;

export const run: ScenarioFn = async (
  page: Page,
  persona: Persona,
  screenshot: ScreenshotCapture,
  report: FindingCollector
) => {
  // Viewport is already set to 390x844 by the runner via the persona config.

  // ── Step 1: Navigate to landing page ─────────────────────────────────────
  report.incrementSteps();
  try {
    await page.goto("/", { waitUntil: "networkidle", timeout: 30_000 });
    await screenshot.capture(1, "mobile-landing-loaded");
  } catch (err) {
    report.addFinding({
      severity: "critical",
      step: 1,
      step_description: "Navigate to / on mobile viewport",
      category: "bug",
      description: "Landing page failed to load on mobile",
      expected: "Page loads within 30 seconds",
      actual: String(err),
      screenshot_path: "",
      url: "/",
    });
    return;
  }

  // ── Step 2: Verify hero text is readable, not cut off ────────────────────
  report.incrementSteps();
  try {
    const heroH1 = page.locator("h1").first();
    await heroH1.waitFor({ state: "visible", timeout: 10_000 });

    const box = await heroH1.boundingBox();
    if (box) {
      // Check if text overflows viewport width (390px)
      if (box.x + box.width > persona.viewport.width + 10) {
        const p = await screenshot.capture(2, "hero-text-overflow");
        report.addFinding({
          severity: "high",
          step: 2,
          step_description: "Hero text readable, not cut off?",
          category: "broken-layout",
          description: "Hero heading extends beyond mobile viewport width",
          expected: `Content fits within ${persona.viewport.width}px viewport`,
          actual: `Heading extends to ${Math.round(box.x + box.width)}px`,
          screenshot_path: p,
          url: "/",
        });
      }
    }

    await screenshot.capture(2, "mobile-hero-text");
  } catch (err) {
    const p = await screenshot.capture(2, "mobile-hero-error");
    report.addFinding({
      severity: "high",
      step: 2,
      step_description: "Hero text readable, not cut off?",
      category: "bug",
      description: "Could not verify hero text on mobile",
      expected: "Hero h1 visible and readable",
      actual: String(err),
      screenshot_path: p,
      url: "/",
    });
  }

  // ── Step 3: Check navigation usability (hamburger menu?) ─────────────────
  report.incrementSteps();
  try {
    // On mobile (sm: breakpoint), the nav links "See demo" and "Pricing" have
    // class "hidden sm:inline-flex" — they should be hidden on 390px viewport.
    // Check if any nav links are awkwardly visible
    const navLinks = page.locator('nav a, nav button');
    const navCount = await navLinks.count();

    // The "Start creating" CTA should still be visible
    const createLink = page.locator('nav a:has-text("Start creating")');
    const createVisible = await createLink.isVisible().catch(() => false);

    if (!createVisible) {
      const p = await screenshot.capture(3, "mobile-nav-no-cta");
      report.addFinding({
        severity: "high",
        step: 3,
        step_description: "Navigation usable on mobile?",
        category: "missing",
        description: "'Start creating' CTA not visible in mobile nav",
        expected: "Primary CTA visible in mobile navigation",
        actual: "CTA not visible",
        screenshot_path: p,
        url: "/",
        recommendation: "Ensure the primary CTA remains visible on mobile — it's the core conversion action",
      });
    }

    await screenshot.capture(3, "mobile-navigation");
  } catch (err) {
    const p = await screenshot.capture(3, "mobile-nav-error");
    report.addFinding({
      severity: "medium",
      step: 3,
      step_description: "Navigation usable on mobile?",
      category: "bug",
      description: "Error checking mobile navigation",
      expected: "Navigation elements render correctly on mobile",
      actual: String(err),
      screenshot_path: p,
      url: "/",
    });
  }

  // ── Step 4: Scroll through landing page sections ─────────────────────────
  const sections = [
    { name: "Problem Statement", scrollAmount: 800 },
    { name: "How It Works", scrollAmount: 800 },
    { name: "Section Types", scrollAmount: 800 },
    { name: "Editor Features", scrollAmount: 800 },
    { name: "Pricing", scrollAmount: 800 },
    { name: "CTA", scrollAmount: 600 },
  ];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const stepNum = 4 + i;
    report.incrementSteps();

    try {
      await page.mouse.wheel(0, section.scrollAmount);
      await page.waitForTimeout(500);

      // Check for horizontal overflow (common mobile issue)
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasOverflow) {
        const p = await screenshot.capture(stepNum, `mobile-section-${i}-overflow`);
        report.addFinding({
          severity: "high",
          step: stepNum,
          step_description: `Scroll to ${section.name} section`,
          category: "broken-layout",
          description: `Horizontal overflow detected at ${section.name} section`,
          expected: "No horizontal scrolling on mobile",
          actual: "Page is wider than viewport — horizontal overflow detected",
          screenshot_path: p,
          url: "/",
          recommendation: "Check for elements with fixed widths that exceed mobile viewport",
        });
      }

      await screenshot.capture(stepNum, `mobile-section-${section.name.toLowerCase().replace(/\s+/g, "-")}`);
    } catch {
      // Continue scrolling through other sections
    }
  }

  // ── Step 10: Check CTA touch targets ─────────────────────────────────────
  const touchStep = 10;
  report.incrementSteps();
  try {
    // Scroll back to top to check hero CTAs
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Check the "Start creating" hero CTA size
    const heroCta = page.locator('section a:has-text("Start creating")').first();
    if ((await heroCta.count()) > 0) {
      const box = await heroCta.boundingBox();
      if (box && (box.height < MIN_TOUCH_TARGET || box.width < MIN_TOUCH_TARGET)) {
        const p = await screenshot.capture(touchStep, "cta-touch-target-small");
        report.addFinding({
          severity: "medium",
          step: touchStep,
          step_description: "CTAs tappable (min 44px touch target)?",
          category: "friction",
          description: `Hero CTA touch target is ${Math.round(box.width)}x${Math.round(box.height)}px`,
          expected: `Minimum ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px touch target`,
          actual: `${Math.round(box.width)}x${Math.round(box.height)}px`,
          screenshot_path: p,
          url: "/",
          recommendation: "Increase button padding on mobile to meet 44px minimum",
        });
      }
    }
  } catch {
    // Non-critical
  }

  // ── Step 11: Click "See it in action" -> /demo ───────────────────────────
  const demoStep = 11;
  report.incrementSteps();
  try {
    // "See it in action" is in the hero section
    const demoLink = page.locator('a:has-text("See it in action")').first();
    const demoVisible = await demoLink.isVisible().catch(() => false);

    if (demoVisible) {
      await demoLink.click();
      await page.waitForURL("**/demo", { timeout: 15_000 });
      await screenshot.capture(demoStep, "mobile-demo-arrived");
    } else {
      // The "See it in action" link might not be in the hero on mobile
      // Check footer or other locations
      const footerDemo = page.locator('footer a:has-text("Demo")').first();
      if (await footerDemo.isVisible().catch(() => false)) {
        await footerDemo.click();
        await page.waitForURL("**/demo", { timeout: 15_000 });
        await screenshot.capture(demoStep, "mobile-demo-via-footer");
      } else {
        const p = await screenshot.capture(demoStep, "mobile-demo-link-missing");
        report.addFinding({
          severity: "medium",
          step: demoStep,
          step_description: "Click 'See it in action' -> /demo",
          category: "missing",
          description: "No visible path to demo page on mobile",
          expected: "'See it in action' or 'Demo' link visible and tappable",
          actual: "No demo link found on mobile viewport",
          screenshot_path: p,
          url: "/",
        });
        return;
      }
    }
  } catch (err) {
    const p = await screenshot.capture(demoStep, "mobile-demo-nav-failed");
    report.addFinding({
      severity: "medium",
      step: demoStep,
      step_description: "Click 'See it in action' -> /demo",
      category: "bug",
      description: "Navigation to demo page failed on mobile",
      expected: "Navigate to /demo",
      actual: String(err),
      screenshot_path: p,
      url: "/",
    });
    return;
  }

  // ── Step 12: Verify demo renders on mobile ───────────────────────────────
  const demoRenderStep = 12;
  report.incrementSteps();
  try {
    await page.waitForTimeout(2_000);
    await screenshot.capture(demoRenderStep, "mobile-demo-rendered");

    // Check for horizontal overflow on demo page
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (hasOverflow) {
      const p = await screenshot.capture(demoRenderStep, "mobile-demo-overflow");
      report.addFinding({
        severity: "high",
        step: demoRenderStep,
        step_description: "Demo artifact renders on mobile?",
        category: "broken-layout",
        description: "Demo page has horizontal overflow on mobile",
        expected: "Demo artifact fits within mobile viewport",
        actual: "Horizontal scrolling detected",
        screenshot_path: p,
        url: "/demo",
      });
    }
  } catch {
    // Non-critical
  }

  // ── Step 13: Scroll through demo artifact on mobile ──────────────────────
  const demoScrollStep = 13;
  report.incrementSteps();
  try {
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(500);
    }
    await screenshot.capture(demoScrollStep, "mobile-demo-scrolled");
  } catch {
    // Non-critical
  }
};

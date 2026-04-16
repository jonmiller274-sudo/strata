/**
 * screenshot-sections.ts — Visual Eval Harness: Playwright Screenshotter
 *
 * Takes per-section screenshots of rendered Strata artifacts.
 * This is the "prepare.py" of the visual eval loop — immutable, deterministic.
 *
 * Usage:
 *   npx tsx scripts/eval/screenshot-sections.ts [slug]
 *   npx tsx scripts/eval/screenshot-sections.ts --all
 *   npx tsx scripts/eval/screenshot-sections.ts --url http://localhost:3000/demo
 *
 * Output: screenshots/<slug>/<section-id>.png (1280×auto, dark theme)
 *
 * Requires: Playwright Chromium installed (npx playwright install chromium)
 */

import { chromium, type Browser, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = process.env.EVAL_BASE_URL || "http://localhost:3000";
const SCREENSHOT_DIR = path.join(__dirname, "screenshots");
const VIEWPORT = { width: 1280, height: 800 };
const WAIT_FOR_ANIMATIONS_MS = 2000;

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

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

async function screenshotArtifact(
  page: Page,
  url: string,
  slug: string
): Promise<ScreenshotResult> {
  const result: ScreenshotResult = {
    slug,
    url,
    sections: [],
    errors: [],
    timestamp: new Date().toISOString(),
  };

  // Navigate and wait for hydration
  const response = await page.goto(url, { waitUntil: "networkidle" });
  if (!response || response.status() >= 400) {
    result.errors.push(`Page returned status ${response?.status() ?? "unknown"}`);
    return result;
  }

  // Wait for animations to settle (Framer Motion)
  await page.waitForTimeout(WAIT_FOR_ANIMATIONS_MS);

  // Find all section elements (they have id attributes set by SectionRenderer)
  const sectionElements = await page.$$("section[id]");

  if (sectionElements.length === 0) {
    result.errors.push("No section elements found on page");
    return result;
  }

  // Create output directory
  const slugDir = path.join(SCREENSHOT_DIR, slug);
  fs.mkdirSync(slugDir, { recursive: true });

  for (let i = 0; i < sectionElements.length; i++) {
    const section = sectionElements[i];

    try {
      // Get section metadata
      const sectionId = await section.getAttribute("id");
      if (!sectionId) continue;

      // Determine section type from the rendered component's data attribute
      // or by reading the section's content structure
      const sectionType = await page.evaluate((el) => {
        // Try data attribute first
        const dataType = el.getAttribute("data-section-type");
        if (dataType) return dataType;

        // Infer from class names or child structure
        const classes = el.className || "";
        if (classes.includes("timeline")) return "timeline";
        if (classes.includes("metric")) return "metric-dashboard";

        // Default: check first child component
        const firstChild = el.querySelector("[class*='card'], [class*='grid'], [class*='chart']");
        return firstChild ? "unknown" : "rich-text";
      }, section);

      // Scroll into view
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500); // Let scroll animations settle

      // Take screenshot of just this section
      const filepath = path.join(slugDir, `${i}-${sectionId}.png`);
      const box = await section.boundingBox();

      if (!box) {
        result.errors.push(`Section ${sectionId} has no bounding box`);
        continue;
      }

      await section.screenshot({ path: filepath });

      result.sections.push({
        slug,
        sectionId,
        sectionType,
        sectionIndex: i,
        filepath,
        width: Math.round(box.width),
        height: Math.round(box.height),
      });
    } catch (err) {
      result.errors.push(
        `Error screenshotting section ${i}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Also take a full-page screenshot for reference
  const fullPagePath = path.join(slugDir, "_full-page.png");
  await page.screenshot({ path: fullPagePath, fullPage: true });

  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAllPublishedSlugs(): Promise<string[]> {
  // Fetch from the local Next.js server or Supabase directly
  // For simplicity, we hit the discover page and extract slugs
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: VIEWPORT });

  try {
    await page.goto(`${BASE_URL}/discover`, { waitUntil: "networkidle" });
    const slugs = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href^="/"]');
      const foundSlugs: string[] = [];
      links.forEach((link) => {
        const href = link.getAttribute("href") || "";
        // Artifact links are single-segment paths (not /edit/, /create, etc.)
        if (
          href.startsWith("/") &&
          !href.includes("/edit") &&
          !href.includes("/create") &&
          !href.includes("/dashboard") &&
          !href.includes("/demo") &&
          !href.includes("/pricing") &&
          !href.includes("/discover") &&
          !href.includes("/auth") &&
          !href.includes("/api") &&
          href !== "/"
        ) {
          foundSlugs.push(href.slice(1)); // Remove leading /
        }
      });
      return [...new Set(foundSlugs)];
    });
    return slugs;
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  let targets: { slug: string; url: string }[] = [];

  if (args.includes("--help") || args.length === 0) {
    console.log(`
Visual Eval Harness — Section Screenshotter

Usage:
  npx tsx scripts/eval/screenshot-sections.ts <slug>        Screenshot a single artifact
  npx tsx scripts/eval/screenshot-sections.ts --all         Screenshot all published artifacts
  npx tsx scripts/eval/screenshot-sections.ts --url <url>   Screenshot a specific URL
  npx tsx scripts/eval/screenshot-sections.ts --demo        Screenshot the demo page

Options:
  --base-url <url>    Override base URL (default: http://localhost:3000)

Output: scripts/eval/screenshots/<slug>/<section-id>.png
`);
    process.exit(0);
  }

  // Parse base URL override
  const baseUrlIdx = args.indexOf("--base-url");
  const baseUrl = baseUrlIdx !== -1 ? args[baseUrlIdx + 1] : BASE_URL;

  if (args.includes("--demo")) {
    targets.push({ slug: "demo", url: `${baseUrl}/demo` });
  } else if (args.includes("--all")) {
    console.log("Discovering published artifacts...");
    const slugs = await getAllPublishedSlugs();
    if (slugs.length === 0) {
      console.log("No published artifacts found. Try --demo instead.");
      process.exit(1);
    }
    targets = slugs.map((s) => ({ slug: s, url: `${baseUrl}/${s}` }));
    console.log(`Found ${targets.length} artifacts: ${slugs.join(", ")}`);
  } else if (args.includes("--url")) {
    const urlIdx = args.indexOf("--url");
    const url = args[urlIdx + 1];
    if (!url) {
      console.error("Missing URL argument");
      process.exit(1);
    }
    const slug = new URL(url).pathname.slice(1) || "custom";
    targets.push({ slug, url });
  } else {
    // Single slug
    const slug = args[0];
    targets.push({ slug, url: `${baseUrl}/${slug}` });
  }

  // Launch browser once, reuse for all targets
  console.log("Launching Chromium...");
  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: "dark",
    deviceScaleFactor: 2, // Retina-quality screenshots
  });

  const allResults: ScreenshotResult[] = [];

  for (const target of targets) {
    console.log(`\nScreenshotting: ${target.url}`);
    const page = await context.newPage();

    try {
      const result = await screenshotArtifact(page, target.url, target.slug);
      allResults.push(result);

      console.log(
        `  ${result.sections.length} sections captured, ${result.errors.length} errors`
      );
      for (const s of result.sections) {
        console.log(
          `  [${s.sectionIndex}] ${s.sectionType} — ${s.width}x${s.height}px → ${path.basename(s.filepath)}`
        );
      }
      for (const e of result.errors) {
        console.log(`  ERROR: ${e}`);
      }
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Write manifest
  const manifestPath = path.join(SCREENSHOT_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(allResults, null, 2));
  console.log(`\nManifest written to ${manifestPath}`);
  console.log(
    `Total: ${allResults.reduce((n, r) => n + r.sections.length, 0)} sections across ${allResults.length} artifacts`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

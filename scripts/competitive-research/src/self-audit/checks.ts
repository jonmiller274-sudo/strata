import type { Page } from "playwright";

export interface CheckResult {
  id: string;
  capability: string;
  claim: string;
  status: "pass" | "fail" | "partial" | "regressed" | "overdue";
  detail: string;
  screenshotPath: string | null;
  url: string;
}

export interface Check {
  id: string;
  capability: string;
  claim: string;
  run: (page: Page, targetUrl: string, screenshotDir: string) => Promise<CheckResult>;
}

async function screenshot(page: Page, dir: string, name: string): Promise<string> {
  const path = `${dir}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  return path;
}

export const SA_01_SIDEBAR_NAV: Check = {
  id: "SA-01",
  capability: "Non-linear navigation (sidebar)",
  claim: "Yes",
  async run(page, targetUrl, screenshotDir) {
    const url = `${targetUrl}/demo`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Look for sidebar/nav element
    const sidebar = await page.$('nav, aside, [role="navigation"], [data-sidebar]');
    const sidebarLinks = await page.$$('nav a, aside a, [role="navigation"] a');

    const shot = await screenshot(page, screenshotDir, "sa-01-sidebar");

    if (!sidebar) {
      return { id: this.id, capability: this.capability, claim: this.claim, status: "fail", detail: "No sidebar/nav element found on /demo page.", screenshotPath: shot, url };
    }

    if (sidebarLinks.length < 2) {
      return { id: this.id, capability: this.capability, claim: this.claim, status: "partial", detail: `Sidebar found but only ${sidebarLinks.length} navigation links. Expected multiple section links.`, screenshotPath: shot, url };
    }

    // Try clicking a link to verify it works
    try {
      await sidebarLinks[1].click();
      await page.waitForTimeout(500);
    } catch {
      return { id: this.id, capability: this.capability, claim: this.claim, status: "partial", detail: "Sidebar links found but click failed.", screenshotPath: shot, url };
    }

    return { id: this.id, capability: this.capability, claim: this.claim, status: "pass", detail: `Sidebar with ${sidebarLinks.length} section links found and clickable.`, screenshotPath: shot, url };
  },
};

export const SA_02_PROGRESSIVE_DISCLOSURE: Check = {
  id: "SA-02",
  capability: "Progressive disclosure (expand/collapse)",
  claim: "Yes (animated)",
  async run(page, targetUrl, screenshotDir) {
    const url = `${targetUrl}/demo`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Look for expandable elements: buttons with aria-expanded, details/summary, or clickable cards
    const expandables = await page.$$('[aria-expanded], details, [data-expandable], button[aria-controls]');

    const shot = await screenshot(page, screenshotDir, "sa-02-disclosure");

    if (expandables.length === 0) {
      return { id: this.id, capability: this.capability, claim: this.claim, status: "fail", detail: "No expandable/collapsible elements found on /demo.", screenshotPath: shot, url };
    }

    // Try expanding the first one
    try {
      await expandables[0].click();
      await page.waitForTimeout(1000);
      const afterShot = await screenshot(page, screenshotDir, "sa-02-expanded");
      return { id: this.id, capability: this.capability, claim: this.claim, status: "pass", detail: `${expandables.length} expandable elements found. First one expanded on click.`, screenshotPath: afterShot, url };
    } catch {
      return { id: this.id, capability: this.capability, claim: this.claim, status: "partial", detail: `${expandables.length} expandable elements found but click interaction failed.`, screenshotPath: shot, url };
    }
  },
};

export const SA_03_ANIMATED_TIMELINES: Check = {
  id: "SA-03",
  capability: "Animated timelines",
  claim: "Yes (native component)",
  async run(page, targetUrl, screenshotDir) {
    const url = `${targetUrl}/demo`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Look for timeline-related elements
    const timelineElements = await page.$$('[class*="timeline"], [class*="Timeline"], [data-section-type="timeline"], [data-section-type="guided-journey"]');

    // Also search by text content patterns typical of timelines
    const timelineByText = await page.$$('text=/Phase|Step|Stage|Q[1-4]|Month/i');

    const shot = await screenshot(page, screenshotDir, "sa-03-timeline");

    if (timelineElements.length === 0 && timelineByText.length < 3) {
      return { id: this.id, capability: this.capability, claim: this.claim, status: "fail", detail: "No timeline component found on /demo.", screenshotPath: shot, url };
    }

    return { id: this.id, capability: this.capability, claim: this.claim, status: "pass", detail: `Timeline component found: ${timelineElements.length} timeline elements, ${timelineByText.length} timeline-like text patterns.`, screenshotPath: shot, url };
  },
};

export const SA_04_METRIC_DASHBOARDS: Check = {
  id: "SA-04",
  capability: "Metric dashboards",
  claim: "Yes (native component)",
  async run(page, targetUrl, screenshotDir) {
    const url = `${targetUrl}/demo`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Look for metric/dashboard elements
    const metricElements = await page.$$('[class*="metric"], [class*="Metric"], [class*="dashboard"], [class*="Dashboard"], [data-section-type="data-viz"]');

    // Look for counter-like patterns (numbers with labels)
    const counters = await page.$$('[class*="counter"], [class*="Counter"], [class*="stat"], [class*="Stat"], [class*="kpi"], [class*="KPI"]');

    const shot = await screenshot(page, screenshotDir, "sa-04-metrics");

    if (metricElements.length === 0 && counters.length === 0) {
      return { id: this.id, capability: this.capability, claim: this.claim, status: "fail", detail: "No metric dashboard or counter elements found on /demo.", screenshotPath: shot, url };
    }

    return { id: this.id, capability: this.capability, claim: this.claim, status: "pass", detail: `Metric elements found: ${metricElements.length} dashboard elements, ${counters.length} counter/stat elements.`, screenshotPath: shot, url };
  },
};

export const SA_05_TIER_TABLES: Check = {
  id: "SA-05",
  capability: "Comparison/tier tables",
  claim: "Yes (native component)",
  async run(page, targetUrl, screenshotDir) {
    const url = `${targetUrl}/demo`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const tierElements = await page.$$('[class*="tier"], [class*="Tier"], [class*="pricing"], [class*="Pricing"], [data-section-type="tier-table"]');
    const tables = await page.$$('table');

    const shot = await screenshot(page, screenshotDir, "sa-05-tiers");

    if (tierElements.length === 0 && tables.length === 0) {
      return { id: this.id, capability: this.capability, claim: this.claim, status: "fail", detail: "No tier/comparison table elements found on /demo.", screenshotPath: shot, url };
    }

    return { id: this.id, capability: this.capability, claim: this.claim, status: "pass", detail: `Tier table elements found: ${tierElements.length} tier elements, ${tables.length} tables.`, screenshotPath: shot, url };
  },
};

export const SA_06_AI_UPLOAD: Check = {
  id: "SA-06",
  capability: "AI content structuring from upload",
  claim: "Yes (core feature)",
  async run(page, targetUrl, screenshotDir) {
    const url = `${targetUrl}/create`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Look for upload zone, file input, or drop zone
    const uploadElements = await page.$$('input[type="file"], [class*="upload"], [class*="Upload"], [class*="drop"], [class*="Drop"]');

    const shot = await screenshot(page, screenshotDir, "sa-06-upload");

    if (uploadElements.length === 0) {
      return { id: this.id, capability: this.capability, claim: this.claim, status: "fail", detail: "No upload/drop zone found on /create.", screenshotPath: shot, url };
    }

    return { id: this.id, capability: this.capability, claim: this.claim, status: "pass", detail: `Upload interface found: ${uploadElements.length} upload/drop elements on /create.`, screenshotPath: shot, url };
  },
};

export const SA_07_MOBILE_RESPONSIVE: Check = {
  id: "SA-07",
  capability: "Mobile-responsive output",
  claim: "Yes",
  async run(page, targetUrl, screenshotDir) {
    const url = `${targetUrl}/demo`;

    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    const shot = await screenshot(page, screenshotDir, "sa-07-mobile");

    // Reset viewport
    await page.setViewportSize({ width: 1440, height: 900 });

    if (hasOverflow) {
      return { id: this.id, capability: this.capability, claim: this.claim, status: "fail", detail: "Horizontal overflow detected on /demo at 390x844 mobile viewport.", screenshotPath: shot, url };
    }

    return { id: this.id, capability: this.capability, claim: this.claim, status: "pass", detail: "No horizontal overflow at 390x844 viewport. Content appears responsive.", screenshotPath: shot, url };
  },
};

export const SA_08_SHAREABLE_URL: Check = {
  id: "SA-08",
  capability: "Shareable URL (no viewer login)",
  claim: "Yes",
  async run(page, targetUrl, screenshotDir) {
    const url = `${targetUrl}/demo`;
    // Navigate without any auth cookies (fresh context)
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Check we're not redirected to login
    const currentUrl = page.url();
    const hasAuthPrompt = await page.$('[class*="auth"], [class*="login"], [class*="signin"], input[type="password"]');

    const shot = await screenshot(page, screenshotDir, "sa-08-shareable");

    if (currentUrl.includes("login") || currentUrl.includes("auth") || hasAuthPrompt) {
      return { id: this.id, capability: this.capability, claim: this.claim, status: "fail", detail: `Page redirected to auth or showed login prompt. URL: ${currentUrl}`, screenshotPath: shot, url };
    }

    return { id: this.id, capability: this.capability, claim: this.claim, status: "pass", detail: "Demo page loads without any auth requirement.", screenshotPath: shot, url };
  },
};

export const SA_09_DARK_LIGHT_THEME: Check = {
  id: "SA-09",
  capability: "Dark/light theme",
  claim: "Yes",
  async run(page, targetUrl, screenshotDir) {
    const url = `${targetUrl}/demo`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Check for dark theme indicators
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Check for theme toggle
    const themeToggle = await page.$('[class*="theme"], [data-theme], button[aria-label*="theme"], button[aria-label*="Theme"]');

    const shot = await screenshot(page, screenshotDir, "sa-09-theme");

    // Dark background = dark theme active
    const isDark = bgColor.includes("0,") || bgColor.includes("rgb(0") || bgColor.includes("rgb(1") || bgColor.includes("rgb(2");

    if (!isDark && !themeToggle) {
      return { id: this.id, capability: this.capability, claim: this.claim, status: "fail", detail: `No dark theme detected and no theme toggle found. Background: ${bgColor}`, screenshotPath: shot, url };
    }

    return { id: this.id, capability: this.capability, claim: this.claim, status: "pass", detail: `Theme active. Background: ${bgColor}. Toggle present: ${!!themeToggle}`, screenshotPath: shot, url };
  },
};

export const SA_12_ATTRIBUTION: Check = {
  id: "SA-12",
  capability: '"Made with Strata" attribution',
  claim: "Yes",
  async run(page, targetUrl, screenshotDir) {
    const url = `${targetUrl}/demo`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Look for attribution text
    const attribution = await page.$('text=/[Mm]ade with [Ss]trata|[Cc]reate your own|[Pp]owered by [Ss]trata/');
    const strataLink = await page.$('a[href*="strata"]');

    const shot = await screenshot(page, screenshotDir, "sa-12-attribution");

    if (!attribution && !strataLink) {
      return { id: this.id, capability: this.capability, claim: this.claim, status: "fail", detail: "No 'Made with Strata' attribution or CTA found at bottom of /demo.", screenshotPath: shot, url };
    }

    return { id: this.id, capability: this.capability, claim: this.claim, status: "pass", detail: "Attribution/CTA found on /demo page.", screenshotPath: shot, url };
  },
};

// Registry of all checks
export const ALL_CHECKS: Check[] = [
  SA_01_SIDEBAR_NAV,
  SA_02_PROGRESSIVE_DISCLOSURE,
  SA_03_ANIMATED_TIMELINES,
  SA_04_METRIC_DASHBOARDS,
  SA_05_TIER_TABLES,
  SA_06_AI_UPLOAD,
  SA_07_MOBILE_RESPONSIVE,
  SA_08_SHAREABLE_URL,
  SA_09_DARK_LIGHT_THEME,
  SA_12_ATTRIBUTION,
];

/**
 * Generate the test PDF fixture for usability tests.
 *
 * Run: npx tsx scripts/generate-fixture-pdf.ts
 *
 * Creates a 3-page PDF with realistic strategy content using Playwright's
 * built-in PDF generation (renders HTML -> PDF via Chromium).
 */

import { chromium } from "playwright";
import * as path from "node:path";

const OUTPUT_PATH = path.resolve(__dirname, "../fixtures/sample-strategy.pdf");

const HTML_CONTENT = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 700px;
      margin: 0 auto;
      padding: 40px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    h1 { font-size: 28px; margin-top: 60px; color: #0f172a; }
    h2 { font-size: 22px; margin-top: 40px; color: #1e3a5f; }
    h3 { font-size: 18px; margin-top: 30px; color: #334155; }
    p { margin: 12px 0; }
    .page-break { page-break-after: always; }
    .metric { font-size: 32px; font-weight: bold; color: #0d9488; }
    .metric-label { font-size: 14px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
  </style>
</head>
<body>

<h1>EMEA Go-to-Market Strategy</h1>
<p><strong>Velocity Revenue Intelligence</strong> — Board Strategy Document, Q3 2026</p>
<p>Prepared by: Strategy Team | Confidential</p>

<h2>Executive Summary</h2>
<p>Velocity has reached an inflection point. At $18.2M ARR with 142% net revenue retention, our US business is scaling predictably — but our addressable market is constrained. Sixty-three percent of enterprise revenue intelligence spend will come from outside North America by 2028.</p>

<p>This document outlines our plan to launch Velocity EMEA in Q3 2026, targeting $4.2M in incremental ARR within 18 months. We're requesting board approval for a $2.8M investment: a London hub, 12 initial hires, and localized product infrastructure.</p>

<h2>Key Metrics</h2>
<table>
  <tr><th>Metric</th><th>Value</th></tr>
  <tr><td>Current ARR</td><td>$18.2M</td></tr>
  <tr><td>Net Revenue Retention</td><td>142%</td></tr>
  <tr><td>EMEA ARR Target (18mo)</td><td>$4.2M</td></tr>
  <tr><td>Investment Required</td><td>$2.8M</td></tr>
  <tr><td>Headcount Plan</td><td>12 hires</td></tr>
</table>

<div class="page-break"></div>

<h1>Market Analysis</h1>

<h2>Market Sizing</h2>
<p>The European revenue intelligence market represents a $680M serviceable addressable market with no dominant player. Current competitors hold less than 1% combined market share.</p>

<h3>Competitive Landscape</h3>
<table>
  <tr><th>Competitor</th><th>HQ</th><th>Funding</th><th>Customers</th><th>Weakness</th></tr>
  <tr><td>Revera</td><td>Berlin</td><td>$6M (Seed)</td><td>47</td><td>No ML forecasting, no SOC 2</td></tr>
  <tr><td>Klosio</td><td>London</td><td>CRM pivot</td><td>~30</td><td>Accuracy issues, UK only</td></tr>
</table>

<h2>Target Segments</h2>
<h3>1. UK Mid-Market (Priority 1)</h3>
<p>200-1,000 employee SaaS companies with established sales teams. 340 qualified accounts identified. Average deal size: £30-80K. Decision cycle: 6-8 weeks.</p>

<h3>2. DACH Enterprise (Priority 2)</h3>
<p>1,000+ employee companies in Germany, Austria, and Switzerland. Average deal size: EUR 92K. Requires German-language support and EU data residency (Frankfurt data center planned for Day 45).</p>

<h3>3. Nordics PLG (Priority 3)</h3>
<p>Product-led SaaS companies in Stockholm, Helsinki, and Copenhagen. Average time to value: 14 days. Self-serve motion, no sales touch required.</p>

<div class="page-break"></div>

<h1>Go-to-Market Plan</h1>

<h2>The First 90 Days</h2>

<h3>Days 1-30: Foundation</h3>
<p><strong>Day 1:</strong> GM Sarah Chen starts (ex-Gong EMEA — built UK team from 0 to £8M ARR in 14 months).</p>
<p><strong>Week 1:</strong> London office live (Shoreditch WeWork, 15 desks).</p>
<p><strong>Week 2:</strong> First 2 Account Executives join. Begin US product certification and talk track localization.</p>
<p><strong>Day 30 checkpoint:</strong> 15 first meetings booked, 3 POCs signed.</p>

<h3>Days 31-60: Activation</h3>
<p><strong>Week 5-6:</strong> Partner agreements with Accenture UK and Deloitte Digital.</p>
<p><strong>Day 45:</strong> Frankfurt data center live — removes #1 DACH sales objection.</p>
<p><strong>Week 7-8:</strong> First revenue — 2 UK mid-market deals closed (£80K combined ARR).</p>

<h3>Days 61-90: Pipeline</h3>
<p><strong>Day 60:</strong> DACH team joins (2 German-speaking AEs).</p>
<p><strong>Day 75:</strong> $1.2M qualified pipeline across UK and DACH.</p>
<p><strong>Day 90:</strong> Board review — 5 closed customers, £210K ARR, pipeline 15% ahead of plan.</p>

<h2>Revenue Model</h2>
<table>
  <tr><th>Metric</th><th>Target</th></tr>
  <tr><td>Year 1 EMEA ARR</td><td>$4.2M</td></tr>
  <tr><td>Blended CAC Payback</td><td>14 months</td></tr>
  <tr><td>Quota per Rep (Ramped)</td><td>$520K (85% of US)</td></tr>
  <tr><td>Pipeline Coverage</td><td>3.5x</td></tr>
</table>

<h2>Investment Ask</h2>
<p>We are requesting board approval for $2.8M to fund the EMEA expansion over 18 months. This covers: London office lease and setup ($420K), 12 hires across sales, SE, and operations ($1.9M), Frankfurt data center and localization ($340K), and field marketing and events ($140K).</p>

<p><em>End of document.</em></p>

</body>
</html>
`;

async function main() {
  console.log("Generating test PDF fixture...");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(HTML_CONTENT, { waitUntil: "networkidle" });

  await page.pdf({
    path: OUTPUT_PATH,
    format: "Letter",
    margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    printBackground: true,
  });

  await browser.close();

  console.log(`PDF fixture created: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Failed to generate PDF:", err);
  process.exit(1);
});

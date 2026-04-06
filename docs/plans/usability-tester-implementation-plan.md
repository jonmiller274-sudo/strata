# Usability Tester Agent — Implementation Plan

**Date:** 2026-04-06
**Status:** Draft — awaiting Jon's approval
**Context:** Week 1 of the Autonomous Product Team (design doc: `docs/plans/2026-04-05-autonomous-product-team-design.md`)

---

## A. GitHub Actions Workflow

**File:** `.github/workflows/usability-test.yml`

**Trigger:** Daily cron at 6:00 AM ET (11:00 UTC). Gives findings time to be synthesized by midday and included in the evening briefing. Also includes `workflow_dispatch` for manual triggering during development.

**Environment:** `ubuntu-latest` with Playwright Chromium only (no Firefox/WebKit — we're testing one app, not cross-browser compatibility).

**Target URL:** Test against production (`https://sharestrata.com`). Rationale: the design doc says the Usability Tester should use the product "as a real person would." Testing production catches deployment-specific bugs (like the known PDF upload bug). Fallback URL configurable via workflow input.

Do NOT start a dev server in CI. The agent tests the deployed product.

**Secrets needed:**
- `GITHUB_TOKEN` (built-in) — for creating issues and uploading screenshot artifacts
- No additional API keys for v1 (AI screenshot analysis deferred to Week 2+)

**Workflow structure:**

```yaml
name: Usability Test

on:
  schedule:
    - cron: '0 11 * * *'  # 6:00 AM ET daily
  workflow_dispatch:
    inputs:
      scenario_ids:
        description: 'Comma-separated scenario IDs to run (blank = daily rotation)'
        required: false
      target_url:
        description: 'URL to test against'
        required: false
        default: 'https://sharestrata.com'

permissions:
  issues: write
  contents: read

jobs:
  usability-test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci --prefix tests/usability
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
        working-directory: tests/usability
      - name: Run usability scenarios
        env:
          TARGET_URL: ${{ inputs.target_url || 'https://sharestrata.com' }}
          SCENARIO_IDS: ${{ inputs.scenario_ids || '' }}
          RUN_DATE: ${{ github.event.schedule && 'scheduled' || 'manual' }}
        run: npx tsx src/runner.ts
        working-directory: tests/usability
      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: usability-screenshots-${{ github.run_id }}
          path: tests/usability/output/screenshots/
          retention-days: 30
      - name: File findings as GitHub Issue
        if: always()
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx tsx src/file-findings.ts
        working-directory: tests/usability
```

---

## B. Playwright Test Structure

All usability test code lives in a standalone directory with its own `package.json` to avoid polluting the main Strata app dependencies.

```
tests/usability/
  package.json              # playwright, @playwright/test, tsx dependencies
  tsconfig.json             # TypeScript config
  playwright.config.ts      # Playwright configuration
  src/
    runner.ts               # Main orchestrator — picks scenarios, runs them, collects findings
    file-findings.ts        # Reads output JSON, creates GitHub Issue
    personas/
      index.ts              # Persona type definitions and registry
      first-time-user.ts
      power-user.ts
      rushed-exec.ts
      mobile-user.ts
      edge-case-user.ts
    scenarios/
      index.ts              # Scenario registry + daily rotation logic
      landing-to-create.ts  # First-time user: landing → create flow
      create-with-pdf.ts    # Rushed exec: upload PDF → preview → publish
      demo-exploration.ts   # First-time user: view demo page
      dashboard-manage.ts   # Power user: manage multiple artifacts
      editor-workflow.ts    # Power user: edit sections, reorder, AI rewrite
      share-view.ts         # Any persona: view published artifact via slug
      pricing-page.ts       # First-time user: explore pricing
      mobile-landing.ts     # Mobile user: landing page on mobile viewport
      mobile-artifact.ts    # Mobile user: view artifact on mobile
      edge-large-pdf.ts     # Edge case: upload oversized PDF
      edge-empty-content.ts # Edge case: structure empty content
    utils/
      screenshot.ts         # Screenshot helper (timestamp + step label)
      findings.ts           # Finding data structure + serialization
      rotation.ts           # Daily rotation logic (round-robin)
  fixtures/
    sample-strategy.pdf     # 5-page test PDF for upload scenarios
  output/
    screenshots/            # Per-run screenshots (gitignored)
    findings/               # Per-run JSON findings (gitignored)
```

### Persona Definitions

```typescript
interface Persona {
  id: string;
  name: string;
  description: string;
  viewport: { width: number; height: number };
  userAgent?: string;
  behavior: {
    readSpeed: 'fast' | 'normal' | 'slow';
    tolerance: 'low' | 'medium' | 'high';
    techSavvy: 'low' | 'medium' | 'high';
  };
}
```

| Persona | Viewport | Read Speed | Tolerance | Tech Savvy |
|---------|----------|-----------|-----------|------------|
| first-time-user | 1440×900 | normal | medium | low |
| power-user | 1440×900 | fast | high | high |
| rushed-exec | 1440×900 | fast | **low** | medium |
| mobile-user | 390×844 (iPhone 15) | slow | medium | medium |
| edge-case-user | 1440×900 | normal | high | high |

### Scenario Structure

```typescript
interface ScenarioConfig {
  id: string;
  name: string;
  persona: string;
  description: string;
  priority: 1 | 2 | 3;
  estimatedMinutes: number;
}

type ScenarioFn = (
  page: Page,
  persona: Persona,
  capture: ScreenshotCapture,
  report: FindingCollector
) => Promise<void>;
```

### Screenshot Strategy

Capture at key moments, not every interaction:
1. After each page navigation (full page)
2. After any action that changes visible state
3. When something unexpected happens (error, empty state, broken layout)
4. After waiting for an expected element that does not appear (timeout)

Naming: `{scenario_id}_{step_number}_{description}.png`

---

## C. Scenario Definitions

### Complete Route Map

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/` | Landing page | No | Marketing page with hero, features, pricing, CTA |
| `/demo` | Demo viewer | No | Hardcoded artifact with all 8 section types |
| `/create` | Creation flow | No (auth at publish) | 3-step wizard: template → content → preview |
| `/dashboard` | User dashboard | Yes | Lists artifacts: published, drafts, archived |
| `/edit/[slug]` | Editor | Yes | Split-view editor with AI chat |
| `/pricing` | Pricing page | No | 4 tiers, annual/monthly toggle, FAQ |
| `/discover` | Waitlist page | No | Post-demo CTA for email capture |
| `/[slug]` | Published artifact | No | Public view of published artifact |

### Week 1 Priority Scenarios (5 — build these first)

#### 1. `landing-to-create` (first-time-user, Priority 1)
**Goal:** "I just landed on the site. How do I create my first document?"
1. Navigate to `/`. Screenshot.
2. Read hero text. Is the value prop clear within 5 seconds?
3. Click "Start creating" CTA. Screenshot.
4. Arrive at `/create`. Template options visible?
5. Select "Go-to-Market Strategy" template. Screenshot.
6. Content input step loaded with correct label?
7. Type 100 words of sample content.
8. Click "Structure with AI". Screenshot.
9. Wait for AI response (up to 60s). Screenshot on completion.
10. Preview step loaded with structured artifact?
11. Click "Publish & get link". Screenshot.
12. Auth modal appears (not signed in)? Screenshot.

**Friction to watch for:** Unclear CTA hierarchy, slow AI response, confusing auth gate at publish.

#### 2. `demo-exploration` (first-time-user, Priority 1)
**Goal:** "I want to see what a Strata doc looks like before I commit."
1. Navigate to `/`. Screenshot.
2. Click "See it in action" link. Screenshot.
3. Arrive at `/demo`. Demo renders correctly?
4. Scroll through all 8 sections. Screenshot each type.
5. Interact with expandable cards. Screenshot.
6. Interact with guided journey. Screenshot.
7. Interact with timeline. Screenshot.
8. "Made with Strata" attribution visible?
9. Navigation works?

#### 3. `create-with-pdf` (rushed-exec, Priority 1)
**Goal:** "I have a PDF deck. Turn it into a shareable link in 10 minutes."
1. Navigate to `/create`. Screenshot.
2. Select "Platform Vision" template. Screenshot.
3. Upload test PDF fixture.
4. Wait for extraction. Screenshot during loading.
5. Extracted text appears in textarea? Screenshot.
6. Click "Structure with AI". Wait. Screenshot.
7. Preview renders correctly from PDF content?
8. **Time the entire flow.** Report elapsed time.

**Known issue:** PDF upload fails on production. This scenario will confirm and document it.

#### 4. `mobile-landing` (mobile-user, Priority 1)
**Goal:** "I'm on my phone, browsing this site someone shared."
1. Set viewport to 390×844.
2. Navigate to `/`. Screenshot.
3. Hero text readable, not cut off?
4. Navigation usable (hamburger menu)?
5. Scroll entire landing page. Screenshot at each section.
6. CTAs tappable (min 44px touch target)?
7. Click "See it in action" → `/demo`. Screenshot.
8. Demo artifact renders on mobile?
9. Scroll through artifact. Screenshot each section.

#### 5. `mobile-artifact` (mobile-user, Priority 1)
**Goal:** "Someone shared a Strata link and I'm viewing it on my phone."
1. Set viewport to 390×844.
2. Navigate to `/demo`. Screenshot.
3. Sidebar navigation works or collapses on mobile?
4. Scroll through all sections. Screenshot each.
5. Expandable cards usable on mobile? Screenshot.
6. Guided journey usable on small screen?
7. Tier table not cut off horizontally?

### Week 2+ Scenarios (6 — deferred)

| Scenario | Persona | Blocker |
|----------|---------|---------|
| `dashboard-manage` | power-user | Needs test Supabase account |
| `editor-workflow` | power-user | Needs test account + edit key |
| `pricing-exploration` | first-time-user | Lower priority |
| `quick-create-paste` | rushed-exec | Lower priority |
| `edge-empty-content` | edge-case-user | Lower priority |
| `edge-nonexistent-slug` | edge-case-user | Lower priority |

### Daily Rotation

5 scenarios, run 2-3 per day. Round-robin based on day of year modulo scenario count. Full coverage within 3 days.

---

## D. Finding Output Format

```typescript
interface UsabilityFinding {
  id: string;                          // UUID
  timestamp: string;                   // ISO 8601
  severity: 'critical' | 'high' | 'medium' | 'low';
  persona: string;
  scenario: string;
  step: number;
  step_description: string;
  category: 'bug' | 'friction' | 'missing' | 'confusing' | 'slow' | 'broken-layout';
  description: string;
  expected: string;
  actual: string;
  screenshot_path: string;
  url: string;
  viewport: { width: number; height: number };
  elapsed_ms?: number;
  recommendation?: string;
}

interface UsabilityReport {
  run_id: string;
  run_date: string;
  target_url: string;
  scenarios_run: string[];
  total_steps: number;
  findings: UsabilityFinding[];
  screenshots: string[];
  duration_ms: number;
}
```

**Severity rules:**
- **critical:** Page crashes, JS errors, complete failure to load, data loss
- **high:** Core flow blocked, broken layout making content illegible
- **medium:** Friction that slows but doesn't block, confusing UX, slow responses (>10s)
- **low:** Minor visual issues, missing polish, suboptimal but functional

---

## E. Evening Briefing Integration

After each run, `file-findings.ts` creates a GitHub Issue titled:
```
Usability Test — {YYYY-MM-DD} — {N} findings
```
Labels: `usability-test`, `discovery`

Issue body follows the evening briefing format from the design doc (severity-sorted findings with screenshots, persona context, and expected vs actual behavior).

iMessage notification deferred to Week 2 (handled by Evening Briefing LaunchAgent, not the Usability Tester itself).

---

## F. Implementation Sequence

### Day 1-2: Scaffolding + First Scenario
1. Create `tests/usability/` with `package.json`, `tsconfig.json`, `playwright.config.ts`
2. Implement persona types + first-time-user persona
3. Implement screenshot utility and findings data structures
4. Implement `landing-to-create` scenario
5. Implement `runner.ts` (simplified: one hardcoded scenario)
6. Test locally: `TARGET_URL=http://localhost:3000 npx tsx src/runner.ts`
7. Verify: screenshots captured, findings JSON produced

### Day 3: GitHub Actions Integration
1. Create workflow file
2. Implement `file-findings.ts` (creates GitHub Issue via `gh` CLI)
3. Push to feature branch, trigger via `workflow_dispatch`
4. Verify: workflow runs, screenshots uploaded, Issue created
5. Iterate on Issue formatting

### Day 4-5: Add Remaining Priority 1 Scenarios
1. `demo-exploration` scenario
2. `create-with-pdf` scenario (commit test PDF fixture)
3. Mobile persona + `mobile-landing` scenario
4. `mobile-artifact` scenario
5. Daily rotation logic

### Day 6-7: Polish + First Full Run
1. `.gitignore` for `tests/usability/output/`
2. Full rotation via `workflow_dispatch`
3. Review Issue output with Jon
4. Tune severity classification
5. Enable cron schedule

### Minimum Viable Version (Day 3)
One scenario (`landing-to-create`) runs on GitHub Actions, captures screenshots, creates a GitHub Issue. Immediately useful — will surface the prod PDF upload bug and any mobile issues.

---

## G. Cost & Resource Estimates

| Resource | Usage | Cost |
|----------|-------|------|
| GitHub Actions minutes | ~3-5 min/day, ~150 min/month | **$0** (free tier: 2,000 min/month) |
| Screenshot storage | ~10MB/day, 30-day retention | **$0** (included in Actions artifacts) |
| AI screenshot analysis (Week 2+) | ~$0.25-1.25/day if added | **$0 in v1** |
| Test PDF fixture | One-time, committed to repo | **$0** |
| **Total Week 1** | | **$0/month** |

---

## Critical Files Reference

| File | Purpose |
|------|---------|
| `.github/workflows/auto-merge-tier1.yml` | Pattern reference for existing Strata workflows |
| `docs/agents/discovery-prompt.md` | Pattern reference for "discovery only" agent philosophy |
| `src/app/create/page.tsx` | Creation flow DOM structure (for Playwright selectors) |
| `src/app/demo/page.tsx` | Demo page structure |
| `src/app/page.tsx` | Landing page structure |

---

*This plan is designed so a Builder agent can implement it without further clarification. Awaiting Jon's approval before implementation begins.*

# Competitive Researcher — Feature Matrix Snapshot

Machine-readable version of Strata's competitive claims. The self-audit verifies each row against the deployed app.

**Source:** `docs/research/competitive-deep-dive-2026-04-06.md` Section 3
**Last synced:** 2026-04-08

---

## Strata's Claims (to verify)

Each row has: claim, how to verify, expected result, and current status.

| ID | Capability | Strata Claim | Verification Method | Expected Result | Status |
|----|-----------|-------------|--------------------|-----------------| -------|
| SA-01 | Non-linear navigation (sidebar) | Yes | Navigate to /demo, check sidebar is visible and clickable | Sidebar present, section links work | partial |
| SA-02 | Progressive disclosure (expand/collapse) | Yes (animated) | Navigate to /demo, find expandable cards, click to expand | Cards expand with animation on click | partial |
| SA-03 | Animated timelines | Yes (native component) | Navigate to /demo, find timeline section, verify animation | Timeline section animates on scroll/click | pass |
| SA-04 | Metric dashboards | Yes (native component) | Navigate to /demo, find metrics section, verify counters | Metric cards visible with animated counters | fail |
| SA-05 | Comparison/tier tables | Yes (native component) | Navigate to /demo, find tier/comparison section | Tier table renders with interactive elements | fail |
| SA-06 | AI content structuring from upload | Yes (core feature) | Navigate to /create, verify PDF upload UI exists | Upload zone visible, accepts files | pass |
| SA-07 | Mobile-responsive output | Yes | Navigate to /demo at 390x844 viewport | No overflow, readable text, functional nav | pass |
| SA-08 | Shareable URL (no viewer login) | Yes | Open a published artifact URL in incognito | Page loads without auth prompt | pass |
| SA-09 | Dark/light theme | Yes | Check /demo for theme toggle or default dark theme | Theme renders correctly, toggle works if present | untested |
| SA-10 | Self-navigating without presenter | Yes (core design goal) | Navigate /demo, verify sidebar + expand + no "present" mode | All interactive elements work without click-through | untested |
| SA-11 | Viewer analytics | Planned | Check if analytics UI exists in dashboard | Should still show "planned" — flag if shipped or overdue | untested |
| SA-12 | "Made with Strata" attribution | Yes | Navigate to /demo, scroll to bottom | Attribution badge visible with "Create your own" CTA | untested |
| SA-13 | PDF upload to interactive document | Yes | Navigate to /create, attempt PDF upload flow | Upload zone → AI processing → structured sections | untested |

---

*Update the Status column after each self-audit run. Statuses: untested, pass, fail, partial, regressed.*

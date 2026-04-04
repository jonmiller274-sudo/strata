# Quality Agent Scratchpad

Persistent memory for the Quality Engineer agent. Append new lessons at the top. Format: date + lesson + example.

## Current Focus

Working through Tier 1 items in `docs/quality-rubric.md`. Next unblocked item after each merge.

## What I Learned

*(Patterns that worked. Append newest at top.)*

### 2026-04-05 — Use inline style for CSS variable palette fallbacks
When patching palette-aware colors, use `style={{ backgroundColor: "var(--palette-accent1, var(--color-accent))" }}` rather than a className. Tailwind can't interpolate CSS custom property names at runtime. Affected: `DataVisualization.tsx`, `SidebarNav.tsx`.

### 2026-04-05 — loading.tsx for Next.js skeleton screens
Creating `src/app/[slug]/loading.tsx` (Suspense boundary, no `"use client"`) is the correct Next.js App Router pattern for artifact page skeletons (QR-17). No changes needed to the page component itself.

### 2026-04-05 — Merge existing style attributes when patching inline styles
If a component already uses a `style` prop (e.g. `style={{ width: "..." }}`), merge new properties into the same object rather than adding a second `style=` attribute. Duplicate `style` attributes cause build failures.

### 2026-04-04 — Seeded
No lessons yet. First few PRs will populate this section.

## Traps to Avoid

*(Things that wasted time or caused regressions. Append newest at top.)*

### 2026-04-05 — Backticks in curl heredoc PR bodies
Special shell characters (backticks, `${}`) in GitHub API PR bodies sent via bash heredoc will break the string. Use escaped or simplified text in PR descriptions, or use a JSON file.

### 2026-04-05 — Check for existing implementations before building
QR-22 (timeline status dots) was already fully implemented in `AnimatedTimeline.tsx` via `STATUS_STYLES` map. Read the file before writing any code — creates a housekeeping-only PR instead of a redundant rewrite.

### 2026-04-04 — Seeded
No traps logged yet.

---

*Rule: append new lessons at the top of each section. Format: `### YYYY-MM-DD — short title` followed by 1-3 lines with a concrete example (file, component, or commit).*

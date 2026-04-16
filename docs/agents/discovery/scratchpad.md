# Discovery Agent Scratchpad

Persistent memory for the Discovery agent. Tracks which audit modes have been run recently so the agent can rotate through them instead of repeating the same sweep.

## Audit Modes

Discovery rotates through these audit types so no single mode goes stale:

- **Visual sweep** — deployed app screenshots compared against `docs/design-system.md`
- **Interaction states** — loading, error, empty, success for every interactive component
- **Accessibility** — ARIA labels, keyboard nav, focus states, color contrast
- **Responsive** — mobile / tablet / desktop breakpoints
- **Performance** — Lighthouse run on key routes, flag regressions
- **Copy & tone** — landing page and editor copy against brand voice

## Rotation Log

*(Which mode last ran. Append newest at top. Agent picks the oldest mode that hasn't run in the last 3 days.)*

### 2026-04-16 10:15 — Visual consistency sweep
Ran visual consistency sweep (Mode 1). Filed 5 new items: QR-25, QR-26, QR-27, QR-28, QR-29.

### 2026-04-04 — Seeded
No audits run yet. First scheduled run will start with **visual sweep** (deployed app vs design-system.md).

## Current Focus

First audit queue is post-Phase-1 visual polish. After that, rotate through interaction states and accessibility.

## What I Learned

*(Patterns Discovery noticed about where bugs tend to cluster. Append newest at top.)*

### 2026-04-16 — Visual sweep
New section types (FlywheelDiagram) introduced with raw hex color palettes and non-standard tokens — these bypass existing quality sweeps because they are new files not covered by earlier PRs. Each new viewer section type added to `src/components/viewer/sections/` should be audited at creation. The not-found.tsx in `src/app/[slug]/` was created with raw hex values; an earlier quality agent PR (#43) to fix this did not merge. SplitViewLayout and EditorLayout share duplicated upload-button patterns and drift in sync — fix one, check the other.

### 2026-04-04 — Seeded
Nothing yet.

---

*Rule: update Rotation Log after every run. Never run the same mode twice in a row unless Jon explicitly asks.*

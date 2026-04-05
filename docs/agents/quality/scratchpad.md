# Quality Agent Scratchpad

Persistent memory for the Quality Engineer agent. Append new lessons at the top. Format: date + lesson + example.

## Current Focus

Working through Tier 1 items in `docs/quality-rubric.md`. Next unblocked item after each merge.

## What I Learned

*(Patterns that worked. Append newest at top.)*

### 2026-04-05 — Fifth run: 6 PRs (all Tier 0), all discovery
- All rubric OPEN items already had open PRs from prior runs — went straight to discovery loop.
- Good new category: inline styles that duplicate Tailwind tokens. `ProgressBarNav` mobile pill and `ArtifactViewer` beats layout/watermark both used `style={{ color: "var(--color-muted-foreground)" }}` when `text-muted-foreground` class does the same thing.
- Auth modals (`AuthModal.tsx`, `UpgradePrompt.tsx`) both had icon-only X close buttons with no `aria-label`. Found via scanning uncovered files list.
- `AuthModal.tsx` had `opacity-50` for loading state — should be `opacity-30`. Different issue from `disabled:opacity-50` (the PR #21 pattern) since it's a conditional class, not a `disabled:` modifier.
- Focus ring normalization: `focus:ring-accent` (no opacity modifier) found in `AuthModal.tsx` and `create/page.tsx`. All editor components correctly used `focus:ring-accent/50`. Inconsistency was likely just copy-paste drift.
- Three decorative SVGs needed `aria-hidden="true"`: section type preview thumbnail, Google logo in auth button, hub connector arrow.
- Trap: Check ALL open PRs before scanning for issues — many files already have pending fixes that would create duplicate/conflicting PRs.

### 2026-04-05 — Third run: 13 PRs (12 Tier-0, 1 Tier-1), all discovery
- Biggest category: font-semibold normalization. 30+ instances across editor, viewer, auth, create, dashboard. Not in design-system weight scale. Rule: headings→font-bold, buttons/labels/badges→font-medium. Split into 4 PRs by component area.
- Raw hex violations in not-found.tsx (5) and ProgressBarNav (1) — both covered but main shows originals since PRs unmerged.
- ESLint sweep continuation: AiChatPanel imports, TypeSelectorDropdown param, SplitViewLayout params, EditableSectionRenderer params — NOT in PRs #36-39. Needed their own PRs.
- Trap: When doing replace_all font-semibold→font-medium in create/page.tsx, overrode h3 headings that should be font-bold. Had to manually fix back. Always audit replace_all on mixed contexts.
- Missing transitions: transition-colors on error-dismiss X button, transition-opacity on drag handles — easy 1-liners.
- Focus accessibility: timeline nodes with focus:outline-none and no replacement ring. Tier 1 fix.

### 2026-04-05 — Discovery-only run: 8 PRs, all Tier 0
- All open rubric items already had PRs from prior runs — went straight to discovery loop.
- ESLint had 50 false-positive no-undef errors due to missing browser/node globals in config (File, FormData, URLSearchParams, AbortController, etc.). One PR fixed all 50 by adding globals to eslint.config.mjs.
- Biggest source of warnings: callback type parameter names (path, value, section, id) in TypeScript interface prop signatures. ESLint treats them as unused vars. Fix: rename to _prefix. Applied across ~20 files in 4 batched PRs.
- `_removed` in destructuring-to-omit pattern (DocumentSettings.tsx) is a known ESLint limitation — skip.
- False positive on `GuidedJourneySection` import (type IS used, but ESLint's no-unused-vars doesn't understand TypeScript type imports without @typescript-eslint plugin). Skip.

### 2026-04-04 — Full rubric run: 7 PRs, all Tier 2
- `gh` CLI not available in this environment — use GitHub REST API via curl with the PAT. Set remote URL to `https://x-access-token:<token>@github.com/...` before pushing.
- `npm run build` requires `npm install` first if node_modules is absent (cold environment). Always check before assuming build works.
- Many rubric items already had open PRs from prior runs (QR-03, QR-13, QR-14, QR-15, QR-17). Scan open PRs before starting to avoid duplicates.
- `opengraph-image.tsx` existed but had a privacy bug (used `getArtifactForEdit` — no `is_published` filter). QR-19 was fixing the bug, not building from scratch.
- SplitViewLayout changes (QR-09, QR-10) require checking ALL consumers of changed components, not just the primary file.

### 2026-04-04 — Seeded
No lessons yet. First few PRs will populate this section.

## Traps to Avoid

*(Things that wasted time or caused regressions. Append newest at top.)*

### 2026-04-04 — Seeded
No traps logged yet.

---

*Rule: append new lessons at the top of each section. Format: `### YYYY-MM-DD — short title` followed by 1-3 lines with a concrete example (file, component, or commit).*

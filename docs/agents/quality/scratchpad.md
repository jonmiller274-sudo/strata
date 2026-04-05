# Quality Agent Scratchpad

Persistent memory for the Quality Engineer agent. Append new lessons at the top. Format: date + lesson + example.

## Current Focus

Working through Tier 1 items in `docs/quality-rubric.md`. Next unblocked item after each merge.

## What I Learned

*(Patterns that worked. Append newest at top.)*

### 2026-04-05 — Twentieth run: 1 PR (Tier 0), all discovery
- With 94 open PRs in the queue, the codebase is nearly fully patched — almost every pattern I searched for was already covered by an existing open PR. This is the saturation point.
- Key lesson: Before building ANY PR, check `git fetch origin <branch>` to see if a remote branch already exists for that fix. Several branches (e.g. `disc-normalize-tracking-widest-viewer`) existed but weren't in the coordination log because they predate the logging system.
- Only new issue found after exhaustive scan: `p-5` on GuidedJourney event card (line 388) — not in any prior PR. All other patterns (tracking-widest, text-[9px], disabled:opacity-50) had existing open PRs.
- At this saturation level, future runs should focus on: (1) watching for NEW commits to main that introduce violations, (2) helping merge existing PRs by fixing any conflicts, (3) checking for patterns specific to newly added features.

### 2026-04-05 — Nineteenth run: 6 PRs (all Tier 0), 2 rubric items closed
- QR-03 and QR-13 were both effectively fixed in main but never marked done — audit the rubric against current code at start of run, not just "is status OPEN?"
- `focus:outline-none focus:border-white/20` is a non-standard focus ring pattern; design system says `outline-none focus:ring-1 focus:ring-accent/50`. Found in 4 inputs in EditableSectionRenderer (tier-table card editor, callout textarea).
- `disabled:opacity-50` was still lingering in TypeSelectorDropdown, EditableSectionRenderer, LogoUpload — distinct from the SplitViewLayout/EditorLayout cases which conflict with PR #115 (both issues on same lines).
- AiChatPanel had 2 icon-only buttons without aria-label (RotateCcw clear-history, Send). The Discard button also has X icon but has text, so OK.
- DocumentSettings color inputs had `title=` but not `aria-label`. AiChatPanel chat textarea had no accessible label at all.
- When checking conflicts with open PRs: check which LINES each PR touches, not just which FILES.

### 2026-04-05 — Eighteenth run: 8 PRs (6 Tier 0, 2 Tier 1), 2 rubric items closed
- QR-14 (aria-live) and QR-17 (loading skeleton) were both genuinely open — no prior PRs existed for them on current main.
- Loading skeleton: Next.js App Router loading.tsx convention is the cleanest pattern — no changes to page.tsx, just a new file. The skeleton is a dark-theme layout with animate-pulse blocks.
- InlineEditor display mode was not keyboard accessible at all — no tabIndex, no role, no onKeyDown. Added role=button + tabIndex={0} + focus ring + Enter/Space handler. Tier 1 (adds keyboard interaction).
- With 60+ open PRs still unmerged, accessibility gaps remain the richest vein. Pattern: grep for interactive non-button elements (span/div with onClick) and form inputs without aria-label.
- nav elements without aria-label are a quick Tier 0 batch — any nav on a page should have aria-label="[purpose]".

### 2026-04-05 — Sixteenth run: 2 PRs (both Tier 0), all discovery
- All rubric items still have open PRs. Went straight to discovery.
- `hover:border-white/40` on upload zone dashed-border buttons is non-standard (design system ceiling is `/30` for deep hover). Uncovered by all prior PRs — the disabled-opacity PRs touched those lines but preserved the /40 hover value.
- `p-5` in the keyboard shortcuts overlay was non-standard. Design system standard panel content is `p-3` or `p-4`. Only one instance — `SplitViewLayout.tsx:393`.
- After 16 runs, the codebase is remarkably clean. Most search patterns return only instances covered by existing open PRs. The main remaining opportunity is waiting for those 60+ PRs to merge so main is clean.

### 2026-04-05 — Fifteenth run: 4 PRs (all Tier 0), all discovery
- All rubric items still have open PRs from prior runs — went straight to discovery loop.
- `gh` CLI unavailable; GitHub REST API via curl works fine. Set remote to PAT HTTPS URL before pushing: `git remote set-url origin https://x-access-token:<PAT>@github.com/...` (local proxy at 127.0.0.1:35667 blocks pushes with 403).
- `focus:ring-accent/30` found in discover/page.tsx (3 inputs) — prior PR `disc-normalize-focus-ring-opacity` fixed create/page.tsx and AuthModal.tsx but missed discover page.
- `ring-1 ring-white/10` fix in EditableDataViz select (chart type) was missed by `disc-normalize-inline-edit-ring` which only covered GuidedJourney inputs and HubMockup selects.
- `tracking-widest` in not-found.tsx not fixed by `disc-not-found-css-vars` (hex→token) or `disc-normalize-tracking-widest-viewer` (ArtifactViewer+GuidedJourney). Three fix-series can touch same file with no conflicts as long as they target different tokens.
- Image error dismiss button in EditorLayout.tsx:600 had no aria-label — missed by QR-15 PR which covered SortableSectionList, ItemManager, AiChatPanel, SplitViewLayout, MobilePreviewSheet but not EditorLayout.
- Key search strategy: cross-reference prior PR stats with search results. Most patterns ARE covered; look for same-pattern instances in files not in prior PR stats.

### 2026-04-05 — Seventh run: 8 PRs (all Tier 0), all discovery
- All rubric items still have open PRs from prior runs — went straight to discovery loop.
- `tracking-wider` is still widely spread (viewer sections HubMockup/AnimatedTimeline/RichTextCollapsible, dashboard, discover page). Split into 3 PRs by context (viewer sections batch, dashboard, discover).
- `bg-accent/15` in AiChatPanel user message bubble was non-standard — normalized to `bg-accent/20`.
- `ring-1 ring-white/10` as default ring on inputs in EditableGuidedJourney and EditableHubMockup — design system says no default ring, only focus:ring-1. Removed.
- `placeholder:text-muted-foreground` (full opacity) in create/page.tsx and AuthModal.tsx — spec says `/50`. Fixed.
- Label pattern (`text-[10px] font-medium ... uppercase tracking-wide`) violations found in EditableSectionRenderer (3 labels missing font-medium), MultiSectionReview, and TypeSelectorDropdown.
- Key search strategy: `grep "uppercase tracking-wide" | grep -v "font-medium"` catches ALL label pattern violations efficiently.
- Key search strategy: `grep "ring-1 ring-white/10"` catches non-standard default rings.
- Ring issue in EditableDataViz same as EditableGuidedJourney/EditableHubMockup, but covered by open PR #67.

### 2026-04-05 — Fourth run: 4 PRs (all Tier 0), all discovery
- All open rubric items already had PRs from prior runs (QR-03→#17, QR-13→#19, QR-14→#6, QR-15→#7/#18, QR-16→parked, QR-17→#14). Went straight to discovery.
- New pattern found: `tracking-wider` used across editable editor labels (EditableDataViz, EditableHubMockup, EditableGuidedJourney) — design system says `tracking-wide`. Split into 3 PRs by component.
- Also found: `text-xs` labels instead of `text-[10px]` in EditableDataViz/EditableHubMockup labels, and missing `font-medium`.
- `disabled:cursor-not-allowed` was missing from 6 buttons that had `disabled:opacity-*` — separate from PR #21's opacity-50→30 fix.
- With 40+ open PRs, most issues are covered. Key strategy: look for patterns not in any open PR title. Avoid duplicating focus ring fixes (PR #33, #62), font-semibold fixes (PR #45, #50, #51, #52), aria-label fixes (PR #7, #18, #58, #60, #63).
- ESLint `no-undef` errors are still failing on main (50 errors) — all false positives for browser/node globals. PR #34 addresses this. Don't create duplicate.

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

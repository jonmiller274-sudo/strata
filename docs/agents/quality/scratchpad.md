# Quality Agent Scratchpad

Persistent memory for the Quality Engineer agent. Append new lessons at the top. Format: date + lesson + example.

## Current Focus

Working through Tier 1 items in `docs/quality-rubric.md`. Next unblocked item after each merge.

## What I Learned

*(Patterns that worked. Append newest at top.)*

### 2026-04-05 — Thirteenth run: 4 PRs (all Tier 0), all discovery
- All rubric items still have open PRs from prior runs — went straight to discovery.
- After 12 runs, most obvious patterns are claimed. Key strategy: look for SEMANTIC token violations (text-red-400 → text-danger, inline success color → text-success class) rather than visual patterns.
- Found 7 instances of `hover:text-red-400` in editor (not error pills) that should use `hover:text-danger`. Error pills keep `text-red-400` per QR-03 spec — don't touch those.
- `SectionPreviewPanel.tsx` had unused `React` default import — `memo`, `useRef`, `useEffect` imported by name directly, no `React.` usage.
- `TierTable.tsx` ComparisonColumn had `style={{ color: "var(--color-success, #10b981)" }}` on Check icon — the PricingColumn at the bottom of the same file already used `text-success`. Wrong fallback hex (#10b981 ≠ #34d399).
- `RichTextCollapsible.tsx` toggle button was missing `aria-expanded` — visible text changes but screen readers benefit from the explicit attribute. Not covered by PR #85 (covers ExpandableCardGrid).
- With 65 open PRs, very important to check each pattern against existing PR titles before creating new ones. The parallel agent runs have covered most obvious issues.

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

# PR Triage Report — 2026-04-06

**Context:** The Phase 1 Quality Agent created 143 PRs in 24 hours. 103 remain open. The agent had systemic issues: duplicate work, unbounded discovery, self-patching tier-2 defects via tier-0, and wrong interface param renames. The agent is now PAUSED.

---

## Summary

| Category | Count | % |
|----------|-------|---|
| **CLOSE** | 61 | 59% |
| **MERGE** | 28 | 27% |
| **HOLD** | 14 | 14% |
| **Total** | 103 | 100% |

---

## CLOSE (61 PRs)

### Run Logs (15 PRs) — All CLOSE
These are agent bookkeeping PRs that append to coordination-log.md and scratchpad.md. They conflict with each other (all append to the same files), provide no product value, and will create merge conflicts if any are merged. Close them all and optionally preserve the logs manually if wanted.

| PR | Title | Reason |
|----|-------|--------|
| #153 | Quality agent run log — twenty-first run | Agent bookkeeping, conflicts with other log PRs |
| #145 | Quality agent run log — twentieth run | Agent bookkeeping, conflicts with other log PRs |
| #126 | Quality agent run log — seventeenth run | Agent bookkeeping, conflicts with other log PRs |
| #109 | Quality agent run log — fourteenth run | Agent bookkeeping, conflicts with other log PRs |
| #107 | Quality agent run log — thirteenth run | Agent bookkeeping, conflicts with other log PRs |
| #102 | Quality agent run log — ninth run (3 PRs) | Agent bookkeeping, conflicts with other log PRs |
| #98 | Quality agent run log — twelfth run | Agent bookkeeping, conflicts with other log PRs |
| #96 | Quality agent run log — eleventh run | Agent bookkeeping, conflicts with other log PRs |
| #92 | Quality agent run log — tenth run | Agent bookkeeping, conflicts with other log PRs |
| #90 | Quality agent run log — ninth run (2 PRs) | Agent bookkeeping, conflicts with other log PRs |
| #87 | Quality agent run log — eighth run | Agent bookkeeping, conflicts with other log PRs |
| #66 | Quality agent run log — fifth run | Agent bookkeeping, conflicts with other log PRs |
| #59 | Quality agent run log — fourth run | Agent bookkeeping, conflicts with other log PRs |
| #23 | Quality agent run log — 2026-04-04 | Agent bookkeeping, conflicts with other log PRs |
| #16 | Quality agent run log 2026-04-05 (Tier-0) | Agent bookkeeping, conflicts with other log PRs |

### Interface Param Renames (8 PRs) — All CLOSE
Known bad pattern. Renaming callback params to `_`-prefix in interface/prop type definitions is a cosmetic change that touches critical component APIs, risks breaking things, and provides no runtime benefit.

| PR | Title | Reason |
|----|-------|--------|
| #119 | Rename onSelect callback param from index to _index in TimelineTrack | Interface param rename — known bad pattern |
| #86 | Rename unused prop interface params to _-prefix in AiChatPanel | Interface param rename — known bad pattern |
| #49 | Rename unused callback params to _-prefix in EditableSectionRenderer | Interface param rename — known bad pattern |
| #39 | Rename unused callback params to _-prefix across 8 editor components | Interface param rename — 8 files, high risk |
| #38 | Rename path/value/field params to _-prefix in Editable components | Interface param rename — 4 files, high risk |
| #36 | Rename unused callback parameter names in dashboard/GuidedJourney | Interface param rename — known bad pattern |
| #46 | Remove unused import + rename url param in LogoUpload | Mixed PR — includes param rename |
| #47 | Remove unused imports + rename param in TypeSelectorDropdown | Mixed PR — includes param rename |

### Duplicates — Superseded by Later PRs (8 PRs) — All CLOSE

| PR | Title | Reason |
|----|-------|--------|
| #14 | Add loading skeleton to artifact page | Superseded by #129 (v2, more complete). Also has CONFLICTING merge status |
| #6 | Add aria-live regions to save status, chat messages, and error containers | Superseded by #128 (v2, covers 8 files vs 3) |
| #7 | Add aria-label to all icon-only editor buttons | Superseded by #18 (same scope, nearly identical) |
| #17 | Mark QR-03 done in quality rubric | Superseded by #139 (closes both QR-03 and QR-13) |
| #19 | Fix type selector error toast visibility (QR-13) | Superseded by #139 (rubric close-out). Also has CONFLICTING merge status |
| #20 | Normalize text-[9px] to text-[10px] in GuidedJourney viewer | Duplicate of #93 (same file, same change) |
| #33 | Fix input focus ring to accent/50 in EditableSectionRenderer | Duplicate of #137 (same file, same change) |
| #64 | Replace inline styles in ProgressBarNav mobile pill | Overlaps with #101 (same file, ProgressBarNav inline styles) |

### Marginal / Bikeshedding Normalizations (22 PRs) — All CLOSE
These are opinionated normalizations (tracking-wider vs tracking-wide, opacity-50 vs opacity-30, font-semibold vs font-bold, focus ring tweaks) that represent subjective design-token preferences, not actual bugs or improvements. Many touch viewer components that affect the live product appearance. Not worth the risk.

| PR | Title | Reason |
|----|-------|--------|
| #72 | Normalize tracking-wider to tracking-wide in viewer sections | Subjective — may change intended design |
| #74 | Normalize tracking-wider to tracking-wide in discover page | Subjective — may change intended design |
| #73 | Normalize tracking-wider to tracking-wide in dashboard | Subjective — may change intended design |
| #82 | Normalize tracking-widest to tracking-wide in viewer | Subjective — may change intended design |
| #93 | Normalize text-[9px] to text-[10px] in GuidedJourney | Subjective — may change intended design |
| #144 | Normalize p-5 to p-4 in GuidedJourney event card | Subjective — changes spacing, may break layout |
| #83 | Normalize placeholder opacity to /50 in discover page | Marginal visual change |
| #77 | Normalize placeholder opacity to /50 in create page/auth | Marginal visual change |
| #75 | Normalize bg-accent/15 to bg-accent/20 in AiChatPanel | Marginal visual change |
| #81 | Normalize fractional white opacity values | Marginal visual change, 2 files |
| #61 | Normalize loading opacity from 50 to 30 in AuthModal | Marginal visual change |
| #115 | Normalize hover:border-white/40 to hover:border-white/30 | Marginal visual change, 3 files |
| #57 | Normalize font-semibold to font-bold in discover headings | Subjective — may change intended design |
| #94 | Normalize label pattern in EditableHubMockup | Marginal — single label text change |
| #91 | Add font-medium to DocumentSettings toggle buttons | Overlaps with #84 (same file, font-medium changes) |
| #84 | Add font-medium to 4 section labels in DocumentSettings | Overlaps with #91 (same file, font-medium changes) |
| #108 | Normalize off-palette blue badge tokens in EditableSectionRenderer | Marginal — single token swap |
| #62 | Normalize focus ring opacity to accent/50 in form inputs | Marginal focus ring tweak, 2 files |
| #76 | Remove non-standard default ring from inline edit inputs | Marginal ring normalization, 2 files |
| #88 | Remove non-standard default ring from chart type select | Marginal ring normalization |
| #110 | Normalize focus ring opacity in discover page inputs | Marginal focus ring tweak |
| #137 | Normalize focus ring on inline inputs in EditableSectionRenderer | Duplicate of #33 pattern, marginal |

### Quality Rubric Updates Only (1 PR) — CLOSE

| PR | Title | Reason |
|----|-------|--------|
| #139 | Close out QR-03 and QR-13 in quality rubric | Docs-only — only touches quality-rubric.md. Rubric changes are moot with agent paused. Only merge if you want to keep rubric accurate. |

### Overlapping / Risky (7 PRs) — CLOSE

| PR | Title | Reason |
|----|-------|--------|
| #50 | Normalize font-semibold in viewer components | 10 files, 21 changes — too large, subjective design choices |
| #45 | Normalize font-semibold in editor components | 4 files — companion to #50, same concern |
| #21 | Normalize disabled:opacity-50 to opacity-30 in editor buttons | 5 files — changes disabled state appearance, needs design review |
| #147 | Normalize disabled opacity in GuidedJourney viewer | Same pattern as #21, viewer side |
| #67 | Normalize label typography and input focus ring in EditableDataViz | Mixed concern — bundles typography + focus ring changes |
| #34 | Add missing browser/node globals to ESLint config | 4 files, adds 16 lines to eslint config — needs careful review, may mask real issues |
| #18 | Add aria-label to all icon-only buttons in editor | Superseded by granular per-component aria PRs (#140, #133, #113, etc.) |

---

## MERGE (28 PRs)

These are clean, small, single-concern improvements that are safe wins. Each touches 1-4 files with minimal changes and addresses a real issue (accessibility, dead code, design tokens, inline styles).

### Accessibility — aria-hidden on decorative elements (5 PRs)

| PR | Title | Files | Size |
|----|-------|-------|------|
| #149 | Add aria-hidden to mobile navigation overlay in SidebarNav | 1 | +1/-0 |
| #150 | Add aria-hidden to overlay backdrops in MobilePreviewSheet/SplitViewLayout | 2 | +3/-0 |
| #151 | Add aria-hidden to shimmer animation divs in EditorLayout | 1 | +3/-3 |
| #152 | Add aria-hidden to modal backdrops and upload preview backgrounds | 3 | +4/-0 |
| #63 | Add aria-hidden to decorative SVGs in editor and viewer | 3 | +3/-3 |

### Accessibility — aria-label on unlabeled interactive elements (7 PRs)

| PR | Title | Files | Size |
|----|-------|-------|------|
| #60 | Add aria-label to icon-only close buttons in auth modals | 2 | +2/-0 |
| #113 | Add aria-label to image error dismiss button in EditorLayout | 1 | +1/-1 |
| #127 | Add aria-label to form inputs in discover page waitlist form | 1 | +3/-0 |
| #130 | Add aria-label to email input in AuthModal | 1 | +1/-0 |
| #132 | Add aria-label to select elements in editor (chart type, phase) | 2 | +2/-0 |
| #133 | Add aria-label to close button in MobilePreviewSheet | 1 | +1/-0 |
| #140 | Add aria-label to 2 icon-only buttons in AiChatPanel | 1 | +2/-0 |

### Accessibility — aria-expanded / aria-pressed (5 PRs)

| PR | Title | Files | Size |
|----|-------|-------|------|
| #106 | Add aria-expanded to RichTextCollapsible button | 1 | +1/-0 |
| #120 | Add aria-expanded to CollapsiblePanel in EditableGuidedJourney | 1 | +1/-0 |
| #121 | Add aria-expanded to TypeSelectorDropdown trigger | 1 | +1/-0 |
| #122 | Add aria-expanded to mobile nav toggle in SidebarNav | 1 | +1/-0 |
| #124 | Add aria-pressed to publish toggle in TopBar | 1 | +1/-0 |

### Dead Code / Cleanup (7 PRs)

| PR | Title | Files | Size |
|----|-------|-------|------|
| #40 | Remove debug console.log from waitlist catch block | 1 | +0/-1 |
| #97 | Remove stale @next/next/no-img-element eslint-disable comments | 2 | +0/-2 |
| #103 | Remove unused React default import from SectionPreviewPanel | 1 | +1/-1 |
| #118 | Remove dead container variable in ArtifactViewer | 1 | +0/-2 |
| #22 | Remove unused imports across 3 files | 3 | +3/-4 |
| #35 | Fix unused variable warnings in hooks (useAiChat, useAutoSave, useEditor) | 3 | +3/-3 |
| #37 | Fix unused variable warnings in AddSection components and vision API route | 4 | +5/-16 |

### Design Token Fixes — Replacing raw hex/inline (4 PRs)

| PR | Title | Files | Size |
|----|-------|-------|------|
| #44 | Replace raw hex bg-[#12141d]/90 with bg-surface/90 in mobile nav pill | 1 | +1/-1 |
| #95 | Replace raw hex #1e2538 with CSS variable in ProgressBarNav dot | 1 | +1/-1 |
| #99 | Normalize text-green-400 to text-success in AiChatPanel | 1 | +1/-1 |
| #100 | Replace scrollSnapAlign inline style with snap-end utility in StrataFooter | 1 | +1/-2 |

---

## HOLD (14 PRs)

These are potentially valuable but need Jon's review or carry some risk. Each has a specific question or concern noted.

| PR | Title | Files | Size | Why Hold |
|----|-------|-------|------|----------|
| #129 | Add loading skeleton to artifact page (QR-17, v2) | 2 | +85/-6 | **Valuable feature** (prevents blank flash on hard refresh). But 83 lines of new skeleton UI in loading.tsx — Jon should review the visual design before merging |
| #128 | Add aria-live regions to save/chat/errors (QR-14, v2) | 8 | +10/-14 | **Valuable a11y feature** (screen readers announce save status, errors). But touches 8 files — Jon should verify no regressions |
| #85 | Add keyboard support + aria-expanded to expandable cards | 1 | +9/-0 | **Valuable a11y feature** (cards navigable by keyboard). But adds onKeyDown handlers — needs testing |
| #125 | Add aria-pressed to DocumentSettings toggle groups | 1 | +3/-0 | Good a11y, but verify it works correctly with existing toggle state |
| #131 | Associate label elements with inputs via htmlFor/id in create page | 1 | +4/-2 | Good a11y, but adds id attributes — verify no CSS/JS depends on id absence |
| #135 | Add aria-label to nav elements in discover/SidebarNav | 2 | +2/-2 | Replaces existing aria-labels — verify the new labels are correct |
| #148 | Add aria-label to feature toggle/remove buttons in TierTable editor | 1 | +2/-0 | Good but touches TierTable editor — verify button behavior unchanged |
| #43 | Replace raw hex colors with CSS vars in not-found.tsx | 1 | +5/-5 | Good cleanup, but verify the CSS vars exist and resolve correctly |
| #89 | Replace inline styles with Tailwind on section image in SectionRenderer | 1 | +5/-11 | Replaces 11 lines of inline styles — verify image rendering unchanged |
| #65 | Replace inline styles with Tailwind in ArtifactViewer | 1 | +7/-17 | Replaces 17 lines of inline styles — verify scroll/positioning unchanged |
| #101 | Replace inline styles with Tailwind in ProgressBarNav share button | 1 | +3/-18 | Removes 18 lines of inline styles — verify share button appearance |
| #105 | Normalize hover:text-red-400 to hover:text-danger in editor | 5 | +7/-7 | Design token fix, but touches 5 files — verify text-danger class exists |
| #104 | Replace inline success color with text-success in TierTable | 1 | +1/-2 | Design token fix — verify text-success matches the original green |
| #58 | Add aria-label to color pickers and connection selects | 3 | +6/-0 | Good a11y but touches 3 editor components — verify labels are accurate |

---

## Duplicate Clusters

### Cluster 1: GuidedJourney.tsx (7 PRs touch this file)
- #20 (text-9px normalize) -- CLOSE, duplicate of #93
- #93 (text-9px normalize) -- CLOSE, marginal
- #36 (param rename) -- CLOSE, bad pattern
- #119 (param rename) -- CLOSE, bad pattern
- #144 (p-5 to p-4) -- CLOSE, marginal
- #147 (disabled opacity) -- CLOSE, marginal
- #82 (tracking-widest) -- CLOSE, marginal
**Recommendation:** Close all 7. None are worth the risk.

### Cluster 2: AiChatPanel.tsx (7 PRs touch this file)
- #86 (param rename) -- CLOSE, bad pattern
- #47 (unused imports + param rename) -- CLOSE, mixed with bad pattern
- #140 (aria-label) -- MERGE
- #99 (text-success) -- MERGE
- #75 (accent opacity) -- CLOSE, marginal
- #22 (unused imports) -- MERGE (but overlaps with #47)
- #128 (aria-live v2) -- HOLD
**Recommendation:** Merge #140 and #99 first (no overlap). Then #22. Then review #128.

### Cluster 3: EditableSectionRenderer.tsx (6 PRs touch this file)
- #49 (param rename) -- CLOSE, bad pattern
- #33 (focus ring) -- CLOSE, duplicate of #137
- #137 (focus ring) -- CLOSE, marginal normalization
- #108 (badge token) -- CLOSE, marginal
- #148 (aria-label) -- HOLD
- #105 (text-danger) -- HOLD
**Recommendation:** Close 4, hold 2 for review.

### Cluster 3b: Focus Ring Normalization (5 PRs, all CLOSE)
- #33 (EditableSectionRenderer focus ring) -- CLOSE, duplicate of #137
- #137 (EditableSectionRenderer focus ring) -- CLOSE, marginal
- #62 (create page + AuthModal focus ring) -- CLOSE, marginal
- #110 (discover page focus ring) -- CLOSE, marginal
- #67 (EditableDataViz label + focus ring) -- CLOSE, mixed concern
These are all variations of "change focus ring opacity to accent/50" scattered across different files. If this normalization is desired, it should be done in one PR touching all files.

### Cluster 4: DocumentSettings.tsx (5 PRs touch this file)
- #38 (param rename) -- CLOSE, bad pattern
- #58 (aria-label color pickers) -- HOLD, also touches EditableGuidedJourney + EditableHubMockup
- #84 (font-medium labels) -- CLOSE, overlaps with #91
- #91 (font-medium buttons) -- CLOSE, overlaps with #84
- #125 (aria-pressed) -- HOLD
**Recommendation:** Close 3, hold 2.

### Cluster 5: EditorLayout.tsx (6 PRs touch this file)
- #151 (aria-hidden shimmer) -- MERGE
- #152 (aria-hidden modal backdrops) -- MERGE
- #115 (border opacity) -- CLOSE, marginal
- #7 (aria-label buttons) -- CLOSE, superseded
- #18 (aria-label buttons) -- CLOSE, superseded by granular PRs
- #128 (aria-live) -- HOLD
**Recommendation:** Merge #151 and #152 (different elements), close 3, hold 1.

### Cluster 6: ProgressBarNav.tsx (3 PRs touch this file)
- #64 (inline styles mobile pill) -- CLOSE, overlaps with #101
- #95 (raw hex dot) -- MERGE
- #101 (inline styles share button) -- HOLD
**Recommendation:** Merge #95 first, then review #101.

### Cluster 7: quality-rubric.md (7 PRs touch this file)
- #6, #7, #14, #17, #18, #128, #129, #139
All modify the quality rubric doc. #128 and #129 are the v2 replacements. #139 closes QR items.
**Recommendation:** If merging #128 or #129, do them one at a time and resolve rubric conflicts manually.

### Cluster 8: SidebarNav.tsx (4 PRs touch this file)
- #149 (aria-hidden overlay) -- MERGE
- #122 (aria-expanded toggle) -- MERGE
- #135 (aria-label nav) -- HOLD
- #97 (remove eslint-disable) -- MERGE
**Recommendation:** Merge #149, #122, and #97 (no overlap). Review #135.

---

## Recommended Merge Order

If Jon approves, merge in this order to minimize conflicts:

**Wave 1 — Dead code / cleanup (7 PRs, zero-risk):**
#40, #97, #103, #118, #22, #35, #37

**Wave 2 — aria-hidden on decorative elements (5 PRs, additive only):**
#149, #150, #151, #152, #63

**Wave 3 — aria-label on unlabeled elements (7 PRs, additive only):**
#60, #113, #127, #130, #132, #133, #140

**Wave 4 — aria-expanded / aria-pressed (5 PRs, additive only):**
#106, #120, #121, #122, #124

**Wave 5 — Design token fixes (4 PRs, simple replacements):**
#44, #95, #99, #100

**Then review HOLD PRs individually.**

---

## Key Takeaways

1. **59% should be closed (61 of 103)** — The agent created a lot of duplicate, marginal, and risky work. The param rename pattern alone accounts for 8 wasted PRs, and subjective normalizations account for 22 more.

2. **27% are safe wins (28 of 103)** — Mostly small accessibility improvements (aria-hidden, aria-label, aria-expanded), dead code removal, and clean design-token replacements. These are the kind of changes the agent should have focused on exclusively.

3. **The agent's biggest failure mode was "normalization"** — Changing opacity-50 to opacity-30, tracking-wider to tracking-wide, font-semibold to font-bold, focus ring opacity tweaks. These are subjective design decisions, not quality issues. A quality agent should not be making design decisions. 22 of 61 CLOSE PRs are this category alone.

4. **Run logs are pure overhead** — 15 PRs (15% of total) are just the agent logging its own activity. This should have been done in a single file update, not per-run PRs.

5. **Duplicate detection was absent** — Multiple PRs touch the same file with the same or overlapping changes. The agent had no memory of what it already submitted. 8 PRs are direct duplicates of other PRs.

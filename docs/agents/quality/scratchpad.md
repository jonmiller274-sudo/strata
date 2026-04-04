# Quality Agent Scratchpad

Persistent memory for the Quality Engineer agent. Append new lessons at the top. Format: date + lesson + example.

## Current Focus

Working through Tier 1 items in `docs/quality-rubric.md`. Next unblocked item after each merge.

## What I Learned

*(Patterns that worked. Append newest at top.)*

### 2026-04-04 — Run 2
- Rubric OPEN items addressed: QR-03 (close-out, already compliant), QR-04 (green buttons), QR-14 (aria-live), QR-15 (aria-labels), QR-13 (error toast z-index), QR-17 (loading.tsx skeleton). All build-passing.
- Discovery found 3 off-rubric fixes: text-[9px] in GuidedJourney viewer, disabled:opacity-50 in 5 editor buttons, unused imports in 3 files.
- Lesson: many PRs from prior runs already exist on branches; always check before creating. Use `gh api pulls?head=branch` to find existing PRs.

### 2026-04-04 — Seeded
No lessons yet. First few PRs will populate this section.

## Traps to Avoid

*(Things that wasted time or caused regressions. Append newest at top.)*

### 2026-04-04 — Seeded
No traps logged yet.

---

*Rule: append new lessons at the top of each section. Format: `### YYYY-MM-DD — short title` followed by 1-3 lines with a concrete example (file, component, or commit).*

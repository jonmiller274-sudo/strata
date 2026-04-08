# Strata Autonomous Studio — Agent PR Guide

## How Tiers Work

Every PR must have exactly one tier label. The tier determines the merge path.

| Label | What it covers | Merge behavior |
|-------|---------------|----------------|
| `tier-0` | Tokens only: typos, text sizes, border opacity, spacing, ARIA labels, unused imports, lint fixes | **Auto-merges instantly** after CI passes |
| `tier-1` | Visual polish: component unification, loading/empty/error states, animations, color consistency, hover states | **Auto-merges after 15 min** if CI passes and no veto |
| `tier-2` | Copy, user flows, new interactions, opinionated UX changes | **Held for Jon's review** — does not auto-merge |
| `tier-3` | Architecture, data models, new features, structural redesigns | **Held for planning session** — does not auto-merge |

The `tier-enforcement` check will fail if a PR has no tier label or more than one.

---

## How to Veto Auto-Merge

Two ways to block an auto-merge on a tier-0 or tier-1 PR:

1. **Add the `veto` label** to the PR
2. **Post a comment** containing the word `veto` (case-insensitive)

The auto-merge workflow re-checks for vetoes immediately before merging. Removing the veto label or comment will allow the next CI check to trigger auto-merge again.

---

## How to Prevent Auto-Merge Entirely

Add the `do-not-merge` label to the PR. This is a GitHub-native signal that most merge tooling (including `gh pr merge --auto`) respects.

Alternatively, convert the PR to a **Draft** — auto-merge workflows skip draft PRs.

---

## Manual Override

Jon can manually merge any PR at any time from the GitHub UI or via:

```bash
gh pr merge <number> --squash
```

Auto-merge is opt-in per PR via labels — it never overrides an explicit manual action.

---

## Quality Rubric

See [docs/quality-rubric.md](../docs/quality-rubric.md) for the rubric used by agents when classifying tier level.

---

## Agent-Specific Labels

| Label | Source | Behavior |
|-------|--------|---------|
| `discovery` | Discovery agent | Adds rubric items — does not auto-merge |
| `digest` | Director agent | Daily summary PR — auto-merges after CI (treat as tier-0) |
| `pm-briefing` | PM Agent | Evening briefing files — auto-merges after CI (treat as tier-0) |
| `competitive-research` | Competitive Researcher | Snapshots + state files — auto-merges after CI (treat as tier-0) |
| `usability-test` | Usability Tester | Findings filed as Issues, not PRs |

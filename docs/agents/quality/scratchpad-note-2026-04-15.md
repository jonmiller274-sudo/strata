# Quality Engineer Issue — Missing Tier Labels (2026-04-15)

The Quality Engineer's first scheduled run produced 2 high-quality PRs (#193, #194) but **did not add tier labels** despite the prompt explicitly requiring `--label tier-{N}` in the `gh pr create` command.

This means auto-merge won't process the PRs. Jon had to manually add labels.

## Fix for next run

The prompt at `docs/agents/quality-engineer-prompt.md` Step 7 already says:
```
--label tier-{N}
```

The agent needs to be reminded more forcefully. Consider adding to the HARD RULES section:
```
CRITICAL: Every PR you create MUST have a tier label (tier-0, tier-1, or tier-2).
Without this label, auto-merge cannot process the PR and it will sit in the queue
indefinitely. Check after creating the PR: `gh pr view --json labels`
```

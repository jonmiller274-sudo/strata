# Agents Directory

Home for all autonomous agent state. Every file here is human-readable markdown so Jon can inspect, edit, or hand-correct anything an agent writes.

## Purpose

The Strata Autonomous Studio runs three scheduled agents that read and write files in this directory. The files in here are the agents' shared memory, coordination log, and audit trail. If an agent misbehaves, everything it did is visible here.

## Agents and their files

- **Quality Engineer** (`quality/`) — Picks the highest-priority item from `docs/quality-rubric.md`, fixes it, opens a PR.
  - `quality/scratchpad.md` — persistent lessons, traps, current focus
  - `quality/history.md` — log of every PR produced
- **Discovery** (`discovery/`) — Runs visual/UX audits on the deployed app, files new rubric items when it finds regressions.
  - `discovery/scratchpad.md` — which audit modes have run recently, rotation notes
  - `discovery/audit-history.md` — log of audit runs and findings
- **Director** (`director/`) — Reads coordination log + open PRs every morning at 7am ET, generates a daily digest.
  - `director/scratchpad.md` — patterns noticed across digests
  - `director/digests-index.md` — table of contents for daily digests in `docs/digest/`

## How to read the coordination log

`coordination-log.md` is the shared audit trail. Every agent appends a one-line entry after each run. Newest entries at the top of each day's section. Format:

```
## YYYY-MM-DD

- HH:MM | agent-name | one-line summary (PR #, tier, status)
```

Read it top-to-bottom when you want to know "what happened today." Don't edit it by hand — it's an append-only log.

## How to update agent scratchpads

Scratchpads are editable by humans and agents. When you want to correct an agent or seed a new lesson, just open the scratchpad and append a dated entry at the top. Format:

```
### 2026-04-05 — short description
Lesson / rule / example.
```

Keep entries terse. Scratchpads grow over time — prune anything older than ~60 days if they get long.

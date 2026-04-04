# Agent Coordination Log

Shared append-only audit trail for all autonomous agents (Quality, Discovery, Director). Every agent appends a one-line entry after each run. Newest entries at the top of each day's section.

Format:
```
## YYYY-MM-DD

- HH:MM | agent-name | one-line summary (PR #, tier, status)
```

Read this top-to-bottom when you want to know "what happened today." Do not edit by hand — it's append-only.

---

## 2026-04-05

- 07:00 | director | Generated first daily digest → `docs/digest/2026-04-05.md` (2 merged, 1 open review, 1 Tier 3 planning item, 0 reverts)

## 2026-04-04

- 19:36 | quality | PR #2 | QR-02 | tier-1 | merged | Fixed upload drop zone border to match design system default
- 18:02 | quality | PR #1 | QR-01 | tier-1 | merged | Normalized text sizes to design system tokens across editor

---

*Rule: append newest entries at the top of each day's section. Start a new dated section when the date rolls over in America/New_York.*

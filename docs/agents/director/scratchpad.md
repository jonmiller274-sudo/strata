# Director Agent Scratchpad

Persistent memory for the Director agent. The Director runs every morning at 7am America/New_York, reads the coordination log + open PRs, and generates the daily digest. It uses this scratchpad to remember patterns it noticed across multiple digests.

## Current Focus

First week of autonomous operation. Baseline what "normal" looks like (PRs per day, Tier 1/2/3 mix, agent failure rate) so future anomalies are detectable.

## Patterns Noticed

*(Trends observed across 3+ digests. Append newest at top. When a pattern is strong enough to turn into a rule, promote it to `docs/patterns.md`.)*

### 2026-04-04 — Seeded
No patterns yet. Needs at least a week of digests before trends emerge.

## Baseline Metrics

*(Updated weekly. Used to detect anomalies in daily digest.)*

- **Avg PRs merged per day:** TBD (need 7 days of data)
- **Avg Tier 3 items filed per week:** TBD
- **Common failure modes:** TBD

## Open Questions for Jon

*(Things the Director wants clarified but don't block daily operation. Append newest at top.)*

### 2026-04-04 — Seeded
None yet.

---

*Rule: scan the last 7 digests before writing each new one. If the same observation shows up 3+ times, write it down here. When something crystallizes into a reusable rule, move it to `docs/patterns.md`.*

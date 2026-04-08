# Strata Autonomous Studio — Master Blueprint

Home for all autonomous agent state. Every file here is human-readable markdown so Jon can inspect, edit, or hand-correct anything an agent writes.

---

## Agent Registry

Six agents operate autonomously. Each has a prompt, scratchpad, and history file.

| Agent | Purpose | Schedule | Time (ET) | Status |
|-------|---------|----------|-----------|--------|
| **Quality Engineer** | Picks highest-priority QR item, fixes it, opens a PR | Every 2h | :00/:30 | PAUSED |
| **Discovery** | Audits deployed app, files new QR items (never fixes) | Every 2h | :15 | PAUSED |
| **Director** | Morning digest summarizing agent activity | Daily | 7:00 AM | Active |
| **Usability Tester** | Playwright scenarios against prod, files findings as Issues | Daily | 6:00 AM | Active |
| **Competitive Researcher** | Self-audit vs feature matrix (weekly) + competitor monitoring (monthly) | Mon + 1st | 8:00/9:00 AM | Building |
| **PM Agent** | Evening briefing synthesizing all agent output | Daily | 6:00 PM | Building |

### Agent File Locations

| Agent | Prompt | State Directory | Workflow |
|-------|--------|-----------------|----------|
| Quality Engineer | `CLAUDE.md` (inline) | `docs/agents/quality/` | Cloud trigger (paused) |
| Discovery | `docs/agents/discovery-prompt.md` | `docs/agents/discovery/` | Cloud trigger (paused) |
| Director | `docs/agents/director-prompt.md` | `docs/agents/director/` | Cloud trigger |
| Usability Tester | `docs/plans/usability-tester-implementation-plan.md` | `tests/usability/` | `.github/workflows/usability-test.yml` |
| Competitive Researcher | `docs/agents/competitive-researcher-prompt.md` | `docs/agents/competitive-researcher/` | `.github/workflows/competitive-research.yml` |
| PM Agent | `docs/agents/pm-prompt.md` | `docs/agents/pm/` | `.github/workflows/pm-briefing.yml` |

---

## Agent Types

### Code Writers (open PRs that touch `src/`)
- **Quality Engineer** — the only agent that writes application code

### Read-Only (open PRs that touch docs only, or create Issues)
- **Discovery** — writes to `quality-rubric.md` only
- **Director** — writes digest markdown + creates GitHub Issue
- **Usability Tester** — creates GitHub Issue with findings
- **Competitive Researcher** — creates GitHub Issue + updates snapshots
- **PM Agent** — creates briefing markdown + GitHub Issue

---

## Coordination Protocol

### Shared State Files

| File | Who Writes | Who Reads | Purpose |
|------|-----------|-----------|---------|
| `docs/agents/coordination-log.md` | All agents | All agents | Append-only audit trail |
| `docs/quality-rubric.md` | Discovery (adds), Quality (fixes) | Director, PM | Quality work queue |
| `docs/pending-planning.md` | Quality (escalates Tier 3) | Director, PM | Decisions waiting for Jon |
| `docs/digest/YYYY-MM-DD.md` | Director | PM | Daily agent activity summary |
| `docs/briefings/YYYY-MM-DD.md` | PM | Jon | Evening product synthesis |

### Coordination Log Format

Every agent appends one line per run. Newest entries at the top of each day's section.

```
## YYYY-MM-DD

- HH:MM | agent-name | one-line summary (PR #, tier, status)
```

Read top-to-bottom for "what happened today." This is an append-only log — don't edit existing entries.

### Agent Scratchpads

Each agent has a `scratchpad.md` for persistent memory. Editable by humans and agents. Format:

```
### 2026-04-05 — short description
Lesson / rule / example.
```

Keep entries terse. Prune anything older than ~60 days.

---

## Tier System

Every PR gets exactly one tier label. See `.github/AGENTS.md` for full details.

| Tier | Scope | Merge Behavior |
|------|-------|----------------|
| `tier-0` | Tokens: typos, spacing, ARIA, imports | Auto-merge instantly after CI |
| `tier-1` | Visual polish: components, states, animations | Auto-merge after 15 min, no veto |
| `tier-2` | Copy, user flows, UX decisions | Held for Jon's review |
| `tier-3` | Architecture, features, structural changes | Held for planning session |
| `discovery` | Rubric-only additions | Treated as tier-0 |
| `pm-briefing` | Briefing files only | Treated as tier-0 |
| `competitive-research` | Snapshots and state files only | Treated as tier-0 |

### Veto Mechanism

Add the `veto` label or post a comment containing "veto" on any PR to block auto-merge.

---

## How to Add a New Agent

Checklist for adding agent #7 and beyond:

### 1. Define the agent
- [ ] Write the prompt file at `docs/agents/{agent-name}-prompt.md`
- [ ] Decide: code writer or read-only?
- [ ] Decide: what tier do its PRs get?
- [ ] Decide: schedule (cron expression in UTC)

### 2. Create state files
- [ ] `docs/agents/{agent-name}/scratchpad.md` — empty with header
- [ ] `docs/agents/{agent-name}/history.md` or equivalent index
- [ ] Any agent-specific state files (watch lists, snapshots, etc.)

### 3. Build the runner
- [ ] Create `scripts/{agent-name}/package.json` with minimal deps
- [ ] Create `scripts/{agent-name}/tsconfig.json`
- [ ] Implement `src/runner.ts` as the entry point
- [ ] Output: coordination log entry (always) + GitHub Issue or PR

### 4. Create the workflow
- [ ] `.github/workflows/{agent-name}.yml`
- [ ] Include `schedule` (cron) + `workflow_dispatch` (manual trigger)
- [ ] Set minimal `permissions` (usually `issues: write`, `contents: write`)
- [ ] Test with manual `workflow_dispatch` before enabling cron

### 5. Register
- [ ] Add the agent to the registry table in this README
- [ ] Add its files to the File Locations table
- [ ] Add its shared state to the Coordination Protocol table
- [ ] Update the schedule in CLAUDE.md if the agent is code-writing

### 6. Safety rules (non-negotiable)
- [ ] Never push directly to main — always branch + PR
- [ ] Apply a tier label to every PR
- [ ] Append to coordination log at the end of every run
- [ ] Read coordination log at the start of every run
- [ ] `workflow_dispatch` input for manual triggering during dev
- [ ] All times referenced in America/New_York

---

## Schedule Overview (After Full Rollout)

```
6:00 AM ET — Usability Tester (daily, Playwright vs prod)
7:00 AM ET — Director (daily, morning digest)
8:00 AM ET — Competitive Researcher self-audit (Monday only)
9:00 AM ET — Competitive Researcher market monitor (1st of month only)
:00/:30    — Quality Engineer (every 2h, PAUSED)
:15        — Discovery (every 2h, PAUSED)
6:00 PM ET — PM Agent (daily, evening briefing)
```

PM Agent runs last to capture everything that happened during the day.

---

## Design Principles

1. **Human-readable everything.** Every file an agent writes is markdown that Jon can read, edit, or delete.
2. **Append-only coordination.** Agents coordinate via the shared log, not by editing each other's files.
3. **Minimal blast radius.** Read-only agents can only create Issues or touch docs. Only Quality Engineer touches `src/`.
4. **Audit trail by default.** Every run leaves a trace in the coordination log, scratchpad, and history.
5. **Graceful degradation.** If an agent fails or is paused, the others continue unaffected. The PM briefing shows "no activity" rather than breaking.

---

*Last updated: 2026-04-08*

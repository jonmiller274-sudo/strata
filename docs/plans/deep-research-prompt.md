# Deep Research Prompt: Building an Autonomous Quality System for a Solo-Founded SaaS Product

## Use this prompt with Claude, ChatGPT Deep Research, Gemini Deep Research, or Perplexity Pro

---

## The Prompt

I'm a solo founder building Strata, a SaaS product that turns strategic content (board decks, investor updates, sales proposals, QBRs) into polished, interactive HTML documents. Think "Gamma but for depth" — non-linear navigation, progressive disclosure, animated timelines, data visualizations, all shareable via URL.

**My stack:** Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, Anthropic Claude API, Supabase, Vercel. No employees. 15 hours/week.

**My problem:** I've been building feature-by-feature and playing whack-a-mole with quality. Every time I add a new input path (PDF upload, PowerPoint import, URL import, text paste), the AI generates structured content that renders with visual bugs — text overlapping, broken layouts, cramped designs, missing fields. I fix one, three more appear. I have 11 different section types (timelines, card grids, metric dashboards, comparison tables, data visualizations, guided journeys, etc.) and each one has its own rendering edge cases.

I already have a partial agent system:
- 6 autonomous agents (Quality Engineer that opens PRs, Discovery agent that finds issues, Usability Tester with Playwright, Director for daily digests, PM agent, Competitive Researcher)
- A quality rubric with 24 items (22 complete)
- A design system document as single source of truth
- Auto-merge workflows for low-risk PRs (tier-0 instant, tier-1 after 15 min)
- Git worktree isolation for each agent run

But the system isn't working at the level I need. The agents fix surface-level issues but the product still looks amateur when real content hits it. I need to go from "demo quality" to "enterprise quality" — where a Series B CEO would present a Strata document to their board without embarrassment.

**I need you to research and design a comprehensive autonomous quality system. Specifically:**

### 1. The Karpathy Loop Applied to UI Quality
Andrej Karpathy's AutoResearch pattern (630 lines, 700 experiments, zero human input) uses three elements: a scriptable asset, a measurable scalar outcome, and a time-boxed evaluation cycle. How do I adapt this for visual UI quality? The challenge: "does this look good?" is not a simple scalar metric like training loss. Research:
- How to create a **visual quality score** that an LLM can assign to a screenshot (0-100 scale with specific rubric dimensions like text readability, layout balance, information hierarchy, visual consistency)
- How to build an **immutable eval harness** for UI quality — what's the equivalent of Karpathy's read-only `prepare.py` for visual rendering?
- How to structure the **iteration loop**: render → screenshot → score → modify CSS/component → re-render → re-score → keep or revert
- What **baseline artifacts** (golden examples) should I create to calibrate the scoring?

### 2. The Spotify "Honk" Pattern for Quality PRs
Spotify's background coding agent system (1,500+ merged PRs) uses: interactive planning → autonomous coding → deterministic verifiers → LLM judge. The LLM judge vetoes 25% of sessions (catching scope creep), and agents self-correct 50% of the time. Research:
- How to build an **LLM judge** that reviews PRs against my design system and quality rubric
- What **deterministic verifiers** should run before the LLM judge? (build passes, TypeScript clean, screenshot comparison, accessibility audit, bundle size check)
- How to implement the **veto + retry** loop where the judge sends the agent back with specific feedback
- How to handle the **scope creep problem** — agents that "fix" one thing but break three others

### 3. Eval-Driven Development for AI-Generated Content
My AI generates structured JSON (sections with titles, cards, metrics, timelines) from raw text. The quality of this JSON determines 80% of the rendered output quality. Research:
- How to build an **eval dataset** of golden input→output pairs for each of my 11 section types
- How to score AI-generated sections on dimensions like: completeness (all required fields present), proportionality (reasonable text lengths), structural validity (arrays have correct item counts), content quality (titles are concise, descriptions are substantive)
- How to run these evals **in CI** so every prompt change is regression-tested
- What frameworks exist for this? (Braintrust, DeepEval, custom harness)
- How to build a **content quality score** separate from the visual quality score

### 4. The Full Autonomous Loop Architecture
Design the complete system architecture for an autonomous quality improvement loop that runs 24/7 without my involvement:

**Content Generation Agent:**
- Generates diverse test artifacts using every template type (investor deck, board update, sales proposal, QBR, product roadmap, team update, partnership proposal, GTM strategy)
- Uses varied content sources: long text, short text, data-heavy, narrative-heavy, with images, without images
- Covers edge cases: very long titles, empty fields, 20+ cards, single-item timelines, huge metric values

**Visual QA Agent:**
- Renders each test artifact in a headless browser at multiple viewports (desktop, tablet, mobile)
- Screenshots every section individually
- Uses AI vision (Claude or GPT-4V) to score each screenshot against the design system
- Detects: text overflow/overlap, broken layouts, empty/malformed sections, inconsistent spacing, unreadable text, poor contrast, missing content
- Files issues with specific component, line number, and reproduction steps

**Quality Engineer Agent:**
- Picks up visual QA findings ordered by severity
- Reads the design system for the correct pattern
- Makes CSS/component fixes in isolated branches
- Runs the visual QA on its own fix to verify improvement
- Opens PRs with before/after screenshots

**Regression Guard:**
- Maintains a library of "golden" screenshots (known-good renders)
- Compares every PR's output against golden baselines
- Blocks merges that introduce visual regressions
- Updates golden baselines when intentional changes are approved

### 5. The Inner/Outer/Meta Loop Architecture
Martin Fowler and Spotify describe three loops. How should I structure mine?

- **Inner loop (seconds):** Me coding with Claude Code — fast iteration, human in the loop
- **Outer loop (hours):** Agents running autonomously — content generation, visual QA, quality fixes, PR creation — no human needed
- **Meta loop (days/weeks):** The system that improves itself — eval datasets grow from production feedback, scoring rubrics get recalibrated, agent prompts get refined based on success/failure patterns

Research how to implement the meta loop specifically. How does the system get BETTER over time without me manually tuning it?

### 6. Practical Implementation Constraints
- I'm on Vercel (serverless, 10-60s function timeouts) and Supabase
- My agents run via Claude Code scheduled tasks and GitHub Actions
- I have ~$200/month budget for AI API costs
- Headless browser screenshots need Playwright (already in my stack)
- I need this to work within 2 weeks, not 2 months
- The system must be maintainable by one person

### 7. What I DON'T Want
- A theoretical framework I can't implement
- Enterprise tools that cost $500+/month (Percy, Applitools, etc.)
- A system that requires me to manually review every finding
- Over-engineering — I need the 80/20 version that actually ships
- Advice to "just hire someone" — the whole point is autonomous agents

### Deliverables I Need From This Research
1. **Architecture diagram** of the full autonomous loop with data flow between agents
2. **Scoring rubric** for visual quality that an LLM can use to evaluate screenshots (specific dimensions, 0-100 scale, calibration examples)
3. **Eval harness design** for AI-generated content (input format, scoring dimensions, pass/fail thresholds)
4. **Implementation sequence** — what to build first, second, third (prioritized by impact)
5. **Cost estimate** — API costs per cycle, number of cycles per day, monthly budget
6. **Specific tool recommendations** for each layer (open-source preferred)
7. **The meta loop** — how the system improves itself over time without human intervention
8. **Failure modes** — what will go wrong and how to prevent it (the "doom loop" where agents make things worse)

### Context Links
- Karpathy's AutoResearch: https://github.com/karpathy/autoresearch
- Garry Tan's gstack: https://github.com/garrytan/gstack
- Spotify's Honk system: https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3/
- Martin Fowler on humans and agents: https://martinfowler.com/articles/exploring-gen-ai/humans-and-agents.html
- Braintrust eval-driven development: https://www.braintrust.dev/articles/eval-driven-development

---

## How to Use This Prompt

1. Paste this entire prompt into your preferred deep research tool
2. Let it run — expect 15-30 minutes for comprehensive research
3. The output should be a concrete, implementable architecture — not theory
4. Cross-reference findings across multiple research runs for robustness
5. Bring the results back to your Claude Code session for implementation planning

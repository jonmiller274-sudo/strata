# VQA Agent Scratchpad

## Current Focus
Initial monitoring setup — establishing golden baselines across all section types.

## What I Learned
(Newest at top)

### 2026-04-15 — Initial setup
- Eval harness captures all 11 section types correctly via data-section-type attribute
- Demo artifact scores avg VQS 86 (all passing) — good baseline
- API cost ~$0.003 per section scored with Claude Sonnet

## Traps to Avoid
(Newest at top)

### 2026-04-15 — Known issues
- Claude Desktop sets empty ANTHROPIC_API_KEY in env — eval scripts read .env.local as fallback
- Jon's shell has NODE_ENV=development — always use NODE_ENV=production for builds
- Turbopack caches aggressively — restart dev server after src/ changes to get fresh renders

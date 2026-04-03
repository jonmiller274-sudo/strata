# Hardcoded Features Audit — Investor Deck Editing Session (Apr 3, 2026)

Every feature below was performed via custom Supabase scripts because the product UI doesn't support it. These represent the **real editing workflow** for customers building important documents — not the creation happy path.

---

## 1. Feature List

### F1: Add Beats at Specific Position
**What we did manually:** `add-investor-deck-beats.mjs` — prepended 2 new beats to the top of the deck. `add-ready-to-scale-beat.mjs` — inserted a beat at position 4 (middle of the deck).
**What the user needs in UI:** "Add section" button that lets you insert a new beat at any position — top, bottom, or between existing beats. Pick a section type, enter content, done.
**Priority:** P0 — blocks all real usage. Users can't add content without this.

### F2: Delete Beats (Including Non-Adjacent)
**What we did manually:** `remove-beats-10-11.mjs` — deleted beats 7, 10, and 11 in one operation (non-adjacent indices).
**What the user needs in UI:** Select one or more beats and delete them. Confirmation dialog. Remaining beats auto-renumber.
**Priority:** P0 — can't clean up or iterate without delete.

### F3: Change Section Type
**What we did manually:** `upgrade-investor-deck-beats.mjs` — changed Beat 1 from `expandable-cards` to `hub-mockup` and Beat 2 from `rich-text` to `timeline`, restructuring the content JSON to match the new type's schema.
**What the user needs in UI:** "Change section type" dropdown on any beat. Content maps to the new type's structure where possible, with a preview before confirming. Unmappable fields flagged.
**Priority:** P1 — the most common iteration pattern. Users will constantly realize "this content would work better as a timeline/cards/dashboard." Without this, they're stuck with their initial choice.

### F4: Consolidate Multiple Beats into One
**What we did manually:** `consolidate-journeys.mjs` — merged 2 guided-journey beats + 1 tier-table into a single guided-journey with combined content (14 events, 2 phases, 4 counters).
**What the user needs in UI:** Select 2+ beats → "Merge into one." AI assists with content consolidation, user reviews and edits the merged result.
**Priority:** P2 — advanced editing. Less frequent but critical for polishing. Could ship as an AI-assisted action.

### F5: Reorder Beats (Drag-and-Drop)
**What we did manually:** Implicit in every script — beats shifted position whenever we added/removed/consolidated.
**What the user needs in UI:** Drag-and-drop reordering in the sidebar or a dedicated "reorder" mode. Visual preview of the new order before saving.
**Priority:** P0 — fundamental editing action. Every iteration involves reordering.

### F6: Replace Screenshot with Native Content
**What we did manually:** `rebuild-proof-beat.mjs` — replaced a blurry screenshot-only beat with a native `expandable-cards` section built from the screenshot's content.
**What the user needs in UI:** Two paths: (1) When uploading a screenshot, offer "Convert to native section" using AI vision to extract structured content. (2) On any screenshot beat, show "Rebuild as native" action that uses AI to parse the image into structured section data.
**Priority:** P1 — screenshots are a crutch during early creation. The upgrade path from screenshot → native is the quality escalator. This is also where the AI extraction gap matters most (see `memory/project_strata_ai_generation_gap.md`).

---

## 2. Workflow Insights

### The Real Editing Arc
Jon's iteration pattern across this session:

```
Create (happy path)
  → Review ("these beats are weak")
    → Upgrade section types (expandable-cards → hub-mockup, rich-text → timeline)
      → Restructure order (add bridge beats, remove redundant ones)
        → Consolidate (2 journeys → 1 journey)
          → Polish (replace screenshot with native, refine copy)
```

This is 5-6 loops of iteration. The product currently supports only the first step (Create). Everything after that required terminal scripts.

### The Gap
| What the product assumes | What actually happens |
|---|---|
| User picks the right section type on first try | User picks a type, sees it rendered, realizes another type fits better |
| Content is finalized before creation | Content evolves through 3-5 drafts as the narrative tightens |
| Sections are independent | Sections depend on each other — reordering one changes the meaning of the next |
| The deck structure is set early | Structure changes late — beats get added, removed, consolidated, split |
| Screenshots are temporary placeholders | Screenshots persist because there's no upgrade path to native |

### Frequency Analysis (This Session)
| Action | Times performed | Urgency |
|---|---|---|
| Add beat at position | 4 | P0 |
| Delete beat | 5 | P0 |
| Reorder beats | implicit in every change | P0 |
| Change section type | 2 | P1 |
| Replace screenshot → native | 1 | P1 |
| Consolidate beats | 1 | P2 |

---

## 3. Recommended Build Order

### Phase A: Unblock Basic Editing (P0s — build first)
1. **Reorder beats** — drag-and-drop in sidebar. Smallest scope, highest frequency.
2. **Delete beats** — select + confirm. Trivial backend (splice array), big UX unlock.
3. **Add beat at position** — "+" button between beats. Pick type, enter content. This completes the CRUD cycle.

### Phase B: Enable Iteration (P1s — build second)
4. **Change section type** — dropdown on beat header. Content remapping logic per type pair. AI can assist with ambiguous mappings.
5. **Screenshot → native conversion** — AI vision extracts structured content from uploaded images. This is the quality bridge and directly addresses the AI extraction gap.

### Phase C: Advanced Editing (P2 — build third)
6. **Consolidate beats** — AI-assisted merge of 2+ beats into one. Lower frequency but high impact when needed.

### Estimated Effort
- Phase A (P0s): ~2-3 sessions — mostly Supabase array manipulation + UI buttons
- Phase B (P1s): ~3-4 sessions — type remapping logic is the hard part; AI vision uses existing infrastructure
- Phase C (P2): ~2 sessions — AI consolidation prompt + merge preview UI

---

## 4. Missing Product Features (Beyond What Was Hardcoded)

These features weren't attempted this session because no path existed — but they're equally critical to the real workflow.

### F7: Content Ingestion — Multi-Format Import
**The gap:** Jon arrived with a Nexar slide screenshot and a 2,000-word customer journey document. Both needed to become structured sections. The product currently only accepts raw text paste.
**What the user needs in UI:**
- **Paste long-form text** → AI parses into the right section type with structured fields (titles, cards, steps, metrics)
- **Upload PDF** → AI extracts pages into candidate sections, user reviews and accepts
- **Upload slide deck (PPTX/PDF)** → each slide becomes a candidate section with content extracted
- **Upload screenshot/image** → AI vision extracts structured content into native components
- **Paste meeting transcript** → AI extracts key themes, quotes, and data points into sections
**Priority:** P0 — this is the creation step *before* editing. Without it, customers stare at a blank editor. Most customers have their content in Google Docs, PDFs, or slide decks — not as raw text they can paste field-by-field.

### F8: Section Type Recommendation
**The gap:** Jon picked expandable-cards for Beat 1 and rich-text for Beat 2. Both were wrong — the Design Advisor recommended hub-mockup and timeline. Customers won't have a Design Advisor.
**What the user needs in UI:**
- AI analyzes content structure and recommends the best 2-3 section types
- Side-by-side preview of the same content rendered in different types
- Contextual suggestions: "This looks like a comparison — try tier-table?" or "This has sequential steps — try timeline?"
**Priority:** P1 — low-hanging AI fruit. Prevents the "wrong type" → "change type" iteration loop entirely.

### F9: Guided Journey Builder
**The gap:** The guided-journey is the showstopper section type (animated counters, clickable timeline, phases, triggers, spend deltas) — but authoring one requires writing complex JSON with events, phases, counters, and counter_values per event. No customer can do this.
**What the user needs in UI:**
- Dedicated journey builder: add phases → add events → configure counters → set values per event
- Counter preview showing the animation as you build
- Event timeline you can drag to reorder
- "Import from text" — paste a narrative and AI structures it into events/phases
**Priority:** P1 — this section type sells the product. If customers can't create one, they'll never see Strata's best work.

### F10: Narrative Arc / Flow Awareness
**The gap:** The deck's beat sequence (Why Now → The Moment → Architecture → Ready to Scale → Journey → Economics → Proof) was carefully hand-crafted. The product has no concept of narrative structure.
**What the user needs in UI:**
- Suggest beat structures based on document type ("investor deck" → hook, problem, solution, traction, proof, ask)
- Flag when flow feels off ("two data-heavy sections back to back — consider a narrative bridge")
- Template arcs: "Investor Deck (7 beats)", "Board Update (5 beats)", "Sales Proposal (6 beats)", "QBR (4 beats)"
**Priority:** P2 — accelerates creation start. Most impactful for new users who don't know where to begin.

### F11: Version History / Undo
**The gap:** This session made 7 irreversible Supabase writes. If any had broken the deck, recovery would have been manual JSON reconstruction.
**What the user needs in UI:**
- Auto-save with version history ("2 hours ago — before reordering")
- One-click restore to any previous version
- Diff view showing what changed between versions
**Priority:** P1 — table stakes for any editor handling important documents. Without this, every edit is a one-way door.

### F12: Quality QA Layer
**The gap:** We manually caught: blurry screenshot, empty beats with no title, weak section types for opening beats. No automated checks exist.
**What the user needs in UI:**
- "Deck health score" — automated executive embarrassment test
- Flags: empty/incomplete sections, screenshots that could be native, low visual variety (3 rich-text in a row), missing titles
- Section type mismatch warnings ("this content has metrics — consider metric-dashboard instead of rich-text")
**Priority:** P2 — polish layer. Not blocking but prevents users from shipping weak documents.

### F13: Section Templates / Presets
**The gap:** Reusable patterns emerged this session: "customer proof quotes" (4 cards with persona/company/tag/quote), "ready to scale bridge" (3 completed steps + pivot), "why now tailwinds" (layered hub-mockup).
**What the user needs in UI:**
- Template library with pre-built section patterns users can insert and customize
- "Save as template" on any section they've built
- Community templates (future — marketplace potential)
**Priority:** P2 — means the next investor deck starts at 60% done, not 0%.

---

## 5. Updated Priority Stack

| Priority | Feature | Category | Why |
|----------|---------|----------|-----|
| **P0** | F5: Reorder beats | Editing | Can't iterate without this |
| **P0** | F2: Delete beats | Editing | Can't clean up without this |
| **P0** | F1: Add beat at position | Editing | Completes basic CRUD |
| **P0** | F7: Content ingestion (text, PDF, slides, images) | Creation | Can't create without this — blank editor is a bounce |
| **P1** | F8: Section type recommendation | AI | Prevents wrong-type iteration loop |
| **P1** | F3: Change section type | Editing | Most common iteration action |
| **P1** | F11: Version history / undo | Safety | Table stakes for important docs |
| **P1** | F9: Guided journey builder | Authoring | The section type that sells the product |
| **P1** | F6: Screenshot → native conversion | AI | Quality upgrade path |
| **P2** | F10: Narrative arc templates | Creation | Accelerates start for new users |
| **P2** | F12: Quality QA layer | Polish | Automated embarrassment test |
| **P2** | F13: Section templates / presets | Creation | 60% done on day one |
| **P2** | F4: Consolidate beats | Editing | Advanced, lower frequency |

### Recommended Build Sequence

**Phase A: Basic Editing CRUD** (~2-3 sessions)
→ F5 (reorder) + F2 (delete) + F1 (add at position)

**Phase B: Content Ingestion** (~3-4 sessions)
→ F7 (multi-format import: text parsing, PDF upload, image vision)

**Phase C: Smart Iteration** (~3-4 sessions)
→ F8 (type recommendation) + F3 (change section type) + F11 (version history)

**Phase D: Advanced Authoring** (~3-4 sessions)
→ F9 (guided journey builder) + F6 (screenshot → native)

**Phase E: Polish & Templates** (~2-3 sessions)
→ F10 (narrative arcs) + F12 (QA layer) + F13 (section templates)

---

## 6. The Meta-Insight

The product's value proposition is "turn strategic content into polished interactive documents in 30 minutes instead of a full day." But right now, the 30 minutes only covers initial creation. The **editing and iteration** that makes a document actually good — the part that takes the other 7 hours of the "full day" — has no product support at all.

Building these 13 features turns Strata from a "create once" tool into an "iterate until it's great" tool. That's the difference between a novelty and a product people keep using.

The creation side is equally broken: customers arrive with content in PDFs, Google Docs, slide decks, and meeting transcripts — not as raw text they can paste field-by-field. Content ingestion (F7) is the sleeper P0 that makes everything else matter. Without it, customers never get far enough to need the editing features.

---

*Generated from investor deck editing session, April 3, 2026*

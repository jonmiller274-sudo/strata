# Editor Overhaul — Design Document

**Date:** 2026-03-31
**Status:** Approved by Jon + Committee
**Context:** The current editor is functional but limiting. It feels like a 2-panel layout with inline editing bolted onto a read-only viewer, not a true editing system. This overhaul makes the editor Strata's second "wow" feature alongside the journey animation.

---

## Priority Order (Agreed)

1. **AI co-editor with conversation** — replace one-shot chips with persistent chat panel
2. **Sidebar layout overhaul** — left panel is cramped, needs clear information hierarchy
3. **Section structure editing** — add/remove cards, steps, metrics, events within sections
4. **Brand customization** — logo upload + primary/secondary brand colors (MVP requirement)
5. **Make all 8 section types editable** — especially journey, data-viz, hub-mockup
6. **Visual affordances** — hover states, cursor changes, edit hints
7. **Add Section with previews** — visual thumbnails of what each section type looks like

---

## 1. AI Co-Editor with Conversation

**Problem:** Current AI editing is a vending machine — one request, one output, take it or leave it. No iteration, no follow-up, no clarification.

**Design:**
- Persistent chat panel (not chips in sidebar footer)
- Full conversation history — "make this more concise" → "good, but keep the first paragraph" → "now make it sound more confident"
- AI can ask clarifying questions before making changes
- Works at both section level and document level
- Non-destructive preview: see suggestion before applying
- Uses Claude Sonnet 4.6 for quality (already implemented)

**Key insight from committee:** The best editing is iterative. This is Strata's second wow feature.

## 2. Sidebar Layout Overhaul

**Problem:** Settings, section list, AI Edit, and Add Section all fight for 300px. Screenshots show all panels open simultaneously — wall of competing UI.

**Design principles:**
- Clear information hierarchy — one primary panel at a time
- Wider sidebar or collapsible panels
- Section list shows structure (card count, step count) not just titles
- Section titles don't truncate

## 3. Section Structure Editing

**Problem:** Users can edit TEXT within sections but cannot add/remove items. Adding a card to a card grid requires regenerating the entire section.

**What's needed:**
- Add/remove cards in expandable-cards
- Add/remove steps in timeline
- Add/remove metrics in metric-dashboard
- Add/remove columns/features in tier-table
- Add/remove events/phases in guided-journey
- Add/remove nodes/connections in hub-mockup

## 4. Brand Customization (MVP)

**Problem:** Without brand identity, artifacts look like "some tool made this" not "my company built this."

**MVP scope (Level 1+2 only):**
- Logo upload (appears in header/nav)
- Primary brand color
- Secondary brand color
- Dark/light theme (already exists)

**NOT in MVP:** Custom fonts, full brand kit, favicon, custom footer.

## 5. Make All 8 Section Types Editable

**Current state:**
- 5 types have custom editors: rich-text, expandable-cards, metric-dashboard, timeline, tier-table
- 3 types are READ-ONLY in editor: data-viz, hub-mockup, guided-journey

**Priority:** Guided journey first (it's the wow feature), then data-viz, then hub-mockup.

## 6. Visual Affordances

**Problem:** No visual distinction between editable and read-only. No hover states. Users discover editability by accident.

**Design:**
- Hover state on editable text (subtle highlight, edit cursor)
- "Click to edit" hint on first interaction
- Visual boundary around editable regions
- Clear read-only indicator for locked sections

## 7. Add Section with Previews

**Problem:** Section type picker shows labels ("Rich Text", "Card Grid") with no visual context. Users don't know what they're choosing.

**Design:**
- Visual thumbnail preview for each section type
- Animated preview for journey type (the hook)
- One-sentence example of when to use each type

---

## AI Model Strategy (Implemented)

| Task | Model | Cost |
|------|-------|------|
| Initial structuring | Claude Opus 4.6 | ~$0.25 |
| Section rewrite | Claude Sonnet 4.6 | ~$0.05 |
| Document rewrite | Claude Sonnet 4.6 | ~$0.08 |
| Type classification | GPT-4.1-mini | ~$0.01 |
| Journey generation | Claude Opus 4.6 | ~$0.25 |
| Journey refinement | Claude Sonnet 4.6 | ~$0.05 |

Committed: `c0cf494` — multi-model strategy live on production.

---

## Committee Insights (Preserved)

**On journey creation flow (agreed):**
- "Describe → Generate → Refine" pattern
- Natural language input with smart placeholder text coaching
- 8 events default, user can ask for more/less
- AI-managed animated metrics (counters) — users edit narrative, AI recalculates numbers
- Inline text editing + drag reorder for events + AI command bar for structural changes

**On editing philosophy (agreed):**
- Two modes: precision edits (direct manipulation) vs strategic edits (AI-powered)
- Make the split obvious in the UI
- AI command bar always visible, not hidden in a menu

**On brand customization (agreed):**
- Logo + primary/secondary color = MVP requirement
- Without it, artifacts look generic and VPs won't send them to prospects
- Custom fonts / full brand kit = V2

---

## What We're NOT Building

- Mobile editor (ICP is on laptops)
- Undo/redo history buffer (auto-save + AI "see original" covers most needs)
- Collaborative editing (single user at a time)
- Custom CSS/typography
- Version history
- Template marketplace

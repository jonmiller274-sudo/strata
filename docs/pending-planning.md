# Pending Planning Items

Items that require Jon's input before any agent can touch them. The Director references this file in every daily digest. When Jon wants to unblock something, he runs a planning session that resolves an item and removes it from this file.

Each item should state:
- **What:** the problem / opportunity in one sentence
- **Why blocked:** what decision is missing
- **Added:** date the item entered the queue
- **Suggested advisor:** which advisor should lead the planning session

---

## Awaiting Design Decision

### QR-24 Hub Diagram visual upgrade
- **What:** `HubMockup` component currently renders as boxes + text list; needs to become a proper visual hub-and-spoke diagram with SVG connectors.
- **Why blocked:** Needs design direction — node styling, connector curves, hover states, how to handle 3/5/7+ node counts. Quality rubric explicitly marks this as DO NOT work autonomously.
- **Added:** 2026-04-04
- **Suggested advisor:** Design Advisor (lead) + Product Advisor (to confirm the section is worth the polish)
- **Reference:** `docs/quality-rubric.md` item QR-24, `src/components/viewer/sections/HubMockup.tsx`

### QR-16 Update landing page to reflect current editor capabilities
- **What:** Landing page needs to show all 8 section types, split view editor, AI chat co-editor, paste/upload ingestion, drag-drop reorder, and type changing — several of these are missing or outdated.
- **Why blocked:** `src/app/page.tsx` is brand-voice-sensitive and off-limits to autonomous agents. Requires Jon to approve copy, positioning, and feature showcase choices.
- **Added:** 2026-04-04
- **Suggested advisor:** Product Advisor (lead) + Design Advisor (for section layout and visuals)
- **Reference:** `docs/quality-rubric.md` item QR-16, `src/app/page.tsx`

---

## Awaiting Architecture Review

*(none currently)*

---

## Awaiting Product Decision

*(none currently)*

---

## Recently Resolved (last 7 days)

Examples of items that passed through this queue and how they were resolved — kept as a reference so Jon can see the shape of a good planning outcome.

### Mobile sidebar collapse (resolved 2026-04-01)
- **Was blocked on:** Decision on whether sidebar should auto-collapse below 1024px or require a manual toggle.
- **Resolution:** Auto-collapse below 1024px with a persistent toggle button. Shipped in commit `1d61dbd` (`fix(editor): add responsive sidebar width and mobile collapse`).
- **Planning session:** none required — Jon made the call directly after seeing the design mock.

---

*This file is read by the Director agent every morning. Keep items terse.*

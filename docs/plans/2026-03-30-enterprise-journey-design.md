# Enterprise Customer Journey — Design

**Date:** 2026-03-30
**Artifact:** Nexar PLG Go-to-Market (existing)
**Goal:** Add a second Journey section showing the 24-month enterprise lifecycle, complementing the existing 30-day PLG journey.

## Structure

Two Journey sections in one artifact:
1. **PLG Discovery (existing)** — Days 0-60, "how we land"
2. **Enterprise Customer Journey (new)** — Months 2-24, "how we compound"

## Enterprise Journey Spec

### 5 Phase Tabs (non-overlapping for display)

| Phase | Tab Label | Display Range |
|-------|-----------|---------------|
| 1 | Beachhead | Months 2-6 |
| 2 | Cross-Team | Months 6-12 |
| 3 | Fleet Intel | Months 12-18 |
| 4 | Full Suite | Months 18-24 |
| 5 | Ecosystem | Year 2+ |

### 4 Animated Counters

| Counter | Label | Sublabel | Start | End | Icon |
|---------|-------|----------|-------|-----|------|
| ARR | ARR | Annual Revenue | $150K | $8M | dollar-sign |
| Products | Products | Deployed | 1 | 7 | monitor |
| Teams | Teams | Integrated | 1 | 8 | users |
| Switching Cost | Stickiness | Switching Cost | 1 | 5 | lock |

Switching Cost uses a 1-5 scale (Low/Moderate/High/Critical/Structural).

### ~12 Events (2-3 per phase)

All customer data anonymized — use composites and ranges, no named customers with dollar figures.

**Phase 1: Beachhead (Months 2-6)**
1. Month 2 — "First Contract Signed": Single product, one team, scoped pilot. $150K-$500K ACV. The safety team validates whether the AI hits 80%+ precision on their core metric.
2. Month 4 — "Adjacent Team Discovers Platform": While the primary team runs their pilot, an engineer from the simulation team finds the self-serve sandbox. Seeds the next expansion without sales involvement.
3. Month 6 — "Beachhead Proven": Primary team hits their success metric. Product moves from evaluation to operational dependency. Renewal is automatic.

Counter values at end of phase: ARR $400K, Products 1, Teams 2, Stickiness 2

**Phase 2: Cross-Team (Months 6-12)**
4. Month 7 — "Second Product Request": The simulation team that found the sandbox pulls in reconstruction data. Different budget, different use case, same platform login.
5. Month 9 — "Executive Sponsor Emerges": VP of Engineering sees two teams using the same vendor independently. Asks for a consolidated account and volume pricing.
6. Month 11 — "Third Team Onboards": Operations team deploys route intelligence. Three teams, three products, three separate value propositions — one platform.

Counter values at end of phase: ARR $1.2M, Products 3, Teams 4, Stickiness 3

**Phase 3: Fleet Intel (Months 12-18)**
7. Month 12 — "The Pivotal Question": Primary team asks: "Why are we only scoring your data? What if we score our own 120K weekly fleet events?" Revenue model shifts from transactional to consumption.
8. Month 14 — "Data Flywheel Activates": Fleet data flowing through the platform improves the AI models. Better models attract the next team. Network effect kicks in.
9. Month 16 — "Competitive Displacement": The legacy point solution the operations team was using gets deprecated. Not because Nexar sold against it — because the platform already replaced its function.

Counter values at end of phase: ARR $2.5M, Products 4, Teams 6, Stickiness 4

**Phase 4: Full Suite (Months 18-24)**
10. Month 18 — "Enterprise Agreement": Consolidated multi-product deal replaces individual team contracts. Dedicated success team assigned. Quarterly executive reviews begin.
11. Month 21 — "Custom Integration Built": Customer builds internal tooling on top of the platform API. Every custom integration is a switching cost that compounds.
12. Month 24 — "Multi-Year Renewal": 5-7 products, 5-8 teams, $1.5M-$8M ARR. Removing the platform would require rebuilding workflows across the entire organization.

Counter values at end of phase: ARR $6M, Products 6, Teams 8, Stickiness 5

**Phase 5: Ecosystem (Year 2+)**
13. Month 30 — "Industry Standard": The AI benchmark gets cited in published research. The customer isn't just using a product — they're participating in an industry standard.
14. Month 36 — "Channel Multiplier": Customer's published safety case references the platform. New prospects discover it through their peer's regulatory submissions. The customer becomes the acquisition channel.

Counter values at end of phase: ARR $8M, Products 7, Teams 8, Stickiness 5

### Interaction Design

- **Autoplay:** Off by default (user clicks through at their own pace)
- **Interval:** 4000ms if autoplay enabled (slower than PLG — events are bigger)
- **Timeline:** Dots positioned proportionally by month value
- **Tone:** Emotionally specific event titles, not generic milestones

### Anonymization Rules

- No named customers paired with revenue figures
- Use composite personas ("a mid-size AV operator" not "May Mobility")
- Revenue shown as ranges or representative figures
- Team types are generic ("safety team", "simulation team") not named individuals

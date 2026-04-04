# Demo Page Rebuild — Velocity EMEA GTM Strategy

## Design Decisions (Brainstorm Session, Apr 4 2026)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Document type | Go-to-Market Expansion Plan | Strong narrative arc, all 8 sections feel organic |
| Fictional company | Velocity — Series B revenue intelligence platform ($18.2M ARR) | Revenue/sales is universal lingua franca; mirrors ICP |
| Content tone | Boardroom-ready specifics with strategic imperfections | Specificity creates involuntary comparison; imperfections signal authenticity |
| Theme | Light | Board docs live in light mode; creates contrast with dark landing page |
| Layout | Continuous (sidebar nav) | Showcases non-linear navigation — Strata's differentiator vs slides |
| Brand palette | Custom Velocity navy/teal | Stealth-demos branding feature; makes it feel like Velocity's doc, not Strata's |
| Watermark/CTA | Custom CTA bar + subtle watermark explainer | Don't watermark your own marketing; convert with "Build yours" CTA |

## Document Identity

- **Title:** "EMEA Go-to-Market Strategy — Q3 2026"
- **Subtitle:** "Velocity Revenue Intelligence — Board Strategy Document"
- **Theme:** `light`
- **Layout:** `continuous` (sidebar nav, scrollable)
- **Plan tier:** `pro` (no standard watermark)
- **Palette:**
  - Accent 1 (primary): `#1e3a5f` — deep navy — headings, sidebar, primary actions
  - Accent 2 (data): `#0d9488` — teal — metrics, positive trends, chart bars
  - Accent 3 (secondary): `#475569` — slate blue — secondary elements, muted cards
  - Accent 4 (highlight): `#d97706` — amber — warnings, imperfect metrics, attention
  - Accent 5 (success): `#059669` — emerald — completed statuses, positive indicators

---

## Section 1: Executive Summary — Rich Text + Progressive Disclosure

**Section type:** `rich-text`
**Title:** "The Case for EMEA"

**Tag:** `{ label: "Board Strategy", color: "#1e3a5f" }`

**Summary:**
> Velocity has reached an inflection point. At $18.2M ARR with 142% net revenue retention, our US business is scaling predictably — but our addressable market is constrained. Sixty-three percent of enterprise revenue intelligence spend will come from outside North America by 2028, and European competitors are moving.
>
> Revera (Berlin, $6M seed, 47 customers) and Klosio (London, CRM pivot, ~30 customers) are establishing footholds in a market with no dominant player. Neither has the conversation data moat we've built over 3 years and 12 million analyzed calls.
>
> This document outlines our plan to launch Velocity EMEA in Q3 2026, targeting $4.2M in incremental ARR within 18 months. We're requesting board approval for a $2.8M investment: a London hub, 12 initial hires, and localized product infrastructure.

**Callout:**
```json
{
  "type": "insight",
  "text": "The European revenue intelligence market is where the US market was in 2022 — early, fragmented, and waiting for a category leader. Our 18-month window before Revera closes their Series B is our competitive moat."
}
```

**Detail (expandable):**
> Three factors make this the right moment:
>
> 1. Product-market fit signals: 23% of our inbound demo requests already come from EMEA, despite zero marketing spend in the region. Our largest customer, Meridian Financial, expanded to their London team on their own — they forwarded login credentials to 14 UK reps without telling us.
>
> 2. Competitive window: Revera is pre-Series B with limited conversation data. Klosio pivoted from CRM analytics 8 months ago and has accuracy issues in multi-accent English analysis. Neither has enterprise-grade security (SOC 2 Type II) or a mature integration ecosystem.
>
> 3. Regulatory tailwind: GDPR created a strong preference for EU-hosted solutions. Our planned Frankfurt data residency turns compliance from a sales objection into a selling point — 40% of our lost DACH opportunities cited data residency as the primary blocker.

---

## Section 2: The Opportunity — Data Visualization

**Section type:** `data-visualization`
**Title:** "Market Sizing"

**Chart type:** `funnel`
**Description:** "European revenue intelligence market, 2026 estimates (Forrester, Gartner)"

**Data:**
```json
[
  { "label": "Global TAM", "value": 2400, "detail": "Enterprise revenue intelligence worldwide" },
  { "label": "EMEA SAM", "value": 680, "detail": "Mid-market & enterprise, addressable segments" },
  { "label": "Year 1 Addressable", "value": 42, "detail": "Reachable with London hub + DACH expansion" },
  { "label": "Year 1 Target", "value": 4.2, "detail": "10% capture rate — conservative vs. Gong benchmark" }
]
```

**Callout:** "**$680M SAM** with no dominant player. Revera holds approximately $3M ARR — just 0.4% market share. The market is open."

---

## Section 3: Target Segments — Expandable Card Grid

**Section type:** `expandable-cards`
**Title:** "Target Segments"
**Columns:** 2
**Display mode:** `expandable`

### Card 1: UK Mid-Market
- **Summary:** "200-1,000 employee SaaS companies with established sales teams. Fastest path to revenue — English-speaking, familiar buying process, London proximity."
- **Tags:** `["Priority 1", "Direct Sales"]`
- **Metric:** `{ value: "340", label: "qualified accounts" }`
- **Detail:** "ICP: VP Sales or CRO at Series B-D SaaS companies headquartered in London, Manchester, or Edinburgh. Pain point: forecasting in spreadsheets, zero call intelligence, reps self-reporting pipeline quality. Typical budget: £30-80K annually. Decision cycle: 6-8 weeks with single VP approval. Key target accounts: Paddle, GoCardless, Checkout.com growth team, Monzo Business, Thought Machine."

### Card 2: DACH Enterprise
- **Summary:** "1,000+ employee companies in Germany, Austria, and Switzerland. Higher ACV but longer sales cycles. Requires German-language support and EU data residency."
- **Tags:** `["Priority 2", "Enterprise"]`
- **Metric:** `{ value: "€92K", label: "avg deal size" }`
- **Detail:** "ICP: VP Revenue Operations at enterprise SaaS or financial services firms. Pain point: multi-language call analysis (German/English switching mid-call), compliance-grade conversation storage, forecasting across distributed European teams. Budget: €80-200K annually. Decision cycle: 4-6 months with procurement involvement. Requirements: Frankfurt data center, German UI localization, DSGVO compliance certification. Key target accounts: TeamViewer, Personio, Celonis, N26 Enterprise, Wefox."

### Card 3: Nordics PLG
- **Summary:** "Product-led SaaS companies in Stockholm, Helsinki, and Copenhagen. Tech-forward buyers who prefer to self-serve. Lower ACV but fastest adoption and strongest reference customers."
- **Tags:** `["Priority 3", "Self-Serve"]`
- **Metric:** `{ value: "14 days", label: "avg time to value" }`
- **Detail:** "ICP: Revenue leaders at 50-500 person product-led companies. Pain point: scaling beyond founder-led sales without losing deal intelligence and coaching consistency. Budget: €20-50K annually. Decision cycle: 2-3 weeks, often self-serve trial converting to paid without sales touch. English-first market — no localization required. Key target accounts: Klarna growth team, Spotify B2B, Pleo, Wolt Enterprise, Supermetrics."

### Card 4: Southern Europe — Deprioritized
- **Summary:** "France, Spain, and Italy via channel partners only. Not a Year 1 priority — complex localization, longer enterprise cycles, and less mature SaaS ecosystems. Revisit in H2 2027."
- **Tags:** `["Year 2", "Channel"]`
- **Metric:** `{ value: "Deprioritized", label: "status" }`
- **Detail:** "Why not now: French and Spanish localization adds 3-4 months of product work with limited near-term ROI. Enterprise buying in France is relationship-driven and heavily favors local vendors — cold outbound conversion rates are 60% lower than UK. Italy's B2B SaaS market trails UK/Nordics by 3-4 years in adoption maturity. The right model here is channel (reseller + implementation partner), which requires a mature EMEA operations team to support. We'll revisit once the London hub is generating pipeline independently and we have 2+ reference customers that Southern European buyers would recognize."

**Section-level callout:** `{ text: "Deliberate focus. We're not trying to win all of Europe in Year 1 — we're trying to prove the EMEA model works in three segments before scaling to the rest." }`

---

## Section 4: Competitive Landscape — Tier Table (Comparison Mode)

**Section type:** `tier-table`
**Title:** "Competitive Landscape"
**Mode:** `comparison`

**Kicker:** "We win on data depth and US-proven playbook. We need to close the gap on localization and physical EU presence."

### Column 1: Velocity (highlighted)
- **Name:** "Velocity"
- **Description:** "US-based, expanding to EMEA"
- **is_highlighted:** true
- **Features:**
  - Conversation Intelligence: `"12M+ calls, 3 years"` ✓
  - ML Revenue Forecasting: `"94% accuracy"` ✓
  - EU Data Residency: `"Frankfurt — Q3 2026"` (string)
  - Multi-language Analysis: `"English + German Q4"` (string)
  - EMEA Sales Team: `"Hiring — 8 by Q4"` (string)
  - Customer Base: `"847 customers (0 EMEA)"` (string)
  - Integration Ecosystem: `"42 native integrations"` ✓
  - Enterprise Security (SOC 2 Type II): ✓

### Column 2: Revera
- **Name:** "Revera"
- **Description:** "Berlin · Series A · $6M raised"
- **Features:**
  - Conversation Intelligence: `"~200K calls, 18 months"` ✓
  - ML Revenue Forecasting: ✗
  - EU Data Residency: ✓
  - Multi-language Analysis: `"DE, EN, FR"` ✓
  - EMEA Sales Team: `"12 reps across DACH"` ✓
  - Customer Base: `"47 EMEA customers"` (string)
  - Integration Ecosystem: `"8 integrations"` (string)
  - Enterprise Security (SOC 2 Type II): ✗

### Column 3: Klosio
- **Name:** "Klosio"
- **Description:** "London · Pivoted from CRM · 2025"
- **Features:**
  - Conversation Intelligence: `"8 months, accuracy issues"` (string)
  - ML Revenue Forecasting: `"CRM-based (legacy)"` (string)
  - EU Data Residency: ✓
  - Multi-language Analysis: ✗
  - EMEA Sales Team: `"6 reps, UK only"` (string)
  - Customer Base: `"~30 UK customers"` (string)
  - Integration Ecosystem: `"15 (CRM-heavy)"` (string)
  - Enterprise Security (SOC 2 Type II): `"In progress"` (string)

---

## Section 5: The Playbook — Animated Timeline

**Section type:** `timeline`
**Title:** "12-Month Rollout"

### Steps:
1. **Q3 2026 — London Hub Launch** (status: `current`)
   "Open Shoreditch office. Hire GM (Sarah Chen, ex-Gong EMEA), 2 Account Executives, 1 Solutions Engineer, 1 SDR. Frankfurt data center goes live. Begin UK mid-market outbound."

2. **Q3 2026 — First UK Pipeline** (status: `upcoming`)
   "Target: 40 qualified opportunities from UK mid-market. Activate co-selling with SI partners (Accenture UK, Deloitte Digital). Close first 5 UK logos by end of quarter."

3. **Q4 2026 — DACH Market Entry** (status: `upcoming`)
   "Hire 2 German-speaking AEs and 1 DACH SDR. German UI localization ships. DSGVO compliance certified. Begin enterprise outbound across 85 DACH target accounts."

4. **Q4 2026 — First Enterprise Deals** (status: `upcoming`)
   "Close 2-3 DACH enterprise deals at $80K+ ACV. Launch Nordics PLG self-serve motion. Target: $800K in closed-won EMEA ARR by end of Q4."

5. **Q1 2027 — Scale & Optimize** (status: `upcoming`)
   "Expand to 12 EMEA headcount. Launch partner referral program. Analyze channel performance: UK direct vs. DACH enterprise vs. Nordics PLG — double down on highest-performing motion."

6. **Q2 2027 — Run Rate Target** (status: `upcoming`)
   "Target: $4.2M EMEA ARR run rate. 60+ EMEA customers across 3 segments. Evaluate Southern Europe timing for H2. Present EMEA growth story as part of Series C narrative."

**Evidence:**
```json
{
  "text": "Benchmark: Gong's EMEA expansion reached $10M ARR within 14 months of their London office opening. Our target of $4.2M in 18 months is conservative by comparison, reflecting our smaller team and more focused segment approach."
}
```

---

## Section 6: Go-to-Market Architecture — Hub Diagram

**Section type:** `hub-mockup`
**Title:** "Go-to-Market Architecture"
**Description:** "How Velocity's EMEA channels connect and reinforce each other."

### Center Node:
```json
{
  "id": "velocity",
  "label": "Velocity EMEA",
  "description": "London Hub — GM + Regional Teams",
  "color": "#1e3a5f"
}
```

### Surrounding Nodes:
```json
[
  { "id": "direct", "label": "UK Direct Sales", "description": "Mid-market AEs (2 → 4 by Q1)", "color": "#0d9488" },
  { "id": "enterprise", "label": "DACH Enterprise", "description": "German-speaking AEs + SE", "color": "#1e3a5f" },
  { "id": "plg", "label": "Nordics Self-Serve", "description": "PLG motion, no sales touch", "color": "#059669" },
  { "id": "partners", "label": "SI Partners", "description": "Accenture UK, Deloitte Digital", "color": "#475569" },
  { "id": "marketing", "label": "Field Marketing", "description": "SaaStr EU, Revenue Summit, local events", "color": "#d97706" },
  { "id": "cs", "label": "Customer Success", "description": "EMEA CSM (hire Q4 2026)", "color": "#0d9488" }
]
```

### Connections:
```json
[
  { "from": "direct", "to": "velocity", "label": "UK pipeline" },
  { "from": "enterprise", "to": "velocity", "label": "DACH pipeline" },
  { "from": "plg", "to": "velocity", "label": "Self-serve signups" },
  { "from": "partners", "to": "enterprise", "label": "Enterprise referrals" },
  { "from": "marketing", "to": "direct", "label": "Event leads" },
  { "from": "marketing", "to": "plg", "label": "Content + SEO" },
  { "from": "cs", "to": "velocity", "label": "Expansion revenue" },
  { "from": "direct", "to": "cs", "label": "Onboarded customers" }
]
```

---

## Section 7: Revenue Model — Metric Dashboard

**Section type:** `metric-dashboard`
**Title:** "Revenue Model"

### Metrics:

1. **Year 1 EMEA ARR Target**
   - Value display: `"$4.2M"`
   - Numeric value: `4200000`
   - Prefix: `"$"`
   - Trend: `{ direction: "up", value: "from $0 today" }`
   - Description: "Based on 60+ customers at $70K blended ACV across UK mid-market, DACH enterprise, and Nordics self-serve."

2. **Blended CAC Payback** ⚠️ Strategic imperfection
   - Value display: `"14"`
   - Numeric value: `14`
   - Suffix: `" months"`
   - Trend: `{ direction: "up", value: "vs 11mo US" }` (up = worse for payback)
   - Description: "Higher initial CAC due to market entry costs, brand building, and lower initial win rates. Normalizes to US levels by Q2 2027 as pipeline matures."

3. **Quota per Rep (Ramped)**
   - Value display: `"$520K"`
   - Numeric value: `520000`
   - Prefix: `"$"`
   - Trend: `{ direction: "neutral", value: "85% of US quota" }`
   - Description: "Year 1 ramp quota — 85% of US target to account for new market development and longer European enterprise cycles."

4. **Pipeline Coverage**
   - Value display: `"3.5"`
   - Numeric value: `3.5`
   - Suffix: `"x"`
   - Trend: `{ direction: "up", value: "above 3x minimum" }`
   - Description: "Conservative coverage ratio for a new market. Higher than our US 3.0x target to buffer for EMEA conversion rate uncertainty."

---

## Section 8: The First 90 Days — Guided Journey

**Section type:** `guided-journey`
**Title:** "The First 90 Days"

### Phases:
```json
[
  { "id": "foundation", "name": "Foundation", "color": "#1e3a5f", "day_range": "Days 1-30" },
  { "id": "activation", "name": "Activation", "color": "#0d9488", "day_range": "Days 31-60" },
  { "id": "pipeline", "name": "Pipeline", "color": "#059669", "day_range": "Days 61-90" }
]
```

### Counters:
```json
[
  { "id": "headcount", "label": "EMEA Headcount", "start_value": 0, "icon": "users", "color": "#1e3a5f", "sublabel": "of 12 target" },
  { "id": "pipeline_val", "label": "Pipeline Created", "start_value": 0, "icon": "dollar", "color": "#0d9488", "prefix": "$", "suffix": "K", "sublabel": "qualified pipeline" },
  { "id": "burn", "label": "Monthly Burn", "start_value": 0, "icon": "bar", "color": "#d97706", "prefix": "£", "suffix": "K", "sublabel": "per month" }
]
```

### Events:

1. **Day 1 — GM Starts**
   - Phase: `foundation`
   - Description: "Sarah Chen joins as GM EMEA. Based in London, reports to CRO. First week: office setup, hiring plan finalization, target account list review with US sales leadership."
   - Counter values: `{ headcount: 1, pipeline_val: 0, burn: 45 }`
   - Trigger: `{ label: "Key Hire", text: "Sarah Chen — ex-Gong EMEA. Built their UK team from 0 to £8M ARR in 14 months." }`

2. **Week 1 — London Office Live**
   - Day: 7
   - Phase: `foundation`
   - Description: "Shoreditch WeWork — 15 desks reserved with expansion option to 30. Video conferencing configured for daily US standup sync (5pm GMT / 12pm EST). IT security provisioned, VPN active."
   - Counter values: `{ headcount: 1, pipeline_val: 0, burn: 52 }`
   - Trigger: `{ label: "Milestone", text: "Physical EMEA presence established — Velocity is now a two-continent company." }`

3. **Week 2 — First AEs Start**
   - Day: 14
   - Phase: `foundation`
   - Description: "2 UK Mid-Market Account Executives join. Weeks 1-2: US product certification, talk track localization for UK market, target account assignment (85 accounts each). Shadow 10+ US discovery calls."
   - Counter values: `{ headcount: 3, pipeline_val: 0, burn: 78 }`
   - Personas: `["James Ward — AE", "Priya Sharma — AE"]`

4. **Week 3 — SDR + SE Join**
   - Day: 21
   - Phase: `foundation`
   - Description: "1 SDR begins outbound sequences targeting 170 UK mid-market accounts. 1 Solutions Engineer supports UK demo pipeline and builds EMEA-specific demo environments. SDR target: 200 outbound touches per week."
   - Counter values: `{ headcount: 5, pipeline_val: 0, burn: 95 }`
   - Personas: `["Alex Torres — SDR", "Maria Okonkwo — SE"]`

5. **Day 30 — First Pipeline**
   - Day: 30
   - Phase: `foundation`
   - Description: "Month 1 results: 15 first meetings booked (11 outbound, 4 inbound). AEs running discovery calls. SE delivering technical deep-dives. 3 proof-of-concept agreements signed with UK mid-market targets."
   - Counter values: `{ headcount: 5, pipeline_val: 180, burn: 95 }`
   - Trigger: `{ label: "Board Checkpoint", text: "15 meetings, 3 POCs signed. Pipeline on track. Burn within budget." }`

6. **Week 5-6 — Partners Activated**
   - Day: 38
   - Phase: `activation`
   - Description: "Co-selling agreements executed with Accenture UK and Deloitte Digital. First joint pipeline reviews completed. Partner AEs briefed on Velocity positioning and trained on demo flow. Referral incentive structure: 15% of Year 1 ACV."
   - Counter values: `{ headcount: 5, pipeline_val: 320, burn: 102 }`
   - Trigger: `{ label: "Channel", text: "2 SI partners activated. Targeting 20% of Year 1 pipeline from partner channel." }`

7. **Day 45 — Frankfurt Data Center Live**
   - Day: 45
   - Phase: `activation`
   - Description: "EU data residency fully operational. All EMEA customer data stored and processed in Frankfurt. GDPR and DSGVO compliance documentation finalized and published. Legal review complete. This removes the #1 sales objection from DACH enterprise pipeline."
   - Counter values: `{ headcount: 5, pipeline_val: 480, burn: 108 }`
   - Trigger: `{ label: "Technical Milestone", text: "Data residency was the primary objection in 40% of DACH discovery calls. Now resolved." }`

8. **Week 7-8 — First Revenue**
   - Day: 52
   - Phase: `activation`
   - Description: "First 2 UK mid-market deals closed: Paddle (£42K ACV, 85-seat deployment) and a Series C fintech (£38K ACV, 62 seats). Average sales cycle: 6.5 weeks from first meeting. Win rate: 22% vs. 28% US benchmark — expected variance for new market."
   - Counter values: `{ headcount: 5, pipeline_val: 640, burn: 108 }`
   - Spend delta: `"+£80K ARR"`
   - Trigger: `{ label: "First Revenue", text: "£80K combined ARR from 2 UK logos. Win rate tracking 6 points below US — within expected range for market entry." }`

9. **Day 60 — DACH Team Joins**
   - Day: 60
   - Phase: `activation`
   - Description: "2 German-speaking AEs start in London (relocating to Munich hub in Q1 2027). German UI localization enters beta with 3 design partners. DSGVO certification published. DACH outbound begins: 85 enterprise target accounts across Germany, Austria, and Switzerland."
   - Counter values: `{ headcount: 7, pipeline_val: 820, burn: 142 }`
   - Personas: `["Lukas Bauer — DACH AE", "Nina Hoffmann — DACH AE"]`

10. **Day 75 — Pipeline Milestone**
    - Day: 75
    - Phase: `pipeline`
    - Description: "$1.2M qualified pipeline across UK direct and DACH enterprise. 8 active proof-of-concept evaluations. Nordics self-serve launched quietly — 23 trial signups in first 2 weeks with zero outbound spend."
    - Counter values: `{ headcount: 7, pipeline_val: 1200, burn: 148 }`
    - Trigger: `{ label: "Pipeline Check", text: "Qualified pipeline 15% ahead of plan. Nordics self-serve showing early product-market fit signal." }`

11. **Day 90 — Board Review**
    - Day: 90
    - Phase: `pipeline`
    - Description: "End of Q3 snapshot: 7 EMEA headcount ramped. 5 closed UK customers totaling £210K ARR. $1.8M qualified pipeline with 60% in active evaluation. 3 DACH enterprise POCs in progress (expected close Q4). Nordics: 41 trial signups, 6 converted to paid without sales touch."
    - Counter values: `{ headcount: 7, pipeline_val: 1800, burn: 155 }`
    - Spend delta: `"+£210K ARR"`
    - Trigger: `{ label: "Board Update", text: "Pipeline 15% ahead of plan. Closed ARR 8% behind — 2 UK deals slipped to early Q4 (procurement delays, not loss). Requesting approval to accelerate Q4 hiring: 5 additional headcount." }`

---

## Custom CTA (Bottom of Document)

Instead of the standard "Made with Strata" watermark, the demo page gets a custom conversion bar:

**Primary CTA:** "Like what you see? Build yours in 30 minutes." → links to `/create`
**Secondary text:** "Every Strata document includes a shareable link and viewer analytics."
**Subtle note:** "This document was built with Strata — the same tool you'll use."

**Implementation:** Either a custom component replacing StrataFooter for the demo, or a conditional render in StrataFooter when `isDemoPage` is true.

---

## Implementation Notes

1. Replace `DEMO_ARTIFACT` constant in `src/app/demo/page.tsx` with Velocity content
2. Set theme to `light` — verify all 8 section renderers look correct in light mode
3. Apply custom palette via `--palette-accent1` through `--palette-accent5` CSS variables
4. Custom CTA component at bottom (replaces watermark for demo only)
5. Update sidebar nav to work with new section titles
6. Test all interactive elements: card expand, timeline status, journey autoplay, metric counters
7. Mobile responsive check — especially the Guided Journey and Hub Diagram sections

### Light Theme Consideration
The codebase may be primarily dark-theme optimized. Need to verify that all section components render correctly with a light theme — check for hardcoded dark colors, `bg-white/X` opacity patterns that assume dark backgrounds, and `text-foreground` values.

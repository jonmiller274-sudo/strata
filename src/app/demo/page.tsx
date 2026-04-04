import type { Metadata } from "next";
import { ArtifactViewer } from "@/components/viewer/ArtifactViewer";
import type { Artifact } from "@/types/artifact";

export const metadata: Metadata = {
  title: "Velocity EMEA GTM — Strata Demo",
  description:
    "See what a Strata board document looks like. Velocity's EMEA Go-to-Market Strategy — all 8 section types in a light-theme, sidebar-nav layout.",
  openGraph: {
    title: "Velocity EMEA GTM — Strata Demo",
    description:
      "See what a Strata board document looks like. Velocity's EMEA Go-to-Market Strategy — all 8 section types in a light-theme, sidebar-nav layout.",
  },
};

const DEMO_ARTIFACT: Artifact = {
  id: "demo",
  slug: "velocity-emea-gtm",
  title: "EMEA Go-to-Market Strategy — Q3 2026",
  subtitle: "Velocity Revenue Intelligence — Board Strategy Document",
  author_name: "Velocity Strategy Team",
  plan_tier: "pro",
  theme: "light",
  layout_mode: "continuous",
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  branding: {
    palette: {
      accent1: "#1e3a5f",
      accent2: "#0d9488",
      accent3: "#475569",
      accent4: "#d97706",
      accent5: "#059669",
    },
  },
  sections: [
    // ─── Section 1: Executive Summary — Rich Text ───────────────────────────
    {
      id: "the-case-for-emea",
      type: "rich-text",
      title: "The Case for EMEA",
      content: {
        tag: {
          label: "Board Strategy",
          color: "#1e3a5f",
        },
        summary:
          "Velocity has reached an inflection point. At $18.2M ARR with 142% net revenue retention, our US business is scaling predictably — but our addressable market is constrained. Sixty-three percent of enterprise revenue intelligence spend will come from outside North America by 2028, and European competitors are moving.\n\nRevera (Berlin, $6M seed, 47 customers) and Klosio (London, CRM pivot, ~30 customers) are establishing footholds in a market with no dominant player. Neither has the conversation data moat we've built over 3 years and 12 million analyzed calls.\n\nThis document outlines our plan to launch Velocity EMEA in Q3 2026, targeting $4.2M in incremental ARR within 18 months. We're requesting board approval for a $2.8M investment: a London hub, 12 initial hires, and localized product infrastructure.",
        callout: {
          type: "insight",
          text: "The European revenue intelligence market is where the US market was in 2022 — early, fragmented, and waiting for a category leader. Our 18-month window before Revera closes their Series B is our competitive moat.",
        },
        detail:
          "Three factors make this the right moment:\n\n1. Product-market fit signals: 23% of our inbound demo requests already come from EMEA, despite zero marketing spend in the region. Our largest customer, Meridian Financial, expanded to their London team on their own — they forwarded login credentials to 14 UK reps without telling us.\n\n2. Competitive window: Revera is pre-Series B with limited conversation data. Klosio pivoted from CRM analytics 8 months ago and has accuracy issues in multi-accent English analysis. Neither has enterprise-grade security (SOC 2 Type II) or a mature integration ecosystem.\n\n3. Regulatory tailwind: GDPR created a strong preference for EU-hosted solutions. Our planned Frankfurt data residency turns compliance from a sales objection into a selling point — 40% of our lost DACH opportunities cited data residency as the primary blocker.",
      },
    },

    // ─── Section 2: Market Sizing — Data Visualization (funnel) ─────────────
    {
      id: "market-sizing",
      type: "data-viz",
      title: "Market Sizing",
      content: {
        chart_type: "funnel",
        data: [
          {
            label: "Global TAM",
            value: 2400,
            detail: "Enterprise revenue intelligence worldwide",
          },
          {
            label: "EMEA SAM",
            value: 680,
            detail: "Mid-market & enterprise, addressable segments",
          },
          {
            label: "Year 1 Addressable",
            value: 42,
            detail: "Reachable with London hub + DACH expansion",
          },
          {
            label: "Year 1 Target",
            value: 4.2,
            detail: "10% capture rate — conservative vs. Gong benchmark",
          },
        ],
        x_key: "label",
        y_key: "value",
        description:
          "European revenue intelligence market, 2026 estimates (Forrester, Gartner)",
        callout:
          "**$680M SAM** with no dominant player. Revera holds approximately $3M ARR — just 0.4% market share. The market is open.",
      },
    },

    // ─── Section 3: The First 90 Days — Guided Journey ───────────────────────
    {
      id: "first-90-days",
      type: "guided-journey",
      title: "The First 90 Days",
      content: {
        interval_ms: 3000,
        phases: [
          {
            id: "foundation",
            name: "Foundation",
            color: "#1e3a5f",
            day_range: "Days 1-30",
          },
          {
            id: "activation",
            name: "Activation",
            color: "#0d9488",
            day_range: "Days 31-60",
          },
          {
            id: "pipeline",
            name: "Pipeline",
            color: "#059669",
            day_range: "Days 61-90",
          },
        ],
        counters: [
          {
            id: "headcount",
            label: "EMEA Headcount",
            sublabel: "of 12 target",
            icon: "users",
            color: "#1e3a5f",
            start_value: 0,
          },
          {
            id: "pipeline_val",
            label: "Pipeline Created",
            sublabel: "qualified pipeline",
            icon: "dollar",
            color: "#0d9488",
            prefix: "$",
            suffix: "K",
            start_value: 0,
          },
          {
            id: "burn",
            label: "Monthly Burn",
            sublabel: "per month",
            icon: "bar",
            color: "#d97706",
            prefix: "£",
            suffix: "K",
            start_value: 0,
          },
        ],
        events: [
          {
            id: "day-1-gm-starts",
            day: 1,
            label: "Day 1",
            title: "GM Starts",
            phase_id: "foundation",
            description:
              "Sarah Chen joins as GM EMEA. Based in London, reports to CRO. First week: office setup, hiring plan finalization, target account list review with US sales leadership.",
            trigger: {
              label: "Key Hire",
              text: "Sarah Chen — ex-Gong EMEA. Built their UK team from 0 to £8M ARR in 14 months.",
            },
            counter_values: { headcount: 1, pipeline_val: 0, burn: 45 },
          },
          {
            id: "week-1-office-live",
            day: 7,
            label: "Week 1",
            title: "London Office Live",
            phase_id: "foundation",
            description:
              "Shoreditch WeWork — 15 desks reserved with expansion option to 30. Video conferencing configured for daily US standup sync (5pm GMT / 12pm EST). IT security provisioned, VPN active.",
            trigger: {
              label: "Milestone",
              text: "Physical EMEA presence established — Velocity is now a two-continent company.",
            },
            counter_values: { headcount: 1, pipeline_val: 0, burn: 52 },
          },
          {
            id: "week-2-first-aes",
            day: 14,
            label: "Week 2",
            title: "First AEs Start",
            phase_id: "foundation",
            description:
              "2 UK Mid-Market Account Executives join. Weeks 1-2: US product certification, talk track localization for UK market, target account assignment (85 accounts each). Shadow 10+ US discovery calls.",
            personas: ["James Ward — AE", "Priya Sharma — AE"],
            counter_values: { headcount: 3, pipeline_val: 0, burn: 78 },
          },
          {
            id: "week-3-sdr-se",
            day: 21,
            label: "Week 3",
            title: "SDR + SE Join",
            phase_id: "foundation",
            description:
              "1 SDR begins outbound sequences targeting 170 UK mid-market accounts. 1 Solutions Engineer supports UK demo pipeline and builds EMEA-specific demo environments. SDR target: 200 outbound touches per week.",
            personas: ["Alex Torres — SDR", "Maria Okonkwo — SE"],
            counter_values: { headcount: 5, pipeline_val: 0, burn: 95 },
          },
          {
            id: "day-30-first-pipeline",
            day: 30,
            label: "Day 30",
            title: "First Pipeline",
            phase_id: "foundation",
            description:
              "Month 1 results: 15 first meetings booked (11 outbound, 4 inbound). AEs running discovery calls. SE delivering technical deep-dives. 3 proof-of-concept agreements signed with UK mid-market targets.",
            trigger: {
              label: "Board Checkpoint",
              text: "15 meetings, 3 POCs signed. Pipeline on track. Burn within budget.",
            },
            counter_values: { headcount: 5, pipeline_val: 180, burn: 95 },
          },
          {
            id: "week-5-6-partners",
            day: 38,
            label: "Week 5-6",
            title: "Partners Activated",
            phase_id: "activation",
            description:
              "Co-selling agreements executed with Accenture UK and Deloitte Digital. First joint pipeline reviews completed. Partner AEs briefed on Velocity positioning and trained on demo flow. Referral incentive structure: 15% of Year 1 ACV.",
            trigger: {
              label: "Channel",
              text: "2 SI partners activated. Targeting 20% of Year 1 pipeline from partner channel.",
            },
            counter_values: { headcount: 5, pipeline_val: 320, burn: 102 },
          },
          {
            id: "day-45-frankfurt",
            day: 45,
            label: "Day 45",
            title: "Frankfurt Data Center Live",
            phase_id: "activation",
            description:
              "EU data residency fully operational. All EMEA customer data stored and processed in Frankfurt. GDPR and DSGVO compliance documentation finalized and published. Legal review complete. This removes the #1 sales objection from DACH enterprise pipeline.",
            trigger: {
              label: "Technical Milestone",
              text: "Data residency was the primary objection in 40% of DACH discovery calls. Now resolved.",
            },
            counter_values: { headcount: 5, pipeline_val: 480, burn: 108 },
          },
          {
            id: "week-7-8-first-revenue",
            day: 52,
            label: "Week 7-8",
            title: "First Revenue",
            phase_id: "activation",
            description:
              "First 2 UK mid-market deals closed: Paddle (£42K ACV, 85-seat deployment) and a Series C fintech (£38K ACV, 62 seats). Average sales cycle: 6.5 weeks from first meeting. Win rate: 22% vs. 28% US benchmark — expected variance for new market.",
            spend_delta: "+£80K ARR",
            trigger: {
              label: "First Revenue",
              text: "£80K combined ARR from 2 UK logos. Win rate tracking 6 points below US — within expected range for market entry.",
            },
            counter_values: { headcount: 5, pipeline_val: 640, burn: 108 },
          },
          {
            id: "day-60-dach-team",
            day: 60,
            label: "Day 60",
            title: "DACH Team Joins",
            phase_id: "activation",
            description:
              "2 German-speaking AEs start in London (relocating to Munich hub in Q1 2027). German UI localization enters beta with 3 design partners. DSGVO certification published. DACH outbound begins: 85 enterprise target accounts across Germany, Austria, and Switzerland.",
            personas: ["Lukas Bauer — DACH AE", "Nina Hoffmann — DACH AE"],
            counter_values: { headcount: 7, pipeline_val: 820, burn: 142 },
          },
          {
            id: "day-75-pipeline-milestone",
            day: 75,
            label: "Day 75",
            title: "Pipeline Milestone",
            phase_id: "pipeline",
            description:
              "$1.2M qualified pipeline across UK direct and DACH enterprise. 8 active proof-of-concept evaluations. Nordics self-serve launched quietly — 23 trial signups in first 2 weeks with zero outbound spend.",
            trigger: {
              label: "Pipeline Check",
              text: "Qualified pipeline 15% ahead of plan. Nordics self-serve showing early product-market fit signal.",
            },
            counter_values: { headcount: 7, pipeline_val: 1200, burn: 148 },
          },
          {
            id: "day-90-board-review",
            day: 90,
            label: "Day 90",
            title: "Board Review",
            phase_id: "pipeline",
            description:
              "End of Q3 snapshot: 7 EMEA headcount ramped. 5 closed UK customers totaling £210K ARR. $1.8M qualified pipeline with 60% in active evaluation. 3 DACH enterprise POCs in progress (expected close Q4). Nordics: 41 trial signups, 6 converted to paid without sales touch.",
            spend_delta: "+£210K ARR",
            trigger: {
              label: "Board Update",
              text: "Pipeline 15% ahead of plan. Closed ARR 8% behind — 2 UK deals slipped to early Q4 (procurement delays, not loss). Requesting approval to accelerate Q4 hiring: 5 additional headcount.",
            },
            counter_values: { headcount: 7, pipeline_val: 1800, burn: 155 },
          },
        ],
      },
    },

    // ─── Section 4: Target Segments — Expandable Card Grid ─────────────────
    {
      id: "target-segments",
      type: "expandable-cards",
      title: "Target Segments",
      content: {
        columns: 2,
        display_mode: "expandable",
        cards: [
          {
            id: "uk-mid-market",
            title: "UK Mid-Market",
            summary:
              "200-1,000 employee SaaS companies with established sales teams. Fastest path to revenue — English-speaking, familiar buying process, London proximity.",
            tags: ["Priority 1", "Direct Sales"],
            metric: {
              value: "340",
              label: "qualified accounts",
            },
            detail:
              "ICP: VP Sales or CRO at Series B-D SaaS companies headquartered in London, Manchester, or Edinburgh. Pain point: forecasting in spreadsheets, zero call intelligence, reps self-reporting pipeline quality. Typical budget: £30-80K annually. Decision cycle: 6-8 weeks with single VP approval. Key target accounts: Paddle, GoCardless, Checkout.com growth team, Monzo Business, Thought Machine.",
          },
          {
            id: "dach-enterprise",
            title: "DACH Enterprise",
            summary:
              "1,000+ employee companies in Germany, Austria, and Switzerland. Higher ACV but longer sales cycles. Requires German-language support and EU data residency.",
            tags: ["Priority 2", "Enterprise"],
            metric: {
              value: "€92K",
              label: "avg deal size",
            },
            detail:
              "ICP: VP Revenue Operations at enterprise SaaS or financial services firms. Pain point: multi-language call analysis (German/English switching mid-call), compliance-grade conversation storage, forecasting across distributed European teams. Budget: €80-200K annually. Decision cycle: 4-6 months with procurement involvement. Requirements: Frankfurt data center, German UI localization, DSGVO compliance certification. Key target accounts: TeamViewer, Personio, Celonis, N26 Enterprise, Wefox.",
          },
          {
            id: "nordics-plg",
            title: "Nordics PLG",
            summary:
              "Product-led SaaS companies in Stockholm, Helsinki, and Copenhagen. Tech-forward buyers who prefer to self-serve. Lower ACV but fastest adoption and strongest reference customers.",
            tags: ["Priority 3", "Self-Serve"],
            metric: {
              value: "14 days",
              label: "avg time to value",
            },
            detail:
              "ICP: Revenue leaders at 50-500 person product-led companies. Pain point: scaling beyond founder-led sales without losing deal intelligence and coaching consistency. Budget: €20-50K annually. Decision cycle: 2-3 weeks, often self-serve trial converting to paid without sales touch. English-first market — no localization required. Key target accounts: Klarna growth team, Spotify B2B, Pleo, Wolt Enterprise, Supermetrics.",
          },
          {
            id: "southern-europe",
            title: "Southern Europe — Deprioritized",
            summary:
              "France, Spain, and Italy via channel partners only. Not a Year 1 priority — complex localization, longer enterprise cycles, and less mature SaaS ecosystems. Revisit in H2 2027.",
            tags: ["Year 2", "Channel"],
            metric: {
              value: "Deprioritized",
              label: "status",
            },
            detail:
              "Why not now: French and Spanish localization adds 3-4 months of product work with limited near-term ROI. Enterprise buying in France is relationship-driven and heavily favors local vendors — cold outbound conversion rates are 60% lower than UK. Italy's B2B SaaS market trails UK/Nordics by 3-4 years in adoption maturity. The right model here is channel (reseller + implementation partner), which requires a mature EMEA operations team to support. We'll revisit once the London hub is generating pipeline independently and we have 2+ reference customers that Southern European buyers would recognize.",
          },
        ],
        callout: {
          type: "quote",
          text: "Deliberate focus. We're not trying to win all of Europe in Year 1 — we're trying to prove the EMEA model works in three segments before scaling to the rest.",
        },
      },
    },

    // ─── Section 5: 12-Month Rollout — Animated Timeline ─────────────────────
    {
      id: "twelve-month-rollout",
      type: "timeline",
      title: "12-Month Rollout",
      content: {
        steps: [
          {
            id: "q3-london-hub",
            label: "Q3 2026",
            title: "London Hub Launch",
            description:
              "Open Shoreditch office. Hire GM (Sarah Chen, ex-Gong EMEA), 2 Account Executives, 1 Solutions Engineer, 1 SDR. Frankfurt data center goes live. Begin UK mid-market outbound.",
            status: "current",
          },
          {
            id: "q3-first-pipeline",
            label: "Q3 2026",
            title: "First UK Pipeline",
            description:
              "Target: 40 qualified opportunities from UK mid-market. Activate co-selling with SI partners (Accenture UK, Deloitte Digital). Close first 5 UK logos by end of quarter.",
            status: "upcoming",
          },
          {
            id: "q4-dach-entry",
            label: "Q4 2026",
            title: "DACH Market Entry",
            description:
              "Hire 2 German-speaking AEs and 1 DACH SDR. German UI localization ships. DSGVO compliance certified. Begin enterprise outbound across 85 DACH target accounts.",
            status: "upcoming",
          },
          {
            id: "q4-enterprise-deals",
            label: "Q4 2026",
            title: "First Enterprise Deals",
            description:
              "Close 2-3 DACH enterprise deals at $80K+ ACV. Launch Nordics PLG self-serve motion. Target: $800K in closed-won EMEA ARR by end of Q4.",
            status: "upcoming",
          },
          {
            id: "q1-2027-scale",
            label: "Q1 2027",
            title: "Scale & Optimize",
            description:
              "Expand to 12 EMEA headcount. Launch partner referral program. Analyze channel performance: UK direct vs. DACH enterprise vs. Nordics PLG — double down on highest-performing motion.",
            status: "upcoming",
          },
          {
            id: "q2-2027-run-rate",
            label: "Q2 2027",
            title: "Run Rate Target",
            description:
              "Target: $4.2M EMEA ARR run rate. 60+ EMEA customers across 3 segments. Evaluate Southern Europe timing for H2. Present EMEA growth story as part of Series C narrative.",
            status: "upcoming",
          },
        ],
        evidence: {
          text: "Benchmark: Gong's EMEA expansion reached $10M ARR within 14 months of their London office opening. Our target of $4.2M in 18 months is conservative by comparison, reflecting our smaller team and more focused segment approach.",
        },
      },
    },

    // ─── Section 6: Competitive Landscape — Tier Table (comparison) ──────────
    {
      id: "competitive-landscape",
      type: "tier-table",
      title: "Competitive Landscape",
      content: {
        mode: "comparison",
        kicker:
          "We win on data depth and US-proven playbook. We need to close the gap on localization and physical EU presence.",
        columns: [
          {
            name: "Velocity",
            description: "US-based, expanding to EMEA",
            is_highlighted: true,
            features: [
              { name: "Conversation Intelligence: 12M+ calls, 3 years", included: true },
              { name: "ML Revenue Forecasting: 94% accuracy", included: true },
              { name: "EU Data Residency: Frankfurt — Q3 2026", included: "Q3 2026" },
              { name: "Multi-language Analysis: English + German Q4", included: "Q4 2026" },
              { name: "EMEA Sales Team: Hiring — 8 by Q4", included: "In progress" },
              { name: "Customer Base: 847 customers (0 EMEA)", included: "847 US" },
              { name: "Integration Ecosystem: 42 native integrations", included: true },
              { name: "Enterprise Security (SOC 2 Type II)", included: true },
            ],
          },
          {
            name: "Revera",
            description: "Berlin · Series A · $6M raised",
            features: [
              { name: "Conversation Intelligence: ~200K calls, 18 months", included: true },
              { name: "ML Revenue Forecasting", included: false },
              { name: "EU Data Residency", included: true },
              { name: "Multi-language Analysis: DE, EN, FR", included: true },
              { name: "EMEA Sales Team: 12 reps across DACH", included: true },
              { name: "Customer Base: 47 EMEA customers", included: "47 customers" },
              { name: "Integration Ecosystem: 8 integrations", included: "8 integrations" },
              { name: "Enterprise Security (SOC 2 Type II)", included: false },
            ],
          },
          {
            name: "Klosio",
            description: "London · Pivoted from CRM · 2025",
            features: [
              { name: "Conversation Intelligence: 8 months, accuracy issues", included: "Limited" },
              { name: "ML Revenue Forecasting: CRM-based (legacy)", included: "CRM-based" },
              { name: "EU Data Residency", included: true },
              { name: "Multi-language Analysis", included: false },
              { name: "EMEA Sales Team: 6 reps, UK only", included: "6 reps (UK)" },
              { name: "Customer Base: ~30 UK customers", included: "~30 customers" },
              { name: "Integration Ecosystem: 15 (CRM-heavy)", included: "15 (CRM)" },
              { name: "Enterprise Security (SOC 2 Type II)", included: "In progress" },
            ],
          },
        ],
      },
    },

    // ─── Section 7: GTM Architecture — Hub Mockup ───────────────────────────
    {
      id: "gtm-architecture",
      type: "hub-mockup",
      title: "Go-to-Market Architecture",
      subtitle: "How Velocity's EMEA channels connect and reinforce each other.",
      content: {
        center: {
          id: "velocity",
          label: "Velocity EMEA",
          description: "London Hub — GM + Regional Teams",
          color: "#1e3a5f",
        },
        nodes: [
          {
            id: "direct",
            label: "UK Direct Sales",
            description: "Mid-market AEs (2 → 4 by Q1)",
            color: "#0d9488",
          },
          {
            id: "enterprise",
            label: "DACH Enterprise",
            description: "German-speaking AEs + SE",
            color: "#1e3a5f",
          },
          {
            id: "plg",
            label: "Nordics Self-Serve",
            description: "PLG motion, no sales touch",
            color: "#059669",
          },
          {
            id: "partners",
            label: "SI Partners",
            description: "Accenture UK, Deloitte Digital",
            color: "#475569",
          },
          {
            id: "marketing",
            label: "Field Marketing",
            description: "SaaStr EU, Revenue Summit, local events",
            color: "#d97706",
          },
          {
            id: "cs",
            label: "Customer Success",
            description: "EMEA CSM (hire Q4 2026)",
            color: "#0d9488",
          },
        ],
        connections: [
          { from: "direct", to: "velocity", label: "UK pipeline" },
          { from: "enterprise", to: "velocity", label: "DACH pipeline" },
          { from: "plg", to: "velocity", label: "Self-serve signups" },
          { from: "partners", to: "enterprise", label: "Enterprise referrals" },
          { from: "marketing", to: "direct", label: "Event leads" },
          { from: "marketing", to: "plg", label: "Content + SEO" },
          { from: "cs", to: "velocity", label: "Expansion revenue" },
          { from: "direct", to: "cs", label: "Onboarded customers" },
        ],
        description:
          "Build once in London, distribute across three parallel motions: UK direct for near-term revenue, DACH enterprise for ACV growth, and Nordics self-serve for scalable pipeline without headcount.",
      },
    },

    // ─── Section 8: Revenue Model — Metric Dashboard ─────────────────────────
    {
      id: "revenue-model",
      type: "metric-dashboard",
      title: "Revenue Model",
      content: {
        metrics: [
          {
            id: "year1-arr",
            label: "Year 1 EMEA ARR Target",
            value: "$4.2M",
            numeric_value: 4200000,
            prefix: "$",
            change: {
              direction: "up",
              value: "from $0 today",
            },
            description:
              "Based on 60+ customers at $70K blended ACV across UK mid-market, DACH enterprise, and Nordics self-serve.",
          },
          {
            id: "cac-payback",
            label: "Blended CAC Payback",
            value: "14",
            numeric_value: 14,
            suffix: " months",
            change: {
              direction: "up",
              value: "vs 11mo US",
            },
            description:
              "Higher initial CAC due to market entry costs, brand building, and lower initial win rates. Normalizes to US levels by Q2 2027 as pipeline matures.",
          },
          {
            id: "quota-per-rep",
            label: "Quota per Rep (Ramped)",
            value: "$520K",
            numeric_value: 520000,
            prefix: "$",
            change: {
              direction: "neutral",
              value: "85% of US quota",
            },
            description:
              "Year 1 ramp quota — 85% of US target to account for new market development and longer European enterprise cycles.",
          },
          {
            id: "pipeline-coverage",
            label: "Pipeline Coverage",
            value: "3.5",
            numeric_value: 3.5,
            suffix: "x",
            change: {
              direction: "up",
              value: "above 3x minimum",
            },
            description:
              "Conservative coverage ratio for a new market. Higher than our US 3.0x target to buffer for EMEA conversion rate uncertainty.",
          },
        ],
      },
    },

  ],
};

export default function DemoPage() {
  return <ArtifactViewer artifact={DEMO_ARTIFACT} isDemoPage />;
}

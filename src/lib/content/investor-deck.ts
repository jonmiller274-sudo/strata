import type { Artifact } from "@/types/artifact";

export const investorDeckArtifact: Artifact = {
  id: "investor-deck",
  slug: "investor-deck",
  title: "Nexar — PLG Go-to-Market",
  subtitle:
    "The 30-day customer journey that replaces 12 months of enterprise sales",
  author_name: "Jon Miller",
  theme: "dark",
  layout_mode: "beats",
  nav_style: "progress-bar",
  branding: {
    palette: {
      accent1: "#2fd8c8", // teal
      accent2: "#7c6df0", // purple
      accent3: "#f0b429", // amber
      accent4: "#f06460", // coral
      accent5: "#36d399", // green
    },
  },
  is_published: true,
  created_at: "2026-03-27T00:00:00Z",
  updated_at: "2026-03-29T00:00:00Z",
  sections: [
    // ─── Section 1: The Problem ───────────────────────────────────────────────
    {
      id: "the-problem",
      type: "timeline",
      title: "Every Enterprise Deal Takes 9–12 Months",
      subtitle: "And requires Nexar's team to do the customer's work for them.",
      content: {
        orientation: "horizontal",
        steps: [
          {
            id: "m1",
            label: "Month 1",
            title: "First Meeting — NDA",
            description:
              "Initial outreach leads to a first meeting. NDAs exchanged. No product usage yet.",
            status: "completed",
          },
          {
            id: "m2-3",
            label: "Months 2–3",
            title: "Sample Delivery — Wait",
            description:
              "Nexar prepares and delivers sample data. Customer reviews on their own timeline.",
            status: "completed",
          },
          {
            id: "m4",
            label: "Month 4",
            title: "Technical Eval (Nexar Runs It)",
            description:
              "Nexar's team runs the technical evaluation on behalf of the customer. The customer watches.",
            status: "completed",
          },
          {
            id: "m5-6",
            label: "Months 5–6",
            title: "Custom Proposal — Procurement",
            description:
              "Custom proposal drafted. Procurement process begins. Multiple stakeholders involved.",
            status: "completed",
          },
          {
            id: "m7-9",
            label: "Months 7–9",
            title: "Pilot Negotiation — Legal",
            description:
              "Pilot terms negotiated. Legal reviews contracts. Timeline slips further.",
            status: "completed",
          },
          {
            id: "m10-12",
            label: "Months 10–12",
            title: "Maybe a Signed Deal",
            description:
              "After a year of effort, a deal may or may not close. No guarantee of return on the time invested.",
            status: "completed",
          },
        ],
        evidence: {
          text: "Nuro has been in this loop for 3 years. Qualcomm took 10 months to reach verbal commitment. Zoox has been a relationship since 2021 — still stalling.",
          border_color: "#f06460",
        },
        pivot:
          "What if the customer could do all of this themselves — in 30 days?",
      },
    },

    // ─── Section 2: The Journey ───────────────────────────────────────────────
    {
      id: "the-journey",
      type: "guided-journey",
      title: "The 30-Day Customer Journey",
      content: {
        phases: [
          {
            id: "phase-1",
            name: "Phase 1: Self-Serve Discovery",
            color: "#2fd8c8",
            day_range: "Days 0–14",
          },
          {
            id: "phase-2",
            name: "Phase 2: Organic Expansion",
            color: "#7c6df0",
            day_range: "Days 15–30",
          },
        ],
        counters: [
          {
            id: "people",
            label: "People Touching Product",
            sublabel: "Users Active",
            icon: "Users",
            start_value: 0,
            color: "#2fd8c8",
          },
          {
            id: "spend",
            label: "Self-Serve Spend",
            sublabel: "On Platform",
            icon: "DollarSign",
            prefix: "$",
            start_value: 0,
            color: "#f0b429",
          },
          {
            id: "products",
            label: "Products Touched",
            sublabel: "Platform Products Used",
            icon: "Monitor",
            start_value: 0,
            color: "#7c6df0",
          },
          {
            id: "teams",
            label: "Teams Involved",
            sublabel: "Internal Orgs Engaged",
            icon: "Building2",
            start_value: 0,
            color: "#f06460",
          },
        ],
        events: [
          {
            id: "event-day-0",
            day: 0,
            label: "Discovery",
            title: "BADAS Found on Hugging Face",
            description:
              "Parneet Kaur, an ML engineer at May Mobility, finds Nexar's BADAS model during late-night research. No sales contact. She downloads the model weights and schedules her first evaluation.",
            phase_id: "phase-1",
            personas: ["ML Engineer"],
            product: "BADAS",
            trigger: {
              label: "In-Product Trigger",
              text: "BADAS sandbox shows her fleet's edge case performance vs. Nexar's model in under 12 minutes. Gap is visible immediately.",
            },
            spend_delta: "+$0",
            counter_values: { people: 1, spend: 0, products: 1, teams: 1 },
          },
          {
            id: "event-day-3",
            day: 3,
            label: "First Run",
            title: "First Self-Serve Evaluation",
            description:
              "She uploads 50 clips from May Mobility's Austin fleet. BADAS scores each clip 0–1 for collision risk. She sees her model underperforms at unprotected pedestrian crossings — a specific, actionable gap.",
            phase_id: "phase-1",
            personas: ["ML Engineer"],
            product: "BADAS",
            trigger: {
              label: "In-Product Trigger",
              text: "The gap analysis is visual and shareable — a chart she can send to her team. The product made the business case for her.",
            },
            spend_delta: "+$120",
            counter_values: { people: 1, spend: 120, products: 1, teams: 1 },
          },
          {
            id: "event-day-7",
            day: 7,
            label: "Deep Dive",
            title: "Atlas Search — Filling the Gap",
            description:
              "BADAS results link directly to Atlas with a pre-filtered search for pedestrian crossing near-miss scenarios in urban ODDs. She finds 2,300 matching clips, previews 40, and composes her first collection.",
            phase_id: "phase-1",
            personas: ["ML Engineer"],
            product: "Atlas",
            trigger: {
              label: "In-Product Trigger",
              text: "The \"Find Similar Clips in Atlas\" button is one click from her BADAS gap analysis. The product pulls her deeper without a single sales touch.",
            },
            spend_delta: "+$500",
            counter_values: { people: 1, spend: 620, products: 2, teams: 1 },
          },
          {
            id: "event-day-10",
            day: 10,
            label: "Validation",
            title: "283 Safety Events Evaluated",
            description:
              "She runs the full BADAS evaluation on her 283 highest-severity safety events. Result: 52% precision on her fleet's edge cases — a number she can take to her manager. She posts results in her ML team's Slack channel.",
            phase_id: "phase-1",
            personas: ["ML Engineer"],
            product: "BADAS",
            trigger: {
              label: "In-Product Trigger",
              text: "Slack post reads: \"I found something useful — anyone want to see my Nexar BADAS results?\" Three colleagues click the link within the hour.",
            },
            spend_delta: "+$300",
            counter_values: { people: 4, spend: 920, products: 2, teams: 1 },
          },
          {
            id: "event-day-14",
            day: 14,
            label: "Team Spread",
            title: "Colleagues Sign Up Independently",
            description:
              "Three ML colleagues create free Nexar accounts after seeing Parneet's Slack post. Two run their own BADAS evaluations. One opens Atlas to search different scenarios. Zero sales involvement at this point.",
            phase_id: "phase-1",
            personas: ["Colleague"],
            product: "BADAS + Atlas",
            trigger: {
              label: "In-Product Trigger",
              text: "The shared BADAS gap report has a \"Run Your Own Evaluation\" button at the bottom. It's a viral loop embedded in the output.",
            },
            spend_delta: "+$180",
            counter_values: { people: 4, spend: 1100, products: 2, teams: 1 },
          },
          {
            id: "event-day-17",
            day: 17,
            label: "PM Enters",
            title: "Product Manager Discovers Risk Index",
            description:
              "Parneet shares a summary with her PM. He opens the platform to understand it better — and discovers Risk Index. He starts mapping May Mobility's Phoenix ODD against Nexar's geospatial risk scores.",
            phase_id: "phase-2",
            personas: ["PM"],
            product: "Risk Index",
            trigger: {
              label: "In-Product Trigger",
              text: "Risk Index shows a cluster of high-risk intersections in downtown Phoenix that match May Mobility's highest-disengagement zones. The correlation is immediate.",
            },
            spend_delta: "+$250",
            counter_values: { people: 5, spend: 1350, products: 3, teams: 2 },
          },
          {
            id: "event-day-21",
            day: 21,
            label: "4D Recon",
            title: "VP of Safety Requests 3D Reconstruction",
            description:
              "The PM shares the Risk Index correlation with the VP of Safety. She wants spatial scene analysis on the top 10 high-risk events. She requests 4D Reconstruction on specific Atlas clips — the first enterprise-scale request.",
            phase_id: "phase-2",
            personas: ["VP"],
            product: "4D Reconstruction",
            trigger: {
              label: "In-Product Trigger",
              text: "The \"Request 3D Reconstruction\" button appears on any Atlas collection. One click turns video into a spatial scene for simulation. She didn't need to ask Nexar's team.",
            },
            spend_delta: "+$450",
            counter_values: { people: 6, spend: 1800, products: 4, teams: 3 },
          },
          {
            id: "event-day-25",
            day: 25,
            label: "Safety Team",
            title: "Safety Team Joins the Platform",
            description:
              "The Safety team creates a shared workspace. They pull 3D reconstructed scenes directly into their simulation environment. The platform is now infrastructure — embedded in their testing workflow.",
            phase_id: "phase-2",
            personas: ["Safety Team"],
            product: "Atlas + 4D Recon",
            trigger: {
              label: "In-Product Trigger",
              text: "Shared workspaces auto-notify team members of new collections. Five safety engineers join the workspace without a single invitation email from Nexar.",
            },
            spend_delta: "+$400",
            counter_values: { people: 9, spend: 2200, products: 5, teams: 3 },
          },
          {
            id: "event-day-30",
            day: 30,
            label: "Day 30",
            title: "Enterprise Conversation Begins",
            description:
              "Parneet's VP of Safety reaches out to Nexar's sales team — not to evaluate, but to discuss an enterprise contract. She arrives with a self-built ROI case: 52% precision improvement, 9 users, $2,500+ in self-serve spend, and 5 products evaluated. The customer did the work.",
            phase_id: "phase-2",
            personas: ["VP"],
            product: "Enterprise",
            trigger: {
              label: "In-Product Trigger",
              text: "The VP's first message: \"We've been using Nexar for 30 days. We want to talk about what an enterprise contract looks like.\" That's the PLG playbook in one sentence.",
            },
            spend_delta: "+$300",
            counter_values: { people: 9, spend: 2500, products: 5, teams: 3 },
          },
        ],
        autoplay: true,
        interval_ms: 3000,
      },
    },

    // ─── Section 3: The Punchline ─────────────────────────────────────────────
    {
      id: "the-punchline",
      type: "tier-table",
      title: "Day 30. Two Very Different Conversations.",
      subtitle: "// Old Way vs. PLG Way",
      content: {
        mode: "comparison",
        columns: [
          {
            name: "Old Way",
            description: "Day 30: Still Scheduling",
            features: [
              { name: "Still scheduling first NDA", included: false },
              { name: "0 product usage", included: false },
              { name: "0 self-generated evidence", included: false },
              { name: "0 internal champions", included: false },
              { name: "Nexar's team did all the work", included: false },
              { name: "9–12 months to maybe close", included: false },
            ],
          },
          {
            name: "PLG Way",
            description: "Day 30: Pre-Sold",
            is_highlighted: true,
            features: [
              { name: "9 people using the product", included: true },
              { name: "$2,500+ self-serve spend", included: true },
              { name: "5 products evaluated", included: true },
              { name: "3 teams involved", included: true },
              { name: "Customer-built ROI case in hand", included: true },
              {
                name: "Enterprise conversation: customer arrives pre-sold",
                included: true,
              },
            ],
          },
        ],
        kicker:
          "On Day 30, our sales team has their first real conversation. But the customer already did the work.",
      },
    },

    // ─── Section 4: The Economics — Metrics ──────────────────────────────────
    {
      id: "the-economics-metrics",
      type: "metric-dashboard",
      title: "The Unit Economics Are the Story",
      content: {
        metrics: [
          {
            id: "cac",
            label: "Customer Acquisition Cost",
            value: "~$0",
            description:
              "PLG-sourced pipeline costs Nexar nothing. Customers find us through Hugging Face, research papers, benchmarks, and colleague referrals.",
          },
          {
            id: "gross-margin",
            label: "Gross Margin on Enriched Data",
            value: "75–85%",
            description:
              "Raw clip: $8. With BADAS + 4D Reconstruction: $20–52. The enrichment chain is where margin compounds with each product added.",
          },
          {
            id: "time-to-enterprise",
            label: "Time to Enterprise Conversation",
            value: "30 Days",
            description:
              "vs. 9–12 months in the current sales motion. The customer arrives pre-sold with internal champions and self-generated ROI evidence.",
          },
        ],
      },
    },

    // ─── Section 5: The Economics — Revenue Staircase ────────────────────────
    {
      id: "the-economics-staircase",
      type: "data-viz",
      title: "One PLG-Sourced Customer at Scale",
      content: {
        chart_type: "staircase",
        data: [
          {
            label: "Self-Serve Month 1",
            amount: "$500–2.5K",
            description: "BADAS + Atlas credits",
            color: "#2fd8c8",
          },
          {
            label: "Pro Tier Months 2–6",
            amount: "$3K–15K",
            description: "Team seat expansion",
            color: "#7c6df0",
          },
          {
            label: "Enterprise Year 1",
            amount: "$120K–500K",
            description: "Committed annual contract",
            color: "#f0b429",
          },
          {
            label: "Fleet Intel Year 2+",
            amount: "$750K–3M+/yr",
            description: "120K–500K clips/week",
            color: "#f06460",
          },
        ],
      },
    },

    // ─── Section 6: The Economics — Enrichment Layers ────────────────────────
    {
      id: "the-economics-layers",
      type: "data-viz",
      title: "The Enrichment Margin Chain",
      content: {
        chart_type: "layers",
        data: [
          {
            label: "Raw Clip (Archive)",
            price: "$5–8",
            color: "#4d5870",
          },
          {
            label: "+ BADAS Scoring",
            price: "$10–15",
            color: "#f06460",
          },
          {
            label: "+ 4D Reconstruction",
            price: "$20–52",
            color: "#7c6df0",
          },
          {
            label: "+ Safety Narratives",
            price: "$10–25K/qtr",
            color: "#f0b429",
          },
        ],
        callout:
          "Machine cost per 4D scene: <$5. Processing time: 45 min (down from 15+ hrs). At scale, Fleet Intelligence is Nexar's highest-margin business — customers bring their own video.",
      },
    },

    // ─── Section 7: The Evidence — Proof Case ────────────────────────────────
    {
      id: "the-evidence-proof",
      type: "rich-text",
      title: "This Isn't a Hypothetical.",
      content: {
        tag: {
          label: "Proof Case — March 2026",
          color: "#2fd8c8",
        },
        summary:
          "**Parneet Kaur**, an ML engineer, found Nexar's BADAS model on Hugging Face. Without any sales contact, she downloaded it, ran her own evaluation on **283 safety events**, achieved **52% precision** on her fleet's edge cases, and became the internal champion. She shared results in her team Slack. Her PM asked to see Atlas. Her VP of Safety opened an enterprise conversation.",
        callout: {
          type: "insight",
          text: "MOU signed March 2026 — She IS the PLG user we're designing for.",
        },
      },
    },

    // ─── Section 8: The Evidence — Customer Signals ───────────────────────────
    {
      id: "the-evidence-signals",
      type: "expandable-cards",
      title: "Customer Signals",
      subtitle:
        "6 of 6 enterprise customers analyzed are asking for self-serve access",
      content: {
        columns: 3,
        cards: [
          {
            id: "may-mobility",
            title: "May Mobility",
            summary:
              "ML engineer self-discovered BADAS on Hugging Face. No sales contact.",
            metric: {
              value: "MOU signed",
              label: "Deal Status",
            },
          },
          {
            id: "qualcomm",
            title: "Qualcomm",
            summary:
              "10 months from first meeting to verbal commit. Engineers wanted direct API access at every stage.",
            metric: {
              value: "$500K+ potential",
              label: "Deal Status",
            },
          },
          {
            id: "waymo",
            title: "Waymo",
            summary:
              "Safety Research team running POC on Risk Index — correlating Nexar scores with internal Phoenix/LA/SF data.",
            metric: {
              value: "Multi-product POC",
              label: "Deal Status",
            },
          },
          {
            id: "kodiak",
            title: "Kodiak",
            summary:
              "CityStream for trucking routes. 5 months in, no deal. Team blocks sales touchpoints.",
            metric: {
              value: "Stalled 5 months",
              label: "Deal Status",
            },
          },
          {
            id: "zoox",
            title: "Zoox",
            summary:
              "44 accounts on CityStream — suspended Jan 2026 to force engagement. Wants BADAS temporal labels on their own data.",
            metric: {
              value: "Relationship since 2021",
              label: "Deal Status",
            },
          },
          {
            id: "nuro",
            title: "Nuro",
            summary:
              "Ask-deliver-silence loop for 3 years. Engineers consistently ask for direct platform access.",
            metric: {
              value: "3 years, no close",
              label: "Deal Status",
            },
          },
        ],
      },
    },

    // ─── Section 9: Closing Quote — The PLG Thesis ───────────────────────────
    {
      id: "the-plg-thesis",
      type: "rich-text",
      title: "The PLG Thesis",
      content: {
        summary:
          "The researcher at NVIDIA doesn't need permission to explore Nexar. They just need to find it, feel its power in under 60 seconds, and want to share it with their team. Build that, and the enterprise pipeline builds itself.",
        callout: {
          type: "quote",
          text: "\"The researcher at NVIDIA doesn't need permission to explore Nexar. They just need to find it, feel its power in under 60 seconds, and want to share it with their team. Build that, and the enterprise pipeline builds itself.\"",
        },
      },
    },
  ],
};

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

// ── The Consolidated Journey ───────────────────────────────────────
const consolidatedJourney = {
  id: "customer-journey-diagnosis-to-dependency",
  type: "guided-journey",
  title: "The Customer Journey: From Diagnosis to Platform Dependency",
  subtitle:
    "BADAS diagnoses model failures. Each diagnosis creates demand for data. Each data purchase improves the model. Each improvement reveals deeper failures. The loop accelerates \u2014 and every acceleration grows revenue.",
  content: {
    phases: [
      {
        id: "phase-developer",
        name: "Developer-Led Acquisition",
        color: "#2fd8c8",
        day_range: "Weeks 1\u20138",
      },
      {
        id: "phase-enterprise",
        name: "Enterprise Expansion",
        color: "#7c6df0",
        day_range: "Months 3\u201324",
      },
    ],
    counters: [
      {
        id: "cnt-users",
        label: "Active Users",
        start_value: 0,
        color: "#2fd8c8",
      },
      {
        id: "cnt-teams",
        label: "Teams",
        start_value: 0,
        color: "#36d399",
      },
      {
        id: "cnt-arr",
        label: "Spend / ARR",
        prefix: "$",
        start_value: 0,
        color: "#7c6df0",
      },
      {
        id: "cnt-products",
        label: "Products Used",
        start_value: 0,
        color: "#f0b429",
      },
    ],
    events: [
      // ── Phase 1: Developer-Led Acquisition ─────────────────────
      {
        id: "evt-week1",
        day: 1,
        label: "Week 1",
        title: "The First Diagnosis",
        description:
          "An ML engineer at a leading AV company has a model that underperforms on unprotected pedestrian crossings. Traditional data procurement takes 6\u20138 weeks and delivers generic footage. She finds Nexar\u2019s BADAS model on Hugging Face during late-night research. No sales contact. No demo request. She runs it against her fleet\u2019s safety-critical events. BADAS flags risk in scenarios her own model scored as safe. For the first time, she has an external diagnosis of exactly where her model fails.",
        phase_id: "phase-developer",
        personas: ["ML Engineer"],
        product: "BADAS",
        trigger: {
          label: "In-Product Trigger",
          description:
            "BADAS on Hugging Face is the zero-friction entry point. She runs it on her own data, on her own hardware, on her own schedule. The diagnosis is immediate and specific.",
        },
        spend_delta: "$0",
        counter_values: {
          "cnt-users": 1,
          "cnt-teams": 1,
          "cnt-arr": 0,
          "cnt-products": 1,
        },
      },
      {
        id: "evt-week2",
        day: 2,
        label: "Week 2",
        title: "The First Prescription \u2014 Data to Fix the Gap",
        description:
          "The diagnosis told her where the model fails. Now she needs the data to fix it. She discovers Atlas: 60 million real-world driving scenarios, searchable by the exact categories BADAS flagged. She searches for nighttime pedestrian crossings, occluded VRUs, adverse weather. 2,300 matching clips. She downloads 100 across her three weakest categories and validates data quality against her pipeline.",
        phase_id: "phase-developer",
        personas: ["ML Engineer"],
        product: "Atlas",
        trigger: {
          label: "In-Product Trigger",
          description:
            "BADAS gap analysis links directly to Atlas, pre-filtered to failure categories. One click from diagnosis to prescription.",
        },
        spend_delta: "+$800",
        counter_values: {
          "cnt-users": 1,
          "cnt-teams": 1,
          "cnt-arr": 800,
          "cnt-products": 2,
        },
      },
      {
        id: "evt-week3",
        day: 3,
        label: "Week 3",
        title: "The Evidence Builds \u2014 Colleagues Start Their Own Loops",
        description:
          "She runs her model against the 100 new clips. The gap is quantified: Nexar\u2019s archive has 340+ scenarios in the category where their internal training set has 12. She produces a benchmark report and posts it in Slack. Three colleagues sign up. Two run BADAS on their own fleet events and discover their own failure categories \u2014 different vehicle types, different geographies, same pattern. One searches Atlas for construction zone scenarios. Each colleague starts their own diagnostic loop. Demand for data is multiplying.",
        phase_id: "phase-developer",
        personas: ["ML Engineer", "+3 Colleagues"],
        product: "BADAS + Atlas",
        trigger: {
          label: "In-Product Trigger",
          description:
            "The benchmark report is the artifact that spreads. Each colleague who runs BADAS starts a new diagnosis \u2192 prescription cycle. Every Slack share is a warm referral.",
        },
        spend_delta: "+$1,700",
        counter_values: {
          "cnt-users": 5,
          "cnt-teams": 1,
          "cnt-arr": 2500,
          "cnt-products": 2,
        },
      },
      {
        id: "evt-week4-5",
        day: 4,
        label: "Week 4\u20135",
        title: "Different Teams, Different Problems \u2014 Same Platform",
        description:
          "The ML team\u2019s benchmark report circulates in internal planning documents. The PM sees geographic patterns in the failure data and opens Risk Index \u2014 collision risk mapped by intersection across their Phoenix ODD. He realizes the corridors where the model fails are the same corridors where real-world risk is highest. Separately, a routing engineer hears about Nexar from the ML team\u2019s Slack channel, opens the platform, and discovers CityStream \u2014 real-time work zone detection and road condition monitoring across their routes. Two new teams, two new problems solved, zero sales involvement.",
        phase_id: "phase-developer",
        personas: ["PM", "Routing Engineer"],
        product: "Risk Index + CityStream",
        trigger: {
          label: "In-Product Trigger",
          description:
            "The diagnostic output from BADAS pulls different teams in for different reasons. Risk Index answers \u201cwhere is it dangerous?\u201d CityStream answers \u201cwhat\u2019s happening on our routes right now?\u201d The platform surfaces adjacent capabilities naturally.",
        },
        spend_delta: "+$3,500",
        counter_values: {
          "cnt-users": 8,
          "cnt-teams": 3,
          "cnt-arr": 6000,
          "cnt-products": 4,
        },
      },
      {
        id: "evt-week6-8",
        day: 5,
        label: "Week 6\u20138",
        title: "The Volume Realization \u2014 Hundreds of Clips Isn\u2019t Enough",
        description:
          "The ML team has run the BADAS \u2192 Atlas \u2192 retrain loop multiple times. Each cycle exposed new failure categories. They\u2019ve now mapped over a dozen gap categories across their ODD. Filling those gaps requires not hundreds of clips but tens of thousands. That\u2019s a procurement-scale purchase, not a credit card purchase. The VP sees $15,000 in charges across 3 teams. She doesn\u2019t shut it down \u2014 the diagnostic reports are too compelling. She requests a meeting with Nexar. Not to evaluate. To negotiate volume pricing for the data her teams have already proven they need.",
        phase_id: "phase-developer",
        personas: ["VP of Safety"],
        product: "Enterprise Trigger",
        trigger: {
          label: "In-Product Trigger",
          description:
            "The $15K in self-serve spend proved the data works. The gap categories mapped by BADAS define the scope. The enterprise contract sizes itself \u2014 it\u2019s arithmetic, not negotiation.",
        },
        spend_delta: "+$9,000",
        counter_values: {
          "cnt-users": 14,
          "cnt-teams": 3,
          "cnt-arr": 15000,
          "cnt-products": 4,
        },
      },
      // ── Phase 2: Enterprise Expansion ──────────────────────────
      {
        id: "evt-month3",
        day: 6,
        label: "Month 3",
        title: "First Contract \u2014 The Diagnostic Loop Goes Production",
        description:
          "Enterprise deal closes. The core: volume procurement of enriched clips across the failure categories BADAS identified, plus Atlas access for ongoing search and BADAS API for continuous gap monitoring. $500K ACV. The contract isn\u2019t sized by a sales negotiation \u2014 it\u2019s sized by the diagnostic output. The customer arrived with their own gap analysis, their own data quality validation, and their own volume requirements. The deal that traditionally takes 9\u201312 months closed in under 90 days.",
        phase_id: "phase-enterprise",
        personas: ["VP of Safety"],
        product: "Enterprise Contract",
        trigger: {
          label: "In-Product Trigger",
          description:
            "The BADAS diagnostic loop is now on an enterprise contract. The team runs it quarterly. Each cycle surfaces new failure modes. Each cycle generates a new clip procurement order. Revenue is recurring because the diagnosis is recurring.",
        },
        spend_delta: "$500K ARR",
        counter_values: {
          "cnt-users": 18,
          "cnt-teams": 3,
          "cnt-arr": 500000,
          "cnt-products": 4,
        },
      },
      {
        id: "evt-month5",
        day: 7,
        label: "Month 5",
        title: "Same Data, Higher Value \u2014 From Training Clips to Simulation Scenes",
        description:
          "The ML team has purchased tens of thousands of Atlas clips for retraining. The simulation team has been watching. They need the same scenarios \u2014 the highest-risk edge cases BADAS identified \u2014 but in a format their simulation pipeline can ingest: full 3D reconstruction with ego-motion, actor trajectories, and multi-sensor output. Reconstruction doesn\u2019t replace the Atlas clips. It transforms the most valuable ones into simulation-ready scenes. Same data the ML team already validated, now usable across a second workflow at higher margin.",
        phase_id: "phase-enterprise",
        personas: ["Simulation Engineer"],
        product: "4D Reconstruction",
        trigger: {
          label: "In-Product Trigger",
          description:
            "The simulation team didn\u2019t need a separate discovery. They pointed at the ML team\u2019s Atlas collections and said \u201cwe need those in 3D.\u201d Reconstruction is an enrichment layer on data the customer already trusts.",
        },
        spend_delta: "+$400K",
        counter_values: {
          "cnt-users": 25,
          "cnt-teams": 4,
          "cnt-arr": 900000,
          "cnt-products": 5,
        },
      },
      {
        id: "evt-month7",
        day: 8,
        label: "Month 7",
        title: "Real-Time Intelligence Goes Production",
        description:
          "The routing engineer who discovered CityStream during the self-serve phase has been evaluating it for three months. Now moves from exploration to production deployment. Real-time work zone detection, road conditions, and infrastructure monitoring across their full operating territory. Daily operational workflows built around CityStream data. Their legacy route intelligence vendor starts losing logins \u2014 not because anyone sold against it, but because CityStream data is fresher from Nexar\u2019s live 350K dashcam network.",
        phase_id: "phase-enterprise",
        personas: ["Routing Team"],
        product: "CityStream",
        trigger: {
          label: "In-Product Trigger",
          description:
            "Every team that goes production deepens organizational dependency. The platform now serves three different workflows: model improvement (ML), scenario simulation (Sim), route intelligence (Routing).",
        },
        spend_delta: "+$300K",
        counter_values: {
          "cnt-users": 30,
          "cnt-teams": 5,
          "cnt-arr": 1200000,
          "cnt-products": 6,
        },
      },
      {
        id: "evt-month9",
        day: 9,
        label: "Month 9",
        title: "Executive Sponsor Emerges \u2014 Three Contracts Become One",
        description:
          "The VP of Engineering notices three teams using the same vendor independently \u2014 each with their own contract, their own budget, their own workflows. She asks for a consolidated enterprise agreement with volume pricing. Individual contracts roll up. Quarterly executive reviews begin. For the first time, she has visibility into total platform usage across all teams \u2014 and she sees something: multiple teams are running BADAS on their own fleet data in separate batches. Safety does it weekly. Simulation does it for scenario selection. The ML team does it for benchmarking. Same model, same workflow, fragmented execution.",
        phase_id: "phase-enterprise",
        personas: ["VP of Engineering"],
        product: "Consolidation",
        trigger: {
          label: "In-Product Trigger",
          description:
            "Consolidation creates the executive visibility that triggers the next phase.",
        },
        spend_delta: "+$600K",
        counter_values: {
          "cnt-users": 35,
          "cnt-teams": 5,
          "cnt-arr": 1800000,
          "cnt-products": 6,
        },
      },
      {
        id: "evt-month12",
        day: 10,
        label: "Month 12",
        title: "The Loop Goes Continuous",
        description:
          "The VP of Engineering has had one quarter of consolidated data. The pattern is clear: three teams running BADAS in weekly batches. She asks the obvious question: \u201cWhy not pipe everything through continuously?\u201d Fleet Intelligence begins. BADAS processes the full fleet feed \u2014 120,000 events per week, scored automatically, triaged by risk severity. Manual safety review volume drops 60%. This isn\u2019t a new product \u2014 it\u2019s the same diagnostic loop that started in Week 1, now running at production scale. Revenue shifts from transactional clip procurement to continuous consumption.",
        phase_id: "phase-enterprise",
        personas: ["Safety Operations"],
        product: "Fleet Intelligence",
        trigger: {
          label: "In-Product Trigger",
          description:
            "Once the safety triage pipeline runs on BADAS, switching means rebuilding the entire safety operations workflow. Stickiness becomes structural.",
        },
        spend_delta: "+$1.2M",
        counter_values: {
          "cnt-users": 40,
          "cnt-teams": 6,
          "cnt-arr": 3000000,
          "cnt-products": 7,
        },
      },
      {
        id: "evt-month16",
        day: 11,
        label: "Month 16",
        title: "Legacy Vendor Deprecated \u2014 Budget Reallocated",
        description:
          "The operations team formally deprecates their previous route intelligence vendor. The team just stopped logging in months ago. Budget reallocated to Nexar \u2014 expanded CityStream coverage to new operating territories and Risk Index for city-level safety profiling. Meanwhile, Fleet Intelligence volumes have grown as the fleet expands and additional teams feed their events into the pipeline.",
        phase_id: "phase-enterprise",
        personas: ["Operations"],
        product: "Platform Gravity",
        trigger: {
          label: "In-Product Trigger",
          description:
            "Platform gravity compounds with every team that goes production. Each deprecated vendor is budget freed up for Nexar. Each fleet expansion is more events flowing through BADAS.",
        },
        spend_delta: "+$1.5M",
        counter_values: {
          "cnt-users": 45,
          "cnt-teams": 7,
          "cnt-arr": 4500000,
          "cnt-products": 7,
        },
      },
      {
        id: "evt-month18",
        day: 12,
        label: "Month 18",
        title: "Multi-Year Agreement \u2014 The Platform Is Infrastructure",
        description:
          "All contracts consolidate into a 3-year strategic commitment. Volume step-up: guaranteed minimums reflect current run rate plus projected fleet growth. Fleet Intelligence expands to additional teams and geographies. Engineering builds internal tooling on the platform API \u2014 custom dashboards, automated data pipelines, simulation environment integrations. Every custom integration is a switching cost that compounds. The BADAS diagnostic loop now runs automatically: fleet events scored continuously, new failure modes flagged quarterly, Atlas procurement generated from the gap analysis, reconstruction scenes delivered monthly to simulation.",
        phase_id: "phase-enterprise",
        personas: ["CEO", "VP Engineering"],
        product: "Strategic Commitment",
        trigger: {
          label: "In-Product Trigger",
          description:
            "The enterprise admin dashboard shows cumulative ROI. The product pays for itself.",
        },
        spend_delta: "+$2M",
        counter_values: {
          "cnt-users": 50,
          "cnt-teams": 8,
          "cnt-arr": 6500000,
          "cnt-products": 8,
        },
      },
      {
        id: "evt-month21",
        day: 13,
        label: "Month 21",
        title: "The Loop Reaches the Vehicle",
        description:
          "BADAS has been running in the cloud for 18 months \u2014 processing 120K+ fleet events per week, proving its accuracy across millions of scored clips. The vehicle software team sees the latency: they\u2019re scoring events after the fact. What if they scored them in real-time on the vehicle itself? BADAS Flash deploys on 100 vehicles. Real-time collision anticipation in the production AV stack. Not a new product \u2014 the same model moved closer to the data source because the cloud version proved it works.",
        phase_id: "phase-enterprise",
        personas: ["Vehicle Software"],
        product: "BADAS Edge",
        trigger: {
          label: "In-Product Trigger",
          description:
            "From weekly batch scoring to continuous cloud processing to real-time on-vehicle prediction. Each acceleration is faster, stickier, and higher revenue.",
        },
        spend_delta: "+$2M",
        counter_values: {
          "cnt-users": 58,
          "cnt-teams": 9,
          "cnt-arr": 8500000,
          "cnt-products": 8,
        },
      },
      {
        id: "evt-month24",
        day: 14,
        label: "Month 24",
        title: "$10M ARR \u2014 The Renewal Takes 15 Minutes",
        description:
          "8 products. 9 teams. The BADAS diagnostic loop runs at every layer \u2014 real-time on vehicles, continuously in the cloud, quarterly for model improvement, annually for safety benchmarking. Atlas procurement automated from gap analyses. Reconstruction delivers 500 scenes per month. Fleet Intelligence processes 150K+ events per week. Removing Nexar would require C-level approval and a multi-quarter migration. The renewal conversation takes 15 minutes.\n\nOne engineer\u2019s late-night Hugging Face discovery became $10M in annual revenue in 24 months. The diagnostic loop never stopped turning.",
        phase_id: "phase-enterprise",
        personas: ["Full Organization"],
        product: "Platform Dependency",
        trigger: {
          label: "In-Product Trigger",
          description:
            "The enterprise admin dashboard shows cumulative ROI. The product pays for itself.",
        },
        spend_delta: "$10M ARR",
        counter_values: {
          "cnt-users": 75,
          "cnt-teams": 9,
          "cnt-arr": 10000000,
          "cnt-products": 8,
        },
      },
    ],
    autoplay: true,
    interval_ms: 4000,
  },
};

// ── Fetch current deck ─────────────────────────────────────────────
const { data, error: fetchErr } = await sb
  .from("artifacts")
  .select("id, sections")
  .eq("slug", "investor-deck")
  .single();

if (fetchErr || !data) {
  console.error("Fetch error:", fetchErr);
  process.exit(1);
}

console.log(`Current deck has ${data.sections.length} beats:`);
data.sections.forEach((s, i) => {
  console.log(
    `  Beat ${String(i + 1).padStart(2, "0")} | ${s.type.padEnd(18)} | ${s.title || "(no title)"}`
  );
});

// Remove:
//   Beat 4 (index 3) — guided-journey (old journey 1)
//   Beat 5 (index 4) — tier-table (Day 30 comparison — now redundant)
//   Beat 6 (index 5) — guided-journey (old journey 2)
// Insert: consolidated journey at index 3
const removeIndices = new Set([3, 4, 5]);

const updatedSections = [
  ...data.sections.slice(0, 3), // Beats 1-3 (why now, the moment, product architecture)
  consolidatedJourney, // New consolidated journey
  ...data.sections.filter((_, i) => i > 5), // Everything after old beat 6
];

console.log(`\nRemoving beats 4, 5, 6. Inserting consolidated journey.`);

const { error: updateErr } = await sb
  .from("artifacts")
  .update({ sections: updatedSections })
  .eq("id", data.id);

if (updateErr) {
  console.error("Update error:", updateErr);
  process.exit(1);
}

// ── Verify ─────────────────────────────────────────────────────────
const { data: verify, error: verifyErr } = await sb
  .from("artifacts")
  .select("sections")
  .eq("slug", "investor-deck")
  .single();

if (verifyErr || !verify) {
  console.error("Verify error:", verifyErr);
  process.exit(1);
}

console.log(`\nUpdated deck has ${verify.sections.length} beats:\n`);
verify.sections.forEach((s, i) => {
  console.log(
    `  Beat ${String(i + 1).padStart(2, "0")} | ${s.type.padEnd(18)} | ${s.title || "(no title)"}`
  );
});

console.log("\nDone. Two journeys + tier-table consolidated into one guided-journey.");

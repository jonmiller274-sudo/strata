/**
 * Adds the Enterprise Customer Journey section to the Nexar PLG Go-to-Market artifact.
 *
 * Usage: node scripts/add-enterprise-journey.mjs
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load env vars from .env.local
const envContent = readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k?.trim()) env[k.trim()] = v.join("=").trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const ARTIFACT_SLUG = "investor-deck";

// ─── Enterprise Journey Section ───────────────────────────────────────────────

const enterpriseJourney = {
  id: "enterprise-journey",
  type: "guided-journey",
  title: "The next 24 months: from first contract to platform dependency",
  subtitle:
    "Every dollar of initial contract revenue grows 10–40x through product expansion, team expansion, and operational lock-in.",
  content: {
    phases: [
      {
        id: "ej-phase-1",
        name: "Beachhead",
        color: "#2fd8c8",
        day_range: "Months 2–6",
      },
      {
        id: "ej-phase-2",
        name: "Cross-Team",
        color: "#7c6df0",
        day_range: "Months 6–12",
      },
      {
        id: "ej-phase-3",
        name: "Fleet Intel",
        color: "#f0b429",
        day_range: "Months 12–18",
      },
      {
        id: "ej-phase-4",
        name: "Full Suite",
        color: "#f06460",
        day_range: "Months 18–24",
      },
    ],
    counters: [
      {
        id: "arr",
        icon: "DollarSign",
        color: "#f0b429",
        label: "ARR",
        prefix: "$",
        sublabel: "Annual Revenue",
        start_value: 0,
      },
      {
        id: "ej-products",
        icon: "Monitor",
        color: "#7c6df0",
        label: "Products",
        sublabel: "Deployed",
        start_value: 0,
      },
      {
        id: "ej-teams",
        icon: "Building2",
        color: "#2fd8c8",
        label: "Teams",
        sublabel: "Integrated",
        start_value: 0,
      },
      {
        id: "dependency",
        icon: "Lock",
        color: "#f06460",
        label: "Dependency",
        sublabel: "Switching Cost",
        start_value: 0,
      },
    ],
    autoplay: false,
    interval_ms: 4000,
    events: [
      // ── Phase 1: Beachhead (Months 2–6) ──────────────────────────────────
      {
        id: "ej-event-1",
        day: 60, // Month 2
        label: "Mo 2",
        title: "First Contract Signed",
        description:
          "The PLG journey did its job. The enterprise deal closes — but it starts narrow: one product solving one team's most urgent problem. A scoped annual commitment, $150K–$500K ACV. The safety team is betting that AI-scored collision risk will hit 80%+ precision on their fleet's edge cases.",
        phase_id: "ej-phase-1",
        personas: ["VP Safety"],
        product: "BADAS",
        trigger: {
          label: "Why It Matters",
          text: "The customer arrived with a self-built ROI case. No slides, no POC gate — they already proved it works on their data during the PLG phase.",
        },
        spend_delta: "+$150K",
        counter_values: { arr: 150000, "ej-products": 1, "ej-teams": 1, dependency: 1 },
      },
      {
        id: "ej-event-2",
        day: 120, // Month 4
        label: "Mo 4",
        title: "Adjacent Team Discovers the Platform",
        description:
          "While the safety team runs their pilot, an engineer on the simulation team finds the self-serve sandbox. She starts evaluating 3D reconstruction for scenario generation — a completely different use case, on a different budget. No sales involvement.",
        phase_id: "ej-phase-1",
        personas: ["Simulation Engineer"],
        product: "Sandbox",
        trigger: {
          label: "The PLG Flywheel",
          text: "The enterprise contract didn't lock the door on self-serve. Other teams still discover the platform organically — seeding the next expansion without a single outbound email.",
        },
        spend_delta: "+$0",
        counter_values: { arr: 150000, "ej-products": 1, "ej-teams": 2, dependency: 1 },
      },
      {
        id: "ej-event-3",
        day: 180, // Month 6
        label: "Mo 6",
        title: "Beachhead Proven — Renewal Is Automatic",
        description:
          "The safety team hits their success metric: 85% precision on fleet edge cases, up from 52% at first evaluation. The product moves from 'evaluation' to 'operational dependency.' Contract renewal isn't a decision — it's a formality.",
        phase_id: "ej-phase-1",
        personas: ["VP Safety"],
        product: "BADAS",
        trigger: {
          label: "Stickiness Signal",
          text: "Daily BADAS scores are now embedded in the safety team's morning standup. Removing it would mean rebuilding their triage workflow from scratch.",
        },
        spend_delta: "+$250K",
        counter_values: { arr: 400000, "ej-products": 1, "ej-teams": 2, dependency: 2 },
      },

      // ── Phase 2: Cross-Team (Months 6–12) ────────────────────────────────
      {
        id: "ej-event-4",
        day: 210, // Month 7
        label: "Mo 7",
        title: "Second Product Pulled In",
        description:
          "The simulation team that found the sandbox during Phase 1 pulls in 4D Reconstruction. Different budget, different use case, different team — same platform login. The expansion came from the bottom, not the top.",
        phase_id: "ej-phase-2",
        personas: ["Simulation Lead"],
        product: "4D Reconstruction",
        trigger: {
          label: "Revenue Expansion",
          text: "Second product typically adds 40–80% to the initial contract value. A $400K deal becomes $700K without a single new sales cycle.",
        },
        spend_delta: "+$300K",
        counter_values: { arr: 700000, "ej-products": 2, "ej-teams": 3, dependency: 2 },
      },
      {
        id: "ej-event-5",
        day: 270, // Month 9
        label: "Mo 9",
        title: "Executive Sponsor Emerges",
        description:
          "The VP of Engineering notices two teams using the same vendor independently — each with their own contract, their own data, their own workflows. She asks for a consolidated account with volume pricing. The platform just got an executive champion.",
        phase_id: "ej-phase-2",
        personas: ["VP Engineering"],
        product: "Platform",
        trigger: {
          label: "Consolidation Signal",
          text: "When an executive asks 'why do we have two separate contracts with the same vendor?' — that's the moment the account shifts from tactical purchases to strategic relationship.",
        },
        spend_delta: "+$200K",
        counter_values: { arr: 900000, "ej-products": 2, "ej-teams": 3, dependency: 3 },
      },
      {
        id: "ej-event-6",
        day: 330, // Month 11
        label: "Mo 11",
        title: "Third Team, Third Product, One Platform",
        description:
          "The operations team deploys route intelligence for fleet planning. Three teams, three products, three separate value propositions — unified under one platform. Cross-team discovery now happens without any external push.",
        phase_id: "ej-phase-2",
        personas: ["Ops Lead"],
        product: "CityStream",
        trigger: {
          label: "Network Effect",
          text: "When one team's output feeds another team's input — safety scores informing route decisions — the products stop being tools and start being infrastructure.",
        },
        spend_delta: "+$300K",
        counter_values: { arr: 1200000, "ej-products": 3, "ej-teams": 4, dependency: 3 },
      },

      // ── Phase 3: Fleet Intel (Months 12–18) ──────────────────────────────
      {
        id: "ej-event-7",
        day: 360, // Month 12
        label: "Mo 12",
        title: "The Pivotal Question",
        description:
          "The safety team asks: 'Why are we only scoring your data? What if we score our own 120K weekly fleet events?' Revenue model shifts from transactional (buy data as needed) to consumption (process data continuously). This is the inflection point.",
        phase_id: "ej-phase-3",
        personas: ["Safety Director"],
        product: "Fleet Intelligence",
        trigger: {
          label: "Model Shift",
          text: "Transactional data purchases are project-based — you buy what you need, then stop. Fleet Intelligence is continuous — revenue scales with fleet size and time, not purchase decisions.",
        },
        spend_delta: "+$500K",
        counter_values: { arr: 1700000, "ej-products": 4, "ej-teams": 5, dependency: 3 },
      },
      {
        id: "ej-event-8",
        day: 420, // Month 14
        label: "Mo 14",
        title: "Data Flywheel Activates",
        description:
          "Fleet data flowing through the platform improves the AI models. Better models produce more accurate safety scores. More accurate scores mean more teams trust the system. The customer's own data makes the product better — for them and for every future customer.",
        phase_id: "ej-phase-3",
        personas: ["ML Team"],
        product: "Fleet Intelligence",
        trigger: {
          label: "Compounding Effect",
          text: "Every fleet event processed trains the model. Every model improvement increases precision. Every precision gain deepens dependency. The flywheel has no natural stopping point.",
        },
        spend_delta: "+$300K",
        counter_values: { arr: 2000000, "ej-products": 4, "ej-teams": 5, dependency: 4 },
      },
      {
        id: "ej-event-9",
        day: 480, // Month 16
        label: "Mo 16",
        title: "Legacy Point Solution Quietly Dies",
        description:
          "The operations team deprecates their previous route intelligence vendor. Not because anyone sold against it — because the platform already replaced its function three months ago. The team just stopped logging in.",
        phase_id: "ej-phase-3",
        personas: ["Ops Lead"],
        product: "CityStream + Risk Index",
        trigger: {
          label: "Competitive Displacement",
          text: "The most dangerous kind of competitor loss: the customer didn't even make a switching decision. They just stopped needing the other tool.",
        },
        spend_delta: "+$500K",
        counter_values: { arr: 2500000, "ej-products": 5, "ej-teams": 6, dependency: 4 },
      },

      // ── Phase 4: Full Suite (Months 18–24) ───────────────────────────────
      {
        id: "ej-event-10",
        day: 540, // Month 18
        label: "Mo 18",
        title: "Enterprise Agreement Consolidates Everything",
        description:
          "Individual team contracts roll up into a single enterprise agreement. Multi-product deal with volume commitments. Dedicated success team assigned. Quarterly executive reviews begin. The relationship is now strategic, not transactional.",
        phase_id: "ej-phase-4",
        personas: ["CTO"],
        product: "Enterprise Platform",
        trigger: {
          label: "Strategic Lock-In",
          text: "An enterprise agreement isn't just a bigger contract — it's a signal that removing the platform would require C-level approval and a multi-quarter migration plan.",
        },
        spend_delta: "+$1.5M",
        counter_values: { arr: 4000000, "ej-products": 6, "ej-teams": 7, dependency: 4 },
      },
      {
        id: "ej-event-11",
        day: 630, // Month 21
        label: "Mo 21",
        title: "Custom Integrations Compound Switching Cost",
        description:
          "Engineering builds internal tooling on top of the platform API. Custom dashboards, automated pipelines, integration with their simulation environment. Every custom integration is a switching cost that compounds — each one makes the next migration harder to justify.",
        phase_id: "ej-phase-4",
        personas: ["Engineering"],
        product: "Platform API",
        trigger: {
          label: "Integration Depth",
          text: "When a customer builds their own tools on your API, they've stopped evaluating you. You're infrastructure now — invisible, essential, and extremely expensive to replace.",
        },
        spend_delta: "+$1M",
        counter_values: { arr: 5000000, "ej-products": 6, "ej-teams": 7, dependency: 5 },
      },
      {
        id: "ej-event-12",
        day: 720, // Month 24
        label: "Mo 24",
        title: "Multi-Year Renewal: $8M ARR, 90%+ Retention",
        description:
          "7 products, 8 teams, embedded in daily operations across the organization. Custom integrations, published benchmarks, and regulatory citations make the platform institutional infrastructure. Removing it would require C-level approval and a multi-quarter migration. The renewal conversation takes 15 minutes.",
        phase_id: "ej-phase-4",
        personas: ["CTO", "VP Safety"],
        product: "Full Platform",
        trigger: {
          label: "The Proof",
          text: "Net revenue retention of 140–180%. Every dollar of initial contract revenue grew 10–40x through product expansion, team expansion, and operational embedding — with zero incremental sales cost.",
        },
        spend_delta: "+$2M",
        counter_values: { arr: 8000000, "ej-products": 7, "ej-teams": 8, dependency: 5 },
      },

    ],
  },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Fetching artifact: ${ARTIFACT_SLUG}`);

  const { data: artifact, error: fetchError } = await supabase
    .from("artifacts")
    .select("*")
    .eq("slug", ARTIFACT_SLUG)
    .single();

  if (fetchError || !artifact) {
    console.error("Failed to fetch artifact:", fetchError?.message);
    process.exit(1);
  }

  console.log(`Found: "${artifact.title}" (${artifact.sections.length} sections)`);

  // Check if enterprise journey already exists
  const existing = artifact.sections.find((s) => s.id === "enterprise-journey");
  if (existing) {
    console.log("Enterprise journey already exists — replacing it.");
    artifact.sections = artifact.sections.filter((s) => s.id !== "enterprise-journey");
  }

  // Insert after the existing guided-journey (index 1), or at end
  const existingJourneyIdx = artifact.sections.findIndex(
    (s) => s.type === "guided-journey"
  );
  const insertIdx = existingJourneyIdx >= 0 ? existingJourneyIdx + 1 : artifact.sections.length;

  artifact.sections.splice(insertIdx, 0, enterpriseJourney);

  console.log(`Inserting at index ${insertIdx}. New section count: ${artifact.sections.length}`);

  const { error: updateError } = await supabase
    .from("artifacts")
    .update({
      sections: artifact.sections,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", ARTIFACT_SLUG);

  if (updateError) {
    console.error("Failed to update:", updateError.message);
    process.exit(1);
  }

  console.log("Enterprise Journey added successfully!");
  console.log(`View at: https://sharestrata.com/${ARTIFACT_SLUG}`);
}

main();

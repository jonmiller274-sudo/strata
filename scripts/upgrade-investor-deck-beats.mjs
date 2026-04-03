import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

// ── Upgraded Beat 1: HubMockup (layered) ──────────────────────────
const beat1 = {
  id: "why-now-physical-ai",
  type: "hub-mockup",
  title: "Physical AI Is Deployed. Growth Is Explosive.",
  subtitle:
    "LLMs learned language from the internet, but Physical AI has no internet to learn from. Real-World intelligence is the essential layer.",
  content: {
    layers: [
      {
        label: "Convergent Tailwinds",
        color: "#2fd8c8",
        nodes: [
          {
            id: "tailwind-compute",
            label: "Compute",
            description:
              "Industry expects 280x inference cost reduction in 24 months. Fleet and physical AI deployments are now economically viable at scale.",
          },
          {
            id: "tailwind-capital",
            label: "Capital",
            description:
              "$200B+ investment poured into AI in 2025. Fastest growing frontier: the physical world. Nexar Board Member Yann LeCun\u2019s AMI Labs: $1B seed at $4.5B, largest in European history.",
          },
          {
            id: "tailwind-regulation",
            label: "Regulation",
            description:
              "Governments are mandating real-world validation. The EU AI Act and NHTSA Self Drive Act now require real-world safety evidence. Every AV and ADAS maker needs independent real-world data to achieve compliance.",
          },
          {
            id: "tailwind-data",
            label: "Real-world Data",
            description:
              "Nexar\u2019s real-world data compounds what\u2019s next. Tesla proved data is the moat. Nexar built an independent one for everyone else.",
          },
        ],
        transition: "These forces converge to enable\u2026",
      },
      {
        label: "Application Domains",
        color: "#7c6df0",
        nodes: [
          {
            id: "domain-autonomy",
            label: "Autonomy",
            description: "Robotaxis on deployed roads",
          },
          {
            id: "domain-robotics",
            label: "Robotics",
            description: "Warehouse and industrial automation",
          },
          {
            id: "domain-delivery",
            label: "Delivery",
            description: "Last-mile autonomous systems",
          },
          {
            id: "domain-defense",
            label: "Defense",
            description: "Autonomous ISR and logistics",
          },
          {
            id: "domain-agriculture",
            label: "Agriculture",
            description: "Precision field autonomy",
          },
        ],
      },
    ],
    callout: {
      type: "quote",
      text: "Sources: Stanford AI Index 2025; PitchBook 2025; EU AI Act (2024); NHTSA SGO (2025); H.R. 7390; Crunchbase; TechCrunch",
    },
  },
};

// ── Upgraded Beat 2: AnimatedTimeline ──────────────────────────────
const beat2 = {
  id: "the-moment-strategy",
  type: "timeline",
  title: "The Moment \u2014 Why Physical AI Needs Real-World Intelligence",
  content: {
    steps: [
      {
        id: "step-inflection",
        label: "The Inflection",
        title: "Machines Are Entering the Real World",
        description:
          "Autonomous vehicles, delivery robots, industrial drones, warehouse automation. Every one of them faces the same bottleneck: they cannot train, deploy, or scale without real-world data they cannot manufacture. Synthetic data complements but cannot replace real-world ground truth for safety-critical validation.",
        status: "current",
      },
      {
        id: "step-bottleneck",
        label: "The Bottleneck",
        title: "Every Vertical Needs the Same Thing",
        description:
          "AV programs need scenario data to train and validate at scale. ADAS programs need edge-case benchmarks to deploy new features. Fleet operators need collision-grounded risk scoring. Insurers need actuarial truth from real behavior. Municipalities need road infrastructure intelligence. The underlying need is identical: real-world ground truth at scale.",
        status: "current",
      },
      {
        id: "step-what-we-built",
        label: "What We Built",
        title: "Rare Data at Scale and Cost",
        description:
          "While the industry debated simulation fidelity, Nexar assembled one of the largest classified naturalistic driving intelligence platforms in the world \u2014 and built the live collection network that grows it daily. Our 350K-camera fleet captures real-world scenarios at a fraction of what an instrumented study would cost, feeding a classified archive that would take competitors years and billions to replicate.",
        status: "completed",
      },
      {
        id: "step-moat",
        label: "The Moat",
        title: "Genuinely Deep, Not Easily Replicated",
        description:
          "15M safety-critical events, ~40K confirmed collisions. 59x more than SHRP2 ($70M gold standard). 98% US motorway coverage. 100M+ miles driven per month and growing. Cross-vertical demand across 5 verticals \u2014 difficult for any single-vertical player to match. Years of purchase patterns calibrate value. Replication window: 4\u20136 years.",
        status: "completed",
      },
    ],
    evidence: {
      text: "The companies that supply classified, real-world operational intelligence will define the next era of machine autonomy.",
      border_color: "#2fd8c8",
    },
    pivot:
      "The asset exists. The platform is live. The priority now: scale customer adoption and deepen the moat that every new transaction strengthens.",
  },
};

// ── Fetch, replace first 2, update ─────────────────────────────────
const { data, error: fetchErr } = await sb
  .from("artifacts")
  .select("id, sections")
  .eq("slug", "investor-deck")
  .single();

if (fetchErr || !data) {
  console.error("Fetch error:", fetchErr);
  process.exit(1);
}

console.log(`Current deck has ${data.sections.length} beats.`);
console.log(`  Beat 01: ${data.sections[0].type} | ${data.sections[0].title}`);
console.log(`  Beat 02: ${data.sections[1].type} | ${data.sections[1].title}`);

// Replace first 2 sections, keep the rest
const updatedSections = [beat1, beat2, ...data.sections.slice(2)];

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

console.log(`\nUpgraded deck has ${verify.sections.length} beats:\n`);
verify.sections.forEach((s, i) => {
  console.log(
    `  Beat ${String(i + 1).padStart(2, "0")} | ${s.type.padEnd(18)} | ${s.title}`
  );
});

console.log("\nDone. Beats 1 & 2 upgraded to stronger visual types.");

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

// ── New Beat 1: "Why Now" ──────────────────────────────────────────
const beat1 = {
  id: "why-now-physical-ai",
  type: "expandable-cards",
  title: "Physical AI Is Deployed. Growth Is Explosive.",
  subtitle:
    "LLMs learned language from the internet, but Physical AI has no internet to learn from. Real-World intelligence is the essential layer.",
  content: {
    columns: 2,
    display_mode: "open",
    cards: [
      {
        id: "tailwind-compute",
        title: "1. Compute",
        summary:
          "Industry expects **280x** inference cost reduction in 24 months. Fleet and physical AI deployments are now economically viable at scale.",
        metric: { value: "280x", label: "inference cost reduction" },
        tags: ["Tailwind"],
      },
      {
        id: "tailwind-capital",
        title: "2. Capital",
        summary:
          "$200B+ investment poured into AI in 2025. Fastest growing frontier: the physical world. Nexar Board Member Yann LeCun\u2019s AMI Labs: $1B seed at $4.5B, largest in European history.",
        metric: { value: "$200B+", label: "AI investment in 2025" },
        tags: ["Tailwind"],
      },
      {
        id: "tailwind-regulation",
        title: "3. Regulation",
        summary:
          "Governments are **mandating real-world validation.** The EU AI Act and NHTSA Self Drive Act now require real-world safety evidence. Every AV and ADAS maker needs independent real-world data to achieve compliance.",
        metric: { value: "2", label: "landmark regulations" },
        tags: ["Tailwind"],
      },
      {
        id: "tailwind-data",
        title: "4. Real-world Data",
        summary:
          "Nexar\u2019s real-world data compounds what\u2019s next. **Tesla proved data is the moat.** Nexar built an independent one for everyone else.",
        tags: ["Tailwind"],
      },
      {
        id: "domain-autonomy",
        title: "Autonomy",
        summary: "Robotaxis on deployed roads",
        tags: ["Application Domain"],
      },
      {
        id: "domain-robotics",
        title: "Robotics",
        summary: "Warehouse and industrial automation",
        tags: ["Application Domain"],
      },
      {
        id: "domain-delivery",
        title: "Delivery",
        summary: "Last-mile autonomous systems",
        tags: ["Application Domain"],
      },
      {
        id: "domain-defense",
        title: "Defense",
        summary: "Autonomous ISR and logistics",
        tags: ["Application Domain"],
      },
      {
        id: "domain-agriculture",
        title: "Agriculture",
        summary: "Precision field autonomy",
        tags: ["Application Domain"],
      },
    ],
    callout: {
      type: "quote",
      text: "Sources: Stanford AI Index 2025; PitchBook 2025; EU AI Act (2024); NHTSA SGO (2025); H.R. 7390; Crunchbase; TechCrunch",
    },
  },
};

// ── New Beat 2: "The Moment" ───────────────────────────────────────
const beat2 = {
  id: "the-moment-strategy",
  type: "rich-text",
  title: "The Moment \u2014 Why Physical AI Needs Real-World Intelligence",
  content: {
    callout: {
      type: "quote",
      text: "THE PHYSICAL AI INFLECTION\n\nMachines are entering the real world \u2014 autonomous vehicles, delivery robots, industrial drones, warehouse automation. Every one of them faces the same bottleneck: **they cannot train, deploy, or scale without real-world data they cannot manufacture.** Synthetic data complements but cannot replace real-world ground truth for safety-critical validation. The companies that supply classified, real-world operational intelligence will define the next era of machine autonomy.",
    },
    summary:
      "This inflection extends beyond self-driving cars. AV programs need scenario data to train and validate at scale; ADAS programs need edge-case benchmarks to deploy new features; fleet operators need collision-grounded risk scoring to optimize operations; insurers need actuarial truth from real behavior; municipalities need road infrastructure intelligence to prioritize safety investments. The underlying need is identical: **real-world ground truth at scale.** Our initial verticals \u2014 AV, ADAS, fleet, insurance, community safety \u2014 share this need, and the platform extends to any domain where Physical AI must operate effectively in the real world.\n\n**What We Have Built \u2014 Rare Data at Scale and Cost**\n\nWhile the industry debated simulation fidelity, Nexar assembled one of the largest classified naturalistic driving intelligence platforms in the world \u2014 and built the live collection network that grows it daily. Our 350K-camera fleet captures real-world scenarios at a fraction of what an instrumented study would cost, feeding a classified archive that would take competitors years and billions to replicate. The asset exists. The platform is live. The priority now: scale customer adoption and deepen the moat that every new transaction strengthens.\n\n**15M** safety-critical events (collisions + near-collisions) | **59x** more safety-critical events than SHRP2 ($70M gold standard) | **98%** US motorway coverage | **100M+** miles driven per month (growing)",
    detail:
      "**Competitive Moat Analysis**\n\n**GENUINELY DEEP:**\n- **Collision ground truth:** 15M events, ~40K confirmed collisions. Would take years and billions to replicate.\n- **Cross-vertical demand:** 5 verticals \u2014 difficult for any single-vertical player to match.\n- **Demand signal history:** Years of purchase patterns calibrate value.\n\n**OVERSTATED TODAY:**\n- **Raw mile count:** Tesla processes orders of magnitude more. Our edge is directed collection + independence.\n- **Independence cert:** Marketing claim until TUV/UL by Q3 2026.\n- **Replication:** 4\u20136 years. Window is real but not permanent.",
  },
};

// ── Fetch, prepend, update ─────────────────────────────────────────
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

const updatedSections = [beat1, beat2, ...data.sections];

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

console.log(`\nUpdated deck now has ${verify.sections.length} beats:\n`);
verify.sections.forEach((s, i) => {
  console.log(`  Beat ${String(i + 1).padStart(2, "0")} | ${s.type.padEnd(18)} | ${s.title}`);
});

console.log("\nDone.");

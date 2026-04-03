import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

const readyToScaleBeat = {
  id: "ready-to-scale",
  type: "timeline",
  title: "From Enterprise Discovery to Scalable Motion",
  content: {
    steps: [
      {
        id: "step-agreements",
        label: "Proven",
        title: "Customer Agreements Built the Playbook",
        description:
          "Contracted value across AV, insurance, and public sector customers gave us a front seat into how end users discover, evaluate, and scale with our data. Every deal was an investigation into what works.",
        status: "completed",
      },
      {
        id: "step-brand",
        label: "Proven",
        title: "The Models Created the Brand",
        description:
          "BADAS is recognized as the leading collision anticipation model in the AV industry. It\u2019s what opens doors \u2014 engineers find it on Hugging Face, in research papers, through colleague referrals. The model is the top-of-funnel.",
        status: "completed",
      },
      {
        id: "step-loop",
        label: "Proven",
        title: "The Diagnostic Loop Is Proven",
        description:
          "Across every engagement, the same pattern repeated: BADAS diagnoses model failures, customers purchase data to fix them, improvements reveal deeper failures, and the cycle generates recurring demand.",
        status: "completed",
      },
    ],
    pivot:
      "What follows is that loop \u2014 distilled into one customer journey.",
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

console.log(`Current deck has ${data.sections.length} beats.`);

// Insert new beat at index 3 (above current beat 4 — the customer journey)
const updatedSections = [
  ...data.sections.slice(0, 3), // Beats 1-3
  readyToScaleBeat,             // New beat 4: Ready to Scale
  ...data.sections.slice(3),    // Old beats 4-6 become 5-7
];

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

console.log("\nDone.");

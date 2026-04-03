import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

const proofBeat = {
  id: "proof-in-their-words",
  type: "expandable-cards",
  title: "They\u2019re already asking for it.",
  subtitle:
    "Across every account in the pipeline, the same signal keeps appearing: customers want to explore, share, and buy \u2014 on their own terms, without waiting for us.",
  content: {
    columns: 2,
    display_mode: "open",
    cards: [
      {
        id: "proof-ceo-smartcity",
        title: "CEO",
        summary:
          "Smart city infrastructure mapping company\n\n\u201cWe do want to get our hands on it. What\u2019s the quickest way to do that? \u2026I want to hack around over the weekend.\u201d\n\nWhen told accounts would be set up Monday: \u201cCome on. The CEO can\u2019t get accounts set up before Monday? \u2026I have to work on Monday. I have to mess around with stuff.\u201d",
        detail: "March 2026 \u00b7 Meeting transcript",
        tags: ["Weekend Urgency"],
      },
      {
        id: "proof-pm-robotaxi",
        title: "Product Manager, AI Foundations",
        summary:
          "World\u2019s most prominent robotaxi company\n\n\u201cI\u2019m trying to validate multiple use cases within [our company]. If I have additional colleagues that I would love to give access to the platform, should I just send their email and you can set up the account?\u201d",
        detail: "April 2026 \u00b7 Meeting transcript",
        tags: ["Viral Spread"],
      },
      {
        id: "proof-director-perception",
        title: "Director of Perception",
        summary:
          "Major AV robotaxi subsidiary\n\n\u201cThe ability to use the tool directly \u2014 this unlocks additional things we want to do.\u201d\n\nWants to pay per-use, not per-year. Asked to share with product managers and perception leads for independent exploration across teams.",
        detail: "September 2025 \u00b7 Meeting transcript",
        tags: ["Value Unlock"],
      },
      {
        id: "proof-cto-trucking",
        title: "Chief Technology Officer",
        summary:
          "Major public AV trucking company\n\n\u201cWe have tons of our own data. I have a couple use cases in mind I want to explore first.\u201d\n\nWon\u2019t commit to an $800K deal until he can self-explore. Wants platform access before talking volumes with finance.",
        detail: "February 2026 \u00b7 Call summary",
        tags: ["Explore First"],
      },
    ],
    callout: {
      type: "quote",
      text: "Four companies. Four products. One pattern: customers are ready to move faster than we can provision them. A CEO wanted to build over the weekend \u2014 we couldn\u2019t get him an account until Monday. Self-serve means never losing that momentum again.",
    },
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
console.log(`Replacing Beat 7: ${data.sections[6].type} | "${data.sections[6].title || "(no title)"}" (screenshot)`);

// Replace index 6 (Beat 7) with the native version
const updatedSections = [...data.sections];
updatedSections[6] = proofBeat;

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

console.log(`\nDeck has ${verify.sections.length} beats:\n`);
verify.sections.forEach((s, i) => {
  console.log(
    `  Beat ${String(i + 1).padStart(2, "0")} | ${s.type.padEnd(18)} | ${s.title || "(no title)"}`
  );
});

console.log("\nDone. Beat 7 rebuilt as native expandable-cards (screenshot removed).");

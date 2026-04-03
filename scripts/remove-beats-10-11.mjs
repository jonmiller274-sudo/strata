import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

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

// Remove beats 7 (Unit Economics), 10 (empty), 11 (PLG Thesis)
// Indices: 6, 9, 10
const removeIndices = new Set([6, 9, 10]);

console.log(`Removing:`);
for (const i of removeIndices) {
  console.log(`  Beat ${String(i + 1).padStart(2, "0")}: ${data.sections[i].type} | "${data.sections[i].title || '(no title)'}"`);
}

const updatedSections = data.sections.filter((_, i) => !removeIndices.has(i));

const { error: updateErr } = await sb
  .from("artifacts")
  .update({ sections: updatedSections })
  .eq("id", data.id);

if (updateErr) {
  console.error("Update error:", updateErr);
  process.exit(1);
}

const { data: verify, error: verifyErr } = await sb
  .from("artifacts")
  .select("sections")
  .eq("slug", "investor-deck")
  .single();

if (verifyErr || !verify) {
  console.error("Verify error:", verifyErr);
  process.exit(1);
}

console.log(`\nDeck now has ${verify.sections.length} beats:\n`);
verify.sections.forEach((s, i) => {
  console.log(`  Beat ${String(i + 1).padStart(2, "0")} | ${s.type.padEnd(18)} | ${s.title || '(no title)'}`);
});

console.log("\nDone.");

import { createClient } from "@supabase/supabase-js";
import { investorDeckArtifact } from "../src/lib/content/investor-deck";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key);

  // Check which columns actually exist by trying a minimal insert first
  const { error } = await sb.from("artifacts").insert({
    slug: "investor-deck",
    title: investorDeckArtifact.title,
    subtitle: investorDeckArtifact.subtitle,
    author_name: investorDeckArtifact.author_name,
    theme: investorDeckArtifact.theme,
    sections: investorDeckArtifact.sections,
    is_published: true,
  });

  if (error) {
    console.error("Insert error:", error);
    process.exit(1);
  }

  console.log("Investor deck inserted with slug: investor-deck");
}

main();

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

// Import the investor deck TS file as text and eval the sections
const fileContent = readFileSync("src/lib/content/investor-deck.ts", "utf-8");

// Extract the object between the first { and last };
const match = fileContent.match(/export const investorDeckArtifact: Artifact = (\{[\s\S]*\});/);
if (!match) {
  console.error("Could not parse investor deck file");
  process.exit(1);
}

// Clean TS-specific syntax and eval
const cleaned = match[1]
  .replace(/\/\/[^\n]*/g, "")           // remove line comments
  .replace(/,(\s*[}\]])/g, "$1");       // remove trailing commas

const artifact = new Function(`return ${cleaned}`)();

const { error } = await sb.from("artifacts").insert({
  slug: "investor-deck",
  title: artifact.title,
  subtitle: artifact.subtitle,
  author_name: artifact.author_name,
  theme: artifact.theme,
  layout_mode: artifact.layout_mode,
  nav_style: artifact.nav_style,
  branding: artifact.branding,
  sections: artifact.sections,
  is_published: true,
});

if (error) {
  console.error("Insert error:", error);
  process.exit(1);
} else {
  console.log("Investor deck inserted into Supabase with slug: investor-deck");
}

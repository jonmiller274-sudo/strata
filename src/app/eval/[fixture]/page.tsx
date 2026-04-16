/**
 * Eval fixture renderer — serves generated test artifacts for visual evaluation.
 *
 * URL pattern: /eval/<fixture-slug>
 * Example: /eval/eval-baseline-all
 *
 * Reads JSON fixtures from scripts/eval/fixtures/ and renders them
 * using the same ArtifactViewer as production artifacts.
 *
 * This route is only used in development for eval harness testing.
 */

import { ArtifactViewer } from "@/components/viewer/ArtifactViewer";
import type { Artifact } from "@/types/artifact";
import * as fs from "fs";
import * as path from "path";
import { notFound } from "next/navigation";

// Mark as dynamic since we read from filesystem
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ fixture: string }>;
}

export default async function EvalFixturePage({ params }: PageProps) {
  const { fixture } = await params;

  // Read fixture from filesystem
  const fixturesDir = path.join(process.cwd(), "scripts/eval/fixtures");
  const fixturePath = path.join(fixturesDir, `${fixture}.json`);

  if (!fs.existsSync(fixturePath)) {
    notFound();
  }

  const artifact = JSON.parse(
    fs.readFileSync(fixturePath, "utf-8")
  ) as Artifact;

  return <ArtifactViewer artifact={artifact} />;
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const { fixture } = await params;
  return {
    title: `Eval: ${fixture}`,
    robots: "noindex",
  };
}

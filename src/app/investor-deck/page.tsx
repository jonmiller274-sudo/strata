import { ArtifactViewer } from "@/components/viewer/ArtifactViewer";
import { investorDeckArtifact } from "@/lib/content/investor-deck";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nexar PLG Go-to-Market — Strata",
  description:
    "The 30-day customer journey that replaces 12 months of enterprise sales.",
};

export default function InvestorDeckPage() {
  return <ArtifactViewer artifact={investorDeckArtifact} />;
}

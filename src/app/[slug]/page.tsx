import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArtifactViewer } from "@/components/viewer/ArtifactViewer";
import { getArtifactBySlug } from "@/lib/artifacts/actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artifact = await getArtifactBySlug(slug);

  if (!artifact) {
    return { title: "Not Found — Strata" };
  }

  return {
    title: `${artifact.title} — Strata`,
    description: artifact.subtitle || "An interactive strategy artifact built with Strata.",
    openGraph: {
      title: `${artifact.title} — Strata`,
      description: artifact.subtitle || "An interactive strategy artifact built with Strata.",
    },
  };
}

export default async function ArtifactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const artifact = await getArtifactBySlug(slug);

  if (!artifact) {
    notFound();
  }

  return <ArtifactViewer artifact={artifact} />;
}

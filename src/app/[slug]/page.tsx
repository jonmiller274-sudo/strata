import { notFound } from "next/navigation";
import { ArtifactViewer } from "@/components/viewer/ArtifactViewer";
import { getArtifactBySlug } from "@/lib/artifacts/actions";

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

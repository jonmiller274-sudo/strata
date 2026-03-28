import { notFound } from "next/navigation";
import { ArtifactViewer } from "@/components/viewer/ArtifactViewer";

// TODO: Fetch from Supabase once connected
// For now, only the /demo route works via its dedicated page

export default async function ArtifactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Placeholder — will be replaced with Supabase fetch
  void slug;
  notFound();
}

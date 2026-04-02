import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArtifactViewer } from "@/components/viewer/ArtifactViewer";
import { getArtifactBySlug, getArtifactForEdit } from "@/lib/artifacts/actions";
import { createClient } from "@/lib/supabase/server";

// Force dynamic rendering — never serve cached/stale data.
// Without this, Next.js may cache the route output (Full Route Cache)
// or Supabase fetch results (Data Cache), causing the viewer to show
// old content after edits even though the DB has been updated.
export const dynamic = "force-dynamic";

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
      type: "article",
      siteName: "Strata",
      url: `https://sharestrata.com/${slug}`,
    },
    twitter: {
      card: "summary",
      title: `${artifact.title} — Strata`,
      description: artifact.subtitle || "An interactive strategy artifact built with Strata.",
    },
  };
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string; key?: string }>;
}

export default async function ArtifactPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview, key } = await searchParams;

  let artifact;

  if (preview === "true") {
    // Preview of unpublished draft — requires auth + ownership OR edit key
    const editKey = process.env.STRATA_EDIT_KEY?.trim();
    const hasValidKey = editKey && key === editKey;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const draft = await getArtifactForEdit(slug);

    if (!draft || (!hasValidKey && (!user || draft.author_id !== user.id))) {
      notFound();
    }
    artifact = draft;
  } else {
    artifact = await getArtifactBySlug(slug);
  }

  if (!artifact) {
    notFound();
  }

  return <ArtifactViewer artifact={artifact} />;
}

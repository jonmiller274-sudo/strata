import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { ArtifactViewer } from "@/components/viewer/ArtifactViewer";
import { getArtifactBySlug, getArtifactForEdit } from "@/lib/artifacts/actions";

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

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export default async function ArtifactPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;

  // TODO: Gate ?preview=true behind auth (author_id or signed token) before public launch.
  // Currently anyone who knows a slug can view unpublished drafts.
  const artifact = preview === "true"
    ? await getArtifactForEdit(slug)
    : await getArtifactBySlug(slug);

  if (!artifact) {
    notFound();
  }

  return (
    <div className="relative">
      <Link
        href={`/edit/${slug}`}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur text-sm text-foreground hover:bg-white/20 transition-colors border border-white/10"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </Link>
      <ArtifactViewer artifact={artifact} />
    </div>
  );
}

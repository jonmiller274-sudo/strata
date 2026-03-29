import { notFound } from "next/navigation";
import { getArtifactForEdit } from "@/lib/artifacts/actions";
import { EditorLayout } from "@/components/editor/EditorLayout";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string }>;
}

// Temporary edit protection until real auth is built.
// Edit URLs require ?key=<STRATA_EDIT_KEY> to access.
// Remove this gate once Supabase Auth + author_id ownership is implemented.
export default async function EditPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { key } = await searchParams;

  const editKey = process.env.STRATA_EDIT_KEY;
  if (editKey && key !== editKey) {
    notFound();
  }

  const artifact = await getArtifactForEdit(slug);

  if (!artifact) {
    notFound();
  }

  return <EditorLayout initialArtifact={artifact} />;
}

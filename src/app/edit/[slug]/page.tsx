import { notFound } from "next/navigation";
import { getArtifactForEdit } from "@/lib/artifacts/actions";
import { EditorLayout } from "@/components/editor/EditorLayout";

interface Props {
  params: Promise<{ slug: string }>;
}

// TODO: CRITICAL — add auth gating (author_id check) before public launch.
// Currently anyone with the URL can edit any artifact.
export default async function EditPage({ params }: Props) {
  const { slug } = await params;
  const artifact = await getArtifactForEdit(slug);

  if (!artifact) {
    notFound();
  }

  return <EditorLayout initialArtifact={artifact} />;
}

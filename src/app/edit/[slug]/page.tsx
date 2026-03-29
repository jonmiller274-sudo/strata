import { notFound, redirect } from "next/navigation";
import { getArtifactForEdit } from "@/lib/artifacts/actions";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditPage({ params }: Props) {
  const { slug } = await params;

  // Auth check: must be signed in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/?signin=true`);
  }

  const artifact = await getArtifactForEdit(slug);

  if (!artifact) {
    notFound();
  }

  // Ownership check: must be the author
  // Allow editing if author_id is null (pre-auth artifacts) and user is the admin
  // Once all artifacts have author_id, remove the null check
  if (artifact.author_id && artifact.author_id !== user.id) {
    notFound();
  }

  return <EditorLayout initialArtifact={artifact} />;
}

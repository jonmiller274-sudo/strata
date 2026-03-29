"use server";

import { getSupabase } from "@/lib/supabase";
import { generateSlug } from "@/lib/artifacts/slug";
import type { Artifact, ArtifactBranding, Section } from "@/types/artifact";

interface CreateArtifactInput {
  title: string;
  subtitle?: string;
  author_name?: string;
  theme?: "dark" | "light";
  sections: Section[];
}

export async function createArtifact(
  input: CreateArtifactInput
): Promise<{ slug: string } | { error: string }> {
  const slug = generateSlug();

  const { error } = await getSupabase().from("artifacts").insert({
    slug,
    title: input.title,
    subtitle: input.subtitle ?? null,
    author_name: input.author_name ?? null,
    theme: input.theme ?? "dark",
    sections: input.sections,
    is_published: true,
  });

  if (error) {
    console.error("[createArtifact]", error);
    return { error: error.message };
  }

  return { slug };
}

export async function getArtifactBySlug(
  slug: string
): Promise<Artifact | null> {
  const { data, error } = await getSupabase()
    .from("artifacts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Artifact;
}

export async function getArtifactForEdit(
  slug: string
): Promise<Artifact | null> {
  const { data, error } = await getSupabase()
    .from("artifacts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Artifact;
}

interface UpdateArtifactInput {
  title?: string;
  subtitle?: string;
  author_name?: string;
  theme?: "dark" | "light";
  layout_mode?: "continuous" | "beats";
  nav_style?: "sidebar" | "progress-bar";
  branding?: ArtifactBranding;
  sections?: Section[];
  is_published?: boolean;
}

export async function updateArtifact(
  slug: string,
  input: UpdateArtifactInput
): Promise<{ success: boolean } | { error: string }> {
  const { error } = await getSupabase()
    .from("artifacts")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) {
    console.error("[updateArtifact]", error);
    return { error: error.message };
  }

  return { success: true };
}

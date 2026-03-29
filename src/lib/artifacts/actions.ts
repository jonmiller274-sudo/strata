"use server";

import { getSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/artifacts/slug";
import type { Artifact, ArtifactBranding, Section } from "@/types/artifact";

interface CreateArtifactInput {
  title: string;
  subtitle?: string;
  author_name?: string;
  author_id?: string;
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
    author_id: input.author_id ?? null,
    plan_tier: "free",
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
  // Verify ownership via session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // If signed in, verify they own this artifact
    const artifact = await getArtifactForEdit(slug);
    if (artifact?.author_id && artifact.author_id !== user.id) {
      return { error: "Not authorized" };
    }
  }

  console.log("[updateArtifact] saving slug:", slug, "title:", input.title, "sectionCount:", input.sections?.length);
  const { error } = await getSupabase()
    .from("artifacts")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) {
    console.error("[updateArtifact] FAILED:", error);
    return { error: error.message };
  }

  console.log("[updateArtifact] SUCCESS for slug:", slug);
  return { success: true };
}

// ===== Free Tier Enforcement =====

const PLAN_LIMITS = {
  free: 2,
  pro: 15,
  team: Infinity,
  enterprise: Infinity,
} as const;

export async function getActiveArtifactCount(
  userId: string
): Promise<number> {
  const { count, error } = await getSupabase()
    .from("artifacts")
    .select("*", { count: "exact", head: true })
    .eq("author_id", userId)
    .eq("is_published", true)
    .is("archived_at", null);

  if (error) {
    console.error("[getActiveArtifactCount]", error);
    return 0;
  }

  return count ?? 0;
}

export async function canPublishArtifact(
  userId: string,
  planTier: string = "free"
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const current = await getActiveArtifactCount(userId);
  const limit = PLAN_LIMITS[planTier as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;

  return {
    allowed: current < limit,
    current,
    limit,
  };
}

export async function getArtifactsByAuthor(
  userId: string
): Promise<Artifact[]> {
  const { data, error } = await getSupabase()
    .from("artifacts")
    .select("*")
    .eq("author_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[getArtifactsByAuthor]", error);
    return [];
  }

  return (data ?? []) as Artifact[];
}

export async function archiveArtifact(
  slug: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const artifact = await getArtifactForEdit(slug);
  if (!artifact || (artifact.author_id && artifact.author_id !== user.id)) {
    return { error: "Not authorized" };
  }

  const { error } = await getSupabase()
    .from("artifacts")
    .update({ archived_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function unarchiveArtifact(
  slug: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const artifact = await getArtifactForEdit(slug);
  if (!artifact || (artifact.author_id && artifact.author_id !== user.id)) {
    return { error: "Not authorized" };
  }

  const { error } = await getSupabase()
    .from("artifacts")
    .update({ archived_at: null })
    .eq("slug", slug);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

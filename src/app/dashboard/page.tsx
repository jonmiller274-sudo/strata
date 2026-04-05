"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  Plus,
  Pencil,
  ExternalLink,
  Archive,
  ArchiveRestore,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Artifact } from "@/types/artifact";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/?signin=true");
      return;
    }

    async function loadArtifacts() {
      const { getArtifactsByAuthor } = await import(
        "@/lib/artifacts/actions"
      );
      const data = await getArtifactsByAuthor(user!.id);
      setArtifacts(data);
      setLoading(false);
    }

    loadArtifacts();
  }, [user, authLoading, router]);

  const activeCount = artifacts.filter(
    (a) => a.is_published && !a.archived_at
  ).length;

  const planLimit = 2; // TODO: read from profile.plan

  async function handleArchive(slug: string) {
    setActionLoading(slug);
    const { archiveArtifact } = await import("@/lib/artifacts/actions");
    const result = await archiveArtifact(slug);
    if ("success" in result) {
      setArtifacts((prev) =>
        prev.map((a) =>
          a.slug === slug
            ? { ...a, archived_at: new Date().toISOString() }
            : a
        )
      );
    }
    setActionLoading(null);
  }

  async function handleUnarchive(slug: string) {
    setActionLoading(slug);
    const { unarchiveArtifact } = await import("@/lib/artifacts/actions");
    const result = await unarchiveArtifact(slug);
    if ("success" in result) {
      setArtifacts((prev) =>
        prev.map((a) =>
          a.slug === slug ? { ...a, archived_at: undefined } : a
        )
      );
    }
    setActionLoading(null);
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const published = artifacts.filter((a) => a.is_published && !a.archived_at);
  const drafts = artifacts.filter((a) => !a.is_published && !a.archived_at);
  const archived = artifacts.filter((a) => a.archived_at);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent" />
            <span className="font-semibold">Strata</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">
              {activeCount} of {planLimit} free artifacts
            </span>
            <Link
              href="/create"
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              New artifact
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-bold">Your artifacts</h1>

        {artifacts.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-muted">
              You haven&apos;t created any artifacts yet.
            </p>
            <Link
              href="/create"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create your first artifact
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {/* Published artifacts */}
            {published.length > 0 && (
              <ArtifactSection
                title="Published"
                count={published.length}
                artifacts={published}
                actionLoading={actionLoading}
                onArchive={handleArchive}
              />
            )}

            {/* Drafts */}
            {drafts.length > 0 && (
              <ArtifactSection
                title="Drafts"
                count={drafts.length}
                artifacts={drafts}
                actionLoading={actionLoading}
                onArchive={handleArchive}
              />
            )}

            {/* Archived */}
            {archived.length > 0 && (
              <ArtifactSection
                title="Archived"
                count={archived.length}
                artifacts={archived}
                actionLoading={actionLoading}
                onUnarchive={handleUnarchive}
                isArchived
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ArtifactSection({
  title,
  count,
  artifacts,
  actionLoading,
  onArchive,
  onUnarchive,
  isArchived = false,
}: {
  title: string;
  count: number;
  artifacts: Artifact[];
  actionLoading: string | null;
  onArchive?: (_slug: string) => void;
  onUnarchive?: (_slug: string) => void;
  isArchived?: boolean;
}) {
  return (
    <div>
      <h2 className="text-sm font-medium text-muted uppercase tracking-wider">
        {title} ({count})
      </h2>
      <div className="mt-3 space-y-2">
        {artifacts.map((artifact) => (
          <div
            key={artifact.id}
            className={cn(
              "flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-card-hover",
              isArchived && "opacity-60"
            )}
          >
            <div className="min-w-0">
              <h3 className="font-medium truncate">{artifact.title}</h3>
              {artifact.subtitle && (
                <p className="mt-0.5 text-sm text-muted truncate">
                  {artifact.subtitle}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Updated{" "}
                {new Date(artifact.updated_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-4 shrink-0">
              {!isArchived && (
                <>
                  <Link
                    href={`/edit/${artifact.slug}`}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card-hover transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Link>
                  {artifact.is_published && (
                    <Link
                      href={`/${artifact.slug}`}
                      target="_blank"
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card-hover transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Link>
                  )}
                  {onArchive && (
                    <button
                      onClick={() => onArchive(artifact.slug)}
                      disabled={actionLoading === artifact.slug}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-card-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {actionLoading === artifact.slug ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Archive className="h-3 w-3" />
                      )}
                      Archive
                    </button>
                  )}
                </>
              )}

              {isArchived && onUnarchive && (
                <button
                  onClick={() => onUnarchive(artifact.slug)}
                  disabled={actionLoading === artifact.slug}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-accent hover:bg-card-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {actionLoading === artifact.slug ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ArchiveRestore className="h-3 w-3" />
                  )}
                  Restore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

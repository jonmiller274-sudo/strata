"use client";

import { useEffect, useState, useMemo } from "react";
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
  Copy,
  Search,
  X,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getRelativeTime } from "@/lib/utils/relative-time";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Artifact } from "@/types/artifact";

type SortBy = "updated" | "created" | "title";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("updated");

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

  // The "X of Y free artifacts" counter is based on the full artifacts array — unaffected by search/sort
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

  async function handleDuplicate(slug: string) {
    setActionLoading(`duplicate-${slug}`);
    const { duplicateArtifact } = await import("@/lib/artifacts/actions");
    const result = await duplicateArtifact(slug);
    if ("artifact" in result) {
      setArtifacts((prev) => [result.artifact, ...prev]);
    } else {
      console.error("[handleDuplicate]", result.error);
    }
    setActionLoading(null);
  }

  // Apply search filter and sort — client-side only
  const filteredAndSorted = useMemo(() => {
    let result = artifacts;

    // Filter by search query (case-insensitive title substring match)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q));
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "created") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // "updated" — default
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return result;
  }, [artifacts, searchQuery, sortBy]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const published = filteredAndSorted.filter((a) => a.is_published && !a.archived_at);
  const drafts = filteredAndSorted.filter((a) => !a.is_published && !a.archived_at);
  const archived = filteredAndSorted.filter((a) => a.archived_at);

  const hasResults = published.length > 0 || drafts.length > 0 || archived.length > 0;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent" />
            <span className="font-bold">Strata</span>
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
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create your first artifact
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {/* Search and Sort Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-9 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Sort dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="rounded-lg border border-border bg-card py-2 pl-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors appearance-none cursor-pointer"
                  aria-label="Sort by"
                >
                  <option value="updated">Last edited</option>
                  <option value="created">Date created</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>

            {/* No search results state */}
            {isSearching && !hasResults && (
              <div className="mt-4 text-center py-12">
                <p className="text-muted">
                  No documents match &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-sm text-accent hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Published artifacts */}
            {published.length > 0 && (
              <ArtifactSection
                title="Published"
                count={published.length}
                artifacts={published}
                actionLoading={actionLoading}
                onArchive={handleArchive}
                onDuplicate={handleDuplicate}
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
                onDuplicate={handleDuplicate}
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
  onDuplicate,
  isArchived = false,
}: {
  title: string;
  count: number;
  artifacts: Artifact[];
  actionLoading: string | null;
  onArchive?: (slug: string) => void;
  onUnarchive?: (slug: string) => void;
  onDuplicate?: (slug: string) => void;
  isArchived?: boolean;
}) {
  return (
    <div>
      <h2 className="text-sm font-medium text-muted uppercase tracking-wider">
        {title} ({count})
      </h2>
      <div className="mt-3 space-y-2">
        {artifacts.map((artifact) => {
          const relativeTime = getRelativeTime(artifact.updated_at);
          const absoluteDate = new Date(artifact.updated_at).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric", year: "numeric" }
          );
          const sectionCount = artifact.sections.length;

          return (
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
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                  <span title={absoluteDate}>Updated {relativeTime}</span>
                  <span className="text-muted opacity-50">·</span>
                  <span>{sectionCount} {sectionCount === 1 ? "section" : "sections"}</span>
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
                    {onDuplicate && (
                      <button
                        onClick={() => onDuplicate(artifact.slug)}
                        disabled={actionLoading === `duplicate-${artifact.slug}`}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-card-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {actionLoading === `duplicate-${artifact.slug}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        Duplicate
                      </button>
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
          );
        })}
      </div>
    </div>
  );
}

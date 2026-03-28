"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  Eye,
  Send,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { Artifact, Section, TemplateType } from "@/types/artifact";
import { TEMPLATE_LABELS, TEMPLATE_DESCRIPTIONS } from "@/types/artifact";
import { ArtifactViewer } from "@/components/viewer/ArtifactViewer";

type Step = "template" | "content" | "preview";

const TEMPLATES: TemplateType[] = [
  "platform-vision",
  "customer-journey",
  "gtm-strategy",
  "product-roadmap",
];

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("template");
  const [templateType, setTemplateType] = useState<TemplateType | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [structuredData, setStructuredData] = useState<{
    title: string;
    subtitle?: string;
    sections: Section[];
  } | null>(null);
  const [isStructuring, setIsStructuring] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStructure() {
    if (!templateType || !content.trim()) return;

    setIsStructuring(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, templateType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to structure content");
        return;
      }

      setStructuredData(data.artifact);
      setTitle(data.artifact.title || title);
      setStep("preview");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to AI"
      );
    } finally {
      setIsStructuring(false);
    }
  }

  async function handlePublish() {
    if (!structuredData) return;

    setIsPublishing(true);
    setError(null);

    try {
      const { createArtifact } = await import("@/lib/artifacts/actions");
      const result = await createArtifact({
        title: title || structuredData.title,
        subtitle: structuredData.subtitle,
        theme: "dark",
        sections: structuredData.sections,
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      router.push(`/${result.slug}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to publish"
      );
    } finally {
      setIsPublishing(false);
    }
  }

  // Preview artifact object
  const previewArtifact: Artifact | null = structuredData
    ? {
        id: "preview",
        slug: "preview",
        title: title || structuredData.title,
        subtitle: structuredData.subtitle,
        theme: "dark",
        sections: structuredData.sections,
        is_published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent" />
            <span className="font-semibold">Create Artifact</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span
              className={cn(
                "rounded-full px-2 py-0.5",
                step === "template" && "bg-accent text-white"
              )}
            >
              1
            </span>
            <span className="text-border">/</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5",
                step === "content" && "bg-accent text-white"
              )}
            >
              2
            </span>
            <span className="text-border">/</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5",
                step === "preview" && "bg-accent text-white"
              )}
            >
              3
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Step 1: Template Selection */}
        {step === "template" && (
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Choose a template
            </h1>
            <p className="mt-2 text-muted">
              Pick the type of strategic artifact you want to create.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {TEMPLATES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setTemplateType(type);
                    setStep("content");
                  }}
                  className={cn(
                    "group flex flex-col items-start rounded-2xl border p-6 text-left transition-all",
                    "border-border bg-card hover:border-accent/40 hover:bg-card-hover"
                  )}
                >
                  <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                    {TEMPLATE_LABELS[type]}
                  </h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    {TEMPLATE_DESCRIPTIONS[type]}
                  </p>
                  <span className="mt-4 flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    Select <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Content Input */}
        {step === "content" && (
          <div>
            <button
              onClick={() => setStep("template")}
              className="mb-6 flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Change template
            </button>

            <h1 className="text-3xl font-bold tracking-tight">
              Paste your content
            </h1>
            <p className="mt-2 text-muted">
              Paste your strategy content — notes, outlines, docs, anything.
              The AI will structure it into a{" "}
              <span className="text-accent font-medium">
                {templateType && TEMPLATE_LABELS[templateType]}
              </span>{" "}
              artifact.
            </p>

            <div className="mt-8 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted">
                  Title (optional — AI will generate one if blank)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Q2 Platform Vision"
                  className="mt-1 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted">
                  Raw content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your strategy notes, outlines, bullet points, docs — anything you want to turn into an interactive artifact..."
                  rows={16}
                  className="mt-1 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-y font-mono text-sm leading-relaxed"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {content.length.toLocaleString()} characters
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                  {error}
                </div>
              )}

              <button
                onClick={handleStructure}
                disabled={!content.trim() || isStructuring}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all",
                  content.trim() && !isStructuring
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "bg-card text-muted cursor-not-allowed"
                )}
              >
                {isStructuring ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Structuring with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Structure with AI
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview + Publish */}
        {step === "preview" && previewArtifact && (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Preview your artifact
                </h1>
                <p className="mt-2 text-muted">
                  Review the structured artifact. When it looks good, publish
                  to get a shareable link.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setStructuredData(null);
                    setStep("content");
                  }}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-card-hover transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Re-generate
                </button>

                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Publish & get link
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            {/* Embedded preview */}
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2">
                <Eye className="h-4 w-4 text-muted" />
                <span className="text-xs text-muted">Preview</span>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                <ArtifactViewer artifact={previewArtifact} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

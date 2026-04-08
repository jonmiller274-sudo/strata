"use client";

import { useState, useRef, useCallback } from "react";
import type { Section } from "@/types/artifact";
import { Loader2, Sparkles } from "lucide-react";
import { MultiSectionReview } from "./MultiSectionReview";

const MAX_CHARS = 50_000;

interface AddSectionPasteProps {
  documentTitle: string;
  documentSubtitle?: string;
  onAddMultiple: (_sections: Section[]) => void;
  onCancel: () => void;
}

export function AddSectionPaste({
  documentTitle,
  documentSubtitle,
  onAddMultiple,
  onCancel,
}: AddSectionPasteProps) {
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSections, setGeneratedSections] = useState<Section[] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!content.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Document: "${documentTitle}"${documentSubtitle ? ` — ${documentSubtitle}` : ""}\n\n${content.trim()}`,
          templateType: "platform-vision",
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        let errMsg = errBody?.error || "Failed to structure content";
        if (errMsg.includes("credit balance")) {
          errMsg = "AI service credits depleted";
        } else if (
          errMsg.includes("rate limit") ||
          errMsg.includes("rate_limit")
        ) {
          errMsg = "AI service is busy — try again in a moment";
        } else if (errMsg.includes("overloaded")) {
          errMsg = "AI service is temporarily overloaded";
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      const sections: Section[] = data.artifact?.sections ?? [];

      if (sections.length === 0) {
        throw new Error("AI could not structure this content into sections");
      }

      // Ensure unique section IDs (suffix with timestamp)
      const ts = Date.now();
      const deduped = sections.map((s: Section, i: number) => ({
        ...s,
        id: `${s.id}-${ts}-${i}`,
      }));

      setGeneratedSections(deduped);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const msg =
        err instanceof Error ? err.message : "Failed to structure content";
      setError(msg);
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [content, isGenerating, documentTitle, documentSubtitle]);

  // Multi-section review mode
  if (generatedSections) {
    return (
      <MultiSectionReview
        sections={generatedSections}
        onConfirm={(selected) => {
          onAddMultiple(selected);
        }}
        onCancel={onCancel}
        onRegenerate={() => {
          setGeneratedSections(null);
          setError(null);
        }}
      />
    );
  }

  const charCount = content.length;
  const overLimit = charCount > MAX_CHARS;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          Paste your content — AI will structure it into interactive sections.
        </p>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste text from a doc, email, transcript, or notes..."
          className="flex-1 min-h-[200px] w-full bg-white/5 rounded-lg px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-accent/50 resize-none"
          disabled={isGenerating}
        />

        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] ${
              overLimit ? "text-red-400" : "text-muted-foreground"
            }`}
          >
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
          </span>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2" aria-live="polite">
            {error}
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={!content.trim() || overLimit || isGenerating}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-accent/20 text-accent hover:bg-accent/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Structuring... (15-30s)
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Structure with AI
            </>
          )}
        </button>

        {isGenerating && (
          <button
            onClick={() => {
              abortRef.current?.abort();
              setIsGenerating(false);
            }}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

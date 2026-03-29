"use client";

import { useState } from "react";
import type { Section } from "@/types/artifact";
import { Sparkles, Loader2 } from "lucide-react";

const CHIPS = [
  { label: "More concise", instruction: "Make this more concise" },
  { label: "More detailed", instruction: "Add more detail and specifics" },
  { label: "Simplify language", instruction: "Simplify the language for a broader audience" },
  { label: "More persuasive", instruction: "Make this more persuasive and impactful" },
];

type AiCommandStatus = "idle" | "loading" | "review";

interface AiCommandProps {
  section: Section;
  onApply: (rewrittenSection: Section) => void;
  onLoadingChange?: (loading: boolean) => void;
  onSuggestion?: (suggestion: Section) => void;
  onToggleOriginal?: () => void;
  onClearSuggestion?: () => void;
}

export function AiCommand({
  section,
  onApply,
  onLoadingChange,
  onSuggestion,
  onToggleOriginal,
  onClearSuggestion,
}: AiCommandProps) {
  const [status, setStatus] = useState<AiCommandStatus>("idle");
  const [customInstruction, setCustomInstruction] = useState("");
  const [suggestion, setSuggestion] = useState<Section | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRewrite = async (instruction: string) => {
    setStatus("loading");
    setError(null);
    onLoadingChange?.(true);

    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, instruction }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Rewrite failed");
      }

      const data = await res.json();
      setSuggestion(data.section);
      onSuggestion?.(data.section);
      setStatus("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("idle");
    } finally {
      onLoadingChange?.(false);
    }
  };

  const handleApply = () => {
    if (suggestion) {
      onApply(suggestion);
    }
    setStatus("idle");
    setSuggestion(null);
    setCustomInstruction("");
    onClearSuggestion?.();
  };

  const handleDiscard = () => {
    setStatus("idle");
    setSuggestion(null);
    setCustomInstruction("");
    onClearSuggestion?.();
  };

  const handleToggleOriginal = () => {
    setShowOriginal(!showOriginal);
    onToggleOriginal?.();
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Rewriting...
        </div>
      </div>
    );
  }

  // Review state
  if (status === "review" && suggestion) {
    return (
      <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
        <p className="text-xs font-medium text-accent mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          AI suggestion ready
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="px-3 py-1 rounded text-xs font-medium bg-accent text-white hover:bg-accent/80"
          >
            Apply
          </button>
          <button
            onClick={handleDiscard}
            className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20"
          >
            Discard
          </button>
          <button
            onClick={handleToggleOriginal}
            className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20"
          >
            {showOriginal ? "See suggestion" : "See original"}
          </button>
        </div>
      </div>
    );
  }

  // Idle state
  return (
    <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" />
        AI Edit
      </p>

      {/* Chips */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => handleRewrite(chip.instruction)}
            className="px-2.5 py-1 rounded-full text-xs bg-white/10 text-muted-foreground hover:bg-white/20 hover:text-foreground transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Free text input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInstruction}
          onChange={(e) => setCustomInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && customInstruction.trim()) {
              handleRewrite(customInstruction.trim());
            }
          }}
          placeholder="Describe what to change..."
          className="flex-1 bg-white/10 rounded px-2 py-1 text-xs outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-accent/50"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
}

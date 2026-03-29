"use client";

import { useState, useRef, useEffect } from "react";
import type { Artifact, Section } from "@/types/artifact";
import { Sparkles, Loader2, X } from "lucide-react";

type DocumentAiStatus = "idle" | "expanded" | "loading" | "review";

export interface DocumentAiSuggestion {
  title: string;
  subtitle?: string;
  sections: Section[];
}

interface DocumentAiCommandProps {
  artifact: Artifact;
  onApply: (suggestion: DocumentAiSuggestion) => void;
  onSuggestion: (suggestion: DocumentAiSuggestion) => void;
  onToggleOriginal: () => void;
  onClearSuggestion: () => void;
}

export function DocumentAiCommand({
  artifact,
  onApply,
  onSuggestion,
  onToggleOriginal,
  onClearSuggestion,
}: DocumentAiCommandProps) {
  const [status, setStatus] = useState<DocumentAiStatus>("idle");
  const [instruction, setInstruction] = useState("");
  const [suggestion, setSuggestion] = useState<DocumentAiSuggestion | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "expanded" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status]);

  const handleRewrite = async () => {
    if (!instruction.trim()) return;

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/ai/rewrite-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artifact: {
            title: artifact.title,
            subtitle: artifact.subtitle,
            sections: artifact.sections,
          },
          instruction: instruction.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Document rewrite failed");
      }

      const data = await res.json();
      const result: DocumentAiSuggestion = {
        title: data.title,
        subtitle: data.subtitle,
        sections: data.sections,
      };
      setSuggestion(result);
      onSuggestion(result);
      setStatus("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("expanded");
    }
  };

  const handleApply = () => {
    if (suggestion) {
      onApply(suggestion);
    }
    setStatus("idle");
    setSuggestion(null);
    setInstruction("");
    setShowOriginal(false);
    onClearSuggestion();
  };

  const handleDiscard = () => {
    setStatus("idle");
    setSuggestion(null);
    setInstruction("");
    setShowOriginal(false);
    onClearSuggestion();
  };

  const handleToggleOriginal = () => {
    setShowOriginal(!showOriginal);
    onToggleOriginal();
  };

  const handleClose = () => {
    setStatus("idle");
    setInstruction("");
    setError(null);
  };

  // Idle — just the sparkles button
  if (status === "idle") {
    return (
      <button
        onClick={() => setStatus("expanded")}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
        title="AI document command"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">AI Edit</span>
      </button>
    );
  }

  // Loading
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 text-xs text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Rewriting document...</span>
      </div>
    );
  }

  // Review
  if (status === "review" && suggestion) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-accent font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          AI suggestion
        </span>
        <button
          onClick={handleApply}
          className="px-2.5 py-1 rounded text-xs font-medium bg-accent text-white hover:bg-accent/80"
        >
          Apply
        </button>
        <button
          onClick={handleDiscard}
          className="px-2.5 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20"
        >
          Discard
        </button>
        <button
          onClick={handleToggleOriginal}
          className="px-2.5 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20"
        >
          {showOriginal ? "See suggestion" : "See original"}
        </button>
      </div>
    );
  }

  // Expanded — text input
  return (
    <div className="flex items-center gap-2">
      <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleRewrite();
          if (e.key === "Escape") handleClose();
        }}
        placeholder="Describe changes to the whole document..."
        className="w-64 bg-white/10 rounded px-2 py-1 text-xs outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-accent/50"
      />
      <button
        onClick={handleClose}
        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/10"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

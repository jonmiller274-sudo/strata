"use client";

import { useState } from "react";
import type { Section, SectionType } from "@/types/artifact";
import { Plus, Loader2, X } from "lucide-react";
import { SectionTypePreview } from "./SectionTypePreview";

const SECTION_TYPES: { type: SectionType; label: string; description: string }[] = [
  { type: "rich-text", label: "Rich Text", description: "Text with expandable details" },
  { type: "expandable-cards", label: "Card Grid", description: "Grid of expandable cards" },
  { type: "timeline", label: "Timeline", description: "Step-by-step progression" },
  { type: "tier-table", label: "Tier Table", description: "Pricing or comparison table" },
  { type: "metric-dashboard", label: "Metrics", description: "KPI dashboard cards" },
  { type: "data-viz", label: "Chart", description: "Data visualization" },
  { type: "hub-mockup", label: "Hub Diagram", description: "Hub-and-spoke connections" },
  { type: "guided-journey", label: "Journey", description: "Interactive guided journey" },
];

type AddSectionStep = "closed" | "describe" | "confirm" | "generating" | "review";

interface AddSectionProps {
  documentTitle: string;
  documentSubtitle?: string;
  onAdd: (section: Section) => void;
}

export function AddSection({ documentTitle, documentSubtitle, onAdd }: AddSectionProps) {
  const [step, setStep] = useState<AddSectionStep>("closed");
  const [description, setDescription] = useState("");
  const [suggestedType, setSuggestedType] = useState<SectionType | null>(null);
  const [generatedSection, setGeneratedSection] = useState<Section | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep("closed");
    setDescription("");
    setSuggestedType(null);
    setGeneratedSection(null);
    setError(null);
  };

  // Step 1 → Step 2: Describe and get type suggestion
  const handleDescribe = async () => {
    if (!description.trim()) return;
    setStep("confirm");
    setError(null);

    try {
      const res = await fetch("/api/ai/suggest-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });

      if (!res.ok) throw new Error("Failed to suggest type");
      const data = await res.json();
      setSuggestedType(data.type);
    } catch {
      // Fallback: let user pick manually
      setSuggestedType(null);
    }
  };

  // Step 2: Pick type directly
  const handlePickType = (type: SectionType) => {
    setSuggestedType(type);
    setStep("confirm");
  };

  // Step 2 → Step 3: Generate section content
  const handleGenerate = async (type: SectionType) => {
    setStep("generating");
    setError(null);

    try {
      const res = await fetch("/api/ai/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Document: ${documentTitle}${documentSubtitle ? ` — ${documentSubtitle}` : ""}\n\nGenerate a single "${type}" section for: ${description || type}`,
          templateType: "platform-vision",
        }),
      });

      if (!res.ok) throw new Error("Failed to generate section");
      const data = await res.json();

      // AI returns an artifact with sections — take the first one
      const section = data.artifact?.sections?.[0];
      if (!section) throw new Error("No section generated");

      setGeneratedSection(section);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setStep("confirm");
    }
  };

  // Closed state — just the button
  if (step === "closed") {
    return (
      <button
        onClick={() => setStep("describe")}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 text-sm text-muted-foreground hover:border-white/40 hover:text-foreground transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Section
      </button>
    );
  }

  return (
    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
      {/* Close button */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-medium">Add Section</p>
        <button onClick={reset} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Step 1: Describe */}
      {step === "describe" && (
        <>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDescribe()}
            placeholder="Describe what you want to add..."
            autoFocus
            className="w-full bg-white/10 rounded px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-accent/50 mb-3"
          />
          <p className="text-xs text-muted-foreground mb-2">Or pick a type:</p>
          <div className="grid grid-cols-2 gap-2">
            {SECTION_TYPES.map((st) => (
              <button
                key={st.type}
                onClick={() => handlePickType(st.type)}
                className="text-left rounded-lg border border-white/10 hover:border-accent/30 hover:scale-[1.02] transition-all overflow-hidden"
              >
                <SectionTypePreview type={st.type} />
                <div className="px-2 py-1.5">
                  <span className="text-xs font-medium block">{st.label}</span>
                  <span className="text-[10px] text-muted-foreground">{st.description}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 2: Confirm type */}
      {step === "confirm" && (
        <div>
          {suggestedType ? (
            <>
              <p className="text-sm mb-2">
                I&apos;ll create a <span className="font-medium text-accent">
                  {SECTION_TYPES.find((t) => t.type === suggestedType)?.label}
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleGenerate(suggestedType)}
                  className="px-3 py-1 rounded text-xs font-medium bg-accent text-white hover:bg-accent/80"
                >
                  Generate
                </button>
                <button
                  onClick={() => {
                    setSuggestedType(null);
                    setStep("describe");
                  }}
                  className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20"
                >
                  Change type
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Pick a section type above</p>
          )}
        </div>
      )}

      {/* Step 3: Generating */}
      {step === "generating" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating section...
        </div>
      )}

      {/* Step 4: Review */}
      {step === "review" && generatedSection && (
        <div>
          <p className="text-sm mb-2">
            <span className="font-medium">{generatedSection.title}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { onAdd(generatedSection); reset(); }}
              className="px-3 py-1 rounded text-xs font-medium bg-green-600/20 text-green-400 hover:bg-green-600/30"
            >
              Keep
            </button>
            <button
              onClick={reset}
              className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20"
            >
              Discard
            </button>
            <button
              onClick={() => suggestedType && handleGenerate(suggestedType)}
              className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Section, SectionType } from "@/types/artifact";
import { Loader2, ArrowLeft, Pencil, ClipboardPaste, Upload } from "lucide-react";
import { SectionTypePreview } from "./SectionTypePreview";
import { AddSectionPaste } from "./AddSectionPaste";
import { AddSectionUpload } from "./AddSectionUpload";

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

type AddSectionStep = "describe" | "confirm" | "generating" | "review";
type AddSectionMode = "describe" | "paste" | "upload";

const MODE_TABS: { id: AddSectionMode; label: string; icon: typeof Pencil; disabled?: boolean }[] = [
  { id: "describe", label: "Describe", icon: Pencil },
  { id: "paste", label: "Paste", icon: ClipboardPaste },
  { id: "upload", label: "Upload", icon: Upload },
];

interface AddSectionProps {
  documentTitle: string;
  documentSubtitle?: string;
  onAdd: (section: Section) => void;
  onAddMultiple?: (sections: Section[]) => void;
  onCancel: () => void;
}

export function AddSection({ documentTitle, documentSubtitle, onAdd, onAddMultiple, onCancel }: AddSectionProps) {
  const [mode, setMode] = useState<AddSectionMode>("describe");

  // --- Describe mode state ---
  const [step, setStep] = useState<AddSectionStep>("describe");
  const [description, setDescription] = useState("");
  const [suggestedType, setSuggestedType] = useState<SectionType | null>(null);
  const [generatedSection, setGeneratedSection] = useState<Section | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetDescribe = () => {
    setDescription("");
    setSuggestedType(null);
    setGeneratedSection(null);
    setError(null);
    setStep("describe");
  };

  const handleBack = () => {
    resetDescribe();
    onCancel();
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
      setSuggestedType(null);
    }
  };

  const handlePickType = (type: SectionType) => {
    setSuggestedType(type);
    setStep("confirm");
  };

  const handleGenerate = async (type: SectionType) => {
    setStep("generating");
    setError(null);

    try {
      const res = await fetch("/api/ai/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Document: "${documentTitle}"${documentSubtitle ? ` — ${documentSubtitle}` : ""}\n\nGenerate exactly ONE section of type "${type}" about: ${description || type}.\n\nReturn it inside a standard artifact JSON object with a "sections" array containing this single section. The section must have "id", "type", "title", and "content" fields.`,
          templateType: "platform-vision",
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        let errMsg = errBody?.error || "Failed to generate section";
        if (errMsg.includes("credit balance")) {
          errMsg = "AI service credits depleted — contact support";
        } else if (errMsg.includes("rate limit") || errMsg.includes("rate_limit")) {
          errMsg = "AI service is busy — try again in a moment";
        } else if (errMsg.includes("overloaded")) {
          errMsg = "AI service is temporarily overloaded — try again shortly";
        }
        throw new Error(errMsg);
      }
      const data = await res.json();

      let section = data.artifact?.sections?.[0];
      if (!section && data.artifact?.type && data.artifact?.content) {
        section = data.artifact;
      }
      if (!section) throw new Error("No section generated — try adding a description");

      if (section.type !== type) {
        section = { ...section, type };
      }

      setGeneratedSection(section);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setStep("confirm");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to sections
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex border-b border-white/10">
        {MODE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (!tab.disabled) {
                setMode(tab.id);
                resetDescribe();
              }
            }}
            disabled={tab.disabled}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
              mode === tab.id
                ? "text-foreground border-b-2 border-accent"
                : tab.disabled
                  ? "text-muted-foreground/30 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Paste mode */}
      {mode === "paste" && (
        <AddSectionPaste
          documentTitle={documentTitle}
          documentSubtitle={documentSubtitle}
          onAddMultiple={(sections) => {
            if (onAddMultiple) {
              onAddMultiple(sections);
            } else {
              // Fallback: add one by one
              sections.forEach((s) => onAdd(s));
            }
            handleBack();
          }}
          onCancel={handleBack}
        />
      )}

      {/* Upload mode */}
      {mode === "upload" && (
        <AddSectionUpload
          documentTitle={documentTitle}
          documentSubtitle={documentSubtitle}
          onAddMultiple={(sections) => {
            if (onAddMultiple) {
              onAddMultiple(sections);
            } else {
              sections.forEach((s) => onAdd(s));
            }
            handleBack();
          }}
          onCancel={handleBack}
        />
      )}

      {/* Describe mode */}
      {mode === "describe" && (
        <div className="flex-1 overflow-y-auto p-4">
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
                      className="px-3 py-1 rounded text-xs font-medium bg-accent text-white hover:bg-accent/80 transition-colors"
                    >
                      Generate
                    </button>
                    <button
                      onClick={() => { setSuggestedType(null); setStep("describe"); }}
                      className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20 transition-colors"
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

          {step === "generating" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating section...
            </div>
          )}

          {step === "review" && generatedSection && (
            <div>
              <p className="text-sm mb-2">
                <span className="font-medium">{generatedSection.title}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { onAdd(generatedSection); handleBack(); }}
                  className="px-3 py-1 rounded text-xs font-medium bg-accent text-white hover:bg-accent/80 transition-colors"
                >
                  Keep
                </button>
                <button
                  onClick={handleBack}
                  className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={() => suggestedType && handleGenerate(suggestedType)}
                  className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground hover:bg-white/20 transition-colors"
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}

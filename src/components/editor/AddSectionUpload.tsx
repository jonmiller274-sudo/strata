"use client";

import { useState, useRef, useCallback } from "react";
import type { Section } from "@/types/artifact";
import { Loader2, FileUp, Image as ImageIcon, FileText } from "lucide-react";
import { MultiSectionReview } from "./MultiSectionReview";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

type UploadState = "idle" | "processing" | "review";

interface AddSectionUploadProps {
  documentTitle: string;
  documentSubtitle?: string;
  onAddMultiple: (_sections: Section[]) => void;
  onCancel: () => void;
}

export function AddSectionUpload({
  documentTitle,
  documentSubtitle,
  onAddMultiple,
  onCancel,
}: AddSectionUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [generatedSections, setGeneratedSections] = useState<Section[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [uploadFile, setUploadFile] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getEditKeyParam = useCallback(() => {
    const urlKey = new URLSearchParams(window.location.search).get("key");
    return urlKey ? `?key=${encodeURIComponent(urlKey)}` : "";
  }, []);

  const processImage = useCallback(
    async (file: File, signal: AbortSignal) => {
      setStatusText("Analyzing image with AI...");

      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Strip the data:image/...;base64, prefix
          resolve(result.split(",")[1]);
        };
        reader.onerror = () => reject(new Error("Failed to read image file"));
        reader.readAsDataURL(file);
      });

      const res = await fetch(`/api/ai/vision-to-section${getEditKeyParam()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type,
          context: {
            title: documentTitle,
          },
        }),
        signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || "Failed to analyze image");
      }

      const data = await res.json();
      if (!data.section) {
        throw new Error("AI could not extract content from this image");
      }

      return [data.section as Section];
    },
    [documentTitle, getEditKeyParam]
  );

  const processPdf = useCallback(
    async (file: File, signal: AbortSignal) => {
      // Step 1: Extract text from PDF
      setStatusText("Extracting text from PDF...");

      const formData = new FormData();
      formData.append("file", file);

      const pdfRes = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formData,
        signal,
      });

      if (!pdfRes.ok) {
        const errBody = await pdfRes.json().catch(() => null);
        throw new Error(errBody?.error || "Failed to extract text from PDF");
      }

      const pdfData = await pdfRes.json();

      if (!pdfData.text || pdfData.text.trim().length === 0) {
        throw new Error(
          "Could not extract text from this PDF. It may be image-based or scanned."
        );
      }

      // Step 2: Structure the text into sections via AI
      setStatusText(
        `Structuring ${pdfData.pageCount} page${pdfData.pageCount !== 1 ? "s" : ""} into sections...`
      );

      const structureRes = await fetch("/api/ai/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Document: "${documentTitle}"${documentSubtitle ? ` — ${documentSubtitle}` : ""}\n\n${pdfData.text}`,
          templateType: "platform-vision",
        }),
        signal,
      });

      if (!structureRes.ok) {
        const errBody = await structureRes.json().catch(() => null);
        let errMsg = errBody?.error || "Failed to structure PDF content";
        if (errMsg.includes("credit balance")) {
          errMsg = "AI service credits depleted";
        } else if (errMsg.includes("rate limit") || errMsg.includes("rate_limit")) {
          errMsg = "AI service is busy — try again in a moment";
        } else if (errMsg.includes("overloaded")) {
          errMsg = "AI service is temporarily overloaded";
        }
        throw new Error(errMsg);
      }

      const data = await structureRes.json();
      const sections: Section[] = data.artifact?.sections ?? [];

      if (sections.length === 0) {
        throw new Error("AI could not structure the PDF content into sections");
      }

      // Deduplicate IDs
      const ts = Date.now();
      return sections.map((s: Section, i: number) => ({
        ...s,
        id: `${s.id}-${ts}-${i}`,
      }));
    },
    [documentTitle, documentSubtitle]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isPdf = file.type === "application/pdf";

      if (!isImage && !isPdf) {
        setError("Unsupported file type. Upload a PDF, PNG, JPEG, or WebP.");
        return;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        setError("Image must be under 5MB.");
        return;
      }

      if (isPdf && file.size > MAX_PDF_SIZE) {
        setError("PDF must be under 10MB.");
        return;
      }

      setState("processing");
      setUploadFile({ name: file.name, size: formatFileSize(file.size) });
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const sections = isImage
          ? await processImage(file, controller.signal)
          : await processPdf(file, controller.signal);

        setGeneratedSections(sections);
        setState("review");
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setState("idle");
          return;
        }
        setError(err instanceof Error ? err.message : "Upload failed");
        setState("idle");
      } finally {
        abortRef.current = null;
      }
    },
    [processImage, processPdf]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  const handleCancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setState("idle");
    setStatusText("");
    setUploadFile(null);
  }, []);

  // Review mode — reuse MultiSectionReview
  if (state === "review" && generatedSections) {
    return (
      <MultiSectionReview
        sections={generatedSections}
        onConfirm={(selected) => {
          onAddMultiple(selected);
        }}
        onCancel={onCancel}
        onRegenerate={() => {
          setGeneratedSections(null);
          setState("idle");
          setError(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          Drop a file or click to upload — AI will extract and structure the
          content.
        </p>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => state === "idle" && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
            state === "processing"
              ? "border-accent/40 bg-accent/5 cursor-wait"
              : dragOver
                ? "border-accent bg-accent/10"
                : "border-white/10 hover:border-white/30 hover:bg-white/5"
          }`}
        >
          {state === "processing" ? (
            <>
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              {uploadFile && (
                <p className="text-xs font-medium text-foreground/80 text-center truncate max-w-full">
                  {uploadFile.name}
                  <span className="text-muted-foreground font-normal ml-1.5">· {uploadFile.size}</span>
                </p>
              )}
              <p className="text-sm text-muted-foreground text-center">
                {statusText}
              </p>
            </>
          ) : (
            <>
              <FileUp className="w-8 h-8 text-muted-foreground/60" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drop file here or click to browse
                </p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <FileText className="w-3 h-3" /> PDF (10MB)
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ImageIcon className="w-3 h-3" /> PNG, JPEG, WebP (5MB)
                  </span>
                </div>
              </div>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* How it works */}
        {state === "idle" && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              How it works
            </p>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="shrink-0 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-medium">
                1
              </span>
              <span>
                <strong>Images</strong> — AI reads the screenshot and creates a
                matching native section (cards, timeline, table, etc.)
              </span>
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="shrink-0 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-medium">
                2
              </span>
              <span>
                <strong>PDFs</strong> — text is extracted and structured into
                multiple interactive sections
              </span>
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="shrink-0 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-medium">
                3
              </span>
              <span>
                Review generated sections, select the ones you want, and add
                them to your document
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Cancel button during processing */}
        {state === "processing" && (
          <button
            onClick={handleCancel}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface LogoUploadProps {
  logoUrl?: string;
  artifactId: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function LogoUpload({
  logoUrl,
  artifactId,
  onUpload,
  onRemove,
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("artifactId", artifactId);

      const res = await fetch("/api/upload/logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }

      onUpload(data.url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setUploading(true);

    try {
      const res = await fetch("/api/upload/logo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artifactId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Remove failed");
        return;
      }

      onRemove();
    } catch {
      setError("Remove failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected after removal
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  if (logoUrl) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/5 p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Logo preview"
            className="h-full w-full object-contain"
          />
        </div>
        <button
          onClick={handleRemove}
          disabled={uploading}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <X className="h-3 w-3" />
          {uploading ? "Removing..." : "Remove"}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-4 text-xs transition-colors ${
          dragOver
            ? "border-accent/60 bg-accent/10 text-accent"
            : "border-white/20 bg-white/5 text-muted-foreground hover:border-white/40 hover:bg-white/10 hover:text-foreground"
        } ${uploading ? "pointer-events-none opacity-50" : ""}`}
      >
        {uploading ? (
          <>
            <Upload className="h-4 w-4 animate-pulse" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <ImageIcon className="h-4 w-4" />
            <span>Drop logo or click to upload</span>
            <span className="text-[10px] opacity-60">
              PNG, JPEG, SVG, WebP — max 500KB
            </span>
          </>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

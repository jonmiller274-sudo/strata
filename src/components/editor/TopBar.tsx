"use client";

import { ExternalLink, Eye } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { SaveStatus } from "@/hooks/useEditor";

interface TopBarProps {
  slug: string;
  saveStatus: SaveStatus;
  isPublished: boolean;
  onPublishToggle: () => void;
  onMobilePreview?: () => void;
}

export function TopBar({
  slug,
  saveStatus,
  isPublished,
  onPublishToggle,
  onMobilePreview,
}: TopBarProps) {
  const searchParams = useSearchParams();
  const editKey = searchParams.get("key");
  const previewUrl = `/${slug}?preview=true${editKey ? `&key=${editKey}` : ""}`;

  return (
    <div className="h-10 border-b border-white/10 flex items-center justify-end px-4 gap-4 shrink-0">
      {/* Save status */}
      <span className="text-xs text-muted-foreground">
        {saveStatus === "saved" && "Saved"}
        {saveStatus === "saving" && "Saving..."}
        {saveStatus === "unsaved" && "Unsaved changes"}
      </span>

      {/* Mobile preview button — only on small screens when section selected */}
      {onMobilePreview && (
        <button
          onClick={onMobilePreview}
          className="lg:hidden flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
        >
          <Eye className="w-3 h-3" />
          Preview
        </button>
      )}

      {/* Preview in new tab */}
      <a
        href={previewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Preview <ExternalLink className="w-3 h-3" />
      </a>

      {/* Publish toggle */}
      <button
        onClick={onPublishToggle}
        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
          isPublished
            ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
            : "bg-white/10 text-muted-foreground hover:bg-white/20"
        }`}
      >
        {isPublished ? "Published" : "Draft"}
      </button>
    </div>
  );
}

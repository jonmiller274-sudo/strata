"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Artifact } from "@/types/artifact";
import { updateArtifact } from "@/lib/artifacts/actions";
import type { SaveStatus } from "./useEditor";

export function useAutoSave(
  artifact: Artifact,
  saveStatus: SaveStatus,
  setSaveStatus: (_status: SaveStatus) => void,
  debounceMs: number = 2000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>(JSON.stringify(artifact));
  // Keep a ref to always have the latest artifact, even when save()
  // is called before React re-renders (e.g., publish toggle)
  const artifactRef = useRef<Artifact>(artifact);
  artifactRef.current = artifact;

  const save = useCallback(async () => {
    const latest = artifactRef.current;
    const current = JSON.stringify(latest);
    if (current === lastSavedRef.current) return;

    setSaveStatus("saving");

    const result = await updateArtifact(latest.slug, {
      title: latest.title,
      subtitle: latest.subtitle,
      author_name: latest.author_name,
      theme: latest.theme,
      layout_mode: latest.layout_mode,
      nav_style: latest.nav_style,
      branding: latest.branding,
      sections: latest.sections,
      is_published: latest.is_published,
    });

    if ("error" in result) {
      console.error("[AutoSave] Failed:", result.error);
      setSaveStatus("unsaved");
    } else {
      lastSavedRef.current = current;
      setSaveStatus("saved");
    }
  }, [setSaveStatus]);

  // Debounced save on changes
  useEffect(() => {
    if (saveStatus !== "unsaved") return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(save, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [saveStatus, save, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { save };
}

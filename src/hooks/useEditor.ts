"use client";

import { useState, useCallback } from "react";
import type { Artifact, Section } from "@/types/artifact";

export type SaveStatus = "saved" | "saving" | "unsaved";

export interface EditorState {
  artifact: Artifact;
  selectedSectionId: string | null;
  saveStatus: SaveStatus;
}

export function useEditor(initialArtifact: Artifact) {
  const [artifact, setArtifact] = useState<Artifact>(initialArtifact);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  const markUnsaved = useCallback(() => setSaveStatus("unsaved"), []);

  // Update a top-level artifact field (title, subtitle, theme, etc.)
  const updateArtifactField = useCallback(
    <K extends keyof Artifact>(field: K, value: Artifact[K]) => {
      setArtifact((prev) => ({ ...prev, [field]: value }));
      markUnsaved();
    },
    [markUnsaved]
  );

  // Replace an entire section by ID
  const updateSection = useCallback(
    (sectionId: string, updater: (s: Section) => Section) => {
      setArtifact((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId ? updater(s) : s
        ),
      }));
      markUnsaved();
    },
    [markUnsaved]
  );

  // Update a specific text field within a section's content.
  // path format: "title", "subtitle", "content.summary", "content.cards.0.title"
  const updateSectionField = useCallback(
    (sectionId: string, path: string, value: string) => {
      setArtifact((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.id !== sectionId) return s;
          const clone = JSON.parse(JSON.stringify(s));
          setNestedValue(clone, path, value);
          return clone;
        }),
      }));
      markUnsaved();
    },
    [markUnsaved]
  );

  // Reorder sections by moving from one index to another
  const reorderSections = useCallback(
    (fromIndex: number, toIndex: number) => {
      setArtifact((prev) => {
        const sections = [...prev.sections];
        const [moved] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, moved);
        return { ...prev, sections };
      });
      markUnsaved();
    },
    [markUnsaved]
  );

  // Delete a section by ID
  const deleteSection = useCallback(
    (sectionId: string) => {
      setArtifact((prev) => ({
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sectionId),
      }));
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(null);
      }
      markUnsaved();
    },
    [selectedSectionId, markUnsaved]
  );

  // Add a new section at a specific position (defaults to end)
  const addSection = useCallback(
    (section: Section, position?: number) => {
      setArtifact((prev) => {
        const sections = [...prev.sections];
        const idx = position ?? sections.length;
        sections.splice(idx, 0, section);
        return { ...prev, sections };
      });
      markUnsaved();
    },
    [markUnsaved]
  );

  return {
    artifact,
    selectedSectionId,
    setSelectedSectionId,
    saveStatus,
    setSaveStatus,
    updateArtifactField,
    updateSection,
    updateSectionField,
    reorderSections,
    deleteSection,
    addSection,
  };
}

// Helper: set a value at a dot-notation path on an object.
// Supports array indices: "content.cards.0.title"
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const next = current[key];
    if (next && typeof next === "object") {
      current = next as Record<string, unknown>;
    } else {
      return; // Path doesn't exist, bail
    }
  }
  current[keys[keys.length - 1]] = value;
}

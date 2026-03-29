"use client";

import type { Artifact } from "@/types/artifact";
import { Settings, X } from "lucide-react";
import { useState } from "react";

interface DocumentSettingsProps {
  artifact: Artifact;
  onUpdate: <K extends keyof Artifact>(field: K, value: Artifact[K]) => void;
}

export function DocumentSettings({ artifact, onUpdate }: DocumentSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
        Settings
      </button>
    );
  }

  return (
    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-medium">Document Settings</p>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Layout mode */}
      <div className="mb-3">
        <label className="text-xs text-muted-foreground block mb-1">Layout</label>
        <div className="flex gap-2">
          {(["continuous", "beats"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onUpdate("layout_mode", mode)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                (artifact.layout_mode ?? "continuous") === mode
                  ? "bg-accent/20 text-accent"
                  : "bg-white/10 text-muted-foreground hover:bg-white/20"
              }`}
            >
              {mode === "continuous" ? "Continuous" : "Beats"}
            </button>
          ))}
        </div>
      </div>

      {/* Nav style */}
      <div className="mb-3">
        <label className="text-xs text-muted-foreground block mb-1">Navigation</label>
        <div className="flex gap-2">
          {(["sidebar", "progress-bar"] as const).map((style) => (
            <button
              key={style}
              onClick={() => onUpdate("nav_style", style)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                (artifact.nav_style ?? "sidebar") === style
                  ? "bg-accent/20 text-accent"
                  : "bg-white/10 text-muted-foreground hover:bg-white/20"
              }`}
            >
              {style === "sidebar" ? "Sidebar" : "Progress Bar"}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="mb-3">
        <label className="text-xs text-muted-foreground block mb-1">Theme</label>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => onUpdate("theme", theme)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                artifact.theme === theme
                  ? "bg-accent/20 text-accent"
                  : "bg-white/10 text-muted-foreground hover:bg-white/20"
              }`}
            >
              {theme === "dark" ? "Dark" : "Light"}
            </button>
          ))}
        </div>
      </div>

      {/* Palette colors */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Accent Colors</label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((n) => {
            const key = `accent${n}` as keyof NonNullable<NonNullable<Artifact["branding"]>["palette"]>;
            const color = artifact.branding?.palette?.[key] ?? "#6366f1";
            return (
              <input
                key={n}
                type="color"
                value={color}
                onChange={(e) => {
                  const palette = { ...artifact.branding?.palette, [key]: e.target.value };
                  onUpdate("branding", { ...artifact.branding, palette });
                }}
                className="w-8 h-8 rounded cursor-pointer border border-white/20"
                title={`Accent ${n}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

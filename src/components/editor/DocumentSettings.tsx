"use client";

import type { Artifact } from "@/types/artifact";
import { RotateCcw } from "lucide-react";
import { LogoUpload } from "./LogoUpload";

const DEFAULT_PRIMARY = "#6366f1";
const DEFAULT_SECONDARY = "#f59e0b";

interface DocumentSettingsProps {
  artifact: Artifact;
  onUpdate: <K extends keyof Artifact>(_field: K, _value: Artifact[K]) => void;
}

export function DocumentSettings({ artifact, onUpdate }: DocumentSettingsProps) {
  const primary =
    artifact.branding?.primary_color ??
    artifact.branding?.palette?.accent1 ??
    DEFAULT_PRIMARY;

  const secondary =
    artifact.branding?.secondary_color ??
    artifact.branding?.palette?.accent3 ??
    DEFAULT_SECONDARY;

  function handlePrimaryChange(color: string) {
    onUpdate("branding", {
      ...artifact.branding,
      primary_color: color,
      palette: {
        ...artifact.branding?.palette,
        accent1: color,
        accent2: color,
      },
    });
  }

  function handleSecondaryChange(color: string) {
    onUpdate("branding", {
      ...artifact.branding,
      secondary_color: color,
      palette: {
        ...artifact.branding?.palette,
        accent3: color,
      },
    });
  }

  function handleResetColors() {
    onUpdate("branding", {
      ...artifact.branding,
      primary_color: DEFAULT_PRIMARY,
      secondary_color: DEFAULT_SECONDARY,
      palette: {
        ...artifact.branding?.palette,
        accent1: DEFAULT_PRIMARY,
        accent2: DEFAULT_PRIMARY,
        accent3: DEFAULT_SECONDARY,
      },
    });
  }

  function handleLogoUpload(url: string) {
    onUpdate("branding", { ...artifact.branding, logo_url: url });
  }

  function handleLogoRemove() {
    const { logo_url: _removed, ...rest } = artifact.branding ?? {};
    onUpdate("branding", Object.keys(rest).length > 0 ? rest : undefined);
  }

  return (
    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
      <p className="text-xs font-medium mb-3">Document Settings</p>

      {/* Brand section */}
      <div className="mb-4">
        <label className="text-xs text-muted-foreground block mb-2">Brand</label>

        {/* Logo upload */}
        <div className="mb-3">
          <LogoUpload
            logoUrl={artifact.branding?.logo_url}
            artifactId={artifact.id}
            onUpload={handleLogoUpload}
            onRemove={handleLogoRemove}
          />
        </div>

        {/* Color pickers */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={primary}
              onChange={(e) => handlePrimaryChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-white/20"
              title="Primary color"
            />
            <span className="text-xs text-muted-foreground">Primary</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={secondary}
              onChange={(e) => handleSecondaryChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-white/20"
              title="Secondary color"
            />
            <span className="text-xs text-muted-foreground">Secondary</span>
          </div>

          <button
            onClick={handleResetColors}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Reset to default colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
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
      <div>
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
    </div>
  );
}

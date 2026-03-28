"use client";

import type { Artifact } from "@/types/artifact";
import { SidebarNav } from "./SidebarNav";
import { SectionRenderer } from "./SectionRenderer";
import { StrataFooter } from "./StrataFooter";

export function ArtifactViewer({ artifact }: { artifact: Artifact }) {
  const sidebarItems = artifact.sections.map((section) => ({
    id: section.id,
    title: section.title,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar — hidden on mobile, fixed on desktop */}
      <SidebarNav
        items={sidebarItems}
        title={artifact.title}
        subtitle={artifact.subtitle}
      />

      {/* Main content area */}
      <main className="lg:ml-[var(--sidebar-width)]">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-12 lg:py-16">
          {/* Header — visible on mobile only (desktop shows in sidebar) */}
          <header className="mb-12 lg:hidden">
            <h1 className="text-3xl font-bold tracking-tight">
              {artifact.title}
            </h1>
            {artifact.subtitle && (
              <p className="mt-2 text-lg text-muted">{artifact.subtitle}</p>
            )}
            {artifact.author_name && (
              <p className="mt-4 text-sm text-muted-foreground">
                By {artifact.author_name}
              </p>
            )}
          </header>

          {/* Sections */}
          <div className="space-y-16">
            {artifact.sections.map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))}
          </div>
        </div>

        <StrataFooter />
      </main>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import type { Section, SectionType } from "@/types/artifact";
import {
  FileText,
  LayoutGrid,
  Clock,
  Table2,
  BarChart3,
  LineChart,
  Network,
  Route,
  Menu,
  type LucideIcon,
} from "lucide-react";

const SECTION_TYPE_ICONS: Record<SectionType, LucideIcon> = {
  "rich-text": FileText,
  "expandable-cards": LayoutGrid,
  timeline: Clock,
  "tier-table": Table2,
  "metric-dashboard": BarChart3,
  "data-viz": LineChart,
  "hub-mockup": Network,
  "guided-journey": Route,
};

interface SidebarRailProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onExpandSidebar: () => void;
}

export function SidebarRail({
  sections,
  selectedSectionId,
  onSelectSection,
  onExpandSidebar,
}: SidebarRailProps) {
  const selectedIndex = sections.findIndex((s) => s.id === selectedSectionId);

  return (
    <div className="w-12 border-r border-white/10 flex flex-col shrink-0 bg-background">
      {/* Expand sidebar button */}
      <button
        onClick={onExpandSidebar}
        className="h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border-b border-white/10"
        aria-label="Expand sidebar"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto py-1">
        <div className="relative">
          {/* Active indicator — slides vertically */}
          {selectedIndex >= 0 && (
            <motion.div
              className="absolute left-0 w-full h-10 bg-accent/10 border-r-2 border-accent"
              initial={false}
              animate={{ y: selectedIndex * 40 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}

          {sections.map((section, index) => {
            const Icon = SECTION_TYPE_ICONS[section.type];
            const isActive = section.id === selectedSectionId;

            return (
              <button
                key={section.id}
                onClick={() => {
                  // Click active section to deselect (exit split view)
                  if (isActive) {
                    onSelectSection("");
                  } else {
                    onSelectSection(section.id);
                  }
                }}
                className={`relative w-full h-10 flex items-center justify-center transition-colors ${
                  isActive
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={`Section ${index + 1}: ${section.title || section.type}`}
                title={section.title || `Section ${index + 1}`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-medium leading-none">
                    {index + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

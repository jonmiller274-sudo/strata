"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Section } from "@/types/artifact";
import { SectionRenderer } from "@/components/viewer/SectionRenderer";
import { X as XIcon } from "lucide-react";

interface MobilePreviewSheetProps {
  section: Section | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MobilePreviewSheet({
  section,
  isOpen,
  onClose,
}: MobilePreviewSheetProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && section && (
        <>
          {/* Backdrop */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 h-[60vh] bg-background border-t border-white/10 rounded-t-2xl z-50 flex flex-col lg:hidden"
          >
            {/* Handle bar */}
            <div className="flex items-center justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10">
              <span className="text-sm font-medium">Preview</span>
              <button
                onClick={onClose}
                aria-label="Close preview"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <SectionRenderer section={section} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

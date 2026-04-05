"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Share2 } from "lucide-react";

interface ProgressBarNavItem {
  id: string;
  title: string;
}

interface ProgressBarNavProps {
  items: ProgressBarNavItem[];
  title: string;
  subtitle?: string;
  /** Forwarded from the beats container — used to scope IntersectionObserver root */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function ProgressBarNav({
  items,
  title,
  subtitle,
  scrollContainerRef,
}: ProgressBarNavProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visited, setVisited] = useState<Set<string>>(
    () => new Set([items[0]?.id ?? ""])
  );
  const [copied, setCopied] = useState(false);

  // Track active beat via IntersectionObserver
  useEffect(() => {
    if (items.length === 0) return;

    const observers: IntersectionObserver[] = [];
    const root = scrollContainerRef?.current ?? null;

    items.forEach((item, index) => {
      const element = document.getElementById(item.id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveIndex(index);
              setVisited((prev) => {
                const next = new Set(prev);
                next.add(item.id);
                return next;
              });
            }
          });
        },
        {
          root,
          // Trigger when the beat occupies more than half the viewport
          threshold: 0.5,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, [items, scrollContainerRef]);

  const scrollToBeat = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const goToPrev = useCallback(() => {
    if (activeIndex > 0) scrollToBeat(items[activeIndex - 1].id);
  }, [activeIndex, items, scrollToBeat]);

  const goToNext = useCallback(() => {
    if (activeIndex < items.length - 1) scrollToBeat(items[activeIndex + 1].id);
  }, [activeIndex, items, scrollToBeat]);

  return (
    <>
      {/* Progress bar — fixed top, hidden on mobile */}
      <div
        className="hidden sm:flex fixed top-0 left-0 right-0 z-50"
        style={{ height: "3px", gap: "3px" }}
        role="navigation"
        aria-label="Section progress"
      >
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const isVisited = !isActive && visited.has(item.id);

          return (
            <button
              key={item.id}
              onClick={() => scrollToBeat(item.id)}
              title={item.title}
              aria-label={`Go to section: ${item.title}`}
              style={{
                flex: 1,
                height: "100%",
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.3s ease",
                background: isActive
                  ? "linear-gradient(90deg, var(--palette-accent1, #2fd8c8), var(--palette-accent2, #7c6df0))"
                  : isVisited
                  ? "var(--palette-accent1, #2fd8c8)"
                  : "#1e2538",
                opacity: isVisited ? 0.55 : 1,
              }}
            />
          );
        })}
      </div>

      {/* Mobile floating pill — shown only on small screens */}
      <div
        className="sm:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-[#12141d]/90 backdrop-blur-sm shadow-lg"
        role="navigation"
        aria-label="Section navigation"
      >
        <button
          onClick={goToPrev}
          disabled={activeIndex === 0}
          aria-label="Previous section"
          className="flex items-center justify-center w-6 h-6 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <ChevronLeft style={{ width: "14px", height: "14px" }} />
        </button>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--color-foreground)",
            minWidth: "52px",
            textAlign: "center",
          }}
        >
          {activeIndex + 1} / {items.length}
        </span>
        <button
          onClick={goToNext}
          disabled={activeIndex === items.length - 1}
          aria-label="Next section"
          className="flex items-center justify-center w-6 h-6 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <ChevronRight style={{ width: "14px", height: "14px" }} />
        </button>
      </div>

      {/* Share button — fixed top-right, below the progress bar */}
      <div className="fixed top-2.5 right-4 z-50">
        <button
          onClick={async () => {
            try {
              if (navigator.share) {
                await navigator.share({ url: window.location.href });
              } else {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            } catch {
              // User cancelled share or clipboard failed — do nothing
            }
          }}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
          title="Copy link"
          aria-label="Copy link to clipboard"
        >
          {copied ? (
            <span className="text-xs font-medium text-success">
              Copied!
            </span>
          ) : (
            <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Wordmark — fixed top-left, below the progress bar */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{ top: "18px", left: "28px" }}
      >
        <span
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            letterSpacing: "0.01em",
            color: "var(--color-foreground)",
            textTransform: "uppercase" as const,
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span className="hidden sm:inline">
            <span
              style={{
                margin: "0 8px",
                color: "var(--color-muted-foreground)",
                fontSize: "11px",
              }}
            >
              /
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "var(--color-muted-foreground)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
              }}
            >
              {subtitle}
            </span>
          </span>
        )}
      </div>
    </>
  );
}

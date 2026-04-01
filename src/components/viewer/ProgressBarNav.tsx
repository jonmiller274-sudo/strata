"use client";

import { useState, useEffect, useCallback } from "react";

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

  return (
    <>
      {/* Progress bar — fixed top */}
      <div
        className="fixed top-0 left-0 right-0 z-50"
        style={{ height: "3px", display: "flex", gap: "3px" }}
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

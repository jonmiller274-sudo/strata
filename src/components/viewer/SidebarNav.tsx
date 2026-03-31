"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { Menu, X } from "lucide-react";

interface SidebarItem {
  id: string;
  title: string;
}

interface SidebarNavProps {
  items: SidebarItem[];
  title: string;
  subtitle?: string;
  logoUrl?: string;
}

export function SidebarNav({ items, title, subtitle, logoUrl }: SidebarNavProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll-spy: observe which section is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(item.id);
            }
          });
        },
        {
          rootMargin: "-20% 0px -60% 0px",
          threshold: 0,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, [items]);

  const scrollTo = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveId(id);
        setMobileOpen(false);
      }
    },
    []
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-card p-2 shadow-lg lg:hidden"
        aria-label="Toggle navigation"
      >
        {mobileOpen ? (
          <X className="h-5 w-5 text-foreground" />
        ) : (
          <Menu className="h-5 w-5 text-foreground" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-[var(--sidebar-width)] border-r border-border bg-sidebar",
          "flex flex-col transition-transform duration-300",
          // Mobile: slide in/out
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible
          "lg:translate-x-0"
        )}
      >
        {/* Title area */}
        <div className="border-b border-border px-6 py-6">
          {logoUrl && (
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="" className="h-8 w-auto object-contain" />
            </div>
          )}
          <h2 className="text-sm font-semibold tracking-wide text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150",
                    activeId === item.id
                      ? "bg-accent-muted text-sidebar-text-active font-medium"
                      : "text-sidebar-text hover:bg-card-hover hover:text-sidebar-text-active"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-medium",
                      activeId === item.id
                        ? "bg-accent text-white"
                        : "bg-card text-muted"
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="truncate">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Progress indicator */}
        <div className="border-t border-border px-6 py-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-card">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{
                width: `${((items.findIndex((i) => i.id === activeId) + 1) / items.length) * 100}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {items.findIndex((i) => i.id === activeId) + 1} of {items.length}{" "}
            sections
          </p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

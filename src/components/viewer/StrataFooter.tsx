import { Layers } from "lucide-react";
import type { PlanTier } from "@/types/artifact";

interface StrataFooterProps {
  planTier?: PlanTier;
  /** When true, renders a conversion CTA instead of the standard watermark. */
  isDemoPage?: boolean;
}

export function StrataFooter({ planTier = "free", isDemoPage = false }: StrataFooterProps) {
  // Demo page: always show the custom conversion CTA
  if (isDemoPage) {
    return (
      <footer className="border-t border-border bg-footer-bg px-6 py-16">
        <div className="mx-auto max-w-4xl w-full">
          <p className="text-xs text-muted-foreground mb-3">
            This document was built with Strata — the same tool you&apos;ll use.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-foreground">
                Like what you see? Build yours in 30 minutes.
              </p>
              <p className="mt-1 text-sm text-muted">
                Every Strata document includes a shareable link and viewer analytics.
              </p>
            </div>
            <a
              href="/create"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
              style={{ backgroundColor: "var(--palette-accent1, var(--color-accent))" }}
            >
              <Layers className="h-4 w-4" />
              Build your document
            </a>
          </div>
        </div>
      </footer>
    );
  }

  // Paid plans: no watermark footer at all
  if (planTier !== "free") {
    return null;
  }

  return (
    <footer
      className="border-t border-border bg-footer-bg px-6 py-16 flex items-end snap-end"
    >
      <div className="mx-auto flex max-w-4xl w-full items-center justify-between">
        <a
          href="https://sharestrata.com/discover?ref=artifact-badge"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-footer-text hover:text-foreground transition-colors"
        >
          <Layers className="h-4 w-4" />
          <span className="text-sm">Made with Strata</span>
        </a>
        <a
          href="https://sharestrata.com/discover?ref=artifact-cta"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:text-accent-hover transition-colors"
        >
          Learn more &rarr;
        </a>
      </div>
    </footer>
  );
}

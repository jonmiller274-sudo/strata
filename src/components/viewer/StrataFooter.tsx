import { Layers } from "lucide-react";
import type { PlanTier } from "@/types/artifact";

interface StrataFooterProps {
  planTier?: PlanTier;
}

export function StrataFooter({ planTier = "free" }: StrataFooterProps) {
  // Paid plans: no watermark footer at all
  if (planTier !== "free") {
    return null;
  }

  return (
    <footer
      className="border-t border-border bg-footer-bg px-6 py-8 flex items-end"
      style={{ scrollSnapAlign: "end", minHeight: "30vh" }}
    >
      <div className="mx-auto flex max-w-4xl w-full items-center justify-between">
        <a
          href="https://sharestrata.com?ref=artifact"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-footer-text hover:text-foreground transition-colors"
        >
          <Layers className="h-4 w-4" />
          <span className="text-sm">Made with Strata</span>
        </a>
        <a
          href="https://sharestrata.com?ref=artifact"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:text-accent-hover transition-colors"
        >
          Create your own &rarr;
        </a>
      </div>
    </footer>
  );
}

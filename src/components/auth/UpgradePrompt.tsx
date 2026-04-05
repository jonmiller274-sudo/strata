"use client";

import { X, Sparkles, Check } from "lucide-react";

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  currentCount: number;
  limit: number;
}

const PRO_FEATURES = [
  "Remove \"Made with Strata\" watermark",
  "Custom branding — your logo, colors, palette",
  "Up to 15 published artifacts",
  "Unlimited AI structuring",
  "Viewer analytics (coming soon)",
];

export function UpgradePrompt({
  open,
  onClose,
  currentCount,
  limit,
}: UpgradePromptProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-8 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <Sparkles className="h-6 w-6 text-accent" />
        </div>

        <h2 className="text-center text-xl font-bold">
          You&apos;ve used {currentCount} of {limit} free artifacts
        </h2>
        <p className="mt-2 text-center text-sm text-muted">
          Upgrade to Pro to publish more, remove the Strata watermark, and add
          your own branding.
        </p>

        {/* Pro plan card */}
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-lg font-bold">Pro</span>
              <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                Most popular
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">$79</span>
              <span className="text-sm text-muted">/mo</span>
            </div>
          </div>

          <div className="mt-1 text-right">
            <span className="text-xs text-accent font-medium">
              Founding members: $49/mo forever
            </span>
          </div>

          <ul className="mt-4 space-y-2">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* For now, link to a waitlist or Stripe checkout */}
          <a
            href="mailto:jon@sharestrata.com?subject=Strata%20Pro%20-%20Founding%20Member&body=I%27d%20like%20to%20upgrade%20to%20Strata%20Pro%20as%20a%20founding%20member."
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Become a founding member
          </a>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Questions? Email jon@sharestrata.com
        </p>
      </div>
    </div>
  );
}

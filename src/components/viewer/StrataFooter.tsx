import { Layers } from "lucide-react";

export function StrataFooter() {
  return (
    <footer className="border-t border-border bg-footer-bg px-6 py-8">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-2 text-footer-text">
          <Layers className="h-4 w-4" />
          <span className="text-sm">Made with Strata</span>
        </div>
        <a
          href="/"
          className="text-sm text-accent hover:text-accent-hover transition-colors"
        >
          Create your own &rarr;
        </a>
      </div>
    </footer>
  );
}
